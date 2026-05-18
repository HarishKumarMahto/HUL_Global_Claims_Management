import { useState } from 'react';
import {
  X, Bookmark, Save, Star, Share2, Trash2, Edit3,
  MoreHorizontal, Check, Users, Lock, Globe, Plus
} from 'lucide-react';
import type { ProductFilter } from './ProductFilterBar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductSavedView {
  id: string;
  name: string;
  description?: string;
  /** 'private' | 'shared-all' | 'shared-selected' */
  visibility: 'private' | 'shared-all' | 'shared-selected';
  sharedWith?: string[];
  columnOrder: string[];       // array of column ids in order
  filters: ProductFilter[];
  sortCol: string | null;
  sortDir: 'asc' | 'desc' | null;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
}

interface ProductSavedViewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current table state to save */
  currentColumnOrder: string[];
  currentFilters: ProductFilter[];
  currentSortCol: string | null;
  currentSortDir: 'asc' | 'desc' | null;
  /** When user selects a view to apply */
  onApplyView: (view: ProductSavedView) => void;
  savedViews: ProductSavedView[];
  onSavedViewsChange: (views: ProductSavedView[]) => void;
}

const MOCK_USERS = ['Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis', 'Lisa Anderson'];

const VISIBILITY_CONFIG = {
  private:         { icon: <Lock   className="w-3.5 h-3.5" />, label: 'Private',      color: 'bg-gray-100 text-gray-600' },
  'shared-all':    { icon: <Globe  className="w-3.5 h-3.5" />, label: 'All Users',    color: 'bg-blue-100 text-blue-700' },
  'shared-selected': { icon: <Users className="w-3.5 h-3.5" />, label: 'Selected Users', color: 'bg-purple-100 text-purple-700' },
};

// ─── Save / Share Dialog ──────────────────────────────────────────────────────

