import { useState } from 'react';
import {
  Plus, Search, Download, Trash2, X, Check, Eye, EyeOff,
  ChevronDown, Settings, FileText, Upload, AlertCircle, GripVertical
} from 'lucide-react';

type DocumentType = 'MOM' | 'Approval' | 'Meeting Notes' | 'Report' | 'Specification' | 'Other';

interface ProductDocument {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  uploadedBy: string;
  uploadedOn: string;
  fileSize: string;
  fileName: string;
}

interface AddDocumentFormData {
  documentName: string;
  description: string;
  file: File | null;
}

const mockDocuments: ProductDocument[] = [
  {
    id: 'd1',
    name: 'Dove IR Campaign MOM',
    description: 'Minutes of meeting held on 2026-04-20 discussing marketing campaign strategy and approval workflow',
    type: 'MOM',
    uploadedBy: 'Sarah Johnson',
    uploadedOn: '2026-04-20',
    fileSize: '0.5 MB',
    fileName: 'Dove_IR_Campaign_MOM_04-20.pdf'
  },
  {
    id: 'd2',
    name: 'Marketing Approval Document',
    description: 'Final approval for campaign launch from Marketing Director and Product Manager',
    type: 'Approval',
    uploadedBy: 'Michael Chen',
    uploadedOn: '2026-04-18',
    fileSize: '1.2 MB',
    fileName: 'Marketing_Approval_Final.pdf'
  },
  {
    id: 'd3',
    name: 'Product Specification Sheet',
    description: 'Technical specifications for Dove Intensive Repair product formulation and packaging',
    type: 'Specification',
    uploadedBy: 'Emma Williams',
    uploadedOn: '2026-04-15',
    fileSize: '2.8 MB',
    fileName: 'Product_Spec_v2.docx'
  },
  {
    id: 'd4',
    name: 'Regional Compliance Review',
    description: 'Review of compliance requirements for EMEA region covering regulatory and labeling aspects',
    type: 'Report',
    uploadedBy: 'Robert Taylor',
    uploadedOn: '2026-04-10',
    fileSize: '1.5 MB',
    fileName: 'EMEA_Compliance_Review.pdf'
  },
  {
    id: 'd5',
    name: 'Q2 Project Status Meeting Notes',
    description: 'Discussion on project timeline, milestones, risks, and Q3 action items from April steering committee meeting',
    type: 'Meeting Notes',
    uploadedBy: 'Lisa Park',
    uploadedOn: '2026-04-05',
    fileSize: '0.8 MB',
    fileName: 'Q2_Status_Meeting_Notes.docx'
  }
];

const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  'MOM': 'bg-blue-100 text-blue-700',
  'Approval': 'bg-green-100 text-green-700',
  'Meeting Notes': 'bg-purple-100 text-purple-700',
  'Report': 'bg-orange-100 text-orange-700',
  'Specification': 'bg-pink-100 text-pink-700',
  'Other': 'bg-gray-100 text-gray-700'
};

const BASE_COLUMNS = [
  { id: 'name', label: 'Document Name', width: '25%', visible: true },
  { id: 'description', label: 'Description', width: '45%', visible: true },
  { id: 'uploadedBy', label: 'Uploaded By', width: '12%', visible: true },
  { id: 'uploadedOn', label: 'Uploaded On', width: '10%', visible: true },
];

// Mock permission check - in real app, this would check actual user permissions
const canDeleteDocument = (uploadedBy: string, currentUser: string, isProjectLead: boolean, isClaimsLead: boolean): boolean => {
  return uploadedBy === currentUser || isProjectLead || isClaimsLead;
};

