import { useState, useRef } from 'react';
import {
  Edit2, Save, X, Calendar, Tag, Globe, Users, Copy,
  ChevronDown, AlertCircle, Info, Check
} from 'lucide-react';
import { Project, BUSINESS_GROUPS, CATEGORIES, PROJECT_TYPES, PROJECT_SCOPES, REGIONS, STATUS_OPTIONS } from '../../types';

interface ProjectDetailsTabProps {
  project: Project;
  onSave: (updated: Project) => void;
  currentUserRole?: 'Project Creator' | 'Claims Lead' | 'RA' | 'Legal' | 'Viewer';
  onNavigateToSource?: (projectId: string) => void;
}

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-night text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-night" />
        </span>
      )}
    </span>
  );
}

// Inline editable cell
function InlineField({
  label,
  value,
  fieldKey,
  type = 'text',
  options,
  required,
  disabled,
  isEditing,
  form,
  onChange,
  tooltip
}: {
  label: string;
  value: string;
  fieldKey: keyof Project;
  type?: 'text' | 'textarea' | 'select' | 'date';
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  isEditing: boolean;
  form: Partial<Project>;
  onChange: (key: keyof Project, val: string) => void;
  tooltip?: string;
}) {
  const [cellEditing, setCellEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  const currentVal = (form[fieldKey] as string) ?? value;

  const startCellEdit = () => {
    if (!isEditing) return;
    setCellEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const stopCellEdit = () => setCellEditing(false);

  const labelEl = (
    <label className="flex items-center gap-1 text-xs text-gray-500 mb-1 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 text-sm leading-none">*</span>}
      {tooltip && (
        <Tooltip text={tooltip}>
          <Info className="w-3 h-3 text-gray-400 cursor-help" />
        </Tooltip>
      )}
    </label>
  );

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <div>
          {labelEl}
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={currentVal}
            onChange={e => onChange(fieldKey, e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent resize-none transition-colors ${required && !currentVal ? 'border-red-300 bg-red-50' : 'border-pebble'}`}
          />
          {required && !currentVal && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{label} is required
            </p>
          )}
        </div>
      );
    }
    if (type === 'select' && options) {
      return (
        <div>
          {labelEl}
          <div className="relative">
            <select
              ref={inputRef as React.Ref<HTMLSelectElement>}
              value={currentVal}
              onChange={e => onChange(fieldKey, e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent bg-white appearance-none ${disabled ? 'opacity-40 cursor-not-allowed bg-earth' : ''}`}
            >
              <option value="">Select…</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {disabled && <p className="text-xs text-gray-400 mt-1">Select Business Group first</p>}
        </div>
      );
    }
    if (type === 'date') {
      return (
        <div>
          {labelEl}
          <div className="relative">
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="date"
              value={currentVal}
              onChange={e => onChange(fieldKey, e.target.value)}
              className="w-full pl-3 pr-9 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent"
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {currentVal && (
            <p className="text-xs text-sky mt-0.5">
              {new Date(currentVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      );
    }
    // inline click-to-edit text
    return (
      <div>
        {labelEl}
        {cellEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="text"
              value={currentVal}
              onChange={e => onChange(fieldKey, e.target.value)}
              onBlur={stopCellEdit}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') stopCellEdit(); }}
              className="flex-1 px-3 py-2 border border-sky rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-pale/10"
              autoFocus
            />
            <button onClick={stopCellEdit} className="p-1.5 bg-sky text-white rounded-lg hover:bg-dark transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={startCellEdit}
            className="group px-3 py-2 border border-transparent hover:border-sky rounded-lg text-sm text-night min-h-[38px] flex items-center justify-between cursor-text hover:bg-pale/10 transition-all"
            title="Click to edit"
          >
            <span>{currentVal || <span className="text-gray-400 italic">Not set</span>}</span>
            <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-sky opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
          </div>
        )}
      </div>
    );
  }

  // View mode
  return (
    <div>
      {labelEl}
      <div className="px-3 py-2 bg-earth rounded-lg text-sm text-night min-h-[38px] flex items-center">
        {type === 'date' && value
          ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : value || <span className="text-gray-400 italic">Not set</span>
        }
      </div>
    </div>
  );
}

export default function ProjectDetailsTab({
  project,
  onSave,
  currentUserRole = 'Project Creator',
  onNavigateToSource
}: ProjectDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Project>({ ...project });
  const [cloneSource] = useState<string | null>(
    project.externalRef?.includes('CLONE') ? 'PRJ-2026-003 (Persil Deep Clean)' : null
  );

  const canEdit = currentUserRole === 'Project Creator' || currentUserRole === 'Claims Lead';

  const handleEdit = () => { setForm({ ...project }); setIsEditing(true); };
  const handleCancel = () => { setForm({ ...project }); setIsEditing(false); };
  const handleSave = () => { onSave(form); setIsEditing(false); };

  const handleChange = (key: keyof Project, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'businessGroup') next.category = '';
      return next;
    });
  };

  const categoryOptions = form.businessGroup ? CATEGORIES[form.businessGroup] || [] : [];
  const showInnoflexBLG = form.type === 'Regulatory Compliance' || form.type === 'Rollout';
  const [innoflexBLG, setInnoflexBLG] = useState<'Innoflex' | 'BLG' | ''>('');

  return (
    <div className="p-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="w-full">

        {/* Clone badge */}
        {(project.copiedFromProjectName || project.clonedFrom || cloneSource) && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">
            <Copy className="w-4 h-4" />
            <span>Cloned from <span style={{ fontWeight: 600 }}>{project.copiedFromProjectName || project.clonedFrom || cloneSource}</span></span>
            <button
              onClick={() => {
                if (onNavigateToSource && project.copiedFromProjectId) {
                  onNavigateToSource(project.copiedFromProjectId);
                } else {
                  alert(`Navigating to original project: ${project.copiedFromProjectName || project.clonedFrom || cloneSource}`);
                }
              }}
              className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
            >
              View original
            </button>
          </div>
        )}

        {/* Cancelled badge / reason */}
        {project.status === "Cancelled" && (
          <div className="flex flex-col gap-1 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Project Cancelled: {project.cancelReasonCategory || "Strategic Realignment"}</span>
            </div>
            <p className="text-xs text-red-800 pl-6 leading-relaxed">
              <span className="font-semibold">Reason Details:</span> {project.cancelReasonText || "Project will not proceed further."}
            </p>
          </div>
        )}

        {/* Page header — title + edit controls */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-night">Project Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">Core metadata and configuration for this project</p>
          </div>
          <div className="flex items-center gap-2">
            {!canEdit && (
              <Tooltip text="You have view-only access to this project">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-earth text-gray-500 rounded-lg text-xs border border-pebble">
                  <Info className="w-3.5 h-3.5" />
                  View only
                </span>
              </Tooltip>
            )}
            {canEdit && (
              isEditing ? (
                <>
                  <button onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-pebble text-night rounded-lg hover:bg-earth transition-colors text-sm">
                    <X className="w-4 h-4" />Cancel
                  </button>
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg hover:bg-dark transition-colors text-sm">
                    <Save className="w-4 h-4" />Save Changes
                  </button>
                </>
              ) : (
                <button onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 border border-sky text-sky rounded-lg hover:bg-pale transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2">
                  <Edit2 className="w-4 h-4" />Edit
                </button>
              )
            )}
          </div>
        </div>

        {/* Edit mode banner */}
        {isEditing && (
          <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>You are in edit mode. Click any field to edit inline, or use the inputs below.</span>
            <span className="ml-auto text-xs text-amber-500">Fields marked <span className="text-red-500">*</span> are required</span>
          </div>
        )}

        {/* ── Single unified card ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pebble p-5 space-y-5">

          {/* Row 1: Project Name (full width) */}
          <div>
            <InlineField
              label="Project Name"
              value={project.name}
              fieldKey="name"
              required
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
          </div>

          {/* Row 2: Description (full width) */}
          <div>
            <InlineField
              label="Description"
              value={project.description}
              fieldKey="description"
              type="textarea"
              required
              tooltip="A clear description helps team members understand the project purpose"
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
          </div>

          {/* Row 3: External Reference (full width) */}
          <div>
            <InlineField
              label="External Reference"
              value={project.externalRef}
              fieldKey="externalRef"
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
              tooltip="Optional reference to external system (e.g. PLM, ERP)"
            />
          </div>

          <div className="border-t border-pebble" />

          {/* Row 4: Business Group | Category | Project Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InlineField
              label="Business Group"
              value={project.businessGroup}
              fieldKey="businessGroup"
              type="select"
              options={BUSINESS_GROUPS}
              required
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
            <InlineField
              label="Category"
              value={project.category}
              fieldKey="category"
              type="select"
              options={categoryOptions}
              required
              disabled={!form.businessGroup}
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
            <InlineField
              label="Project Type"
              value={project.type}
              fieldKey="type"
              type="select"
              options={PROJECT_TYPES}
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
          </div>

          {/* Innoflex / BLG — conditional on project type */}
          {showInnoflexBLG && (
            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                Project Framework
                <Tooltip text="Choose whether this project follows Innoflex or BLG governance framework">
                  <Info className="w-3 h-3 text-gray-400 cursor-help ml-1 inline" />
                </Tooltip>
              </label>
              {isEditing ? (
                <div className="flex gap-3">
                  {(['Innoflex', 'BLG'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${innoflexBLG === opt ? 'border-sky' : 'border-gray-300'}`}
                        onClick={() => setInnoflexBLG(opt)}
                      >
                        {innoflexBLG === opt && <div className="w-2 h-2 rounded-full bg-sky" />}
                      </div>
                      <span className="text-sm text-night">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 bg-earth rounded-lg text-sm text-night">
                  {innoflexBLG || <span className="text-gray-400 italic">Not selected</span>}
                </div>
              )}
              {innoflexBLG === 'Innoflex' && isEditing && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 mb-2" style={{ fontWeight: 500 }}>Innoflex Gate fields</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Gate 1 (Concept)', 'Gate 2 (Feasibility)', 'Gate 3 (Development)', 'Gate 4 (Launch)'].map(gate => (
                      <label key={gate} className="flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-sky" />
                        {gate}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {innoflexBLG === 'BLG' && isEditing && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs text-purple-700 mb-2" style={{ fontWeight: 500 }}>BLG Stage fields</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['BLG Stage 1', 'BLG Stage 2', 'BLG Stage 3'].map(stage => (
                      <label key={stage} className="flex items-center gap-2 text-xs text-purple-700 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-sky" />
                        {stage}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Row 5: Scope | Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Project Scope
              </label>
              {isEditing ? (
                <div>
                  <div className="relative">
                    <select
                      value={form.scope || ''}
                      onChange={e => handleChange('scope', e.target.value)}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white appearance-none"
                    >
                      <option value="">Select…</option>
                      {PROJECT_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {form.scope === 'Global' && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" />Claims apply to all markets</p>
                  )}
                  {form.scope === 'Regional' && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />Select regions in the Geography tab</p>
                  )}
                  {form.scope === 'Local' && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />Specify markets in the Geography tab</p>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 bg-earth rounded-lg text-sm text-night min-h-[38px] flex items-center">
                  {project.scope
                    ? <span className={`px-2 py-0.5 rounded-full text-xs ${project.scope === 'Global' ? 'bg-sky text-white' : project.scope === 'Regional' ? 'bg-pale text-sky' : 'bg-earth text-gray-600'}`}>{project.scope}</span>
                    : <span className="text-gray-400 italic">Not set</span>
                  }
                </div>
              )}
            </div>

            <InlineField
              label="Geography"
              value={project.region}
              fieldKey="region"
              type="select"
              options={REGIONS}
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
            <InlineField
              label="Overall Project Risk Level"
              value={project.finalRiskLevel || ''}
              fieldKey="finalRiskLevel"
              type="select"
              options={['Low', 'Medium', 'High', 'Very High']}
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
              tooltip="The consolidated risk assessment for the entire project"
            />
          </div>

          <div className="border-t border-pebble" />

          {/* Row 6: Project Creator (half width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InlineField
              label="Project Creator"
              value={project.projectLead}
              fieldKey="projectLead"
              required
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
          </div>

          <div className="border-t border-pebble" />

          {/* Row 7: Key Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InlineField
              label="Start Date"
              value={project.startDate}
              fieldKey="startDate"
              type="date"
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
            <InlineField
              label="Target Evaluation Date"
              value={project.evaluationDate}
              fieldKey="evaluationDate"
              type="date"
              tooltip="Date when final risk assessment should be complete"
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
            <InlineField
              label="Target Launch Date"
              value={project.launchDate}
              fieldKey="launchDate"
              type="date"
              tooltip="Planned market launch date"
              isEditing={isEditing}
              form={form}
              onChange={handleChange}
            />
          </div>

          {/* Date validation feedback */}
          {isEditing && form.evaluationDate && form.launchDate && (
            new Date(form.launchDate) < new Date(form.evaluationDate) ? (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                Launch Date is before Evaluation Date — please verify
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                Dates are valid
              </div>
            )
          )}

        </div>
        {/* ── End single card ───────────────────────────────────────── */}

      </div>
    </div>
  );
}