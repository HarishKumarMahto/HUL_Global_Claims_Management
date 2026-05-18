import { useState } from 'react';
import {
  Copy, X, Check, ChevronDown, ChevronUp, AlertCircle, Info, Bell, Shield, Calendar, Layers, CheckSquare, Square
} from 'lucide-react';
import { Project, BUSINESS_GROUPS, CATEGORIES, PROJECT_TYPES, REGIONS } from '../types';

interface CloneProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceProject: Project;
  existingProjects: Project[];
  currentUserRole?: string;
  onCloneProject: (clonedProject: Project) => void;
}

export default function CloneProjectModal({
  isOpen,
  onClose,
  sourceProject,
  existingProjects,
  currentUserRole = 'Project Creator',
  onCloneProject,
}: CloneProjectModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<'select' | 'notify'>('select');
  const [projectName, setProjectName] = useState(`${sourceProject.name} (Clone)`);
  const [businessGroup, setBusinessGroup] = useState(sourceProject.businessGroup || BUSINESS_GROUPS[0]);
  const [category, setCategory] = useState(sourceProject.category || '');
  const [projectType, setProjectType] = useState(sourceProject.type || PROJECT_TYPES[0]);
  const [startDate, setStartDate] = useState(sourceProject.startDate || new Date().toISOString().slice(0, 10));
  const [evaluationDate, setEvaluationDate] = useState(sourceProject.evaluationDate || '');
  const [launchDate, setLaunchDate] = useState(sourceProject.launchDate || '');

  // Section level selection state
  const [sections, setSections] = useState({
    team: true,
    geography: true,
    products: true,
    claims: true,
    assets: true,
    documents: true,
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('claims');

  // Mock specific records within sections
  const mockClaimsList = [
    { id: 'c1', label: 'Claim #1: 100% Superior Stain Removal', status: 'Active' },
    { id: 'c2', label: 'Claim #2: Dermatologist Recommended', status: 'Active' },
    { id: 'c3', label: 'Claim #3: Lasts up to 48 hours', status: 'Expired' },
    { id: 'c4', label: 'Claim #4: Eco-friendly formula', status: 'Inactive' },
  ];

  const mockProductsList = [
    { id: 'p1', label: 'Product Alpha (Liquid Detergent)', status: 'Active' },
    { id: 'p2', label: 'Product Beta (Powder Pods)', status: 'Cancelled' },
  ];

  const mockAssetsList = [
    { id: 'a1', label: 'TV Commercial Master 30s', status: 'Active' },
    { id: 'a2', label: 'Digital Banner Pack Q3', status: 'Active' },
    { id: 'a3', label: 'Print Ad Placeholder', status: 'Inactive' },
  ];

  const mockTeamList = [
    { id: 't1', label: `${sourceProject.projectLead || 'Sarah Johnson'} (Project Lead)`, status: 'Active' },
    { id: 't2', label: `${sourceProject.claimsLead || 'Michael Chen'} (Claims Lead)`, status: 'Active' },
    { id: 't3', label: 'Dr. Emily Vance (R&D Expert)', status: 'Active' },
  ];

  const mockGeoList = (sourceProject.region || 'North America, Europe').split(',').map(g => g.trim()).map((geo, idx) => ({
    id: `g${idx}`, label: geo, status: 'Active'
  }));

  const mockDocList = [
    { id: 'd1', label: 'Clinical Study Protocol v2.1.pdf', status: 'Active' },
    { id: 'd2', label: 'Regulatory Filing Dossier.pdf', status: 'Active' },
  ];

  const [selectedClaims, setSelectedClaims] = useState<string[]>(mockClaimsList.map(c => c.id));
  const [selectedProducts, setSelectedProducts] = useState<string[]>(mockProductsList.map(p => p.id));
  const [selectedAssets, setSelectedAssets] = useState<string[]>(mockAssetsList.map(a => a.id));
  const [selectedTeam, setSelectedTeam] = useState<string[]>(mockTeamList.map(t => t.id));
  const [selectedGeo, setSelectedGeo] = useState<string[]>(mockGeoList.map(g => g.id));
  const [selectedDocs, setSelectedDocs] = useState<string[]>(mockDocList.map(d => d.id));

  // Step 2 state
  const [subscribeToSourceChanges, setSubscribeToSourceChanges] = useState(true);

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleNext = () => {
    const errors: string[] = [];
    if (!projectName.trim()) {
      errors.push('Project Name is required.');
    } else if (existingProjects.some(p => p.name.toLowerCase() === projectName.trim().toLowerCase() && p.id !== sourceProject.id)) {
      errors.push('Project Name must be unique. A project with this name already exists.');
    }

    if (!businessGroup) {
      errors.push('Business Group is required.');
    }
    if (!category) {
      errors.push('Category is required.');
    }

    if (evaluationDate && launchDate && new Date(launchDate) < new Date(evaluationDate)) {
      errors.push('Target Launch Date cannot be earlier than Target Evaluation Date.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setStep('notify');
  };

  const handleFinalClone = () => {
    const clonedId = String(Date.now());
    const clonedProject: Project = {
      ...sourceProject,
      id: clonedId,
      projectId: `PRJ-${clonedId.slice(-4)}`,
      name: projectName.trim(),
      businessGroup,
      category,
      type: projectType,
      startDate,
      evaluationDate,
      launchDate,
      lifecycleStage: 'Draft',
      status: 'Draft',
      lastUpdated: new Date().toISOString(),
      clonedFrom: sourceProject.name,
      copiedFromProjectId: sourceProject.id,
      copiedFromProjectName: sourceProject.name,
      isSubscribedToSourceChanges: subscribeToSourceChanges,
      confidentialRestrictions: sourceProject.confidentialRestrictions || false,
    };

    onCloneProject(clonedProject);
    onClose();
  };

  const toggleSection = (sec: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const categoryOptions = businessGroup ? CATEGORIES[businessGroup] || [] : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-sky text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Clone Project</h2>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                Copying from: <span className="underline font-bold">{sourceProject.name}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-earth border-b border-pebble px-6 py-3 flex items-center gap-6 text-xs font-semibold flex-shrink-0">
          <div className={`flex items-center gap-2 ${step === 'select' ? 'text-sky font-bold' : 'text-gray-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'select' ? 'bg-sky text-white' : 'bg-pebble text-gray-600'}`}>1</span>
            Select What to Copy & Validate
          </div>
          <div className="w-8 h-px bg-pebble" />
          <div className={`flex items-center gap-2 ${step === 'notify' ? 'text-sky font-bold' : 'text-gray-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'notify' ? 'bg-sky text-white' : 'bg-pebble text-gray-600'}`}>2</span>
            Subscribe to Notifications
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {step === 'select' && (
            <>
              {/* Permission & Status disclaimers */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 leading-relaxed">
                  <p className="font-bold mb-1">Cloning Policy & Permissions</p>
                  <p>Only the BG BU Lead, Business Admin, Project Lead, or Claims Lead of the source project's BG can clone. By proceeding, you verify your authorization.</p>
                  {sourceProject.confidentialRestrictions && (
                    <p className="mt-2 text-purple-700 font-semibold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Confidential restrictions apply: restricted fields/records are excluded unless permitted.
                    </p>
                  )}
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 space-y-1 animate-wiggle">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-red-800">
                    <AlertCircle className="w-4 h-4" /> Validation Rules Failed
                  </div>
                  {validationErrors.map((err, idx) => <p key={idx}>• {err}</p>)}
                </div>
              )}

              {/* Core Metadata Fields */}
              <div className="bg-earth p-5 rounded-xl border border-pebble space-y-4">
                <h3 className="text-sm font-bold text-night flex items-center gap-2 border-b border-pebble pb-2">
                  <Layers className="w-4 h-4 text-sky" /> Cloned Project Identity & Metadata
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Project Name *</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                      placeholder="Enter unique project name"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Must be unique across all active projects.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Project Type</label>
                    <select
                      value={projectType}
                      onChange={e => setProjectType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                    >
                      {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Business Group *</label>
                    <select
                      value={businessGroup}
                      onChange={e => {
                        setBusinessGroup(e.target.value);
                        setCategory('');
                      }}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                    >
                      {BUSINESS_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">If source BG is obsolete, pick active BG.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Category *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                    >
                      <option value="">Select Category...</option>
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1 uppercase">Target Launch Date</label>
                    <input
                      type="date"
                      value={launchDate}
                      onChange={e => setLaunchDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
                    />
                  </div>
                </div>
              </div>

              {/* Section-level selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-night flex items-center justify-between border-b border-pebble pb-2">
                  <span>Select Sections & Specific Records to Copy</span>
                  <span className="text-xs text-gray-500 font-normal">Inactive/Expired records show disclaimer but can still be copied</span>
                </h3>

                {[
                  { id: 'claims', label: 'Linked Claims', count: selectedClaims.length, total: mockClaimsList.length, list: mockClaimsList, selected: selectedClaims, setSelected: setSelectedClaims },
                  { id: 'products', label: 'Linked Products', count: selectedProducts.length, total: mockProductsList.length, list: mockProductsList, selected: selectedProducts, setSelected: setSelectedProducts },
                  { id: 'assets', label: 'Linked Assets', count: selectedAssets.length, total: mockAssetsList.length, list: mockAssetsList, selected: selectedAssets, setSelected: setSelectedAssets },
                  { id: 'team', label: 'Project Team Members', count: selectedTeam.length, total: mockTeamList.length, list: mockTeamList, selected: selectedTeam, setSelected: setSelectedTeam },
                  { id: 'geography', label: 'Geography / Markets', count: selectedGeo.length, total: mockGeoList.length, list: mockGeoList, selected: selectedGeo, setSelected: setSelectedGeo },
                  { id: 'documents', label: 'Project Documents', count: selectedDocs.length, total: mockDocList.length, list: mockDocList, selected: selectedDocs, setSelected: setSelectedDocs },
                ].map(section => {
                  const isChecked = sections[section.id as keyof typeof sections];
                  const isExpanded = expandedSection === section.id;
                  const allSelected = section.selected.length === section.list.length && section.list.length > 0;

                  return (
                    <div key={section.id} className="border border-pebble rounded-xl overflow-hidden bg-white shadow-sm transition-all">
                      {/* Section Bar */}
                      <div className="px-4 py-3 bg-earth/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id as any)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isChecked ? 'bg-sky border-sky text-white' : 'border-gray-300 bg-white'}`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-sm font-bold text-night">{section.label}</span>
                          <span className="text-xs bg-white px-2.5 py-0.5 rounded-full border border-pebble font-semibold text-sky">
                            {section.count} of {section.total} selected
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night font-medium py-1 px-2.5 rounded-lg hover:bg-white transition-colors"
                        >
                          {isExpanded ? <>Hide Records <ChevronUp className="w-3.5 h-3.5" /></> : <>Pick Specific Records <ChevronDown className="w-3.5 h-3.5" /></>}
                        </button>
                      </div>

                      {/* Expandable Specific Records */}
                      {isExpanded && isChecked && (
                        <div className="p-4 bg-white border-t border-pebble space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (allSelected) {
                                  section.setSelected([]);
                                } else {
                                  section.setSelected(section.list.map(x => x.id));
                                }
                              }}
                              className="text-xs font-bold text-sky flex items-center gap-1.5 hover:underline"
                            >
                              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-[10px] text-gray-400 font-medium italic">Check individual items below to include in clone</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {section.list.map(item => {
                              const isSel = section.selected.includes(item.id);
                              const isInactive = item.status === 'Inactive' || item.status === 'Expired' || item.status === 'Cancelled';
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    if (isSel) {
                                      section.setSelected(section.selected.filter(id => id !== item.id));
                                    } else {
                                      section.setSelected([...section.selected, item.id]);
                                    }
                                  }}
                                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${isSel ? 'border-sky bg-pale/20' : 'border-pebble hover:border-gray-300 bg-white'}`}
                                >
                                  <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${isSel ? 'bg-sky border-sky text-white' : 'border-gray-300'}`}>
                                    {isSel && <Check className="w-3 h-3" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-night truncate">{item.label}</p>
                                    {isInactive && (
                                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Expired' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                        ⚠ {item.status} Record (Can still copy)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 'notify' && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-night space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 rounded-xl text-white">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-900">Subscribe to Source Project Notifications</h3>
                    <p className="text-xs text-purple-700 mt-0.5">Stay synchronized with upstream master record updates</p>
                  </div>
                </div>

                <p className="text-xs text-purple-800 leading-relaxed font-medium">
                  When changes occur in the source project's records (e.g., claims modified, substantiation updated, or scope adjusted), project team members will receive automated notification alerts. Users can then manually review and import these changes into the cloned project.
                </p>

                <div className="bg-white p-4 rounded-xl border border-purple-200 flex items-start gap-3 cursor-pointer" onClick={() => setSubscribeToSourceChanges(!subscribeToSourceChanges)}>
                  <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors ${subscribeToSourceChanges ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 bg-white'}`}>
                    {subscribeToSourceChanges && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-night">Subscribe to change notifications for source project records</p>
                    <p className="text-xs text-gray-500 mt-0.5">Highly recommended to maintain compliance consistency with the parent project.</p>
                  </div>
                </div>
              </div>

              <div className="bg-earth p-5 rounded-xl border border-pebble flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-night">Final Cloned Status: <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Draft</span></p>
                  <p className="text-gray-500 mt-1">A self-referential link "Copied From" pointing to {sourceProject.name} will be stored.</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-night">Project Name: {projectName}</p>
                  <p className="text-gray-500 mt-0.5">Business Group: {businessGroup}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-earth border-t border-pebble flex items-center justify-between flex-shrink-0">
          {step === 'notify' ? (
            <button
              type="button"
              onClick={() => setStep('select')}
              className="px-5 py-2.5 border border-pebble text-night rounded-xl text-sm font-semibold hover:bg-white transition-colors"
            >
              Back to Selection
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-pebble text-night rounded-xl text-sm font-semibold hover:bg-white transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 'select' ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark transition-colors shadow-md"
            >
              Next: Subscribe to Notifications →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalClone}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Finalize Clone Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