export default function ProductDocumentsTab() {
  const [documents, setDocuments] = useState<ProductDocument[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<ProductDocument | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [colConfigOpen, setColConfigOpen] = useState(false);
  const [formData, setFormData] = useState<AddDocumentFormData>({
    documentName: '',
    description: '',
    file: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock current user - in real app, this would come from auth context
  const currentUser = 'Sarah Johnson';
  const isProjectLead = true;
  const isClaimsLead = false;

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

  const isColVisible = (id: string) => columnOrder.find(c => c.id === id)?.visible !== false;

  const toggleColumn = (id: string) => {
    setColumnOrder(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const documentTypes = ['All', ...Array.from(new Set(documents.map(d => d.type)))];

  const filtered = documents;

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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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

    const newDocument: ProductDocument = {
      id: `d${documents.length + 1}`,
      name: formData.documentName,
      description: formData.description,
      type: 'Other',
      uploadedBy: currentUser,
      uploadedOn: new Date().toISOString().split('T')[0],
      fileSize: `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileName: formData.file.name
    };

    setDocuments(prev => [newDocument, ...prev]);
    setShowAddForm(false);
    setFormData({ documentName: '', description: '', file: null });
    setErrors({});
  };

  const handleDeleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc && canDeleteDocument(doc.uploadedBy, currentUser, isProjectLead, isClaimsLead)) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      setSelectedDocument(null);
    }
  };

  const handleDownload = (doc: ProductDocument) => {
    // In a real app, this would trigger actual download
    console.log(`Downloading: ${doc.fileName}`);
  };

  return (
    <div className="p-0 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-night">Project Documents</h2>
          <p className="text-sm text-gray-500 mt-0.5">Supporting documents, MOMs, and approvals for this project</p>
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
                  Select File
                </label>
                <div className="border-2 border-dashed border-pebble rounded-lg p-4 text-center hover:border-sky transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
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
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  placeholder="Brief description of the document content and purpose"
                  rows={3}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
                {errors.description && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-pebble">
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
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-pebble overflow-hidden">
        {/* Toolbar removed */}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents found</p>
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
                          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          {col.label}
                        </div>
                      </th>
                    ) : null
                  )}
                  <th style={{ width: '8%', minWidth: '80px' }} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble">
                {filtered.map(doc => (
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
                              {doc.description}
                            </td>
                          );
                        case 'uploadedBy':
                          return <td key={col.id} className="px-4 py-3 text-gray-600">{doc.uploadedBy}</td>;
                        case 'uploadedOn':
                          return <td key={col.id} className="px-4 py-3 text-gray-600">{doc.uploadedOn}</td>;
                        case 'type':
                          return (
                            <td key={col.id} className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_TYPE_COLORS[doc.type]}`}>
                                {doc.type}
                              </span>
                            </td>
                          );
                        case 'size':
                          return <td key={col.id} className="px-4 py-3 text-gray-600 text-xs">{doc.fileSize}</td>;
                        default:
                          return null;
                      }
                    })}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-gray-500 hover:text-sky hover:bg-pale rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canDeleteDocument(doc.uploadedBy, currentUser, isProjectLead, isClaimsLead) && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete (You have permission)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!canDeleteDocument(doc.uploadedBy, currentUser, isProjectLead, isClaimsLead) && (
                          <div
                            className="p-1.5 text-gray-300 cursor-not-allowed"
                            title="Delete (Permission denied)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-pebble bg-earth text-xs text-gray-500">
          Showing {filtered.length} of {documents.length} documents
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
                <p className="text-sm text-gray-600">{selectedDocument.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Uploaded By</p>
                  <p className="text-sm text-night font-medium">{selectedDocument.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Date</p>
                  <p className="text-sm text-night">{selectedDocument.uploadedOn}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Type</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_TYPE_COLORS[selectedDocument.type]}`}>
                    {selectedDocument.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">File Size</p>
                  <p className="text-sm text-night">{selectedDocument.fileSize}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">File Name</p>
                <p className="text-sm text-gray-600 break-all">{selectedDocument.fileName}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-pebble">
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="flex items-center gap-2 px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              {canDeleteDocument(selectedDocument.uploadedBy, currentUser, isProjectLead, isClaimsLead) && (
                <button
                  onClick={() => {
                    handleDeleteDocument(selectedDocument.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
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
