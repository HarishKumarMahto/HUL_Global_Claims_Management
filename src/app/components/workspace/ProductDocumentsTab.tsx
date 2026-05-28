import { useState } from 'react';
import {
  Plus, Search, Download, Trash2, X, Check, FileText, Upload, AlertCircle, GripVertical
} from 'lucide-react';
import type { Project } from '../../types';
import type { DocumentRecord } from '../documents/documentsData';
import DocumentLifecycleBadge from '../documents/DocumentLifecycleBadge';

interface ProductDocumentsTabProps {
  project: Project;
  documents: DocumentRecord[];
  onDocumentChange: (doc: DocumentRecord) => void;
  onDocumentAdd: (doc: DocumentRecord) => void;
}

interface AddDocumentFormData {
  documentName: string;
  description: string;
  file: File | null;
}

const BASE_COLUMNS = [
  { id: 'name', label: 'Document Name', width: '30%', visible: true },
  { id: 'description', label: 'Description', width: '30%', visible: true },
  { id: 'lifecycle', label: 'Lifecycle', width: '12%', visible: true },
  { id: 'uploadedBy', label: 'Uploaded By', width: '15%', visible: true },
  { id: 'uploadedOn', label: 'Uploaded On', width: '13%', visible: true },
];

export default function ProductDocumentsTab({
  project,
  documents,
  onDocumentChange,
  onDocumentAdd
}: ProductDocumentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddDocumentFormData>({
    documentName: '',
    description: '',
    file: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null);

  // Mock current user - in real app, this would come from auth context
  const currentUser = 'Sarah Johnson';

  const handleColDragStart = (i: number) => setDraggedCol(i);
  const handleColDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedCol === null || draggedCol === i) return;
    const next = [...columnOrder];
    const [item] = next.splice(draggedCol, 1);
    next.splice(i, 0, item);
    setColumnOrder(next);
    setDraggedCol(i);
  };
  const handleColDragEnd = () => setDraggedCol(null);

  const filtered = documents.filter(d => 
    d.documentType === 'Project Document' && 
    d.linkedProjectIds?.includes(project.id) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        documentName: prev.documentName || file.name.replace(/\.[^/.]+$/, '')
      }));
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Document name is required';
    }

    if (!formData.file) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDocument = () => {
    if (!validateForm()) return;
    if (!formData.file) return;

    const newDoc: DocumentRecord = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      documentType: 'Project Document',
      name: formData.documentName,
      description: formData.description,
      currentVersion: '1.0',
      versions: [
        {
          versionNumber: '1.0',
          lifecycleState: 'In Use',
          fileName: formData.file.name,
          fileSizeBytes: formData.file.size,
          fileType: formData.file.name.split('.').pop() || 'unknown',
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser
        }
      ],
      lifecycleState: 'In Use',
      createdBy: currentUser,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      geography: [],
      comments: [],
      linkedProjectIds: [project.id]
    };

    onDocumentAdd(newDoc);
    setShowAddForm(false);
    setFormData({ documentName: '', description: '', file: null });
    setErrors({});
  };

  const handleDeleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    const newLinkedProjectIds = (doc.linkedProjectIds || []).filter(pid => pid !== project.id);
    const newLifecycle = newLinkedProjectIds.length === 0 ? 'Cancelled' : doc.lifecycleState;

    onDocumentChange({
      ...doc,
      linkedProjectIds: newLinkedProjectIds,
      lifecycleState: newLifecycle,
      modifiedDate: new Date().toISOString()
    });
    
    setDeleteConfirmOpen(null);
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-0 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-night">Project Documents</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage reference documents associated with this project</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Add Document Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-pebble">
              <h3 className="text-night font-medium">Add Project Document</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ documentName: '', description: '', file: null });
                  setErrors({});
                }}
                className="text-gray-400 hover:text-night"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-night mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-pebble rounded-lg p-4 text-center hover:border-sky transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block w-full">
                    {formData.file ? (
                      <div className="flex items-center justify-center gap-2 text-sky">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">{formData.file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to select file</span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.file && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.file}
                  </p>
                )}
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-night mb-2">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, documentName: e.target.value }));
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, documentName: '' }));
                    }
                  }}
                  placeholder="Auto-filled from filename, edit as needed"
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                />
                {errors.documentName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.documentName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-night mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-pebble bg-gray-50/50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ documentName: '', description: '', file: null });
                  setErrors({});
                }}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-night mb-2">Remove Document?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will remove the document's association with this project. If it is not linked to any other projects, its lifecycle state will automatically change to Cancelled.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(null)}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteConfirmOpen)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-pebble overflow-hidden">
        {/* Table */}
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents found for this project</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead className="border-b border-pebble bg-earth">
                <tr>
                  {columnOrder.map((col, i) =>
                    col.visible !== false ? (
                      <th
                        key={col.id}
                        draggable
                        onDragStart={() => handleColDragStart(i)}
                        onDragOver={(e) => handleColDragOver(e, i)}
                        onDragEnd={handleColDragEnd}
                        style={{ width: col.width, minWidth: col.width }}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-move select-none transition-colors ${
                          draggedCol === i ? 'bg-pale opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                        </div>
                      </th>
                    ) : null
                  )}
                  <th style={{ width: '10%', minWidth: '80px' }} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble">
                {filtered.map(doc => {
                  const currentVer = doc.versions[0];
                  
                  return (
                    <tr key={doc.id} className="hover:bg-earth transition-colors">
                      {columnOrder.map(col => {
                        if (col.visible === false) return null;

                        switch (col.id) {
                          case 'name':
                            return (
                              <td key={col.id} className="px-4 py-3 max-w-0">
                                <button
                                  onClick={() => setSelectedDocument(doc)}
                                  className="flex items-center gap-2 text-sky hover:underline text-left w-full"
                                >
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate font-semibold w-full block">{doc.name}</span>
                                </button>
                              </td>
                            );
                          case 'description':
                            return (
                              <td key={col.id} className="px-4 py-3 text-gray-600 text-xs leading-relaxed max-w-0 truncate" title={doc.description}>
                                {doc.description || '—'}
                              </td>
                            );
                          case 'lifecycle':
                            return (
                              <td key={col.id} className="px-4 py-3">
                                <DocumentLifecycleBadge state={doc.lifecycleState as any} size="sm" />
                              </td>
                            );
                          case 'uploadedBy':
                            return <td key={col.id} className="px-4 py-3 text-gray-600">{doc.createdBy}</td>;
                          case 'uploadedOn':
                            return <td key={col.id} className="px-4 py-3 text-gray-600">{formatDate(doc.createdDate)}</td>;
                          default:
                            return null;
                        }
                      })}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => console.log('Downloading', currentVer?.fileName)}
                            className="p-1.5 text-gray-500 hover:text-sky hover:bg-pale rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmOpen(doc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove from Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-pebble bg-earth text-xs text-gray-500">
          Showing {filtered.length} project document(s)
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-pebble">
              <h3 className="text-night font-medium">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-night"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-600">{selectedDocument.description || '—'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Uploaded By</p>
                  <p className="text-sm text-night font-medium">{selectedDocument.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Date</p>
                  <p className="text-sm text-night">{formatDate(selectedDocument.createdDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lifecycle</p>
                  <DocumentLifecycleBadge state={selectedDocument.lifecycleState as any} size="sm" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">File Size</p>
                  <p className="text-sm text-night">{formatBytes(selectedDocument.versions[0]?.fileSizeBytes)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">File Name</p>
                <p className="text-sm text-gray-600 break-all">{selectedDocument.versions[0]?.fileName}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-pebble bg-gray-50/50 rounded-b-xl">
              <button
                onClick={() => console.log('Downloading')}
                className="flex items-center gap-2 px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(selectedDocument.id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
