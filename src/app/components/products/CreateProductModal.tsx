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
  id: newId(), geography, cucCode: "", formulationDoc: null,
});

const makeDefaultVariant = (): VariantEntry => ({
  id: newId(), name: "", localVariants: [], showAddLVPanel: false, pendingGeos: [],
});

const makeDefaultSubrange = (): SubrangeEntry => ({
  id: newId(), name: "", variants: [],
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
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/15 text-night placeholder:text-gray-400 placeholder:font-normal transition-all"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-36 overflow-y-auto py-1">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-night font-medium truncate cursor-pointer">
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
}: { selected: string[]; onChange: (geos: string[]) => void; usedGeos: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const available = ALL_GEOGRAPHIES.filter((g) => !usedGeos.includes(g) && g.toLowerCase().includes(query.toLowerCase()));
  const toggle = (geo: string) => onChange(selected.includes(geo) ? selected.filter((g) => g !== geo) : [...selected, geo]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left transition-all hover:border-sky/50 focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/15">
        <Globe2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className={`flex-1 truncate text-sm ${selected.length > 0 ? "text-night font-medium" : "text-gray-400 font-normal"}`}>
          {selected.length > 0 ? selected.join(", ") : "Select geographies..."}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selected.length > 0 && (
            <span className="text-[10px] bg-sky/10 text-sky font-bold px-1.5 py-0.5 rounded">{selected.length}</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="absolute z-[200] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2">
          <div className="px-3 pb-2 border-b border-gray-100">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..." className="w-full pl-7 pr-3 py-1.5 bg-gray-50 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky/30 text-night placeholder:text-gray-400" />
            </div>
          </div>
          <div className="py-1 overflow-y-scroll" style={{ maxHeight: "160px", scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
            {available.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 italic text-center">No geographies available</div>
            ) : (
              available.map((g) => (
                <button key={g} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => toggle(g)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-night cursor-pointer">
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected.includes(g) ? "bg-sky border-sky" : "border-gray-300 bg-white"}`}>
                    {selected.includes(g) && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-medium">{g}</span>
                </button>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="px-3 pt-2 border-t border-gray-100 flex justify-between items-center">
              <button type="button" onClick={() => onChange([])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer font-medium">Clear all</button>
              <button type="button" onClick={() => setOpen(false)}
                className="text-xs text-white bg-sky hover:bg-dark px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer">
                Confirm ({selected.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HierarchyView ────────────────────────────────────────────────────────────
function HierarchyView({ formatName, addSubrangeOpted, subranges }: {
  formatName: string; addSubrangeOpted: boolean; subranges: SubrangeEntry[];
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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <Layers className="w-5 h-5 text-gray-300" />
        </div>
        <p className="text-xs leading-relaxed text-gray-400">Preview appears as you fill in the hierarchy</p>
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

  const renderVariants = (variants: VariantEntry[], keyPrefix: string) =>
    variants.map((vt, vi) => {
      if (!vt.name && vt.localVariants.length === 0) return null;
      const vtKey = `${keyPrefix}-vt-${vi}`;
      const vtExp = expanded[vtKey] !== false;
      return (
        <div key={vt.id} className="ml-5 pl-2.5 border-l border-sky/20 mt-0.5">
          <button type="button" onClick={() => toggle(vtKey)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sky/5 transition-colors text-left cursor-pointer">
            <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
            <Beaker className="w-3 h-3 text-sky flex-shrink-0" />
            <span className="text-[10px] font-semibold text-night truncate flex-1">
              {vt.name || <span className="text-gray-400 italic">Unnamed</span>}
            </span>
            <span className="text-[7px] text-sky bg-sky/10 px-1 py-0.5 rounded font-bold flex-shrink-0">VAR</span>
            {vt.localVariants.length > 0 && (
              <ChevronRight className={`w-2.5 h-2.5 text-gray-300 transition-transform flex-shrink-0 ${vtExp ? "rotate-90" : ""}`} />
            )}
          </button>
          {vtExp && vt.localVariants.length > 0 && renderLVs(vt.localVariants)}
        </div>
      );
    });

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 py-1">
      {/* Format node */}
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-night/5 border border-night/10">
        <Layers className="w-3 h-3 text-night flex-shrink-0" />
        <span className="text-[11px] font-bold text-night truncate flex-1">{formatName}</span>
        <span className="text-[7px] text-night/50 bg-night/10 px-1.5 py-0.5 rounded font-bold flex-shrink-0">FMT</span>
      </div>

      {addSubrangeOpted ? (
        subranges
          .filter((sr) => sr.name || sr.variants.some((v) => v.name || v.localVariants.length > 0))
          .map((sr, sri) => {
            const srKey = `sr-${sri}`;
            const srExp = expanded[srKey] !== false;
            return (
              <div key={sr.id} className="ml-4 pl-2.5 border-l-2 border-violet-200 mt-1">
                <button type="button" onClick={() => toggle(srKey)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-violet-50/60 transition-colors text-left cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  <Blocks className="w-3 h-3 text-violet-500 flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-night truncate flex-1">
                    {sr.name || <span className="text-gray-400 italic">Sub Range {sri + 1}</span>}
                  </span>
                  <span className="text-[7px] text-violet-600 bg-violet-50 px-1 py-0.5 rounded font-bold border border-violet-100 flex-shrink-0">SR</span>
                  {sr.variants.length > 0 && (
                    <ChevronRight className={`w-2.5 h-2.5 text-gray-300 transition-transform flex-shrink-0 ${srExp ? "rotate-90" : ""}`} />
                  )}
                </button>
                {srExp && renderVariants(sr.variants, srKey)}
              </div>
            );
          })
      ) : (
        renderVariants(subranges[0]?.variants ?? [], "root")
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
  const addSubrange = useCallback(() => setSubranges((prev) => [...prev, makeDefaultSubrange()]), []);
  const removeSubrange = useCallback((sri: number) => setSubranges((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== sri) : prev)), []);
  const updateSubrangeName = useCallback((sri: number, val: string) => setSubranges((prev) => prev.map((sr, i) => (i === sri ? { ...sr, name: val } : sr))), []);

  // ── Variant ops ──────────────────────────────────────────────────────────
  const addVariant = useCallback((sri: number) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : { ...sr, variants: [...sr.variants, makeDefaultVariant()] }));
  }, []);

  const removeVariant = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : { ...sr, variants: sr.variants.filter((_, j) => j !== vi) }));
  }, []);

  const updateVariantName = useCallback((sri: number, vi: number, name: string) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : { ...sr, variants: sr.variants.map((v, j) => j === vi ? { ...v, name } : v) }));
  }, []);

  const setShowAddLVPanel = useCallback((sri: number, vi: number, show: boolean) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : {
      ...sr,
      variants: sr.variants.map((v, j) => j === vi ? { ...v, showAddLVPanel: show, pendingGeos: show ? v.pendingGeos : [] } : v),
    }));
  }, []);

  const setPendingGeos = useCallback((sri: number, vi: number, geos: string[]) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : {
      ...sr,
      variants: sr.variants.map((v, j) => j === vi ? { ...v, pendingGeos: geos } : v),
    }));
  }, []);

  const confirmAddLocalVariants = useCallback((sri: number, vi: number) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : {
      ...sr,
      variants: sr.variants.map((v, j) => {
        if (j !== vi) return v;
        const existingGeos = v.localVariants.map((lv) => lv.geography);
        const newLVs = v.pendingGeos.filter((g) => !existingGeos.includes(g)).map((g) => makeDefaultLV(g));
        return { ...v, localVariants: [...v.localVariants, ...newLVs], pendingGeos: [], showAddLVPanel: false };
      }),
    }));
  }, []);

  // ── Local Variant ops ────────────────────────────────────────────────────
  const updateLV = useCallback((sri: number, vi: number, lvId: string, patch: Partial<LocalVariantRow>) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : {
      ...sr,
      variants: sr.variants.map((v, j) => j !== vi ? v : {
        ...v,
        localVariants: v.localVariants.map((lv) => lv.id === lvId ? { ...lv, ...patch } : lv),
      }),
    }));
  }, []);

  const removeLV = useCallback((sri: number, vi: number, lvId: string) => {
    setSubranges((prev) => prev.map((sr, i) => i !== sri ? sr : {
      ...sr,
      variants: sr.variants.map((v, j) => j !== vi ? v : {
        ...v,
        localVariants: v.localVariants.filter((lv) => lv.id !== lvId),
      }),
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
          parentId, parentName, geographies: v.localVariants.map((lv) => lv.geography).filter(Boolean),
          category: selectedFormat.category, businessGroup: selectedFormat.businessGroup,
          brand: selectedFormat.brand, createdBy: "Sarah Johnson", createdDate: nowStr, isFavorite: false,
        });
        v.localVariants.forEach((lv, lvi) => {
          const lvId = `prod-lv-${Date.now()}-${vi}-${lvi}-${Math.floor(Math.random() * 1000)}`;
          listToCreate.push({
            id: lvId, name: getCompoundName(vName, lv.geography.substring(0, 2).toUpperCase()),
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

  // ── Render helper: Variant columns with compact LV rows ────────────────
  const renderVariantsSection = (sri: number, variants: VariantEntry[], useSri: number) => (
    <div className="flex items-start gap-3 overflow-x-auto pb-2 no-scrollbar">
      {variants.map((vt, vi) => {
        const allUsedGeos = vt.localVariants.map((lv) => lv.geography);
        const availableForPending = ALL_GEOGRAPHIES.filter((g) => !allUsedGeos.includes(g));

        return (
          <div
            key={vt.id}
            className="flex-shrink-0 w-[256px] flex flex-col rounded-xl border border-gray-200 bg-white animate-fadeInUp"
            style={{ boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)" }}
          >
            {/* ── Variant Header (no heavy band — just a clean top row) ── */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
              <span className="w-5 h-5 rounded-md bg-sky/10 text-sky text-[9px] font-black flex items-center justify-center flex-shrink-0 leading-none">
                V{vi + 1}
              </span>
              <div className="flex-1 min-w-0">
                <AutocompleteInput
                  value={vt.name}
                  onChange={(val) => updateVariantName(useSri, vi, val)}
                  suggestions={existingVariants}
                  placeholder="Variant name..."
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(useSri, vi)}
                className="p-1 hover:bg-red-50 rounded-md text-gray-300 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                title="Remove Variant"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* ── Local Variants: compact table rows ── */}
            {vt.localVariants.length > 0 && (
              <div>
                {/* LV section label */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/60 border-b border-emerald-100/80">
                  <Globe2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex-1">Local Variants</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {vt.localVariants.length}
                  </span>
                </div>

                {/* Scrollable LV rows */}
                <div className="overflow-y-scroll" style={{ maxHeight: "176px", scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
                  {vt.localVariants.map((lv, lvi) => (
                    <div
                      key={lv.id}
                      className="group flex items-center gap-1.5 px-3 py-2 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Row number */}
                      <span className="text-[9px] font-bold text-gray-300 w-3 flex-shrink-0 text-right">{lvi + 1}</span>

                      {/* Geography */}
                      <span className="text-[11px] font-semibold text-night flex-1 truncate min-w-0">{lv.geography}</span>

                      {/* CUC input */}
                      <div className="relative flex-shrink-0">
                        <input
                          type="text"
                          value={lv.cucCode}
                          onChange={(e) => updateLV(useSri, vi, lv.id, { cucCode: e.target.value })}
                          placeholder="CUC"
                          className={`w-[72px] text-[10px] px-2 py-1 border rounded-md font-medium focus:outline-none focus:ring-1 text-night placeholder:text-gray-300 transition-all ${
                            lv.cucCode
                              ? "border-emerald-300 bg-emerald-50/50 focus:border-emerald-400 focus:ring-emerald-400/20"
                              : "border-gray-200 bg-white focus:border-sky focus:ring-sky/20"
                          }`}
                        />
                        {lv.cucCode && (
                          <Check className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-emerald-500 pointer-events-none" />
                        )}
                      </div>

                      {/* Doc action: icon shows attached/not */}
                      {lv.formulationDoc ? (
                        <button
                          type="button"
                          onClick={() => updateLV(useSri, vi, lv.id, { formulationDoc: null })}
                          title={lv.formulationDoc}
                          className="p-1 bg-blue-50 hover:bg-red-50 border border-blue-100 hover:border-red-100 rounded-md text-blue-400 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateLV(useSri, vi, lv.id, { formulationDoc: `Formulation_${lv.geography.replace(/\s+/g, "_")}_Spec_v1.pdf` })}
                            title="Upload document"
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-300 hover:text-sky transition-colors cursor-pointer"
                          >
                            <Upload className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLV(useSri, vi, lv.id, { formulationDoc: `Library_Doc_${lv.geography.replace(/\s+/g, "_")}.pdf` })}
                            title="Link from library"
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-300 hover:text-sky transition-colors cursor-pointer"
                          >
                            <Link2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeLV(useSri, vi, lv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-md text-gray-300 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Add LV Panel or Button ── */}
            {vt.showAddLVPanel ? (
              <div className="border-t border-gray-100 p-3 space-y-2.5 bg-sky/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky uppercase tracking-wider">Select Geographies</span>
                  <button type="button" onClick={() => setShowAddLVPanel(useSri, vi, false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <MultiGeoSelector
                  selected={vt.pendingGeos}
                  onChange={(geos) => setPendingGeos(useSri, vi, geos)}
                  usedGeos={allUsedGeos}
                />
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setShowAddLVPanel(useSri, vi, false)}
                    className="flex-1 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer bg-white">
                    Cancel
                  </button>
                  <button type="button" disabled={vt.pendingGeos.length === 0}
                    onClick={() => confirmAddLocalVariants(useSri, vi)}
                    className="flex-1 py-1.5 bg-sky text-white rounded-lg text-[10px] font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    Add {vt.pendingGeos.length > 0 ? `${vt.pendingGeos.length} ` : ""}LV{vt.pendingGeos.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            ) : (
              availableForPending.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddLVPanel(useSri, vi, true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100 text-[10px] font-bold text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/40 transition-all bg-transparent cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Local Variant
                </button>
              )
            )}
          </div>
        );
      })}

      {/* ── Add Variant card ── */}
      <button
        type="button"
        onClick={() => addVariant(useSri)}
        className="flex-shrink-0 w-[180px] self-stretch min-h-[120px] border-2 border-dashed border-gray-200 hover:border-sky/40 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-300 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Add Variant</span>
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
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.18s ease-out; }
      `}</style>

      <div className="cpmodal fixed inset-0 top-[56px] z-45 flex flex-col bg-[#F7F8FA] overflow-hidden text-night">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          {/* Top row */}
          <div className="px-6 py-3.5 flex items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-sky/10 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-sky" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-night leading-none">Create Product</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Bulk hierarchy builder</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

            {/* Format selector */}
            <div ref={formatDropRef} className="relative flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">Format</span>
              <button
                type="button"
                onClick={() => setFormatDropOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  selectedFormat
                    ? "border-gray-200 bg-white text-night font-semibold shadow-sm"
                    : "border-dashed border-gray-300 text-gray-400 font-medium hover:border-gray-400 bg-white"
                }`}
                style={{ minWidth: "190px" }}
              >
                <Layers className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate flex-1 text-left text-sm">{selectedFormat ? selectedFormat.name : "Select Format"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${formatDropOpen ? "rotate-180" : ""}`} />
              </button>
              {formatDropOpen && (
                <div className="absolute left-[90px] top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-72 max-h-52 overflow-y-auto py-1.5">
                  {FORMAT_OPTIONS.map((f) => (
                    <button key={f.id} type="button"
                      onClick={() => { setSelectedFormatId(f.id); setFormatDropOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex flex-col gap-0.5 ${selectedFormatId === f.id ? "bg-sky/5 text-sky font-semibold" : "text-night font-medium"}`}>
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] text-gray-400">{f.brand} · {f.levelName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Group */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">BG</span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${selectedFormat ? "bg-gray-100 text-night" : "bg-white border border-dashed border-gray-200 text-gray-300 italic"}`}>
                {selectedFormat ? selectedFormat.businessGroup : "—"}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">Category</span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${selectedFormat ? "bg-gray-100 text-night" : "bg-white border border-dashed border-gray-200 text-gray-300 italic"}`}>
                {selectedFormat ? selectedFormat.category : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {onSwitchToSearch && (
                <button onClick={onSwitchToSearch}
                  className="px-3.5 py-2 border border-gray-200 text-xs text-gray-500 hover:text-night hover:bg-gray-50 rounded-lg transition-all font-bold bg-white cursor-pointer">
                  Search Library
                </button>
              )}
              <button onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-night transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
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

        {/* ── Body: 70% workspace | 30% hierarchy ───────────────────────── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">

          {/* ── Left: Creation Workspace (70%) ── */}
          <div className="flex flex-col overflow-hidden border-r border-gray-200" style={{ width: "70%" }}>
            {!selectedFormat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 p-8">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Layers className="w-7 h-7 text-gray-300" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-bold text-night">Select a Format to begin</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Choose a format from the dropdown above to start building your product hierarchy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">

                {/* ── Add Subrange toggle ── */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Include Subranges?</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setAddSubrangeOpted(true)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${addSubrangeOpted ? "bg-night text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >Yes</button>
                    <button
                      type="button"
                      onClick={() => setAddSubrangeOpted(false)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${!addSubrangeOpted ? "bg-night text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >No</button>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* ── Subranges or direct variants ── */}
                {addSubrangeOpted ? (
                  <div className="space-y-5">
                    {subranges.map((sr, sri) => (
                      <div
                        key={sr.id}
                        className="animate-fadeInUp pl-4 border-l-2 border-violet-200 space-y-3"
                      >
                        {/* SR name row */}
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-violet-100 text-violet-600 text-[10px] font-black flex items-center justify-center flex-shrink-0 leading-none">
                            S{sri + 1}
                          </span>
                          <div className="flex-1">
                            <AutocompleteInput
                              value={sr.name}
                              onChange={(val) => updateSubrangeName(sri, val)}
                              suggestions={existingSubranges}
                              placeholder="Sub range name..."
                            />
                          </div>
                          {subranges.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubrange(sri)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                              title="Remove Subrange"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Variants indented */}
                        <div className="ml-9">
                          {/* Variants label */}
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <Beaker className="w-3 h-3 text-gray-300" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variants</span>
                          </div>
                          {renderVariantsSection(sri, sr.variants, sri)}
                        </div>

                        {sri < subranges.length - 1 && <div className="border-t border-gray-100 pt-1" />}
                      </div>
                    ))}

                    {/* + Add Subrange */}
                    <button
                      type="button"
                      onClick={addSubrange}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-200 hover:border-violet-300 rounded-lg text-xs font-bold text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 transition-all bg-white cursor-pointer ml-4"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subrange
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <Beaker className="w-3 h-3 text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variants for {formatName}</span>
                    </div>
                    {renderVariantsSection(0, subranges[0]?.variants ?? [], 0)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Hierarchy Preview (30%) ── */}
          <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/60">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Hierarchy Preview</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col px-3 py-3">
              <HierarchyView
                formatName={formatName}
                addSubrangeOpted={addSubrangeOpted}
                subranges={subranges}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onNavigateToSKU}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            Create SKU
          </button>
          <button
            type="button"
            onClick={handleCreateProduct}
            disabled={!selectedFormat}
            className="flex items-center gap-1.5 px-5 py-2 bg-sky text-white rounded-lg text-xs font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-sky/20 active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Create Product
          </button>
        </div>
      </div>

      {/* ── Cancel Confirmation Dialog ────────────────────────────────── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-night font-bold text-sm">Discard changes?</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              You have unsaved product details. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-2 justify-end mt-5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night hover:bg-gray-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white"
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
    </>
  );
}