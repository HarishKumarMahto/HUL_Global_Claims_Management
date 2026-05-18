import React, { useState, useRef, useEffect } from 'react';
import {
  X, Search, Check, Upload, ChevronRight, AlertCircle, Trash2,
  FileText, Copy, Globe, Layers, Edit3, ArrowRight, CheckCircle2, ChevronDown,
  Languages, GripVertical
} from 'lucide-react';
import type { Claim } from '../../types';

// Mock data for dropdowns
const MOCK_PRODUCTS = [
  { id: 'prod-1', name: 'Dove Intensive Repair Moisturizer', type: 'Standard', geography: 'Global' },
  { id: 'prod-2', name: 'Dove Advanced Repair Serum', type: 'Standard', geography: 'North America' },
  { id: 'prod-3', name: 'Dove Regional Variant - EMEA', type: 'Regional Variant', geography: 'EMEA' },
  { id: 'prod-4', name: 'Dove Local Variant - India', type: 'Local Variant', geography: 'South Asia' },
];

const MOCK_AVAILABLE_CLAIMS = [
  { id: 'ac-1', text: 'Clinically proven to moisturize' },
  { id: 'ac-2', text: 'Dermatologist recommended' },
  { id: 'ac-3', text: 'Leaves skin feeling soft' },
];

const MOCK_SOURCE_CLAIMS = [
  { id: 'sc-1', text: '24 hour hydration', source: 'Parent Product A' },
  { id: 'sc-2', text: 'pH balanced formula', source: 'Parent Product B' },
];

const MOCK_PARENT_PRODUCTS = [
  { id: 'pp-1', name: 'Dove Core Global', geography: 'Global' },
  { id: 'pp-2', name: 'Dove Core EMEA', geography: 'EMEA' },
];

const MOCK_PARENT_CLAIMS = [
  { id: 'pc-1', parentId: 'pp-1', text: 'Provides 24-hour deep hydration' },
  { id: 'pc-2', parentId: 'pp-1', text: 'Formulated with active skin nourishing serum' },
  { id: 'pc-3', parentId: 'pp-1', text: 'Clinically proven hypoallergenic' },
  { id: 'pc-4', parentId: 'pp-2', text: 'Suitable for daily face & body care' },
  { id: 'pc-5', parentId: 'pp-2', text: 'Dermatologist recommended for EMEA sensitive skin' },
  { id: 'pc-6', parentId: 'pp-2', text: 'Restores skin protective moisture barrier' },
];

const MARKETING_CHANNELS = [
  'All Channels', 'TV', 'Digital', 'Print', 'OOH', 'Social Media', 'Email', 'In-Store'
];

const GEOGRAPHIES = [
  'Global', 'EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'
];

const MOCK_DICTIONARY: Record<string, Record<string, string>> = {
  'French': {
    'Provides 48h moisture': "Procure 48h d'hydratation",
    'Gentle on sensitive skin': 'Doux pour les peaux sensibles',
    'Clinically proven to moisturize': 'Cliniquement prouvé pour hydrater',
    'Dermatologist recommended': 'Recommandé par les dermatologues',
    'Leaves skin feeling soft': 'Laisse la peau douce',
    'For Dove Intensive Repair Moisturizer': 'Pour Dove Hydratant Réparation Intensive',
    'For Dove Advanced Repair Serum': 'Pour Dove Sérum Réparation Avancée',
    'All Channels': 'Tous les canaux'
  },
  'Spanish': {
    'Provides 48h moisture': 'Proporciona 48h de hidratación',
    'Gentle on sensitive skin': 'Suave para pieles sensibles',
    'Clinically proven to moisturize': 'Clínicamente probado para hidratar',
    'Dermatologist recommended': 'Recomendado por dermatólogos',
    'Leaves skin feeling soft': 'Deja la piel suave',
    'For Dove Intensive Repair Moisturizer': 'Para Dove Humectante Reparación Intensiva',
    'For Dove Advanced Repair Serum': 'Para Dove Sérum Reparación Avanzada',
    'All Channels': 'Todos los canales'
  },
  'German': {
    'Provides 48h moisture': 'Spendet 48h Feuchtigkeit',
    'Gentle on sensitive skin': 'Sanft zu empfindlicher Haut',
    'Clinically proven to moisturize': 'Klinisch erwiesen für Feuchtigkeit',
    'Dermatologist recommended': 'Von Dermatologen empfohlen',
    'Leaves skin feeling soft': 'Hinterlässt ein weiches Hautgefühl',
    'All Channels': 'Alle Kanäle'
  },
  'Hindi': {
    'Provides 48h moisture': '48 घंटे की नमी प्रदान करता है',
    'Gentle on sensitive skin': 'संवेदनशील त्वचा के लिए कोमल',
    'Clinically proven to moisturize': 'त्वचा को नम करने के लिए नैदानिक रूप से सिद्ध',
    'Dermatologist recommended': 'त्वचा विशेषज्ञों द्वारा अनुशंसित',
    'Leaves skin feeling soft': 'त्वचा को मुलायम महसूस कराता है',
    'All Channels': 'सभी चैनल'
  }
};

