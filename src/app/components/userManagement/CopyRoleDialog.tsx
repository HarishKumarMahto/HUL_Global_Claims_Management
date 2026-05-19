import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Copy, AlertCircle } from 'lucide-react';
import { type Role } from './userManagementData';

interface CopyRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (newRole: Role) => void;
  sourceRole: Role | null;
  existingRoles: Role[];
}

export default function CopyRoleDialog({ isOpen, onClose, onCreateRole, sourceRole, existingRoles }: CopyRoleDialogProps) {
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNewRoleName(sourceRole ? `Copy of ${sourceRole.name}` : '');
      setError('');
    }
  }, [isOpen, sourceRole]);

  if (!sourceRole) return null;

  const handleSave = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) {
      setError('Role name is required');
      return;
    }
    if (existingRoles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A role with this name already exists');
      return;
    }

    const newRole: Role = {
      ...sourceRole,
      id: `R${existingRoles.length + 1}`,
      code: `CROLE${Math.floor(Math.random() * 1000)}` as any,
      name: trimmed,
      shortName: trimmed.slice(0, 4).toUpperCase(),
      description: `Copied from ${sourceRole.name}`,
      userCount: 0, // Users do not get copied
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    onCreateRole(newRole);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#F6F7F0]">
        <DialogHeader className="px-6 py-4 border-b border-[#DEDED7] bg-white">
          <DialogTitle className="text-xl font-bold text-[#133062] flex items-center gap-2">
            <Copy className="w-5 h-5 text-[#008090]" />
            Copy Role
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">Duplicate an existing role to quickly create a similar access model.</p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Source Role</label>
            <div className="px-4 py-2.5 bg-gray-50 border border-[#DEDED7] rounded-xl text-sm font-semibold text-[#133062]">
              {sourceRole.name} <span className="text-gray-400 font-normal">({sourceRole.code})</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Permissions will be duplicated. Users will not be copied.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#133062] mb-1.5">New Role Name *</label>
            <input
              value={newRoleName}
              onChange={e => { setNewRoleName(e.target.value); setError(''); }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#0066CC] outline-none ${error ? 'border-red-500 bg-red-50/30' : 'border-[#DEDED7] bg-white'}`}
              autoFocus
            />
            {error && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" />{error}</span>}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#DEDED7] bg-white flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#F6F7F0] rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#0066CC] hover:bg-[#004D99] rounded-xl shadow-lg shadow-[#0066CC]/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            Save Copied Role
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
