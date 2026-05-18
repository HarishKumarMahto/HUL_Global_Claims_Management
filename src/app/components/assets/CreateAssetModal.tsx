import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, ChevronRight, AlertCircle, ChevronDown, Check, Globe2, Search, Clock } from 'lucide-react';
import type { Asset } from '../../types';
import { BUSINESS_GROUPS, CATEGORIES, REGIONS } from '../../types';

type CreateMode = 'upload' | 'placeholder';

// Subtypes that carry "(Other/Brand Say)" behaviour
const SUBTYPES_WITH_BRAND_SAY = new Set([
  'Demo (Other/Brand Say)',
  'Events Report',
  'External Trainings',
  'Image Claim',
  'Master Text',
  'Medical Marketing (Other/Brand Say)',
  'Online Story',
  'PDV',
  'Press Release (Other/Brand Say)',
  'Print AD / KV',
  'Social Media (Other/Brand Say)',
  'Social Media - Always On (Other/Brand Say)',
  'Social Media - Brand Content (Other/Brand Say)',
  'Social Media - Technology Story (Other/Brand Say)',
  'Social Media - User Generated Content (Other/Brand Say)',
  'Trade Story (Other/Brand Say)',
]);

// Full subtype list (alphabetical)
const ALL_SUBTYPES = [
  'Artwork Master Design',
  'B&W - EU Asset',
  'B&W - Global Asset',
  'B&W - Local Asset',
  'B&W - Local Language Translation',
  'B&W - Tailored Global Asset',
  'Briefing',
  'Concepts',
  'Demo (Other/Brand Say)',
  'DU Carton',
  'Events Report',
  'External Trainings',
  'Image Claim',
  'Master Text',
  'Medical Marketing (Other/Brand Say)',
  'Online Story',
  'PDV',
  'Playbook/Product Guide',
  'Press Release (Other/Brand Say)',
  'Print AD / KV',
  'Social First',
  'Social Media (Other/Brand Say)',
  'Social Media - Always On (Other/Brand Say)',
  'Social Media - Brand Content (Other/Brand Say)',
  'Social Media - Technology Story (Other/Brand Say)',
  'Social Media - User Generated Content (Other/Brand Say)',
  'Storyboard',
  'Trade Story (Other/Brand Say)',
  'TVC',
];

// Strips "(Other/Brand Say)" for display
const displayLabel = (s: string) => s.replace(' (Other/Brand Say)', '');

// Session-scoped recently used list
let _recentSubtypes: string[] = [];
const getRecent = () => _recentSubtypes.slice(0, 5);
const pushRecent = (s: string) => {
  _recentSubtypes = [s, ..._recentSubtypes.filter(x => x !== s)].slice(0, 5);
};

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (asset: Partial<Asset>) => void;
}

