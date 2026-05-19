import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Edit2, UserX, RotateCcw, Trash2 } from 'lucide-react';
import { ROLES, MOCK_USERS, formatLastActive, getUserInitials, getAvatarColor, type UserRecord } from './userManagementData';
import CreateUserDialog from './CreateUserDialog';

const STATUS_STYLE = {
  Active: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  Inactive: { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
};

interface UsersTabProps {
  users: UserRecord[];
  onUsersChange: (u: UserRecord[]) => void;
  roleFilter: string | null;
}

export default function UsersTab({ users, onUsersChange, roleFilter }: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActionMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = users.filter(u => {
    if (roleFilter && u.roleCode !== ROLES.find(r => r.id === roleFilter)?.code) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleStatus = (id: string) => {
    onUsersChange(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };
  const deleteUser = (id: string) => { if (window.confirm('Remove this user?')) onUsersChange(users.filter(u => u.id !== id)); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DEDED7] flex-shrink-0 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 pr-3 py-2 border border-[#DEDED7] rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white" />
        </div>
        <div className="flex items-center gap-1 bg-[#F6F7F0] rounded-lg p-1 border border-[#DEDED7]">
          {(['All', 'Active', 'Inactive'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === s ? 'bg-white text-[#133062] shadow-sm' : 'text-gray-500 hover:text-[#133062]'}`}>
              {s}
            </button>
          ))}
        </div>
        {roleFilter && (
          <span className="text-xs text-[#0066CC] bg-[#C2E0FF]/30 px-3 py-1.5 rounded-full font-semibold border border-[#C2E0FF]">
            Role: {ROLES.find(r => r.id === roleFilter)?.name}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-1">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-semibold hover:bg-[#004D99] transition-colors shadow-lg shadow-[#0066CC]/20">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#133062] text-white text-xs font-semibold">
              {['User', 'Email', 'Department', 'Role', 'Status', 'Last Active', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 font-semibold text-left ${i === 5 ? 'hidden lg:table-cell' : ''} ${i === 6 ? 'w-10' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDED7]/60">
            {filtered.map((user, idx) => {
              const role = ROLES.find(r => r.code === user.roleCode);
              const statusStyle = STATUS_STYLE[user.status];
              return (
                <tr key={user.id} className={`transition-colors hover:bg-[#F6F7F0] ${idx % 2 === 1 ? 'bg-[#F6F7F0]/30' : 'bg-white'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(user.roleCode) }}>
                        {getUserInitials(user)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#133062] text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{user.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#F6F7F0] text-[#133062] rounded-full text-xs font-medium border border-[#DEDED7]">
                      {user.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {role && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: role.color }}>
                        {role.id} · {role.shortName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusStyle.dot }} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{formatLastActive(user.lastActive)}</td>
                  <td className="px-4 py-3" ref={actionMenu === user.id ? menuRef : null}>
                    <div className="relative flex justify-end">
                      <button onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-[#DEDED7] rounded-lg transition-colors text-gray-400 hover:text-[#133062]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[#DEDED7] rounded-xl shadow-xl z-20 py-1.5 w-44">
                            <button onClick={() => setActionMenu(null)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit User
                            </button>
                            <button onClick={() => { toggleStatus(user.id); setActionMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                              <UserX className="w-3.5 h-3.5 text-gray-400" />
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => setActionMenu(null)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                              <RotateCcw className="w-3.5 h-3.5 text-gray-400" /> Reset Password
                            </button>
                            <div className="border-t border-[#DEDED7] my-1" />
                            <button onClick={() => { deleteUser(user.id); setActionMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left">
                              <Trash2 className="w-3.5 h-3.5" /> Remove User
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
            <div className="w-14 h-14 bg-[#F6F7F0] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-[#133062] mb-1">No users found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <CreateUserDialog isOpen={showCreate} onClose={() => setShowCreate(false)}
        onCreate={u => onUsersChange([...users, u])} existingUsers={users} />
    </div>
  );
}
