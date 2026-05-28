import { useState } from 'react';
import { X, Bookmark, Plus, MoreHorizontal, Share2, Trash2, Edit3, Star, Save, Search, Check } from 'lucide-react';

export interface SavedView {
  id: string;
  name: string;
  type: 'user' | 'shared' | 'admin';
  description: string;
  filters?: Record<string, string[]>;
  sorting?: { column: string; direction: 'asc' | 'desc' };
  isDefault?: boolean;
}

const MOCK_VIEWS: SavedView[] = [
  {
    id: '1', name: 'High Priority Reviews', type: 'admin', isDefault: true,
    description: 'All in-progress projects in review stage, sorted by last updated',
    filters: { status: ['In Progress', 'Under Review'] },
    sorting: { column: 'lastUpdated', direction: 'desc' }
  },
  {
    id: '2', name: 'BPC Global Projects', type: 'shared',
    description: 'Beauty & Personal Care global scope projects across all stages',
    filters: { businessGroup: ['Beauty & Personal Care'], region: ['Global'] }
  },
  {
    id: '3', name: 'My Active Work', type: 'user',
    description: 'Projects I lead that are currently in progress',
    filters: { status: ['In Progress'] }
  },
  {
    id: '4', name: 'EMEA Regulatory', type: 'shared',
    description: 'All EMEA region projects requiring regulatory compliance',
    filters: { region: ['EMEA'], projectType: ['Regulatory Compliance'] }
  },
  {
    id: '5', name: 'Recent Completions', type: 'admin',
    description: 'Completed projects from last 90 days for portfolio review',
    filters: { status: ['Completed'] },
    sorting: { column: 'lastUpdated', direction: 'desc' }
  },
  {
    id: '6', name: 'Draft Projects', type: 'user',
    description: 'All projects in draft stage awaiting substantiation',
    filters: { status: ['Draft'] }
  }
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin Default', color: 'bg-purple-100 text-purple-700 font-medium' },
  shared: { label: 'Shared', color: 'bg-blue-100 text-blue-700 font-medium' },
  user: { label: 'My View', color: 'bg-green-100 text-green-700 font-medium' }
};

interface SavedViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: SavedView) => void;
  views: SavedView[];
  onViewsChange: (views: SavedView[]) => void;
}

