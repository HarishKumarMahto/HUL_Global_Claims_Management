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
  Search,
  Trash2,
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
  collapsed: boolean;
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
});

const makeDefaultVariant = (): VariantEntry => ({
  id: newId(), name: "", localVariants: [], showAddLVPanel: false, pendingGeos: [],
});

const makeDefaultSubrange = (): SubrangeEntry => ({
  id: newId(),
  name: "",
  variants: [],
  collapsed: false,
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
        <Search className="absolute left-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
        <input type="text" value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky/20 text-night placeholder:text-gray-400 placeholder:font-normal transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-36 overflow-y-auto py-1">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-night font-medium truncate cursor-pointer">
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
  selected, onChange, usedGeos,
}: { selected: string[]; onChange: (geos: string[]) => void; usedGeos: string[]; }) {
  const [query, setQuery] = useState("");
  const available = ALL_GEOGRAPHIES.filter(
    (g) => !usedGeos.includes(g) && g.toLowerCase().includes(query.toLowerCase())
  );
  const toggle = (geo: string) => {
    if (selected.includes(geo)) onChange(selected.filter((g) => g !== geo));
    else onChange([...selected, geo]);
  };
  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search geographies..."
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky/20 text-night placeholder:text-gray-400"
        />
      </div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((g) => (
            <span key={g} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-sky/10 text-sky rounded-full border border-sky/20">
              {g}
              <button type="button" onClick={() => toggle(g)} className="hover:text-red-500 transition-colors cursor-pointer">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Options grid */}
      <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto no-scrollbar">
        {available.length === 0 ? (
          <div className="col-span-2 text-[10px] text-gray-400 italic text-center py-2">No geographies available</div>
        ) : (
          available.map((g) => (
            <button key={g} type="button" onClick={() => toggle(g)}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-lg border transition-all cursor-pointer text-left ${
                selected.includes(g)
                  ? "bg-sky/10 border-sky/30 text-sky font-semibold"
                  : "bg-white border-gray-200 text-night hover:bg-gray-50 font-medium"
              }`}>
              <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                selected.includes(g) ? "bg-sky border-sky" : "border-gray-300"
              }`}>
                {selected.includes(g) && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
              </div>
              {g}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Hierarchy Tree View ──────────────────────────────────────────────────────
function HierarchyView({ formatName, subranges }: { formatName: string; subranges: SubrangeEntry[] }) {
  const hasContent = formatName && subranges.some(
    (sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0)
  );

  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-6 text-gray-400 px-3">
        <Layers className="w-7 h-7 text-gray-300" />
        <p className="text-[10px] leading-relaxed text-gray-400">Hierarchy preview appears here as you fill in details</p>
      </div>
    );
  }

  const renderLVs = (localVariants: LocalVariantRow[]) => (
    <div className="ml-5 pl-2.5 border-l border-gray-100 space-y-0.5 mt-0.5">
      {localVariants.map((lv) => (
        <div key={lv.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-emerald-50/50 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <Globe2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] font-medium text-night truncate flex-1">{lv.geography}</span>
          {lv.cucCode && (
            <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-100 flex-shrink-0">{lv.cucCode}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar text-[11px] space-y-1 py-1">
      {formatName && (
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <Layers className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-night font-bold truncate text-[11px]">{formatName}</span>
          </div>
          <span className="text-[9px] bg-sky/10 text-sky px-1.5 py-0.5 rounded font-bold ml-1 flex-shrink-0">Bulk</span>
        </div>
      )}
      <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-1">
        {subranges.map((sr) => {
          if (!sr.name && !sr.variants.some((v) => v.name || v.localVariants.length > 0)) return null;
          return (
            <div key={sr.id}>
              {sr.name && (
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Blocks className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-night truncate">{sr.name}</span>
                  </div>
                  <span className="text-[9px] bg-violet-50 text-violet-600 px-1 py-0.5 rounded font-bold ml-1 flex-shrink-0">SR</span>
                </div>
              )}
              <div className="ml-4 pl-3 border-l-2 border-gray-100 space-y-0.5 mt-0.5">
                {sr.variants.map((vt) => {
                  if (!vt.name && vt.localVariants.length === 0) return null;
                  return (
                    <div key={vt.id}>
                          <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-gray-50">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Beaker className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-night truncate">{vt.name || "Variant"}</span>
                        </div>
                      </div>
                      {vt.localVariants.length > 0 && (
                        <div className="ml-4 pl-3 border-l-2 border-gray-100 space-y-0.5 mt-0.5">
                          {vt.localVariants.map((lv) => (
                            <div key={lv.id} className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50">
                              <Globe2 className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                              <span className="text-night truncate">{lv.geography}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CreateProductModal({
  isOpen, onClose, onCreate, preselectedType, project, onSwitchToSearch, onNavigateToSKU,
}: CreateProductModalProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>("");
  const [formatDropOpen, setFormatDropOpen] = useState(false);
  const formatDropRef = useRef<HTMLDivElement>(null);
  const selectedFormat = FORMAT_OPTIONS.find((f) => f.id === selectedFormatId) ?? null;
  const [addSubrangeOpted, setAddSubrangeOpted] = useState(true);
  const [subranges, setSubranges] = useState<SubrangeEntry[]>([makeDefaultSubrange()]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (formatDropRef.current && !formatDropRef.current.contains(e.target as Node)) setFormatDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Subrange ops ──────────────────────────────────────────────────────────
  const addSubrange = useCallback(() => setSubranges((p) => [...p, makeDefaultSubrange()]), []);
  const removeSubrange = useCallback((sri: number) => {
    setSubranges((p) => (p.length > 1 ? p.filter((_, i) => i !== sri) : p));
  }, []);
  const toggleSubrangeCollapsed = useCallback((sri: number) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : { ...sr, collapsed: !sr.collapsed }));
  }, []);
  const updateSubrangeName = useCallback((sri: number, val: string) => {
    setSubranges((p) => p.map((sr, i) => (i === sri ? { ...sr, name: val } : sr)));
  }, []);

  // ── Variant ops ──────────────────────────────────────────────────────────
  const addVariant = useCallback((sri: number) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : { ...sr, variants: [...sr.variants, makeDefaultVariant()] }));
  }, []);
  const removeVariant = useCallback((sri: number, vi: number) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : { ...sr, variants: sr.variants.filter((_, j) => j !== vi) }));
  }, []);
  const updateVariantName = useCallback((sri: number, vi: number, name: string) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => j !== vi ? v : { ...v, name }),
    }));
  }, []);
  const setShowAddLVPanel = useCallback((sri: number, vi: number, show: boolean) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => j !== vi ? v : { ...v, showAddLVPanel: show, pendingGeos: show ? v.pendingGeos : [] }),
    }));
  }, []);
  const setPendingGeos = useCallback((sri: number, vi: number, geos: string[]) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => j !== vi ? v : { ...v, pendingGeos: geos }),
    }));
  }, []);
  const confirmAddLocalVariants = useCallback((sri: number, vi: number) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => {
        if (j !== vi) return v;
        const existing = v.localVariants.map((lv) => lv.geography);
        const newLVs = v.pendingGeos.filter((g) => !existing.includes(g)).map((g) => makeDefaultLV(g));
        return { ...v, localVariants: [...v.localVariants, ...newLVs], pendingGeos: [], showAddLVPanel: false };
      }),
    }));
  }, []);

  // ── Local Variant ops ────────────────────────────────────────────────────
  const updateLVCuc = useCallback((sri: number, vi: number, lvId: string, cucCode: string) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => j !== vi ? v : {
        ...v, localVariants: v.localVariants.map((lv) => lv.id === lvId ? { ...lv, cucCode } : lv),
      }),
    }));
  }, []);
  const removeLV = useCallback((sri: number, vi: number, lvId: string) => {
    setSubranges((p) => p.map((sr, i) => i !== sri ? sr : {
      ...sr, variants: sr.variants.map((v, j) => j !== vi ? v : {
        ...v, localVariants: v.localVariants.filter((lv) => lv.id !== lvId),
      }),
    }));
  }, []);

  // ── Cancel Confirmation ──────────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const handleClose = () => {
    const hasData = selectedFormatId || subranges.some((sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0));
    if (hasData) setShowCancelConfirm(true); else resetAndClose();
  };
  const resetAndClose = () => {
    setSelectedFormatId("");
    setSubranges([makeDefaultSubrange()]);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleNavigateToSKU = () => {
    if (!onNavigateToSKU) return;
    resetAndClose();
    onNavigateToSKU();
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
        const vId = `prod-var-${Date.now()}-${vi}`;
        const vName = getCompoundName(parentName, v.name.trim());
        listToCreate.push({
          id: vId, name: vName, levelName: v.name.trim(), type: "Variant",
          parentId, parentName,
          geographies: v.localVariants.map((lv) => lv.geography),
          category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
          brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
        });
        v.localVariants.forEach((lv, lvi) => {
          listToCreate.push({
            id: `prod-lv-${Date.now()}-${vi}-${lvi}`,
            name: getCompoundName(vName, lv.geography.substring(0, 2).toUpperCase()),
            levelName: lv.geography.substring(0, 2).toUpperCase(), type: "Local Variant",
            parentId: vId, parentName: vName, geographies: [lv.geography], cucSpecNumber: lv.cucCode,
            category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
            brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
          });
        });
      });
    };

    if (addSubrangeOpted) {
      subranges.forEach((sr, sri) => {
        if (!sr.name.trim()) return;
        const srId = `prod-sub-${Date.now()}-${sri}`;
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

  // ── Render variants row (horizontal scroll of variant cards) ──────────────
  const renderVariantsRow = (sri: number, variants: VariantEntry[], existingVars: string[]) => (
    <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
      {variants.map((vt, vi) => {
        const usedGeos = vt.localVariants.map((lv) => lv.geography);
        return (
          <div key={vt.id}
            className="flex-shrink-0 w-[230px] border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden animate-fadeIn">
            {/* Variant header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
              <AutocompleteInput
                value={vt.name}
                onChange={(val) => updateVariantName(sri, vi, val)}
                suggestions={existingVars}
                placeholder="Variant name..."
                className="flex-1"
              />
              <button type="button" onClick={() => removeVariant(sri, vi)}
                className="p-1 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {/* LV list */}
            <div className="flex-1 px-3 py-2 space-y-1.5">
              {vt.localVariants.map((lv, lvi) => (
                <div key={lv.id} className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                  <span className="text-[11px] font-semibold text-night truncate">{lv.geography}</span>
                  <button type="button" onClick={() => removeLV(sri, vi, lv.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add LV panel */}
              {vt.showAddLVPanel ? (
                <div className="border border-sky/20 rounded-lg bg-sky/5 p-2.5 space-y-2 animate-fadeIn">
                  <MultiGeoSelector
                    selected={vt.pendingGeos}
                    onChange={(geos) => setPendingGeos(sri, vi, geos)}
                    usedGeos={usedGeos}
                  />
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setShowAddLVPanel(sri, vi, false)}
                      className="flex-1 py-1 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer bg-white">
                      Cancel
                    </button>
                    <button type="button"
                      disabled={vt.pendingGeos.length === 0}
                      onClick={() => confirmAddLocalVariants(sri, vi)}
                      className="flex-1 py-1 bg-sky text-white rounded-lg text-[10px] font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                      Add {vt.pendingGeos.length > 0 ? vt.pendingGeos.length : ""} LV{vt.pendingGeos.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                </div>
              ) : (
                usedGeos.length < ALL_GEOGRAPHIES.length && (
                  <button type="button" onClick={() => setShowAddLVPanel(sri, vi, true)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer">
                    <Plus className="w-2.5 h-2.5" />
                    Add Local Variant
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
      {/* Add Variant card */}
      <button type="button" onClick={() => addVariant(sri)}
        className="flex-shrink-0 w-[160px] h-[70px] border-2 border-dashed border-gray-200 hover:border-sky/40 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer">
        <Plus className="w-4 h-4" />
        <span className="text-[10px] font-bold tracking-wider"> Add Variant</span>
      </button>
    </div>
  );

  // ─── Level breadcrumb strip ─────────────────────────────────────────────
  const LEVELS = [
    { label: "Format",        bg: "bg-night/10",       text: "text-night",      dot: "bg-night"        },
    { label: "Subrange",      bg: "bg-violet-100",     text: "text-violet-700", dot: "bg-violet-500"   },
    { label: "Variant",       bg: "bg-sky/10",         text: "text-sky",        dot: "bg-sky"          },
    { label: "Local Variant", bg: "bg-emerald-100",    text: "text-emerald-700",dot: "bg-emerald-500"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        .cpmodal * { font-family: 'DM Sans', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeInUp 0.15s ease-out; }
      `}</style>

      <div className="fixed inset-0 top-[56px] z-45 flex flex-col bg-white overflow-hidden text-night">

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Layers className="w-4 h-4 text-sky" />
            <div>
              <h2 className="text-night text-sm font-extrabold">Create New Product</h2>
              {/* <p className="text-[10px] text-gray-400 font-medium">Define sub-ranges, variants &amp; local variants</p> */}
            </div>
          </div>

          {/* Format selector */}
          <div ref={formatDropRef} className="relative flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider whitespace-nowrap">Format</span>
            <button type="button" onClick={() => setFormatDropOpen((o) => !o)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all min-w-[180px] ${
                selectedFormat ? "border-gray-300 bg-white text-night font-semibold" : "border-dashed border-gray-300 text-gray-400 font-medium hover:border-gray-400"
              }`}>
              <Layers className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="truncate flex-1 text-left text-xs">{selectedFormat ? selectedFormat.name : "Select Format"}</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${formatDropOpen ? "rotate-180" : ""}`} />
            </button>
            {formatDropOpen && (
              <div className="absolute left-[72px] top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 max-h-48 overflow-y-auto py-1">
                {FORMAT_OPTIONS.map((f) => (
                  <button key={f.id} type="button" onClick={() => { setSelectedFormatId(f.id); setFormatDropOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex flex-col gap-0.5 ${selectedFormatId === f.id ? "bg-sky/5 text-sky font-semibold" : "text-night font-medium"}`}>
                    <span className="truncate text-xs">{f.name}</span>
                    <span className="text-[10px] text-gray-400">{f.brand} · {f.levelName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedFormat && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Brand</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{selectedFormat.brand}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BG</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{selectedFormat.businessGroup}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cat</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{selectedFormat.category}</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {onSwitchToSearch && (
              <button onClick={onSwitchToSearch} className="px-3 py-1.5 border border-gray-200 text-xs text-gray-500 hover:text-night hover:bg-gray-50 rounded-lg transition-all font-bold bg-white cursor-pointer">
                Search Library
              </button>
            )}
            <button onClick={handleClose} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-night transition-colors border border-gray-200 bg-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Level indicator breadcrumb */}
          <div className="px-6 pb-3 flex items-center gap-1">
            {LEVELS.map((lvl, i) => (
              <div key={lvl.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${lvl.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${lvl.dot} flex-shrink-0`} />
                  <span className={`text-[10px] font-bold ${lvl.text} whitespace-nowrap`}>{lvl.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50/30">

          {/* Left workspace: 70% */}
          <div className="flex flex-col overflow-hidden border-r border-gray-200" style={{ width: "70%" }}>
            {!selectedFormat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Layers className="w-7 h-7 text-gray-300" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-night">Select a Format to begin</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">Choose a format from the dropdown above.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">

                {/* Add Subrange toggle */}
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-2xl bg-white">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">Add Subrange?</span>
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-2xl bg-gray-50">
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] text-night font-semibold leading-none select-none">
                      <input type="radio" name="addSubrangeRadio" checked={addSubrangeOpted}
                        onChange={() => setAddSubrangeOpted(true)}
                        className="accent-sky cursor-pointer" />
                      Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] text-night font-semibold select-none">
                      <input type="radio" name="addSubrangeRadio" checked={!addSubrangeOpted}
                        onChange={() => setAddSubrangeOpted(false)}
                        className="accent-sky cursor-pointer" />
                      No
                    </label>
                  </div>
                </div>

                {addSubrangeOpted ? (
                  <>
                {/* Subranges */}
                {subranges.map((sr, sri) => (
                  <div key={sr.id} className="animate-fadeIn border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">

                    {/* SR header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <button type="button" onClick={() => toggleSubrangeCollapsed(sri)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-all">
                        <ChevronDown className={`w-3 h-3 transition-transform ${sr.collapsed ? "-rotate-90" : "rotate-0"}`} />
                        {/* {sr.collapsed ? "Expand" : "Collapse"} */}
                      </button>
                      <AutocompleteInput
                        value={sr.name}
                        onChange={(val) => updateSubrangeName(sri, val)}
                        suggestions={existingSubranges}
                        placeholder="Sub range name..."
                        className="flex-1"
                      />
                      {subranges.length > 1 && (
                        <button type="button" onClick={() => removeSubrange(sri)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {!sr.collapsed && (
                      <div className="p-4">
                        {renderVariantsRow(sri, sr.variants, existingVariants)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Subrange */}
                <button type="button" onClick={addSubrange}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add Subrange
                </button>
                  </>
                ) : (
                  /* No subrange — variants directly */
                  <div className="animate-fadeIn border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500">Variants for <span className="text-night">{formatName}</span></p>
                    </div>
                    <div className="p-4">
                      {renderVariantsRow(0, subranges[0]?.variants ?? [], existingVariants)}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right: Hierarchy (30%) */}
          <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-extrabold text-night uppercase tracking-wider">Hierarchy Preview</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col px-3 py-2 bg-white">
              <HierarchyView formatName={formatName} subranges={subranges} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
          <button type="button" onClick={handleClose}
            className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Cancel
          </button>
          {onNavigateToSKU && (
            <button type="button" onClick={handleNavigateToSKU}
              className="px-4 py-2 bg-white text-sky border border-sky rounded-xl text-xs font-bold hover:bg-sky/5 transition-all cursor-pointer">
              Create SKU
            </button>
          )}
          <button type="button" onClick={handleCreateProduct} disabled={!selectedFormat}
            className="flex items-center gap-1.5 px-5 py-2 bg-sky text-white rounded-xl text-xs font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 cursor-pointer">
            <Check className="w-3.5 h-3.5" />
            Create Product
          </button>
        </div>
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-night font-bold text-sm">Discard changes?</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">You have unsaved product details. Are you sure you want to close without saving?</p>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white">
                Keep Editing
              </button>
              <button onClick={resetAndClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}