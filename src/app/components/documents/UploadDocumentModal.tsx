import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Layers, FolderOpen, AlertCircle, Check } from 'lucide-react';
import type { DocumentRecord, DocumentType, SESubtype, DocumentLifecycle } from './documentsData';
import { SE_SUBTYPES, incrementVersion, evaluateFormulationLifecycle } from './documentsData';
import { CURRENT_USER, mockClaims, mockAssets, initialProjects } from '../../types';
import { initialProducts } from '../products/productData';

const GEO_OPTIONS = ['Global', 'EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'];

const MOCK_PRODUCTS = initialProjects.flatMap(p => p.products || []);

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (doc: DocumentRecord) => void;
  contextDocType?: DocumentType;
  contextProjectId?: string;
  contextClaimId?: string;
  contextAssetId?: string;
  contextProductId?: string;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onCreate,
  contextDocType,
  contextProjectId,
  contextClaimId,
  contextAssetId,
  contextProductId,
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
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>(contextProductId ? [contextProductId] : []);
  const [selectedClaims, setSelectedClaims] = useState<string[]>(contextClaimId ? [contextClaimId] : []);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(contextAssetId ? [contextAssetId] : []);

  // Formulation specific
  const [inputMethod, setInputMethod] = useState<'file' | 'cuc'>('file');
  const [cucNumber, setCucNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [version, setVersion] = useState('0.1');
  const [businessGroup, setBusinessGroup] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [format, setFormat] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [tabLink, setTabLink] = useState('');
  const [relatedProjectIds, setRelatedProjectIds] = useState<string[]>(contextProjectId ? [contextProjectId] : []);

  const [showNotification, setShowNotification] = useState(false);
  const [successProducts, setSuccessProducts] = useState<{id: string, name: string}[]>([]);
  const [skippedProducts, setSkippedProducts] = useState<{id: string, name: string}[]>([]);
  const [pendingDoc, setPendingDoc] = useState<DocumentRecord | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-populate geography from selected claims
  useEffect(() => {
    if (docType === 'Substantiation Evidence' && selectedClaims.length > 0) {
      const selectedClaimObjs = mockClaims.filter(c => selectedClaims.includes(c.id));
      const hasRegionalOrLocal = selectedClaimObjs.some(c => 
        ['Regional', 'Local', 'SKU'].includes(c.classification || '')
      );
      if (hasRegionalOrLocal) {
        const claimGeos = new Set<string>();
        selectedClaimObjs.forEach(c => {
          c.geography?.forEach(g => claimGeos.add(g));
        });
        setGeography(prev => {
          const updated = new Set(prev);
          claimGeos.forEach(g => updated.add(g));
          return Array.from(updated);
        });
      }
    }
  }, [selectedClaims, docType]);

  // Auto-derive formulation metadata from products
  useEffect(() => {
    if (docType === 'Formulation Document') {
      if (selectedProducts.length > 0) {
        const prods = initialProducts.filter(p => selectedProducts.includes(p.id));
        
        const bgs = Array.from(new Set(prods.map(p => p.businessGroup).filter(Boolean))).join(', ');
        const cats = Array.from(new Set(prods.map(p => p.category).filter(Boolean))).join(', ');
        const brands = Array.from(new Set(prods.map(p => p.brand).filter(Boolean))).join(', ');
        
        // formats is implicit in our app, so we look for 'Format' type in ancestry if we had it,
        // but since we only have flat initialProducts, we will extract it if there is a Format type
        const formats = Array.from(new Set(prods.map(p => p.type === 'Format' ? p.name : '').filter(Boolean))).join(', ');
        
        setBusinessGroup(bgs);
        setCategory(cats);
        setBrand(brands);
        setFormat(formats);
      } else {
        // Clear them if no products selected
        setBusinessGroup('');
        setCategory('');
        setBrand('');
        setFormat('');
      }
    }
  }, [selectedProducts, docType]);

  if (!isOpen) return null;

  if (showNotification && pendingDoc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {}} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
            <h2 className="text-xl font-bold text-night">Product Association Status</h2>
            <button onClick={() => onCreate(pendingDoc)} className="p-2 hover:bg-earth rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-green-700 flex items-center gap-1.5 mb-2">
                <Check className="w-4 h-4" /> Successfully Linked ({successProducts.length})
              </h3>
              {successProducts.length > 0 ? (
                <ul className="space-y-1">
                  {successProducts.map(p => (
                    <li key={p.id} className="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded border border-green-100">{p.name} ({p.id})</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">None</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4" /> Skipped ({skippedProducts.length})
              </h3>
              <p className="text-[10px] text-gray-500 mb-2">Only products in 'Created' state can be linked.</p>
              {skippedProducts.length > 0 ? (
                <ul className="space-y-1">
                  {skippedProducts.map(p => (
                    <li key={p.id} className="text-xs text-gray-600 bg-red-50 px-2 py-1 rounded border border-red-100">{p.name} ({p.id})</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">None</p>
              )}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-pebble flex justify-end">
            <button
              onClick={() => onCreate(pendingDoc)}
              className="px-5 py-2.5 text-sm font-bold text-white bg-sky hover:bg-dark rounded-xl shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFetchFromPLM = () => {
    if (!cucNumber.trim()) return;
    setErrors(prev => ({ ...prev, cuc: '' }));
    
    // Simulate PLM validation rule
    if (!cucNumber.toUpperCase().startsWith('CUC')) {
      setErrors(prev => ({ ...prev, cuc: 'Invalid CUC Specification Number. Must start with CUC.' }));
      setFetched(false);
      return;
    }

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
      if (selectedProducts.length === 0) {
        if (!businessGroup.trim()) errs.businessGroup = 'Business Group is required';
        if (!category.trim()) errs.category = 'Category is required';
      }
      if (version && isNaN(Number(version))) errs.version = 'Version must be a decimal number';
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

    let finalLinkedProductIds = selectedProducts;
    let initialLifecycleState = docType === 'Formulation Document' ? 'Created' : docType === 'Project Document' ? 'In Use' : 'Draft';
    let localSuccess: {id: string, name: string}[] = [];
    let localSkipped: {id: string, name: string}[] = [];

    if (docType === 'Formulation Document') {
      const successfullyLinkedIds: string[] = [];
      const successfullyLinkedLifecycles: string[] = [];

      selectedProducts.forEach(prodId => {
        const p = initialProducts.find(prod => prod.id === prodId);
        if (p) {
          if (p.lifecycleState === 'Created') {
            localSuccess.push({ id: p.id, name: p.name });
            successfullyLinkedIds.push(p.id);
            successfullyLinkedLifecycles.push(p.lifecycleState);
          } else {
            localSkipped.push({ id: p.id, name: p.name });
          }
        }
      });

      finalLinkedProductIds = successfullyLinkedIds;
      const tempDoc = { lifecycleState: 'Created' } as DocumentRecord; 
      initialLifecycleState = evaluateFormulationLifecycle(tempDoc, successfullyLinkedLifecycles);
    }

    const newDoc: DocumentRecord = {
      id,
      documentType: docType,
      name: name.trim(),
      description: description.trim() || undefined,
      currentVersion: version || '0.1',
      versions: [{
        versionNumber: version || '0.1',
        lifecycleState: initialLifecycleState as DocumentLifecycle,
        fileName: fileName || undefined,
        uploadedAt: now,
        uploadedBy: CURRENT_USER,
      }],
      lifecycleState: initialLifecycleState as DocumentLifecycle,
      createdBy: CURRENT_USER,
      createdDate: now,
      modifiedDate: now,
      validToDate: validToDate || undefined,
      geography,
      comments: [],
      // SE
      subtype: docType === 'Substantiation Evidence' ? (subtype as SESubtype) : undefined,
      linkedClaimIds: docType === 'Substantiation Evidence' ? selectedClaims : (contextClaimId ? [contextClaimId] : []),
      linkedAssetIds: docType === 'Substantiation Evidence' ? selectedAssets : (contextAssetId ? [contextAssetId] : []),
      relatedProductIds: docType === 'Substantiation Evidence' ? selectedProducts : [],
      // Formulation
      cucSpecNumber: docType === 'Formulation Document' && inputMethod === 'cuc' ? cucNumber : undefined,
      linkedProductIds: docType === 'Formulation Document' ? finalLinkedProductIds : [],
      businessGroup: docType === 'Formulation Document' ? businessGroup : undefined,
      category: docType === 'Formulation Document' ? category : undefined,
      brand: docType === 'Formulation Document' ? brand : undefined,
      format: docType === 'Formulation Document' ? format : undefined,
      documentNumber: docType === 'Formulation Document' ? documentNumber : undefined,
      tabLink: docType === 'Formulation Document' ? tabLink : undefined,
      version: docType === 'Formulation Document' ? (version || '0.1') : undefined,
      // Project
      linkedProjectIds: contextProjectId ? [contextProjectId] : (docType === 'Formulation Document' ? relatedProjectIds : []),
    };

    if (docType === 'Formulation Document') {
      setSuccessProducts(localSuccess);
      setSkippedProducts(localSkipped);
      setPendingDoc(newDoc);
      setShowNotification(true);
    } else {
      onCreate(newDoc);
    }
  };

  const handleMultiSelect = (val: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (val === '') return;
    if (!current.includes(val)) {
      setter([...current, val]);
    }
  };

  const removeMultiSelect = (val: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(current.filter(item => item !== val));
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

              {/* SE: Related Entities */}
              {docType === 'Substantiation Evidence' && (
                <div className="space-y-4 p-4 border border-sky/20 bg-sky/5 rounded-xl">
                  <h4 className="text-xs font-bold text-sky uppercase tracking-wide">Linkages (Optional)</h4>
                  
                  {/* Related Products */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Related Products</label>
                    <select
                      onChange={(e) => handleMultiSelect(e.target.value, selectedProducts, setSelectedProducts)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white mb-2"
                      value=""
                    >
                      <option value="">Select products...</option>
                      {MOCK_PRODUCTS.filter(p => !selectedProducts.includes(p.productId)).map(p => (
                        <option key={p.productId} value={p.productId}>{p.productName} ({p.productId})</option>
                      ))}
                    </select>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map(id => {
                          const prod = MOCK_PRODUCTS.find(p => p.productId === id);
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-pebble rounded-full text-xs">
                              {prod?.productName || id}
                              <button onClick={() => removeMultiSelect(id, selectedProducts, setSelectedProducts)}>
                                <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Related Claims */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Related Claims</label>
                    <select
                      onChange={(e) => handleMultiSelect(e.target.value, selectedClaims, setSelectedClaims)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white mb-2"
                      value=""
                    >
                      <option value="">Select claims...</option>
                      {mockClaims.filter(c => !selectedClaims.includes(c.id)).map(c => (
                        <option key={c.id} value={c.id}>{(c.statement || '').substring(0,50)}... ({c.id})</option>
                      ))}
                    </select>
                    {selectedClaims.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedClaims.map(id => {
                          const claim = mockClaims.find(c => c.id === id);
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-pebble rounded-full text-xs">
                              {claim?.id || id}
                              <button 
                                onClick={() => removeMultiSelect(id, selectedClaims, setSelectedClaims)}
                                disabled={contextClaimId === id}
                                className={contextClaimId === id ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <X className={`w-3 h-3 ${contextClaimId === id ? 'text-gray-300' : 'text-gray-500 hover:text-red-500'}`} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Related Assets */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Related Assets</label>
                    <select
                      onChange={(e) => handleMultiSelect(e.target.value, selectedAssets, setSelectedAssets)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white mb-2"
                      value=""
                    >
                      <option value="">Select assets...</option>
                      {mockAssets.filter(a => !selectedAssets.includes(a.id)).map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                      ))}
                    </select>
                    {selectedAssets.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedAssets.map(id => {
                          const asset = mockAssets.find(a => a.id === id);
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-pebble rounded-full text-xs">
                              {asset?.name || id}
                              <button 
                                onClick={() => removeMultiSelect(id, selectedAssets, setSelectedAssets)}
                                disabled={contextAssetId === id}
                                className={contextAssetId === id ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <X className={`w-3 h-3 ${contextAssetId === id ? 'text-gray-300' : 'text-gray-500 hover:text-red-500'}`} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formulation Document Metadata */}
              {docType === 'Formulation Document' && (
                <div className="space-y-4 p-4 border border-violet-200 bg-violet-50 rounded-xl">
                  <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wide">Metadata</h4>
                  
                  {/* Related Products */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Related Products</label>
                    <select
                      onChange={(e) => handleMultiSelect(e.target.value, selectedProducts, setSelectedProducts)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white mb-2"
                      value=""
                    >
                      <option value="">Select products...</option>
                      {initialProducts.filter(p => !selectedProducts.includes(p.id) && ['Technology', 'Variant', 'Local Variant'].includes(p.type)).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map(id => {
                          const prod = initialProducts.find(p => p.id === id);
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-pebble rounded-full text-xs">
                              {prod?.name || id}
                              <button 
                                onClick={() => removeMultiSelect(id, selectedProducts, setSelectedProducts)}
                                disabled={contextProductId === id}
                                className={contextProductId === id ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <X className={`w-3 h-3 ${contextProductId === id ? 'text-gray-300' : 'text-gray-500 hover:text-red-500'}`} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Business Group & Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">Business Group {selectedProducts.length === 0 && '*'}</label>
                      <input
                        value={businessGroup}
                        onChange={e => setBusinessGroup(e.target.value)}
                        readOnly={selectedProducts.length > 0}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                          selectedProducts.length > 0 
                            ? 'bg-gray-100 border-transparent text-gray-500 cursor-not-allowed' 
                            : errors.businessGroup ? 'border-red-400 focus:ring-2 focus:ring-sky' : 'border-pebble focus:ring-2 focus:ring-sky'
                        }`}
                        placeholder="e.g. Beauty & Wellbeing"
                      />
                      {errors.businessGroup && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.businessGroup}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">Category {selectedProducts.length === 0 && '*'}</label>
                      <input
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        readOnly={selectedProducts.length > 0}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                          selectedProducts.length > 0 
                            ? 'bg-gray-100 border-transparent text-gray-500 cursor-not-allowed' 
                            : errors.category ? 'border-red-400 focus:ring-2 focus:ring-sky' : 'border-pebble focus:ring-2 focus:ring-sky'
                        }`}
                        placeholder="e.g. Skin Care"
                      />
                      {errors.category && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.category}</span>}
                    </div>
                  </div>

                  {/* Brand & Format (Derived Only) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">Brand</label>
                      <input
                        value={brand}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-500 cursor-not-allowed"
                        placeholder="Auto-derived"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">Format</label>
                      <input
                        value={format}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-500 cursor-not-allowed"
                        placeholder="Auto-derived"
                      />
                    </div>
                  </div>

                  {/* Document Number & TAB Link */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">Document Number</label>
                      <input
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none"
                        placeholder="e.g. DOC-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-night mb-1">TAB Link</label>
                      <input
                        value={tabLink}
                        onChange={e => setTabLink(e.target.value)}
                        className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none"
                        placeholder="https://"
                      />
                    </div>
                  </div>

                  {/* Related Projects */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Related Projects</label>
                    <select
                      onChange={(e) => handleMultiSelect(e.target.value, relatedProjectIds, setRelatedProjectIds)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none bg-white mb-2"
                      value=""
                    >
                      <option value="">Select projects...</option>
                      {initialProjects.filter(p => !relatedProjectIds.includes(p.projectId)).map(p => (
                        <option key={p.projectId} value={p.projectId}>{p.name} ({p.projectId})</option>
                      ))}
                    </select>
                    {relatedProjectIds.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {relatedProjectIds.map(id => {
                          const proj = initialProjects.find(p => p.projectId === id);
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-pebble rounded-full text-xs">
                              {proj?.name || id}
                              <button 
                                onClick={() => removeMultiSelect(id, relatedProjectIds, setRelatedProjectIds)}
                                disabled={contextProjectId === id}
                                className={contextProjectId === id ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <X className={`w-3 h-3 ${contextProjectId === id ? 'text-gray-300' : 'text-gray-500 hover:text-red-500'}`} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Version */}
                  <div>
                    <label className="block text-xs font-bold text-night mb-1">Version</label>
                    <input
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      placeholder="0.1"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky outline-none ${errors.version ? 'border-red-400' : 'border-pebble'}`}
                    />
                    {errors.version && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors.version}</span>}
                  </div>
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
