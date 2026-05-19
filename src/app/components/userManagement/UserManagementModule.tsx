import React, { useState } from 'react';
import { Users, Shield } from 'lucide-react';
import { ROLES, MOCK_USERS, ROLE_PERMISSIONS, type Role, type UserRecord, type RolePermissions } from './userManagementData';
import UsersTab from './UsersTab';
import RolesPermissionsView from './RolesPermissionsView';

type Tab = 'Users' | 'Roles & Permissions';

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  'Users': <Users className="w-4 h-4" />,
  'Roles & Permissions': <Shield className="w-4 h-4" />,
};

export default function UserManagementModule() {
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [permissionsData, setPermissionsData] = useState<Record<string, RolePermissions>>(ROLE_PERMISSIONS);
  const [activeTab, setActiveTab] = useState<Tab>('Users');

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F6F7F0]">
      {/* Page header */}
      <div className="bg-white border-b border-[#DEDED7] px-6 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#133062] text-xl font-bold leading-tight">User Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage users, functional roles, and explicit system permissions.</p>
          </div>
          {/* Summary pills */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { label: 'Total Users', value: totalUsers, color: '#0066CC', bg: '#C2E0FF30' },
              { label: 'Active Users', value: activeUsers, color: '#065F46', bg: '#D1FAE530' },
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
        <div className="flex items-center gap-1">
          {(['Users', 'Roles & Permissions'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all border-b-2 ${activeTab === tab
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
        {activeTab === 'Users' ? (
          <UsersTab users={users} onUsersChange={setUsers} roleFilter={null} />
        ) : (
          <RolesPermissionsView
            roles={roles}
            users={users}
            permissionsData={permissionsData}
            onRolesChange={setRoles}
            onUsersChange={setUsers}
            onPermissionsSave={(roleId, perms) => setPermissionsData(prev => ({ ...prev, [roleId]: perms }))}
          />
        )}
      </div>
    </div>
  );
}