export default function CreateAssetModal({ isOpen, onClose, onCreate }: CreateAssetModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<CreateMode | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form state
  const [assetName, setAssetName] = useState('');
  const [subtype, setSubtype] = useState<string | null>(null);
  const [businessGroup, setBusinessGroup] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [geography, setGeography] = useState<string[]>([]);
  const [otherBrandSay, setOtherBrandSay] = useState<boolean | null>(null);
  const [restrictUse, setRestrictUse] = useState(false);
  const [version, setVersion] = useState('0.1');
  const [errors, setErrors] = useState<string[]>([]);

  // Dropdown open state
  const [bgOpen, setBgOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);
  const [subtypeOpen, setSubtypeOpen] = useState(false);
  const [subtypeSearch, setSubtypeSearch] = useState('');

  const bgRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<HTMLDivElement>(null);
  const subtypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bgRef.current && !bgRef.current.contains(e.target as Node)) setBgOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) setGeoOpen(false);
      if (subtypeRef.current && !subtypeRef.current.contains(e.target as Node)) setSubtypeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClose = () => {
    setStep(1); setMode(null); setDragActive(false); setUploadedFile(null);
    setAssetName(''); setSubtype(null); setBusinessGroup('');
    setCategories([]); setGeography([]); setErrors([]);
    setOtherBrandSay(null); setRestrictUse(false); setVersion('0.1');
    setSubtypeSearch('');
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) { setUploadedFile(file); if (!assetName) setAssetName(file.name.replace(/\.[^/.]+$/, '')); }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); if (!assetName) setAssetName(file.name.replace(/\.[^/.]+$/, '')); }
  };

  const toggleGeo = (geo: string) =>
    setGeography(prev => prev.includes(geo) ? prev.filter(g => g !== geo) : [...prev, geo]);

  const toggleCategory = (cat: string) =>
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleBGSelect = (bg: string) => {
    setBusinessGroup(bg); setCategories([]); setBgOpen(false);
  };

  const handleSubtypeSelect = (s: string) => {
    setSubtype(s); setSubtypeOpen(false); setSubtypeSearch('');
    pushRecent(s);
    if (!SUBTYPES_WITH_BRAND_SAY.has(s)) setOtherBrandSay(null);
  };

  const availableCategories = businessGroup ? (CATEGORIES[businessGroup] || []) : [];
  const isSubtypeBrandSay = subtype && SUBTYPES_WITH_BRAND_SAY.has(subtype);
  const validateVersion = (v: string) => /^\d+\.\d+$/.test(v);

  // Subtype filtering
  const recent = getRecent();
  const filtered = ALL_SUBTYPES.filter(s =>
    displayLabel(s).toLowerCase().includes(subtypeSearch.toLowerCase())
  );
  const recentFiltered = recent.filter(s => filtered.includes(s));
  const restFiltered = filtered.filter(s => !recent.includes(s));

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!assetName.trim()) errs.push('Asset name is required');
    if (!subtype) errs.push('Asset Subtype is required');
    if (!businessGroup) errs.push('Business Group (BG) is required');
    if (categories.length === 0) errs.push('Category is required');
    if (isSubtypeBrandSay && otherBrandSay === null) errs.push('Please specify Other / Brand Say?');
    if (!validateVersion(version)) errs.push('Version must be in decimal format (e.g. 0.1, 1.0)');
    if (mode === 'upload' && !uploadedFile) errs.push('File upload is required');
    if (errs.length > 0) { setErrors(errs); return; }

    if (mode === 'upload' && Math.random() > 0.8) {
      if (!confirm('Potential duplicate content detected. Continue anyway?')) return;
    }

    const now = new Date().toISOString();
    const newAsset: Partial<Asset> = {
      name: assetName.trim(),
      subtype: subtype as any,
      businessGroup,
      category: categories.join(', '),
      geography,
      isPlaceholder: mode === 'placeholder',
      lifecycleStage: 'Proposed',
      createdAt: now, modifiedAt: now, createdBy: 'Current User',
      isFavorite: false,
      linkedClaimIds: [], linkedProjectIds: [], relatedAssetIds: [],
      anchors: [], assetLevelComments: [], approvalWorkflow: null,
      currentVersionNumber: version,
      auditLog: [{ id: `audit-${Date.now()}`, timestamp: now, actor: 'Current User', action: mode === 'placeholder' ? 'Created placeholder asset' : 'Created asset with upload' }],
    };
    onCreate(newAsset);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 transform transition-all duration-300 scale-100" style={{ border: '1px solid #DEDED7' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pale flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Create New Asset</h2>
              <p className="text-sm text-gray-500 mt-0.5">Step {step} of 2: {step === 1 ? 'Select Mode' : 'Asset Details'}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* ── Step 1: Mode Selection ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Choose how you want to create this asset:</p>
              {[
                { m: 'upload' as CreateMode, icon: Upload, title: 'Upload Asset File', desc: 'Upload a complete asset file (image, video, PDF, etc.) for review and risk assessment' },
                { m: 'placeholder' as CreateMode, icon: FileText, title: 'Create Placeholder', desc: 'Create a placeholder for an asset that will be uploaded later' },
              ].map(({ m, icon: Icon, title, desc }) => (
                <button key={m} onClick={() => { setMode(m); setStep(2); }}
                  className="w-full p-5 border-2 border-pebble rounded-xl hover:border-sky hover:bg-pale/20 transition-colors text-left group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-pale rounded-lg group-hover:bg-sky/10 transition-colors">
                        <Icon className="w-6 h-6 text-sky" />
                      </div>
                      <div>
                        <h3 className="text-night font-semibold mb-1">{title}</h3>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Asset Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Upload Area */}
              {mode === 'upload' && (
                <div className="pb-2">
                  <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
                    Asset File <span className="text-red-500">*</span>
                  </label>
                  <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-sky bg-pale/30' : 'border-pebble hover:border-sky/40'}`}>
                    {uploadedFile ? (
                      <div className="flex items-center justify-between p-3 bg-earth rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-sky" />
                          <div className="text-left">
                            <div className="text-sm text-night font-medium">{uploadedFile.name}</div>
                            <div className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button onClick={() => setUploadedFile(null)} className="p-1 hover:bg-pebble rounded transition-colors">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-pulse" />
                        <p className="text-sm text-night mb-1">Drag and drop your file here, or</p>
                        <label className="inline-block">
                          <input type="file" className="hidden" onChange={handleFileInput} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
                          <span className="text-sm text-sky hover:underline cursor-pointer font-semibold">browse to upload</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-2">Supported: Images, Videos, Audio, PDF, DOCX</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 2-Column Grid for Premium visual hierarchy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Asset Name */}
                  <div>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={assetName} onChange={e => setAssetName(e.target.value)}
                      placeholder="Enter asset name..."
                      className="w-full px-3.5 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white" />
                  </div>

                  {/* Asset Subtype — typeahead */}
                  <div ref={subtypeRef}>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Asset Subtype <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button type="button" onClick={() => setSubtypeOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white hover:border-sky/40 transition-colors">
                        <span className={subtype ? 'text-night font-medium' : 'text-gray-400'}>
                          {subtype ? displayLabel(subtype) : 'Search or select subtype...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${subtypeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {subtypeOpen && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-pebble rounded-xl shadow-lg mt-1">
                          <div className="p-2 border-b border-pebble">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-earth rounded-lg">
                              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <input autoFocus type="text" value={subtypeSearch} onChange={e => setSubtypeSearch(e.target.value)}
                                placeholder="Search subtypes..."
                                className="flex-1 bg-transparent text-sm text-night focus:outline-none" />
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto py-1">
                            {recentFiltered.length > 0 && !subtypeSearch && (
                              <>
                                <div className="px-3 py-1.5 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Recently Used</span>
                                </div>
                                {recentFiltered.map(s => (
                                  <button key={s} type="button" onClick={() => handleSubtypeSelect(s)}
                                    className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-earth text-left text-sm transition-colors ${subtype === s ? 'bg-pale text-sky font-medium' : 'text-gray-700'}`}>
                                    <span className="w-4 flex-shrink-0">{subtype === s && <Check className="w-3.5 h-3.5 text-sky" />}</span>
                                    {displayLabel(s)}
                                  </button>
                                ))}
                                <div className="mx-3 my-1 border-t border-pebble" />
                              </>
                            )}
                            {(subtypeSearch ? filtered : restFiltered).map(s => (
                              <button key={s} type="button" onClick={() => handleSubtypeSelect(s)}
                                className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-earth text-left text-sm transition-colors ${subtype === s ? 'bg-pale text-sky font-medium' : 'text-gray-700'}`}>
                                <span className="w-4 flex-shrink-0">{subtype === s && <Check className="w-3.5 h-3.5 text-sky" />}</span>
                                {displayLabel(s)}
                              </button>
                            ))}
                            {filtered.length === 0 && <div className="px-4 py-3 text-sm text-gray-400 text-center">No subtypes match your search</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other / Brand Say? — conditional */}
                  {isSubtypeBrandSay && (
                    <div className="bg-pale/30 border border-sky/20 rounded-xl px-4 py-3">
                      <label className="block text-sm text-night mb-2 font-semibold">
                        Other / Brand Say? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        {(['Yes', 'No'] as const).map(opt => (
                          <button key={opt} type="button" onClick={() => setOtherBrandSay(opt === 'Yes')}
                            className={`px-5 py-2 rounded-lg border text-sm transition-colors ${otherBrandSay === (opt === 'Yes') ? 'border-sky bg-white text-sky font-semibold shadow-sm' : 'border-pebble bg-white text-gray-600 hover:border-sky/50'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Version */}
                  <div>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Version <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1.5 text-xs">decimal format, e.g. 0.1, 1.0</span>
                    </label>
                    <input type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="0.1"
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white ${!validateVersion(version) && version ? 'border-red-300 focus:ring-red-300' : 'border-pebble'}`} />
                    {!validateVersion(version) && version && (
                      <p className="text-xs text-red-500 mt-1">Enter a valid decimal version (e.g. 0.1, 1.0)</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Business Group (BG) — single select */}
                  <div ref={bgRef}>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Business Group (BG) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button type="button" onClick={() => setBgOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white hover:border-sky/40 transition-colors">
                        <span className={businessGroup ? 'text-night font-medium' : 'text-gray-400'}>{businessGroup || 'Select business group...'}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${bgOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {bgOpen && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-pebble rounded-xl shadow-lg mt-1 py-1">
                          {BUSINESS_GROUPS.map(bg => (
                            <button key={bg} type="button" onClick={() => handleBGSelect(bg)}
                              className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-earth text-left text-sm transition-colors ${businessGroup === bg ? 'text-sky font-medium' : 'text-gray-700'}`}>
                              <span className="w-4 flex-shrink-0">{businessGroup === bg && <Check className="w-3.5 h-3.5 text-sky" />}</span>
                              {bg}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category — multi-select; disabled until BG chosen */}
                  <div ref={catRef}>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button type="button" onClick={() => businessGroup && setCatOpen(o => !o)} disabled={!businessGroup}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white transition-colors ${!businessGroup ? 'opacity-50 cursor-not-allowed' : 'hover:border-sky/40'}`}>
                        <span className={categories.length ? 'text-night font-medium' : 'text-gray-400'}>
                          {categories.length === 0 ? (businessGroup ? 'Select categories...' : 'Select BG first...') : `${categories.length} selected`}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {catOpen && availableCategories.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-pebble rounded-xl shadow-lg mt-1 py-1 max-h-52 overflow-y-auto">
                          {availableCategories.map(cat => {
                            const sel = categories.includes(cat);
                            return (
                              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-earth text-left text-sm transition-colors">
                                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${sel ? 'bg-sky border-sky' : 'border-pebble'}`}>
                                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className={sel ? 'text-night font-medium' : 'text-gray-600'}>{cat}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {categories.map(cat => (
                          <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-xs text-sky">
                            {cat}
                            <button onClick={() => toggleCategory(cat)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Geography — optional multi-select */}
                  <div ref={geoRef}>
                    <label className="block text-sm text-night mb-1.5 font-semibold">
                      Geography
                    </label>
                    <div className="relative">
                      <button type="button" onClick={() => setGeoOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white hover:border-sky/40 transition-colors">
                        <span className={geography.length ? 'text-night font-medium' : 'text-gray-400'}>
                          {geography.length === 0 ? 'Select geographies...' : `${geography.length} selected`}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${geoOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {geoOpen && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-pebble rounded-xl shadow-lg mt-1 py-1 max-h-52 overflow-y-auto">
                          {REGIONS.map(r => {
                            const sel = geography.includes(r);
                            return (
                              <button key={r} type="button" onClick={() => toggleGeo(r)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-earth text-left text-sm transition-colors">
                                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${sel ? 'bg-sky border-sky' : 'border-pebble'}`}>
                                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className={sel ? 'text-night font-medium' : 'text-gray-600'}>{r}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {geography.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {geography.map(geo => (
                          <span key={geo} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-xs text-sky">
                            <Globe2 className="w-3 h-3" />{geo}
                            <button onClick={() => toggleGeo(geo)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Restrict Use toggle */}
                  <div className="flex items-center justify-between py-2.5 px-4 bg-earth rounded-xl border border-pebble">
                    <div>
                      <div className="text-sm text-night font-semibold">Restrict Use?</div>
                      <div className="text-xs text-gray-500 mt-0.5">Limit usage to authorised users only</div>
                    </div>
                    <button type="button" role="switch" aria-checked={restrictUse}
                      onClick={() => setRestrictUse(v => !v)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-1 ${restrictUse ? 'bg-sky' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${restrictUse ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following errors:</p>
                      <ul className="text-xs text-red-600 space-y-0.5">{errors.map((err, i) => <li key={i}>• {err}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors">← Back</button>
          ) : <div />}
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors">Cancel</button>
            {step === 2 && (
              <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm bg-sky text-white hover:bg-dark transition-colors">
                Create Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
