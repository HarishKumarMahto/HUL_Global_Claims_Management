import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  Globe2,
  AlertTriangle,
  Layers,
  Blocks,
  Beaker,
  Tag,
  Search,
  Trash2,
  FileText,
  Upload,
  Link2,
} from "lucide-react";
import { ProductType, ProductItem, initialProducts } from "./productData";
import { Project } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (products: any[]) => void;
  preselectedType?: ProductType;
  project?: Project;
  onSwitchToSearch?: () => void;
  onNavigateToSKU?: () => void;
}

type LocalVariantRow = {
  id: string;
  geography: string;
  cucCode: string;
  formulationDoc: string | null;
};

type VariantEntry = {
  id: string;
  name: string;
  localVariants: LocalVariantRow[];
  showAddLVPanel: boolean;
  pendingGeos: string[];
};

type SubrangeEntry = {
  id: string;
  name: string;
  variants: VariantEntry[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_GEOGRAPHIES = [
  "Global", "EMEA", "North America", "LATAM", "APAC",
  "South Asia", "United Kingdom", "Germany", "France",
  "United States", "Brazil", "India", "China", "Japan", "Australia",
];

const FORMAT_OPTIONS = initialProducts
  .filter((p) => p.type === "Format")
  .map((p) => ({ id: p.id, name: p.name, levelName: p.levelName, brand: p.brand, businessGroup: p.businessGroup, category: p.category }));

const getExistingSubranges = (formatId: string) =>
  initialProducts.filter((p) => p.type === "Subrange" && p.parentId === formatId).map((p) => p.levelName);

const getExistingVariants = (parentId: string) =>
  initialProducts.filter((p) => p.type === "Variant" && p.parentId === parentId).map((p) => p.levelName);

let _eid = 0;
const newId = () => `eid-${++_eid}`;

const makeDefaultLV = (geography: string): LocalVariantRow => ({
  id: newId(),
  geography,
  cucCode: "",
  formulationDoc: null,
});

const makeDefaultVariant = (): VariantEntry => ({
  id: newId(),
  name: "",
  localVariants: [],
  showAddLVPanel: false,
  pendingGeos: [],
});

const makeDefaultSubrange = (): SubrangeEntry => ({
  id: newId(),
  name: "",
  variants: [],
});

// ─── AutocompleteInput ────────────────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, suggestions, placeholder, className = "",
}: { value: string; onChange: (v: string) => void; suggestions: string[]; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input type="text" value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 text-night placeholder:text-gray-400 placeholder:font-normal transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-40 overflow-y-auto py-1">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-night font-medium truncate cursor-pointer">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MultiGeoSelector ─────────────────────────────────────────────────────────
function MultiGeoSelector({
  selected,
  onChange,
  usedGeos,
}: {
  selected: string[];
  onChange: (geos: string[]) => void;
  usedGeos: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const available = ALL_GEOGRAPHIES.filter(
    (g) => !usedGeos.includes(g) && g.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (geo: string) => {
    if (selected.includes(geo)) {
      onChange(selected.filter((g) => g !== geo));
    } else {
      onChange([...selected, geo]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-left transition-all hover:border-sky/50 focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
      >
        <Globe2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className={`flex-1 truncate ${selected.length > 0 ? "text-night font-medium" : "text-gray-400 font-normal"}`}>
          {selected.length > 0 ? selected.join(", ") : "Select geographies..."}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selected.length > 0 && (
            <span className="text-[10px] bg-sky/10 text-sky font-bold px-1.5 py-0.5 rounded-md">
              {selected.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2" style={{ minWidth: "100%" }}>
          {/* Search */}
          <div className="px-3 pb-2 border-b border-gray-100">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search geographies..."
                className="w-full pl-7 pr-3 py-1.5 bg-gray-50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky/30 text-night placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-44 overflow-y-auto py-1">
            {available.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 italic text-center">No geographies available</div>
            ) : (
              available.map((g) => (
                <button
                  key={g}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(g)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-night cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected.includes(g)
                      ? "bg-sky border-sky"
                      : "border-gray-300 bg-white"
                  }`}>
                    {selected.includes(g) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-medium">{g}</span>
                </button>
              ))
            )}
          </div>

          {/* Footer actions */}
          {selected.length > 0 && (
            <div className="px-3 pt-2 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer font-medium"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-white bg-sky hover:bg-dark px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Confirm ({selected.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Hierarchy Tree View ──────────────────────────────────────────────────────
function HierarchyView({
  formatName,
  addSubrangeOpted,
  subranges,
}: {
  formatName: string;
  addSubrangeOpted: boolean;
  subranges: SubrangeEntry[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const hasContent = formatName && (
    !addSubrangeOpted
      ? subranges[0]?.variants.some((v) => v.name || v.localVariants.length > 0)
      : subranges.some((sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0))
  );

  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8 text-gray-400 px-3">
        <Layers className="w-10 h-10 text-gray-300" />
        <p className="text-xs leading-relaxed font-medium text-gray-400">Hierarchy preview will appear here as you fill in subranges, variants and local variants</p>
      </div>
    );
  }

  const renderVariants = (variants: VariantEntry[], keyPrefix: string) =>
    variants.map((vt, vi) => {
      const vtKey = `${keyPrefix}-vt-${vi}`;
      const vtExp = expanded[vtKey] !== false;
      if (!vt.name && vt.localVariants.length === 0) return null;
      return (
        <div key={vt.id} className="mt-1">
          <button type="button" onClick={() => toggle(vtKey)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left text-night cursor-pointer">
            <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${vtExp ? "rotate-90" : ""}`} />
            <Beaker className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-night truncate flex-1 font-semibold text-xs">{vt.name || <span className="text-gray-400 italic">Unnamed Variant</span>}</span>
            <span className="text-[9px] bg-sky/10 text-sky px-1.5 py-0.5 rounded font-bold uppercase">Var</span>
          </button>
          {vtExp && vt.localVariants.length > 0 && (
            <div className="ml-5 space-y-0.5 border-l border-gray-100 pl-2 mt-0.5">
              {vt.localVariants.map((lv) => (
                <div key={lv.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-night">
                  <Globe2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate flex-1 text-[11px] font-medium">{lv.geography}</span>
                  {lv.cucCode && <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold border border-green-100">{lv.cucCode}</span>}
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">LV</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="flex-1 overflow-y-auto text-xs space-y-1 py-1">
      {formatName && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-night font-bold">
          <Layers className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
          <span className="truncate flex-1 text-xs">{formatName}</span>
          <span className="text-[9px] bg-sky/10 text-sky px-1.5 py-0.5 rounded font-bold uppercase">Bulk</span>
        </div>
      )}

      {addSubrangeOpted ? (
        <div className="ml-2 space-y-1 mt-1">
          {subranges.map((sr, sri) => {
            const srKey = `sr-${sri}`;
            const srExp = expanded[srKey] !== false;
            const hasSrContent = sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0);
            if (!hasSrContent) return null;
            return (
              <div key={sr.id} className="space-y-0.5">
                <button type="button" onClick={() => toggle(srKey)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left text-night cursor-pointer">
                  <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${srExp ? "rotate-90" : ""}`} />
                  <Blocks className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold truncate flex-1 text-xs">{sr.name || <span className="text-gray-400 italic">Sub Range {sri + 1}</span>}</span>
                  <span className="text-[9px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded border border-violet-100 font-bold uppercase">SR</span>
                </button>
                {srExp && (
                  <div className="ml-5 space-y-0.5 border-l border-gray-100 pl-2">
                    {renderVariants(sr.variants, srKey)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ml-2 mt-1">
          {renderVariants(subranges[0]?.variants ?? [], "root")}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CreateProductModal({
  isOpen, onClose, onCreate, preselectedType, project, onSwitchToSearch, onNavigateToSKU,
}: CreateProductModalProps) {
  // ── Format Selection ─────────────────────────────────────────────────────
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const [formatDropOpen, setFormatDropOpen] = useState(false);
  const formatDropRef = useRef<HTMLDivElement>(null);
  const selectedFormat = FORMAT_OPTIONS.find((f) => f.id === selectedFormatId) ?? null;

  // ── Add Subrange Radio Toggle ────────────────────────────────────────────
  const [addSubrangeOpted, setAddSubrangeOpted] = useState(true);

  // ── Subranges State ──────────────────────────────────────────────────────
  const [subranges, setSubranges] = useState<SubrangeEntry[]>([makeDefaultSubrange()]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (formatDropRef.current && !formatDropRef.current.contains(e.target as Node)) setFormatDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Subrange ops ──────────────────────────────────────────────────────────
  const addSubrange = useCallback(() => {
    setSubranges((prev) => [...prev, makeDefaultSubrange()]);
  }, []);

  const removeSubrange = useCallback((sri: number) => {
    setSubranges((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== sri) : prev));
  }, []);

  const updateSubrangeName = useCallback((sri: number, val: string) => {
    setSubranges((prev) => prev.map((sr, i) => (i === sri ? { ...sr, name: val } : sr)));
  }, []);

  // ── Variant ops ──────────────────────────────────────────────────────────
  const addVariant = useCallback((sri: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return { ...sr, variants: [...sr.variants, makeDefaultVariant()] };
    }));
  }, []);

  const removeVariant = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return { ...sr, variants: sr.variants.filter((_, j) => j !== vi) };
    }));
  }, []);

  const updateVariantName = useCallback((sri: number, vi: number, name: string) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return { ...sr, variants: sr.variants.map((v, j) => (j === vi ? { ...v, name } : v)) };
    }));
  }, []);

  const setShowAddLVPanel = useCallback((sri: number, vi: number, show: boolean) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return { ...sr, variants: sr.variants.map((v, j) => (j === vi ? { ...v, showAddLVPanel: show, pendingGeos: show ? v.pendingGeos : [] } : v)) };
    }));
  }, []);

  const setPendingGeos = useCallback((sri: number, vi: number, geos: string[]) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return { ...sr, variants: sr.variants.map((v, j) => (j === vi ? { ...v, pendingGeos: geos } : v)) };
    }));
  }, []);

  const confirmAddLocalVariants = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          const existingGeos = v.localVariants.map((lv) => lv.geography);
          const newLVs = v.pendingGeos
            .filter((g) => !existingGeos.includes(g))
            .map((g) => makeDefaultLV(g));
          return {
            ...v,
            localVariants: [...v.localVariants, ...newLVs],
            pendingGeos: [],
            showAddLVPanel: false,
          };
        }),
      };
    }));
  }, []);

  // ── Local Variant ops ────────────────────────────────────────────────────
  const updateLV = useCallback((sri: number, vi: number, lvId: string, patch: Partial<LocalVariantRow>) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          return { ...v, localVariants: v.localVariants.map((lv) => (lv.id === lvId ? { ...lv, ...patch } : lv)) };
        }),
      };
    }));
  }, []);

  const removeLV = useCallback((sri: number, vi: number, lvId: string) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          return { ...v, localVariants: v.localVariants.filter((lv) => lv.id !== lvId) };
        }),
      };
    }));
  }, []);

  // ── Cancel Confirmation ──────────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const handleClose = () => {
    const hasData = selectedFormatId || subranges.some((sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0));
    if (hasData) { setShowCancelConfirm(true); } else { resetAndClose(); }
  };
  const resetAndClose = () => {
    setSelectedFormatId("");
    setSubranges([makeDefaultSubrange()]);
    setShowCancelConfirm(false);
    onClose();
  };

  // ── Create Product ────────────────────────────────────────────────────────
  const handleCreateProduct = () => {
    if (!selectedFormat) return;
    const listToCreate: any[] = [];
    const nowStr = new Date().toISOString().split("T")[0];
    const getCompoundName = (...parts: string[]) => parts.filter(Boolean).join(" ");

    const processVariants = (variants: VariantEntry[], parentId: string, parentName: string) => {
      variants.forEach((v, vi) => {
        if (!v.name.trim()) return;
        const vId = `prod-var-${Date.now()}-${vi}-${Math.floor(Math.random() * 1000)}`;
        const vName = getCompoundName(parentName, v.name.trim());
        listToCreate.push({
          id: vId, name: vName, levelName: v.name.trim(), type: "Variant",
          parentId, parentName,
          geographies: v.localVariants.map((lv) => lv.geography).filter(Boolean),
          category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
          brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
        });
        v.localVariants.forEach((lv, lvi) => {
          const lvId = `prod-lv-${Date.now()}-${vi}-${lvi}-${Math.floor(Math.random() * 1000)}`;
          listToCreate.push({
            id: lvId, name: getCompoundName(vName, lv.geography.substring(0, 2).toUpperCase()),
            levelName: lv.geography.substring(0, 2).toUpperCase(), type: "Local Variant",
            parentId: vId, parentName: vName,
            geographies: [lv.geography], cucSpecNumber: lv.cucCode,
            category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
            brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
          });
        });
      });
    };

    if (addSubrangeOpted) {
      subranges.forEach((sr, sri) => {
        if (!sr.name.trim()) return;
        const srId = `prod-sub-${Date.now()}-${sri}-${Math.floor(Math.random() * 1000)}`;
        const srName = getCompoundName(selectedFormat.name, sr.name.trim());
        listToCreate.push({
          id: srId, name: srName, levelName: sr.name.trim(), type: "Subrange",
          parentId: selectedFormat.id, parentName: selectedFormat.name, geographies: [],
          category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
          brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
        });
        processVariants(sr.variants, srId, srName);
      });
    } else {
      processVariants(subranges[0]?.variants ?? [], selectedFormat.id, selectedFormat.name);
    }

    if (listToCreate.length > 0) onCreate(listToCreate);
    resetAndClose();
  };

  if (!isOpen) return null;

  const formatName = selectedFormat?.name ?? "";
  const existingSubranges = selectedFormatId ? getExistingSubranges(selectedFormatId) : [];
  const existingVariants = selectedFormatId ? getExistingVariants(selectedFormatId) : [];

  // ── Render helper for variants section ─────────────────────────────────────
  // Variants are laid out HORIZONTALLY (flex row, overflow-x-auto).
  // Local variants are stacked VERTICALLY inside each variant column.
  const renderVariantsSection = (sri: number, variants: VariantEntry[], useSri: number) => (
    <div className="flex items-stretch gap-4 overflow-x-auto pb-2 no-scrollbar">
      {/* Existing Variant Columns */}
      {variants.map((vt, vi) => {
        const allUsedGeos = vt.localVariants.map((lv) => lv.geography);
        const availableForPending = ALL_GEOGRAPHIES.filter((g) => !allUsedGeos.includes(g));

        return (
          <div
            key={vt.id}
            className="flex-shrink-0 w-[280px] flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm animate-fadeInUp"
          >
            {/* Variant Column Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky/10 text-sky text-[10px] font-black flex items-center justify-center flex-shrink-0">
                  V{vi + 1}
                </span>
                <span className="text-xs font-bold text-night uppercase tracking-wider">Variant {vi + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeVariant(useSri, vi)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                title="Remove Variant"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Variant Column Body — scrollable vertically */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
              {/* Variant Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variant Name *</label>
                <AutocompleteInput
                  value={vt.name}
                  onChange={(val) => updateVariantName(useSri, vi, val)}
                  suggestions={existingVariants}
                  placeholder="Enter variant name..."
                />
              </div>

              {/* Local Variants — stacked vertically with internal scroll (1 LV visible) */}
              {vt.localVariants.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pt-1">
                    <Globe2 className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Local Variants</span>
                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold ml-auto">{vt.localVariants.length}</span>
                  </div>

                  {/* Scrollable container — ~1 LV visible, rest scroll with hidden bar */}
                  <div className="overflow-y-auto no-scrollbar space-y-2" style={{ maxHeight: "148px" }}>
                  {vt.localVariants.map((lv, lvi) => (
                    <div key={lv.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                      {/* LV Geography Header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-4 h-4 rounded bg-gray-100 text-gray-500 text-[8px] font-black flex items-center justify-center flex-shrink-0">
                            {lvi + 1}
                          </span>
                          <Globe2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-night truncate">{lv.geography}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLV(useSri, vi, lv.id)}
                          className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 ml-1"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* LV Fields */}
                      <div className="px-3 py-2.5 space-y-2.5">
                        {/* CUC Code */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">CUC / Composition Code</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={lv.cucCode}
                              onChange={(e) => updateLV(useSri, vi, lv.id, { cucCode: e.target.value })}
                              placeholder="e.g. CUC-DOVE-IN-001"
                              className={`w-full pl-2.5 pr-8 py-1.5 border rounded-lg text-[11px] font-medium focus:outline-none focus:ring-1 text-night placeholder:text-gray-400 placeholder:font-normal transition-all ${
                                lv.cucCode
                                  ? "border-green-400 bg-green-50/30 focus:border-green-500 focus:ring-green-400/20"
                                  : "border-gray-200 bg-white focus:border-sky focus:ring-sky/20"
                              }`}
                            />
                            {lv.cucCode && (
                              <Check className="absolute right-2 w-3 h-3 text-green-500 pointer-events-none" />
                            )}
                          </div>
                        </div>

                        {/* Formulation Document */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Formulation Document</label>
                          {lv.formulationDoc ? (
                            <div className="flex items-center gap-1.5 p-2 bg-blue-50/50 border border-blue-200 rounded-lg">
                              <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              <span className="text-[10px] font-medium text-blue-700 flex-1 truncate">{lv.formulationDoc}</span>
                              <button
                                type="button"
                                onClick={() => updateLV(useSri, vi, lv.id, { formulationDoc: null })}
                                className="text-blue-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const mockDoc = `Formulation_${lv.geography.replace(/\s+/g, "_")}_Spec_v1.pdf`;
                                  updateLV(useSri, vi, lv.id, { formulationDoc: mockDoc });
                                }}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-dashed border-gray-300 hover:border-sky/60 rounded-lg text-[9px] font-bold text-gray-500 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
                              >
                                <Upload className="w-2.5 h-2.5" />
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const mockDoc = `Library_Doc_${lv.geography.replace(/\s+/g, "_")}.pdf`;
                                  updateLV(useSri, vi, lv.id, { formulationDoc: mockDoc });
                                }}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-dashed border-gray-300 hover:border-sky/60 rounded-lg text-[9px] font-bold text-gray-500 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
                              >
                                <Link2 className="w-2.5 h-2.5" />
                                Library
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>{/* end scroll wrapper */}
                </div>
              )}

              {/* Add Local Variant Panel */}
              {vt.showAddLVPanel ? (
                <div className="border border-sky/30 rounded-xl bg-sky/5 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky uppercase tracking-wider">Select Geographies</span>
                    <button
                      type="button"
                      onClick={() => setShowAddLVPanel(useSri, vi, false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <MultiGeoSelector
                    selected={vt.pendingGeos}
                    onChange={(geos) => setPendingGeos(useSri, vi, geos)}
                    usedGeos={allUsedGeos}
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddLVPanel(useSri, vi, false)}
                      className="flex-1 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={vt.pendingGeos.length === 0}
                      onClick={() => confirmAddLocalVariants(useSri, vi)}
                      className="flex-1 py-1.5 bg-sky text-white rounded-lg text-[10px] font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Add {vt.pendingGeos.length > 0 ? `${vt.pendingGeos.length} ` : ""}LV{vt.pendingGeos.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                </div>
              ) : (
                availableForPending.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddLVPanel(useSri, vi, true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-200 hover:border-sky/50 rounded-xl text-[10px] font-bold text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add Local Variant
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}

      {/* Add Variant — as a column card at the end */}
      <button
        type="button"
        onClick={() => addVariant(useSri)}
        className="flex-shrink-0 w-[200px] self-stretch min-h-[180px] border-2 border-dashed border-gray-200 hover:border-sky/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Add Variant</span>
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.2s ease-out; }
      `}</style>
      <div className="fixed inset-0 top-[56px] z-45 flex flex-col bg-white overflow-hidden text-night">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="px-6 py-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Layers className="w-4 h-4 text-sky" />
              <div>
                <h2 className="text-night text-sm font-extrabold whitespace-nowrap">Create New Product</h2>
                <p className="text-[10px] text-gray-400 font-medium">Define sub-ranges, variants &amp; local variants</p>
              </div>
            </div>

            {/* Format selector */}
            <div ref={formatDropRef} className="relative flex items-center gap-2.5">
              <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider whitespace-nowrap">Format</span>
              <button type="button" onClick={() => setFormatDropOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all min-w-[200px] ${
                  selectedFormat ? "border-gray-300 bg-white text-night font-semibold" : "border-dashed border-gray-300 text-gray-400 font-medium hover:border-gray-400"
                }`}>
                <Layers className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate flex-1 text-left text-sm">{selectedFormat ? selectedFormat.name : "Select Format"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${formatDropOpen ? "rotate-180" : ""}`} />
              </button>
              {formatDropOpen && (
                <div className="absolute left-[80px] top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-72 max-h-52 overflow-y-auto py-1.5">
                  {FORMAT_OPTIONS.map((f) => (
                    <button key={f.id} type="button" onClick={() => { setSelectedFormatId(f.id); setFormatDropOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex flex-col gap-0.5 ${selectedFormatId === f.id ? "bg-sky/5 text-sky font-semibold" : "text-night font-medium"}`}>
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] text-gray-400">{f.brand} · {f.levelName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Group */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider whitespace-nowrap">Business Group</span>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${selectedFormat ? "bg-gray-50 border-gray-200 text-night" : "bg-white border-dashed border-gray-200 text-gray-300 italic"}`}>
                {selectedFormat ? selectedFormat.businessGroup : "—"}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider whitespace-nowrap">Category</span>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${selectedFormat ? "bg-gray-50 border-gray-200 text-night" : "bg-white border-dashed border-gray-200 text-gray-300 italic"}`}>
                {selectedFormat ? selectedFormat.category : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {onSwitchToSearch && (
                <button onClick={onSwitchToSearch} className="px-4 py-2 border border-gray-200 text-xs text-gray-500 hover:text-night hover:bg-gray-50 rounded-xl transition-all font-bold bg-white cursor-pointer">
                  Search Library
                </button>
              )}
              <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-night transition-colors border border-gray-200 bg-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body: 70% workspace | 30% hierarchy ───────────────────────── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50/30">
          {/* Left: Creation Workspace (70%) */}
          <div className="flex flex-col overflow-hidden border-r border-gray-200" style={{ width: "70%" }}>
            {!selectedFormat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 p-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-gray-300" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-night">Select a Format to begin</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">Choose a format from the dropdown above to start creating subranges, variants, and local variants.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

                {/* Add Subrange Toggle */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 w-fit shadow-sm">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Subrange?</span>
                  <div className="flex items-center gap-4 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-night font-bold select-none">
                      <input type="radio" name="addSubrangeRadio" checked={addSubrangeOpted}
                        onChange={() => setAddSubrangeOpted(true)}
                        className="accent-sky cursor-pointer" />
                      Yes
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-night font-bold select-none">
                      <input type="radio" name="addSubrangeRadio" checked={!addSubrangeOpted}
                        onChange={() => setAddSubrangeOpted(false)}
                        className="accent-sky cursor-pointer" />
                      No
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Subranges or direct variants */}
                {addSubrangeOpted ? (
                  <div className="space-y-6">
                    {subranges.map((sr, sri) => (
                      <div key={sr.id} className="animate-fadeInUp">
                        {/* Subrange Container */}
                        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                          {/* Subrange Header */}
                          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                            <span className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                              SR{sri + 1}
                            </span>
                            <div className="flex-1">
                              <AutocompleteInput
                                value={sr.name}
                                onChange={(val) => updateSubrangeName(sri, val)}
                                suggestions={existingSubranges}
                                placeholder="Enter sub range name..."
                                className="flex-1"
                              />
                            </div>
                            {subranges.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSubrange(sri)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors border border-gray-200 bg-white cursor-pointer flex-shrink-0"
                                title="Remove Subrange"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Subrange Body: Variants */}
                          <div className="p-5">
                            {renderVariantsSection(sri, sr.variants, sri)}
                          </div>
                        </div>

                        {sri < subranges.length - 1 && <div className="border-t border-gray-100 mt-6" />}
                      </div>
                    ))}

                    {/* + Add Subrange */}
                    <button
                      type="button"
                      onClick={addSubrange}
                      className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-sky/50 rounded-xl text-sm font-bold text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subrange
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Variants for {formatName}</p>
                    {renderVariantsSection(0, subranges[0]?.variants ?? [], 0)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Hierarchy Preview (30%) */}
          <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-extrabold text-night uppercase tracking-wider">Hierarchy Preview</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col px-4 py-3 bg-white">
              <HierarchyView
                formatName={formatName}
                addSubrangeOpted={addSubrangeOpted}
                subranges={subranges}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 ml-auto">
            <button type="button" onClick={onNavigateToSKU}
              className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-xl text-sm font-bold transition-all cursor-pointer">
              <Tag className="w-3.5 h-3.5" />
              Create SKU
            </button>
            <button type="button" onClick={handleCreateProduct} disabled={!selectedFormat}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 active:scale-95 cursor-pointer">
              <Check className="w-3.5 h-3.5 text-white" />
              Create Product
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-night font-bold text-sm">Discard changes?</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              You have unsaved product details. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:text-night hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white"
              >
                No, Keep Editing
              </button>
              <button
                onClick={resetAndClose}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}