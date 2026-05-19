import React, { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Shield, Users, Key, X } from 'lucide-react';
import { ROLES, MOCK_USERS, type Role, type UserRecord } from './userManagementData';
import UsersTab from './UsersTab';
import RolesTab from './RolesTab';
import PermissionsTab from './PermissionsTab';

type Tab = 'Users' | 'Roles' | 'Permissions';

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  Users: <Users className="w-4 h-4" />,
  Roles: <Shield className="w-4 h-4" />,
  Permissions: <Key className="w-4 h-4" />,
};

export default function UserManagementModule() {
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [activeTab, setActiveTab] = useState<Tab>('Users');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  const filteredRoles = roles.filter(r =>
    !roleSearch || r.name.toLowerCase().includes(roleSearch.toLowerCase()) || r.code.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleRoleClick = (role: Role) => {
    setSelectedRoleId(prev => prev === role.id ? null : role.id);
    if (activeTab === 'Permissions' || activeTab === 'Users') return;
    setActiveTab('Users');
  };

  const toggleRoleExpand = (id: string) => setExpandedRoles(p => ({ ...p, [id]: !p[id] }));

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;

  return (
    <div className="flex h-full overflow-hidden bg-[#F6F7F0]">

      {/* ── LEFT PANEL: Role Hierarchy ────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-[#DEDED7] flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-4 py-4 border-b border-[#DEDED7]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0066CC]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Roles</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-[#C2E0FF]/30 text-[#0066CC] rounded-full font-semibold border border-[#C2E0FF]">
              {roles.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={roleSearch}
              onChange={e => setRoleSearch(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-8 pr-3 py-1.5 border border-[#DEDED7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-[#F6F7F0]"
            />
            {roleSearch && (
              <button onClick={() => setRoleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* "All Users" anchor */}
        <button
          onClick={() => { setSelectedRoleId(null); setActiveTab('Users'); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-[#DEDED7] transition-colors text-left ${!selectedRoleId ? 'bg-[#C2E0FF]/20 text-[#0066CC]' : 'text-gray-600 hover:bg-[#F6F7F0]'}`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-xs font-semibold">All Users</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${!selectedRoleId ? 'bg-[#0066CC] text-white' : 'bg-[#F6F7F0] text-gray-500'}`}>
            {totalUsers}
          </span>
        </button>

        {/* Role list */}
        <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
          {filteredRoles.map(role => {
            const isSelected = selectedRoleId === role.id;
            const isExpanded = expandedRoles[role.id];
            const roleUserCount = users.filter(u => u.roleCode === role.code).length;
            return (
              <div key={role.id}>
                <div
                  onClick={() => handleRoleClick(role)}
                  className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-all group ${isSelected ? 'bg-[#C2E0FF]/20 border-r-2 border-[#0066CC]' : 'hover:bg-[#F6F7F0]'}`}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleRoleExpand(role.id); }}
                    className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-gray-500 flex-shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: role.color }}>
                    {role.id}
                  </span>
                  <span className={`flex-1 text-xs truncate ${isSelected ? 'font-semibold text-[#0066CC]' : 'text-gray-600 font-medium'}`}>
                    {role.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${isSelected ? 'bg-[#0066CC] text-white' : 'bg-[#F6F7F0] text-gray-400'}`}>
                    {roleUserCount}
                  </span>
                </div>
                {isExpanded && (
                  <div className="ml-10 pl-2 border-l border-[#DEDED7] py-1">
                    <p className="px-2 py-1 text-[10px] text-gray-400 italic">{role.description.slice(0, 60)}…</p>
                    <button
                      onClick={() => { setSelectedRoleId(role.id); setActiveTab('Permissions'); }}
                      className="w-full text-left px-2 py-1 text-[10px] text-[#0066CC] hover:underline"
                    >
                      View permissions →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredRoles.length === 0 && (
            <p className="px-4 py-4 text-xs text-gray-400 italic text-center">No roles match</p>
          )}
        </nav>

        {/* Panel footer stats */}
        <div className="px-4 py-3 border-t border-[#DEDED7] bg-[#F6F7F0]/60">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total Users', value: totalUsers },
              { label: 'Active', value: activeUsers },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-base font-bold text-[#133062]">{s.value}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="bg-white border-b border-[#DEDED7] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#133062] text-xl font-bold leading-tight">User Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage users, roles, and access permissions across the platform
                {selectedRoleId && (
                  <span className="ml-2 text-[#0066CC] font-semibold">
                    · Filtered by {roles.find(r => r.id === selectedRoleId)?.name}
                    <button onClick={() => setSelectedRoleId(null)} className="ml-1 hover:text-[#133062]"><X className="w-3 h-3 inline" /></button>
                  </span>
                )}
              </p>
            </div>
            {/* Summary pills */}
            <div className="hidden lg:flex items-center gap-3">
              {[
                { label: 'Total Users', value: totalUsers, color: '#0066CC', bg: '#C2E0FF30' },
                { label: 'Active', value: activeUsers, color: '#065F46', bg: '#D1FAE530' },
                { label: 'Roles', value: roles.length, color: '#5B21B6', bg: '#EDE9FE30' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: s.color + '30', backgroundColor: s.bg }}>
                  <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {(['Users', 'Roles', 'Permissions'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-t-lg text-sm font-semibold transition-all border-b-2 ${activeTab === tab
                  ? 'border-[#0066CC] text-[#0066CC] bg-[#C2E0FF]/10'
                  : 'border-transparent text-gray-500 hover:text-[#133062] hover:bg-[#F6F7F0]'
                  }`}
              >
                {TAB_ICONS[tab]}{tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'Users' && (
            <UsersTab users={users} onUsersChange={setUsers} roleFilter={selectedRoleId} />
          )}
          {activeTab === 'Roles' && (
            <RolesTab roles={roles} onRolesChange={setRoles}
              onRoleSelect={r => { setSelectedRoleId(r.id); setActiveTab('Users'); }}
              selectedRoleId={selectedRoleId} />
          )}
          {activeTab === 'Permissions' && (
            <PermissionsTab selectedRoleId={selectedRoleId} />
          )}
        </div>
      </div>
    </div>
  );
}