export default function SavedViewsModal({ isOpen, onClose, onSelectView, views, onViewsChange }: SavedViewsModalProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDesc, setNewViewDesc] = useState('');
  const [newViewType, setNewViewType] = useState<'user' | 'shared'>('user');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareDialogState, setShareDialogState] = useState({
    isOpen: false,
    viewId: '',
    search: '',
    selectedUsers: [] as string[],
    makeDefault: false
  });

  if (!isOpen) return null;

  const filtered = views.filter(v => {
    if (activeTab === 'mine') return v.type === 'user';
    if (activeTab === 'shared') return v.type === 'shared' || v.type === 'admin';
    return true;
  });

  const handleSelect = (view: SavedView) => { onSelectView(view); onClose(); };

  const handleShareViewConfirm = (users: string[]) => {
    onViewsChange(views.map(v => {
      if (v.id === shareDialogState.viewId) {
        return {
          ...v,
          type: 'shared' as const,
          isDefault: shareDialogState.makeDefault ? true : v.isDefault
        };
      }
      return {
        ...v,
        isDefault: shareDialogState.makeDefault ? false : v.isDefault
      };
    }));
    setShareDialogState({ isOpen: false, viewId: '', search: '', selectedUsers: [], makeDefault: false });
  };

  // US-M1-37: Remove view — now available for all user/shared views
  const handleRemoveView = (id: string) => {
    onViewsChange(views.filter(v => v.id !== id));
    setActiveMenu(null);
  };

  // US-M1-39: Save as New View dialog
  const handleSaveNewView = () => {
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      id: String(Date.now()),
      name: newViewName.trim(),
      description: newViewDesc.trim() || 'Custom saved view',
      type: newViewType,
      filters: {},
    };
    onViewsChange([newView, ...views]);
    setNewViewName('');
    setNewViewDesc('');
    setShowSaveDialog(false);
  };

  const handleRenameStart = (view: SavedView) => {
    setRenaming(view.id);
    setRenameValue(view.name);
    setActiveMenu(null);
  };

  const handleRenameConfirm = (id: string) => {
    onViewsChange(views.map(v => v.id === id ? { ...v, name: renameValue } : v));
    setRenaming(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pale rounded-lg">
              <Bookmark className="w-4 h-4 text-sky" />
            </div>
            <h2 className="text-night">Saved Views</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pebble flex-shrink-0">
          {([['all', 'All Views'], ['mine', 'My Views'], ['shared', 'Shared']] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-sky border-sky' : 'text-gray-500 border-transparent hover:text-night'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Views List */}
        <div className="flex-1 overflow-auto p-4">
          {showSaveDialog && (
            <div className="mb-4 p-4 bg-pale/30 border border-sky/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Save className="w-4 h-4 text-sky" />
                <span className="text-sm text-night" style={{ fontWeight: 600 }}>Save as New View</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">View Name <span className="text-red-500">*</span></label>
                  <input type="text" value={newViewName} onChange={e => setNewViewName(e.target.value)}
                    placeholder="e.g. My Active EMEA Projects"
                    className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Description</label>
                  <input type="text" value={newViewDesc} onChange={e => setNewViewDesc(e.target.value)}
                    placeholder="Optional description..."
                    className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Visibility</label>
                  <div className="flex gap-3">
                    {(['user', 'shared'] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${newViewType === t ? 'border-sky' : 'border-gray-300'}`}
                          onClick={() => setNewViewType(t)}>
                          {newViewType === t && <div className="w-2 h-2 rounded-full bg-sky" />}
                        </div>
                        <span className="text-sm text-night capitalize">{t === 'user' ? 'Private (My View)' : 'Shared with team'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowSaveDialog(false)}
                    className="px-3 py-1.5 border border-pebble text-night rounded-lg text-sm hover:bg-earth">
                    Cancel
                  </button>
                  <button onClick={handleSaveNewView} disabled={!newViewName.trim()}
                    className="px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40">
                    Save View
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filtered.map(view => {
              const typeConfig = TYPE_CONFIG[view.type];
              return (
                <div
                  key={view.id}
                  className="group flex items-center gap-3 p-4 border border-pebble rounded-xl hover:border-sky hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => renaming !== view.id && handleSelect(view)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {renaming === view.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(view.id); if (e.key === 'Escape') setRenaming(null); }}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                          className="text-sm text-night px-2 py-0.5 border border-sky rounded focus:outline-none flex-1 max-w-[200px]"
                        />
                      ) : (
                        <span className="text-sm text-night" style={{ fontWeight: 500 }}>{view.name}</span>
                      )}
                      {view.isDefault && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Default
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{view.description}</p>

                    {/* Filter chips */}
                    {view.filters && Object.keys(view.filters).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(view.filters).map(([key, vals]) =>
                          (vals as string[]).map(val => (
                            <span key={`${key}-${val}`} className="text-xs bg-earth text-gray-600 px-2 py-0.5 rounded">
                              {val}
                            </span>
                          ))
                        )}
                        {view.sorting && (
                          <span className="text-xs bg-earth text-gray-600 px-2 py-0.5 rounded">
                            ↕ {view.sorting.column}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === view.id ? null : view.id)}
                        className="p-1.5 hover:bg-earth rounded-lg"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                      {activeMenu === view.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                            {[
                              {
                                icon: <Star className="w-3.5 h-3.5" />, label: 'Set as Default', action: () => {
                                  onViewsChange(views.map(v => ({ ...v, isDefault: v.id === view.id })));
                                  setActiveMenu(null);
                                }
                              },
                              { icon: <Edit3 className="w-3.5 h-3.5" />, label: 'Rename', action: () => handleRenameStart(view) },
                              {
                                icon: <Share2 className="w-3.5 h-3.5" />, label: 'Share View', action: () => {
                                  setShareDialogState({
                                    isOpen: true,
                                    viewId: view.id,
                                    search: '',
                                    selectedUsers: [],
                                    makeDefault: false
                                  });
                                  setActiveMenu(null);
                                }
                              },
                            ].map(item => (
                              <button key={item.label} onClick={() => { item.action?.(); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                                <span className="text-gray-400">{item.icon}</span>
                                {item.label}
                              </button>
                            ))}
                            {/* US-M1-37: Remove view option — available for user & shared views */}
                            {(view.type === 'user' || view.type === 'shared') && (
                              <>
                                <div className="border-t border-pebble" />
                                <button onClick={() => handleRemoveView(view.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />Remove View
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors">
            Cancel
          </button>
          <div className="flex gap-3">
            {/* US-M1-39: Save as New View button triggers dialog */}
            <button onClick={() => setShowSaveDialog(!showSaveDialog)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${showSaveDialog ? 'border-sky bg-pale text-sky' : 'border-sky text-sky hover:bg-pale'}`}>
              <Save className="w-4 h-4" />Save as New View
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
              <Plus className="w-4 h-4" />Create New View
            </button>
          </div>
        </div>
      </div>

      {shareDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setShareDialogState({ isOpen: false, viewId: '', search: '', selectedUsers: [], makeDefault: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh] z-50 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <Share2 className="w-5 h-5 text-sky" />
              </div>
              <div>
                <h3 className="text-lg text-night font-semibold">Share Saved View</h3>
                <p className="text-xs text-gray-500">Allow team members to use this layout</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search input to filter team members */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Search &amp; Filter Users</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={shareDialogState.search}
                    onChange={e => setShareDialogState(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-8 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  {shareDialogState.search && (
                    <button
                      onClick={() => setShareDialogState(prev => ({ ...prev, search: '' }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2" style={{ fontWeight: 600 }}>Select Team Members (Multiselect)</label>
                <div className="flex flex-wrap gap-2 mb-3 max-h-[140px] overflow-y-auto p-1 border border-pebble/60 rounded-lg">
                  {['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis', 'Lisa Anderson']
                    .filter(user => user.toLowerCase().includes(shareDialogState.search.toLowerCase()))
                    .map(user => {
                      const isSelected = shareDialogState.selectedUsers.includes(user);
                      return (
                        <button
                          key={user}
                          onClick={() => {
                            setShareDialogState(prev => ({
                              ...prev,
                              selectedUsers: isSelected
                                ? prev.selectedUsers.filter(u => u !== user)
                                : [...prev.selectedUsers, user]
                            }));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${isSelected
                            ? 'border-sky bg-pale text-sky font-medium shadow-sm'
                            : 'border-pebble text-gray-600 hover:border-sky/40 hover:bg-earth'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {user}
                        </button>
                      );
                    })}
                  {['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis', 'Lisa Anderson']
                    .filter(user => user.toLowerCase().includes(shareDialogState.search.toLowerCase())).length === 0 && (
                      <p className="text-xs text-gray-400 italic p-2">No users match your search.</p>
                    )}
                </div>
              </div>

              {/* Set as Default View checkbox option */}
              <div className="flex items-center gap-2.5 pt-3 pb-1 border-t border-pebble">
                <input
                  type="checkbox"
                  id="share-make-default-checkbox-prj"
                  checked={shareDialogState.makeDefault}
                  onChange={e => setShareDialogState(prev => ({ ...prev, makeDefault: e.target.checked }))}
                  className="w-4 h-4 rounded text-sky focus:ring-sky border-pebble accent-sky cursor-pointer"
                />
                <label htmlFor="share-make-default-checkbox-prj" className="text-sm text-gray-700 cursor-pointer select-none font-medium">
                  Set as Default View on share <span className="text-[10px] text-gray-400 font-normal ml-0.5">(Field enabled only for Business Admin)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-pebble">
                <button
                  onClick={() => setShareDialogState({ isOpen: false, viewId: '', search: '', selectedUsers: [], makeDefault: false })}
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareViewConfirm(shareDialogState.selectedUsers)}
                  disabled={shareDialogState.selectedUsers.length === 0}
                  className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40 transition-colors"
                >
                  Share View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}