import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, ChevronDown, RefreshCw, Info, Check } from 'lucide-react';
import { Project, BUSINESS_GROUPS, CATEGORIES, PROJECT_TYPES, PROJECT_SCOPES, REGIONS, generateTeamMembersForProject } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id'>) => void;
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
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {disabled ? (
        <div className="flex items-center gap-2 p-1.5 bg-earth rounded-lg border border-pebble text-gray-400 text-sm">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{disabledMessage || 'Select required fields first'}</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-1.5 border rounded-lg text-sm text-left flex items-center justify-between transition-all bg-white cursor-pointer ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-pebble focus:ring-2 focus:ring-sky'
            }`}
          >
            <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-night font-medium'}`}>
              {displayValue}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-pebble rounded-xl shadow-xl z-50 max-h-36 overflow-y-auto py-1">
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
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors hover:bg-earth cursor-pointer ${
                        isChecked ? 'bg-pale/50 font-medium' : ''
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked ? 'bg-sky border-sky' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                      </div>
                      <span className={isChecked ? 'text-sky' : 'text-gray-700'}>{opt}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
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
    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(fieldKey, e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-1.5 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky ${
        error || isDuplicate ? 'border-red-400' : 'border-pebble'
      }`}
    />
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
    {isDuplicate && !error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
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
    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(fieldKey, e.target.value)}
        className={`w-full px-3 py-1.5 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky appearance-none bg-white ${
          error ? 'border-red-400' : 'border-pebble'
        }`}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
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
}: CreateProjectModalProps) {
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

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [externalRefType, setExternalRefType] = useState<'innoflex' | 'blg' | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'businessGroup') {
        updated.category = [];
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

    // Removed mandatory Geography validation as per user request
    
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

    onCreateProject(newProject);

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 md:p-10 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-auto max-h-[80vh] flex flex-col transform transition-all duration-300 scale-100 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-night font-bold text-lg">Create New Project</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">

            {/* Basic Information fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
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
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  rows={1}
                  placeholder="Brief description of the project scope..."
                  className="w-full px-3 py-1.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
              </div>
            </div>

            {/* External References fields */}
            <div className="space-y-2">
              {/* Radio Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-2 bg-earth rounded-lg border border-pebble text-xs">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Select Reference Type: <span className="text-red-500">*</span></span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-night font-medium">
                      <input
                        type="radio"
                        name="externalRefType"
                        checked={externalRefType === 'innoflex'}
                        onChange={() => {
                          setExternalRefType('innoflex');
                          handleChange('blgProjectName', '');
                          setErrors(prev => ({ ...prev, externalRef: '' }));
                        }}
                        className="w-4 h-4 accent-sky"
                      />
                      Innoflex Project Name
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-night font-medium">
                      <input
                        type="radio"
                        name="externalRefType"
                        checked={externalRefType === 'blg'}
                        onChange={() => {
                          setExternalRefType('blg');
                          handleChange('innoflexProjectName', '');
                          setErrors(prev => ({ ...prev, externalRef: '' }));
                        }}
                        className="w-4 h-4 accent-sky"
                      />
                      BLG Project Name
                    </label>
                  </div>
                </div>
                {errors.externalRef && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1 ml-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.externalRef}</span>
                  </p>
                )}
              </div>

              {/* Conditional Input Fields */}
              {externalRefType === 'innoflex' && (
                <div className="animate-fade-in">
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                    Innoflex project name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.innoflexProjectName}
                      onChange={e => handleChange('innoflexProjectName', e.target.value)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky appearance-none bg-white ${
                        errors.innoflexProjectName ? 'border-red-400 font-medium' : 'border-pebble'
                      }`}
                    >
                      <option value="">Select Innoflex project...</option>
                      {INNOFLEX_PROJECTS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.innoflexProjectName && (
                    <p className="flex items-start gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{errors.innoflexProjectName}
                    </p>
                  )}
                </div>
              )}

              {externalRefType === 'blg' && (
                <div className="animate-fade-in">
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                    BLG project name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.blgProjectName}
                    onChange={e => handleChange('blgProjectName', e.target.value)}
                    placeholder="e.g. BLG-DOVE-2026-IR"
                    className={`w-full px-3 py-1.5 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky ${
                      errors.blgProjectName ? 'border-red-400 font-medium' : 'border-pebble'
                    }`}
                  />
                  {errors.blgProjectName && (
                    <p className="flex items-start gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{errors.blgProjectName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Classification & Geography fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Rollout-specific fields */}
            {formData.type === 'Rollout' && (
              <div className="border border-sky/30 rounded-xl p-4 bg-blue-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-4 h-4 text-sky" />
                  <span className="text-sm text-sky font-semibold">Rollout Configuration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      Source Project <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search or enter source project ID..."
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      Target Markets
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IN, PK, BD..."
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Key Project Dates fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                  Start date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-1.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                  Evaluation date
                </label>
                <input
                  type="date"
                  value={formData.evaluationDate}
                  onChange={e => handleChange('evaluationDate', e.target.value)}
                  className="w-full px-3 py-1.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">
                  Launch date
                </label>
                <input
                  type="date"
                  value={formData.launchDate}
                  onChange={e => handleChange('launchDate', e.target.value)}
                  className="w-full px-3 py-1.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
            </div>
            {formData.evaluationDate &&
              formData.launchDate &&
              new Date(formData.launchDate) < new Date(formData.evaluationDate) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Launch date is before evaluation date
                </div>
              )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-pebble flex items-center justify-between flex-shrink-0 bg-earth/30">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-pebble text-night rounded-lg text-sm font-semibold hover:bg-earth transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              className="px-8 py-2 bg-sky text-white rounded-lg text-sm font-bold hover:bg-dark transition-colors shadow-lg shadow-sky/20"
            >
              Save Project
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}