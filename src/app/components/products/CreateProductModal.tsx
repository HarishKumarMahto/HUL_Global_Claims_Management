import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Package,
  Compass,
  Search,
  Trash2,
} from "lucide-react";
import {
  ProductType,
  initialProducts,
  BRAND_SUGGESTIONS,
  getBrandClassification,
} from "./productData";
import { Project } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (products: any[], navigateNext?: boolean) => void;
  preselectedType?: ProductType;
  project?: Project;
  onSwitchToSearch?: () => void;
  onNavigateToSKU?: () => void;
  onBack?: () => void;
  initialData?: any[] | null;
}

type Flow = "rangeSubrange" | "formatVariant";

// The hierarchy levels that can be built in the creation form.
type NodeType = "Range" | "Subrange" | "Format" | "Variant" | "Local Product";

interface CreationNode {
  id: string;
  type: NodeType;
  name: string;          // levelName; for Local Product this is the geography
  geography?: string;    // Local Product only
  cucCode?: string;      // Local Product only
  children: CreationNode[];
}

// What each level may contain — drives every "Add X" button in both flows.
const CHILD_TYPES: Record<NodeType, NodeType[]> = {
  "Range": ["Subrange", "Format"],
  "Subrange": ["Format"],
  "Format": ["Variant", "Local Product"],
  "Variant": ["Local Product"],
  "Local Product": [],
};

// Creation-type options offered at the start of each flow.
const CREATION_TYPES: Record<Flow, NodeType[]> = {
  rangeSubrange: ["Range", "Subrange", "Format"],
  formatVariant: ["Format", "Variant"],
};

// What a new product can be parented to.
type ParentKind = "Brand" | "Range" | "Subrange" | "Format";

// Eligible parent kinds for a given creation level.
const parentKindsFor = (ct: NodeType | null): ParentKind[] => {
  if (ct === "Subrange") return ["Range", "Brand"];
  if (ct === "Format") return ["Subrange", "Range", "Brand"];
  if (ct === "Variant") return ["Format"];
  return ["Brand"]; // Range → Brand only
};

// Visual identity for each level.
const LEVEL_META: Record<NodeType, { Icon: typeof Layers; chip: string; dot: string; ring: string }> = {
  "Range": { Icon: Compass, chip: "bg-violet-100 text-violet-700", dot: "bg-violet-500", ring: "focus:ring-violet-400/40 focus:border-violet-400" },
  "Subrange": { Icon: Blocks, chip: "bg-sky-100 text-sky-700", dot: "bg-sky-500", ring: "focus:ring-sky/40 focus:border-sky" },
  "Format": { Icon: Package, chip: "bg-blue-100 text-blue-700", dot: "bg-blue-500", ring: "focus:ring-blue-400/40 focus:border-blue-400" },
  "Variant": { Icon: Beaker, chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", ring: "focus:ring-emerald-400/40 focus:border-emerald-400" },
  "Local Product": { Icon: Globe2, chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500", ring: "focus:ring-amber-400/40 focus:border-amber-400" },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_GEOGRAPHIES = [
  "Global", "EMEA", "North America", "LATAM", "APAC",
  "South Asia", "United Kingdom", "Germany", "France",
  "United States", "Brazil", "India", "China", "Japan", "Australia",
];

let _eid = 0;
const newId = () => `eid-${++_eid}`;

const makeNode = (type: NodeType, geography?: string): CreationNode => ({
  id: newId(),
  type,
  name: type === "Local Product" ? (geography ?? "") : "",
  geography: type === "Local Product" ? geography : undefined,
  cucCode: "",
  children: [],
});

const getCompoundName = (...parts: (string | undefined | null)[]) =>
  parts.filter(Boolean).map((p) => (p as string).trim()).filter(Boolean).join(" ");

// Distinct existing levelNames for autocomplete suggestions.
const suggestionsFor = (type: ProductType): string[] =>
  Array.from(new Set(initialProducts.filter((p) => p.type === type).map((p) => p.levelName))).sort();

// Existing catalog products of a given type (used for parent/anchor dropdowns).
interface CatalogRef {
  id: string;
  name: string;
  type: ProductType;
  brand: string;
  businessGroup: string;
  category: string;
}
const catalogByType = (type: ProductType): CatalogRef[] =>
  initialProducts
    .filter((p) => p.type === type)
    .map((p) => ({ id: p.id, name: p.name, type: p.type, brand: p.brand, businessGroup: p.businessGroup, category: p.category }));

// ─── Immutable tree helpers ─────────────────────────────────────────────────────
const updateNodeById = (nodes: CreationNode[], id: string, fn: (n: CreationNode) => CreationNode): CreationNode[] =>
  nodes.map((n) => (n.id === id ? fn(n) : { ...n, children: updateNodeById(n.children, id, fn) }));

const removeNodeById = (nodes: CreationNode[], id: string): CreationNode[] =>
  nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: removeNodeById(n.children, id) }));

