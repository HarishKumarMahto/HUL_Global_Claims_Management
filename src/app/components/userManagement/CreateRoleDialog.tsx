import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Shield, AlertCircle } from 'lucide-react';
import { type Role } from './userManagementData';

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (newRole: Role) => void;
  existingRoles: Role[];
}

export default function CreateRoleDialog({ isOpen, onClose, onCreateRole, existingRoles }: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = roleName.trim();
    if (!trimmed) {
      setError('Role name is required');
      return;
    }
    if (existingRoles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A role with this name already exists');
      return;
    }

    const newRole: Role = {
      id: `R${existingRoles.length + 1}`,
      code: `NROLE${Math.floor(Math.random() * 1000)}` as any,
      name: trimmed,
      shortName: trimmed.slice(0, 4).toUpperCase(),
      scope: 'n/a',
      description: 'Newly created role',
      userCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      color: '#6B7589',
      status: 'Active'
    };

    onCreateRole(newRole);
    setRoleName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#F6F7F0]">
        <DialogHeader className="px-6 py-4 border-b border-[#DEDED7] bg-white">
          <DialogTitle className="text-xl font-bold text-[#133062] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0066CC]" />
            New Role
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">Create a new role to define a custom set of permissions.</p>
        </DialogHeader>

        <div className="p-6">
          <label className="block text-sm font-semibold text-[#133062] mb-1.5">Role Name *</label>
          <input
            value={roleName}
            onChange={e => { setRoleName(e.target.value); setError(''); }}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#0066CC] outline-none ${error ? 'border-red-500 bg-red-50/30' : 'border-[#DEDED7] bg-white'}`}
            placeholder="e.g. Content Reviewer"
            autoFocus
          />
          {error && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" />{error}</span>}
          <p className="text-[10px] text-gray-500 mt-3">
            Note: The new role will be initialized with all available permissions by default. You can edit them immediately after creation.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#DEDED7] bg-white flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#F6F7F0] rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#0066CC] hover:bg-[#004D99] rounded-xl shadow-lg shadow-[#0066CC]/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