const MOCK_EXISTING_TRANSLATIONS: Record<string, Record<string, string[]>> = {
  'French': {
    'Provides 48h moisture': [
      "Procure 48h d'hydratation",
      "Fournit une hydratation durant 48h",
      "Hydratation intense pendant 48 heures"
    ],
    'Gentle on sensitive skin': [
      "Doux pour les peaux sensibles",
      "Formule douce pour peaux sensibles",
      "Idéal pour peaux réactives"
    ],
    'Clinically proven to moisturize': [
      "Cliniquement prouvé pour hydrater",
      "Efficacité hydratante prouvée cliniquement",
      "Testé cliniquement pour l'hydratation"
    ],
    'Dermatologist recommended': [
      "Recommandé par les dermatologues",
      "Approuvé par les dermatologues",
      "Conseillé par les experts de la peau"
    ],
    'Leaves skin feeling soft': [
      "Laisse la peau douce",
      "Laisse une sensation de douceur sur la peau",
      "Rend la peau incroyablement douce"
    ]
  },
  'Spanish': {
    'Provides 48h moisture': [
      "Proporciona 48h de hidratación",
      "Ofrece 48 horas de humectación profunda",
      "Brinda hidratación durante 48h"
    ],
    'Gentle on sensitive skin': [
      "Suave para pieles sensibles",
      "Apto para pieles altamente sensibles",
      "Cuidado delicado para piel sensible"
    ],
    'Clinically proven to moisturize': [
      "Clínicamente probado para hidratar",
      "Eficacia de hidratación clínicamente comprobada",
      "Probado bajo control clínico para humectar"
    ],
    'Dermatologist recommended': [
      "Recomendado por dermatólogos",
      "Avalado por dermatólogos",
      "Consejo de dermatólogos para tu piel"
    ],
    'Leaves skin feeling soft': [
      "Deja la piel suave",
      "Deja una sensación de extrema suavidad",
      "Piel suave y sedosa al tacto"
    ]
  },
  'German': {
    'Provides 48h moisture': [
      "Spendet 48h Feuchtigkeit",
      "48 Stunden intensive Feuchtigkeitspflege",
      "Sorgt für 48h Feuchtigkeit"
    ],
    'Gentle on sensitive skin': [
      "Sanft zu empfindlicher Haut",
      "Besonders mild für empfindliche Haut",
      "Für sensible Hauttypen geeignet"
    ],
    'Clinically proven to moisturize': [
      "Klinisch erwiesen für Feuchtigkeit",
      "Klinisch getestete Hydratation",
      "Klinisch bewiesene Feuchtigkeitswirkung"
    ],
    'Dermatologist recommended': [
      "Von Dermatologen empfohlen",
      "Dermatologisch getestet und empfohlen",
      "Hautärztlich empfohlen"
    ],
    'Leaves skin feeling soft': [
      "Hinterlässt ein weiches Hautgefühl",
      "Macht die Haut spürbar geschmeidig",
      "Für ein samtig-weiches Hautgefühl"
    ]
  },
  'Hindi': {
    'Provides 48h moisture': [
      "48 घंटे की नमी प्रदान करता है",
      "48 घंटे तक गहरा पोषण और नमी",
      "त्वचा को रखे 48 घंटे नम"
    ],
    'Gentle on sensitive skin': [
      "संवेदनशील त्वचा के लिए कोमल",
      "नाजुक त्वचा के लिए सुरक्षित",
      "संवेदनशील त्वचा का विशेष ख्याल"
    ],
    'Clinically proven to moisturize': [
      "त्वचा को नम करने के लिए नैदानिक रूप से सिद्ध",
      "नैदानिक परीक्षणों द्वारा प्रमाणित नमी",
      "त्वचा की नमी के लिए क्लीनिकली सिद्ध"
    ],
    'Dermatologist recommended': [
      "त्वचा विशेषज्ञों द्वारा अनुशंसित",
      "डर्मेटोलॉजिस्ट द्वारा प्रमाणित",
      "त्वचा रोग विशेषज्ञों की पहली पसंद"
    ],
    'Leaves skin feeling soft': [
      "त्वचा को मुलायम महसूस कराता है",
      "त्वचा को दे रेशमी कोमलता",
      "कोमल और सुंदर त्वचा का एहसास"
    ]
  }
};

function getMockTranslation(text: string, language: string): string {
  if (!text.trim()) return '';
  const trimmed = text.trim();
  const dict = MOCK_DICTIONARY[language];
  if (dict && dict[trimmed]) {
    return dict[trimmed];
  }
  return `[${language}] ${trimmed.replace(/^[-*]\s/, '')}`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (claims: Claim[]) => void;
  initialStep?: number;
}

