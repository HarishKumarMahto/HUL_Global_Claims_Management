import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronRight,
  Check,
  AlertCircle,
  Upload,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  FileText,
  Layers,
  Blocks,
  Beaker,
  Globe2,
  Info,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { ProductType, ProductItem, initialProducts } from "./productData";
import { Project } from "../../types";

interface ProductCreationScreenProps {
  onBack: () => void;
  onCreate: (product: any) => void;
  onCreateSKU: () => void;
  onCreateClaim: () => void;
  sourceProject?: Project;
}

interface CascadeRow {
  key: string;
  name: string;
  isNew: boolean;
  isSelected: boolean;
  parentId: string | null;
  existingId?: string;
}

interface LocalVariantRow {
  key: string;
  geography: string;
  cucCode: string;
  formulationDoc?: { name: string; size: string; status: string };
  parentId?: string;
}

const REGIONS = [
  "United Kingdom",
  "Germany",
  "France",
  "United States",
  "Brazil",
  "India",
  "China",
  "Japan",
  "Australia",
];

const FORMAT_MAPPINGS: Record<string, { businessGroup: string; category: string }> = {
  'intensive repair': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'advanced repair': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'original': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'sensitive': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'fabric care': { businessGroup: 'Home Care', category: 'Fabric Care' },
  'hair care': { businessGroup: 'Beauty & Wellbeing', category: 'Hair Care' },
  'nutrition': { businessGroup: 'Foods', category: 'Nutrition' },
};

const CUC_PATTERN = /^CUC-[A-Z0-9]+-[A-Z0-9]+-[A-Z]{2}-\d{3}$/;

