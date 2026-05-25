import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, ChevronDown, RefreshCw, Info, Check, FolderPlus } from 'lucide-react';
import { Project, BUSINESS_GROUPS, CATEGORIES, PROJECT_TYPES, PROJECT_SCOPES, REGIONS, generateTeamMembersForProject } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id'>, navigateNext?: boolean) => void;
  existingProjectNames: string[];
}

const INNOFLEX_PROJECTS = [
  'INX-2026-001 — Dove Intensive Repair',
  'INX-2026-002 — Lipton Green Tea Launch',
  'INX-2026-003 — Vaseline Relaunch APAC',
  'INX-2026-004 — Axe Premium Line',
  'INX-2026-005 — Knorr Reduced Salt',
  'INX-2026-006 — TRESemmé Bond Plex',
  'INX-2026-007 — Sunsilk Vitamin E',
  'INX-2026-008 — Comfort Intense Fabric',
  'INX-2026-009 — Domestos Bleach Refresh',
  'INX-2026-010 — Surf Excel Quick Wash',
];

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onToggle,
  error,
  disabled = false,
  disabledMessage,
  required = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  error?: string;
  disabled?: boolean;
  disabledMessage?: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = selected.length === 0
    ? placeholder
    : selected.length <= 2
    ? selected.join(', ')
    : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {disabled ? (
        <div className="flex items-center gap-2 p-2 bg-earth rounded-xl border border-pebble text-gray-400 text-sm">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{disabledMessage || 'Select required fields first'}</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-2 border rounded-xl text-sm text-left flex items-center justify-between transition-all bg-white cursor-pointer ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-pebble hover:border-sky focus:ring-2 focus:ring-sky/20 focus:border-sky'
            }`}
          >
            <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-night font-semibold'}`}>
              {displayValue}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-pebble rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto py-1">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400 italic">No options available</div>
              ) : (
                options.map((opt) => {
                  const isChecked = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onToggle(opt)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-earth cursor-pointer ${
                        isChecked ? 'bg-sky/5 font-semibold text-sky' : 'text-gray-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked ? 'bg-sky border-sky' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                      </div>
                      <span className="truncate">{opt}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  fieldKey: string;
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  isDuplicate?: boolean;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

const TextField = ({
  label,
  fieldKey,
  value,
  onChange,
  error,
  isDuplicate,
  placeholder,
  required = false,
  type = 'text',
}: TextFieldProps) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(fieldKey, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-xl text-sm text-night font-medium focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all ${
        error || isDuplicate ? 'border-red-400 focus:border-red-500' : 'border-pebble hover:border-sky focus:border-sky'
      }`}
    />
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
    {isDuplicate && !error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5" />A project with this name already exists
      </p>
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  fieldKey: string;
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
  error?: string;
  required?: boolean;
}

const SelectField = ({
  label,
  fieldKey,
  value,
  onChange,
  options,
  error,
  required = false,
}: SelectFieldProps) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(fieldKey, e.target.value)}
        className={`w-full px-4 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all appearance-none cursor-pointer ${
          error ? 'border-red-400 text-night' : 'border-pebble hover:border-sky focus:border-sky text-night bg-white'
        } ${!value ? 'text-gray-400 font-normal' : ''}`}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map(opt => (
          <option key={opt} value={opt} className="text-night">{opt}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
  </div>
);

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  existingProjectNames,
  initialData,
}: CreateProjectModalProps & { initialData?: Omit<Project, "id"> | null }) {
  const emptyForm = {
    name: '',
    description: '',
    businessGroup: '',
    category: [] as string[],
    type: '',
    scope: '',
    region: [] as string[],
    innoflexProjectName: '',
    blgProjectName: '',
    startDate: new Date().toISOString().split('T')[0],
    evaluationDate: '',
    launchDate: '',
  };

  const [formData, setFormData] = useState<any>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [externalRefType, setExternalRefType] = useState<'innoflex' | 'blg' | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const categories = initialData.category
          ? String(initialData.category).split(',').map(s => s.trim()).filter(Boolean)
          : [];
        const regions = initialData.region
          ? String(initialData.region).split(',').map(s => s.trim()).filter(Boolean)
          : [];

        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          businessGroup: initialData.businessGroup || '',
          category: categories,
          type: initialData.type || '',
          scope: initialData.scope || '',
          region: regions,
          innoflexProjectName: initialData.innoflexProjectName || '',
          blgProjectName: initialData.blgProjectName || '',
          startDate: initialData.startDate || new Date().toISOString().split('T')[0],
          evaluationDate: initialData.evaluationDate || '',
          launchDate: initialData.launchDate || '',
        });

        if (initialData.innoflexProjectName) {
          setExternalRefType('innoflex');
        } else if (initialData.blgProjectName) {
          setExternalRefType('blg');
        } else {
          setExternalRefType(null);
        }
      } else {
        setFormData(emptyForm);
        setExternalRefType(null);
      }
      setErrors({});
      setIsDuplicateName(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'businessGroup') {
        updated.category = [];
      }
      // Auto-calculate evaluation date as +5 days from start date
      if (field === 'startDate' && value) {
        const startDate = new Date(value);
        const evaluationDate = new Date(startDate);
        evaluationDate.setDate(evaluationDate.getDate() + 5);
        updated.evaluationDate = evaluationDate.toISOString().split('T')[0];
      }
      return updated;
    });
    setErrors(prev => {
      const updated = { ...prev, [field]: '' };
      if (field === 'innoflexProjectName' || field === 'blgProjectName') {
        updated.innoflexProjectName = '';
        updated.blgProjectName = '';
        updated.externalRef = '';
      }
      if (field === 'businessGroup') {
        updated.category = [];
      }
      return updated;
    });
    if (field === 'name') {
      setIsDuplicateName(
        existingProjectNames.some(n => n.toLowerCase() === value.toLowerCase())
      );
    }
  };

  const handleToggleCategory = (cat: string) => {
    setFormData(prev => {
      const current = prev.category;
      const next = current.includes(cat)
        ? current.filter(c => c !== cat)
        : [...current, cat];
      return { ...prev, category: next };
    });
    setErrors(prev => ({ ...prev, category: '' }));
  };

  const handleToggleRegion = (reg: string) => {
    setFormData(prev => {
      const current = prev.region;
      const next = current.includes(reg)
        ? current.filter(r => r !== reg)
        : [...current, reg];
      return { ...prev, region: next };
    });
    setErrors(prev => ({ ...prev, region: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.businessGroup) newErrors.businessGroup = 'Business group is required';
    
    if (formData.businessGroup && formData.category.length === 0) {
      newErrors.category = 'At least one Category is required';
    }

    if (externalRefType === null) {
      newErrors.externalRef = 'Please select a reference type (Innoflex or BLG)';
    } else if (externalRefType === 'innoflex' && !formData.innoflexProjectName) {
      newErrors.innoflexProjectName = 'Innoflex project name is required';
    } else if (externalRefType === 'blg' && !formData.blgProjectName.trim()) {
      newErrors.blgProjectName = 'BLG project name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !isDuplicateName;
  };

  const handleSave = (createAnother = false) => {
    if (!validate()) return;

    const regions = formData.region.length > 0 ? formData.region : ['Global'];
    const projectLead = 'Sarah Johnson';

    const newProject: Omit<Project, 'id'> = {
      name: formData.name,
      projectId: `PRJ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      type: formData.type,
      businessGroup: formData.businessGroup,
      category: formData.category.join(', '),
      scope: formData.scope,
      description: formData.description,
      region: regions.join(', '),
      projectLead,
      claimsLead: 'Michael Chen',
      status: 'Draft',
      lifecycleStage: 'Draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      startDate: formData.startDate,
      launchDate: formData.launchDate || '',
      evaluationDate: formData.evaluationDate || '',
      innoflexProjectName: formData.innoflexProjectName || '',
      blgProjectName: formData.blgProjectName || '',
      teamMembers: generateTeamMembersForProject(formData.businessGroup, regions, projectLead),
    };

    onCreateProject(newProject, true);

    if (createAnother) {
      setFormData(emptyForm);
      setErrors({});
      setIsDuplicateName(false);
      setExternalRefType(null);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors({});
    setIsDuplicateName(false);
    setExternalRefType(null);
    onClose();
  };

  return (
    <div className="fixed top-[60px] bottom-0 left-0 right-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="px-6 py-3 border-b border-pebble flex items-center justify-between flex-shrink-0 bg-white z-40 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky/10 flex items-center justify-center text-sky flex-shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-night whitespace-nowrap">Create New Project</h2>
        </div>
        <button onClick={handleClose} className="p-2 text-gray-400 hover:text-night hover:bg-earth rounded-xl transition-all cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="w-full px-8 md:px-16 lg:px-24 py-8 space-y-12">

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-pebble">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Project Name"
                fieldKey="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                isDuplicate={isDuplicateName}
                placeholder="e.g. Dove Intensive Repair"
                required
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  rows={1}
                  placeholder="Brief description of the project scope..."
                  className="w-full px-4 py-2 border border-pebble hover:border-sky rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* External References Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-pebble">2. External References</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-earth/50 rounded-xl border border-pebble text-xs">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Select Project Reference: <span className="text-red-500">*</span></span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-night font-semibold">
                      <input
                        type="radio"
                        name="externalRefType"
                        checked={externalRefType === 'innoflex'}
                        onChange={() => {
                          setExternalRefType('innoflex');
                          handleChange('blgProjectName', '');
                          setErrors(prev => ({ ...prev, externalRef: '' }));
                        }}
                        className="w-4 h-4 accent-sky cursor-pointer"
                      />
                      Innoflex Project Name
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-night font-semibold">
                      <input
                        type="radio"
                        name="externalRefType"
                        checked={externalRefType === 'blg'}
                        onChange={() => {
                          setExternalRefType('blg');
                          handleChange('innoflexProjectName', '');
                          setErrors(prev => ({ ...prev, externalRef: '' }));
                        }}
                        className="w-4 h-4 accent-sky cursor-pointer"
                      />
                      BLG Project Name
                    </label>
                  </div>
                </div>
                {errors.externalRef && (
                  <p className="flex items-center gap-1 text-xs text-red-500 ml-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.externalRef}</span>
                  </p>
                )}
              </div>

              {externalRefType === 'innoflex' && (
               <div className="animate-fade-in w-full md:w-1/2">
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                    Innoflex project name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.innoflexProjectName}
                      onChange={e => handleChange('innoflexProjectName', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all appearance-none cursor-pointer bg-white ${
                        errors.innoflexProjectName ? 'border-red-400 text-night' : 'border-pebble hover:border-sky focus:border-sky text-night'
                      } ${!formData.innoflexProjectName ? 'text-gray-400 font-normal' : ''}`}
                    >
                      <option value="">Select Innoflex project...</option>
                      {INNOFLEX_PROJECTS.map(p => (
                        <option key={p} value={p} className="text-night">{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.innoflexProjectName && (
                    <p className="flex items-start gap-1 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{errors.innoflexProjectName}
                    </p>
                  )}
                </div>
              )}

              {externalRefType === 'blg' && (
                <div className="animate-fade-in w-full md:w-1/2">
                  <TextField
                    label="BLG project name"
                    fieldKey="blgProjectName"
                    value={formData.blgProjectName}
                    onChange={handleChange}
                    error={errors.blgProjectName}
                    placeholder="e.g. BLG-DOVE-2026-IR"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Classification & Geography Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-pebble">3. Classification & Scope</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <SelectField
                label="Business Group"
                fieldKey="businessGroup"
                value={formData.businessGroup}
                onChange={handleChange}
                options={BUSINESS_GROUPS}
                error={errors.businessGroup}
                required
              />
              
              <MultiSelectDropdown
                label="Category"
                placeholder="Select categories..."
                options={CATEGORIES[formData.businessGroup] || []}
                selected={formData.category}
                onToggle={handleToggleCategory}
                error={errors.category}
                disabled={!formData.businessGroup}
                disabledMessage="Select BG first"
                required
              />

              <MultiSelectDropdown
                label="Geography"
                placeholder="Select geographies..."
                options={REGIONS}
                selected={formData.region}
                onToggle={handleToggleRegion}
                error={errors.region}
              />

              <SelectField label="Type"  fieldKey="type"  value={formData.type} onChange={handleChange} options={PROJECT_TYPES} />
              <SelectField label="Scope" fieldKey="scope" value={formData.scope} onChange={handleChange} options={PROJECT_SCOPES} />
            </div>
          </div>

          {/* Rollout-specific Section */}
          {formData.type === 'Rollout' && (
            <div className="border border-sky/30 rounded-xl p-5 bg-sky/5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-sky" />
                <span className="text-sm text-sky font-bold">Rollout Configuration</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                    Source Project <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Search or enter source project ID..."
                    className="w-full px-4 py-2 border border-pebble hover:border-sky rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                    Target Markets
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IN, PK, BD..."
                    className="w-full px-4 py-2 border border-pebble hover:border-sky rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Key Project Dates Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-pebble">4. Key Project Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                  Start date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-pebble hover:border-sky rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky transition-all cursor-text"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                  Evaluation date
                </label>
                <input
                  type="date"
                  value={formData.evaluationDate}
                  readOnly
                  className="w-full px-4 py-2 border border-pebble rounded-xl text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide font-semibold">
                  Launch date
                </label>
                <input
                  type="date"
                  value={formData.launchDate}
                  onChange={e => handleChange('launchDate', e.target.value)}
                  className="w-full px-4 py-2 border border-pebble hover:border-sky rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky transition-all cursor-text"
                />
              </div>
            </div>
            {formData.evaluationDate &&
              formData.launchDate &&
              new Date(formData.launchDate) < new Date(formData.evaluationDate) && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Launch date is before evaluation date</span>
                </div>
              )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3 flex-shrink-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-40">
        <button
          onClick={handleClose}
          className="px-6 py-2 border border-pebble text-gray-600 rounded-xl text-sm font-semibold hover:text-night hover:bg-earth transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          className="flex items-center gap-2 px-8 py-2 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark transition-all shadow-md shadow-sky/20 cursor-pointer"
        >
          <Check className="w-4 h-4" strokeWidth={3} />
          Add and Create Product
        </button>
      </div>
    </div>
  );
}