import React, { useState, useEffect } from 'react';
import {
  Plus, Search, X, ChevronDown, ChevronUp, Check,
  MoreHorizontal, ChevronLeft, ChevronRight, Upload,
  FileText, FolderOpen, Layers
} from 'lucide-react';
import type { DocumentRecord, DocumentType, DocumentLifecycle } from './documentsData';
import { CURRENT_USER } from '../../types';
import DocumentsTable from './DocumentsTable';
import UploadDocumentModal from './UploadDocumentModal';
import { TablePagination } from '../ui/tableUtils';

const DOC_TYPE_OPTIONS: DocumentType[] = ['Substantiation Evidence', 'Formulation Document', 'Project Document'];
const LIFECYCLE_OPTIONS: DocumentLifecycle[] = ['Draft', 'In Use', 'Created', 'Expired', 'Cancelled', 'Withdrawn', 'Obsolete'];
const GEO_OPTIONS = ['Global', 'EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'];

function QuickFilterDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors whitespace-nowrap ${
          selected.length > 0
            ? 'border-sky bg-pale text-sky font-medium'
            : 'border-pebble text-gray-600 hover:border-sky hover:bg-earth'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-sky text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selected.length}</span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 min-w-[200px] overflow-hidden">
            <div className="px-3 py-2 border-b border-pebble flex items-center justify-between">
              <span className="text-xs font-semibold text-night">{label}</span>
              {selected.length > 0 && (
                <button onClick={() => { onClear(); setOpen(false); }} className="text-xs text-sky hover:underline">Clear</button>
              )}
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    selected.includes(opt) ? 'bg-pale text-sky' : 'text-gray-700 hover:bg-earth'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(opt) ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                    {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DocumentsModuleProps {
  documents: DocumentRecord[];
  onDocumentsChange: (docs: DocumentRecord[]) => void;
  activeLibraryView: string;
  onLibraryViewChange: (view: string) => void;
  onDocumentClick: (doc: DocumentRecord) => void;
}

export default function DocumentsModule({
  documents,
  onDocumentsChange,
  activeLibraryView,
  onLibraryViewChange,
  onDocumentClick,
}: DocumentsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const [typeFilter, setTypeFilter] = useState<DocumentType[]>([]);
  const [lifecycleFilter, setLifecycleFilter] = useState<DocumentLifecycle[]>([]);
  const [geoFilter, setGeoFilter] = useState<string[]>([]);

  // Reset page on filter/view change
  useEffect(() => { setCurrentPage(1); }, [activeLibraryView, typeFilter, lifecycleFilter, geoFilter, searchQuery]);

  // ─── View Filtering (US-M16-F01) ─────────────────────────────────────────
  const viewFilteredDocs = documents.filter(doc => {
    if (doc.isArchived) return false; // hide archived unless toggle shown
    if (activeLibraryView === 'My Documents') {
      return doc.createdBy === CURRENT_USER || doc.createdBy.toLowerCase().includes('sarah');
    }
    if (activeLibraryView === 'Substantiation Evidence') return doc.documentType === 'Substantiation Evidence';
    if (activeLibraryView === 'Formulation Documents') return doc.documentType === 'Formulation Document';
    if (activeLibraryView === 'Project Documents') return doc.documentType === 'Project Document';
    return true; // All Documents
  });

  // ─── Additional Filters ───────────────────────────────────────────────────
  const filteredDocs = viewFilteredDocs.filter(doc => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchLower) ||
      doc.id.toLowerCase().includes(searchLower) ||
      (doc.subtype ?? '').toLowerCase().includes(searchLower) ||
      (doc.cucSpecNumber ?? '').toLowerCase().includes(searchLower) ||
      doc.createdBy.toLowerCase().includes(searchLower);

    const matchesType = typeFilter.length === 0 || typeFilter.includes(doc.documentType);
    const matchesLifecycle = lifecycleFilter.length === 0 || lifecycleFilter.includes(doc.lifecycleState as DocumentLifecycle);
    const matchesGeo = geoFilter.length === 0 || geoFilter.some(g => doc.geography.includes(g));

    return matchesSearch && matchesType && matchesLifecycle && matchesGeo;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDocs = filteredDocs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilterCount = typeFilter.length + lifecycleFilter.length + geoFilter.length;

  const clearAllFilters = () => {
    setTypeFilter([]);
    setLifecycleFilter([]);
    setGeoFilter([]);
    setSearchQuery('');
  };

  const getPageHeading = () => {
    if (activeLibraryView === 'My Documents') return 'My Documents';
    if (activeLibraryView === 'Substantiation Evidence') return 'Substantiation Evidence';
    if (activeLibraryView === 'Formulation Documents') return 'Formulation Documents';
    if (activeLibraryView === 'Project Documents') return 'Project Documents';
    return 'All Documents';
  };

  const getViewIcon = () => {
    if (activeLibraryView === 'Substantiation Evidence') return <FileText className="w-5 h-5 text-sky-600" />;
    if (activeLibraryView === 'Formulation Documents') return <Layers className="w-5 h-5 text-violet-600" />;
    if (activeLibraryView === 'Project Documents') return <FolderOpen className="w-5 h-5 text-amber-600" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Page Header matching Projects */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 relative">
            <h1 className="text-night flex items-center gap-2">
              {getPageHeading()}
            </h1>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Toolbar: Search + Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Quick Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <QuickFilterDropdown<DocumentType>
              label="Document Type"
              options={DOC_TYPE_OPTIONS}
              selected={typeFilter}
              onToggle={v => setTypeFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setTypeFilter([])}
            />
            <QuickFilterDropdown<DocumentLifecycle>
              label="Lifecycle"
              options={LIFECYCLE_OPTIONS}
              selected={lifecycleFilter}
              onToggle={v => setLifecycleFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setLifecycleFilter([])}
            />
            <QuickFilterDropdown<string>
              label="Geography"
              options={GEO_OPTIONS}
              selected={geoFilter}
              onToggle={v => setGeoFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setGeoFilter([])}
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-5 overflow-hidden flex flex-col gap-3">
        <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
          {/* Active filter chips row */}
          {(typeFilter.length > 0 || lifecycleFilter.length > 0 || geoFilter.length > 0) && (
            <div className="px-4 py-2 bg-earth/30 border-b border-pebble flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium mr-1">Active filters:</span>
                {typeFilter.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                    <span className="text-gray-400 font-normal">Type:</span>
                    <span>{typeFilter.join(", ")}</span>
                    <button onClick={() => setTypeFilter([])} className="hover:text-red-500 ml-1 text-gray-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
                {lifecycleFilter.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                    <span className="text-gray-400 font-normal">Lifecycle:</span>
                    <span>{lifecycleFilter.join(", ")}</span>
                    <button onClick={() => setLifecycleFilter([])} className="hover:text-red-500 ml-1 text-gray-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
                {geoFilter.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                    <span className="text-gray-400 font-normal">Geography:</span>
                    <span>{geoFilter.join(", ")}</span>
                    <button onClick={() => setGeoFilter([])} className="hover:text-red-500 ml-1 text-gray-400 transition-colors"><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
              </div>
              <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold px-2 py-1 hover:bg-red-50 rounded-lg mr-1">
                Clear all
              </button>
            </div>
          )}

          {/* Top Toolbar inner */}
          <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {selectedIds.length > 0 ? (
                <>
                  <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">{selectedIds.length} of {filteredDocs.length} selected</span>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-gray-500 hover:text-night transition-colors"
                  >
                    Clear selection
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-600 font-medium ml-1">Documents Library</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {selectedIds.length > 0 && (
                <button
                  className="px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium shadow-sm flex items-center gap-1.5"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" /> Bulk Actions
                </button>
              )}
            </div>
          </div>

          {/* Table Area */}
          <DocumentsTable
            documents={paginatedDocs}
            onDocumentClick={onDocumentClick}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {/* Pagination Footer */}
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            totalRecords={filteredDocs.length}
            startIndex={(safePage - 1) * PAGE_SIZE}
            itemsPerPage={PAGE_SIZE}
            label="documents"
            onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            onPageSelect={setCurrentPage}
          />
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onCreate={(doc) => {
            onDocumentsChange([doc, ...documents]);
            setIsUploadModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
