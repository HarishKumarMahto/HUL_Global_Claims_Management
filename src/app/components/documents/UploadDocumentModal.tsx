import React, { useState } from 'react';
import { X, Upload, FileText, Layers, FolderOpen, AlertCircle, Check } from 'lucide-react';
import type { DocumentRecord, DocumentType, SESubtype } from './documentsData';
import { SE_SUBTYPES, incrementVersion } from './documentsData';
import { CURRENT_USER } from '../../types';

const GEO_OPTIONS = ['Global', 'EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'];

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (doc: DocumentRecord) => void;
  contextDocType?: DocumentType;
  contextProjectId?: string;
  contextClaimId?: string;
  contextAssetId?: string;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onCreate,
  contextDocType,
  contextProjectId,
  contextClaimId,
  contextAssetId,
}: UploadDocumentModalProps) {
  const [step, setStep] = useState<1 | 2>(contextDocType ? 2 : 1);
  const [docType, setDocType] = useState<DocumentType | ''>(contextDocType || '');

  // Common fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [geography, setGeography] = useState<string[]>([]);

  // SE specific
  const [subtype, setSubtype] = useState<SESubtype | ''>('');
  const [validToDate, setValidToDate] = useState('');

  // Formulation specific
  const [inputMethod, setInputMethod] = useState<'file' | 'cuc'>('file');
  const [cucNumber, setCucNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [version, setVersion] = useState('0.1');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFetchFromPLM = () => {
    if (!cucNumber.trim()) return;
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      setFetched(true);
      setFileName(`formulation_${cucNumber}.pdf`);
      if (!name) setName(`Formulation Doc — ${cucNumber}`);
    }, 1500);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (docType === 'Substantiation Evidence') {
      if (!fileName && !fetched) errs.file = 'File upload is required';
      if (!subtype) errs.subtype = 'Subtype is required';
    }
    if (docType === 'Formulation Document') {
      if (inputMethod === 'file' && !fileName) errs.file = 'File upload is required';
      if (inputMethod === 'cuc' && !fetched) errs.cuc = 'Please fetch from PLM first';
    }
    if (docType === 'Project Document') {
      if (!fileName) errs.file = 'File upload is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate() || !docType) return;
    const now = new Date().toISOString();
    const id = `DOC-${docType === 'Substantiation Evidence' ? 'SE' : docType === 'Formulation Document' ? 'FD' : 'PD'}-${Date.now()}`;

    const newDoc: DocumentRecord = {
      id,
      documentType: docType,
      name: name.trim(),
      description: description.trim() || undefined,
      currentVersion: version || '0.1',
      versions: [{
        versionNumber: version || '0.1',
        lifecycleState: docType === 'Formulation Document' ? 'Created' : docType === 'Project Document' ? 'In Use' : 'Draft',
        fileName: fileName || undefined,
        uploadedAt: now,
        uploadedBy: CURRENT_USER,
      }],
      lifecycleState: docType === 'Formulation Document' ? 'Created' : docType === 'Project Document' ? 'In Use' : 'Draft',
      createdBy: CURRENT_USER,
      createdDate: now,
      modifiedDate: now,
      validToDate: validToDate || undefined,
      geography,
      comments: [],
      // SE
      subtype: docType === 'Substantiation Evidence' ? (subtype as SESubtype) : undefined,
      linkedClaimIds: contextClaimId ? [contextClaimId] : [],
      linkedAssetIds: contextAssetId ? [contextAssetId] : [],
      relatedProductIds: [],
      // Formulation
      cucSpecNumber: docType === 'Formulation Document' && inputMethod === 'cuc' ? cucNumber : undefined,
      linkedProductIds: [],
      version: version || '0.1',
      // Project
      linkedProjectIds: contextProjectId ? [contextProjectId] : [],
    };
    onCreate(newDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-night">Upload Document</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? 'Select document type' : `Uploading: ${docType}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Step 1: Type selector */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-night">Choose document type</p>
              {[
                { type: 'Substantiation Evidence' as DocumentType, icon: <FileText className="w-5 h-5" />, color: 'text-sky-600 bg-sky-50 border-sky-200', desc: 'Clinical studies, lab tests, consumer surveys' },
                { type: 'Formulation Document' as DocumentType, icon: <Layers className="w-5 h-5" />, color: 'text-violet-600 bg-violet-50 border-violet-200', desc: 'Product formulation specs, CUC documents' },
                { type: 'Project Document' as DocumentType, icon: <FolderOpen className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Project charters, briefs, reference files' },
              ].map(({ type, icon, color, desc }) => (
                <button
                  key={type}
                  onClick={() => { setDocType(type); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-sky transition-all text-left ${
                    docType === type ? 'border-sky bg-pale' : 'border-pebble hover:bg-earth/50'
                  }`}
                >
                  <span className={`p-2 rounded-lg border ${color}`}>{icon}</span>
                  <div>
                    <div className="font-semibold text-night text-sm">{type}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && docType && (
            <div className="space-y-4">
              {/* File upload / CUC (Formulation) */}
              {docType === 'Formulation Document' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-night">Input Method *</label>
                  <div className="flex gap-3">
                    {(['file', 'cuc'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => { setInputMethod(m); setFetched(false); setFileName(''); }}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                          inputMethod === m ? 'border-sky bg-pale text-sky' : 'border-pebble text-gray-600 hover:bg-earth'
                        }`}
                      >
                        {m === 'file' ? '📁 Upload File' : '🔗 CUC Spec Number'}
                      </button>
                    ))}
                  </div>
                  {inputMethod === 'cuc' && (
                    <div className="flex gap-2">
                      <input
                        value={cucNumber}
                        onChange={e => { setCucNumber(e.target.value); setFetched(false); }}
                        placeholder="e.g. CUC-DOVE-IR-2026"
                        className="flex-1 px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none"
                      />
                      <button
                        onClick={handleFetchFromPLM}
                        disabled={!cucNumber.trim() || fetching}
                        className="px-4 py-2 bg-sky text-white rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-dark transition-colors"
                      >
                        {fetching ? 'Fetching…' : fetched ? '✓ Fetched' : 'Fetch from PLM'}
                      </button>
                    </div>
                  )}
                  {errors.cuc && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cuc}</span>}
                </div>
              )}

              {/* File upload (SE + Project Doc + Formulation file mode) */}
              {(docType !== 'Formulation Document' || inputMethod === 'file') && (
                <div>
                  <label className="block text-xs font-bold text-night mb-1">File Upload *</label>
                  <label className={`flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    fileName ? 'border-green-300 bg-green-50' : 'border-pebble hover:border-sky hover:bg-pale'
                  }`}>
                    {fileName ? (
                      <>
                        <Check className="w-6 h-6 text-green-500" />
                        <span className="text-sm font-medium text-green-700">{fileName}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-300" />
                        <span className="text-sm text-gray-400">Click to browse or drag & drop</span>
                        <span className="text-xs text-gray-300">PDF, DOCX, PPTX, XLSX, PNG, JPG</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  {errors.file && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.file}</span>}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-night mb-1">Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Document name"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none ${errors.name ? 'border-red-400' : 'border-pebble'}`}
                />
                {errors.name && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.name}</span>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-night mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none resize-none"
                />
              </div>

              {/* SE: Subtype */}
              {docType === 'Substantiation Evidence' && (
                <div>
                  <label className="block text-xs font-bold text-night mb-1">Subtype *</label>
                  <select
                    value={subtype}
                    onChange={e => setSubtype(e.target.value as SESubtype)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white ${errors.subtype ? 'border-red-400' : 'border-pebble'}`}
                  >
                    <option value="">Select subtype…</option>
                    {SE_SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subtype && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.subtype}</span>}
                </div>
              )}

              {/* Formulation: version */}
              {docType === 'Formulation Document' && (
                <div>
                  <label className="block text-xs font-bold text-night mb-1">Version</label>
                  <input
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    placeholder="0.1"
                    className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none"
                  />
                </div>
              )}

              {/* Geography */}
              {docType !== 'Project Document' && (
                <div>
                  <label className="block text-xs font-bold text-night mb-1">Geography</label>
                  <div className="flex flex-wrap gap-2">
                    {GEO_OPTIONS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGeography(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                        className={`px-3 py-1 rounded-full text-xs border font-medium transition-colors ${
                          geography.includes(g) ? 'bg-sky text-white border-sky' : 'border-pebble text-gray-600 hover:bg-earth'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid To Date */}
              {docType !== 'Project Document' && (
                <div>
                  <label className="block text-xs font-bold text-night mb-1">Valid To Date</label>
                  <input
                    type="date"
                    value={validToDate}
                    onChange={e => setValidToDate(e.target.value)}
                    className="px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble bg-white flex-shrink-0 flex items-center justify-between gap-3">
          <div>
            {step === 2 && !contextDocType && (
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-night transition-colors">
                ← Change type
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-earth rounded-xl transition-colors">
              Cancel
            </button>
            {step === 2 && (
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 text-sm font-bold text-white bg-sky hover:bg-dark rounded-xl shadow-sm shadow-sky/20 transition-all active:scale-95"
              >
                Upload Document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
