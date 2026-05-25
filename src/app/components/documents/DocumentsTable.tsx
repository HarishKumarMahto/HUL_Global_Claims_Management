import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, FileSpreadsheet, File, MoreHorizontal, ExternalLink, GitBranch,
  Trash2, Archive, Check, GripVertical, Eye, EyeOff, Download, RotateCcw,
  Search, Settings, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical
} from 'lucide-react';
import type { DocumentRecord } from './documentsData';
import { canCreateNewVersion } from './documentsData';
import { TableState, ColumnConfig } from '../../types';
import { TablePagination, formatDate as formatTableDate } from '../ui/tableUtils';

interface DocumentsTableProps {
  documents: DocumentRecord[];
  onDocumentClick: (doc: DocumentRecord) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  savedState?: TableState;
  onStateChange?: (state: TableState) => void;
  onExport?: (format: "pdf" | "excel" | "word" | "csv") => void; // Optional if we want to handle outside
}

type SortDirection = "asc" | "desc" | null;
type SortableColumn = keyof DocumentRecord;

const defaultColumnOrder: ColumnConfig[] = [
  { id: "favorite", label: "", width: 48, visible: true },
  { id: "name", label: "Name", sortKey: "name", width: 250, visible: true },
  { id: "documentType", label: "Type", sortKey: "documentType", width: 180, visible: true },
  { id: "subtype", label: "Subtype / CUC", sortKey: "subtype", width: 160, visible: true },
  { id: "lifecycleState", label: "Lifecycle", sortKey: "lifecycleState", width: 140, visible: true },
  { id: "currentVersion", label: "Version", sortKey: "currentVersion", width: 100, visible: true },
  { id: "geography", label: "Geography", sortKey: "geography", width: 150, visible: true },
  { id: "validToDate", label: "Valid To", sortKey: "validToDate", width: 120, visible: true },
  { id: "createdBy", label: "Created By", sortKey: "createdBy", width: 150, visible: true },
  { id: "modifiedDate", label: "Modified", sortKey: "modifiedDate", width: 120, visible: true },
  { id: "actions", label: "", width: 48, visible: true }
];