function SaveViewDialog({
  onSave,
  onCancel,
  isDirty,
}: {
  onSave: (name: string, desc: string, vis: ProductSavedView['visibility'], sharedWith: string[]) => void;
  onCancel: () => void;
  isDirty: boolean;
}) {
  const [name, setName]               = useState('');
  const [desc, setDesc]               = useState('');
  const [vis, setVis]                 = useState<ProductSavedView['visibility']>('private');
  const [sharedWith, setSharedWith]   = useState<string[]>([]);

  return (
    <div className="bg-pale/40 border border-sky/20 rounded-xl p-4 mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <Save className="w-4 h-4 text-sky" />
        <span className="text-sm text-night font-semibold">Save Current View As</span>
        {isDirty && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Unsaved changes
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
          View Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Active Dove Formats"
          className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Description</label>
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Optional description..."
          className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
        />
      </div>

      {/* Visibility (US-M3-030) */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">Share With</label>
        <div className="space-y-2">
          {(
            [
              ['private',          'Private (only me)'],
              ['shared-all',       'All users'],
              ['shared-selected',  'Selected users'],
            ] as [ProductSavedView['visibility'], string][]
          ).map(([v, label]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setVis(v)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  vis === v ? 'border-sky' : 'border-gray-300'
                }`}
              >
                {vis === v && <div className="w-2 h-2 rounded-full bg-sky" />}
              </div>
              <span className="text-sm text-night">{label}</span>
            </label>
          ))}
        </div>

        {/* Selected users picker */}
        {vis === 'shared-selected' && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MOCK_USERS.map(u => {
              const on = sharedWith.includes(u);
              return (
                <button
                  key={u}
                  onClick={() =>
                    setSharedWith(prev =>
                      on ? prev.filter(x => x !== u) : [...prev, u]
                    )
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    on ? 'border-sky bg-pale text-sky' : 'border-pebble text-gray-600 hover:border-sky/40'
                  }`}
                >
                  {on && <Check className="w-2.5 h-2.5" />}
                  {u}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => name.trim() && onSave(name.trim(), desc.trim(), vis, sharedWith)}
          disabled={!name.trim()}
          className="px-4 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save View
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ProductSavedViewsPanel({
  isOpen,
  onClose,
  currentColumnOrder,
  currentFilters,
  currentSortCol,
  currentSortDir,
  onApplyView,
  savedViews,
  onSavedViewsChange,
}: ProductSavedViewsPanelProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeMenu,     setActiveMenu]     = useState<string | null>(null);
  const [renaming,       setRenaming]       = useState<string | null>(null);
  const [renameVal,      setRenameVal]      = useState('');
  const [activeTab,      setActiveTab]      = useState<'all' | 'mine' | 'shared'>('all');

  if (!isOpen) return null;

  // ── CRUD helpers ────────────────────────────────────────────────────────────

  const handleSave = (
    name: string,
    desc: string,
    vis: ProductSavedView['visibility'],
    sharedWith: string[]
  ) => {
    const newView: ProductSavedView = {
      id: String(Date.now()),
      name,
      description: desc || undefined,
      visibility: vis,
      sharedWith: vis === 'shared-selected' ? sharedWith : undefined,
      columnOrder: currentColumnOrder,
      filters: currentFilters,
      sortCol: currentSortCol,
      sortDir: currentSortDir,
      createdBy: 'Sarah Johnson',
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSavedViewsChange([newView, ...savedViews]);
    setShowSaveDialog(false);
  };

  const handleDelete = (id: string) => {
    onSavedViewsChange(savedViews.filter(v => v.id !== id));
    setActiveMenu(null);
  };

  const handleSetDefault = (id: string) => {
    onSavedViewsChange(savedViews.map(v => ({ ...v, isDefault: v.id === id })));
    setActiveMenu(null);
  };

  const handleRenameConfirm = (id: string) => {
    if (!renameVal.trim()) { setRenaming(null); return; }
    onSavedViewsChange(savedViews.map(v => v.id === id ? { ...v, name: renameVal.trim() } : v));
    setRenaming(null);
  };

  // ── Filter tabs ─────────────────────────────────────────────────────────────

  const filtered = savedViews.filter(v => {
    if (activeTab === 'mine')   return v.createdBy === 'Sarah Johnson';
    if (activeTab === 'shared') return v.visibility !== 'private';
    return true;
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-base font-semibold">Saved Views</h2>
              <p className="text-xs text-gray-400 mt-0.5">Product table views</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-pebble flex-shrink-0">
          {(['all', 'mine', 'shared'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab ? 'border-sky text-sky' : 'border-transparent text-gray-500 hover:text-night'
              }`}
            >
              {tab === 'all' ? 'All Views' : tab === 'mine' ? 'My Views' : 'Shared'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Save dialog */}
          {showSaveDialog && (
            <SaveViewDialog
              isDirty={currentFilters.length > 0}
              onSave={handleSave}
              onCancel={() => setShowSaveDialog(false)}
            />
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Bookmark className="w-10 h-10 mb-3 opacity-25" />
              <p className="text-sm">No saved views yet</p>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="mt-3 flex items-center gap-1.5 text-sm text-sky hover:text-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Save current view
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(view => {
                const visCfg = VISIBILITY_CONFIG[view.visibility];
                return (
                  <div
                    key={view.id}
                    className="group flex items-center gap-3 p-3.5 border border-pebble rounded-xl hover:border-sky hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => renaming !== view.id && onApplyView(view)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {renaming === view.id ? (
                          <input
                            type="text"
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRenameConfirm(view.id);
                              if (e.key === 'Escape') setRenaming(null);
                            }}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                            className="text-sm text-night px-2 py-0.5 border border-sky rounded focus:outline-none flex-1 max-w-[200px]"
                          />
                        ) : (
                          <span className="text-sm text-night font-medium truncate">{view.name}</span>
                        )}
                        {view.isDefault && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                        )}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${visCfg.color}`}>
                          {visCfg.icon}
                          {visCfg.label}
                        </span>
                      </div>
                      {view.description && (
                        <p className="text-xs text-gray-400 truncate">{view.description}</p>
                      )}
                      {/* Metadata chips */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {view.filters.length > 0 && (
                          <span className="text-xs bg-pale text-sky px-2 py-0.5 rounded">
                            {view.filters.length} filter{view.filters.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {view.sortCol && (
                          <span className="text-xs bg-earth text-gray-500 px-2 py-0.5 rounded">
                            ↕ {view.sortCol}
                          </span>
                        )}
                        {view.columnOrder.length > 0 && (
                          <span className="text-xs bg-earth text-gray-500 px-2 py-0.5 rounded">
                            {view.columnOrder.length} cols
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-1">{view.createdAt}</span>
                      </div>
                    </div>

                    {/* Row action menu */}
                    <div
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === view.id ? null : view.id)}
                          className="p-1.5 hover:bg-earth rounded-lg"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {activeMenu === view.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                              <button
                                onClick={() => handleSetDefault(view.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth"
                              >
                                <Star className="w-3.5 h-3.5 text-gray-400" />
                                Set as Default
                              </button>
                              <button
                                onClick={() => { setRenaming(view.id); setRenameVal(view.name); setActiveMenu(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                Rename
                              </button>
                              <button
                                onClick={() => setActiveMenu(null)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth"
                              >
                                <Share2 className="w-3.5 h-3.5 text-gray-400" />
                                Share
                              </button>
                              <div className="border-t border-pebble" />
                              <button
                                onClick={() => handleDelete(view.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-shrink-0 bg-earth/30">
          <button onClick={onClose} className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth">
            Close
          </button>
          <button
            onClick={() => setShowSaveDialog(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              showSaveDialog
                ? 'bg-sky text-white hover:bg-dark'
                : 'border border-sky text-sky hover:bg-pale'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Current View
          </button>
        </div>
      </div>
    </div>
  );
}
