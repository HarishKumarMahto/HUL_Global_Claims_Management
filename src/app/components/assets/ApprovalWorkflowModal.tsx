import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, Plus, Trash2, Calendar, Users, Info, AlertCircle, ChevronDown } from 'lucide-react';
import type { Asset, AssetApprovalWorkflow, AssetApprover } from '../../types';

interface ApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSave: (assetId: string, workflow: AssetApprovalWorkflow) => void;
}

type Department = 'Legal' | 'Regulatory' | 'Claims Lead';

interface PendingApprover {
  id: string;
  name: string;
  department: Department;
  dueDate: string;
}

const DEPARTMENT_OPTIONS: Department[] = ['Legal', 'Regulatory', 'Claims Lead'];

const SUGGESTED_APPROVERS: Record<Department, string[]> = {
  'Legal':       ['James Brown', 'Linda Carter', 'Mark Stevens'],
  'Regulatory':  ['Emma Williams', 'Ruth Patel', 'George Kim'],
  'Claims Lead': ['Michael Chen', 'Sarah Johnson', 'Fiona Grant'],
};

const getDefaultDueDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

function MultiSelectDropdown({ 
  label, 
  options, 
  selected, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (val: string[]) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="px-3 py-2 border border-pebble rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between transition-colors hover:border-sky"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-night">
          {selected.length === 0 ? `Select ${label}` : `${selected.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-pebble rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto">
          {options.map(opt => {
            const isChecked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-earth cursor-pointer text-sm text-night">
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...selected, opt]);
                    else onChange(selected.filter(s => s !== opt));
                  }}
                  className="rounded border-pebble text-sky focus:ring-sky"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ApprovalWorkflowModal({
  isOpen,
  onClose,
  asset,
  onSave,
}: ApprovalWorkflowModalProps) {
  const existingWf = asset.approvalWorkflow;

  /* ── State ─────────────────────────────────────────── */
  const [pendingApprovers, setPendingApprovers] = useState<PendingApprover[]>(
    existingWf
      ? existingWf.approvers.map(a => ({
          id: a.id,
          name: a.name,
          department: a.department,
          dueDate: a.dueDate,
        }))
      : []
  );

  const [selectedLegal, setSelectedLegal] = useState<string[]>([]);
  const [selectedRegulatory, setSelectedRegulatory] = useState<string[]>([]);
  const [selectedClaimsLead, setSelectedClaimsLead] = useState<string[]>([]);
  const [newDueDate, setNewDueDate] = useState(getDefaultDueDate());

  /* ── Helpers ─────────────────────────────────────────*/
  const usedDepartments = pendingApprovers.map(a => a.department);

  const addApprovers = () => {
    const newApprovers: PendingApprover[] = [];
    
    selectedLegal.forEach(name => {
      newApprovers.push({ id: `AP-${Date.now()}-${Math.random()}`, name, department: 'Legal', dueDate: newDueDate });
    });
    selectedRegulatory.forEach(name => {
      newApprovers.push({ id: `AP-${Date.now()}-${Math.random()}`, name, department: 'Regulatory', dueDate: newDueDate });
    });
    selectedClaimsLead.forEach(name => {
      newApprovers.push({ id: `AP-${Date.now()}-${Math.random()}`, name, department: 'Claims Lead', dueDate: newDueDate });
    });
    
    setPendingApprovers(prev => [...prev, ...newApprovers]);
    setSelectedLegal([]);
    setSelectedRegulatory([]);
    setSelectedClaimsLead([]);
    setNewDueDate(getDefaultDueDate());
  };

  const removeApprover = (id: string) => {
    setPendingApprovers(prev => prev.filter(a => a.id !== id));
  };

  const updateDueDate = (id: string, date: string) => {
    setPendingApprovers(prev =>
      prev.map(a => (a.id === id ? { ...a, dueDate: date } : a))
    );
  };

  const handleSave = () => {
    if (pendingApprovers.length === 0) return;

    const now = new Date().toISOString();

    const approvers: AssetApprover[] = pendingApprovers.map(pa => {
      // Preserve existing state for approvers already in the workflow
      const existing = existingWf?.approvers.find(a => a.id === pa.id);
      return existing
        ? { ...existing, dueDate: pa.dueDate, name: pa.name, department: pa.department }
        : {
            id: pa.id,
            name: pa.name,
            department: pa.department,
            status: 'Pending' as const,
            verdict: null,
            comment: '',
            dueDate: pa.dueDate,
          };
    });

    const workflow: AssetApprovalWorkflow = {
      id: existingWf?.id ?? `WF-${Date.now()}`,
      initiatedBy: existingWf?.initiatedBy ?? 'Sarah Johnson',
      initiatedAt: existingWf?.initiatedAt ?? now,
      approvers,
      isComplete: approvers.every(a => a.verdict !== null),
      isCancelled: false,
    };

    onSave(asset.id, workflow);
    onClose();
  };

  if (!isOpen) return null;

  const hasRequiredDepts =
    usedDepartments.includes('Legal') &&
    usedDepartments.includes('Regulatory') &&
    usedDepartments.includes('Claims Lead');

  const missingDepts = DEPARTMENT_OPTIONS.filter(d => !usedDepartments.includes(d));

  const totalSelected = selectedLegal.length + selectedRegulatory.length + selectedClaimsLead.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ border: '1px solid #DEDED7', maxHeight: '90vh' }}
      >
        {/* ── Header ─────────────────────────── */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-lg font-semibold">
                {existingWf ? 'Manage Approval Workflow' : 'Initiate Approval Workflow'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{asset.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Body ───────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Info banner */}
          <div className="bg-sky/5 border border-sky/20 rounded-lg p-3 flex gap-2.5">
            <Info className="w-4 h-4 text-sky flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky/90 leading-relaxed">
              Assign at least one approver per department (Legal, Regulatory, Claims Lead).
              Asset lifecycle cannot progress until all approvers submit their verdict.
              Due-date breaches trigger reminders but do not block completion.
            </p>
          </div>

          {/* ── Add approver form ────────────── */}
          <div>
            <label className="block text-sm text-night font-semibold mb-3">Add Approvers</label>
            <div className="p-4 border border-pebble rounded-xl bg-earth/30">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Legal</label>
                  <MultiSelectDropdown 
                    label="Legal" 
                    options={SUGGESTED_APPROVERS['Legal']} 
                    selected={selectedLegal} 
                    onChange={setSelectedLegal} 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Regulatory</label>
                  <MultiSelectDropdown 
                    label="Regulatory" 
                    options={SUGGESTED_APPROVERS['Regulatory']} 
                    selected={selectedRegulatory} 
                    onChange={setSelectedRegulatory} 
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Claims Lead</label>
                  <MultiSelectDropdown 
                    label="Claims Lead" 
                    options={SUGGESTED_APPROVERS['Claims Lead']} 
                    selected={selectedClaimsLead} 
                    onChange={setSelectedClaimsLead} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-pebble pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <label className="text-xs text-gray-500 font-medium">Due date for selected:</label>
                  <input
                    type="date"
                    value={newDueDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="px-2 py-1.5 border border-pebble rounded-lg text-xs text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                </div>
                <button
                  onClick={addApprovers}
                  disabled={totalSelected === 0}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add {totalSelected > 0 ? totalSelected : ''} Approver{totalSelected !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>

          {/* ── Missing departments warning ──── */}
          {pendingApprovers.length > 0 && !hasRequiredDepts && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Missing required departments:{' '}
                <span className="font-semibold">{missingDepts.join(', ')}</span>.
                Workflow will be incomplete without all three.
              </p>
            </div>
          )}

          {/* ── Approver list ────────────────── */}
          {pendingApprovers.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-night font-semibold">
                  Approval Chain ({pendingApprovers.length} approver{pendingApprovers.length !== 1 ? 's' : ''})
                </label>
                {hasRequiredDepts && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All required departments covered
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {pendingApprovers.map(ap => {
                  // Show existing verdict state if re-managing
                  const existing = existingWf?.approvers.find(a => a.id === ap.id);
                  const verdict = existing?.verdict;
                  const status = existing?.status ?? 'Pending';

                  return (
                    <div
                      key={ap.id}
                      className="flex items-center gap-3 p-3 bg-earth rounded-xl border border-pebble"
                    >
                      {/* Status dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        verdict === 'Approved' ? 'bg-green-500' :
                        verdict === 'Rejected' ? 'bg-red-500' :
                        verdict === 'Need More Info' ? 'bg-amber-500' :
                        status === 'Accepted' ? 'bg-blue-400' : 'bg-gray-300'
                      }`} />

                      {/* Identity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-night font-medium truncate">{ap.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            ap.department === 'Legal' ? 'bg-purple-50 text-purple-700' :
                            ap.department === 'Regulatory' ? 'bg-blue-50 text-blue-700' :
                            'bg-teal-50 text-teal-700'
                          }`}>{ap.department}</span>
                          {verdict && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              verdict === 'Approved' ? 'bg-green-50 text-green-700' :
                              verdict === 'Rejected' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>{verdict}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <input
                            type="date"
                            value={ap.dueDate}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={e => updateDueDate(ap.id, e.target.value)}
                            className="text-xs text-gray-500 border border-transparent hover:border-pebble focus:border-sky bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky rounded px-1 -ml-1 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Remove — only if not yet submitted */}
                      {(!existing || existing.status !== 'Submitted') && (
                        <button
                          onClick={() => removeApprover(ap.id)}
                          className="p-1.5 hover:bg-pebble rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      )}
                      {existing?.status === 'Submitted' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mr-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-pebble rounded-xl bg-earth/20">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No approvers added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add at least one Legal, Regulatory, and Claims Lead approver
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────── */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
          <p className="text-xs text-gray-500">
            Workflow Owner: <span className="text-night font-medium">Sarah Johnson</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={pendingApprovers.length === 0}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                pendingApprovers.length > 0
                  ? 'bg-sky text-white hover:bg-dark'
                  : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {existingWf ? 'Update Workflow' : 'Launch Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
