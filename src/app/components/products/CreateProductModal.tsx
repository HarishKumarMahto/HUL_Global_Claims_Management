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
  FileText,
  Upload,
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
  onCreate: (
    product: Omit<
      ProductItem,
      | "id" | "productId" | "lifecycleState" | "childCount"
      | "claimsCount" | "projectsCount" | "geographyCount" | "lastModified"
    >,
  ) => void;
  preselectedType?: ProductType;
  project?: Project;
  onSwitchToSearch?: () => void;
  onNavigateToSKU?: () => void;
}

type LocalVariantRow = { geography: string; cucCode: string; formulationDoc: string | null };
type VariantEntry    = { id: string; name: string; localVariants: LocalVariantRow[] };
type SubrangeEntry   = { id: string; name: string; variants: VariantEntry[]; collapsed: boolean };

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

const CUC_PATTERN = /^CUC-[A-Z0-9]+-[A-Z0-9]+-[A-Z]{2}-\d{3}$/;

let _eid = 0;
const newId = () => `eid-${++_eid}`;
const makeDefaultLV      = (): LocalVariantRow  => ({ geography: "", cucCode: "", formulationDoc: null });
const makeDefaultVariant = (): VariantEntry     => ({ id: newId(), name: "", localVariants: [makeDefaultLV()] });
const makeDefaultSubrange= (): SubrangeEntry    => ({ id: newId(), name: "", variants: [makeDefaultVariant()], collapsed: false });

// ─── Utility: scroll to element by id ────────────────────────────────────────
const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });

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
        <Search className="absolute left-2 w-3 h-3 text-gray-300 pointer-events-none" />
        <input type="text" value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-6 pr-2 py-1 text-xs border border-pebble rounded-lg focus:outline-none focus:border-sky bg-white text-night placeholder:text-gray-300 transition-colors"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-pebble rounded-lg shadow-xl max-h-36 overflow-y-auto">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-earth transition-colors text-night truncate">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CucInput ─────────────────────────────────────────────────────────────────
function CucInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [status, setStatus] = useState<"idle"|"valid"|"invalid">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const handleChange = (v: string) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v) { setStatus("idle"); return; }
    timer.current = setTimeout(() => setStatus(CUC_PATTERN.test(v) ? "valid" : "invalid"), 500);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <div className="relative">
      <input type="text" value={value} onChange={(e) => handleChange(e.target.value)} placeholder="CUC code"
        className={`w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-sky transition-colors ${
          status === "invalid" ? "border-red-400 bg-red-50" : status === "valid" ? "border-green-400 bg-green-50" : "border-pebble bg-white"
        }`}
      />
      {status !== "idle" && (
        <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold ${status === "valid" ? "text-green-600" : "text-red-500"}`}>
          {status === "valid" ? "✓" : "✗"}
        </span>
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
        <Globe2 className="absolute left-2 w-3 h-3 text-sky pointer-events-none" />
        <input type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} placeholder="Geography"
          className={`w-full pl-6 pr-5 py-1 text-xs border rounded focus:outline-none focus:border-sky transition-colors ${value ? "border-sky/50 bg-sky/5 text-night" : "border-pebble bg-white text-gray-400"}`}
        />
        <button type="button" tabIndex={-1} onClick={() => setOpen((o) => !o)} className="absolute right-1">
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-0.5 bg-white border border-pebble rounded shadow-xl max-h-36 overflow-y-auto">
          {available.length === 0 ? (
            query.trim() ? (
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(query.trim()); setOpen(false); }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-sky hover:bg-pale transition-colors">
                Use "{query.trim()}"
              </button>
            ) : <div className="px-2.5 py-1.5 text-xs text-gray-400 italic">No geographies available</div>
          ) : available.map((g) => (
            <button key={g} type="button" onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(g); setQuery(g); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-earth transition-colors ${g === value ? "text-sky font-semibold bg-pale/60" : "text-gray-700"}`}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hierarchy Tree View ──────────────────────────────────────────────────────
function HierarchyView({ formatName, subranges }: { formatName: string; subranges: SubrangeEntry[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));
  const hasContent = formatName || subranges.some((s) => s.name || s.variants.some((v) => v.name));
  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8 text-gray-300 px-3">
        <Layers className="w-10 h-10" />
        <p className="text-xs leading-relaxed">Hierarchy preview will appear here as you fill in subranges, variants and local variants</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto text-xs space-y-0.5 py-1">
      {formatName && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
          <Layers className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate flex-1">{formatName}</span>
          <span className="text-[9px] bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">Format</span>
        </div>
      )}
      {subranges.map((sr, si) => {
        const srKey = `sr-${si}`;
        const srExp = expanded[srKey] !== false;
        if (!sr.name && sr.variants.every((v) => !v.name)) return null;
        return (
          <div key={sr.id} className="ml-3 mt-0.5">
            <button type="button" onClick={() => toggle(srKey)} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-earth transition-colors text-left">
              <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${srExp ? "rotate-90" : ""}`} />
              <Blocks className="w-3 h-3 text-sky flex-shrink-0" />
              <span className="text-night font-medium truncate flex-1 text-[11px]">{sr.name || <span className="text-gray-300 italic">Unnamed</span>}</span>
              <span className="text-[9px] bg-sky/10 text-sky px-1.5 py-0.5 rounded font-bold uppercase ml-auto">Sub</span>
            </button>
            {srExp && sr.variants.map((vt, vi) => {
              const vtKey = `vt-${si}-${vi}`;
              const vtExp = expanded[vtKey] !== false;
              if (!vt.name && vt.localVariants.every((lv) => !lv.geography)) return null;
              return (
                <div key={vt.id} className="ml-4 mt-0.5">
                  <button type="button" onClick={() => toggle(vtKey)} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-earth transition-colors text-left">
                    <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${vtExp ? "rotate-90" : ""}`} />
                    <Beaker className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="text-night truncate flex-1 text-[11px]">{vt.name || <span className="text-gray-300 italic">Unnamed</span>}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase ml-auto">Var</span>
                  </button>
                  {vtExp && vt.localVariants.filter((lv) => lv.geography).map((lv, li) => (
                    <div key={li} className="ml-5 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-earth/50">
                      <Globe2 className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate flex-1 text-[11px]">{lv.geography}</span>
                      {lv.cucCode && <span className="text-[9px] text-gray-400 font-mono truncate max-w-[70px] hidden xl:block">{lv.cucCode}</span>}
                      {lv.formulationDoc && <FileText className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />}
                      <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase ml-auto">LV</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Variant Quick-Nav Pills (per-subrange, shown in subrange header) ────────
function VariantQuickNav({
  variants, globalOffset,
}: {
  variants: VariantEntry[];
  globalOffset: number;
}) {
  const [expandedPill, setExpandedPill] = useState<string | null>(null);
  if (variants.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {variants.map((vt, vi) => {
        const label = `V${globalOffset + vi + 1}`;
        const isExpanded = expandedPill === vt.id;
        const hasLVs = vt.localVariants.some((lv) => lv.geography);
        return (
          <div key={vt.id} className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => { scrollTo(`variant-${vt.id}`); setExpandedPill(isExpanded ? null : vt.id); }}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                isExpanded
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {label}
              {hasLVs && <ChevronDown className={`w-2 h-2 transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
            </button>
            {isExpanded && vt.localVariants.map((lv, li) =>
              lv.geography ? (
                <button key={li} type="button"
                  onClick={() => scrollTo(`lv-${vt.id}-${li}`)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors">
                  <Globe2 className="w-2 h-2" />LV{li + 1}
                </button>
              ) : null
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Formulation Doc Dialog ───────────────────────────────────────────────────
function FormulationDocDialog({ geo, existing, onSave, onClose }: { geo: string; existing: string | null; onSave: (name: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"fetch"|"library"|"upload">("fetch");
  const [cucInput, setCucInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [linked, setLinked] = useState<string|null>(existing);
  const handleFetch = () => {
    if (!cucInput.trim()) return;
    setFetching(true);
    setTimeout(() => { setFetching(false); setLinked(`PLM_Formulation_${cucInput.trim().toUpperCase()}_v1.pdf`); }, 1000);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-pebble bg-sky/5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky" />
            <div><div className="text-sm font-bold text-night">Formulation Document</div><div className="text-xs text-gray-500">{geo}</div></div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-earth rounded-lg text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex px-5 border-b border-pebble gap-4 bg-gray-50/50">
          {(["fetch","library","upload"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${tab === t ? "border-sky text-sky" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t === "fetch" ? "Fetch PLM" : t === "library" ? "Library" : "Upload"}
            </button>
          ))}
        </div>
        <div className="p-5 space-y-4">
          {linked && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs text-night font-medium truncate">{linked}</span>
              <span className="ml-auto text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Linked</span>
            </div>
          )}
          {tab === "fetch" && (
            <div className="flex gap-2">
              <input type="text" value={cucInput} onChange={(e) => setCucInput(e.target.value)} placeholder="e.g. CUC-1049-284-UK-001"
                className="flex-1 px-3 py-2 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              <button type="button" onClick={handleFetch} disabled={fetching}
                className="px-4 py-2 bg-sky text-white rounded-xl text-sm font-semibold hover:bg-dark disabled:opacity-50 transition-colors flex items-center gap-2">
                {fetching && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {fetching ? "Fetching…" : "Fetch"}
              </button>
            </div>
          )}
          {tab === "library" && (
            <div className="space-y-2">
              {[{name:"Global_Active_Formulation_A_2026.pdf",size:"2.1 MB"},{name:"Moisturizer_Base_Specs_v4.pdf",size:"950 KB"},{name:"Dry_Skin_Therapy_Cert_Final.pdf",size:"1.8 MB"}].map((doc) => (
                <div key={doc.name} onClick={() => setLinked(doc.name)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${linked === doc.name ? "border-green-500 bg-green-50/30" : "border-pebble hover:border-sky/40 hover:bg-earth"}`}>
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${linked === doc.name ? "text-green-600" : "text-sky"}`} />
                    <div><div className="text-xs text-night font-medium">{doc.name}</div><div className="text-[10px] text-gray-400">{doc.size}</div></div>
                  </div>
                  {linked === doc.name && <Check className="w-4 h-4 text-green-600" />}
                </div>
              ))}
            </div>
          )}
          {tab === "upload" && (
            <div onClick={() => setLinked(`Formulation_Spec_${geo.replace(/\s+/g,"_")}_v1.pdf`)}
              className="border-2 border-dashed border-gray-200 hover:border-sky/50 hover:bg-sky/5 rounded-xl p-6 text-center cursor-pointer transition-all group">
              <Upload className="w-7 h-7 text-gray-300 group-hover:text-sky mx-auto mb-2 transition-colors" />
              <p className="text-xs font-semibold text-gray-500 group-hover:text-sky">Click to browse or drop file here</p>
              <p className="text-[10px] text-gray-400 mt-1">PDF, XLS, DOC · max 10 MB</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-pebble bg-gray-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-pebble text-sm rounded-lg hover:bg-earth transition-colors">Cancel</button>
          {linked && <button type="button" onClick={() => { onSave(linked!); onClose(); }} className="px-4 py-2 bg-sky text-white text-sm font-semibold rounded-lg hover:bg-dark transition-colors">Save</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Local Variant Row ────────────────────────────────────────────────────────
function LocalVariantRowUI({
  row, index, domId, onUpdate, onRemove, usedGeos,
}: {
  row: LocalVariantRow;
  index: number;
  domId: string;
  onUpdate: (patch: Partial<LocalVariantRow>) => void;
  onRemove: () => void;
  usedGeos: string[];
}) {
  const [formulationOpen, setFormulationOpen] = useState(false);
  return (
    <>
      <div id={domId} className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-2 space-y-1.5 relative group/lv scroll-mt-2">
        {/* LV header label + remove */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Local Variant {index + 1}</span>
          <button type="button" onClick={onRemove} className="p-0.5 text-gray-300 hover:text-red-400 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
        <GeoCombobox value={row.geography} onChange={(g) => onUpdate({ geography: g })} usedGeos={usedGeos} />
        <CucInput value={row.cucCode} onChange={(v) => onUpdate({ cucCode: v })} />
        <button type="button" onClick={() => setFormulationOpen(true)}
          className={`w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
            row.formulationDoc ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-sky border-pebble hover:bg-pale/40"
          }`}>
          <FileText className="w-3 h-3" />
          {row.formulationDoc ? "Doc Linked" : "Add Formulation"}
        </button>
      </div>
      {formulationOpen && (
        <FormulationDocDialog geo={row.geography || "Local Variant"} existing={row.formulationDoc}
          onSave={(name) => onUpdate({ formulationDoc: name })} onClose={() => setFormulationOpen(false)} />
      )}
    </>
  );
}

// ─── Variant Card ─────────────────────────────────────────────────────────────
function VariantCard({
  variant, variantIndex, globalVariantIndex, parentName, onUpdate, onRemove, canRemove, existingVariantNames,
}: {
  variant: VariantEntry;
  variantIndex: number;
  globalVariantIndex: number;
  parentName: string;
  onUpdate: (patch: Partial<VariantEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
  existingVariantNames: string[];
}) {
  const updateLV = useCallback(
    (li: number, patch: Partial<LocalVariantRow>) =>
      onUpdate({ localVariants: variant.localVariants.map((lv, i) => (i === li ? { ...lv, ...patch } : lv)) }),
    [variant.localVariants, onUpdate],
  );
  const removeLV = useCallback(
    (li: number) => {
      const next = variant.localVariants.filter((_, i) => i !== li);
      onUpdate({ localVariants: next.length > 0 ? next : [makeDefaultLV()] });
    },
    [variant.localVariants, onUpdate],
  );
  const addLV = useCallback(() => onUpdate({ localVariants: [...variant.localVariants, makeDefaultLV()] }), [variant.localVariants, onUpdate]);
  const usedGeos = variant.localVariants.map((lv) => lv.geography).filter(Boolean);

  return (
    <div
      id={`variant-${variant.id}`}
      className="bg-white rounded-xl border-2 border-emerald-200 w-52 flex-shrink-0 flex flex-col shadow-sm hover:shadow-md transition-shadow scroll-mt-2"
    >
      {/* Variant Header */}
      <div className="px-2.5 pt-2.5 pb-2 border-b border-pebble">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            Variant {globalVariantIndex + 1}
          </span>
          {canRemove && (
            <button type="button" onClick={onRemove} className="p-0.5 text-gray-300 hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <AutocompleteInput value={variant.name} onChange={(v) => onUpdate({ name: v })}
          suggestions={existingVariantNames} placeholder="Variant name…" />
        {parentName && variant.name && (
          <div className="text-[10px] text-gray-400 mt-0.5 truncate">{parentName} {variant.name}</div>
        )}
      </div>

      {/* Local Variants — vertical scroll */}
      <div className="flex-1 px-2 py-2 overflow-y-auto max-h-52 space-y-1.5" style={{ scrollbarWidth: "none" }}>
        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Local Variants</div>
        {variant.localVariants.map((lv, li) => (
          <LocalVariantRowUI
            key={li}
            row={lv}
            index={li}
            domId={`lv-${variant.id}-${li}`}
            onUpdate={(patch) => updateLV(li, patch)}
            onRemove={() => removeLV(li)}
            usedGeos={usedGeos.filter((_, i) => i !== li)}
          />
        ))}
      </div>

      <div className="px-2 pb-2">
        <button type="button" onClick={addLV}
          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 border border-dashed border-amber-300 rounded-lg text-[10px] text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-colors">
          <Plus className="w-3 h-3" />
          Add Local Variant
        </button>
      </div>
    </div>
  );
}

// ─── Subrange Card (collapsible) ──────────────────────────────────────────────
function SubrangeCard({
  subrange, subrangeIndex, globalVariantOffset, formatName, formatId, onUpdate, onRemove, canRemove,
}: {
  subrange: SubrangeEntry;
  subrangeIndex: number;
  globalVariantOffset: number;
  formatName: string;
  formatId: string;
  onUpdate: (patch: Partial<SubrangeEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const updateVariant = useCallback(
    (vi: number, patch: Partial<VariantEntry>) =>
      onUpdate({ variants: subrange.variants.map((v, i) => (i === vi ? { ...v, ...patch } : v)) }),
    [subrange.variants, onUpdate],
  );
  const removeVariant = useCallback(
    (vi: number) => {
      const next = subrange.variants.filter((_, i) => i !== vi);
      onUpdate({ variants: next.length > 0 ? next : [makeDefaultVariant()] });
    },
    [subrange.variants, onUpdate],
  );
  const addVariant = useCallback(() => onUpdate({ variants: [...subrange.variants, makeDefaultVariant()] }), [subrange.variants, onUpdate]);

  const parentName = [formatName, subrange.name].filter(Boolean).join(" ");
  const existingSubranges = getExistingSubranges(formatId);
  const existingVariants  = getExistingVariants(subrange.id);
  const isCollapsed = subrange.collapsed;

  return (
    <div className="border border-pebble rounded-xl bg-gray-50/70 overflow-hidden">
      {/* Subrange Header — click to collapse/expand */}
      <div
        className="px-3 py-2 border-b border-pebble bg-sky/5 flex items-center gap-2 cursor-pointer select-none hover:bg-sky/10 transition-colors"
        onClick={() => onUpdate({ collapsed: !isCollapsed })}
      >
        {/* Collapse chevron */}
        <div className="flex-shrink-0 text-gray-400">
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>

        <Blocks className="w-3.5 h-3.5 text-sky flex-shrink-0" />
        <span className="text-[10px] text-sky font-bold uppercase tracking-wider whitespace-nowrap">Sub {subrangeIndex + 1}</span>

        {/* Compact autocomplete — stop propagation so typing doesn't toggle collapse */}
        <div className="w-40" onClick={(e) => e.stopPropagation()}>
          <AutocompleteInput value={subrange.name} onChange={(v) => onUpdate({ name: v })}
            suggestions={existingSubranges} placeholder="Subrange name…" />
        </div>

        {/* Variant quick-nav pills for THIS subrange */}
        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
          {isCollapsed ? (
            <span className="text-[9px] font-bold bg-white border border-pebble text-gray-500 px-1.5 py-0.5 rounded-full">
              {subrange.variants.length}v
            </span>
          ) : (
            <VariantQuickNav variants={subrange.variants} globalOffset={globalVariantOffset} />
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canRemove && (
            <button type="button" onClick={onRemove} className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Variants — horizontal scroll, hidden when collapsed */}
      {!isCollapsed && (
        <div className="flex gap-3 p-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {subrange.variants.map((vt, vi) => (
            <VariantCard
              key={vt.id}
              variant={vt}
              variantIndex={vi}
              globalVariantIndex={globalVariantOffset + vi}
              parentName={parentName}
              onUpdate={(patch) => updateVariant(vi, patch)}
              onRemove={() => removeVariant(vi)}
              canRemove={subrange.variants.length > 1}
              existingVariantNames={existingVariants}
            />
          ))}
          <button type="button" onClick={addVariant}
            className="flex-shrink-0 w-28 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 text-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-1.5 self-stretch min-h-[80px]">
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Add Variant</span>
          </button>
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

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (formatDropRef.current && !formatDropRef.current.contains(e.target as Node)) setFormatDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Subranges State ──────────────────────────────────────────────────────
  const [subranges, setSubranges] = useState<SubrangeEntry[]>([makeDefaultSubrange()]);
  const updateSubrange = useCallback((si: number, patch: Partial<SubrangeEntry>) =>
    setSubranges((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s))), []);
  const removeSubrange = useCallback((si: number) =>
    setSubranges((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== si) : prev)), []);
  const addSubrange = useCallback(() =>
    setSubranges((prev) => [...prev, makeDefaultSubrange()]), []);

  // ── Cancel Confirmation ──────────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const handleClose = () => {
    const hasData = selectedFormatId || subranges.some((s) => s.name || s.variants.some((v) => v.name || v.localVariants.some((lv) => lv.geography)));
    if (hasData) { setShowCancelConfirm(true); } else { resetAndClose(); }
  };
  const resetAndClose = () => {
    setSelectedFormatId(""); setSubranges([makeDefaultSubrange()]); setShowCancelConfirm(false); onClose();
  };

  const handleCreateProduct = () => {
    if (!selectedFormat) return;
    subranges.forEach((sr) => {
      if (!sr.name) return;
      onCreate({
        name: `${selectedFormat.name} ${sr.name}`,
        levelName: sr.name,
        type: "Subrange",
        parentId: selectedFormat.id,
        parentName: selectedFormat.name,
        geographies: [],
        category: selectedFormat.category,
        businessGroup: selectedFormat.businessGroup,
        brand: selectedFormat.brand,
        createdBy: "Sarah Johnson",
        createdDate: new Date().toISOString().split("T")[0],
        isFavorite: false,
      });
    });
  };

  if (!isOpen) return null;

  const formatName = selectedFormat?.name ?? "";

  // Compute global variant offset per subrange for numbering
  const variantOffsets: number[] = [];
  let offset = 0;
  subranges.forEach((sr) => { variantOffsets.push(offset); offset += sr.variants.length; });

  return (
    <>
      <div className="fixed inset-0 top-[56px] z-40 flex flex-col bg-white overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-b border-pebble bg-white shadow-sm">
          {/* Row 1: Title + Format/BG/Category + Close */}
          <div className="px-5 py-3 flex items-end gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Layers className="w-5 h-5 text-sky" />
              <h2 className="text-night text-base font-bold whitespace-nowrap">Create New Product</h2>
            </div>

            {/* Format selector */}
            <div ref={formatDropRef} className="relative flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Format</span>
              <button type="button" onClick={() => setFormatDropOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all min-w-[160px] ${
                  selectedFormat ? "border-sky bg-sky/5 text-night font-semibold" : "border-dashed border-pebble text-gray-400 hover:border-sky/50"
                }`}>
                <Layers className="w-3.5 h-3.5 text-sky flex-shrink-0" />
                <span className="truncate flex-1">{selectedFormat ? selectedFormat.name : "Select Format"}</span>
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${formatDropOpen ? "rotate-180" : ""}`} />
              </button>
              {formatDropOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-50 w-72 max-h-52 overflow-y-auto py-1">
                  {FORMAT_OPTIONS.map((f) => (
                    <button key={f.id} type="button" onClick={() => { setSelectedFormatId(f.id); setFormatDropOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-earth transition-colors flex flex-col gap-0.5 ${selectedFormatId === f.id ? "bg-pale/60 text-sky font-semibold" : "text-night"}`}>
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] text-gray-400">{f.brand} · {f.levelName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Group */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Business Group</span>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${selectedFormat ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-pebble text-gray-300 italic text-xs"}`}>
                {selectedFormat ? selectedFormat.businessGroup : "Inherited"}
              </span>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Category</span>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${selectedFormat ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-gray-50 border-pebble text-gray-300 italic text-xs"}`}>
                {selectedFormat ? selectedFormat.category : "Inherited"}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {onSwitchToSearch && (
                <button onClick={onSwitchToSearch} className="px-3 py-1.5 border border-pebble text-sm text-gray-600 rounded-lg hover:bg-earth transition-colors">
                  Search Library
                </button>
              )}
              <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>


        </div>

        {/* ── Body: 70% workspace | 30% hierarchy ───────────────────────── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left: Creation Workspace */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-pebble" style={{ width: "70%" }}>
            {!selectedFormat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-300 p-8">
                <Layers className="w-12 h-12" />
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-400">Select a Format to begin</p>
                  <p className="text-sm mt-1 text-gray-400">Choose a format from the dropdown above, then build subranges, variants and local variants.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {subranges.map((sr, si) => (
                  <SubrangeCard
                    key={sr.id}
                    subrange={sr}
                    subrangeIndex={si}
                    globalVariantOffset={variantOffsets[si]}
                    formatName={formatName}
                    formatId={selectedFormatId}
                    onUpdate={(patch) => updateSubrange(si, patch)}
                    onRemove={() => removeSubrange(si)}
                    canRemove={subranges.length > 1}
                  />
                ))}
                <button type="button" onClick={addSubrange}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-sky/30 rounded-xl text-sm text-sky hover:bg-sky/5 hover:border-sky/60 transition-all">
                  <Plus className="w-4 h-4" />
                  Add Sub Range
                </button>
              </div>
            )}
          </div>

          {/* Right: Hierarchy View — 30% */}
          <div className="flex-shrink-0 flex flex-col bg-gray-50/50" style={{ width: "30%" }}>
            <div className="px-4 py-3 border-b border-pebble bg-white flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hierarchy Preview</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col px-3 py-2">
              <HierarchyView formatName={formatName} subranges={subranges} />
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-pebble bg-earth px-5 py-3 flex items-center justify-between gap-3">
          <button onClick={handleClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-white transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={onNavigateToSKU}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold transition-colors">
              <Tag className="w-4 h-4" />
              Create SKU
            </button>
            <button type="button" onClick={handleCreateProduct} disabled={!selectedFormat}
              className="flex items-center gap-2 px-5 py-2 bg-sky text-white rounded-lg text-sm font-semibold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Check className="w-4 h-4" />
              Create Product
            </button>
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-night font-bold">Discard changes?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">You have unsaved product details. Are you sure you want to close without saving?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors">Keep Editing</button>
              <button onClick={resetAndClose} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}