function FileIcon({ fileType }: { fileType?: string }) {
  const type = (fileType || '').toUpperCase();
  if (['PDF'].includes(type)) return <FileText className="w-4 h-4 text-red-400" />;
  if (['XLSX', 'CSV', 'XLS'].includes(type)) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ColumnConfigPanel({
  columns,
  onToggle,
  onRestore,
  onClose,
  onExport,
}: {
  columns: ColumnConfig[];
  onToggle: (id: string) => void;
  onRestore: () => void;
  onClose: () => void;
  onExport: (format: "pdf" | "excel" | "word" | "csv") => void;
}) {
  const configurableColumns = columns.filter(c => c.id !== "favorite" && c.id !== "actions");
  const visibleCount = configurableColumns.filter(c => c.visible !== false).length;
  
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-64 overflow-hidden">
        <div className="px-4 py-3 border-b border-pebble flex items-center justify-between">
          <span className="text-sm text-night" style={{ fontWeight: 600 }}>Configure Columns</span>
          <span className="text-xs text-gray-400">{visibleCount} of {configurableColumns.length} visible</span>
        </div>
        <div className="p-2 max-h-56 overflow-y-auto">
          {configurableColumns.map((col) => {
            const isVisible = col.visible !== false;
            return (
              <button
                key={col.id}
                onClick={() => onToggle(col.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth transition-colors text-left"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isVisible ? "bg-sky border-sky" : "border-gray-300"}`}>
                  {isVisible && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-sm text-night">{col.label}</span>
                <span className="ml-auto">
                  {isVisible ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-pebble bg-earth/30">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Export Table</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Excel", format: "excel", color: "text-green-600 hover:bg-green-50 hover:border-green-300" },
              { label: "CSV", format: "csv", color: "text-blue-600 hover:bg-blue-50 hover:border-blue-300" },
              { label: "PDF", format: "pdf", color: "text-red-600 hover:bg-red-50 hover:border-red-300" },
              { label: "Word", format: "word", color: "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onExport(item.format as any)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 border border-pebble rounded-lg text-xs font-medium transition-colors bg-white ${item.color}`}
              >
                <Download className="w-3 h-3 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-pebble flex items-center gap-2 bg-white">
          <button onClick={onRestore} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors px-2 py-1 rounded hover:bg-earth">
            <RotateCcw className="w-3 h-3" /> Restore
          </button>
          <button onClick={onClose} className="ml-auto px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors font-medium">
            Done
          </button>
        </div>
      </div>
    </>
  );
}

export default function DocumentsTable({
  documents,
  onDocumentClick,
  selectedIds,
  onSelectionChange,
  savedState,
  onStateChange
}: DocumentsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Table state
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>((savedState?.sortColumn as SortableColumn | null) || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(savedState?.sortDirection || null);
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);
  const [columnOrder, setColumnOrder] = useState<ColumnConfig[]>(savedState?.columnOrder?.length ? savedState.columnOrder : defaultColumnOrder);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(savedState?.columnWidths || {});
  
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [colCheckboxes, setColCheckboxes] = useState<Record<string, string[]>>({});
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const itemsPerPage = 12;

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ sortColumn, sortDirection, currentPage, columnOrder, columnWidths });
    }
  }, [sortColumn, sortDirection, currentPage, columnOrder, columnWidths, onStateChange]);

  const toggleSelect = (id: string) => {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id]);
  };

  const toggleAll = () => {
    onSelectionChange(selectedIds.length === paginatedDocs.length && paginatedDocs.length > 0 ? [] : paginatedDocs.map(d => d.id));
  };

  const handleSort = (key: SortableColumn) => {
    if (sortColumn === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getFilteredDocs = () => {
    let filtered = documents;
    
    // Column search
    filtered = filtered.filter(doc => {
      const searchPassed = Object.entries(colSearch).every(([colId, query]) => {
        if (!query) return true;
        const q = query.toLowerCase();
        let val = "";
        switch (colId) {
          case "name": val = doc.name; break;
          case "documentType": val = doc.documentType; break;
          case "subtype": val = doc.subtype || doc.cucSpecNumber || ""; break;
          case "lifecycleState": val = doc.lifecycleState; break;
          case "geography": val = (doc.geography || []).join(", "); break;
          case "createdBy": val = doc.createdBy; break;
        }
        return val.toLowerCase().includes(q);
      });

      const checkboxesPassed = Object.entries(colCheckboxes).every(([colId, selectedList]) => {
        if (!selectedList || selectedList.length === 0) return true;
        let val = "";
        switch (colId) {
          case "documentType": val = doc.documentType; break;
          case "lifecycleState": val = doc.lifecycleState; break;
          case "geography": 
            return selectedList.some(g => (doc.geography || []).includes(g));
        }
        return selectedList.includes(val);
      });
      return searchPassed && checkboxesPassed;
    });

    // Sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortColumn];
        let bVal: any = b[sortColumn];
        if (sortColumn === "subtype") {
          aVal = a.subtype || a.cucSpecNumber || "";
          bVal = b.subtype || b.cucSpecNumber || "";
        } else if (sortColumn === "geography") {
          aVal = (a.geography || []).join(", ");
          bVal = (b.geography || []).join(", ");
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredDocs = getFilteredDocs();
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDocs = filteredDocs.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleExport = (format: "pdf" | "excel" | "word" | "csv") => {
    // Basic export logic matching the original
    const list = getFilteredDocs();
    const activeCols = columnOrder.filter(c => c.visible !== false && c.id !== "favorite" && c.id !== "actions");
    const headers = activeCols.map(col => col.label);
    
    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...list.map(p => activeCols.map(col => {
          let val = "";
          switch (col.id) {
            case "name": val = p.name; break;
            case "documentType": val = p.documentType; break;
            case "subtype": val = p.subtype || p.cucSpecNumber || ""; break;
            case "lifecycleState": val = p.lifecycleState; break;
            case "currentVersion": val = p.currentVersion; break;
            case "geography": val = (p.geography || []).join(", "); break;
            case "validToDate": val = formatDate(p.validToDate); break;
            case "createdBy": val = p.createdBy; break;
            case "modifiedDate": val = formatDate(p.modifiedDate); break;
          }
          return `"${val}"`;
        }).join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `documents_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // Excel, PDF, Word omitted for brevity, but same pattern as ProjectTable
  };

  const visibleColumns = columnOrder.filter(c => c.visible !== false);

  if (documents.length === 0 && Object.keys(colSearch).length === 0 && Object.keys(colCheckboxes).length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">No documents found</p>
          <p className="text-xs text-gray-300 mt-1">Try adjusting filters or upload a new document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Top Toolbar inner */}
      <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">{selectedIds.length} selected</span>
              <button
                onClick={() => onSelectionChange([])}
                className="text-xs text-gray-500 hover:text-night transition-colors"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium ml-1">Documents Library</span>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
          {selectedIds.length > 0 && (
            <button
              className="px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium shadow-sm flex items-center gap-1.5"
            >
              <MoreHorizontal className="w-3.5 h-3.5" /> Bulk Actions
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setColumnConfigOpen(!columnConfigOpen)}
              className="p-1.5 rounded hover:bg-earth text-gray-500 transition-colors flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {columnConfigOpen && (
              <ColumnConfigPanel
                columns={columnOrder}
                onToggle={(id) => {
                  setColumnOrder(prev => prev.map(c => c.id === id ? { ...c, visible: c.visible === false ? true : false } : c));
                }}
                onRestore={() => setColumnOrder(defaultColumnOrder)}
                onClose={() => setColumnConfigOpen(false)}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full border-collapse" style={{ minWidth: "1000px" }}>
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {visibleColumns.map((col, index) => {
                const width = columnWidths[col.id] || col.width;
                if (col.id === "favorite") {
                  return (
                    <th key={col.id} style={{ width }} className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedDocs.length && paginatedDocs.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-sky focus:ring-sky"
                      />
                    </th>
                  );
                }
                if (col.id === "actions") {
                  return <th key={col.id} style={{ width }} className="px-4 py-3 w-12 text-left"></th>;
                }

                // Header with search/filter and sorting
                return (
                  <th 
                    key={col.id} 
                    style={{ width }} 
                    className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide relative group select-none"
                    draggable
                    onDragStart={(e) => {
                      setDraggedColumn(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedColumn === null || draggedColumn === index) return;
                      const newOrder = [...columnOrder];
                      const draggedItem = newOrder.splice(draggedColumn, 1)[0];
                      newOrder.splice(index, 0, draggedItem);
                      setColumnOrder(newOrder);
                      setDraggedColumn(null);
                    }}
                  >
                    <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleSort(col.sortKey as SortableColumn)}>
                      <span>{col.label}</span>
                      {sortColumn === col.sortKey && sortDirection === "asc" && <ArrowUp className="w-3 h-3 text-sky" />}
                      {sortColumn === col.sortKey && sortDirection === "desc" && <ArrowDown className="w-3 h-3 text-sky" />}
                      {sortColumn !== col.sortKey && <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />}
                      
                      {/* Search icon */}
                      <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setActiveHeaderDropdown(activeHeaderDropdown === col.id ? null : col.id)} className="p-1 rounded hover:bg-white text-gray-400">
                          <Search className="w-3 h-3" />
                        </button>
                        {activeHeaderDropdown === col.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-pebble rounded shadow-lg p-2 z-30 w-48 font-normal normal-case tracking-normal">
                             <input 
                               type="text" 
                               autoFocus
                               placeholder={`Search ${col.label}...`}
                               value={colSearch[col.id] || ''}
                               onChange={(e) => {
                                 setColSearch(prev => ({...prev, [col.id]: e.target.value}));
                                 setCurrentPage(1);
                               }}
                               className="w-full px-2 py-1 border border-pebble rounded text-sm focus:outline-none focus:border-sky"
                             />
                             <div className="flex justify-end mt-2">
                               <button onClick={() => setActiveHeaderDropdown(null)} className="text-xs text-sky">Close</button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-pebble">
            {paginatedDocs.map(doc => {
              const currentVer = doc.versions.find(v => v.versionNumber === doc.currentVersion);
              const isSelected = selectedIds.includes(doc.id);
              const isExpiringSoon = doc.validToDate ? (new Date(doc.validToDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000 : false;
              const isReadOnly = ['Cancelled', 'Expired', 'Obsolete', 'Withdrawn'].includes(doc.lifecycleState);

              return (
                <tr
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className={`group cursor-pointer transition-colors ${isSelected ? 'bg-pale' : 'hover:bg-earth/50'} ${isReadOnly ? 'opacity-75' : ''}`}
                >
                  {visibleColumns.map(col => {
                    if (col.id === "favorite") {
                      return (
                        <td key={col.id} className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(doc.id); }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(doc.id)} className="rounded border-gray-300 text-sky focus:ring-sky" />
                        </td>
                      );
                    }
                    if (col.id === "actions") {
                      return (
                        <td key={col.id} className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="relative">
                            <button onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)} className="p-1.5 rounded-lg hover:bg-earth text-gray-400 hover:text-night transition-colors opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenuId === doc.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 min-w-[180px] overflow-hidden">
                                  <button onClick={() => { onDocumentClick(doc); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                                    <ExternalLink className="w-4 h-4 text-sky" /> View Details
                                  </button>
                                  {canCreateNewVersion(doc) && (
                                    <button onClick={() => { setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                                      <GitBranch className="w-4 h-4 text-sky" /> Create New Version
                                    </button>
                                  )}
                                  {!isReadOnly && (
                                    <button onClick={() => { setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-earth transition-colors">
                                      <Trash2 className="w-4 h-4" /> Cancel Document
                                    </button>
                                  )}
                                  {isReadOnly && (
                                    <button onClick={() => { setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-earth transition-colors">
                                      <Archive className="w-4 h-4" /> Archive
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Data columns
                    return (
                      <td key={col.id} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {col.id === "name" && (
                          <div className="flex items-center gap-2">
                            <FileIcon fileType={currentVer?.fileType} />
                            <div>
                              <div className="font-medium text-night group-hover:text-sky transition-colors truncate max-w-[220px]" title={doc.name}>{doc.name}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{doc.id}</div>
                            </div>
                          </div>
                        )}
                        {col.id === "documentType" && doc.documentType}
                        {col.id === "subtype" && <span className="truncate max-w-[140px] inline-block">{doc.subtype || doc.cucSpecNumber || '—'}</span>}
                        {col.id === "lifecycleState" && (
                          <>
                            {doc.lifecycleState}
                            {isExpiringSoon && doc.lifecycleState === 'In Use' && <span className="ml-2 text-[9px] text-orange-500 font-semibold">⚠ Expiring soon</span>}
                          </>
                        )}
                        {col.id === "currentVersion" && (
                          <span className="font-mono text-xs">v{doc.currentVersion} {doc.versions.length > 1 && <span className="text-[9px] text-gray-400">({doc.versions.length} vers.)</span>}</span>
                        )}
                        {col.id === "geography" && (doc.geography || []).join(', ')}
                        {col.id === "validToDate" && (
                          doc.validToDate ? <span className={isExpiringSoon ? 'text-orange-600 font-semibold' : ''}>{formatDate(doc.validToDate)}</span> : '—'
                        )}
                        {col.id === "createdBy" && doc.createdBy}
                        {col.id === "modifiedDate" && <span className="text-gray-400">{formatDate(doc.modifiedDate)}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer - moved inside the table component for better encapsulation */}
      {filteredDocs.length > 0 && (
        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          totalRecords={filteredDocs.length}
          startIndex={(safePage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          label="documents"
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          onPageSelect={setCurrentPage}
        />
      )}
    </div>
  );
}
