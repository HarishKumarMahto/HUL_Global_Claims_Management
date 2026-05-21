import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  Minus,
  Check,
  Globe2,
  AlertTriangle,
  Layers,
  Blocks,
  Beaker,
  Tag,
  Search,
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

type LocalVariantRow = { name: string; geography: string };
type VariantEntry    = { id: string; name: string; localVariants: LocalVariantRow[] };
type SubrangeEntry   = { id: string; name: string; variants: VariantEntry[] };

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_GEOGRAPHIES = [
  "Global","EMEA","North America","LATAM","APAC",
  "South Asia","United Kingdom","Germany","France",
  "United States","Brazil","India","China","Japan","Australia",
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
const makeDefaultLV      = (): LocalVariantRow  => ({ name: "", geography: "" });
const makeDefaultVariant = (): VariantEntry     => ({ id: newId(), name: "", localVariants: [makeDefaultLV()] });
const makeDefaultSubrange = (): SubrangeEntry   => ({ id: newId(), name: "", variants: [makeDefaultVariant()] });

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
        <Search className="absolute left-2.5 w-3 h-3 text-slate-700 pointer-events-none" />
        <input type="text" value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-7 pr-3 py-0.5 text-xs border border-slate-700 rounded focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky bg-white text-slate-950 font-semibold placeholder:text-slate-650 transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-700 rounded shadow-lg max-h-36 overflow-y-auto">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors text-slate-950 font-bold truncate">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GeoCombobox ──────────────────────────────────────────────────────────────
function GeoCombobox({ value, onChange, usedGeos }: { value: string; onChange: (v: string) => void; usedGeos: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const available = ALL_GEOGRAPHIES.filter((g) => (!usedGeos.includes(g) || g === value) && g.toLowerCase().includes(query.toLowerCase()));
  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <Globe2 className="absolute left-2.5 w-3 h-3 text-slate-700 pointer-events-none" />
        <input type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} placeholder="Select or type geography..."
          className="w-full pl-7 pr-6 py-0.5 text-xs border border-slate-700 rounded focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky bg-white text-slate-955 font-semibold placeholder:text-slate-650 transition-all"
        />
        <button type="button" tabIndex={-1} onClick={() => setOpen((o) => !o)} className="absolute right-1">
          <ChevronDown className={`w-3 h-3 text-slate-700 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-700 rounded shadow-lg max-h-36 overflow-y-auto">
          {available.length === 0 ? (
            query.trim() ? (
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(query.trim()); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-sky hover:bg-slate-100 transition-colors font-bold">
                Use "{query.trim()}"
              </button>
            ) : (
              <div className="px-3 py-1.5 text-xs text-slate-950 italic font-bold">No results found</div>
            )
          ) : (
            available.map((g) => (
              <button key={g} type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(g); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors text-slate-955 font-bold truncate">
                {g}
              </button>
            ))
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
      ? subranges[0]?.variants.some((v) => v.name || v.localVariants.some((lv) => lv.name || lv.geography))
      : subranges.some(sr => sr.name || sr.variants.some((v) => v.name || v.localVariants.some((lv) => lv.name || lv.geography)))
  );

  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8 text-slate-700 px-3">
        <Layers className="w-10 h-10 text-slate-800" />
        <p className="text-xs leading-relaxed font-bold">Hierarchy preview will appear here as you fill in subranges, variants and local variants</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto text-xs space-y-1.5 py-1">
      {formatName && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-slate-100 border border-slate-750 text-slate-955 font-bold">
          <Layers className="w-3.5 h-3.5 flex-shrink-0 text-slate-800" />
          <span className="truncate flex-1">{formatName}</span>
          <span className="text-[9px] bg-slate-200 text-slate-955 px-1.5 py-0.5 rounded font-extrabold uppercase">Bulk Product</span>
        </div>
      )}

      {addSubrangeOpted ? (
        <div className="ml-3 space-y-2">
          {subranges.map((sr, sri) => {
            const srKey = `sr-${sri}`;
            const srExp = expanded[srKey] !== false;
            const hasSrContent = sr.name || sr.variants.some((v) => v.name || v.localVariants.some((lv) => lv.name || lv.geography));
            if (!hasSrContent) return null;

            return (
              <div key={sr.id} className="space-y-1">
                <button type="button" onClick={() => toggle(srKey)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-200 transition-colors text-left font-bold text-slate-955">
                  <ChevronRight className={`w-3 h-3 text-slate-800 transition-transform flex-shrink-0 ${srExp ? "rotate-90" : ""}`} />
                  <Blocks className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span className="font-extrabold truncate flex-1">{sr.name || <span className="text-slate-650 italic">Sub Range {sri + 1}</span>}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-955 px-1.5 py-0.5 rounded font-extrabold uppercase">Subrange</span>
                </button>

                {srExp && (
                  <div className="ml-4 space-y-1 border-l border-slate-750 pl-2">
                    {sr.variants.map((vt, vi) => {
                      const vtKey = `sr-${sri}-vt-${vi}`;
                      const vtExp = expanded[vtKey] !== false;
                      if (!vt.name && vt.localVariants.every((lv) => !lv.name && !lv.geography)) return null;

                      return (
                        <div key={vt.id} className="mt-1">
                          <button type="button" onClick={() => toggle(vtKey)} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors text-left font-bold text-slate-955">
                            <ChevronRight className={`w-3 h-3 text-slate-800 transition-transform flex-shrink-0 ${vtExp ? "rotate-90" : ""}`} />
                            <Beaker className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                            <span className="text-slate-955 truncate flex-1 font-bold">{vt.name || <span className="text-slate-650 italic">Variant {vi + 1}</span>}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-955 px-1.5 py-0.5 rounded font-extrabold uppercase">Var</span>
                          </button>

                          {vtExp && (
                            <div className="ml-4 space-y-1">
                              {vt.localVariants.map((lv, li) => {
                                if (!lv.name && !lv.geography) return null;
                                return (
                                  <div key={li} className="ml-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-955">
                                    <Globe2 className="w-3.5 h-3.5 text-slate-800 flex-shrink-0" />
                                    <span className="truncate flex-1 text-[11px] font-semibold">
                                      {lv.name || "Unnamed"} {lv.geography ? `(${lv.geography})` : ""}
                                    </span>
                                    <span className="text-[9px] bg-slate-200 text-slate-955 px-1 py-0.5 rounded font-extrabold uppercase">LV</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ml-3 space-y-1">
          {subranges[0]?.variants.map((vt, vi) => {
            const vtKey = `vt-${vi}`;
            const vtExp = expanded[vtKey] !== false;
            if (!vt.name && vt.localVariants.every((lv) => !lv.name && !lv.geography)) return null;

            return (
              <div key={vt.id} className="mt-1">
                <button type="button" onClick={() => toggle(vtKey)} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors text-left font-bold text-slate-955">
                  <ChevronRight className={`w-3 h-3 text-slate-800 transition-transform flex-shrink-0 ${vtExp ? "rotate-90" : ""}`} />
                  <Beaker className="w-3 h-3 text-slate-900 flex-shrink-0" />
                  <span className="text-slate-955 truncate flex-1 font-bold">{vt.name || <span className="text-slate-650 italic">Variant {vi + 1}</span>}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-955 px-1.5 py-0.5 rounded font-extrabold uppercase">Var</span>
                </button>

                {vtExp && (
                  <div className="ml-4 space-y-1">
                    {vt.localVariants.map((lv, li) => {
                      if (!lv.name && !lv.geography) return null;
                      return (
                        <div key={li} className="ml-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 text-slate-955">
                          <Globe2 className="w-3.5 h-3.5 text-slate-800 flex-shrink-0" />
                          <span className="truncate flex-1 text-[11px] font-semibold">
                            {lv.name || "Unnamed"} {lv.geography ? `(${lv.geography})` : ""}
                          </span>
                          <span className="text-[9px] bg-slate-200 text-slate-955 px-1 py-0.5 rounded font-extrabold uppercase">LV</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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

  const addSubrange = useCallback(() => {
    setSubranges((prev) => [...prev, makeDefaultSubrange()]);
  }, []);

  const removeSubrange = useCallback((sri: number) => {
    setSubranges((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== sri) : prev));
  }, []);

  const updateSubrangeName = useCallback((sri: number, val: string) => {
    setSubranges((prev) => prev.map((sr, i) => (i === sri ? { ...sr, name: val } : sr)));
  }, []);

  const updateVariant = useCallback((sri: number, vi: number, patch: Partial<VariantEntry>) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => (j === vi ? { ...v, ...patch } : v)),
      };
    }));
  }, []);

  const removeVariant = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      const next = sr.variants.filter((_, j) => j !== vi);
      return {
        ...sr,
        variants: next.length > 0 ? next : [makeDefaultVariant()],
      };
    }));
  }, []);

  const addVariant = useCallback((sri: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: [...sr.variants, makeDefaultVariant()],
      };
    }));
  }, []);

  const updateLV = useCallback((sri: number, vi: number, lvi: number, patch: Partial<LocalVariantRow>) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          return {
            ...v,
            localVariants: v.localVariants.map((lv, k) => (k === lvi ? { ...lv, ...patch } : lv)),
          };
        }),
      };
    }));
  }, []);

  const removeLV = useCallback((sri: number, vi: number, lvi: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          const next = v.localVariants.filter((_, k) => k !== lvi);
          return {
            ...v,
            localVariants: next.length > 0 ? next : [makeDefaultLV()],
          };
        }),
      };
    }));
  }, []);

  const addLV = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => {
      if (i !== sri) return sr;
      return {
        ...sr,
        variants: sr.variants.map((v, j) => {
          if (j !== vi) return v;
          return {
            ...v,
            localVariants: [...v.localVariants, makeDefaultLV()],
          };
        }),
      };
    }));
  }, []);

  // ── Cancel Confirmation ──────────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const handleClose = () => {
    const hasData = selectedFormatId || subranges.some((sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.some((lv) => lv.name || lv.geography)));
    if (hasData) { setShowCancelConfirm(true); } else { resetAndClose(); }
  };
  const resetAndClose = () => {
    setSelectedFormatId("");
    setSubranges([makeDefaultSubrange()]);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleCreateProduct = () => {
    if (!selectedFormat) return;

    const listToCreate: any[] = [];
    const nowStr = new Date().toISOString().split("T")[0];

    const getCompoundName = (...parts: string[]) => parts.filter(Boolean).join(" ");

    if (addSubrangeOpted) {
      subranges.forEach((sr, sri) => {
        if (!sr.name.trim()) return;
        const srId = `prod-sub-${Date.now()}-${sri}-${Math.floor(Math.random() * 1000)}`;
        const srName = getCompoundName(selectedFormat.name, sr.name.trim());

        listToCreate.push({
          id: srId,
          name: srName,
          levelName: sr.name.trim(),
          type: "Subrange",
          parentId: selectedFormat.id,
          parentName: selectedFormat.name,
          geographies: [],
          category: selectedFormat.category,
          businessGroup: selectedFormat.businessGroup,
          brand: selectedFormat.brand,
          createdBy: "Sarah Johnson",
          createdDate: nowStr,
          isFavorite: false,
        });

        sr.variants.forEach((v, vi) => {
          if (!v.name.trim()) return;
          const vId = `prod-var-${Date.now()}-${sri}-${vi}-${Math.floor(Math.random() * 1000)}`;
          const vName = getCompoundName(srName, v.name.trim());

          listToCreate.push({
            id: vId,
            name: vName,
            levelName: v.name.trim(),
            type: "Variant",
            parentId: srId,
            parentName: srName,
            geographies: v.localVariants.map(lv => lv.geography.trim()).filter(Boolean),
            category: selectedFormat.category,
            businessGroup: selectedFormat.businessGroup,
            brand: selectedFormat.brand,
            createdBy: "Sarah Johnson",
            createdDate: nowStr,
            isFavorite: false,
          });

          v.localVariants.forEach((lv, lvi) => {
            if (!lv.name.trim() && !lv.geography.trim()) return;
            const lvId = `prod-lv-${Date.now()}-${sri}-${vi}-${lvi}-${Math.floor(Math.random() * 1000)}`;
            const lvGeo = lv.geography.trim();
            const geoSuffix = lvGeo ? lvGeo.substring(0, 2).toUpperCase() : "";
            const lvName = getCompoundName(vName, lv.name.trim() || geoSuffix);

            listToCreate.push({
              id: lvId,
              name: lvName,
              levelName: lv.name.trim() || geoSuffix,
              type: "Local Variant",
              parentId: vId,
              parentName: vName,
              geographies: lvGeo ? [lvGeo] : [],
              category: selectedFormat.category,
              businessGroup: selectedFormat.businessGroup,
              brand: selectedFormat.brand,
              createdBy: "Sarah Johnson",
              createdDate: nowStr,
              isFavorite: false,
            });
          });
        });
      });
    } else {
      const firstSub = subranges[0];
      if (firstSub) {
        firstSub.variants.forEach((v, vi) => {
          if (!v.name.trim()) return;
          const vId = `prod-var-${Date.now()}-0-${vi}-${Math.floor(Math.random() * 1000)}`;
          const vName = getCompoundName(selectedFormat.name, v.name.trim());

          listToCreate.push({
            id: vId,
            name: vName,
            levelName: v.name.trim(),
            type: "Variant",
            parentId: selectedFormat.id,
            parentName: selectedFormat.name,
            geographies: v.localVariants.map(lv => lv.geography.trim()).filter(Boolean),
            category: selectedFormat.category,
            businessGroup: selectedFormat.businessGroup,
            brand: selectedFormat.brand,
            createdBy: "Sarah Johnson",
            createdDate: nowStr,
            isFavorite: false,
          });

          v.localVariants.forEach((lv, lvi) => {
            if (!lv.name.trim() && !lv.geography.trim()) return;
            const lvId = `prod-lv-${Date.now()}-0-${vi}-${lvi}-${Math.floor(Math.random() * 1000)}`;
            const lvGeo = lv.geography.trim();
            const geoSuffix = lvGeo ? lvGeo.substring(0, 2).toUpperCase() : "";
            const lvName = getCompoundName(vName, lv.name.trim() || geoSuffix);

            listToCreate.push({
              id: lvId,
              name: lvName,
              levelName: lv.name.trim() || geoSuffix,
              type: "Local Variant",
              parentId: vId,
              parentName: vName,
              geographies: lvGeo ? [lvGeo] : [],
              category: selectedFormat.category,
              businessGroup: selectedFormat.businessGroup,
              brand: selectedFormat.brand,
              createdBy: "Sarah Johnson",
              createdDate: nowStr,
              isFavorite: false,
            });
          });
        });
      }
    }

    if (listToCreate.length > 0) {
      onCreate(listToCreate);
    }
    resetAndClose();
  };

  if (!isOpen) return null;

  const formatName = selectedFormat?.name ?? "";
  const existingSubranges = selectedFormatId ? getExistingSubranges(selectedFormatId) : [];
  const existingVariants = selectedFormatId ? getExistingVariants(selectedFormatId) : [];

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <div className="fixed inset-0 top-[56px] z-45 flex flex-col bg-white overflow-hidden text-slate-950">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-slate-700 bg-white">
          <div className="px-4 py-2.5 flex items-center gap-6">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Layers className="w-4 h-4 text-slate-950" />
              <h2 className="text-slate-950 text-xs font-extrabold whitespace-nowrap uppercase tracking-wider">Create New Product</h2>
            </div>

            {/* Bulk Product selector */}
            <div ref={formatDropRef} className="relative flex items-center gap-2">
              <span className="text-[10px] text-slate-950 font-extrabold uppercase tracking-wider whitespace-nowrap min-w-[80px] text-left">Bulk Product</span>
              <button type="button" onClick={() => setFormatDropOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-all min-w-[180px] ${
                  selectedFormat ? "border-slate-700 bg-white text-slate-955 font-bold" : "border-dashed border-slate-700 text-slate-900 font-bold hover:border-slate-900"
                }`}>
                <Layers className="w-3.5 h-3.5 text-slate-800 flex-shrink-0" />
                <span className="truncate flex-1 text-left">{selectedFormat ? selectedFormat.name : "Select Bulk Product"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-800 flex-shrink-0 transition-transform ${formatDropOpen ? "rotate-180" : ""}`} />
              </button>
              {formatDropOpen && (
                <div className="absolute left-[88px] top-full mt-1 bg-white border border-slate-700 rounded-md shadow-lg z-50 w-72 max-h-52 overflow-y-auto py-1">
                  {FORMAT_OPTIONS.map((f) => (
                    <button key={f.id} type="button" onClick={() => { setSelectedFormatId(f.id); setFormatDropOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-100 transition-colors flex flex-col gap-0.5 ${selectedFormatId === f.id ? "bg-slate-100 text-slate-950 font-bold" : "text-slate-900"}`}>
                      <span className="truncate font-semibold">{f.name}</span>
                      <span className="text-[9px] text-slate-700">{f.brand} · {f.levelName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Group */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-950 font-extrabold uppercase tracking-wider whitespace-nowrap font-semibold">Business Group</span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-md border ${selectedFormat ? "bg-white border-slate-700 text-slate-955" : "bg-white/50 border-slate-700 text-slate-800 italic"}`}>
                {selectedFormat ? selectedFormat.businessGroup : "Inherited"}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-955 font-extrabold uppercase tracking-wider whitespace-nowrap font-semibold">Category</span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-md border ${selectedFormat ? "bg-white border-slate-700 text-slate-955" : "bg-white/50 border-slate-700 text-slate-800 italic"}`}>
                {selectedFormat ? selectedFormat.category : "Inherited"}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {onSwitchToSearch && (
                <button onClick={onSwitchToSearch} className="px-3 py-1.5 border border-slate-700 text-xs text-slate-955 rounded-md hover:bg-slate-100 transition-colors font-bold bg-white">
                  Search Library
                </button>
              )}
              <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded text-slate-800 hover:text-slate-955 transition-colors border border-slate-700 bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body: 70% workspace | 30% hierarchy ───────────────────────── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-earth">
          {/* Left: Creation Workspace (70%) */}
          <div className="flex flex-col overflow-hidden border-r border-slate-700" style={{ width: "70%" }}>
            {!selectedFormat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-800 p-8">
                <Layers className="w-10 h-10 text-slate-700" />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-955 uppercase tracking-wider">Select a Bulk Product to begin</p>
                  <p className="text-xs text-slate-800 mt-1">Choose a bulk product from the dropdown above to create subranges, variants, and local variants.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar animate-fadeIn">
                
                {/* ── Subrange Toggle ── */}
                <div className="space-y-3">
                  {/* Add Subrange Radio Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-905 uppercase tracking-wider min-w-[90px] text-left">Add Subrange?</span>
                    <div className="flex items-center gap-3 border border-slate-700 px-2.5 py-1 rounded-md bg-white">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-955 font-bold select-none">
                        <input
                          type="radio"
                          name="addSubrangeRadio"
                          checked={addSubrangeOpted}
                          onChange={() => setAddSubrangeOpted(true)}
                          className="h-3.5 w-3.5 text-slate-800 border-slate-700 focus:ring-slate-500 accent-slate-800"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-955 font-bold select-none">
                        <input
                          type="radio"
                          name="addSubrangeRadio"
                          checked={!addSubrangeOpted}
                          onChange={() => setAddSubrangeOpted(false)}
                          className="h-3.5 w-3.5 text-slate-800 border-slate-700 focus:ring-slate-500 accent-slate-800"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 my-4" />

                {/* ── Subranges List ── */}
                {addSubrangeOpted ? (
                  <div className="space-y-6">
                    {subranges.map((sr, sri) => {
                      return (
                        <div key={sr.id} className="space-y-3">
                          {/* Subrange Row */}
                          <div className="flex items-center gap-3 w-[450px]">
                            <span className="text-xs font-bold text-slate-955 min-w-[90px] text-left">Sub Range {sri + 1}</span>
                            <div className="flex-1 flex items-center gap-2">
                              <AutocompleteInput
                                value={sr.name}
                                onChange={(val) => updateSubrangeName(sri, val)}
                                suggestions={existingSubranges}
                                placeholder="Enter subrange name..."
                                className="flex-1"
                              />
                              {subranges.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSubrange(sri)}
                                  className="p-1.5 hover:bg-slate-100 rounded text-slate-955 hover:text-red-650 transition-colors border border-slate-700 flex-shrink-0 bg-white"
                                  title="Remove Subrange"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-[10px] font-bold text-slate-955 uppercase tracking-wider mt-2 pl-1">
                            Create Variant for the above Subrange
                          </div>

                          {/* Horizontal Variants Container */}
                          <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                            {sr.variants.map((vt, vi) => {
                              const usedGeos = vt.localVariants.map((lv) => lv.geography).filter(Boolean);
                              return (
                                <div key={vt.id} className="w-[220px] flex flex-col space-y-2 flex-shrink-0 relative pr-3 border-r border-slate-700">
                                  {/* Card Header Row */}
                                  <div className="flex items-center justify-between pb-1 border-b border-slate-700">
                                    <span className="text-[10px] font-bold text-slate-955 uppercase tracking-wider">Variant {vi + 1}</span>
                                    {sr.variants.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeVariant(sri, vi)}
                                        className="p-0.5 hover:bg-slate-100 rounded text-slate-955 hover:text-red-650 transition-colors border border-slate-700 bg-white"
                                        title="Remove Variant"
                                      >
                                        <Minus className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Variant Input */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Name</span>
                                    <div className="flex-1">
                                      <AutocompleteInput
                                        value={vt.name}
                                        onChange={(val) => updateVariant(sri, vi, { name: val })}
                                        suggestions={existingVariants}
                                        placeholder="Enter variant name..."
                                      />
                                    </div>
                                  </div>

                                  {/* Local Variant Section label */}
                                  <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                                    <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider block border-b border-slate-700 pb-0.5">
                                      Create Local variant
                                    </span>

                                    {/* Local Variant Rows with vertical scrolling and hidden scrollbars */}
                                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto no-scrollbar pr-0.5 flex-1 min-h-0">
                                      {vt.localVariants.map((lv, li) => (
                                        <div key={li} className="py-2 border-b border-slate-700 space-y-1.5 relative last:border-b-0">
                                          <div className="flex items-center justify-between border-b border-slate-700 pb-0.5">
                                            <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider">Local Variant {li + 1}</span>
                                            {vt.localVariants.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => removeLV(sri, vi, li)}
                                                className="p-0.5 hover:bg-red-50 rounded text-slate-955 hover:text-red-500 transition-colors border border-slate-700 bg-white"
                                              >
                                                <Minus className="w-2.5 h-2.5" />
                                              </button>
                                            )}
                                          </div>

                                          {/* Name Input */}
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Name</span>
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                value={lv.name}
                                                onChange={(e) => updateLV(sri, vi, li, { name: e.target.value })}
                                                placeholder="Local variant name..."
                                                className="w-full px-2 py-0.5 text-xs border border-slate-700 rounded focus:outline-none focus:border-slate-950 bg-white text-slate-955 font-semibold placeholder:text-slate-650"
                                              />
                                            </div>
                                          </div>

                                          {/* Geography Dropdown */}
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Geography</span>
                                            <div className="flex-1">
                                              <GeoCombobox
                                                value={lv.geography}
                                                onChange={(g) => updateLV(sri, vi, li, { geography: g })}
                                                usedGeos={usedGeos.filter((_, idx) => idx !== li)}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* + Add Local Variant Button */}
                                    <button
                                      type="button"
                                      onClick={() => addLV(sri, vi)}
                                      className="w-full flex items-center justify-center gap-1 py-1 border border-dashed border-slate-700 rounded-md text-[10px] font-bold text-slate-955 hover:bg-slate-100 hover:border-slate-800 transition-colors bg-white/50 uppercase tracking-wider"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      Add Local Variant
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add Variant Button Card */}
                            <button
                              type="button"
                              onClick={() => addVariant(sri)}
                              className="w-[220px] self-stretch min-h-[220px] border border-dashed border-slate-700 rounded-lg hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-955 hover:text-slate-950 transition-all flex-shrink-0 cursor-pointer bg-white"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Add Variant</span>
                            </button>
                          </div>

                          {sri < subranges.length - 1 && <hr className="border-slate-700 my-4" />}
                        </div>
                      );
                    })}

                    {/* + Add Subrange Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addSubrange}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-700 rounded-md text-xs font-semibold text-slate-955 hover:bg-slate-100 transition-colors bg-white"
                      >
                        <Plus className="w-4 h-4" />
                        Add Subrange
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-955 uppercase tracking-wider pl-1">
                      Create Variant for the Bulk Product
                    </div>

                    {/* Horizontal Variants Container */}
                    <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                      {subranges[0]?.variants.map((vt, vi) => {
                        const usedGeos = vt.localVariants.map((lv) => lv.geography).filter(Boolean);
                        return (
                          <div key={vt.id} className="w-[220px] flex flex-col space-y-2 flex-shrink-0 relative pr-3 border-r border-slate-700">
                            {/* Card Header Row */}
                            <div className="flex items-center justify-between pb-1 border-b border-slate-700">
                              <span className="text-[10px] font-bold text-slate-955 uppercase tracking-wider">Variant {vi + 1}</span>
                              {subranges[0].variants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeVariant(0, vi)}
                                  className="p-0.5 hover:bg-red-50 rounded text-slate-955 hover:text-red-500 transition-colors border border-slate-700 bg-white"
                                  title="Remove Variant"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>

                            {/* Variant Input */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Name</span>
                              <div className="flex-1">
                                <AutocompleteInput
                                  value={vt.name}
                                  onChange={(val) => updateVariant(0, vi, { name: val })}
                                  suggestions={existingVariants}
                                  placeholder="Enter variant name..."
                                />
                              </div>
                            </div>

                            {/* Local Variant Section label */}
                            <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                              <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider block border-b border-slate-700 pb-0.5">
                                Create Local variant
                              </span>

                              {/* Local Variant Rows with vertical scrolling and hidden scrollbars */}
                              <div className="space-y-1.5 max-h-[150px] overflow-y-auto no-scrollbar pr-0.5 flex-1 min-h-0">
                                {vt.localVariants.map((lv, li) => (
                                  <div key={li} className="py-2 border-b border-slate-700 space-y-1.5 relative last:border-b-0">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-0.5">
                                      <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider">Local Variant {li + 1}</span>
                                      {vt.localVariants.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeLV(0, vi, li)}
                                          className="p-0.5 hover:bg-red-50 rounded text-slate-955 hover:text-red-500 transition-colors border border-slate-700 bg-white"
                                        >
                                          <Minus className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Name Input */}
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Name</span>
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          value={lv.name}
                                          onChange={(e) => updateLV(0, vi, li, { name: e.target.value })}
                                          placeholder="Local variant name..."
                                          className="w-full px-2 py-0.5 text-xs border border-slate-700 rounded focus:outline-none focus:border-slate-955 bg-white text-slate-955 font-semibold placeholder:text-slate-650"
                                        />
                                      </div>
                                    </div>

                                    {/* Geography Dropdown */}
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold text-slate-955 uppercase tracking-wider min-w-[50px] text-left">Geography</span>
                                      <div className="flex-1">
                                        <GeoCombobox
                                          value={lv.geography}
                                          onChange={(g) => updateLV(0, vi, li, { geography: g })}
                                          usedGeos={usedGeos.filter((_, idx) => idx !== li)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* + Add Local Variant Button */}
                              <button
                                type="button"
                                onClick={() => addLV(0, vi)}
                                className="w-full flex items-center justify-center gap-1 py-1 border border-dashed border-slate-700 rounded-md text-[10px] font-bold text-slate-955 hover:bg-slate-100 hover:border-slate-800 transition-colors bg-white/50 uppercase tracking-wider"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                Add Local Variant
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Variant Button Card */}
                      <button
                        type="button"
                        onClick={() => addVariant(0)}
                        className="w-[220px] self-stretch min-h-[220px] border border-dashed border-slate-700 rounded-lg hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-955 hover:text-slate-950 transition-all flex-shrink-0 cursor-pointer bg-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Variant</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right: Hierarchy Preview (30%) */}
          <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-100/50 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[10px] font-bold text-slate-955 uppercase tracking-wider">Hierarchy Preview</span>
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
        <div className="flex-shrink-0 border-t border-slate-700 bg-white px-4 py-2 flex items-center justify-between gap-3 shadow-inner">
          <button onClick={handleClose} className="px-4 py-2 border border-slate-700 rounded-md text-xs font-semibold text-slate-955 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={onNavigateToSKU}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 text-slate-955 bg-white hover:bg-slate-100 rounded-md text-xs font-semibold transition-colors">
              <Tag className="w-3.5 h-3.5 text-slate-700" />
              Create SKU
            </button>
            <button type="button" onClick={handleCreateProduct} disabled={!selectedFormat}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky text-white rounded-md text-xs font-semibold hover:bg-[#0052a3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Check className="w-3.5 h-3.5 text-white" />
              Create Product
            </button>
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full mx-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-slate-955 font-bold text-sm">Discard changes?</h3>
            </div>
            <p className="text-xs text-slate-900 mb-4 leading-relaxed">You have unsaved product details. Are you sure you want to close without saving?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCancelConfirm(false)} className="px-3.5 py-1.5 border border-slate-700 text-slate-955 rounded-md text-xs font-semibold hover:bg-slate-100 transition-colors">Keep Editing</button>
              <button onClick={resetAndClose} className="px-3.5 py-1.5 bg-red-650 text-white rounded-md text-xs font-semibold hover:bg-red-700 bg-red-650 transition-colors">Discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}