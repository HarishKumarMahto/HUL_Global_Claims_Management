import { useState } from 'react';
import { X, Search, Shield, AlertTriangle, Check } from 'lucide-react';

interface Claim {
  id: string;
  text: string;
  lifecycle: string;
  risk: 'low' | 'medium' | 'high';
  supportStrategy: string;
  source: 'parent' | 'child';
}

const SAMPLE_CLAIMS: Claim[] = [
  { id: 'clm-001', text: 'Clinically proven to hydrate skin for 24 hours', lifecycle: 'Assessed', risk: 'low', supportStrategy: 'Clinical Study', source: 'parent' },
  { id: 'clm-002', text: 'Leaves skin visibly smoother after first use', lifecycle: 'Proposed', risk: 'medium', supportStrategy: 'Consumer Research', source: 'parent' },
  { id: 'clm-003', text: 'Contains 1/4 moisturising milk', lifecycle: 'Assessed', risk: 'low', supportStrategy: 'Formulation Data', source: 'parent' },
  { id: 'clm-004', text: 'Dermatologist tested formula', lifecycle: 'Assessed', risk: 'low', supportStrategy: 'Expert Endorsement', source: 'parent' },
  { id: 'clm-005', text: 'Up to 48hrs lasting moisture', lifecycle: 'Proposed', risk: 'high', supportStrategy: 'Clinical Study (pending)', source: 'child' },
  { id: 'clm-006', text: 'Gentle enough for daily use', lifecycle: 'Assessed', risk: 'low', supportStrategy: 'Dermatological Evidence', source: 'child' },
  { id: 'clm-007', text: 'pH balanced for sensitive skin', lifecycle: 'Proposed', risk: 'medium', supportStrategy: 'Formulation Data', source: 'child' },
];

const riskColors = {
  low:    { bg: '#D1FAE5', text: '#065F46', label: 'Low' },
  medium: { bg: '#FEF3C7', text: '#92400E', label: 'Med' },
  high:   { bg: '#FEE2E2', text: '#991B1B', label: 'High' },
};

const lifecycleColors: Record<string, { bg: string; text: string }> = {
  'Assessed':   { bg: '#D1FAE5', text: '#065F46' },
  'Proposed':   { bg: '#DBEAFE', text: '#1D4ED8' },
  'In Review':  { bg: '#FEF3C7', text: '#92400E' },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export default function ClaimAssociationModal({ isOpen, onClose, productName }: Props) {
  const [sourceTab, setSourceTab] = useState<'parent' | 'child'>('parent');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [inheritSubstantiation, setInheritSubstantiation] = useState(true);
  const [inheritStrategy, setInheritStrategy] = useState(true);

  if (!isOpen) return null;

  const filtered = SAMPLE_CLAIMS.filter(c =>
    c.source === sourceTab && c.text.toLowerCase().includes(search.toLowerCase())
  );

  const toggleClaim = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (filtered.every(c => selected.has(c.id))) {
      const next = new Set(selected);
      filtered.forEach(c => next.delete(c.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach(c => next.add(c.id));
      setSelected(next);
    }
  };

  const handleAdd = () => {
    // In real app, associate selected claims with the product
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0">
          <div>
            <h2 className="text-night">Add Claims</h2>
            <p className="text-sm text-gray-500 mt-0.5">Associate claims with <span className="text-sky">{productName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Source tabs */}
        <div className="px-6 pt-4 border-b border-pebble flex-shrink-0">
          <div className="flex gap-0">
            {[{ id: 'parent' as const, label: 'Available Parent Claims' }, { id: 'child' as const, label: 'Available Child Claims' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSourceTab(tab.id)}
                className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${sourceTab === tab.id ? 'border-sky text-sky' : 'border-transparent text-gray-500 hover:text-night'}`}
                style={{ fontWeight: sourceTab === tab.id ? 500 : 400 }}
              >
                {tab.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${sourceTab === tab.id ? 'bg-pale text-sky' : 'bg-earth text-gray-400'}`}>
                  {SAMPLE_CLAIMS.filter(c => c.source === tab.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-pebble flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search claims..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-earth sticky top-0 z-10">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox"
                    checked={filtered.length > 0 && filtered.every(c => selected.has(c.id))}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-sky rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Claim Text</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Lifecycle</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Risk</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Support Strategy</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim, i) => {
                const isSelected = selected.has(claim.id);
                const rc = riskColors[claim.risk];
                const lc = lifecycleColors[claim.lifecycle] || { bg: '#F3F4F6', text: '#6B7280' };
                return (
                  <tr
                    key={claim.id}
                    onClick={() => toggleClaim(claim.id)}
                    className={`border-b border-pebble cursor-pointer transition-colors ${isSelected ? 'bg-pale/30' : i % 2 === 0 ? 'bg-white hover:bg-earth' : 'bg-earth/40 hover:bg-earth'}`}
                  >
                    <td className="px-4 py-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-night leading-relaxed">{claim.text}</span>
                      <div className="text-xs text-gray-400 mt-0.5">{claim.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: lc.bg, color: lc.text }}>{claim.lifecycle}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit" style={{ background: rc.bg, color: rc.text }}>
                        {claim.risk === 'high' ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{claim.supportStrategy}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No claims found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Inheritance options + Footer */}
        <div className="border-t border-pebble flex-shrink-0">
          <div className="px-6 py-3 bg-earth flex items-center gap-6">
            <span className="text-sm text-gray-500">Inherit from source claim:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inheritSubstantiation} onChange={e => setInheritSubstantiation(e.target.checked)} className="w-4 h-4 accent-sky" />
              <span className="text-sm text-night">Substantiation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inheritStrategy} onChange={e => setInheritStrategy(e.target.checked)} className="w-4 h-4 accent-sky" />
              <span className="text-sm text-night">Support Strategy</span>
            </label>
            {selected.size > 0 && (
              <div className="ml-auto text-xs text-sky">
                {selected.size} claim{selected.size !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={selected.size === 0}
              className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Add {selected.size > 0 ? `${selected.size} ` : ''}Claims
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