export default function ClaimCreationModal({ isOpen, onClose, onCreate, initialStep = 1 }: Props) {
  const [step, setStep] = useState(initialStep);
  const [isAnimating, setIsAnimating] = useState(false);

  // Top Row State
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null as any);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [language, setLanguage] = useState('English');

  // Tabs State
  const [activeTab, setActiveTab] = useState<'Create' | 'Available Product Claims' | 'Copy Claims' | 'Localize'>('Create');

  // Workspace Data (Step 1)
  const [createdText, setCreatedText] = useState('');
  const [createdChannels, setCreatedChannels] = useState<string[]>([]);
  const [showCreatedChannelsDropdown, setShowCreatedChannelsDropdown] = useState(false);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());

  const [copySearch, setCopySearch] = useState('');
  const [selectedCopy, setSelectedCopy] = useState<Set<string>>(new Set());
  const [copyOptions, setCopyOptions] = useState({ substantiation: true, supportStrategy: true, riskAssessment: true, riskSummaries: true });

  const [selectedParentProduct, setSelectedParentProduct] = useState<any>(null);
  const [parentProductSearch, setParentProductSearch] = useState('');
  const [showParentProductDropdown, setShowParentProductDropdown] = useState(false);
  const [selectedLocalizeClaims, setSelectedLocalizeClaims] = useState<Set<string>>(new Set());
  const [parentClaimSearch, setParentClaimSearch] = useState('');

  // Step 2 State
  const [step2Claims, setStep2Claims] = useState<any[]>([]);
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['French']);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Geography State
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (geoDropdownRef.current && !geoDropdownRef.current.contains(event.target as Node)) {
        setShowGeoDropdown(false);
      }
    }
    if (showLanguageDropdown || showGeoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown, showGeoDropdown]);

  const syncClaimsWithLanguages = (newLanguages: string[]) => {
    if (newLanguages.length === 0) return;

    // We want to keep unique statements currently in step2Claims
    const uniqueStatements = Array.from(new Set(step2Claims.map(c => c.statement)));
    if (uniqueStatements.length === 0) {
      uniqueStatements.push('');
    }

    const syncedRows: any[] = [];
    uniqueStatements.forEach(stmt => {
      newLanguages.forEach(lang => {
        const existing = step2Claims.find(c => c.statement === stmt && c.language === lang);
        if (existing) {
          syncedRows.push(existing);
        } else {
          const template = step2Claims.find(c => c.statement === stmt) || {
            productId: selectedProduct?.id || 'prod-1',
            geography: selectedProduct?.geography || 'Global',
            channels: createdChannels.length > 0 ? [...createdChannels] : ['All Channels'],
            source: 'Manual'
          };
          syncedRows.push({
            ...template,
            statement: stmt,
            language: lang,
            localStatement: '',
            qualifier: ''
          });
        }
      });
    });

    setStep2Claims(syncedRows);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...step2Claims];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setStep2Claims(updated);
    setDraggedIndex(null);
  };

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreatedChannelsDropdown(false);
      }
    }
    if (showCreatedChannelsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreatedChannelsDropdown]);

  // Success message state
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleProductSelect = (p: any) => {
    setSelectedProduct(p);
    setProductSearch(p.name);
    setShowProductDropdown(false);
    setSelectedGeographies([p.geography || 'Global']);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate parsing document
    setTimeout(() => {
      const extracted = `\nExtracted from ${file.name}:\n- Provides 48h moisture\n- Gentle on sensitive skin`;
      setCreatedText(prev => prev + extracted);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 800);
  };

  const handleSaveCreate = () => {
    if (!createdText.trim()) return;
    const statements = createdText.split('\n').filter(s => s.trim() && !s.startsWith('Extracted from'));
    const newClaims = statements.map(s => ({
      statement: s.replace(/^[-*]\s/, '').trim(),
      productId: selectedProduct?.id || '',
      geography: selectedProduct?.geography || '',
      channels: [...createdChannels],
      source: 'Created'
    }));
    setStep2Claims(prev => [...prev, ...newClaims]);
    setCreatedText('');
    setCreatedChannels([]);
    showSuccess(`Saved ${newClaims.length} created claim(s)`);
  };

  const handleSaveAvailable = () => {
    if (selectedAvailable.size === 0) return;
    const newClaims = Array.from(selectedAvailable).map(id => {
      const claim = MOCK_AVAILABLE_CLAIMS.find(c => c.id === id);
      return {
        statement: claim?.text || '',
        productId: selectedProduct?.id || '',
        geography: selectedProduct?.geography || '',
        channels: [],
        source: 'Available'
      };
    });
    setStep2Claims(prev => [...prev, ...newClaims]);
    setSelectedAvailable(new Set());
    showSuccess(`Saved ${newClaims.length} available claim(s)`);
  };

  const handleSaveCopy = () => {
    if (selectedCopy.size === 0) return;
    const newClaims = Array.from(selectedCopy).map(id => {
      const claim = MOCK_SOURCE_CLAIMS.find(c => c.id === id);
      return {
        statement: claim?.text || '',
        productId: selectedProduct?.id || '',
        geography: selectedProduct?.geography || '',
        channels: [],
        source: 'Copied'
      };
    });
    setStep2Claims(prev => [...prev, ...newClaims]);
    setSelectedCopy(new Set());
    showSuccess(`Saved ${newClaims.length} copied claim(s)`);
  };

  const handleSaveLocalize = () => {
    if (selectedLocalizeClaims.size === 0) return;
    const newClaims = Array.from(selectedLocalizeClaims).map(id => {
      const parentClaim = MOCK_PARENT_CLAIMS.find(c => c.id === id);
      return {
        statement: parentClaim?.text || '',
        productId: selectedProduct?.id || '',
        geography: selectedProduct?.geography || '',
        channels: [],
        source: 'Localized'
      };
    });
    setStep2Claims(prev => [...prev, ...newClaims]);
    setSelectedLocalizeClaims(new Set());
    showSuccess(`Saved ${newClaims.length} localized claim(s)`);
  };

  const goToStep2 = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let currentStaged = [...step2Claims];
      if (currentStaged.length === 0) {
        currentStaged = [{ statement: '', productId: selectedProduct?.id || 'prod-1', geography: selectedProduct?.geography || 'Global', channels: createdChannels.length > 0 ? [...createdChannels] : ['All Channels'], source: 'Manual' }];
      }

      // Generate the row-wise multiplication for each selected language!
      const expandedRows: any[] = [];
      currentStaged.forEach(staged => {
        if (staged.language) {
          expandedRows.push(staged);
        } else {
          targetLanguages.forEach(lang => {
            expandedRows.push({
              ...staged,
              language: lang,
              localStatement: staged.localStatement || '',
              qualifier: staged.qualifier || ''
            });
          });
        }
      });

      setStep2Claims(expandedRows);
      setStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const goToStep1 = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(1);
      setIsAnimating(false);
    }, 300);
  };

  const handleStep2Change = (index: number, field: string, value: any) => {
    const updated = [...step2Claims];
    updated[index] = { ...updated[index], [field]: value };
    setStep2Claims(updated);
  };

  const handleChannelToggle = (index: number, channel: string) => {
    const updated = [...step2Claims];
    const channels = updated[index].channels || [];
    if (channels.includes(channel)) {
      updated[index].channels = channels.filter((c: string) => c !== channel);
    } else {
      updated[index].channels = [...channels, channel];
    }
    setStep2Claims(updated);
  };

  const removeStep2Row = (index: number) => {
    setStep2Claims(step2Claims.filter((_, i) => i !== index));
  };

  const addStep2Row = () => {
    setStep2Claims([...step2Claims, { statement: '', productId: selectedProduct?.id || 'prod-1', geography: selectedProduct?.geography || 'Global', channels: createdChannels.length > 0 ? [...createdChannels] : ['All Channels'], source: 'Manual', localStatement: '', qualifier: '', language: targetLanguages[0] || 'French' }]);
  };

  const handleFinalSubmit = () => {
    const valid = step2Claims.filter(c => c.statement.trim());
    if (valid.length === 0) return;

    const newClaims: Claim[] = valid.map((c, i) => ({
      id: `CLM-NEW-${Date.now()}-${i}`,
      statement: c.statement,
      status: 'Draft',
      claimType: 'Global',
      lifecycleStage: 'Proposed',
      version: 'v1.0',
      channels: c.channels || [],
      geographies: selectedGeographies.length > 0 ? [...selectedGeographies] : [selectedProduct?.geography || 'Global'],
      brands: [],
      categories: [],
      relatedProjects: [],
      linkedProducts: [selectedProduct?.id || 'prod-1'],
      substantiationDocs: [],
      riskAssessments: [],
      supportStrategy: '',
      history: [],
      finalRiskLevel: null,
      finalRiskSummary: {
        claimClassificationLevel: null,
        reasons: [],
        reason: null,
        claimsForumSummary: null,
        legalSummary: null,
        raSummary: null,
        marketingFeedback: null,
        marketingRiskSignoff: false,
        iRAOutput: null,
      },
      updatedAt: new Date().toISOString()
    }));

    onCreate(newClaims);
    onClose();
  };

  if (!isOpen) return null;

  const isStep2Valid = step2Claims.some(c => c.statement.trim());

  const tabs = [
    { id: 'Create', icon: Edit3, label: 'Create' },
    { id: 'Available Product Claims', icon: Layers, label: 'Available Product Claims' },
    { id: 'Copy Claims', icon: Copy, label: 'Copy' },
    { id: 'Localize', icon: Globe, label: 'Localize' }
  ];

  return (
    <div className="fixed top-[60px] bottom-0 left-0 right-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">

      {/* Global Success Toast */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center text-sky">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">
              {step === 1 ? 'Start Claim Creation' : 'Review & Finalize Claims'}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 1 ? 'Step 1 of 2: Gather statements from various sources' : 'Step 2 of 2: Assign channels and finalize details'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-night hover:bg-earth rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* --- STEP 1 --- */}
      <div className={`flex flex-col flex-1 overflow-hidden bg-earth/20 transition-opacity duration-300 ${step === 1 ? 'opacity-100 flex' : 'opacity-0 hidden'} ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Top Context Bar */}
        <div className="px-6 py-4 bg-white border-b border-pebble grid grid-cols-2 gap-6 flex-shrink-0 shadow-sm z-20">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product</label>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                  setSelectedProduct(null);
                }}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="Search and select product..."
                className="w-full px-3 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
              />
              {showProductDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-pebble rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProductSelect(p)}
                      className="w-full text-left px-4 py-3 text-sm text-night hover:bg-earth transition-colors flex items-center justify-between border-b border-pebble/50 last:border-0"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-sky bg-sky/10 px-2 py-0.5 rounded-full">{p.type}</span>
                    </button>
                  ))}
                  {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={geoDropdownRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Geographies</label>
            <button
              type="button"
              onClick={() => setShowGeoDropdown(!showGeoDropdown)}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium text-night hover:bg-pebble/25 focus:outline-none transition-all cursor-pointer w-full text-left"
            >
              <div className="flex flex-wrap gap-1 max-w-[90%]">
                {selectedGeographies.length === 0 ? (
                  <span className="text-gray-400 font-normal">Select geographies...</span>
                ) : (
                  selectedGeographies.map(geo => (
                    <span key={geo} className="px-2 py-0.5 bg-sky text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-sm">
                      {geo}
                    </span>
                  ))
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showGeoDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showGeoDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-pebble rounded-xl shadow-xl z-30 p-2 overflow-hidden animate-in fade-in slide-in-from-top-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-3 py-1.5 border-b border-pebble mb-1">Available Geographies</div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 animate-in fade-in duration-200">
                  {GEOGRAPHIES.map(geo => {
                    const isChecked = selectedGeographies.includes(geo);
                    const isInherited = selectedProduct && selectedProduct.geography === geo;
                    return (
                      <button
                        key={geo}
                        type="button"
                        onClick={() => {
                          let updated;
                          if (isChecked) {
                            updated = selectedGeographies.filter(g => g !== geo);
                          } else {
                            updated = [...selectedGeographies, geo];
                          }
                          setSelectedGeographies(updated);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isChecked
                            ? 'bg-sky/10 text-sky'
                            : 'text-gray-600 hover:bg-earth hover:text-night'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{geo}</span>
                          {isInherited && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-sky-600 bg-sky/20 px-1.5 py-0.5 rounded-md">Inherited</span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-sky border-sky' : 'border-gray-300 bg-white'
                          }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 60/40 Split: Left = Tabs+Content, Right = Saved Changes */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT 60% — Tabs Navigation + Tab Content */}
          <div className="flex flex-col overflow-hidden border-r border-pebble" style={{ width: '60%' }}>

            {/* Custom Tabs Navigation */}
            <div className="flex bg-earth/15 p-1.5 border-b border-pebble flex-shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-white text-sky shadow-sm ring-1 ring-pebble/40'
                        : 'text-gray-500 hover:text-night hover:bg-earth'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col relative bg-white">

              {/* 1. CREATE TAB */}
              {activeTab === 'Create' && (
                <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-night">Type or paste claim statements with a line break</h3>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-pebble text-night font-semibold rounded-xl text-sm hover:bg-earth hover:border-sky/40 transition-all shadow-sm active:scale-95 disabled:opacity-70"
                      >
                        {isUploading ? (
                          <span className="w-4 h-4 border-2 border-sky border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-sky" />
                        )}
                        {isUploading ? 'Extracting...' : 'Upload Document'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={createdText}
                    onChange={(e) => setCreatedText(e.target.value)}
                    placeholder="e.g. Clinically proven to hydrate for 24 hours&#10;Dermatologist tested..."
                    className="flex-1 min-h-[140px] w-full p-4 border border-pebble rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky/10 focus:border-sky transition-all resize-none bg-white shadow-inner"
                  />

                  {/* Marketing Channel Multi-Select Dropdown */}
                  <div ref={dropdownRef} className="mt-4 flex flex-col items-start relative z-30">
                    <div className="w-full max-w-sm relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">
                        Marketing Channels <span className="text-red-500">*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowCreatedChannelsDropdown(!showCreatedChannelsDropdown)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-pebble rounded-xl text-sm font-medium text-night hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-sky/10 transition-all cursor-pointer shadow-sm"
                      >
                        <span className={`truncate mr-2 ${createdChannels.length === 0 ? "text-gray-400" : "text-night font-semibold"}`}>
                          {createdChannels.length === 0
                            ? 'Select marketing channels...'
                            : createdChannels.join(', ')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showCreatedChannelsDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showCreatedChannelsDropdown && (
                        <div className="absolute left-0 top-full mt-1.5 bg-white border border-pebble rounded-2xl shadow-xl z-50 p-4 w-72 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex flex-col gap-2">
                            {MARKETING_CHANNELS.map(channel => {
                              const isSelected = createdChannels.includes(channel);
                              return (
                                <label
                                  key={channel}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-earth cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      if (isSelected) {
                                        setCreatedChannels(createdChannels.filter(c => c !== channel));
                                      } else {
                                        setCreatedChannels([...createdChannels, channel]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-gray-700">{channel}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSaveCreate}
                      disabled={!createdText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-sky/20"
                    >
                      <Check className="w-4 h-4" /> Keep Selection
                    </button>
                  </div>
                </div>
              )}

              {/* 2. AVAILABLE CLAIMS TAB */}
              {activeTab === 'Available Product Claims' && (
                <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-night">Select existing claims of the product(s)</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedAvailable(new Set(MOCK_AVAILABLE_CLAIMS.map(c => c.id)))} className="px-3 py-1.5 text-xs font-semibold text-sky bg-sky/10 rounded-lg hover:bg-sky/20 transition-colors">Select All</button>
                      <button onClick={() => setSelectedAvailable(new Set())} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-night hover:bg-earth rounded-lg transition-colors">Clear</button>
                    </div>
                  </div>

                  <div className="flex-1 border border-pebble rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-earth/50 sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="w-14 px-5 py-3 border-b border-pebble" />
                            <th className="px-5 py-3 text-left font-bold text-gray-600 border-b border-pebble">Claim Statement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pebble">
                          {MOCK_AVAILABLE_CLAIMS.map(claim => {
                            const isSel = selectedAvailable.has(claim.id);
                            return (
                              <tr
                                key={claim.id}
                                onClick={() => {
                                  const next = new Set(selectedAvailable);
                                  next.has(claim.id) ? next.delete(claim.id) : next.add(claim.id);
                                  setSelectedAvailable(next);
                                }}
                                className={`cursor-pointer transition-colors ${isSel ? 'bg-sky/5' : 'hover:bg-earth'}`}
                              >
                                <td className="px-5 py-4">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSel ? 'bg-sky border-sky scale-110' : 'border-gray-300 bg-white'}`}>
                                    <Check className={`w-3 h-3 text-white transition-opacity ${isSel ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`font-medium ${isSel ? 'text-sky' : 'text-night'}`}>{claim.text}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end items-center mt-6">
                    <button
                      onClick={handleSaveAvailable}
                      disabled={selectedAvailable.size === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-sky/20"
                    >
                      <Check className="w-4 h-4" /> Keep Selection {selectedAvailable.size > 0 ? `(${selectedAvailable.size})` : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. COPY CLAIMS TAB */}
              {activeTab === 'Copy Claims' && (
                <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-[1fr_2.5fr] gap-4 mb-4">
                    {/* Target Info */}
                    <div className="border border-pebble rounded-2xl px-5 py-3 bg-gradient-to-br from-earth/50 to-white shadow-sm flex flex-col justify-center">
                      <div className="text-base font-bold text-night truncate" title={productSearch || 'None Selected'}>
                        {productSearch || 'None Selected'}
                      </div>
                      {selectedProduct?.geography && (
                        <div className="text-xs font-medium text-sky mt-0.5 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />{selectedProduct.geography}
                        </div>
                      )}
                    </div>

                    {/* Source Search */}
                    <div className="border border-pebble rounded-2xl px-5 py-3 bg-white shadow-sm flex flex-col justify-center">
                      <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={copySearch}
                          onChange={e => setCopySearch(e.target.value)}
                          placeholder="Find Source Product..."
                          className="w-full pl-11 pr-4 py-2.5 bg-white border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 border border-pebble rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col mb-4">
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-earth/50 sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="w-14 px-5 py-3 border-b border-pebble" />
                            <th className="px-5 py-3 text-left font-bold text-gray-600 border-b border-pebble">Claim Statement</th>
                            <th className="px-5 py-3 text-left font-bold text-gray-600 border-b border-pebble">Source Product</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pebble">
                          {MOCK_SOURCE_CLAIMS.filter(c => c.text.toLowerCase().includes(copySearch.toLowerCase())).map(claim => {
                            const isSel = selectedCopy.has(claim.id);
                            return (
                              <tr
                                key={claim.id}
                                onClick={() => {
                                  const next = new Set(selectedCopy);
                                  next.has(claim.id) ? next.delete(claim.id) : next.add(claim.id);
                                  setSelectedCopy(next);
                                }}
                                className={`cursor-pointer transition-colors ${isSel ? 'bg-sky/5' : 'hover:bg-earth'}`}
                              >
                                <td className="px-5 py-4">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSel ? 'bg-sky border-sky scale-110' : 'border-gray-300 bg-white'}`}>
                                    <Check className={`w-3 h-3 text-white transition-opacity ${isSel ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-medium text-night">{claim.text}</td>
                                <td className="px-5 py-4 text-gray-500 text-xs">
                                  <span className="bg-earth px-2.5 py-1 rounded-md font-semibold">{claim.source}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-pebble">
                    <div className="flex flex-wrap items-center gap-5 bg-earth/50 px-4 py-2.5 rounded-xl border border-pebble">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Also Copy:</span>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={copyOptions.substantiation} onChange={e => setCopyOptions(p => ({ ...p, substantiation: e.target.checked }))} className="w-4 h-4 accent-sky rounded" />
                        <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Substantiation</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={copyOptions.supportStrategy} onChange={e => setCopyOptions(p => ({ ...p, supportStrategy: e.target.checked }))} className="w-4 h-4 accent-sky rounded" />
                        <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Support Strategy</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={copyOptions.riskAssessment} onChange={e => setCopyOptions(p => ({ ...p, riskAssessment: e.target.checked }))} className="w-4 h-4 accent-sky rounded" />
                        <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Risk Level Assessment</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={copyOptions.riskSummaries} onChange={e => setCopyOptions(p => ({ ...p, riskSummaries: e.target.checked }))} className="w-4 h-4 accent-sky rounded" />
                        <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Risk Summaries</span>
                      </label>
                    </div>
                    <button
                      onClick={handleSaveCopy}
                      disabled={selectedCopy.size === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-sky/20"
                    >
                      <Check className="w-4 h-4" /> Keep Selection {selectedCopy.size > 0 ? `(${selectedCopy.size})` : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* 4. LOCALIZE TAB */}
              {activeTab === 'Localize' && (
                <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">Parent Product:</span>
                    <div className="relative w-72 flex items-center bg-white border border-pebble rounded-xl px-3 py-1.5 shadow-sm">
                      <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={parentProductSearch}
                        onChange={(e) => {
                          setParentProductSearch(e.target.value);
                          setShowParentProductDropdown(true);
                        }}
                        onFocus={(e) => {
                          e.currentTarget.select();
                          setShowParentProductDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowParentProductDropdown(false), 200)}
                        placeholder="Search parent product..."
                        className="w-full bg-transparent text-sm font-bold text-night focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                      />
                      {selectedParentProduct && (
                        <span className="text-xs font-semibold text-sky bg-sky/10 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-2">
                          <Globe className="w-3 h-3" /> {selectedParentProduct.geography}
                        </span>
                      )}
                      {showParentProductDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                          {MOCK_PARENT_PRODUCTS.filter(p => {
                            if (selectedParentProduct && parentProductSearch === selectedParentProduct.name) {
                              return true;
                            }
                            return p.name.toLowerCase().includes(parentProductSearch.toLowerCase());
                          }).map(p => (
                            <button
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedParentProduct(p);
                                setParentProductSearch(p.name);
                                setShowParentProductDropdown(false);
                                setSelectedLocalizeClaims(new Set());
                                setParentClaimSearch('');
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center justify-between border-b border-pebble/50 last:border-0"
                            >
                              <span className="font-semibold">{p.name}</span>
                              <span className="text-xs text-sky bg-sky/10 px-2 py-0.5 rounded-full">{p.geography}</span>
                            </button>
                          ))}
                          {MOCK_PARENT_PRODUCTS.filter(p => {
                            if (selectedParentProduct && parentProductSearch === selectedParentProduct.name) {
                              return true;
                            }
                            return p.name.toLowerCase().includes(parentProductSearch.toLowerCase());
                          }).length === 0 && (
                              <div className="px-4 py-2.5 text-sm text-gray-500 text-center">No parent products found</div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedParentProduct ? (
                    <>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-sm font-bold text-night truncate max-w-[200px]">
                          Claims for {selectedParentProduct.name}
                        </span>

                        {/* Compact Claims Search Input */}
                        <div className="relative flex-1 max-w-xs">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={parentClaimSearch}
                            onChange={e => setParentClaimSearch(e.target.value)}
                            placeholder="Search claims..."
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-pebble rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all shadow-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const activeClaims = MOCK_PARENT_CLAIMS.filter(c => c.parentId === selectedParentProduct.id && c.text.toLowerCase().includes(parentClaimSearch.toLowerCase()));
                              setSelectedLocalizeClaims(new Set(activeClaims.map(c => c.id)));
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-sky bg-sky/10 rounded-lg hover:bg-sky/20 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => setSelectedLocalizeClaims(new Set())}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-night hover:bg-earth rounded-lg transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 border border-pebble rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col mb-4">
                        <div className="flex-1 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-earth/50 sticky top-0 backdrop-blur-md">
                              <tr>
                                <th className="w-14 px-5 py-3 border-b border-pebble" />
                                <th className="px-5 py-3 text-left font-bold text-gray-600 border-b border-pebble">Claim Statement</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-pebble">
                              {MOCK_PARENT_CLAIMS.filter(c => c.parentId === selectedParentProduct.id && c.text.toLowerCase().includes(parentClaimSearch.toLowerCase())).map(claim => {
                                const isSel = selectedLocalizeClaims.has(claim.id);
                                return (
                                  <tr
                                    key={claim.id}
                                    onClick={() => {
                                      const next = new Set(selectedLocalizeClaims);
                                      next.has(claim.id) ? next.delete(claim.id) : next.add(claim.id);
                                      setSelectedLocalizeClaims(next);
                                    }}
                                    className={`cursor-pointer transition-colors ${isSel ? 'bg-sky/5' : 'hover:bg-earth'}`}
                                  >
                                    <td className="px-5 py-4">
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSel ? 'bg-sky border-sky scale-110' : 'border-gray-300 bg-white'}`}>
                                        <Check className={`w-3 h-3 text-white transition-opacity ${isSel ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-night">{claim.text}</td>
                                  </tr>
                                );
                              })}
                              {MOCK_PARENT_CLAIMS.filter(c => c.parentId === selectedParentProduct.id && c.text.toLowerCase().includes(parentClaimSearch.toLowerCase())).length === 0 && (
                                <tr>
                                  <td colSpan={2} className="px-5 py-8 text-center text-sm text-gray-400 font-medium">No matching claims found</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 border border-pebble rounded-2xl border-dashed bg-white shadow-inner flex flex-col items-center justify-center p-10 mb-4">
                      <Globe className="w-12 h-12 text-gray-300 mb-3" />
                      <span className="text-sm font-semibold text-gray-400">Please select a parent product from the dropdown to see its claims</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveLocalize}
                      disabled={selectedLocalizeClaims.size === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-sky/20"
                    >
                      <Check className="w-4 h-4" /> Keep Selection {selectedLocalizeClaims.size > 0 ? `(${selectedLocalizeClaims.size})` : ''}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
          {/* END LEFT 60% */}

          {/* RIGHT 40% — Saved Changes Panel */}
          <div className="flex flex-col overflow-hidden bg-slate-50/70" style={{ width: '40%' }}>
            {/* Panel Header */}
            <div className="px-5 py-3.5 border-b border-pebble flex items-center gap-2 flex-shrink-0 bg-white shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-sky" />
              <span className="text-sm font-bold text-night">Selected Claims</span>
              {step2Claims.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-sky text-white text-xs font-bold rounded-full">{step2Claims.length}</span>
              )}
            </div>
            {/* Claims List */}
            <div className="flex-1 overflow-y-auto p-4">
              {step2Claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-earth/60 flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-gray-300" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-400 mb-1">No claims staged yet</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">Use the tabs on the left, then click \"Keep Selection\" to stage claims here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(['Created', 'Available', 'Copied', 'Localized'] as const).map(source => {
                    const sourceClaims = step2Claims
                      .map((c: any, i: number) => ({ ...c, _idx: i }))
                      .filter((c: any) => c.source === source);
                    if (sourceClaims.length === 0) return null;
                    const cfgMap: Record<string, { color: string; bg: string; border: string; Icon: any }> = {
                      Created: { color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', Icon: Edit3 },
                      Available: { color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', Icon: Layers },
                      Copied: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', Icon: Copy },
                      Localized: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: Globe },
                    };
                    const { color, bg, border, Icon } = cfgMap[source];
                    return (
                      <div key={source} className={`rounded-xl border ${border} overflow-hidden shadow-sm`}>
                        <div className={`px-3 py-2 ${bg} flex items-center gap-2 border-b ${border}`}>
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{source}</span>
                          <span className={`ml-auto text-xs font-bold ${color} bg-white/70 px-1.5 py-0.5 rounded-md`}>{sourceClaims.length}</span>
                        </div>
                        <div className="divide-y divide-pebble/40 bg-white">
                          {sourceClaims.map((claim: any) => (
                            <div key={claim._idx} className="flex items-start gap-2 px-3 py-2.5 group hover:bg-earth/30 transition-colors animate-in fade-in duration-200">
                              <span className="flex-1 text-xs font-medium text-night leading-relaxed line-clamp-3">{claim.statement}</span>
                              <button
                                onClick={() => removeStep2Row(claim._idx)}
                                className="flex-shrink-0 mt-0.5 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* END RIGHT 40% */}

        </div>
        {/* END 60/40 Split */}

        {/* Step 1 Footer */}
        <div className="px-6 py-4 bg-white border-t border-pebble flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: staged count */}
          <div className="text-sm font-medium text-gray-500">
            {step2Claims.length > 0 ? (
              <span className="flex items-center gap-1.5 text-sky bg-sky/10 px-3 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-4 h-4" /> {step2Claims.length} claim(s) staged
              </span>
            ) : (
              <span className="text-gray-400">Gather statements above to continue</span>
            )}
          </div>

          {/* Right: two action buttons */}
          <div className="flex items-center gap-3">
            {/* Secondary: go to Qualifiers & Translation (Step 2) */}
            <button
              onClick={goToStep2}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-pebble text-night rounded-xl text-sm font-bold hover:bg-earth hover:border-sky/30 transition-all shadow-sm active:scale-95 group"
            >
              <Languages className="w-4 h-4 text-sky" />
              Qualifiers &amp; Translation
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Primary: create claim directly */}
            <button
              onClick={handleFinalSubmit}
              disabled={step2Claims.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Add Claim
            </button>
          </div>
        </div>
      </div>

      {/* --- STEP 2 --- */}
      <div className={`flex flex-col flex-1 overflow-hidden bg-earth/30 transition-opacity duration-300 ${step === 2 ? 'opacity-100 flex' : 'opacity-0 hidden'} ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[96vw] mx-auto w-full">
            {step2Claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white border border-pebble rounded-2xl border-dashed">
                <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-night mb-1">No claims inherited</h3>
                <p className="text-sm">Please go back to Step 1 and save some claim statements to proceed.</p>
                <button onClick={goToStep1} className="mt-4 px-4 py-2 bg-earth text-night rounded-lg text-sm font-semibold hover:bg-pebble transition-colors cursor-pointer">Return to Step 1</button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Custom Multi-Select Target Language Selector Dropdown Header */}
                <div className="bg-white border border-pebble rounded-2xl p-5 mb-5 shadow-sm flex items-center justify-between overflow-visible relative">
                  <div className="max-w-[60%]">
                    <h3 className="text-base font-bold text-night mb-1">Target Language Selection</h3>
                    <p className="text-sm text-gray-500">Select multiple languages. Localized version rows will automatically expand for each language selection for auto-translation.</p>
                  </div>

                  <div className="relative" ref={langDropdownRef}>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Translate to:</span>
                    <button
                      type="button"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-earth border border-pebble rounded-xl text-sm font-bold text-night hover:bg-pebble/40 focus:outline-none transition-all cursor-pointer min-w-[220px]"
                    >
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {targetLanguages.length === 0 ? (
                          <span className="text-gray-400">Select languages...</span>
                        ) : (
                          targetLanguages.map(lang => (
                            <span key={lang} className="px-2 py-0.5 bg-sky text-white text-xs font-bold rounded">
                              {lang}
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showLanguageDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-pebble rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-3 py-1.5 border-b border-pebble mb-1">Languages ({Object.keys(MOCK_DICTIONARY).length})</div>
                        <div className="max-h-60 overflow-y-auto space-y-0.5">
                          {Object.keys(MOCK_DICTIONARY).map(lang => {
                            const isChecked = targetLanguages.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  let updated;
                                  if (isChecked) {
                                    updated = targetLanguages.filter(l => l !== lang);
                                  } else {
                                    updated = [...targetLanguages, lang];
                                  }
                                  setTargetLanguages(updated);
                                  syncClaimsWithLanguages(updated);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all ${isChecked
                                    ? 'bg-sky/10 text-sky'
                                    : 'text-gray-600 hover:bg-earth hover:text-night'
                                  }`}
                              >
                                <span>{lang}</span>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-sky border-sky' : 'border-gray-300 bg-white'
                                  }`}>
                                  {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-pebble rounded-2xl overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-earth/40 border-b border-pebble text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3 w-16 text-center">Order</th>
                        <th className="px-4 py-3 w-1/3">Global Statement</th>
                        <th className="px-2 py-3 w-12 text-center"></th>
                        <th className="px-4 py-3 w-1/3">Local Statement</th>
                        <th className="px-4 py-3 w-1/4">Qualifier</th>
                        <th className="px-4 py-3 w-40">Marketing Channel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step2Claims.map((claim, index) => {
                        const existingOptions = MOCK_EXISTING_TRANSLATIONS[claim.language]?.[claim.statement.trim()] || [];

                        return (
                          <tr
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`border-b border-pebble/50 last:border-0 hover:bg-earth/10 transition-colors group ${draggedIndex === index ? 'opacity-40' : ''}`}
                          >
                            {/* Order */}
                            <td className="px-4 py-3.5 text-center text-sm font-semibold text-night flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                              <span>{index + 1}</span>
                            </td>

                            {/* Global Statement */}
                            <td className="px-4 py-3.5">
                              <textarea
                                value={claim.statement}
                                onChange={(e) => handleStep2Change(index, 'statement', e.target.value)}
                                className="w-full px-3 py-2 bg-earth/30 border border-pebble rounded-xl text-sm font-medium text-night focus:bg-white focus:ring-2 focus:ring-sky/50 focus:border-sky focus:outline-none transition-all resize-y"
                                rows={2}
                              />
                            </td>

                            {/* Translate Button Column */}
                            <td className="px-2 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const translated = getMockTranslation(claim.statement, claim.language);
                                  handleStep2Change(index, 'localStatement', translated);
                                }}
                                title={`Quick Translate Statement to ${claim.language}`}
                                className="p-2 bg-sky/10 text-sky hover:bg-sky hover:text-white rounded-xl transition-all shadow-sm active:scale-90 cursor-pointer"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </td>

                            {/* Local Statement */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-earth text-night text-[9px] font-extrabold uppercase tracking-wider rounded-md border border-pebble">
                                    {claim.language}
                                  </span>
                                </div>
                                <textarea
                                  value={claim.localStatement || ''}
                                  onChange={(e) => handleStep2Change(index, 'localStatement', e.target.value)}
                                  placeholder={`Translation in ${claim.language}...`}
                                  className="w-full px-3 py-2 bg-earth/30 border border-pebble rounded-xl text-sm font-medium text-night focus:bg-white focus:ring-2 focus:ring-sky/50 focus:border-sky focus:outline-none transition-all resize-y"
                                  rows={2}
                                />
                                {existingOptions.length > 0 && (
                                  <div className="flex items-center gap-1 bg-sky/5 border border-sky/20 rounded-lg px-2 py-1 text-xs text-sky-700 font-semibold max-w-full">
                                    <span className="text-[9px] uppercase tracking-wider text-sky-500 font-bold shrink-0">Select Existing:</span>
                                    <select
                                      value={existingOptions.includes(claim.localStatement) ? claim.localStatement : ''}
                                      onChange={(e) => handleStep2Change(index, 'localStatement', e.target.value)}
                                      className="bg-transparent text-sky-800 font-extrabold focus:outline-none cursor-pointer flex-1 truncate text-xs w-full min-w-0"
                                    >
                                      <option value="" className="text-gray-500 font-medium">-- Custom --</option>
                                      {existingOptions.map(opt => (
                                        <option key={opt} value={opt} className="text-night font-medium">{opt}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Qualifier */}
                            <td className="px-4 py-3.5 relative">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={claim.qualifier || ''}
                                  onChange={(e) => handleStep2Change(index, 'qualifier', e.target.value)}
                                  placeholder="Enter qualifier"
                                  className="w-full pl-3 pr-10 py-2 bg-earth/30 border border-pebble rounded-xl text-sm font-medium text-night focus:bg-white focus:ring-2 focus:ring-sky/50 focus:border-sky focus:outline-none transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const translated = getMockTranslation(claim.qualifier || '', claim.language);
                                    handleStep2Change(index, 'qualifier', translated);
                                  }}
                                  title={`Quick Translate Qualifier to ${claim.language}`}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-sky hover:bg-sky/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Languages className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                            {/* Marketing Channel */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {claim.channels && claim.channels.length > 0 ? (
                                  claim.channels.map(c => (
                                    <span key={c} className="px-2 py-0.5 bg-sky/10 text-sky text-xs font-semibold rounded-md">
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium">None</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={addStep2Row}
                  className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-pebble text-gray-500 font-bold rounded-2xl w-full justify-center hover:bg-white hover:text-sky hover:border-sky/50 transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5" /> Add Translation Row
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 Footer */}
        <div className="px-6 py-4 bg-white border-t border-pebble flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={goToStep1}
              className="px-6 py-2.5 border border-pebble rounded-xl text-sm font-bold text-gray-600 hover:bg-earth hover:text-night transition-all cursor-pointer"
            >
              Back to Step 1
            </button>

            <div className="flex items-center gap-3 ml-4">
              <div className="w-8 h-8 rounded-full bg-white border border-pebble flex items-center justify-center font-bold text-gray-300 text-sm">1</div>
              <div className="w-8 h-8 rounded-full bg-night flex items-center justify-center font-bold text-white text-sm shadow-sm">2</div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-sm font-medium text-gray-500">
              {step2Claims.filter(c => c.statement.trim()).length} of {step2Claims.length} ready
            </div>
            <button
              onClick={handleFinalSubmit}
              disabled={!isStep2Valid}
              className="flex items-center gap-2 px-8 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark transition-all disabled:opacity-50 shadow-md shadow-sky/20 active:scale-95 cursor-pointer"
            >
              Create & Finalize <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Just add Plus for the blank row button
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);