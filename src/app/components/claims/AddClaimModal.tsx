import { useState, useEffect } from 'react';
import { X, Plus, Copy } from 'lucide-react';
import type { Claim, ClaimSection } from '../workspace/RelatedClaimsTab';
import CopyClaimsTab from './CopyClaimsTab';
import SelectClaimsTab from './SelectClaimsTab';
import CreateClaimsTab from './CreateClaimsTab';

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClaims: (claims: Claim[]) => void;
  linkedProductIds: string[];
  existingClaims: Claim[];
  initialSelectedClaims?: Claim[];
  initialTab?: 'copy' | 'select' | 'create';
}

export default function AddClaimModal({
  isOpen,
  onClose,
  onAddClaims,
  linkedProductIds,
  existingClaims,
  initialSelectedClaims = [],
  initialTab = 'copy'
}: AddClaimModalProps) {
  const [activeTab, setActiveTab] = useState<'copy' | 'select' | 'create'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-earth/30 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky/10 rounded-xl border border-sky/20">
                <Plus className="w-5 h-5 text-sky" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-night">Add Claims to Project</h2>
                <p className="text-xs text-gray-500 mt-0.5">Copy existing, select from library, or create new claims</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-earth rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-pebble px-6 bg-white flex-shrink-0 gap-2 pt-2">
            <button
              onClick={() => setActiveTab('copy')}
              className={`px-4 py-3 text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'copy'
                  ? 'border-sky text-sky font-bold'
                  : 'border-transparent text-gray-600 hover:text-night font-medium'
              }`}
            >
              <Copy className="w-4 h-4" /> Copy Claims
            </button>
            <button
              onClick={() => setActiveTab('select')}
              className={`px-4 py-3 text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'select'
                  ? 'border-sky text-sky font-bold'
                  : 'border-transparent text-gray-600 hover:text-night font-medium'
              }`}
            >
              Select from Library
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-3 text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'border-sky text-sky font-bold'
                  : 'border-transparent text-gray-600 hover:text-night font-medium'
              }`}
            >
              Create New
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-50/30">
            {activeTab === 'copy' && (
              <CopyClaimsTab
                onAddClaims={(claims) => {
                  onAddClaims(claims);
                  onClose();
                }}
                linkedProductIds={linkedProductIds}
                existingClaims={existingClaims}
              />
            )}
            {activeTab === 'select' && (
              <SelectClaimsTab
                onAddClaims={(claims) => {
                  onAddClaims(claims);
                  onClose();
                }}
                linkedProductIds={linkedProductIds}
                existingClaims={existingClaims}
                initialSelectedClaims={initialSelectedClaims}
              />
            )}
            {activeTab === 'create' && (
              <CreateClaimsTab
                onCreateClaims={(claims) => {
                  onAddClaims(claims);
                  onClose();
                }}
                linkedProductIds={linkedProductIds}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
