import { useState, useRef } from "react";
import {
  ChevronLeft,
  Sparkles,
  Check,
  AlertTriangle,
  Beaker,
  Layers,
  Upload,
  FileText,
  Search,
} from "lucide-react";
import { BUSINESS_GROUPS, CATEGORIES } from "../../types";
import type { DocumentRecord } from "../documents/documentsData";

interface TechnologyCreationScreenProps {
  onBack: () => void;
  onCreate: (products: any[]) => void;
  documents?: DocumentRecord[];
  onDocumentsChange?: (docs: DocumentRecord[]) => void;
}

const BRAND_SUGGESTIONS = [
  "Dove",
  "TRESemmé",
  "Persil",
  "Vaseline",
  "Hellmann's",
  "Domestos",
  "Simple",
  "Comfort",
  "Sunsilk",
  "Knorr",
];

export default function TechnologyCreationScreen({
  onBack,
  onCreate,
  documents = [],
  onDocumentsChange,
}: TechnologyCreationScreenProps) {
  const [brand, setBrand] = useState("");
  const [techName, setTechName] = useState("");
  const [businessGroup, setBusinessGroup] = useState("");
  const [category, setCategory] = useState("");

  // Formulation Document Tab
  const [docSource, setDocSource] = useState<"upload" | "library">("upload");
  // Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Library State
  const [selectedDocId, setSelectedDocId] = useState("");
  const [docSearch, setDocSearch] = useState("");

  // UI state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  // Filter Formulation Documents from library
  const formulationDocs = documents.filter(
    (d) => d.documentType === "Formulation Document"
  );

  const filteredDocs = formulationDocs.filter((d) =>
    d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
    (d.documentNumber && d.documentNumber.toLowerCase().includes(docSearch.toLowerCase()))
  );

  const hasChanges =
    brand.trim() !== "" ||
    techName.trim() !== "" ||
    businessGroup !== "" ||
    category !== "" ||
    uploadedFile !== null ||
    selectedDocId !== "";

  const isValid =
    brand.trim() !== "" &&
    techName.trim() !== "" &&
    businessGroup !== "" &&
    category !== "";

  const handleBackAttempt = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleSave = () => {
    if (!isValid) return;

    const techId = `tech-${Date.now()}`;
    const newTech = {
      id: techId,
      productId: `PROD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: techName.trim(),
      levelName: techName.trim(),
      type: "Technology" as const,
      lifecycleState: "In-use" as const,
      parentId: null,
      parentName: null,
      childCount: 0,
      claimsCount: 0,
      projectsCount: 0,
      geographyCount: 0,
      geographies: [],
      category: category,
      businessGroup: businessGroup,
      brand: brand.trim(),
      description: `Proprietary technology developed for ${brand.trim()} product range.`,
      createdBy: "Sarah Johnson",
      createdDate: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    // Handle formulation document linking/creation
    if (onDocumentsChange) {
      if (docSource === "upload" && uploadedFile) {
        // Create new document record
        const docId = `DOC-FD-${Date.now()}`;
        const newDoc: DocumentRecord = {
          id: docId,
          documentType: "Formulation Document",
          name: uploadedFile.name.replace(/\.[^/.]+$/, ""),
          description: `Formulation spec for newly created technology: ${techName.trim()}`,
          currentVersion: "0.1",
          version: "0.1",
          versions: [
            {
              versionNumber: "0.1",
              lifecycleState: "Created",
              fileName: uploadedFile.name,
              fileSizeBytes: uploadedFile.size,
              fileType: uploadedFile.name.split(".").pop()?.toUpperCase() || "PDF",
              uploadedAt: new Date().toISOString(),
              uploadedBy: "Sarah Johnson",
            },
          ],
          lifecycleState: "Created",
          createdBy: "Sarah Johnson",
          createdDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString(),
          validToDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year
          geography: ["Global"],
          businessGroup: businessGroup,
          category: category,
          brand: brand.trim(),
          documentNumber: `FD-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
          linkedProductIds: [techId],
          comments: [],
        };
        onDocumentsChange([newDoc, ...documents]);
      } else if (docSource === "library" && selectedDocId) {
        // Link existing document
        const updatedDocs = documents.map((d) => {
          if (d.id === selectedDocId) {
            const existingLinks = d.linkedProductIds || [];
            return {
              ...d,
              linkedProductIds: [...new Set([...existingLinks, techId])],
            };
          }
          return d;
        });
        onDocumentsChange(updatedDocs);
      }
    }

    onCreate([newTech]);
  };

  const filteredBrands = BRAND_SUGGESTIONS.filter((b) =>
    b.toLowerCase().includes(brand.toLowerCase())
  );

  const selectedDoc = formulationDocs.find((d) => d.id === selectedDocId);
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden text-night">
      {/* Top Header bar */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-white flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackAttempt}
            className="p-2 text-gray-400 hover:text-night hover:bg-earth rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center text-sky">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-night leading-none">Technology Creation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new top-level product technology
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-earth/10">
        {/* Left: Input Form (70%) */}
        <div className="w-[70%] flex flex-col p-6 overflow-y-auto border-r border-pebble/65 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-2xl border border-pebble/50 shadow-sm p-6 space-y-6 max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-night border-b border-pebble pb-2 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-sky" />
              Technology Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Field */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setBrandDropdownOpen(true);
                  }}
                  onFocus={() => setBrandDropdownOpen(true)}
                  placeholder="e.g. Dove, TRESemmé, Persil..."
                  className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
                />
                {brandDropdownOpen && filteredBrands.length > 0 && (
                  <div className="absolute z-55 left-0 right-0 mt-1 bg-white border border-pebble rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                    {filteredBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBrand(b);
                          setBrandDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors font-semibold"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
                {brandDropdownOpen && (
                  <div
                    className="fixed inset-0 z-45"
                    onClick={() => setBrandDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Technology Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Technology Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="Enter technology name only..."
                  className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technology Classification */}
          <div className="bg-white rounded-2xl border border-pebble/50 shadow-sm p-6 space-y-6 max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-night border-b border-pebble pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky" />
              Technology Classification (Required)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Groups Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Business Groups <span className="text-red-500">*</span>
                </label>
                <select
                  value={businessGroup}
                  onChange={(e) => {
                    setBusinessGroup(e.target.value);
                    setCategory(""); // Reset category on BG change
                  }}
                  className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all cursor-pointer"
                >
                  <option value="">Select Business Groups...</option>
                  {BUSINESS_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categories Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Categories <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!businessGroup}
                  className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium text-night focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:border-pebble/50 cursor-pointer"
                >
                  {!businessGroup ? (
                    <option value="">Select a Business Group first to view categories</option>
                  ) : (
                    <>
                      <option value="">Select category...</option>
                      {(CATEGORIES[businessGroup] || []).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Formulation Document */}
          <div className="bg-white rounded-2xl border border-pebble/50 shadow-sm p-6 space-y-6 max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-night border-b border-pebble pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky" />
              Formulation Document
            </h2>

            {/* Selector tabs */}
            <div className="flex border-b border-pebble">
              <button
                type="button"
                onClick={() => setDocSource("upload")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-colors ${
                  docSource === "upload"
                    ? "border-sky text-sky"
                    : "border-transparent text-gray-400 hover:text-night"
                }`}
              >
                Upload New Spec Document
              </button>
              <button
                type="button"
                onClick={() => setDocSource("library")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-colors ${
                  docSource === "library"
                    ? "border-sky text-sky"
                    : "border-transparent text-gray-400 hover:text-night"
                }`}
              >
                Select from Document Library
              </button>
            </div>

            {docSource === "upload" ? (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.xls,.xlsx"
                  className="hidden"
                />
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-pebble hover:border-sky/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-earth/20 transition-all space-y-2 group bg-white"
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-450 group-hover:text-sky transition-colors" />
                    <p className="text-xs font-bold text-night">
                      Drag & drop formulation spec, or <span className="text-sky group-hover:underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Supports PDF, DOCX, XLSX up to 25MB
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-pebble rounded-xl bg-sky/5 animate-fadeIn">
                    <FileText className="w-8 h-8 text-sky flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-night truncate">
                        {uploadedFile.name}
                      </div>
                      <div className="text-[10px] text-gray-450 mt-0.5">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · Formulation Document
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-xs font-bold text-red-500 hover:text-red-650 hover:bg-red-50 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search documents by name or document number..."
                    className="w-full pl-9 pr-4 py-2.5 bg-earth/50 border border-pebble rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
                  />
                </div>

                {/* Library list */}
                <div className="max-h-60 overflow-y-auto border border-pebble rounded-xl divide-y divide-pebble/50 bg-white shadow-inner">
                  {filteredDocs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No matching formulation documents found in library.
                    </div>
                  ) : (
                    filteredDocs.map((doc) => (
                      <label
                        key={doc.id}
                        className={`flex items-center gap-3 p-3.5 text-xs cursor-pointer hover:bg-earth/30 transition-colors select-none ${
                          selectedDocId === doc.id ? "bg-sky/5" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedDocRadio"
                          checked={selectedDocId === doc.id}
                          onChange={() => setSelectedDocId(doc.id)}
                          className="h-4 w-4 text-sky focus:ring-sky/50 accent-sky cursor-pointer"
                        />
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-night truncate">{doc.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {doc.documentNumber || "No doc number"} · {doc.brand || "No brand"} · {doc.businessGroup}
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 bg-earth px-2 py-0.5 rounded-lg border border-pebble/40">
                          {doc.currentVersion}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview (30%) */}
        <div className="w-[30%] flex flex-col p-6 bg-earth/20 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky" />
              Live Preview
            </h3>

            {brand.trim() || techName.trim() || businessGroup || category ? (
              <div className="bg-white border border-pebble/65 rounded-2xl shadow-sm p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2.5 border-b border-pebble/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky" />
                  <span className="text-[10px] font-extrabold uppercase text-sky tracking-wider">
                    New Technology
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Technology Name
                  </div>
                  <div className="text-sm font-bold text-night truncate">
                    {techName.trim() || "Technology Name"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Brand
                    </div>
                    <div className="text-xs font-semibold text-night">
                      {brand.trim() || <span className="italic text-gray-300">Dove...</span>}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Business Group
                    </div>
                    <div className="text-xs font-semibold text-night">
                      {businessGroup || <span className="italic text-gray-300">BG...</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Category
                  </div>
                  <div className="text-xs font-semibold text-night">
                    {category || <span className="italic text-gray-300">Category...</span>}
                  </div>
                </div>

                {/* Document preview */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Linked Specification
                  </div>
                  {docSource === "upload" && uploadedFile ? (
                    <div className="flex items-center gap-1.5 text-xs text-night bg-earth/40 p-2 rounded-lg border border-pebble">
                      <FileText className="w-4 h-4 text-sky flex-shrink-0" />
                      <span className="truncate flex-1 font-semibold">{uploadedFile.name}</span>
                    </div>
                  ) : docSource === "library" && selectedDoc ? (
                    <div className="flex items-center gap-1.5 text-xs text-night bg-earth/40 p-2 rounded-lg border border-pebble">
                      <FileText className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="truncate flex-1 font-semibold">{selectedDoc.name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-350 italic">No document linked</div>
                  )}
                </div>

                <div className="p-3 bg-earth/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Lifecycle state</span>
                    <span className="font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase text-[9px]">
                      In-use
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Geographies</span>
                    <span className="font-semibold text-night">Inherited</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pebble/70 rounded-2xl p-8 text-center text-gray-400 space-y-2">
                <Beaker className="w-8 h-8 mx-auto text-gray-350" />
                <p className="text-xs font-bold leading-relaxed">
                  Start filling out the details on the left to see the live preview of your technology.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 border-t border-pebble bg-white flex items-center justify-between flex-shrink-0 z-20">
        <button
          onClick={handleBackAttempt}
          className="px-6 py-2.5 border border-pebble rounded-xl text-sm font-bold text-gray-650 hover:bg-earth hover:text-night transition-all cursor-pointer bg-white"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Create Technology
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-pebble rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-night">Discard Changes?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  All unsaved technology details will be lost permanently.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-pebble text-gray-650 hover:text-night hover:bg-earth font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white"
              >
                Keep Editing
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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

