import React, { useState } from 'react';
import { FileText, FileSpreadsheet, File, MoreHorizontal, ExternalLink, GitBranch, Trash2, Archive } from 'lucide-react';
import type { DocumentRecord } from './documentsData';
import { canCreateNewVersion } from './documentsData';

interface DocumentsTableProps {
  documents: DocumentRecord[];
  onDocumentClick: (doc: DocumentRecord) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}



function FileIcon({ fileType }: { fileType?: string }) {
  const type = (fileType || '').toUpperCase();
  if (['PDF'].includes(type)) return <FileText className="w-4 h-4 text-red-400" />;
  if (['XLSX', 'CSV', 'XLS'].includes(type)) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentsTable({
  documents,
  onDocumentClick,
  selectedIds,
  onSelectionChange,
}: DocumentsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    onSelectionChange(selectedIds.length === documents.length ? [] : documents.map(d => d.id));
  };

  if (documents.length === 0) {
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
    <div className="flex-1 overflow-auto no-scrollbar">
      <table className="w-full border-collapse" style={{ minWidth: "1000px" }}>
        <thead className="bg-earth sticky top-0 z-10">
          <tr className="border-b border-gray-300">
            <th className="px-4 py-3 w-10 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === documents.length && documents.length > 0}
                onChange={toggleAll}
                className="rounded border-gray-300 text-sky focus:ring-sky"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Name</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Subtype / CUC</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Lifecycle</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Version</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Geography</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Valid To</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Created By</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase tracking-wide">Modified</th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pebble">
          {documents.map(doc => {
            const currentVer = doc.versions.find(v => v.versionNumber === doc.currentVersion);
            const isSelected = selectedIds.includes(doc.id);
            const isExpiringSoon = doc.validToDate
              ? (new Date(doc.validToDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000
              : false;
            const isReadOnly = ['Cancelled', 'Expired', 'Obsolete', 'Withdrawn'].includes(doc.lifecycleState);

            return (
              <tr
                key={doc.id}
                onClick={() => onDocumentClick(doc)}
                className={`group cursor-pointer transition-colors ${isSelected ? 'bg-pale' : 'hover:bg-earth/50'} ${isReadOnly ? 'opacity-75' : ''}`}
              >
                <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(doc.id); }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(doc.id)}
                    className="rounded border-gray-300 text-sky focus:ring-sky"
                  />
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileIcon fileType={currentVer?.fileType} />
                    <div>
                      <div className="font-medium text-night group-hover:text-sky transition-colors truncate max-w-[220px]" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{doc.id}</div>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {doc.documentType}
                </td>

                {/* Subtype / CUC */}
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                  {doc.subtype || doc.cucSpecNumber || '—'}
                </td>

                {/* Lifecycle */}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {doc.lifecycleState}
                  {isExpiringSoon && doc.lifecycleState === 'In Use' && (
                    <span className="ml-2 text-[9px] text-orange-500 font-semibold">⚠ Expiring soon</span>
                  )}
                </td>

                {/* Version */}
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                  v{doc.currentVersion}
                  {doc.versions.length > 1 && (
                    <span className="ml-1 text-[9px] text-gray-400">({doc.versions.length} vers.)</span>
                  )}
                </td>

                {/* Geography */}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {(doc.geography || []).join(', ')}
                </td>

                {/* Valid To */}
                <td className="px-4 py-3 text-xs text-gray-500">
                  {doc.validToDate ? (
                    <span className={isExpiringSoon ? 'text-orange-600 font-semibold' : ''}>
                      {formatDate(doc.validToDate)}
                    </span>
                  ) : '—'}
                </td>

                {/* Created By */}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {doc.createdBy}
                </td>

                {/* Modified */}
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(doc.modifiedDate)}</td>

                {/* Actions menu */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      className="p-1.5 rounded-lg hover:bg-earth text-gray-400 hover:text-night transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === doc.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 min-w-[180px] overflow-hidden">
                          <button
                            onClick={() => { onDocumentClick(doc); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-sky" /> View Details
                          </button>
                          {canCreateNewVersion(doc) && (
                            <button
                              onClick={() => { setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors"
                            >
                              <GitBranch className="w-4 h-4 text-sky" /> Create New Version
                            </button>
                          )}
                          {!isReadOnly && (
                            <button
                              onClick={() => { setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-earth transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Cancel Document
                            </button>
                          )}
                          {isReadOnly && (
                            <button
                              onClick={() => { setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-earth transition-colors"
                            >
                              <Archive className="w-4 h-4" /> Archive
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
