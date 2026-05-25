import { useState } from "react";
import {
  ChevronLeft,
  AlertTriangle,
  ChevronDown,
  Check,
  Zap,
} from "lucide-react";
import { Project, BUSINESS_GROUPS, CATEGORIES, PROJECT_TYPES, PROJECT_SCOPES, REGIONS } from "../../types";

interface ProjectCreationScreenProps {
  onBack: () => void;
  onCreateProject: (project: Omit<Project, "id">) => void;
  onCreateProductAfter?: (project: Omit<Project, "id">) => void;
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
  required = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm font-semibold text-left flex items-center justify-between cursor-pointer transition-all ${
            error
              ? "border-red-300 bg-red-50"
              : disabled
              ? "border-pebble bg-gray-100 text-gray-400 cursor-not-allowed"
              : isOpen
              ? "border-sky ring-1 ring-sky"
              : "border-pebble hover:border-sky"
          }`}
        >
          <span className={selected.length === 0 ? "text-gray-400" : "text-brand-night"}>
            {selected.length === 0 ? placeholder : `${selected.length} selected`}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                  selected.includes(opt)
                    ? "bg-sky/10 text-sky font-semibold"
                    : "text-gray-700 hover:bg-earth"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(opt) ? "bg-sky border-sky" : "border-pebble"
                  }`}
                >
                  {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function ProjectCreationScreen({
  onBack,
  onCreateProject,
  onCreateProductAfter,
  existingProjectNames,
}: ProjectCreationScreenProps) {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<string | null>(null);
  const [businessGroups, setBusinessGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [innovflexLink, setInnovflexLink] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const hasChanges = () => {
    return (
      projectName.trim() !== "" ||
      projectType !== null ||
      businessGroups.length > 0 ||
      categories.length > 0 ||
      scopes.length > 0 ||
      regions.length > 0 ||
      innovflexLink !== null
    );
  };

  const handleBackAttempt = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    if (existingProjectNames.some(
      (name) => name.toLowerCase() === projectName.toLowerCase()
    )) {
      newErrors.projectName = "Project name already exists";
    }
    if (!projectType) {
      newErrors.projectType = "Project type is required";
    }
    if (businessGroups.length === 0) {
      newErrors.businessGroups = "Select at least one business group";
    }
    if (categories.length === 0) {
      newErrors.categories = "Select at least one category";
    }
    if (regions.length === 0) {
      newErrors.regions = "Select at least one region";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = () => {
    if (!validateForm()) return;

    const newProject: Omit<Project, "id"> = {
      name: projectName.trim(),
      type: projectType as any,
      businessGroup: businessGroups[0],
      category: categories[0],
      scope: scopes[0] || "Local",
      regions: regions,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Active",
      lead: "Sarah Johnson",
      teams: [],
      createdDate: new Date().toISOString().split("T")[0],
      description: "",
      lifeCycleState: "Created",
      goals: [],
    };

    onCreateProject(newProject);
  };

  const handleCreateAndContinue = () => {
    if (!validateForm()) return;

    const newProject: Omit<Project, "id"> = {
      name: projectName.trim(),
      type: projectType as any,
      businessGroup: businessGroups[0],
      category: categories[0],
      scope: scopes[0] || "Local",
      regions: regions,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Active",
      lead: "Sarah Johnson",
      teams: [],
      createdDate: new Date().toISOString().split("T")[0],
      description: "",
      lifeCycleState: "Created",
      goals: [],
    };

    if (onCreateProductAfter) {
      onCreateProductAfter(newProject);
    } else {
      onCreateProject(newProject);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackAttempt}
            className="p-1.5 hover:bg-earth rounded-xl text-brand-night transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-brand-sky rounded-xl text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-night leading-tight">New Project</h1>
            <p className="text-xs text-gray-500 mt-0.5">Create a new project and build your product portfolio</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
          {/* Project Details Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-brand-night pb-2 border-b border-pebble">
              Project Details
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (errors.projectName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.projectName;
                      return next;
                    });
                  }
                }}
                placeholder="e.g., Dove Intensive Repair Launch"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none transition-all ${
                  errors.projectName
                    ? "border-red-300 bg-red-50 focus:ring-red-400"
                    : "border-pebble focus:ring-2 focus:ring-sky"
                }`}
              />
              {errors.projectName && (
                <p className="text-xs text-red-600 mt-1">{errors.projectName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">
                Project Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={projectType || ""}
                  onChange={(e) => {
                    setProjectType(e.target.value || null);
                    if (errors.projectType) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.projectType;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm font-semibold appearance-none focus:outline-none transition-all cursor-pointer ${
                    errors.projectType
                      ? "border-red-300 bg-red-50 focus:ring-red-400"
                      : "border-pebble focus:ring-2 focus:ring-sky"
                  }`}
                >
                  <option value="">Select project type...</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.projectType && (
                <p className="text-xs text-red-600 mt-1">{errors.projectType}</p>
              )}
            </div>
          </div>

          {/* Business Context Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-brand-night pb-2 border-b border-pebble">
              Business Context
            </h2>

            <MultiSelectDropdown
              label="Business Groups"
              placeholder="Select business groups..."
              options={BUSINESS_GROUPS}
              selected={businessGroups}
              onToggle={(val) => {
                setBusinessGroups((prev) =>
                  prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                );
                if (errors.businessGroups) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.businessGroups;
                    return next;
                  });
                }
              }}
              error={errors.businessGroups}
              required
            />

            <MultiSelectDropdown
              label="Categories"
              placeholder="Select categories..."
              options={CATEGORIES}
              selected={categories}
              onToggle={(val) => {
                setCategories((prev) =>
                  prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                );
                if (errors.categories) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.categories;
                    return next;
                  });
                }
              }}
              error={errors.categories}
              required
            />

            <MultiSelectDropdown
              label="Project Scopes"
              placeholder="Select scopes..."
              options={PROJECT_SCOPES}
              selected={scopes}
              onToggle={(val) => {
                setScopes((prev) =>
                  prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                );
              }}
            />
          </div>

          {/* Geographic Scope Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-brand-night pb-2 border-b border-pebble">
              Geographic Scope
            </h2>

            <MultiSelectDropdown
              label="Regions"
              placeholder="Select regions..."
              options={REGIONS}
              selected={regions}
              onToggle={(val) => {
                setRegions((prev) =>
                  prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                );
                if (errors.regions) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.regions;
                    return next;
                  });
                }
              }}
              error={errors.regions}
              required
            />
          </div>

          {/* Innovflex Link (Optional) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-brand-night pb-2 border-b border-pebble">
              Innovflex Integration
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">
                Link to Innovflex Project (Optional)
              </label>
              <div className="relative">
                <select
                  value={innovflexLink || ""}
                  onChange={(e) => setInnovflexLink(e.target.value || null)}
                  className="w-full px-4 py-2.5 border border-pebble rounded-xl text-sm font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-sky transition-all cursor-pointer"
                >
                  <option value="">No Innovflex link</option>
                  {INNOFLEX_PROJECTS.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 border-t border-pebble bg-earth flex items-center justify-end flex-shrink-0 gap-3">
        <button
          onClick={handleCreateProject}
          className="px-6 py-2.5 border border-pebble text-brand-night bg-white hover:bg-gray-50 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          Create Project
        </button>
        <button
          onClick={handleCreateAndContinue}
          className="px-6 py-2.5 bg-brand-sky text-white rounded-xl text-sm font-bold shadow-lg shadow-sky/15 hover:bg-sky-dark transition-all cursor-pointer flex items-center gap-2"
        >
          Add and Create Product
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-pebble rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-night">Discard Changes?</h3>
                <p className="text-xs text-gray-500 mt-0.5">All unsaved project data will be lost permanently.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-pebble text-brand-night font-bold rounded-lg text-xs hover:bg-earth transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
