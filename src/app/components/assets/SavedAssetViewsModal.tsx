import { useState } from 'react';
import { X, Plus, Star, Share2, Trash2, BookOpen, Lock, Globe } from 'lucide-react';

export interface AssetSavedView {
  id: string;
  name: string;
  owner: string;
  isShared: boolean;
  filters: {
    lifecycle: string[];
    subtype: string[];
    businessGroup: string[];
    geography: string[];
    searchQuery: string;
  };
  columns: string[];
  sortBy: string | null;
  sortDir: 'asc' | 'desc' | null;
  createdAt: string;
}

interface SavedAssetViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  views: AssetSavedView[];
  activeViewId: string | null;
  currentFilters: AssetSavedView['filters'];
  currentColumns: string[];
  currentSort: { sortBy: string | null; sortDir: 'asc' | 'desc' | null };
  onSaveView: (view: AssetSavedView) => void;
  onDeleteView: (id: string) => void;
  onApplyView: (view: AssetSavedView) => void;
}

const CURRENT_USER = 'Current User';

export default function SavedAssetViewsModal({
  isOpen,
  onClose,
  views,
  activeViewId,
  currentFilters,
  currentColumns,
  currentSort,
  onSaveView,
  onDeleteView,
  onApplyView,
}: SavedAssetViewsModalProps) {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [newName, setNewName] = useState('');
  const [newShared, setNewShared] = useState(false);
  const [nameError, setNameError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const myViews = views.filter(v => v.owner === CURRENT_USER);
  const sharedViews = views.filter(v => v.owner !== CURRENT_USER && v.isShared);

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Name is required'); return; }
    const duplicate = views.some(
      v => v.name.toLowerCase() === trimmed.toLowerCase() && v.owner === CURRENT_USER
    );
    if (duplicate) { setNameError('A view with this name already exists'); return; }

    const view: AssetSavedView = {
      id: `asv-${Date.now()}`,
      name: trimmed,
      owner: CURRENT_USER,
      isShared: newShared,
      filters: { ...currentFilters },
      columns: [...currentColumns],
      sortBy: currentSort.sortBy,
      sortDir: currentSort.sortDir,
      createdAt: new Date().toISOString(),
    };
    onSaveView(view);
    setMode('list');
    setNewName('');
    setNewShared(false);
    setNameError('');
  };

  const handleClose = () => {
    setMode('list');
    setNewName('');
    setNewShared(false);
    setNameError('');
    setConfirmDeleteId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky" />
            <h2 className="text-night font-semibold text-base">Saved Views</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {mode === 'list' && (
          <>
            <div className="flex-1 max-h-[60vh] overflow-y-auto">
              {/* My Views */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Views</span>
                  <button
                    onClick={() => setMode('create')}
                    className="flex items-center gap-1.5 text-xs text-sky hover:underline font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save current view
                  </button>
                </div>

                {myViews.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-4 bg-earth rounded-xl">
                    No saved views yet. Apply filters and save this view.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {myViews.map(view => (
                      <div
                        key={view.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${activeViewId === view.id
                            ? 'border-sky bg-pale'
                            : 'border-pebble hover:bg-earth'
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-night font-medium truncate">{view.name}</span>
                            {view.isShared && (
                              <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" title="Shared" />
                            )}
                            {!view.isShared && (
                              <Lock className="w-3 h-3 text-gray-300 flex-shrink-0" title="Private" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {[
                              view.filters.lifecycle.length > 0 && `${view.filters.lifecycle.length} lifecycle`,
                              view.filters.subtype.length > 0 && `${view.filters.subtype.length} subtype`,
                              view.filters.businessGroup.length > 0 && `${view.filters.businessGroup.length} BG`,
                              view.filters.geography.length > 0 && `${view.filters.geography.length} geo`,
                              view.filters.searchQuery && `"${view.filters.searchQuery.slice(0, 12)}..."`,
                            ].filter(Boolean).join(' · ') || 'No filters'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { onApplyView(view); handleClose(); }}
                            className="px-2.5 py-1 text-xs text-sky border border-sky rounded-lg hover:bg-pale transition-colors"
                          >
                            Apply
                          </button>
                          {confirmDeleteId === view.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { onDeleteView(view.id); setConfirmDeleteId(null); }}
                                className="px-2 py-1 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 text-xs text-gray-500 border border-pebble rounded-lg hover:bg-earth transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(view.id)}
                              className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Views */}
              {sharedViews.length > 0 && (
                <div className="px-5 pt-3 pb-4">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shared With Me</span>
                  </div>
                  <div className="space-y-1.5">
                    {sharedViews.map(view => (
                      <div
                        key={view.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${activeViewId === view.id ? 'border-sky bg-pale' : 'border-pebble hover:bg-earth'
                          }`}
                      >
                        <Share2 className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-night font-medium truncate">{view.name}</div>
                          <div className="text-xs text-gray-400">by {view.owner}</div>
                        </div>
                        <button
                          onClick={() => { onApplyView(view); handleClose(); }}
                          className="px-2.5 py-1 text-xs text-sky border border-sky rounded-lg hover:bg-pale transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-pebble flex justify-end">
              <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors">
                Close
              </button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">View name *</label>
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setNameError(''); }}
                placeholder="e.g. My High-Risk Proposed Assets"
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                autoFocus
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Visibility</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewShared(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${!newShared ? 'border-sky bg-pale text-sky' : 'border-pebble text-gray-600 hover:bg-earth'
                    }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Private
                </button>
                <button
                  onClick={() => setNewShared(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${newShared ? 'border-sky bg-pale text-sky' : 'border-pebble text-gray-600 hover:bg-earth'
                    }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Share with team
                </button>
              </div>
            </div>

            <div className="bg-earth rounded-xl p-3 space-y-1">
              <div className="text-xs font-medium text-gray-500 mb-2">Current filter snapshot</div>
              {currentFilters.lifecycle.length > 0 && (
                <div className="text-xs text-gray-600">Lifecycle: {currentFilters.lifecycle.join(', ')}</div>
              )}
              {currentFilters.subtype.length > 0 && (
                <div className="text-xs text-gray-600">Subtype: {currentFilters.subtype.join(', ')}</div>
              )}
              {currentFilters.businessGroup.length > 0 && (
                <div className="text-xs text-gray-600">BG: {currentFilters.businessGroup.join(', ')}</div>
              )}
              {currentFilters.geography.length > 0 && (
                <div className="text-xs text-gray-600">Geography: {currentFilters.geography.join(', ')}</div>
              )}
              {currentFilters.searchQuery && (
                <div className="text-xs text-gray-600">Search: "{currentFilters.searchQuery}"</div>
              )}
              {!currentFilters.lifecycle.length && !currentFilters.subtype.length && !currentFilters.businessGroup.length && !currentFilters.geography.length && !currentFilters.searchQuery && (
                <div className="text-xs text-gray-400">No active filters</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-pebble">
              <button
                onClick={() => { setMode('list'); setNewName(''); setNameError(''); }}
                className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
              >
                <Star className="w-4 h-4" /> Save View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