export default function ProductCreationScreen({
  onBack,
  onCreate,
  onCreateSKU,
  onCreateClaim,
  sourceProject,
}: ProductCreationScreenProps) {
  // --- Context Header State (Format instead of Brand) ---
  const [selectedFormat, setSelectedFormat] = useState("Intensive Repair");
  const [selectedBG, setSelectedBG] = useState("Beauty & Wellbeing");
  const [selectedCategory, setSelectedCategory] = useState("Skin Care");

  // --- Cascading Row State ---
  const [subRanges, setSubRanges] = useState<CascadeRow[]>([
    { key: "sr-row-1", name: "", isNew: true, isSelected: false, parentId: null }
  ]);
  const [variants, setVariants] = useState<CascadeRow[]>([]);
  const [localVariants, setLocalVariants] = useState<LocalVariantRow[]>([]);

  // --- Active path indexes ---
  const [activeSubRangeKey, setActiveSubRangeKey] = useState<string | null>("sr-row-1");
  const [activeVariantKey, setActiveVariantKey] = useState<string | null>(null);

  // --- Autocomplete UI States ---
  const [focusedCol, setFocusedCol] = useState<number | null>(null);
  const [focusedRowKey, setFocusedRowKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSugIndex, setActiveSugIndex] = useState(0);

  // --- Formulation Linker Overlay State ---
  const [openFormulationRowKey, setOpenFormulationRowKey] = useState<string | null>(null);
  const [formulationTab, setFormulationTab] = useState<"fetch" | "library" | "upload">("fetch");
  const [plmCucInput, setPlmCucInput] = useState("");
  const [isFetchingPlm, setIsFetchingPlm] = useState(false);
  const [fetchPlmError, setFetchPlmError] = useState<string | null>(null);

  // --- General Modal Alerts ---
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cucValidationMap, setCucValidationMap] = useState<Record<string, "valid" | "invalid" | "idle">>({});

  // Auto populate BG & Category based on format selection
  const handleFormatChange = (formatName: string) => {
    setSelectedFormat(formatName);
    const key = formatName.toLowerCase();
    if (FORMAT_MAPPINGS[key]) {
      setSelectedBG(FORMAT_MAPPINGS[key].businessGroup);
      setSelectedCategory(FORMAT_MAPPINGS[key].category);
    }
  };

  // Reset helper
  const resetAndClose = () => {
    setSubRanges([{ key: "sr-row-1", name: "", isNew: true, isSelected: false, parentId: null }]);
    setVariants([]);
    setLocalVariants([]);
    setActiveSubRangeKey("sr-row-1");
    setActiveVariantKey(null);
    setShowCancelConfirm(false);
    onBack();
  };

  // Check if anything has been typed/selected to show discard warning
  const hasChanges = () => {
    return (
      subRanges.some((sr) => sr.name.trim() !== "") ||
      variants.length > 0 ||
      localVariants.some((lv) => lv.cucCode.trim() !== "")
    );
  };

  // Triggered on back attempt
  const handleBackAttempt = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      resetAndClose();
    }
  };

  // Cascade synchronizers
  useEffect(() => {
    if (!activeSubRangeKey) return;
    
    const existing = variants.filter(v => v.parentId === activeSubRangeKey);
    if (existing.length > 0) {
      if (!existing.some(v => v.key === activeVariantKey)) {
        setActiveVariantKey(existing[0].key);
      }
    } else {
      const parentSub = subRanges.find(sr => sr.key === activeSubRangeKey);
      if (parentSub && !parentSub.isNew && parentSub.existingId) {
        const dbVariants = initialProducts.filter(
          (p) => p.type === "Variant" && p.parentId === parentSub.existingId
        );
        if (dbVariants.length > 0) {
          const loaded = dbVariants.map((v, idx) => ({
            key: `v-loaded-${activeSubRangeKey}-${idx}`,
            name: v.levelName || v.name,
            isNew: false,
            isSelected: false,
            parentId: activeSubRangeKey,
            existingId: v.id,
          }));
          setVariants(prev => [...prev, ...loaded]);
          setActiveVariantKey(loaded[0].key);
        } else {
          const newKey = `v-row-auto-${activeSubRangeKey}`;
          setVariants(prev => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: activeSubRangeKey }]);
          setActiveVariantKey(newKey);
        }
      } else {
        const newKey = `v-row-auto-${activeSubRangeKey}`;
        setVariants(prev => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: activeSubRangeKey }]);
        setActiveVariantKey(newKey);
      }
    }
  }, [activeSubRangeKey, subRanges, variants, activeVariantKey]);

  useEffect(() => {
    if (!activeVariantKey) return;

    const existing = localVariants.filter(lv => lv.parentId === activeVariantKey);
    if (existing.length === 0) {
      const newKey = `lv-row-auto-${activeVariantKey}`;
      setLocalVariants(prev => [...prev, { key: newKey, geography: "United Kingdom", cucCode: "", parentId: activeVariantKey }]);
    }
  }, [activeVariantKey, localVariants]);

  // Autocomplete filter engine
  useEffect(() => {
    if (focusedCol === null || focusedRowKey === null) {
      setSuggestions([]);
      return;
    }

    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (focusedCol === 2) {
      // SUB RANGE Suggestions
      const formatSubRanges = initialProducts.filter(
        (p) => p.type === "Subrange" && p.brand.toLowerCase() === selectedFormat.toLowerCase()
      );
      
      const list = formatSubRanges.map((sr) => ({
        type: "existing",
        id: sr.id,
        levelName: sr.levelName || sr.name,
        name: sr.name,
        badge: "USE EXISTING",
        badgeStyle: "bg-green-100 text-green-700 border-green-200"
      }));

      const crossFormats = initialProducts.filter(
        (p) => p.type === "Subrange" && p.brand.toLowerCase() !== selectedFormat.toLowerCase()
      );
      crossFormats.forEach((sr) => {
        if (!list.some((existing) => existing.levelName.toLowerCase() === (sr.levelName || sr.name).toLowerCase())) {
          list.push({
            type: "cross",
            id: sr.id,
            levelName: sr.levelName || sr.name,
            name: sr.name,
          });
        }
      });

      const filtered = list.filter((item) =>
        item.levelName.toLowerCase().includes(trimmedQuery)
      );

      const exactMatch = list.find(
        (item) => item.levelName.toLowerCase() === trimmedQuery
      );
      if (trimmedQuery.length > 0 && !exactMatch) {
        filtered.unshift({
          type: "new",
          levelName: searchQuery,
          badge: "CREATE NEW",
          badgeStyle: "bg-sky-100 text-sky-700 border-sky-200"
        });
      }

      setSuggestions(filtered.slice(0, 5));
      setActiveSugIndex(0);

    } else if (focusedCol === 3) {
      // VARIANT Suggestions
      const activeSubRange = subRanges.find((sr) => sr.key === activeSubRangeKey);
      if (!activeSubRange) {
        setSuggestions([]);
        return;
      }

      let exactParentVariants: ProductItem[] = [];
      if (!activeSubRange.isNew && activeSubRange.existingId) {
        exactParentVariants = initialProducts.filter(
          (p) => p.type === "Variant" && p.parentId === activeSubRange.existingId
        );
      }

      const list = exactParentVariants.map((v) => ({
        type: "existing",
        id: v.id,
        levelName: v.levelName || v.name,
        name: v.name,
        badge: "USE EXISTING",
        badgeStyle: "bg-green-100 text-green-700 border-green-200"
      }));

      const crossParentVariants = initialProducts.filter(
        (p) => p.type === "Variant" && p.parentId !== activeSubRange.existingId
      );
      crossParentVariants.forEach((v) => {
        if (!list.some((item) => item.levelName.toLowerCase() === (v.levelName || v.name).toLowerCase())) {
          list.push({
            type: "cross",
            id: v.id,
            levelName: v.levelName || v.name,
            name: v.name,
            badgeStyle: "bg-amber-100 text-amber-700 border-amber-200"
          });
        }
      });

      const filtered = list.filter((item) =>
        item.levelName.toLowerCase().includes(trimmedQuery)
      );

      const exactMatch = list.find(
        (item) => item.levelName.toLowerCase() === trimmedQuery
      );
      if (trimmedQuery.length > 0 && !exactMatch) {
        filtered.unshift({
          type: "new",
          levelName: searchQuery,
          badge: "CREATE NEW",
          badgeStyle: "bg-sky-100 text-sky-700 border-sky-200"
        });
      }

      setSuggestions(filtered.slice(0, 5));
      setActiveSugIndex(0);
    }
  }, [searchQuery, focusedCol, focusedRowKey, activeSubRangeKey, selectedFormat]);

  // Committing autocomplete selection
  const commitSelection = (sug: any) => {
    if (focusedCol === null || focusedRowKey === null) return;

    if (focusedCol === 2) {
      setSubRanges((prev) =>
        prev.map((sr) =>
          sr.key === focusedRowKey
            ? {
                ...sr,
                name: sug.levelName,
                isNew: sug.type === "new",
                existingId: sug.id,
                isSelected: true,
              }
            : sr
        )
      );
      setActiveSubRangeKey(focusedRowKey);

      if (sug.type !== "new" && sug.id) {
        const dbVariants = initialProducts.filter(
          (p) => p.type === "Variant" && p.parentId === sug.id
        );
        if (dbVariants.length > 0) {
          const loaded = dbVariants.map((v, idx) => ({
            key: `v-loaded-${focusedRowKey}-${idx}`,
            name: v.levelName || v.name,
            isNew: false,
            isSelected: false,
            parentId: focusedRowKey,
            existingId: v.id,
          }));
          setVariants(prev => [
            ...prev.filter(v => v.parentId !== focusedRowKey),
            ...loaded
          ]);
          setActiveVariantKey(loaded[0].key);
        }
      }

    } else if (focusedCol === 3) {
      setVariants((prev) =>
        prev.map((v) =>
          v.key === focusedRowKey
            ? {
                ...v,
                name: sug.levelName,
                isNew: sug.type === "new",
                existingId: sug.id,
                isSelected: true,
              }
            : v
        )
      );
      setActiveVariantKey(focusedRowKey);
    }

    setFocusedCol(null);
    setFocusedRowKey(null);
    setSearchQuery("");
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, colIndex: number, rowKey: string, rowIndex: number) => {
    if (focusedCol !== null && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSugIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSugIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        commitSelection(suggestions[activeSugIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setFocusedCol(null);
        setFocusedRowKey(null);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (colIndex === 2) {
        const newKey = `sr-row-${Date.now()}`;
        setSubRanges((prev) => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: null }]);
        setActiveSubRangeKey(newKey);
        setTimeout(() => document.getElementById(`input-${newKey}`)?.focus(), 50);
      } else if (colIndex === 3) {
        const newKey = `v-row-${Date.now()}`;
        setVariants((prev) => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: activeSubRangeKey }]);
        setActiveVariantKey(newKey);
        setTimeout(() => document.getElementById(`input-${newKey}`)?.focus(), 50);
      } else if (colIndex === 4) {
        const newKey = `lv-row-${Date.now()}`;
        setLocalVariants((prev) => [...prev, { key: newKey, geography: "United Kingdom", cucCode: "", parentId: activeVariantKey || "" }]);
        setTimeout(() => document.getElementById(`cuc-input-${newKey}`)?.focus(), 50);
      }
    }
  };

  // Row updates
  const handleInputChange = (val: string, colIndex: number, rowKey: string) => {
    setSearchQuery(val);
    if (colIndex === 2) {
      setSubRanges((prev) => prev.map((sr) => (sr.key === rowKey ? { ...sr, name: val, isSelected: false } : sr)));
    } else if (colIndex === 3) {
      setVariants((prev) => prev.map((v) => (v.key === rowKey ? { ...v, name: val, isSelected: false } : v)));
    }
  };

  const deleteRow = (colIndex: number, rowKey: string) => {
    if (colIndex === 2) {
      if (subRanges.length > 1) {
        setSubRanges((prev) => prev.filter((sr) => sr.key !== rowKey));
        if (activeSubRangeKey === rowKey) {
          const remaining = subRanges.filter((sr) => sr.key !== rowKey);
          setActiveSubRangeKey(remaining[0].key);
        }
      }
    } else if (colIndex === 3) {
      const activeSrVariants = variants.filter(v => v.parentId === activeSubRangeKey);
      if (activeSrVariants.length > 1) {
        setVariants((prev) => prev.filter((v) => v.key !== rowKey));
        if (activeVariantKey === rowKey) {
          const remaining = activeSrVariants.filter((v) => v.key !== rowKey);
          setActiveVariantKey(remaining[0].key);
        }
      }
    } else if (colIndex === 4) {
      const activeVarLvs = localVariants.filter(lv => lv.parentId === activeVariantKey);
      if (activeVarLvs.length > 1) {
        setLocalVariants((prev) => prev.filter((lv) => lv.key !== rowKey));
      }
    }
  };

  // CUC code and formulation helpers
  const handleCucChange = (rowKey: string, val: string) => {
    setLocalVariants((prev) =>
      prev.map((lv) => (lv.key === rowKey ? { ...lv, cucCode: val } : lv))
    );

    if (!val) {
      setCucValidationMap((prev) => ({ ...prev, [rowKey]: "idle" }));
      return;
    }

    setTimeout(() => {
      const isValid = CUC_PATTERN.test(val);
      setCucValidationMap((prev) => ({ ...prev, [rowKey]: isValid ? "valid" : "invalid" }));
    }, 300);
  };

  const handleFetchFromPlm = (rowKey: string) => {
    setFetchPlmError(null);
    if (!plmCucInput.trim()) {
      setFetchPlmError("CUC code is required to search.");
      return;
    }
    setIsFetchingPlm(true);
    setTimeout(() => {
      setIsFetchingPlm(false);
      setLocalVariants((prev) =>
        prev.map((lv) =>
          lv.key === rowKey
            ? {
                ...lv,
                cucCode: plmCucInput.toUpperCase(),
                formulationDoc: {
                  name: `PLM_Composition_${plmCucInput.trim().toUpperCase()}_v2.pdf`,
                  size: "1.8 MB",
                  status: "PLM Validated"
                }
              }
            : lv
        )
      );
      setCucValidationMap((prev) => ({ ...prev, [rowKey]: "valid" }));
      setOpenFormulationRowKey(null);
    }, 1000);
  };

  // SAVE CORE LOGIC
  const canSave = () => {
    const hasSub = subRanges.some((sr) => sr.name.trim() !== "");
    const hasVar = variants.some((v) => v.name.trim() !== "");
    const hasLv = localVariants.some((lv) => lv.geography.trim() !== "" && lv.cucCode.trim() !== "");
    return hasSub && hasVar && hasLv;
  };

  const handleSave = () => {
    if (!canSave()) return;

    const listToCreate: any[] = [];
    const nowStr = new Date().toISOString().split("T")[0];

    const getCompoundName = (...parts: string[]) => parts.filter(Boolean).join(" ");

    // Build Sub Ranges
    const createdSubRangeMap: Record<string, string> = {};
    subRanges.forEach((sr) => {
      if (sr.name.trim() === "") return;
      const cleanName = sr.name.trim();

      if (sr.isNew) {
        const newId = `prod-sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        createdSubRangeMap[sr.key] = newId;

        listToCreate.push({
          id: newId,
          name: getCompoundName(selectedFormat, cleanName),
          levelName: cleanName,
          type: "Subrange",
          parentId: null,
          parentName: null,
          category: selectedCategory,
          businessGroup: selectedBG,
          brand: selectedFormat,
          createdBy: "Sarah Johnson",
          createdDate: nowStr
        });
      } else {
        createdSubRangeMap[sr.key] = sr.existingId || "";
      }
    });

    // Build Variants
    const createdVariantMap: Record<string, string> = {};
    variants.forEach((v) => {
      if (v.name.trim() === "") return;
      const cleanName = v.name.trim();
      const parentSrId = createdSubRangeMap[v.parentId || ""] || "";
      const parentSrObj = initialProducts.find((p) => p.id === parentSrId) || listToCreate.find((p) => p.id === parentSrId);
      const parentName = parentSrObj ? parentSrObj.name : "";

      if (v.isNew) {
        const newId = `prod-var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        createdVariantMap[v.key] = newId;

        listToCreate.push({
          id: newId,
          name: getCompoundName(parentName, cleanName),
          levelName: cleanName,
          type: "Variant",
          parentId: parentSrId || null,
          parentName: parentName || null,
          category: selectedCategory,
          businessGroup: selectedBG,
          brand: selectedFormat,
          createdBy: "Sarah Johnson",
          createdDate: nowStr
        });
      } else {
        createdVariantMap[v.key] = v.existingId || "";
      }
    });

    // Build Local Variants
    variants.forEach((v) => {
      if (v.name.trim() === "") return;
      const parentVarId = createdVariantMap[v.key] || "";
      const parentVarObj = initialProducts.find((p) => p.id === parentVarId) || listToCreate.find((p) => p.id === parentVarId);
      const parentName = parentVarObj ? parentVarObj.name : "";

      const childLocalVariants = localVariants.filter((lv) => lv.parentId === v.key);
      childLocalVariants.forEach((lv) => {
        if (lv.cucCode.trim() === "" || lv.geography.trim() === "") return;
        const cleanGeo = lv.geography.trim();
        const cleanCuc = lv.cucCode.trim();
        const geoSuffix = cleanGeo.substring(0, 2).toUpperCase();

        const newId = `prod-lv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        listToCreate.push({
          id: newId,
          name: getCompoundName(parentName, geoSuffix),
          levelName: geoSuffix,
          type: "Local Variant",
          parentId: parentVarId || null,
          parentName: parentName || null,
          category: selectedCategory,
          businessGroup: selectedBG,
          brand: selectedFormat,
          cucSpecNumber: cleanCuc,
          geographies: [cleanGeo],
          createdBy: "Sarah Johnson",
          createdDate: nowStr
        });
      });
    });

    onCreate(listToCreate);
    resetAndClose();
  };

  // RENDER
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
          <div className="p-2 bg-sky rounded-xl text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-night leading-tight">Product Creation Form</h1>
            <p className="text-xs text-gray-500 mt-0.5">Define your product structure with formats, sub-ranges, and variants</p>
          </div>
        </div>
      </div>

      {/* Context Header Area */}
      <div className="px-6 py-4 border-b border-pebble/60 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">Select Format</label>
          <div className="relative">
            <select
              value={selectedFormat}
              onChange={(e) => handleFormatChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-pebble rounded-xl text-sm font-semibold text-night focus:ring-2 focus:ring-sky outline-none appearance-none cursor-pointer"
            >
              {Object.keys(FORMAT_MAPPINGS).map((f) => (
                <option key={f} value={f.charAt(0).toUpperCase() + f.slice(1)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-brand-muted-text pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">Business Group (Inherited)</label>
          <div className="px-4 py-2 bg-earth border border-pebble rounded-xl text-sm font-medium text-brand-night select-none">
            {selectedBG}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-night block mb-1.5">Category (Inherited)</label>
          <div className="px-4 py-2 bg-earth border border-pebble rounded-xl text-sm font-medium text-brand-night select-none">
            {selectedCategory}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-8 max-w-6xl mx-auto">
          {/* Sub Ranges Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-pebble">
              <Blocks className="w-5 h-5 text-brand-sky" />
              <h2 className="text-sm font-bold uppercase text-brand-night">Sub Ranges</h2>
            </div>
            <div className="space-y-3">
              {subRanges.map((sr, idx) => (
                <div key={sr.key} className="border border-pebble/60 rounded-xl p-4 bg-white hover:border-pebble transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold bg-sky/10 text-sky px-2 py-1 rounded-lg">Sub Range {idx + 1}</span>
                    {subRanges.length > 1 && (
                      <button
                        onClick={() => deleteRow(2, sr.key)}
                        className="ml-auto p-1 hover:bg-red-50 text-brand-muted-text hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id={`input-${sr.key}`}
                      type="text"
                      value={sr.name}
                      onChange={(e) => handleInputChange(e.target.value, 2, sr.key)}
                      onFocus={() => {
                        setFocusedCol(2);
                        setFocusedRowKey(sr.key);
                        setSearchQuery(sr.name);
                        setActiveSubRangeKey(sr.key);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, 2, sr.key, idx)}
                      placeholder="Type or select sub range name..."
                      className="w-full px-4 py-2 bg-white border border-pebble rounded-xl text-sm font-semibold text-night focus:ring-2 focus:ring-sky outline-none placeholder:text-gray-400"
                    />
                    {focusedCol === 2 && focusedRowKey === sr.key && (
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-sky animate-pulse" />
                    )}

                    {/* Floating Dropdown */}
                    {focusedCol === 2 && focusedRowKey === sr.key && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden max-h-[200px] overflow-y-auto">
                        {suggestions.map((sug, sIdx) => (
                          <div
                            key={sug.levelName + sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              commitSelection(sug);
                            }}
                            className={`px-4 py-3 text-left cursor-pointer flex items-center gap-3 transition-colors ${
                              sIdx === activeSugIndex ? "bg-sky/10 text-sky" : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="text-sm font-medium flex-1 truncate">{sug.levelName}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${sug.badgeStyle}`}>
                              {sug.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variants for this Sub Range */}
                  {sr.key === activeSubRangeKey && (
                    <div className="mt-6 pt-4 border-t border-pebble/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-brand-clover" />
                        <h3 className="text-xs font-bold uppercase text-brand-night">+ Variants</h3>
                      </div>

                      {variants.filter(v => v.parentId === sr.key).map((v, vIdx) => (
                        <div key={v.key} className="ml-4 border border-pebble/40 rounded-lg p-3 bg-earth/5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500">Variant {vIdx + 1}</span>
                            {variants.filter(x => x.parentId === sr.key).length > 1 && (
                              <button
                                onClick={() => deleteRow(3, v.key)}
                                className="ml-auto p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <input
                            id={`input-${v.key}`}
                            type="text"
                            value={v.name}
                            onChange={(e) => handleInputChange(e.target.value, 3, v.key)}
                            onFocus={() => {
                              setFocusedCol(3);
                              setFocusedRowKey(v.key);
                              setSearchQuery(v.name);
                              setActiveVariantKey(v.key);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, 3, v.key, vIdx)}
                            placeholder="Type variant name..."
                            className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-xs font-semibold text-night focus:ring-1 focus:ring-sky outline-none"
                          />

                          {/* Floating Dropdown for Variants */}
                          {focusedCol === 3 && focusedRowKey === v.key && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden max-h-[150px] overflow-y-auto">
                              {suggestions.map((sug, sIdx) => (
                                <div
                                  key={sug.levelName + sIdx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    commitSelection(sug);
                                  }}
                                  className={`px-3 py-2 text-left cursor-pointer flex items-center gap-2 transition-colors text-xs ${
                                    sIdx === activeSugIndex ? "bg-sky/10 text-sky" : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <span className="font-medium flex-1 truncate">{sug.levelName}</span>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${sug.badgeStyle}`}>
                                    {sug.badge}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Local Variants for this Variant */}
                          {v.key === activeVariantKey && (
                            <div className="mt-3 pt-3 border-t border-pebble/40 space-y-2">
                              <div className="flex items-center gap-2">
                                <Globe2 className="w-3 h-3 text-brand-lilac" />
                                <span className="text-xs font-semibold text-gray-500">+ Local Variants</span>
                              </div>

                              {localVariants.filter(lv => lv.parentId === v.key).map((lv) => (
                                <div key={lv.key} className="ml-3 border border-pebble/30 rounded-lg p-2.5 bg-white space-y-2">
                                  <div className="flex items-center justify-between">
                                    <select
                                      value={lv.geography}
                                      onChange={(e) =>
                                        setLocalVariants((prev) =>
                                          prev.map((item) => (item.key === lv.key ? { ...item, geography: e.target.value } : item))
                                        )
                                      }
                                      className="flex-1 px-2 py-1 bg-white border border-pebble rounded-lg text-xs font-semibold focus:ring-1 focus:ring-sky outline-none"
                                    >
                                      {REGIONS.map((geo) => (
                                        <option key={geo} value={geo}>{geo}</option>
                                      ))}
                                    </select>
                                    {localVariants.filter(item => item.parentId === v.key).length > 1 && (
                                      <button
                                        onClick={() => deleteRow(4, lv.key)}
                                        className="ml-2 p-0.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    id={`cuc-input-${lv.key}`}
                                    type="text"
                                    value={lv.cucCode}
                                    onChange={(e) => handleCucChange(lv.key, e.target.value)}
                                    placeholder="CUC-DVB-IR-UK-001"
                                    className={`w-full px-2 py-1 bg-white border rounded-lg text-xs font-semibold text-night outline-none focus:ring-1 ${
                                      cucValidationMap[lv.key] === "valid"
                                        ? "border-green-500 focus:ring-green-500"
                                        : cucValidationMap[lv.key] === "invalid"
                                        ? "border-red-400 focus:ring-red-400"
                                        : "border-pebble focus:ring-sky"
                                    }`}
                                  />
                                  {lv.formulationDoc ? (
                                    <button
                                      onClick={() => setOpenFormulationRowKey(lv.key)}
                                      className="text-xs text-green-600 font-semibold hover:text-green-800"
                                    >
                                      {lv.formulationDoc.name}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setOpenFormulationRowKey(lv.key);
                                        setPlmCucInput(lv.cucCode);
                                      }}
                                      className="text-xs text-sky font-semibold hover:text-sky-dark"
                                    >
                                      + Link Composition
                                    </button>
                                  )}
                                </div>
                              ))}

                              <button
                                onClick={() => {
                                  const newKey = `lv-row-${Date.now()}`;
                                  setLocalVariants((prev) => [
                                    ...prev,
                                    { key: newKey, geography: "United Kingdom", cucCode: "", parentId: v.key }
                                  ]);
                                }}
                                className="text-xs text-sky font-semibold hover:text-sky-dark"
                              >
                                + Local Variant
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newKey = `v-row-${Date.now()}`;
                          setVariants((prev) => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: sr.key }]);
                          setActiveVariantKey(newKey);
                        }}
                        className="text-xs text-sky font-semibold hover:text-sky-dark ml-4"
                      >
                        + Add Variant
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  const newKey = `sr-row-${Date.now()}`;
                  setSubRanges((prev) => [...prev, { key: newKey, name: "", isNew: true, isSelected: false, parentId: null }]);
                  setActiveSubRangeKey(newKey);
                }}
                className="w-full py-3 border border-dashed border-pebble hover:border-sky/50 rounded-xl text-sm font-bold text-brand-muted-text hover:text-sky flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                + Sub Range
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 border-t border-pebble bg-earth flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBackAttempt}
          className="px-5 py-2.5 border border-pebble rounded-xl text-sm font-semibold text-brand-night bg-white hover:bg-gray-50 transition-all cursor-pointer"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateClaim}
            className="px-6 py-2.5 bg-brand-sorbet text-white rounded-xl text-sm font-bold hover:bg-sorbet-dark transition-all cursor-pointer"
          >
            Save and Create Claim
          </button>
          <button
            onClick={onCreateSKU}
            className="px-6 py-2.5 bg-brand-sky text-white rounded-xl text-sm font-bold shadow-lg shadow-sky/15 hover:bg-sky-dark transition-all cursor-pointer"
          >
            Create SKU
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/15 hover:bg-green-700 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            Save Product
          </button>
        </div>
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
                <p className="text-xs text-gray-500 mt-0.5">All unsaved product data will be lost permanently.</p>
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
                onClick={resetAndClose}
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
