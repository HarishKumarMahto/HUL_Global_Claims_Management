import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PERMISSION_MODULES, ROLES } from './userManagementData';

const COLS = ['view', 'readOnly', 'edit'] as const;
const COL_LABELS = { view: 'View', readOnly: 'Read-Only', edit: 'Edit' };
const COL_COLORS = { view: '#0066CC', readOnly: '#008090', edit: '#2B911C' };

export default function PermissionsTab({ selectedRoleId }: { selectedRoleId: string | null }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ landing: true, projects: false, claims: false, products: false, assets: false });
  const [search, setSearch] = useState('');

  const filtered = PERMISSION_MODULES.map(m => ({
    ...m,
    rows: m.rows.filter(r => !search || r.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(m => m.rows.length > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DEDED7] flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search permissions..." className="w-full pl-9 pr-3 py-2 border border-[#DEDED7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white" />
        </div>
        {selectedRoleId && (
          <span className="text-xs text-[#0066CC] bg-[#C2E0FF]/30 px-3 py-1.5 rounded-full font-semibold border border-[#C2E0FF]">
            Filtered: {ROLES.find(r => r.id === selectedRoleId)?.name}
          </span>
        )}
        <button onClick={() => setExpanded(prev => { const next: Record<string,boolean> = {}; Object.keys(prev).forEach(k => next[k] = true); return next; })} className="text-xs text-[#0066CC] font-semibold hover:underline ml-auto">Expand All</button>
        <button onClick={() => setExpanded(prev => { const next: Record<string,boolean> = {}; Object.keys(prev).forEach(k => next[k] = false); return next; })} className="text-xs text-gray-500 font-semibold hover:underline">Collapse All</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 grid bg-[#133062] text-white text-xs font-semibold" style={{ gridTemplateColumns: '1fr 90px 90px 90px' }}>
          <div className="px-4 py-3">Permission (Module › Object › Action)</div>
          {COLS.map(c => <div key={c} className="px-2 py-3 text-center" style={{ color: COL_COLORS[c] === '#0066CC' ? '#85C2FF' : COL_COLORS[c] === '#008090' ? '#23E7FF' : '#86efac' }}>{COL_LABELS[c]}</div>)}
        </div>

        {filtered.map(mod => (
          <div key={mod.id}>
            <button onClick={() => setExpanded(p => ({ ...p, [mod.id]: !p[mod.id] }))}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#F6F7F0] hover:bg-[#C2E0FF]/20 border-b border-[#DEDED7] transition-colors sticky top-[41px] z-[5]">
              <ChevronDown className={`w-3.5 h-3.5 text-[#0066CC] transition-transform ${expanded[mod.id] ? '' : '-rotate-90'}`} />
              <span className="text-xs font-bold text-[#133062] uppercase tracking-wider">{mod.label}</span>
              <span className="ml-auto text-[10px] text-gray-400 font-normal">{mod.rows.length} permissions</span>
            </button>

            {expanded[mod.id] && mod.rows.map((row, idx) => (
              <div key={row.id} className={`grid items-center border-b border-[#DEDED7]/50 hover:bg-[#F6F7F0] transition-colors ${idx % 2 === 1 ? 'bg-[#F6F7F0]/40' : 'bg-white'}`}
                style={{ gridTemplateColumns: '1fr 90px 90px 90px' }}>
                <div className="px-4 py-2.5 text-xs text-gray-600 pl-9">{row.label}</div>
                {COLS.map(col => {
                  const val = row[col];
                  return (
                    <div key={col} className="flex items-center justify-center py-2.5">
                      {val === 'Yes' ? (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: COL_COLORS[col] }}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                      ) : (
                        <span className="w-4 h-px bg-[#DEDED7] inline-block rounded" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
