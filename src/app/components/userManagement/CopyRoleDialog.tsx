import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Copy, AlertCircle, ChevronDown } from 'lucide-react';
import { ROLES, PERMISSION_MODULES, type Role, type PermissionValue } from './userManagementData';

interface CopyRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (role: Role) => void;
  existingRoles: Role[];
}

type PermissionState = Record<string, { view: PermissionValue; readOnly: PermissionValue; edit: PermissionValue }>;

function buildPermissionState(): PermissionState {
  const state: PermissionState = {};
  PERMISSION_MODULES.forEach(mod => {
    mod.rows.forEach(row => {
      state[row.id] = { view: row.view, readOnly: row.readOnly, edit: row.edit };
    });
  });
  return state;
}

const PERM_COL_COLORS: Record<string, string> = {
  view: '#0066CC',
  readOnly: '#008090',
  edit: '#2B911C',
};

export default function CopyRoleDialog({ isOpen, onClose, onCreateRole, existingRoles }: CopyRoleDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceRole, setSourceRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [permissions, setPermissions] = useState<PermissionState>(buildPermissionState());
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSourceRole(null);
      setRoleName('');
      setRoleDesc('');
      setPermissions(buildPermissionState());
      setExpandedModules({});
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSource = (role: Role) => {
    setSourceRole(role);
    setRoleName(`${role.name} (Copy)`);
    setRoleDesc(role.description);
    // Keep default permissions (source-agnostic for now — base permission matrix)
  };

  const handleProceed = () => {
    if (!sourceRole) return;
    setStep(2);
    // Expand all modules by default in step 2
    const expanded: Record<string, boolean> = {};
    PERMISSION_MODULES.forEach(m => { expanded[m.id] = true; });
    setExpandedModules(expanded);
  };

  const validateStep2 = () => {
    const e: { name?: string } = {};
    if (!roleName.trim()) e.name = 'Role name is required';
    else if (existingRoles.some(r => r.name.toLowerCase() === roleName.trim().toLowerCase())) {
      e.name = 'A role with this name already exists';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validateStep2()) return;
    const newId = `R${existingRoles.length + 1}`;
    const newRole: Role = {
      id: newId,
      code: 'AU', // default; would be set by admin in real system
      name: roleName.trim(),
      shortName: roleName.trim().slice(0, 4).toUpperCase(),
      scope: sourceRole!.scope,
      description: roleDesc.trim(),
      userCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      color: sourceRole!.color,
    };
    onCreateRole(newRole);
    onClose();
  };

  const togglePerm = (rowId: string, col: 'view' | 'readOnly' | 'edit') => {
    setPermissions(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [col]: prev[rowId][col] === 'Yes' ? 'No' : 'Yes',
      },
    }));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-[#133062]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col animate-scale-in"
        style={{ width: step === 1 ? 560 : '90vw', maxWidth: step === 1 ? 560 : 900, maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEDED7] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C2E0FF] flex items-center justify-center">
              <Copy className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <h2 className="text-[#133062] font-bold text-lg leading-tight">Copy Existing Role</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 1 ? 'Select a source role to clone from' : `Editing copy of "${sourceRole?.name}"`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#0066CC] text-white' : 'bg-[#F6F7F0] text-gray-400 border border-[#DEDED7]'}`}>
                    {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  {s < 2 && <div className={`w-6 h-px ${step > s ? 'bg-[#0066CC]' : 'bg-[#DEDED7]'}`} />}
                </React.Fragment>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F6F7F0] rounded-lg transition-colors ml-2">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Step 1: Select Source Role */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs text-gray-500 mb-4">
                The new role will inherit all permissions from the selected role. You can modify them in the next step.
              </p>
              <div className="space-y-2">
                {ROLES.map(role => {
                  const isSelected = sourceRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectSource(role)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${isSelected
                        ? 'border-[#0066CC] bg-[#C2E0FF]/15'
                        : 'border-[#DEDED7] hover:border-[#0066CC]/30 hover:bg-[#F6F7F0]'
                        }`}
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#133062]">{role.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#F6F7F0] text-gray-500 rounded-full border border-[#DEDED7]">
                            {role.scope}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#133062]">{role.userCount}</div>
                          <div className="text-[10px] text-gray-400">users</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#0066CC] bg-[#0066CC]' : 'border-[#DEDED7]'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#DEDED7] flex-shrink-0 bg-[#F6F7F0]/50">
              <button onClick={onClose} className="px-5 py-2.5 border border-[#DEDED7] text-[#133062] rounded-lg text-sm font-semibold hover:bg-[#F6F7F0] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={!sourceRole}
                className="px-6 py-2.5 bg-[#0066CC] text-white rounded-lg text-sm font-bold hover:bg-[#004D99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-[#0066CC]/20"
              >
                Next: Edit Permissions
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Edit Cloned Role */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Role Name & Desc */}
              <div className="px-6 py-4 border-b border-[#DEDED7] bg-[#F6F7F0]/40">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={e => { setRoleName(e.target.value); setErrors({}); }}
                      placeholder="e.g. Senior Claims Lead"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm text-[#133062] focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white ${errors.name ? 'border-red-400' : 'border-[#DEDED7]'}`}
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <AlertCircle className="w-3 h-3" />{errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      placeholder="Brief description of role capabilities..."
                      className="w-full px-3 py-2.5 border border-[#DEDED7] rounded-lg text-sm text-[#133062] focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#133062]">Permissions Matrix</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {['view', 'readOnly', 'edit'].map(col => (
                      <span key={col} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PERM_COL_COLORS[col] }} />
                        {col === 'readOnly' ? 'Read-Only' : col.charAt(0).toUpperCase() + col.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sticky header */}
                <div className="rounded-xl border border-[#DEDED7] overflow-hidden">
                  <div className="grid bg-[#133062] text-white text-xs font-semibold" style={{ gridTemplateColumns: '1fr 80px 80px 80px' }}>
                    <div className="px-4 py-2.5">Permission</div>
                    {['View', 'Read-Only', 'Edit'].map(h => (
                      <div key={h} className="px-2 py-2.5 text-center">{h}</div>
                    ))}
                  </div>

                  <div className="divide-y divide-[#DEDED7]">
                    {PERMISSION_MODULES.map(mod => (
                      <div key={mod.id}>
                        {/* Module accordion header */}
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#F6F7F0] hover:bg-[#C2E0FF]/20 transition-colors"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-[#0066CC] transition-transform duration-200 ${expandedModules[mod.id] ? '' : '-rotate-90'}`}
                          />
                          <span className="text-xs font-bold text-[#133062] uppercase tracking-wide">{mod.label}</span>
                          <span className="ml-auto text-[10px] text-gray-400">{mod.rows.length} permissions</span>
                        </button>

                        {/* Permission rows */}
                        {expandedModules[mod.id] && mod.rows.map((row, idx) => {
                          const perm = permissions[row.id];
                          return (
                            <div
                              key={row.id}
                              className={`grid items-center transition-colors hover:bg-[#F6F7F0]/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F7F0]/30'}`}
                              style={{ gridTemplateColumns: '1fr 80px 80px 80px' }}
                            >
                              <div className="px-4 py-2 text-xs text-gray-600 pl-8">{row.label}</div>
                              {(['view', 'readOnly', 'edit'] as const).map(col => (
                                <div key={col} className="flex items-center justify-center py-2">
                                  <button
                                    onClick={() => togglePerm(row.id, col)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${perm[col] === 'Yes'
                                      ? 'border-transparent'
                                      : 'border-[#DEDED7] bg-white hover:border-gray-400'
                                      }`}
                                    style={perm[col] === 'Yes' ? { backgroundColor: PERM_COL_COLORS[col] } : {}}
                                  >
                                    {perm[col] === 'Yes' && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#DEDED7] flex-shrink-0 bg-[#F6F7F0]/50">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-[#DEDED7] text-[#133062] rounded-lg text-sm font-semibold hover:bg-[#F6F7F0] transition-colors flex items-center gap-2"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-4 py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-[#0066CC] text-white rounded-lg text-sm font-bold hover:bg-[#004D99] transition-all flex items-center gap-2 shadow-lg shadow-[#0066CC]/20"
                >
                  <Copy className="w-4 h-4" />
                  Create Role Copy
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
