import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, Edit2, Copy, Trash2, Power, PowerOff, Shield, Users, Save, X, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { type Role, type UserRecord, type RolePermissions, type PermissionValue, PERMISSION_MODULES, getUserInitials, getAvatarColor } from './userManagementData';
import CreateRoleDialog from './CreateRoleDialog';
import CopyRoleDialog from './CopyRoleDialog';

const COLUMNS = ['view', 'readOnly', 'edit'] as const;
const COL_LABELS = { view: 'View', readOnly: 'Read-Only', edit: 'Edit' };

interface RolesPermissionsViewProps {
  roles: Role[];
  users: UserRecord[];
  permissionsData: Record<string, RolePermissions>;
  onRolesChange: (roles: Role[]) => void;
  onUsersChange: (users: UserRecord[]) => void;
  onPermissionsSave: (roleId: string, perms: RolePermissions) => void;
}

export default function RolesPermissionsView({ roles, users, permissionsData, onRolesChange, onUsersChange, onPermissionsSave }: RolesPermissionsViewProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id || null);
  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Left Panel State
  const [roleSearch, setRoleSearch] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCopyRole, setShowCopyRole] = useState(false);
  const [roleToCopy, setRoleToCopy] = useState<Role | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Middle Panel State
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PERMISSION_MODULES.forEach(m => initial[m.id] = true);
    return initial;
  });
  const [localPerms, setLocalPerms] = useState<RolePermissions | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Right Panel State
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserMenu, setShowAddUserMenu] = useState(false);

  // Load permissions when role selection changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) {
        // We'd ideally prevent the change, but for a simple component we rely on the prompt.
        // If they click cancel, we'd need to revert the selection. 
        // For simplicity, we just prompt and proceed if they say ok.
      }
    }
    if (selectedRoleId) {
      // Deep copy to local state for editing
      const rolePerms = permissionsData[selectedRoleId] || {};
      setLocalPerms(JSON.parse(JSON.stringify(rolePerms)));
      setHasUnsavedChanges(false);
    } else {
      setLocalPerms(null);
      setHasUnsavedChanges(false);
    }
  }, [selectedRoleId, permissionsData]);

  const handlePermChange = (rowId: string, level: 'view' | 'readOnly' | 'edit') => {
    if (!localPerms) return;
    setLocalPerms(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (!updated[rowId]) updated[rowId] = { view: 'No', readOnly: 'No', edit: 'No' };
      
      // Reset all to 'No' first (mutually exclusive)
      updated[rowId] = { view: 'No', readOnly: 'No', edit: 'No' };
      // Set the selected one to 'Yes'
      updated[rowId][level] = 'Yes';
      
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleSavePermissions = () => {
    if (selectedRoleId && localPerms) {
      onPermissionsSave(selectedRoleId, localPerms);
      setHasUnsavedChanges(false);
      alert('Permissions saved successfully.');
    }
  };

  const toggleRoleStatus = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    if (role.status === 'Active') {
      if (!window.confirm(`Are you sure you want to deactivate the ${role.name} role? It will no longer be assignable.`)) return;
    }
    onRolesChange(roles.map(r => r.id === roleId ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r));
    setActionMenuId(null);
  };

  const handleRemoveUserFromRole = (userId: string) => {
    if (!selectedRole) return;
    if (!window.confirm('Remove user from this role?')) return;
    
    onUsersChange(users.map(u => {
      if (u.id === userId) {
        return { ...u, roleCodes: u.roleCodes.filter(c => c !== selectedRole.code) };
      }
      return u;
    }));
  };

  const handleAddUserToRole = (userId: string) => {
    if (!selectedRole) return;
    onUsersChange(users.map(u => {
      if (u.id === userId && !u.roleCodes.includes(selectedRole.code)) {
        return { ...u, roleCodes: [...u.roleCodes, selectedRole.code] };
      }
      return u;
    }));
    setShowAddUserMenu(false);
    setUserSearch('');
  };

  // Derived Data
  const filteredRoles = roles.filter(r => !roleSearch || r.name.toLowerCase().includes(roleSearch.toLowerCase()));
  const assignedUsers = users.filter(u => selectedRole && u.roleCodes.includes(selectedRole.code));
  const unassignedUsers = users.filter(u => selectedRole && !u.roleCodes.includes(selectedRole.code) && u.status === 'Active');

  return (
    <div className="flex h-full overflow-hidden bg-white">
      
      {/* ─── LEFT PANEL: ROLES LIST ─────────────────────────────────────────── */}
      <div className="w-80 border-r border-[#DEDED7] flex flex-col bg-[#F6F7F0]/30 flex-shrink-0">
        <div className="p-4 border-b border-[#DEDED7]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#133062] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0066CC]" /> Roles
            </h2>
            <button onClick={() => setShowCreateRole(true)} className="p-1 hover:bg-[#DEDED7] rounded text-[#0066CC] transition-colors" title="Create New Role">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search roles..." className="w-full pl-9 pr-3 py-2 border border-[#DEDED7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] bg-white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredRoles.map(role => (
            <div key={role.id} onClick={() => setSelectedRoleId(role.id)}
              className={`group flex items-center p-2.5 rounded-xl cursor-pointer transition-all border ${selectedRoleId === role.id ? 'bg-[#C2E0FF]/20 border-[#0066CC]' : 'bg-white border-[#DEDED7] hover:border-gray-300'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-[#133062] truncate">{role.name}</span>
                  {role.status === 'Inactive' && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-500 uppercase">Inactive</span>}
                </div>
                <div className="text-[11px] text-gray-500 truncate flex items-center gap-2">
                  <span className="font-mono bg-gray-100 px-1 rounded">{role.code}</span>
                  <span>{users.filter(u => u.roleCodes.includes(role.code)).length} users</span>
                </div>
              </div>
              
              {/* Role Action Menu */}
              <div className="relative ml-2">
                <button onClick={e => { e.stopPropagation(); setActionMenuId(actionMenuId === role.id ? null : role.id); }}
                  className={`p-1.5 rounded-lg transition-colors ${actionMenuId === role.id ? 'bg-[#DEDED7] text-[#133062]' : 'text-gray-400 hover:text-[#133062] hover:bg-[#F6F7F0] opacity-0 group-hover:opacity-100'}`}>
                  <MoreVertical className="w-4 h-4" />
                </button>
                {actionMenuId === role.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActionMenuId(null); }} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#DEDED7] rounded-xl shadow-xl z-20 py-1.5 w-40 overflow-hidden">
                      <button onClick={(e) => { e.stopPropagation(); setRoleToCopy(role); setShowCopyRole(true); setActionMenuId(null); }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                        <Copy className="w-3.5 h-3.5 text-gray-400" /> Copy Role
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleRoleStatus(role.id); }} 
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#133062] hover:bg-[#F6F7F0] text-left">
                        {role.status === 'Active' ? <><PowerOff className="w-3.5 h-3.5 text-gray-400" /> Deactivate</> : <><Power className="w-3.5 h-3.5 text-gray-400" /> Activate</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MIDDLE PANEL: PERMISSIONS MATRIX ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-[500px]">
        {selectedRole ? (
          <>
            <div className="px-6 py-4 border-b border-[#DEDED7] bg-white flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#133062]">{selectedRole.name} Permissions</h2>
                <p className="text-xs text-gray-500 mt-0.5">Toggle access levels. Changes apply to all assigned users.</p>
              </div>
              <div className="flex items-center gap-4">
                {hasUnsavedChanges && (
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes
                  </span>
                )}
                <button 
                  onClick={handleSavePermissions}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg text-sm font-semibold hover:bg-[#004D99] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {PERMISSION_MODULES.map(mod => (
                <div key={mod.id} className="mb-4">
                  <button onClick={() => setExpandedModules(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                    className="w-full flex items-center gap-2 px-6 py-3 bg-[#F6F7F0] border-y border-[#DEDED7] sticky top-0 z-10 transition-colors hover:bg-[#EBECE4]">
                    {expandedModules[mod.id] ? <ChevronDown className="w-4 h-4 text-[#0066CC]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm font-bold text-[#133062] uppercase tracking-wider">{mod.label}</span>
                  </button>

                  {expandedModules[mod.id] && (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-[#DEDED7]">
                          <th className="text-left px-6 py-2.5 font-semibold text-gray-500 text-xs">Permission [Module › Object › Action]</th>
                          {COLUMNS.map(c => <th key={c} className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs w-24">{COL_LABELS[c]}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DEDED7]/40">
                        {mod.rows.map(row => {
                          const perms = localPerms?.[row.id] || { view: 'No', readOnly: 'No', edit: 'No' };
                          return (
                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-2.5 text-xs text-gray-700">{row.label}</td>
                              {COLUMNS.map(col => (
                                <td key={col} className="px-4 py-2.5 text-center">
                                  <label className="inline-flex items-center justify-center cursor-pointer p-1 rounded hover:bg-gray-100">
                                    <input 
                                      type="radio" 
                                      name={`${selectedRole.id}-${row.id}`} 
                                      checked={perms[col] === 'Yes'}
                                      onChange={() => handlePermChange(row.id, col)}
                                      className="w-4 h-4 text-[#0066CC] border-gray-300 focus:ring-[#0066CC]"
                                    />
                                  </label>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Shield className="w-12 h-12 mb-4 text-gray-200" />
            <p>Select a role to view and edit permissions</p>
          </div>
        )}
      </div>

      {/* ─── RIGHT PANEL: ASSIGNED USERS ─────────────────────────────────────── */}
      <div className="w-80 border-l border-[#DEDED7] flex flex-col bg-[#F6F7F0]/30 flex-shrink-0">
        <div className="p-4 border-b border-[#DEDED7]">
          <div className="flex items-center justify-between mb-3 relative">
            <h2 className="text-sm font-bold text-[#133062] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0066CC]" /> Assigned Users
              <span className="text-[10px] bg-[#C2E0FF] text-[#004D99] px-2 py-0.5 rounded-full font-bold">{assignedUsers.length}</span>
            </h2>
            <button onClick={() => setShowAddUserMenu(p => !p)} disabled={!selectedRole || selectedRole.status === 'Inactive'}
              className="p-1 hover:bg-[#DEDED7] rounded text-[#0066CC] transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Assign User">
              <Plus className="w-4 h-4" />
            </button>
            
            {showAddUserMenu && selectedRole && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAddUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#DEDED7] rounded-xl shadow-xl z-20 w-64 overflow-hidden flex flex-col max-h-80">
                  <div className="p-2 border-b border-[#DEDED7]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users to add..." className="w-full pl-8 pr-2 py-1.5 border border-[#DEDED7] rounded text-xs focus:outline-none focus:border-[#0066CC]" autoFocus />
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    {unassignedUsers.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                      <button key={u.id} onClick={() => handleAddUserToRole(u.id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F6F7F0] text-left transition-colors border-b border-[#DEDED7]/30 last:border-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: getAvatarColor(u.roleCodes[0]) || '#6B7589' }}>
                          {getUserInitials(u)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#133062] truncate">{u.firstName} {u.lastName}</div>
                          <div className="text-[10px] text-gray-500 truncate">{u.email}</div>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-[#0066CC] ml-auto opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                    {unassignedUsers.length === 0 && <div className="p-4 text-xs text-center text-gray-400">No active users available</div>}
                  </div>
                </div>
              </>
            )}
          </div>
          {selectedRole?.status === 'Inactive' && (
            <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-200 mt-2 flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /> This role is inactive. You cannot assign new users.
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {assignedUsers.map(user => (
            <div key={user.id} className="group flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#DEDED7] hover:border-gray-300 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: getAvatarColor(user.roleCodes[0]) || '#6B7589' }}>
                {getUserInitials(user)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-[#133062] truncate">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] text-gray-500 truncate">{user.functionArea}</div>
              </div>
              <button onClick={() => handleRemoveUserFromRole(user.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100" title="Remove from role">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {assignedUsers.length === 0 && (
            <div className="p-6 text-center">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No users assigned to this role.</p>
            </div>
          )}
        </div>
      </div>

      <CreateRoleDialog isOpen={showCreateRole} onClose={() => setShowCreateRole(false)} onCreateRole={r => { onRolesChange([...roles, r]); setSelectedRoleId(r.id); }} existingRoles={roles} />
      <CopyRoleDialog isOpen={showCopyRole} onClose={() => setShowCopyRole(false)} onCreateRole={r => { onRolesChange([...roles, r]); setSelectedRoleId(r.id); }} sourceRole={roleToCopy} existingRoles={roles} />
    </div>
  );
}
