import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit2, Copy, Trash2, Users } from 'lucide-react';
import { ROLES, type Role } from './userManagementData';
import CopyRoleDialog from './CopyRoleDialog';

const SCOPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Logged-in': { bg: '#C2E0FF', text: '#004D99' },
  'BG-bound / Project-team': { bg: '#C2E0FF40', text: '#0066CC' },
  'Project-team': { bg: '#D1FAE5', text: '#065F46' },
  'Cross-BG': { bg: '#EDE9FE', text: '#5B21B6' },
  'n/a': { bg: '#F3F4F6', text: '#6B7280' },
};

interface RolesTabProps {
  roles: Role[];
  onRolesChange: (roles: Role[]) => void;
  onRoleSelect: (role: Role) => void;
  selectedRoleId: string | null;
}

export default function RolesTab({ roles, onRolesChange, onRoleSelect, selectedRoleId }: RolesTabProps) {
  const [search, setSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActionMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = roles.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this role?')) onRolesChange(roles.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DEDED7] flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..." className="w-full pl-9 pr-3 py-2 border border-[#DEDED7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white" />
        </div>
        <div className="ml-auto relative">
          <button onClick={() => setShowAddMenu(p => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-semibold hover:bg-[#004D99] transition-colors shadow-lg shadow-[#0066CC]/20">
            <Plus className="w-4 h-4" /> Add Role
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#DEDED7] rounded-xl shadow-xl z-20 py-1.5 w-52 overflow-hidden">
                <button onClick={() => { setShowAddMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#133062] hover:bg-[#F6F7F0] text-left">
                  <Plus className="w-4 h-4 text-[#0066CC]" /> Create New Role
                </button>
                <button onClick={() => { setShowAddMenu(false); setShowCopyDialog(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#133062] hover:bg-[#F6F7F0] text-left">
                  <Copy className="w-4 h-4 text-[#008090]" /> Copy Existing Role
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#133062] text-white text-xs font-semibold">
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">Scope</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3 font-semibold">Users</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDED7]/60">
            {filtered.map((role, idx) => {
              const scopeStyle = SCOPE_COLORS[role.scope] || SCOPE_COLORS['n/a'];
              const isSelected = selectedRoleId === role.id;
              return (
                <tr key={role.id}
                  onClick={() => onRoleSelect(role)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#C2E0FF]/20' : idx % 2 === 0 ? 'bg-white hover:bg-[#F6F7F0]' : 'bg-[#F6F7F0]/40 hover:bg-[#F6F7F0]'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: role.color }}>
                        {role.id}
                      </span>
                      <div>
                        <div className="font-semibold text-[#133062] text-sm">{role.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{role.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: scopeStyle.bg, color: scopeStyle.text }}>
                      {role.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-500 max-w-xs truncate">{role.description}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#133062]">
                      <Users className="w-3.5 h-3.5 text-gray-400" />{role.userCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{role.createdDate}</td>
                  <td className="px-4 py-3" ref={actionMenu === role.id ? menuRef : null}>
                    <div className="relative flex justify-end">
                      <button onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === role.id ? null : role.id); }}
                        className="p-1.5 hover:bg-[#F6F7F0] rounded-lg transition-colors text-gray-400 hover:text-[#133062]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenu === role.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[#DEDED7] rounded-xl shadow-xl z-20 py-1.5 w-44 overflow-hidden">
                            <button onClick={e => { e.stopPropagation(); setActionMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Role
                            </button>
                            <button onClick={e => { e.stopPropagation(); setActionMenu(null); setShowCopyDialog(true); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                              <Copy className="w-3.5 h-3.5 text-gray-400" /> Copy Role
                            </button>
                            <div className="border-t border-[#DEDED7] my-1" />
                            <button onClick={e => { e.stopPropagation(); setActionMenu(null); handleDelete(role.id); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left">
                              <Trash2 className="w-3.5 h-3.5" /> Delete Role
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No roles match your search</p>
          </div>
        )}
      </div>

      <CopyRoleDialog isOpen={showCopyDialog} onClose={() => setShowCopyDialog(false)}
        onCreateRole={newRole => onRolesChange([...roles, newRole])} existingRoles={roles} />
    </div>
  );
}