const findNode = (nodes: CreationNode[], id: string): CreationNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    const f = findNode(n.children, id);
    if (f) return f;
  }
  return null;
};

const hasNamedContent = (nodes: CreationNode[]): boolean =>
  nodes.some((n) => (n.type === "Local Product" ? !!n.geography : !!n.name.trim()) || hasNamedContent(n.children));

// ─── AutocompleteInput ────────────────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, suggestions, placeholder, className = "", ringClass = "focus:border-sky focus:ring-sky/20",
}: { value: string; onChange: (v: string) => void; suggestions: string[]; placeholder?: string; className?: string; ringClass?: string }) {
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
          className={`w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 text-night placeholder:text-gray-400 placeholder:font-normal transition-all ${ringClass}`}
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

// ─── GeoAddDropdown — pick a geography to add it as a Local Product (1 per row) ──
// The menu is rendered with fixed positioning so it escapes the `overflow-hidden`
// cards and the horizontal `overflow-x-auto` variant row that would otherwise clip it.
function GeoAddDropdown({ usedGeos, onAdd, asCard = false }: { usedGeos: string[]; onAdd: (geo: string) => void; asCard?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const available = ALL_GEOGRAPHIES.filter(
    (g) => !usedGeos.includes(g) && g.toLowerCase().includes(query.toLowerCase())
  );
  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 180) });
  };
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onScrollOrResize = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return; // ignore the menu's own list scroll
      place();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);
  if (usedGeos.length >= ALL_GEOGRAPHIES.length) return null;
  return (
    <>
      <button ref={btnRef} type="button" onClick={() => { if (open) { setOpen(false); } else { place(); setOpen(true); } }}
        className={asCard
          ? "flex-shrink-0 w-[150px] border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-1.5 p-3 text-gray-400 hover:text-night hover:bg-gray-50 transition-all bg-white cursor-pointer"
          : "w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all bg-white cursor-pointer"}>
        {asCard ? (
          <>
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-bold">Add Local Product</span>
          </>
        ) : (
          <>
            <Globe2 className="w-3 h-3 flex-shrink-0" />
            <span className="flex-1 text-left">Add Local Product</span>
            <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>
      {open && pos && (
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 200 }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl py-1">
          <div className="px-2 pb-1">
            <div className="relative flex items-center">
              <Search className="absolute left-2 w-3 h-3 text-gray-400 pointer-events-none" />
              <input type="text" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search geographies…"
                className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-sky/20 text-night placeholder:text-gray-400" />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto no-scrollbar">
            {available.length === 0 ? (
              <div className="px-3 py-2 text-[10px] text-gray-400 italic text-center">No geographies left</div>
            ) : (
              available.map((g) => (
                <button key={g} type="button" onClick={() => { onAdd(g); setQuery(""); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors text-night font-medium cursor-pointer">
                  {g}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── CatalogSelect — searchable dropdown to pick an existing product as a parent ──
function CatalogSelect({
  options, value, onChange, placeholder,
}: { options: CatalogRef[]; value: CatalogRef | null; onChange: (ref: CatalogRef) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative w-56">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${value ? "border-gray-300 bg-white text-night font-semibold" : "border-dashed border-gray-300 text-gray-400 font-medium hover:border-gray-400"}`}>
        <Search className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{value ? value.name : placeholder}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-72 py-1">
          <div className="px-2 pb-1">
            <div className="relative flex items-center">
              <Search className="absolute left-2 w-3 h-3 text-gray-400 pointer-events-none" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
                className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-sky/20 text-night placeholder:text-gray-400" />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto no-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[10px] text-gray-400 italic text-center">No matches</div>
            ) : (
              filtered.map((o) => (
                <button key={o.id} type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex flex-col gap-0.5 ${value?.id === o.id ? "bg-sky/5 text-sky font-semibold" : "text-night font-medium"}`}>
                  <span className="truncate text-xs">{o.name}</span>
                  <span className="text-[10px] text-gray-400">{o.brand} · {o.category}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hierarchy preview ──────────────────────────────────────────────────────────
function PreviewNode({ node, depth }: { node: CreationNode; depth: number }) {
  const meta = LEVEL_META[node.type];
  const label = node.type === "Local Product" ? (node.geography || "Geography") : (node.name.trim() || node.type);
  return (
    <div className={depth > 0 ? "ml-3 pl-3 border-l-2 border-gray-100" : ""}>
      <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-gray-50">
        <div className="flex items-center gap-1.5 min-w-0">
          <meta.Icon className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
          <span className="font-semibold text-night truncate text-[11px]">{label}</span>
        </div>
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ml-1 flex-shrink-0 ${meta.chip}`}>{node.type}</span>
      </div>
      {node.children.length > 0 && (
        <div className="space-y-0.5 mt-0.5">
          {node.children.map((c) => <PreviewNode key={c.id} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

function HierarchyPreview({ roots }: { roots: CreationNode[] }) {
  if (!hasNamedContent(roots)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-6 text-gray-400 px-3">
        <Layers className="w-7 h-7 text-gray-300" />
        <p className="text-[10px] leading-relaxed text-gray-400">Hierarchy preview appears here as you fill in details</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar text-[11px] space-y-1 py-1">
      {roots.map((r) => <PreviewNode key={r.id} node={r} depth={0} />)}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CreateProductModal({
  isOpen, onClose, onCreate, onSwitchToSearch, onNavigateToSKU, onBack, initialData,
}: CreateProductModalProps) {
  // ── Flow & selection state ────────────────────────────────────────────────
  const [flow, setFlow] = useState<Flow | null>(null);

  // Which level the user is creating, what it's parented to, and the brand.
  const [creationType, setCreationType] = useState<NodeType | null>(null); // Range | Subrange | Format | Variant
  const [parentKind, setParentKind] = useState<ParentKind>("Brand");
  const [parentRef, setParentRef] = useState<CatalogRef | null>(null); // chosen parent product when kind != Brand
  const [brand, setBrand] = useState("");

  // Shared
  const [roots, setRoots] = useState<CreationNode[]>([]);
  // Discard confirmation: "close" exits the modal, "back" returns to the flow gate.
  const [discardTarget, setDiscardTarget] = useState<"close" | "back" | null>(null);

  const parentDropRef = useRef<HTMLDivElement>(null);
  const [parentDropOpen, setParentDropOpen] = useState(false);

  // ── Reset everything ──────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    setFlow(null);
    setCreationType(null);
    setParentKind("Brand");
    setParentRef(null);
    setBrand("");
    setRoots([]);
  }, []);

  // ── Rehydrate from chained product data ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (!initialData || initialData.length === 0) { resetState(); return; }
    try {
      const byId = new Map<string, any>();
      initialData.forEach((it) => byId.set(it.id, it));
      const childrenOf = (pid: string | null) => initialData.filter((it) => it.parentId === pid);

      const build = (item: any): CreationNode => ({
        id: item.id || newId(),
        type: item.type,
        name: item.type === "Local Product" ? (item.geographies?.[0] || item.levelName || "") : (item.levelName || ""),
        geography: item.type === "Local Product" ? (item.geographies?.[0] || item.levelName) : undefined,
        cucCode: item.cucSpecNumber || "",
        children: childrenOf(item.id).map(build),
      });

      // Roots are items whose parent is not part of the stashed set.
      const rootItems = initialData.filter((it) => !it.parentId || !byId.has(it.parentId));
      if (rootItems.length === 0) { resetState(); return; }

      resetState();
      const ct = (rootItems[0]?.type ?? "Format") as NodeType;
      // Variant is the lower (Format & Variant) flow; everything else starts in the upper flow.
      setFlow(ct === "Variant" ? "formatVariant" : "rangeSubrange");
      setCreationType(ct);

      const firstParentId = rootItems[0]?.parentId;
      const parentProduct = firstParentId ? initialProducts.find((p) => p.id === firstParentId) : undefined;
      if (parentProduct && ["Range", "Subrange", "Format"].includes(parentProduct.type)) {
        setParentKind(parentProduct.type as ParentKind);
        setParentRef({ id: parentProduct.id, name: parentProduct.name, type: parentProduct.type, brand: parentProduct.brand, businessGroup: parentProduct.businessGroup, category: parentProduct.category });
      } else {
        setParentKind("Brand");
        setBrand(rootItems[0]?.brand || "");
      }
      setRoots(rootItems.filter((r) => r.type === ct).map(build));
    } catch {
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // ── Close on outside click for dropdowns ────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (parentDropRef.current && !parentDropRef.current.contains(e.target as Node)) setParentDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Derived brand / BG / category ───────────────────────────────────────────
  const effective = useMemo(() => {
    if (parentKind !== "Brand" && parentRef) {
      return { brand: parentRef.brand, businessGroup: parentRef.businessGroup, category: parentRef.category, brandFromCatalog: true };
    }
    if (brand.trim()) {
      const cls = getBrandClassification(brand);
      return { brand: brand.trim(), businessGroup: cls.businessGroup, category: cls.category, brandFromCatalog: false };
    }
    return { brand: "", businessGroup: "", category: "", brandFromCatalog: false };
  }, [parentKind, parentRef, brand]);

  // ── Parent-kind options for the chosen creation type ─────────────────────────
  const parentKindOptions = useMemo<ParentKind[]>(() => parentKindsFor(creationType), [creationType]);

  // Existing catalog products for the currently selected parent kind.
  const parentValueOptions = useMemo<CatalogRef[]>(
    () => (parentKind === "Brand" ? [] : catalogByType(parentKind)),
    [parentKind],
  );

  // ── Tree ops ────────────────────────────────────────────────────────────────
  const addRoot = useCallback((type: NodeType) => setRoots((r) => [...r, makeNode(type)]), []);
  const addChild = useCallback((nodeId: string, type: NodeType) => {
    setRoots((r) => updateNodeById(r, nodeId, (n) => ({ ...n, children: [...n.children, makeNode(type)] })));
  }, []);
  const updateName = useCallback((nodeId: string, name: string) => {
    setRoots((r) => updateNodeById(r, nodeId, (n) => ({ ...n, name })));
  }, []);
  const updateCuc = useCallback((nodeId: string, cucCode: string) => {
    setRoots((r) => updateNodeById(r, nodeId, (n) => ({ ...n, cucCode })));
  }, []);
  const removeNode = useCallback((nodeId: string) => {
    setRoots((r) => removeNodeById(r, nodeId));
  }, []);
  // Add one Local Product (one geography) under the target node, or at root (Flow B).
  const addLocalProduct = useCallback((target: string | "__root__", geo: string) => {
    setRoots((r) => {
      const lp = makeNode("Local Product", geo);
      if (target === "__root__") return [...r, lp];
      return updateNodeById(r, target, (n) => ({ ...n, children: [...n.children, lp] }));
    });
  }, []);

  const usedGeosFor = (target: string | "__root__"): string[] => {
    const list = target === "__root__" ? roots : (findNode(roots, target)?.children ?? []);
    return list.filter((n) => n.type === "Local Product").map((n) => n.geography || n.name);
  };

  // ── Build product list ──────────────────────────────────────────────────────
  const buildListToCreate = (): any[] => {
    const out: any[] = [];
    const now = new Date().toISOString().split("T")[0];
    const { brand: bd, businessGroup: bg, category: cat } = effective;
    if (!bd) return out;

    const walk = (node: CreationNode, parentId: string | null, parentName: string) => {
      const levelName = node.type === "Local Product" ? (node.geography || node.name) : node.name.trim();
      if (!levelName) return;
      const id = `prod-${node.type.toLowerCase().replace(/\s/g, "")}-${newId()}`;
      const name = getCompoundName(parentName, levelName);
      out.push({
        id, name, levelName, type: node.type,
        parentId, parentName: parentName || null,
        geographies: node.type === "Local Product" ? [node.geography || node.name] : [],
        cucSpecNumber: node.type === "Local Product" ? node.cucCode : undefined,
        category: cat, businessGroup: bg, brand: bd,
        createdBy: "Sarah Johnson", createdDate: now, isFavorite: false,
      });
      node.children.forEach((c) => walk(c, id, name));
    };

    let rootParentId: string | null;
    let rootParentName: string;
    if (parentKind !== "Brand" && parentRef) {
      rootParentId = parentRef.id;
      rootParentName = parentRef.name;
    } else {
      rootParentId = null;
      rootParentName = bd; // Brand-level: compound names start with the brand
    }

    roots.forEach((r) => walk(r, rootParentId, rootParentName));
    return out;
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  // "Has data" = something worth confirming before discarding (not just an empty seeded node).
  const hasData = !!flow && (hasNamedContent(roots) || !!brand.trim() || !!parentRef);
  const isValid = (() => {
    if (!effective.brand) return false;
    return hasNamedContent(roots);
  })();

  // ── Close / discard handlers ─────────────────────────────────────────────────
  // Exit the whole modal (X / footer).
  const handleClose = () => {
    if (hasData) setDiscardTarget("close"); else resetAndClose();
  };
  // Go back to the two-flow gate, confirming first if there's unsaved data.
  const handleBackToGate = () => {
    if (hasData) setDiscardTarget("back"); else resetState();
  };
  const resetAndClose = () => {
    resetState();
    setDiscardTarget(null);
    onClose();
  };
  const handleConfirmDiscard = () => {
    if (discardTarget === "back") {
      resetState();
      setDiscardTarget(null);
    } else {
      resetAndClose();
    }
  };
  const handleNavigateToSKU = () => {
    if (!onNavigateToSKU) return;
    resetAndClose();
    onNavigateToSKU();
  };
  const handleCreateProduct = () => {
    const list = buildListToCreate();
    if (list.length > 0) onCreate(list, false);
    resetAndClose();
  };
  const handleAddAndCreateClaim = () => {
    const list = buildListToCreate();
    if (list.length > 0) {
      window.dispatchEvent(new CustomEvent("stashChainedProduct", { detail: { products: list } }));
    }
    handleClose();
    window.dispatchEvent(new CustomEvent("openClaimCreation"));
  };

  // ── Pick a creation type (level to build) ────────────────────────────────────
  const pickCreationType = (type: NodeType) => {
    const kinds = parentKindsFor(type);
    setCreationType(type);
    setParentKind(kinds.includes("Brand") ? "Brand" : kinds[0]); // Variant → Format; others → Brand
    setParentRef(null);
    setBrand("");
    setRoots([makeNode(type)]);
  };

  if (!isOpen) return null;

  // ─── Render helpers: recursive node editor ─────────────────────────────────
  const renderLocalProductRow = (node: CreationNode) => (
    <div key={node.id} className="w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
      <Globe2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <span className="text-[11px] font-semibold text-night truncate flex-1">{node.geography}</span>
      <input type="text" value={node.cucCode || ""} onChange={(e) => updateCuc(node.id, e.target.value)}
        placeholder="CUC code"
        className="w-20 px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-sky/20 text-night placeholder:text-gray-400" />
      <button type="button" onClick={() => removeNode(node.id)}
        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  // Local Products under a parent: one geography per row + an inline geo picker.
  const renderLocalProductSection = (target: string | "__root__", localProducts: CreationNode[]) => (
    <div className="space-y-1.5">
      {localProducts.map(renderLocalProductRow)}
      <GeoAddDropdown usedGeos={usedGeosFor(target)} onAdd={(geo) => addLocalProduct(target, geo)} />
    </div>
  );

  // A Variant is a compact, fixed-width card so siblings sit side-by-side.
  const renderVariantCard = (node: CreationNode) => {
    const localProducts = node.children.filter((c) => c.type === "Local Product");
    return (
      <div key={node.id} className="flex-shrink-0 w-[240px] border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden animate-fadeIn">
        <div className="flex items-center gap-1.5 px-2.5 py-2 bg-gray-50 border-b border-gray-100">
          <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0">
            <Beaker className="w-2.5 h-2.5" /> Variant
          </span>
          <AutocompleteInput value={node.name} onChange={(v) => updateName(node.id, v)}
            suggestions={suggestionsFor("Variant")} placeholder="Variant name…" ringClass={LEVEL_META.Variant.ring} className="flex-1" />
          <button type="button" onClick={() => removeNode(node.id)}
            className="p-1 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 p-2.5">
          {renderLocalProductSection(node.id, localProducts)}
        </div>
      </div>
    );
  };

  // Renders the child area for a node (or the anchor's roots in Flow B).
  const renderChildrenArea = (target: string | "__root__", childTypes: NodeType[], children: CreationNode[]) => {
    const subranges = children.filter((c) => c.type === "Subrange");
    const formats = children.filter((c) => c.type === "Format");
    const variants = children.filter((c) => c.type === "Variant");
    const localProducts = children.filter((c) => c.type === "Local Product");
    const addChildOf = (ct: NodeType) => (target === "__root__" ? addRoot(ct) : addChild(target, ct));
    return (
      <div className="space-y-2.5">
        {/* Subrange children stack vertically */}
        {subranges.map((c) => renderNode(c, 1))}
        {childTypes.includes("Subrange") && (
          <button type="button" onClick={() => addChildOf("Subrange")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all bg-white cursor-pointer text-gray-600">
            <Plus className="w-2.5 h-2.5" /> Add Subrange
          </button>
        )}

        {/* Format children sit side-by-side, with Add Format inline */}
        {childTypes.includes("Format") && (
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {formats.map((c) => (
              <div key={c.id} className="flex-shrink-0">{renderNode(c, 1)}</div>
            ))}
            <button type="button" onClick={() => addChildOf("Format")}
              className="flex-shrink-0 w-[150px] border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center gap-1.5 text-gray-400 hover:text-night hover:bg-gray-50 transition-all bg-white cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-bold">Add Format</span>
            </button>
          </div>
        )}

        {/* Format level: Variant cards + Add Variant + Add Local Product, all side by side.
            No inner scroll — the Format box grows to fit. Direct Local Products list below. */}
        {childTypes.includes("Variant") && (
          <>
            <div className="flex items-stretch gap-3 pb-1">
              {variants.map(renderVariantCard)}
              <button type="button" onClick={() => addChildOf("Variant")}
                className="flex-shrink-0 w-[150px] border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center gap-1.5 text-gray-400 hover:text-night hover:bg-gray-50 transition-all bg-white cursor-pointer">
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-bold">Add Variant</span>
              </button>
              {childTypes.includes("Local Product") && (
                <GeoAddDropdown asCard usedGeos={usedGeosFor(target)} onAdd={(geo) => addLocalProduct(target, geo)} />
              )}
            </div>
            {localProducts.length > 0 && (
              <div className="space-y-1.5">{localProducts.map(renderLocalProductRow)}</div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderNode = (node: CreationNode, _depth: number) => {
    const meta = LEVEL_META[node.type];
    const childTypes = CHILD_TYPES[node.type];
    // A Format box grows with its variants (content width) instead of scrolling internally.
    const isFormat = node.type === "Format";
    return (
      <div key={node.id} className={`animate-fadeIn border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden ${isFormat ? "w-fit min-w-[440px]" : ""}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
          <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 text-gray-600 flex-shrink-0">
            <meta.Icon className="w-3 h-3" /> {node.type}
          </span>
          <AutocompleteInput
            value={node.name}
            onChange={(v) => updateName(node.id, v)}
            suggestions={suggestionsFor(node.type as ProductType)}
            placeholder={`${node.type} name…`}
            ringClass={meta.ring}
            className="flex-1"
          />
          <button type="button" onClick={() => removeNode(node.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        {childTypes.length > 0 && (
          <div className="p-3">
            {renderChildrenArea(node.id, childTypes, node.children)}
          </div>
        )}
      </div>
    );
  };

  // ─── Render: workspace (shared by both flows) ───────────────────────────────
  const renderFlowWorkspace = () => {
    if (!flow) return null;
    // Creation-type gate — plain buttons, top-left (e.g. Add Range / Subrange / Format, or Add Format / Variant).
    if (!creationType) {
      return (
        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-center gap-1">
            {CREATION_TYPES[flow].map((t) => (
              <button key={t} type="button" onClick={() => pickCreationType(t)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-sky hover:bg-sky/5 transition-all cursor-pointer">
                {/* <Plus className="w-4 h-4" /> Add {t} */}
                 Add {t}
              </button>
            ))}
          </div>
        </div>
      );
    }
    // Variant roots → horizontal variant cards.
    if (creationType === "Variant") {
      return (
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {roots.map(renderVariantCard)}
            <button type="button" onClick={() => addRoot("Variant")}
              className="flex-shrink-0 w-[150px] border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center gap-1.5 text-gray-400 hover:text-night hover:bg-gray-50 transition-all bg-white cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-bold">Add Variant</span>
            </button>
          </div>
        </div>
      );
    }
    // Format roots → horizontal Format cards (Range & Subrange flow only; vertical in Format & Variant).
    if (creationType === "Format" && flow === "rangeSubrange") {
      return (
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {roots.map((r) => (
              <div key={r.id} className="flex-shrink-0">{renderNode(r, 0)}</div>
            ))}
            <button type="button" onClick={() => addRoot("Format")}
              className="flex-shrink-0 w-[150px] border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center gap-1.5 text-gray-400 hover:text-night hover:bg-gray-50 transition-all bg-white cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-bold">Add Format</span>
            </button>
          </div>
        </div>
      );
    }
    // Range / Subrange roots → vertical stack.
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {roots.map((r) => renderNode(r, 0))}
        <button type="button" onClick={() => addRoot(creationType)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-sky hover:bg-sky/5 transition-all bg-white cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add another {creationType}
        </button>
      </div>
    );
  };

  // ─── Breadcrumb levels per flow ─────────────────────────────────────────────
  const breadcrumbLevels: NodeType[] = flow === "rangeSubrange"
    ? ["Range", "Subrange", "Format", "Variant", "Local Product"]
    : ["Format", "Variant", "Local Product"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        .cpmodal * { font-family: 'DM Sans', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeInUp 0.15s ease-out; }
      `}</style>

      <div className="cpmodal fixed inset-0 top-[56px] z-45 flex flex-col bg-white overflow-hidden text-night">

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="px-5 py-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Layers className="w-4 h-4 text-sky" />
              <h2 className="text-night text-sm font-extrabold">Create New Product</h2>
            </div>

            {flow && (
              <>
                {/* Parent selector (both flows) */}
                {creationType && (
                  <>
                    {/* Parent: kind dropdown (only when there's a choice) + value selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Parent</span>
                      {parentKindOptions.length > 1 ? (
                        <div ref={parentDropRef} className="relative">
                          <button type="button" onClick={() => setParentDropOpen((o) => !o)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-night min-w-[110px] transition-all hover:border-gray-400">
                            <span className="truncate flex-1 text-left">{parentKind}</span>
                            <ChevronDown className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${parentDropOpen ? "rotate-180" : ""}`} />
                          </button>
                          {parentDropOpen && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 py-1">
                              {parentKindOptions.map((k) => (
                                <button key={k} type="button" onClick={() => { setParentKind(k); setParentRef(null); setParentDropOpen(false); }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${parentKind === k ? "bg-sky/5 text-sky font-semibold" : "text-night font-medium"}`}>
                                  {k}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{parentKind}</span>
                      )}
                      {parentKind === "Brand" ? (
                        <div className="w-48">
                          <AutocompleteInput value={brand} onChange={setBrand} suggestions={BRAND_SUGGESTIONS} placeholder="Select brand…" />
                        </div>
                      ) : (
                        <CatalogSelect options={parentValueOptions} value={parentRef} onChange={setParentRef} placeholder={`Select ${parentKind}…`} />
                      )}
                    </div>
                  </>
                )}

                {/* Brand auto-derived when parenting under an existing product */}
                {parentKind !== "Brand" && effective.brand && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Brand</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{effective.brand}</span>
                  </div>
                )}

                {/* Auto-fetched BG & Category */}
                {effective.businessGroup && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">BG</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{effective.businessGroup}</span>
                  </div>
                )}
                {effective.category && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cat</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-50 border-gray-200 text-night">{effective.category}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {/* Level breadcrumb — sits on the right of the top bar, above the Hierarchy Preview */}
              {flow && (
                <div className="hidden lg:flex items-center gap-1 mr-1">
                  {breadcrumbLevels.map((lvl, i) => (
                    <div key={lvl} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${LEVEL_META[lvl].dot} flex-shrink-0`} />
                        <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap">{lvl}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {onSwitchToSearch && (
                <button onClick={onSwitchToSearch} className="px-3 py-1.5 border border-gray-200 text-xs text-gray-500 hover:text-night hover:bg-gray-50 rounded-lg transition-all font-bold bg-white cursor-pointer">
                  Search Library
                </button>
              )}
              <button onClick={handleClose} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-night transition-colors border border-gray-200 bg-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50/30">
          {/* Left workspace */}
          <div className="flex flex-col overflow-hidden border-r border-gray-200" style={{ width: "70%" }}>
            {!flow ? (
              /* Flow gate — two dotted-box cards */
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <div className="text-center space-y-1">
                  <p className="text-base font-extrabold text-night">How do you want to build this product?</p>
                </div>
                <div className="flex items-stretch gap-5">
                  <button type="button" onClick={() => { resetState(); setFlow("rangeSubrange"); }}
                    className="w-64 flex items-center justify-center px-6 py-10 border-2 border-dashed border-gray-300 hover:border-violet-400 rounded-3xl text-gray-700 hover:text-violet-600 hover:bg-violet-50/40 transition-all bg-white cursor-pointer">
                    <span className="text-sm font-extrabold">Range &amp; Subrange</span>
                  </button>
                  <button type="button" onClick={() => { resetState(); setFlow("formatVariant"); }}
                    className="w-64 flex items-center justify-center px-6 py-10 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-3xl text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/40 transition-all bg-white cursor-pointer">
                    <span className="text-sm font-extrabold">Format &amp; Variant</span>
                  </button>
                </div>
              </div>
            ) : (
              renderFlowWorkspace()
            )}
          </div>

          {/* Right: hierarchy preview */}
          <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-extrabold text-night uppercase tracking-wider">Hierarchy Preview</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col px-3 py-2 bg-white">
              <HierarchyPreview roots={roots} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-between">
          <div>
            {flow ? (
              <button type="button" onClick={handleBackToGate}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer">
                Back
              </button>
            ) : onBack ? (
              <button type="button" onClick={onBack}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer">
                Back
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCreateProduct} disabled={!isValid}
              className="px-4 py-2 border border-gray-200 text-night hover:bg-gray-50 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              Create Product
            </button>
            {onNavigateToSKU && (
              <button type="button" onClick={handleNavigateToSKU}
                className="px-4 py-2 bg-white text-sky border border-sky rounded-xl text-xs font-bold hover:bg-sky/5 transition-all cursor-pointer">
                Create SKU
              </button>
            )}
            <button type="button" onClick={handleAddAndCreateClaim} disabled={!isValid}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky text-white rounded-xl text-xs font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 cursor-pointer">
              <Check className="w-3.5 h-3.5" />
              Add and Create Claim
            </button>
          </div>
        </div>
      </div>

      {/* Discard Confirmation */}
      {discardTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-night font-bold text-sm">Discard changes?</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              You have unsaved product details. Are you sure you want to {discardTarget === "back" ? "go back" : "close"} without saving?
            </p>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setDiscardTarget(null)}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white">
                Keep Editing
              </button>
              <button onClick={handleConfirmDiscard}
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
