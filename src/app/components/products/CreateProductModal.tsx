import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  FlaskConical,
  Layers,
  Blocks,
  Beaker,
  Globe2,
  Tag,
  Check,
  AlertCircle,
  Upload,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  ProductType,
  ProductItem,
  PRODUCT_TYPE_META,
  initialProducts,
  getLifecycleBadgeStyle,
} from "./productData";
import { BUSINESS_GROUPS, CATEGORIES, Project } from "../../types";
import AdvancedProductSearch, {
  AdvancedSearchTrigger,
} from "./AdvancedProductSearch";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    product: Omit<
      ProductItem,
      | "id"
      | "productId"
      | "lifecycleState"
      | "childCount"
      | "claimsCount"
      | "projectsCount"
      | "geographyCount"
      | "lastModified"
    >,
  ) => void;
  preselectedType?: ProductType;
  project?: Project;
}

const TYPE_ICONS: Record<ProductType, React.ReactNode> = {
  Technology: <FlaskConical className="w-7 h-7" />,
  Format: <Layers className="w-7 h-7" />,
  Subrange: <Blocks className="w-7 h-7" />,
  Variant: <Beaker className="w-7 h-7" />,
  "Local Variant": <Globe2 className="w-7 h-7" />,
  SKU: <Tag className="w-7 h-7" />,
};

const TYPE_ORDER: ProductType[] = [
  "Technology",
  "Format",
  "Subrange",
  "Variant",
  "Local Variant",
  "SKU",
];

const REGIONS = [
  "Global",
  "EMEA",
  "North America",
  "LATAM",
  "APAC",
  "South Asia",
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

const TIERS = ["Core", "Standard", "Premium", "Super Premium"];
const AUDIENCES = [
  "Adults 18–25",
  "Adults 25–45",
  "Adults 25–55",
  "Adults 25–60",
  "Women 20–45",
  "Men 18–35",
  "Families",
  "Sensitive skin 25–55",
];

const BRAND_MAPPINGS: Record<string, { businessGroup: string; category: string }> = {
  'dove': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'tresemmé': { businessGroup: 'Beauty & Wellbeing', category: 'Hair Care' },
  'tresemme': { businessGroup: 'Beauty & Wellbeing', category: 'Hair Care' },
  'persil': { businessGroup: 'Home Care', category: 'Fabric Care' },
  'hellmann\'s': { businessGroup: 'Foods', category: 'Condiments' },
  'hellmanns': { businessGroup: 'Foods', category: 'Condiments' },
  'lynx': { businessGroup: 'Personal Care', category: 'Deodorants' },
  'domestos': { businessGroup: 'Home Care', category: 'Home Hygiene' },
  'magnum': { businessGroup: 'Foods', category: 'Ice Cream' },
  'vaseline': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'lipton': { businessGroup: 'Foods', category: 'Tea & Beverages' },
  'comfort': { businessGroup: 'Home Care', category: 'Fabric Care' },
  'simple': { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' },
  'knorr': { businessGroup: 'Foods', category: 'Nutrition' },
};

const getAudiencesByBG = (bg: string | undefined): string[] => {
  switch (bg) {
    case "Beauty & Wellbeing":
      return [
        "Women 20–45",
        "Sensitive skin 25–55",
        "Adults 25–45",
        "Adults 18–25",
        "Mature skin 45+",
        "Teenagers (Acne-prone)"
      ];
    case "Home Care":
      return [
        "Families",
        "Eco-conscious households",
        "Pet owners",
        "Young professionals",
        "All-purpose households"
      ];
    case "Personal Care":
      return [
        "Adults 25–55",
        "Men 18–35",
        "Adults 25–60",
        "Active sports enthusiasts",
        "Families with kids"
      ];
    case "Foods":
      return [
        "Families",
        "Home cooks",
        "Health-conscious individuals",
        "Vegans & Vegetarians",
        "Gourmet food lovers"
      ];
    case "One UL":
      return [
        "Universal audience",
        "All consumers"
      ];
    default:
      return [
        "Adults 18–25",
        "Adults 25–45",
        "Adults 25–55",
        "Adults 25–60",
        "Women 20–45",
        "Men 18–35",
        "Families",
        "Sensitive skin 25–55"
      ];
  }
};
const CBPs = [
  "Intensive Moisturisation",
  "Deep Hydration",
  "Stain Removal",
  "Gentle Care",
  "Frizz Control",
  "Colour Protection",
  "Daily Nourishment",
];

type LVRow = { geography: string; cucCode: string };
type VariantEntry = {
  name: string;
  lvRows: LVRow[];
};

type RowValidationMap = Record<string, "idle" | "valid" | "invalid">;

const CUC_PATTERN = /^CUC-[A-Z0-9]+-[A-Z0-9]+-[A-Z]{2}-\d{3}$/;

type HierarchyField = { label: string; val: string };

const getInheritedHierarchy = (
  type: ProductType,
  parent: ProductItem,
): HierarchyField[] => {
  const fields: HierarchyField[] = [];

  const findById = (id: string | null | undefined) =>
    id ? (initialProducts.find((p) => p.id === id) ?? null) : null;

  const push = (label: string, val: string | null | undefined) => {
    if (val) fields.push({ label, val });
  };

  push("Business Group", parent.businessGroup);
  push("Category", parent.category);
  push("Brand", parent.brand);

  if (type === "Subrange") {
    push("Format", parent.levelName ?? parent.name);
  }

  if (type === "Variant") {
    if (parent.type === "Format") {
      push("Format", parent.levelName ?? parent.name);
    } else if (parent.type === "Subrange") {
      const format = findById(parent.parentId);
      push("Format", format?.levelName ?? format?.name ?? parent.parentName);
      push("Subrange", parent.levelName ?? parent.name);
    }
    push("Technology 1", parent.technology1);
    push("Technology 2", parent.technology2);
  }

  if (type === "Local Variant") {
    const subrangeOrFormat = findById(parent.parentId);
    if (subrangeOrFormat) {
      if (subrangeOrFormat.type === "Subrange") {
        const format = findById(subrangeOrFormat.parentId);
        push(
          "Format",
          format?.levelName ?? format?.name ?? subrangeOrFormat.parentName,
        );
        push("Subrange", subrangeOrFormat.levelName ?? subrangeOrFormat.name);
      } else {
        push("Format", subrangeOrFormat.levelName ?? subrangeOrFormat.name);
      }
    } else if (parent.parentName) {
      push("Format / Subrange", parent.parentName);
    }
    push("Variant", parent.levelName ?? parent.name);
    push("Technology 1", parent.technology1);
    push("Technology 2", parent.technology2);
  }

  if (type === "SKU") {
    const variant = findById(parent.parentId);
    if (variant) {
      const subrangeOrFormat = findById(variant.parentId);
      if (subrangeOrFormat) {
        if (subrangeOrFormat.type === "Subrange") {
          const format = findById(subrangeOrFormat.parentId);
          push(
            "Format",
            format?.levelName ?? format?.name ?? subrangeOrFormat.parentName,
          );
          push("Subrange", subrangeOrFormat.levelName ?? subrangeOrFormat.name);
        } else {
          push("Format", subrangeOrFormat.levelName ?? subrangeOrFormat.name);
        }
      } else if (variant.parentName) {
        push("Format / Subrange", variant.parentName);
      }
      push("Variant", variant.levelName ?? variant.name);
      push("Technology 1", variant.technology1);
      push("Technology 2", variant.technology2);
    } else if (parent.parentName) {
      push("Variant", parent.parentName);
    }
    push("Local Variant (CUC)", parent.levelName ?? parent.name);
    const geo = parent.geographies?.join(", ");
    push("Geography", geo);
  }

  return fields.filter((f) => f.val);
};

const InheritedHierarchyPanel = ({ fields }: { fields: HierarchyField[] }) => {
  if (fields.length === 0) return null;
  return (
    <div className="bg-earth rounded-xl p-4 border border-pebble">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Inherited from Parent (read-only)
      </div>
      <div className="grid grid-cols-3 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
            <div className="text-sm text-night bg-white px-2 py-1.5 rounded-lg border border-pebble/60 truncate">
              {f.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onToggle,
  disabled = false,
  disabledMessage,
  required = false,
  singleSelect = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
  required?: boolean;
  singleSelect?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = selected.length === 0
    ? placeholder
    : selected.length <= 2
    ? selected.join(', ')
    : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-sm font-semibold text-night block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {disabled ? (
        <div className="flex items-center gap-2 p-2.5 bg-earth rounded-xl border border-pebble text-gray-400 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{disabledMessage || 'Select required fields first'}</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2.5 border border-pebble rounded-xl text-sm text-left flex items-center justify-between transition-all bg-white hover:border-sky/40 focus:ring-2 focus:ring-sky cursor-pointer"
          >
            <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-night font-medium'}`}>
              {displayValue}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-pebble rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto py-1">
              {options.length === 0 ? (
                <div className="px-4 py-2 text-xs text-gray-400 italic">No options available</div>
              ) : (
                options.map((opt) => {
                  const isChecked = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onToggle(opt);
                        if (singleSelect) {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-earth cursor-pointer ${
                        isChecked ? 'bg-pale/50 font-medium' : ''
                      }`}
                    >
                      <div
                        className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
                          singleSelect ? 'rounded-full' : 'rounded'
                        } ${
                          isChecked ? 'bg-sky border-sky' : 'border-pebble bg-white'
                        }`}
                      >
                        {isChecked && (
                          singleSelect ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          ) : (
                            <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                          )
                        )}
                      </div>
                      <span className={isChecked ? 'text-sky' : 'text-gray-700'}>{opt}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onCreate,
  preselectedType,
  project,
  onSwitchToSearch,
}: CreateProductModalProps & { onSwitchToSearch?: () => void }) {
  const actualPreselectedType = typeof preselectedType === "string" ? preselectedType : undefined;
  const [step, setStep] = useState<1 | 2>(actualPreselectedType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<ProductType | null>(
    actualPreselectedType || null,
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [selectedParentItem, setSelectedParentItem] =
    useState<ProductItem | null>(null);

  // ── Variant entries (additional variants beyond primary) ──────────────────
  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);
  const [subrangeEntries, setSubrangeEntries] = useState<string[]>([""]);

  // Get allowed geographies based on current project
  const getAllowedGeographies = () => {
    if (!project) return REGIONS; // Fallback to all if no project context

    const allowed = new Set<string>();
    
    // Add the project's own region/geography
    if (project.region) {
      allowed.add(project.region);
    }

    // Map project.region to country names
    const regionLower = (project.region || '').toLowerCase();
    if (regionLower === 'global') {
      // For global projects, allow everything
      return REGIONS;
    } else if (regionLower === 'emea') {
      allowed.add('EMEA');
      allowed.add('United Kingdom');
      allowed.add('Germany');
      allowed.add('France');
      allowed.add('Netherlands');
      allowed.add('Italy');
      allowed.add('Spain');
    } else if (regionLower === 'north america' || regionLower === 'na') {
      allowed.add('North America');
      allowed.add('United States');
      allowed.add('Canada');
    } else if (regionLower === 'latam') {
      allowed.add('LATAM');
      allowed.add('Brazil');
      allowed.add('Mexico');
      allowed.add('Argentina');
    } else if (regionLower === 'apac') {
      allowed.add('APAC');
      allowed.add('Australia');
      allowed.add('China');
      allowed.add('Japan');
      allowed.add('South Korea');
    } else if (regionLower === 'south asia') {
      allowed.add('South Asia');
      allowed.add('India');
      allowed.add('Pakistan');
    }

    // Also include the default initialAdded geographies from the geography tab as fallback/extra
    allowed.add('United Kingdom');
    allowed.add('Germany');
    allowed.add('United States');

    // Convert Set back to an array
    return Array.from(allowed).filter(geo => REGIONS.includes(geo));
  };

  // ── Local Variant SKU state ───────────────────────────────────────────────
  const [cuSpecNumber, setCuSpecNumber] = useState("");
  const [cuSpecValidation, setCuSpecValidation] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [cuSkuLabels, setCuSkuLabels] = useState<string[]>([""]);
  const [recipes, setRecipes] = useState("");

  // ── Geography dropdown (Local Variant) ───────────────────────────────────
  const [geoDropdownOpen, setGeoDropdownOpen] = useState(false);
  const geoDropdownRef = useRef<HTMLDivElement>(null);

  // ── Per-geography CUC map (Local Variant) ────────────────────────────────
  const [geoCucMap, setGeoCucMap] = useState<Record<string, string>>({});
  const [geoCucValidationMap, setGeoCucValidationMap] =
    useState<RowValidationMap>({});

  // Formulation Document state per geography
  const [openFormulationGeo, setOpenFormulationGeo] = useState<string | null>(null);
  const [geoFormulationDocs, setGeoFormulationDocs] = useState<Record<string, { name: string; uploadedAt: string; size: string; status: 'Draft' | 'PLM Validated' }>>({});

  const [formulationTab, setFormulationTab] = useState<"fetch" | "library" | "upload">("fetch");
  const [isFetchingPlm, setIsFetchingPlm] = useState(false);
  const [fetchPlmError, setFetchPlmError] = useState<string | null>(null);
  const [plmCucInput, setPlmCucInput] = useState("");

  const handleUploadFormulationDoc = (geo: string, fileName: string, size = "1.2 MB") => {
    setGeoFormulationDocs(prev => ({
      ...prev,
      [geo]: {
        name: fileName,
        uploadedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        size: size,
        status: 'PLM Validated'
      }
    }));
    if (geo === "Technology") {
      update("formulationDoc", fileName);
    }
  };

  const handleFetchFromPlm = (geo: string) => {
    setFetchPlmError(null);
    if (!plmCucInput.trim()) {
      setFetchPlmError("CUC number is required to fetch formulation from PLM.");
      return;
    }
    setIsFetchingPlm(true);
    setTimeout(() => {
      setIsFetchingPlm(false);
      handleUploadFormulationDoc(geo, `PLM_Formulation_${plmCucInput.trim().toUpperCase()}_v1.pdf`, "2.4 MB");
    }, 1200);
  };

  // Close geo dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        geoDropdownRef.current &&
        !geoDropdownRef.current.contains(e.target as Node)
      ) {
        setGeoDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── CUC per-row validation ────────────────────────────────────────────────
  const [primaryRowCucValidation, setPrimaryRowCucValidation] =
    useState<RowValidationMap>({});
  const [variantRowCucValidation, setVariantRowCucValidation] =
    useState<RowValidationMap>({});

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    levelName: "",
    description: "",
    brand: "",
    businessGroups: [] as string[],
    categories: [] as string[],
    technology1: "",
    technology2: "",
    tier: "",
    targetAudience: "",
    consumerBenefitPlatform: "",
    parentSearch: "",
    parentId: "",
    parentName: "",
    parentBrand: "",
    parentBG: "",
    parentCategory: "",
    parentFormat: "",
    parentVariant: "",
    parentTech1: "",
    parentTech2: "",
    geographies: [] as string[],
    cucSpecNumber: "",
    hasSubrange: "no",
    variantNames: [""],
    localVariantRows: [{ geography: "", cucCode: "" }],
    formulationDoc: "",
  });
  const [parentSearchResults, setParentSearchResults] = useState<ProductItem[]>(
    [],
  );
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [cucValidation, setCucValidation] = useState<
    "idle" | "valid" | "invalid"
  >("idle");

  const [tech1SearchOpen, setTech1SearchOpen] = useState(false);
  const [tech2SearchOpen, setTech2SearchOpen] = useState(false);
  const [parentAdvSearchOpen, setParentAdvSearchOpen] = useState(false);

  useEffect(() => {
    if (openFormulationGeo) {
      setFormulationTab("fetch");
      let cuc = geoCucMap[openFormulationGeo] || "";
      if (openFormulationGeo.startsWith("Primary-")) {
        const parts = openFormulationGeo.split("-");
        const idx = parseInt(parts[1], 10);
        cuc = form.localVariantRows[idx]?.cucCode || "";
      } else if (openFormulationGeo.startsWith("Variant-")) {
        const parts = openFormulationGeo.split("-");
        const vi = parseInt(parts[1], 10);
        const li = parseInt(parts[2], 10);
        cuc = variantEntries[vi]?.lvRows[li]?.cucCode || "";
      }
      setPlmCucInput(cuc);
      setFetchPlmError(null);
      setIsFetchingPlm(false);
    }
  }, [openFormulationGeo, geoCucMap, form.localVariantRows, variantEntries]);

  const update = (field: string, val: unknown) =>
    setForm((f) => ({ ...f, [field]: val }));

  const findAndAutoPopulateFromBrand = (brandName: string) => {
    if (!brandName) {
      update("businessGroups", []);
      update("categories", []);
      return;
    }
    const trimmed = brandName.trim().toLowerCase();
    
    const mapped = BRAND_MAPPINGS[trimmed];
    if (mapped) {
      update("businessGroups", [mapped.businessGroup]);
      update("categories", [mapped.category]);
      return;
    }
    
    const existing = initialProducts.find(p => p.brand?.toLowerCase() === trimmed);
    if (existing && existing.businessGroup && existing.category) {
      update("businessGroups", [existing.businessGroup]);
      update("categories", [existing.category]);
      return;
    }
    
    // Fallback to Beauty & Wellbeing and Skin Care as default
    update("businessGroups", ["Beauty & Wellbeing"]);
    update("categories", ["Skin Care"]);
  };

  const handleParentSearch = (q: string, types: ProductType[]) => {
    update("parentSearch", q);
    if (q.length > 0) {
      setParentSearchResults(
        initialProducts.filter(
          (p) =>
            types.includes(p.type) &&
            p.name.toLowerCase().includes(q.toLowerCase()),
        ),
      );
      setShowParentDropdown(true);
    } else {
      setShowParentDropdown(false);
    }
  };

  const selectParent = (p: ProductItem) => {
    setSelectedParentItem(p);
    update("parentId", p.id);
    update("parentName", p.name);
    update("parentSearch", p.name);
    if (p.brand) {
      update("brand", p.brand);
      update("parentBrand", p.brand);
    }
    if (p.businessGroup) {
      update("businessGroups", [p.businessGroup]);
      update("parentBG", p.businessGroup);
    }
    if (p.category) {
      update("categories", [p.category]);
      update("parentCategory", p.category);
    }
    if (selectedType === "SKU") {
      update("parentFormat", p.parentName || "");
      update("parentVariant", p.parentName || "");
      update("parentTech1", p.technology1 || "");
      update("parentTech2", p.technology2 || "");
      if (p.geographies && p.geographies.length > 0) {
        update("geographies", p.geographies);
        const geoPrefix = p.geographies[0].substring(0, 2).toUpperCase();
        setCuSpecNumber(`CU-${geoPrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setCuSpecNumber(`CU-UK-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setCuSpecValidation("valid");
    }
    setShowParentDropdown(false);
  };

  const validateCuc = (val: string) => {
    update("cucSpecNumber", val);
    if (!val) { setCucValidation("idle"); return; }
    setTimeout(
      () => setCucValidation(CUC_PATTERN.test(val) ? "valid" : "invalid"),
      600,
    );
  };

  // ── Per-geography CUC validation (Local Variant) ──────────────────────────
  const updateGeoCuc = (geo: string, val: string) => {
    setGeoCucMap((prev) => ({ ...prev, [geo]: val }));
    if (!val) {
      setGeoCucValidationMap((prev) => ({ ...prev, [geo]: "idle" }));
      return;
    }
    setTimeout(() => {
      setGeoCucValidationMap((prev) => ({
        ...prev,
        [geo]: CUC_PATTERN.test(val) ? "valid" : "invalid",
      }));
    }, 600);
  };

  const validatePrimaryRowCuc = (idx: number, val: string) => {
    updatePrimaryLVRow(idx, { cucCode: val });
    if (!val) {
      setPrimaryRowCucValidation((prev) => ({ ...prev, [idx]: "idle" }));
      return;
    }
    setTimeout(() => {
      setPrimaryRowCucValidation((prev) => ({
        ...prev,
        [idx]: CUC_PATTERN.test(val) ? "valid" : "invalid",
      }));
    }, 600);
  };

  const validateVariantRowCuc = (vi: number, li: number, val: string) => {
    updateLVRow(vi, li, { cucCode: val });
    const key = `${vi}-${li}`;
    if (!val) {
      setVariantRowCucValidation((prev) => ({ ...prev, [key]: "idle" }));
      return;
    }
    setTimeout(() => {
      setVariantRowCucValidation((prev) => ({
        ...prev,
        [key]: CUC_PATTERN.test(val) ? "valid" : "invalid",
      }));
    }, 600);
  };

  // ── Local Variant SKU label helpers ──────────────────────────────────────
  const updateCuSkuLabel = (idx: number, val: string) =>
    setCuSkuLabels((prev) => prev.map((v, i) => (i === idx ? val : v)));
  const addCuSkuLabel = () => setCuSkuLabels((prev) => [...prev, ""]);
  const removeCuSkuLabel = (idx: number) =>
    setCuSkuLabels((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );

  // ── Geography toggle ──────────────────────────────────────────────────────
  const handleToggleGeo = (geo: string) => {
    const list = form.geographies;
    if (list.includes(geo)) {
      update("geographies", list.filter((g) => g !== geo));
      // Remove associated CUC data
      setGeoCucMap((prev) => { const next = { ...prev }; delete next[geo]; return next; });
      setGeoCucValidationMap((prev) => { const next = { ...prev }; delete next[geo]; return next; });
    } else {
      update("geographies", [...list, geo]);
    }
  };

  const handleToggleBG = (bg: string) => {
    const list = form.businessGroups;
    const isRemoving = list.includes(bg);
    const nextBGs = isRemoving ? list.filter((b) => b !== bg) : [...list, bg];
    update("businessGroups", nextBGs);
    
    if (selectedType === "Technology") {
      // For Technology, only clear categories belonging to the removed BG, keep other valid ones
      if (isRemoving) {
        const remainingAllowedCats = nextBGs.flatMap(remainingBG => CATEGORIES[remainingBG] || []);
        update("categories", form.categories.filter(c => remainingAllowedCats.includes(c)));
      }
    } else {
      update("categories", []);
    }
  };

  const availableCategories = form.businessGroups.flatMap(
    (bg) => CATEGORIES[bg] || [],
  );

  const handleToggleCat = (cat: string) => {
    const list = form.categories;
    update(
      "categories",
      list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat],
    );
  };

  const handleToggleMultiSelect = (field: "tier" | "targetAudience" | "consumerBenefitPlatform", val: string) => {
    if (field === "tier") {
      const currentStr = form[field] || "";
      if (currentStr === val) {
        update(field, "");
      } else {
        update(field, val);
      }
      return;
    }
    const currentStr = form[field] || "";
    const list = currentStr ? currentStr.split(', ') : [];
    const nextList = list.includes(val) ? list.filter(item => item !== val) : [...list, val];
    update(field, nextList.join(', '));
  };

  // ── Variant entry helpers ─────────────────────────────────────────────────
  const updateVariantEntry = (i: number, patch: Partial<VariantEntry>) =>
    setVariantEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    );
  const addVariantEntry = () =>
    setVariantEntries((prev) => [
      ...prev,
      { name: "", lvRows: [{ geography: "", cucCode: "" }] },
    ]);
  const removeVariantEntry = (i: number) =>
    setVariantEntries((prev) =>
      prev.length > 0 ? prev.filter((_, idx) => idx !== i) : prev,
    );
  const addLVRow = (vi: number, geo: string) => {
    const entry = variantEntries[vi];
    updateVariantEntry(vi, {
      lvRows: [...entry.lvRows, { geography: geo, cucCode: "" }],
    });
  };
  const removeLVRow = (vi: number, li: number) => {
    const rows = variantEntries[vi].lvRows.filter((_, idx) => idx !== li);
    updateVariantEntry(vi, {
      lvRows: rows.length > 0 ? rows : [{ geography: "", cucCode: "" }],
    });
  };
  const updateLVRow = (vi: number, li: number, patch: Partial<LVRow>) => {
    const rows = variantEntries[vi].lvRows.map((r, idx) =>
      idx === li ? { ...r, ...patch } : r,
    );
    updateVariantEntry(vi, { lvRows: rows });
  };

  const addPrimaryLVRow = (geography: string) => {
    const rows = form.localVariantRows;
    if (rows.length === 1 && !rows[0].geography) {
      update("localVariantRows", [{ geography, cucCode: "" }]);
    } else {
      update("localVariantRows", [...rows, { geography, cucCode: "" }]);
    }
  };
  const removePrimaryLVRow = (idx: number) => {
    const rows = form.localVariantRows.filter((_, i) => i !== idx);
    update(
      "localVariantRows",
      rows.length > 0 ? rows : [{ geography: "", cucCode: "" }],
    );
    setPrimaryRowCucValidation((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };
  const updatePrimaryLVRow = (idx: number, patch: Partial<LVRow>) => {
    update(
      "localVariantRows",
      form.localVariantRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  };

  const canProceed = selectedType !== null;
  const canSave = () => {
    if (cucValidation === "invalid") return false;
    if (cuSpecValidation === "invalid") return false;
    if (Object.values(primaryRowCucValidation).some((v) => v === "invalid"))
      return false;
    if (Object.values(variantRowCucValidation).some((v) => v === "invalid"))
      return false;
    if (Object.values(geoCucValidationMap).some((v) => v === "invalid"))
      return false;
    if (selectedType === "Local Variant") {
      return !!form.parentId && form.geographies.length > 0;
    }
    if (selectedType === "Format" || selectedType === "Technology") {
      if (!form.levelName.trim()) return false;
      return form.businessGroups.length > 0 && form.categories.length > 0;
    }
    if (selectedType === "Subrange") {
      if (!form.parentId) return false;
      const activeEntries = subrangeEntries.map(s => s.trim()).filter(s => s !== "");
      if (activeEntries.length === 0) return false;
      const uniqueEntries = new Set(activeEntries);
      if (uniqueEntries.size !== activeEntries.length) return false;
      return true;
    }
    if (selectedType === "SKU") {
      return !!form.parentId && cuSkuLabels.some((l) => l.trim() !== "");
    }
    if (selectedType === "Variant") {
      return !!form.parentId && !!form.levelName.trim();
    }
    return !!form.parentId && !!form.levelName.trim();
  };

  const handleSave = (createAnother = false) => {
    if (!selectedType || !canSave()) return;
    if (selectedType === "Subrange") {
      const activeEntries = subrangeEntries.map(s => s.trim()).filter(s => s !== "");
      activeEntries.forEach((subName) => {
        const newProduct: Omit<
          ProductItem,
          | "id"
          | "productId"
          | "lifecycleState"
          | "childCount"
          | "claimsCount"
          | "projectsCount"
          | "geographyCount"
          | "lastModified"
        > = {
          name: form.parentName ? `${form.parentName} ${subName}` : subName,
          levelName: subName,
          type: "Subrange",
          parentId: form.parentId || null,
          parentName: form.parentName || null,
          geographies: form.geographies,
          category: form.categories[0] || "",
          businessGroup: form.businessGroups[0] || "",
          brand: form.brand,
          technology1: form.technology1 || undefined,
          technology2: form.technology2 || undefined,
          tier: form.tier || undefined,
          targetAudience: form.targetAudience || undefined,
          consumerBenefitPlatform: form.consumerBenefitPlatform || undefined,
          description: form.description || undefined,
          cucSpecNumber: form.cucSpecNumber || undefined,
          createdBy: "Sarah Johnson",
          createdDate: new Date().toISOString().split("T")[0],
          isFavorite: false,
        };
        onCreate(newProduct);
      });
      if (createAnother) {
        setSubrangeEntries([""]);
        setForm((f) => ({ ...f, description: "" }));
      } else {
        resetAndClose();
      }
      return;
    }
    const cuLevelName = cuSkuLabels.find((l) => l.trim()) ?? "";
    const newProduct: Omit<
      ProductItem,
      | "id"
      | "productId"
      | "lifecycleState"
      | "childCount"
      | "claimsCount"
      | "projectsCount"
      | "geographyCount"
      | "lastModified"
    > = {
      name: form.parentName
        ? `${form.parentName} ${selectedType === "SKU" ? cuLevelName : form.levelName}`
        : selectedType === "SKU"
          ? cuLevelName
          : form.levelName,
      levelName:
        selectedType === "SKU" ? cuLevelName : form.levelName,
      type: selectedType,
      parentId: form.parentId || null,
      parentName: form.parentName || null,
      geographies:
        selectedType === "Variant"
          ? form.localVariantRows
            .filter((r) => r.geography)
            .map((r) => r.geography)
          : form.geographies,
      category: selectedType === "Technology" ? form.categories.join(', ') : (form.categories[0] || ""),
      businessGroup: selectedType === "Technology" ? form.businessGroups.join(', ') : (form.businessGroups[0] || ""),
      brand: form.brand,
      technology1: form.technology1 || undefined,
      technology2: form.technology2 || undefined,
      tier: form.tier || undefined,
      targetAudience: form.targetAudience || undefined,
      consumerBenefitPlatform: form.consumerBenefitPlatform || undefined,
      description: form.description || undefined,
      cucSpecNumber: form.cucSpecNumber || undefined,
      createdBy: "Sarah Johnson",
      createdDate: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };
    onCreate(newProduct);
    if (createAnother) {
      setForm((f) => ({ ...f, levelName: "", description: "" }));
      setCuSkuLabels([""]);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    const actualPreselectedType = typeof preselectedType === "string" ? preselectedType : undefined;
    setStep(actualPreselectedType ? 2 : 1);
    setSelectedType(actualPreselectedType || null);
    setSelectedParentItem(null);
    setForm({
      levelName: "",
      description: "",
      brand: "",
      businessGroups: [],
      categories: [],
      technology1: "",
      technology2: "",
      tier: "",
      targetAudience: "",
      consumerBenefitPlatform: "",
      parentSearch: "",
      parentId: "",
      parentName: "",
      parentBrand: "",
      parentBG: "",
      parentCategory: "",
      parentFormat: "",
      parentVariant: "",
      parentTech1: "",
      parentTech2: "",
      geographies: [],
      cucSpecNumber: "",
      hasSubrange: "no",
      variantNames: [""],
      localVariantRows: [{ geography: "", cucCode: "" }],
      formulationDoc: "",
    });
    setCucValidation("idle");
    setCuSpecNumber("");
    setCuSpecValidation("idle");
    setCuSkuLabels([""]);
    setRecipes("");
    setVariantEntries([]);
    setSubrangeEntries([""]);
    setPrimaryRowCucValidation({});
    setVariantRowCucValidation({});
    setGeoCucMap({});
    setGeoCucValidationMap({});
    setGeoDropdownOpen(false);
    setShowCancelConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  // ── Reusable validated CUC input ─────────────────────────────────────────
  const CucInput = ({
    value,
    validation,
    onChange,
    compact = false,
  }: {
    value: string;
    validation: "idle" | "valid" | "invalid" | undefined;
    onChange: (val: string) => void;
    compact?: boolean;
  }) => {
    const state = validation ?? "idle";
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="CUC Number"
          className={[
            "w-full border rounded text-xs focus:outline-none",
            compact ? "px-2 py-1 focus:border-sky" : "px-2 py-1 focus:border-sky",
            state === "invalid"
              ? "border-red-400 bg-red-50"
              : state === "valid"
                ? "border-green-400 bg-green-50"
                : "border-pebble",
            state !== "idle" ? "pr-16" : "pr-2",
          ].join(" ")}
        />
        {state !== "idle" && (
          <div
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 font-medium ${state === "valid" ? "text-green-600" : "text-red-600"
              }`}
          >
            {state === "valid" ? (
              <>
                <Check className="w-3 h-3" />
                <span className="text-xs">Valid</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">Invalid</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const inheritedFields =
    selectedParentItem && selectedType
      ? getInheritedHierarchy(selectedType, selectedParentItem)
      : [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-night/40 backdrop-blur-sm"
          onClick={resetAndClose}
        />
         <div
          className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden transition-all duration-300 max-w-6xl"
          style={{ height: "650px", maxHeight: "85vh" }}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-pebble bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-night">{onSwitchToSearch ? "Add Product to Project" : "Create New Product"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {step === 1
                    ? "Step 1 of 2 — Select product type"
                    : `Step 2 of 2 — ${selectedType} details`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= s ? "bg-sky text-white" : "bg-pebble text-gray-400"}`}
                      >
                        {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                      </div>
                      {s < 2 && (
                        <div
                          className={`w-6 h-0.5 ${step > s ? "bg-sky" : "bg-pebble"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={resetAndClose}
                  className="p-2 hover:bg-earth rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            {onSwitchToSearch && (
              <div className="flex px-6 gap-6">
                <button 
                  onClick={onSwitchToSearch}
                  className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-night transition-colors"
                >
                  Search Library
                </button>
                <button 
                  className="pb-3 text-sm font-semibold border-b-2 border-sky text-sky transition-colors"
                >
                  Create New Product
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            {step === 1 && (
              <div className="flex-1 flex flex-col">
                <p className="text-sm text-gray-500 mb-5 flex-shrink-0">
                  Choose the hierarchy level for the new product. Once selected,
                  the type cannot be changed.
                </p>
                <div className="grid grid-cols-3 gap-6 flex-1">
                  {TYPE_ORDER.map((type) => {
                    const meta = PRODUCT_TYPE_META[type];
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setStep(2);
                        }}
                        className={`flex flex-col justify-between p-6 rounded-2xl border-2 text-left transition-all cursor-pointer h-full ${isSelected ? "border-sky shadow-md" : "border-pebble hover:border-sky/40 hover:shadow-sm"}`}
                        style={{ background: isSelected ? meta.bg : "white" }}
                      >
                        <div className="w-full">
                          <div className="flex items-start justify-between mb-4">
                            <div style={{ color: meta.color }}>
                              {TYPE_ICONS[type]}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-sky flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div
                            className="text-base text-night mb-1.5"
                            style={{ fontWeight: 600 }}
                          >
                            {type}
                          </div>
                          <div className="text-xs text-gray-500 leading-relaxed">
                            {meta.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && selectedType && (
              <div className="space-y-5">
                {/* Type badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl border border-pebble bg-earth">
                  <div style={{ color: PRODUCT_TYPE_META[selectedType].color }}>
                    {TYPE_ICONS[selectedType]}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Product type</span>
                    <div
                      className="text-sm text-night"
                      style={{ fontWeight: 600 }}
                    >
                      {selectedType}
                    </div>
                  </div>
                </div>

                {/* Parent selector */}
                {(selectedType === "Format" ||
                  selectedType === "Subrange" ||
                  selectedType === "Variant" ||
                  selectedType === "Local Variant" ||
                  selectedType === "SKU") && (
                    <div>
                      {selectedType === "Variant" && (
                        <div className="mb-4">
                          <label className="text-sm text-night block mb-2">
                            Does a Subrange exist for this Variant?
                          </label>
                          <div className="flex gap-3">
                            {["yes", "no"].map((v) => (
                              <button
                                key={v}
                                onClick={() => update("hasSubrange", v)}
                                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${form.hasSubrange === v ? "border-sky bg-pale text-sky" : "border-pebble text-gray-600 hover:border-sky/40"}`}
                              >
                                {v === "yes"
                                  ? "Yes — select Subrange"
                                  : "No — select Format directly"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedType !== "Format" && (
                        <div className="relative">
                          <label className="text-sm text-night block mb-1.5">
                            Parent{" "}
                            {selectedType === "Subrange"
                              ? "Format"
                              : selectedType === "Variant"
                                ? form.hasSubrange === "yes"
                                  ? "Subrange"
                                  : "Format"
                                : selectedType === "Local Variant"
                                  ? "Variant"
                                  : "Local Variant (CUC)"}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={form.parentSearch}
                                onChange={(e) =>
                                  handleParentSearch(
                                    e.target.value,
                                    selectedType === "Subrange"
                                      ? ["Format"]
                                      : selectedType === "Variant"
                                        ? form.hasSubrange === "yes"
                                          ? ["Subrange"]
                                          : ["Format"]
                                        : selectedType === "Local Variant"
                                          ? ["Variant"]
                                          : ["Local Variant"],
                                  )
                                }
                                placeholder="Search by product name..."
                                className="w-full pl-9 pr-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                              />
                            </div>
                            <AdvancedSearchTrigger
                              onClick={() => setParentAdvSearchOpen(true)}
                              title="Advanced Search — Parent Product"
                            />
                          </div>
                          {showParentDropdown &&
                            parentSearchResults.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-pebble rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {parentSearchResults.map((p) => {
                                  const lc = getLifecycleBadgeStyle(
                                    p.lifecycleState,
                                  );
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => selectParent(p)}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-earth text-left text-sm transition-colors"
                                    >
                                      <div>
                                        <div className="text-night">{p.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-xs text-gray-400">
                                            {p.productId}
                                          </span>
                                          <span
                                            className="px-1.5 py-0.5 rounded text-xs"
                                            style={{
                                              background: lc.bg,
                                              color: lc.text,
                                            }}
                                          >
                                            {p.lifecycleState}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          {form.parentName && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-pale rounded-lg text-sm text-sky">
                              <Check className="w-3.5 h-3.5" />
                              {form.parentName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* CUC Specification Number — SKU */}
                      {selectedType === "SKU" && form.parentId && (
                        <div className="mt-4">
                          <label className="text-sm text-night block mb-1.5">
                            CUC Specification Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cuSpecNumber}
                              readOnly
                              placeholder="Auto-inherited upon parent selection..."
                              className="w-full px-4 pr-36 py-2.5 border rounded-xl text-sm focus:outline-none bg-gray-50 border-pebble cursor-not-allowed"
                            />
                            {cuSpecNumber && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-green-600">
                                <Check className="w-3.5 h-3.5" />
                                Auto-inherited
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Inherited automatically using parent local variant.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {/* Inherited Hierarchy Panel */}
                {selectedParentItem &&
                  (selectedType === "Subrange" ||
                    selectedType === "Variant" ||
                    selectedType === "Local Variant" ||
                    selectedType === "SKU") && (
                    <InheritedHierarchyPanel fields={inheritedFields} />
                  )}

                {/* Brand (Format & Technology) */}
                {(selectedType === "Format" || selectedType === "Technology") && (
                  <div>
                    <label className="text-sm text-night block mb-1.5">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => {
                        const brandVal = e.target.value;
                        update("brand", brandVal);
                        findAndAutoPopulateFromBrand(brandVal);
                      }}
                      placeholder="e.g. Dove, TRESemmé, Persil..."
                      className="w-full px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                    />
                  </div>
                )}


                {/* Level Name — not shown for Local Variant, SKU, or Variant */}
                {selectedType !== "Local Variant" &&
                  selectedType !== "SKU" &&
                  selectedType !== "Variant" &&
                  selectedType !== "Subrange" && (
                    <div>
                      <label className="text-sm text-night block mb-1.5">
                        {selectedType === "Technology"
                          ? "Technology Name"
                          : "Format Name"}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.levelName}
                        onChange={(e) => update("levelName", e.target.value)}
                        placeholder={`Enter ${selectedType.toLowerCase()} name only...`}
                        className="w-full px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                      />
                      {form.parentName && (
                        <div className="mt-1.5 text-xs text-gray-400">
                          Full product name will be:{" "}
                          <span className="text-sky">
                            {form.parentName} {form.levelName || "…"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {selectedType === "Subrange" && (
                  <div className="space-y-3">
                    <label className="text-sm text-night block font-semibold mb-1">
                      Subrange Names <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2.5">
                      {subrangeEntries.map((entry, idx) => {
                        const isDuplicate = subrangeEntries.filter(s => s.trim() && s.trim().toLowerCase() === entry.trim().toLowerCase()).length > 1;
                        const showWarning = isDuplicate;
                        
                        return (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={entry}
                                onChange={(e) => {
                                  const next = [...subrangeEntries];
                                  next[idx] = e.target.value;
                                  setSubrangeEntries(next);
                                }}
                                placeholder={`Enter subrange ${idx + 1} name only...`}
                                className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                                  showWarning 
                                    ? "border-red-400 focus:ring-red-400 bg-red-50" 
                                    : "border-pebble focus:ring-sky"
                                }`}
                              />
                              {subrangeEntries.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubrangeEntries(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Remove Subrange"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {showWarning && (
                              <div className="text-xs text-red-500 ml-1">
                                Subrange names must be unique
                              </div>
                            )}
                            {entry.trim() && form.parentName && (
                              <div className="text-xs text-gray-400 ml-1">
                                Full product name will be:{" "}
                                <span className="text-sky">
                                  {form.parentName} {entry}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSubrangeEntries(prev => [...prev, ""])}
                      className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-pebble rounded-xl text-sm text-sky hover:bg-pale hover:border-sky transition-colors w-full justify-center mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subrange
                    </button>
                  </div>
                )}

                {/* ── VARIANT: Horizontal variant builder (always visible) ─────────────── */}
                {selectedType === "Variant" && (
                  <div className="border border-pebble rounded-xl p-4 bg-earth">
                    <div className="text-xs text-gray-400 mb-3">
                      Add variants horizontally. Add Local Variants vertically
                      under each variant.
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 items-start min-w-max pb-2">
                        {/* ── Primary variant column ── */}
                        <div className="bg-white rounded-xl border-2 border-sky shadow-sm w-72 flex-shrink-0">
                          <div className="px-3 pt-3 pb-2 border-b border-pebble">
                            <div className="text-xs text-gray-400 mb-1">
                              Variant 1 (Primary)
                            </div>
                            <input
                              type="text"
                              value={form.levelName}
                              onChange={(e) =>
                                update("levelName", e.target.value)
                              }
                              placeholder="Parent Variant name only..."
                              className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                            />
                            {form.parentName && form.levelName && (
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {form.parentName} {form.levelName}
                              </div>
                            )}
                          </div>

                          {/* Local Variants for primary */}
                          <div className="px-3 py-2 space-y-1.5">
                            <div className="text-xs text-gray-400 mb-1">
                              Local Variants
                            </div>
                            {form.localVariantRows
                              .filter((r) => r.geography)
                              .map((row, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col gap-1 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Globe2 className="w-3 h-3 text-sky flex-shrink-0" />
                                    <span className="text-night truncate font-medium">
                                      {form.levelName
                                        ? form.levelName + " "
                                        : ""}
                                      {row.geography}
                                    </span>
                                    <button
                                      onClick={() => removePrimaryLVRow(idx)}
                                      className="ml-auto text-gray-300 hover:text-red-400"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <CucInput
                                    value={row.cucCode || ""}
                                    validation={primaryRowCucValidation[idx]}
                                    onChange={(val) =>
                                      validatePrimaryRowCuc(idx, val)
                                    }
                                    compact
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setOpenFormulationGeo(`Primary-${idx}-${row.geography}`)}
                                    className={`w-full mt-1.5 px-2 py-1.5 border rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                                      geoFormulationDocs[`Primary-${idx}-${row.geography}`]
                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        : "bg-white text-sky border-pebble hover:bg-pale/40"
                                    }`}
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="truncate">
                                      {geoFormulationDocs[`Primary-${idx}-${row.geography}`]
                                        ? "Doc Linked"
                                        : "Add Formulation Doc"}
                                    </span>
                                  </button>
                                </div>
                              ))}
                            <select
                              onChange={(e) => {
                                if (e.target.value)
                                  addPrimaryLVRow(e.target.value);
                                e.target.value = "";
                              }}
                              className="w-full mt-1 px-2 py-1 border border-dashed border-pebble rounded-lg text-xs text-sky bg-transparent focus:outline-none cursor-pointer"
                            >
                              <option value="">+ Add Local Variant</option>
                              {getAllowedGeographies()
                                .filter((r) => !form.localVariantRows.some((row) => row.geography === r))
                                .map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {/* ── Additional variant columns ── */}
                        {variantEntries.map((entry, vi) => (
                          <div
                            key={vi}
                            className="bg-white rounded-xl border border-pebble w-72 flex-shrink-0"
                          >
                            <div className="px-3 pt-3 pb-2 border-b border-pebble">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs text-gray-400">
                                  Variant {vi + 2}
                                </div>
                                <button
                                  onClick={() => removeVariantEntry(vi)}
                                  className="text-gray-300 hover:text-red-400"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={entry.name}
                                placeholder="Variant name only..."
                                onChange={(e) =>
                                  updateVariantEntry(vi, {
                                    name: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                              />
                              {entry.name && form.parentName && (
                                <div className="text-xs text-gray-400 mt-1 truncate">
                                  {form.parentName} {entry.name}
                                </div>
                              )}
                            </div>

                            <div className="px-3 py-2 space-y-1.5">
                              <div className="text-xs text-gray-400 mb-1">
                                Local Variants
                              </div>
                              {entry.lvRows
                                .filter((r) => r.geography)
                                .map((row, li) => (
                                  <div
                                    key={li}
                                    className="flex flex-col gap-1 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Globe2 className="w-3 h-3 text-sky flex-shrink-0" />
                                      <span className="text-night truncate font-medium">
                                        {entry.name
                                          ? entry.name + " "
                                          : ""}
                                        {row.geography}
                                      </span>
                                      <button
                                        onClick={() => removeLVRow(vi, li)}
                                        className="ml-auto text-gray-300 hover:text-red-400"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <CucInput
                                      value={row.cucCode || ""}
                                      validation={
                                        variantRowCucValidation[`${vi}-${li}`]
                                      }
                                      onChange={(val) =>
                                        validateVariantRowCuc(vi, li, val)
                                      }
                                      compact
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setOpenFormulationGeo(`Variant-${vi}-${li}-${row.geography}`)}
                                      className={`w-full mt-1.5 px-2 py-1.5 border rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                                        geoFormulationDocs[`Variant-${vi}-${li}-${row.geography}`]
                                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                          : "bg-white text-sky border-pebble hover:bg-pale/40"
                                      }`}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span className="truncate">
                                        {geoFormulationDocs[`Variant-${vi}-${li}-${row.geography}`]
                                          ? "Doc Linked"
                                          : "Add Formulation Doc"}
                                      </span>
                                    </button>
                                  </div>
                                ))}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) addLVRow(vi, e.target.value);
                                  e.target.value = "";
                                }}
                                className="w-full mt-1 px-2 py-1 border border-dashed border-pebble rounded-lg text-xs text-sky bg-transparent focus:outline-none cursor-pointer"
                              >
                                <option value="">+ Add Local Variant</option>
                                {getAllowedGeographies()
                                  .filter((r) => !entry.lvRows.some((row) => row.geography === r))
                                  .map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        ))}

                        {/* Add New Variant button */}
                        <button
                          onClick={addVariantEntry}
                          className="flex-shrink-0 w-44 h-32 rounded-xl border-2 border-dashed border-pebble hover:border-sky text-sky hover:bg-pale transition-colors flex flex-col items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-xs font-medium">
                            Add New Variant
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}





                {/* Mandatory & Multi-select Dropdowns for Technology Creation */}
                {selectedType === "Technology" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-earth/40 border border-pebble rounded-xl p-5">
                    <div className="col-span-1 md:col-span-2 text-xs text-sky font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-sky animate-pulse" />
                      Technology Classification (Required)
                    </div>

                    {/* Business Groups Dropdown */}
                    <div className="space-y-2">
                      <MultiSelectDropdown
                        label="Business Groups"
                        placeholder="Select Business Groups..."
                        options={BUSINESS_GROUPS}
                        selected={form.businessGroups}
                        onToggle={handleToggleBG}
                        required={true}
                      />
                      {form.businessGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {form.businessGroups.map((bg) => (
                            <span
                              key={bg}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-[11px] text-sky font-semibold"
                            >
                              {bg}
                              <button
                                type="button"
                                onClick={() => handleToggleBG(bg)}
                                className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Categories Dropdown */}
                    <div className="space-y-2">
                      <MultiSelectDropdown
                        label="Categories"
                        placeholder="Select Categories..."
                        options={availableCategories}
                        selected={form.categories}
                        onToggle={handleToggleCat}
                        disabled={form.businessGroups.length === 0}
                        disabledMessage="Select a Business Group first to view categories"
                        required={true}
                      />
                      {form.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {form.categories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-[11px] text-sky font-semibold"
                            >
                              {cat}
                              <button
                                type="button"
                                onClick={() => handleToggleCat(cat)}
                                className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technology fields */}
                {(selectedType === "Subrange" ||
                  selectedType === "Variant" ||
                  selectedType === "Local Variant") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-night block mb-1.5">
                          Technology 1
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.technology1}
                            onChange={(e) =>
                              update("technology1", e.target.value)
                            }
                            placeholder="Search technology..."
                            className="flex-1 px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                          />
                          <AdvancedSearchTrigger
                            onClick={() => setTech1SearchOpen(true)}
                            title="Advanced Search — Technology 1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-night block mb-1.5">
                          Technology 2
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.technology2}
                            onChange={(e) =>
                              update("technology2", e.target.value)
                            }
                            placeholder="Search technology..."
                            className="flex-1 px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                          />
                          <AdvancedSearchTrigger
                            onClick={() => setTech2SearchOpen(true)}
                            title="Advanced Search — Technology 2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                {/* Optional enrichment */}
                {["Subrange", "Variant", "Local Variant", "SKU"].includes(selectedType) && (
                  (() => {
                    const bg = form.businessGroups[0] || "";
                    const cat = form.categories[0] || "";
                    if (!bg || !cat) return null;
                    const isPC = bg === "Personal Care" || bg === "PC";
                    const isBW = bg === "Beauty & Wellbeing" || bg === "B&W";

                    const isDeo = isPC && (cat === "Deodorants" || cat === "Deodrants");
                    const isHair = isBW && cat === "Hair Care";
                    const isSkin = isBW && cat === "Skin Care";
                    const isOral = isPC && cat === "Oral Care";
                    const isCleansing = isPC && cat === "Skin Cleansing";

                    const showTier = isDeo || (!isDeo && !isHair && !isSkin && !isOral && !isCleansing);
                    const showAudience = isHair || isSkin || (!isDeo && !isHair && !isSkin && !isOral && !isCleansing);
                    const showCbp = isDeo || isHair || isSkin || isOral || isCleansing || (!isDeo && !isHair && !isSkin && !isOral && !isCleansing);

                    let tierOptions = TIERS;
                    if (isDeo) {
                      tierOptions = ["Deos – Best", "Deos – Better", "Deos – Good"];
                    }

                    let audienceOptions = getAudiencesByBG(bg);
                    if (isHair) {
                      audienceOptions = [
                        "Designed for Men", "Designed for Women", "Designed for Kids",
                        "Designed for Hair Shape Type 1 - Straight",
                        "Designed for Hair Shape Type 2 - Wavy",
                        "Designed for Hair Shape Type 3 - Curly",
                        "Designed for Hair Shape Type 4 - Textured/Coily"
                      ];
                    } else if (isSkin) {
                      audienceOptions = ["Designed for Men", "Designed for Women", "Designed for Kids"];
                    }

                    let cbpOptions = CBPs;
                    if (isDeo) {
                      cbpOptions = [
                        "Fabric No White Marks", "Skin Care Look & Feel",
                        "Smell Great", "Sweat Management"
                      ];
                    } else if (isHair) {
                      cbpOptions = [
                        "Anti-Damage", "Anti-Frizz", "Clean & Fresh",
                        "Color", "Hair Fall Control", "Healthy Scalp",
                        "Hold", "Moisture", "Scalp: Anti-dandruff",
                        "Shine", "Styling", "Volume"
                      ];
                    } else if (isOral) {
                      cbpOptions = [
                        "Complete", "Freshness", "Multi Benefit",
                        "Therapeutic Care: Enamel", "Therapeutic Care: Gum",
                        "Therapeutic Care: Sensitive", "Whitening", "Zero Cavity"
                      ];
                    } else if (isSkin) {
                      cbpOptions = [
                        "Acne", "Barrier", "Sensory Desire",
                        "Texture", "Tone"
                      ];
                    } else if (isCleansing) {
                      cbpOptions = [
                        "Customized Solutions", "Holistic Wellness",
                        "Hygiene & Immunity", "Regenerative & Active Materials",
                        "Skinification and Microbiome"
                      ];
                    }

                    const selectedCbp = form.consumerBenefitPlatform ? form.consumerBenefitPlatform.split(', ') : [];
                    const selectedTier = form.tier ? form.tier.split(', ') : [];
                    const selectedAudience = form.targetAudience ? form.targetAudience.split(', ') : [];

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-pebble rounded-xl p-4 bg-earth/30">
                        {showCbp && (
                          <div className="space-y-2">
                            <MultiSelectDropdown
                              label="Consumer Benefit Platform"
                              placeholder="Select CBP..."
                              options={cbpOptions}
                              selected={selectedCbp}
                              onToggle={(val) => handleToggleMultiSelect("consumerBenefitPlatform", val)}
                            />
                            {selectedCbp.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedCbp.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-[11px] text-sky font-semibold"
                                  >
                                    {item}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMultiSelect("consumerBenefitPlatform", item)}
                                      className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {showTier && (
                          <div className="space-y-2">
                            <MultiSelectDropdown
                              label="Tier"
                              placeholder="Select Tier..."
                              options={tierOptions}
                              selected={selectedTier}
                              onToggle={(val) => handleToggleMultiSelect("tier", val)}
                              singleSelect={true}
                            />
                            {selectedTier.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedTier.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-[11px] text-sky font-semibold"
                                  >
                                    {item}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMultiSelect("tier", item)}
                                      className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {showAudience && (
                          <div className="space-y-2">
                            <MultiSelectDropdown
                              label="Target Audience"
                              placeholder="Select Audience..."
                              options={audienceOptions}
                              selected={selectedAudience}
                              onToggle={(val) => handleToggleMultiSelect("targetAudience", val)}
                            />
                            {selectedAudience.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedAudience.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-[11px] text-sky font-semibold"
                                  >
                                    {item}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMultiSelect("targetAudience", item)}
                                      className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}

                {/* ── GEOGRAPHY — Local Variant: dropdown multi-select + per-geo CUC ───── */}
                {selectedType === "Local Variant" && (
                  <div>
                    <label className="text-sm text-night block mb-2">
                      Geography <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Multi-select — one Local Variant (CUC) will be created per
                      geography.
                    </p>

                    {/* Custom dropdown trigger */}
                    <div className="relative" ref={geoDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setGeoDropdownOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white hover:border-sky/40 transition-colors"
                      >
                        <span className="text-gray-500">
                          {form.geographies.length === 0
                            ? "Select geographies..."
                            : `${form.geographies.length} selected`}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${geoDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {geoDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-pebble rounded-xl shadow-lg mt-1 py-1 max-h-52 overflow-y-auto">
                          {getAllowedGeographies().map((r) => {
                            const selected = form.geographies.includes(r);
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => handleToggleGeo(r)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-earth text-left text-sm transition-colors"
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-sky border-sky" : "border-pebble"}`}
                                >
                                  {selected && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <span
                                  className={
                                    selected
                                      ? "text-night font-medium"
                                      : "text-gray-600"
                                  }
                                >
                                  {r}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Selected geography chips */}
                    {form.geographies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.geographies.map((geo) => (
                          <span
                            key={geo}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-xs text-sky"
                          >
                            <Globe2 className="w-3 h-3" />
                            {geo}
                            <button
                              onClick={() => handleToggleGeo(geo)}
                              className="ml-0.5 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Local Variant: auto-name notice */}
                    <div className="mt-3 bg-sky/5 border border-sky/20 rounded-xl px-4 py-3 flex items-start gap-3">
                      <Check className="w-4 h-4 text-sky mt-0.5 flex-shrink-0" />
                      <div>
                        <div
                          className="text-sm text-night"
                          style={{ fontWeight: 500 }}
                        >
                          Name auto-generated
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Each Local Variant will be named{" "}
                          <span className="text-sky font-medium">
                            [Parent Name] + [Geography]
                          </span>
                          .
                          {form.parentName && form.geographies.length > 0 && (
                            <span className="block mt-1">
                              e.g.{" "}
                              <span className="text-sky">
                                {form.parentName} {form.geographies[0]}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Per-geography CUC Specification Number fields */}
                    {form.geographies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-night font-medium">
                            CUC Specification Numbers
                          </label>
                          <span className="text-xs text-gray-400">
                            One per geography
                          </span>
                        </div>
                        {form.geographies.map((geo) => {
                          const hasDoc = !!geoFormulationDocs[geo];
                          return (
                            <div
                              key={geo}
                              className="flex items-center gap-3 bg-earth border border-pebble rounded-xl px-4 py-3"
                            >
                              <div className="flex items-center gap-2 w-32 flex-shrink-0">
                                <Globe2 className="w-3.5 h-3.5 text-sky flex-shrink-0" />
                                <span className="text-sm text-night font-medium truncate">
                                  {geo}
                                </span>
                              </div>
                              <div className="flex-1">
                                <CucInput
                                  value={geoCucMap[geo] || ""}
                                  validation={geoCucValidationMap[geo]}
                                  onChange={(val) => updateGeoCuc(geo, val)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setOpenFormulationGeo(geo)}
                                className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0 cursor-pointer ${
                                  hasDoc 
                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                                    : "bg-white text-sky border-pebble hover:bg-pale hover:border-sky/50"
                                }`}
                              >
                                <FileText className={`w-3.5 h-3.5 ${hasDoc ? "text-green-600" : "text-sky"}`} />
                                <span>{hasDoc ? "Doc Linked" : "Formulation Doc"}</span>
                              </button>
                            </div>
                          );
                        })}
                        <p className="text-xs text-gray-400">
                          Validated against PLM. Becomes mandatory when a linked
                          claim moves to Assessed.
                        </p>
                      </div>
                    )}

                    {form.geographies.length > 1 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-sky bg-pale px-3 py-2 rounded-lg">
                        <Check className="w-3 h-3" />
                        {form.geographies.length} geographies —{" "}
                        {form.geographies.length} CUC products will be created
                      </div>
                    )}
                  </div>
                )}

                {/* ── SKU: SKU unit/size with add button (no checkbox) ───── */}
                {selectedType === "SKU" && form.parentId && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-night block mb-1.5">
                        SKU unit/size{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="space-y-2">
                        {cuSkuLabels.map((label, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={label}
                              onChange={(e) =>
                                updateCuSkuLabel(idx, e.target.value)
                              }
                              placeholder={
                                idx === 0
                                  ? "e.g. 200ml Bottle, 400ml Pump..."
                                  : `SKU unit/size ${idx + 1} only...`
                              }
                              className="flex-1 px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                            />
                            {cuSkuLabels.length > 1 && (
                              <button
                                onClick={() => removeCuSkuLabel(idx)}
                                className="p-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                title="Remove this SKU"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Always-visible add button */}
                      <button
                        onClick={addCuSkuLabel}
                        className="mt-2 flex items-center gap-2 px-4 py-2 border border-dashed border-pebble rounded-xl text-sm text-sky hover:bg-pale hover:border-sky transition-colors w-full justify-center"
                      >
                        <Plus className="w-4 h-4" />
                        Add SKU unit/size
                      </button>

                      {/* Preview full product names */}
                      {form.parentName &&
                        cuSkuLabels.some((l) => l.trim()) && (
                          <div className="mt-2 text-xs text-gray-400">
                            Full product name
                            {cuSkuLabels.filter((l) => l.trim()).length > 1
                              ? "s"
                              : ""}
                            {" will be: "}
                            {cuSkuLabels
                              .filter((l) => l.trim())
                              .map((l, i) => (
                                <span key={i}>
                                  {i > 0 && ", "}
                                  <span className="text-sky">
                                    {form.parentName} {l}
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Recipes */}
                    <div>
                      <label className="text-sm text-night block mb-1.5">
                        Recipes
                      </label>
                      <textarea
                        value={recipes}
                        onChange={(e) => setRecipes(e.target.value)}
                        rows={2}
                        placeholder="Enter recipe details only..."
                        className="w-full px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Formulation doc */}
                {selectedType === "Technology" && (
                  <div>
                    <label className="text-sm text-night block mb-1.5">
                      Formulation Document
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenFormulationGeo("Technology")}
                        className={`flex-1 flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-all cursor-pointer justify-center ${
                          form.formulationDoc
                            ? "border-green-500 bg-green-50/50 text-green-700 font-medium"
                            : "border-dashed border-pebble hover:bg-earth hover:border-sky text-gray-500"
                        }`}
                      >
                        <Upload className={`w-4 h-4 ${form.formulationDoc ? "text-green-600 animate-pulse" : ""}`} />
                        {form.formulationDoc || "Upload or select from document library"}
                      </button>
                      {form.formulationDoc && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                          Linked
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Local Variant preview cards */}
                {selectedType === "Local Variant" &&
                  form.geographies.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="text-sm text-night"
                          style={{ fontWeight: 500 }}
                        >
                          Local Variants to be created
                          <span className="ml-2 px-1.5 py-0.5 bg-sky/10 text-sky rounded text-xs">
                            {form.geographies.length}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Name = Parent + Geography
                        </span>
                      </div>
                      <div className="space-y-2">
                        {form.geographies.map((geo) => (
                          <div
                            key={geo}
                            className="flex items-center gap-3 bg-earth border border-pebble rounded-xl px-4 py-3"
                          >
                            <Globe2 className="w-4 h-4 text-sky flex-shrink-0" />
                            <div className="flex-1">
                              <div
                                className="text-sm text-night"
                                style={{ fontWeight: 500 }}
                              >
                                {form.parentName} {geo}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                Local Variant · {geo}
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleGeo(geo)}
                              className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Cancel confirmation overlay */}
          {showCancelConfirm && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10 rounded-2xl">
              <div className="bg-white border border-pebble rounded-xl shadow-xl p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-night">Discard changes?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  You have unsaved product details. Are you sure you want to
                  close without saving?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={resetAndClose}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {step === 2 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-pebble bg-earth flex-shrink-0">
              <button
                onClick={() => {
                  if (step === 2 && !preselectedType) { setStep(1); return; }
                  if (form.levelName || form.parentId) {
                    setShowCancelConfirm(true);
                  } else {
                    resetAndClose();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-white transition-colors"
              >
                {step === 2 && !preselectedType ? (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </>
                ) : (
                  "Cancel"
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={!canSave()}
                  className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={!canSave()}
                  className="px-4 py-2 border border-sky rounded-lg text-sm text-sky hover:bg-pale transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save & Create Another
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={!canSave()}
                  className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Search — Technology 1 */}
      <AdvancedProductSearch
        isOpen={tech1SearchOpen}
        onClose={(selected) => {
          setTech1SearchOpen(false);
          if (selected.length > 0) update("technology1", selected[0].name);
        }}
        selectionMode="single"
        contextLabel="Technology 1"
        initialProducts={initialProducts.filter((p) => p.type === "Technology")}
      />

      {/* Advanced Search — Technology 2 */}
      <AdvancedProductSearch
        isOpen={tech2SearchOpen}
        onClose={(selected) => {
          setTech2SearchOpen(false);
          if (selected.length > 0) update("technology2", selected[0].name);
        }}
        selectionMode="single"
        contextLabel="Technology 2"
        initialProducts={initialProducts.filter((p) => p.type === "Technology")}
      />

      {/* Advanced Search — Parent Product */}
      {parentAdvSearchOpen && (
        <AdvancedProductSearch
          isOpen={parentAdvSearchOpen}
          onClose={(selected) => {
            setParentAdvSearchOpen(false);
            if (selected.length > 0) selectParent(selected[0]);
          }}
          selectionMode="single"
          contextLabel={`Parent ${selectedType === "Subrange"
              ? "Format"
              : selectedType === "Variant"
                ? form.hasSubrange === "yes"
                  ? "Subrange"
                  : "Format"
                : selectedType === "Local Variant"
                  ? "Variant"
                  : "Local Variant"
            }`}
          initialProducts={initialProducts.filter((p) =>
            selectedType === "Subrange"
              ? p.type === "Format"
              : selectedType === "Variant"
                ? form.hasSubrange === "yes"
                  ? p.type === "Subrange"
                  : p.type === "Format"
                : selectedType === "Local Variant"
                  ? p.type === "Variant"
                  : p.type === "Local Variant",
          )}
        />
      )}

      {/* Formulation Document Simulator Dialog */}
      {openFormulationGeo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="px-5 py-4 border-b border-pebble bg-sky/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky" />
                <div>
                  <h3 className="text-night font-bold text-base leading-tight">Formulation Document</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {openFormulationGeo === "Technology" ? (
                      <>Product: <span className="font-semibold text-sky">Technology</span></>
                    ) : openFormulationGeo.startsWith("Primary-") ? (
                      <>
                        Geography: <span className="font-semibold text-sky">{openFormulationGeo.split("-")[2]}</span>{" "}
                        <span className="text-gray-400 font-normal">(Variant 1)</span>
                      </>
                    ) : openFormulationGeo.startsWith("Variant-") ? (
                      <>
                        Geography: <span className="font-semibold text-sky">{openFormulationGeo.split("-")[3]}</span>{" "}
                        <span className="text-gray-400 font-normal">(Variant {parseInt(openFormulationGeo.split("-")[1], 10) + 2})</span>
                      </>
                    ) : (
                      <>Geography: <span className="font-semibold text-sky">{openFormulationGeo}</span></>
                    )}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOpenFormulationGeo(null)}
                className="p-1.5 hover:bg-earth rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 border-b border-pebble flex gap-4 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setFormulationTab("fetch")}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  formulationTab === "fetch"
                    ? "border-sky text-sky"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Fetch from PLM
              </button>
              <button
                type="button"
                onClick={() => setFormulationTab("library")}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  formulationTab === "library"
                    ? "border-sky text-sky"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Document Library
              </button>
              <button
                type="button"
                onClick={() => setFormulationTab("upload")}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  formulationTab === "upload"
                    ? "border-sky text-sky"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Upload File
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {geoFormulationDocs[openFormulationGeo] ? (
                <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-night truncate">
                      {geoFormulationDocs[openFormulationGeo].name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Uploaded on {geoFormulationDocs[openFormulationGeo].uploadedAt} · {geoFormulationDocs[openFormulationGeo].size}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      PLM Validated
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/50 border border-dashed border-amber-300 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-night">No Formulation Document Linked</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Please fetch from PLM, select from library, or upload a composition document to unlock claims assessment.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab views */}
              {formulationTab === "fetch" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                      Enter CUC Specification Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={plmCucInput}
                        onChange={(e) => {
                          setPlmCucInput(e.target.value);
                          setFetchPlmError(null);
                        }}
                        placeholder="e.g. CUC-1049-284-UK-001"
                        className="flex-1 px-4 py-2.5 border border-pebble rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                      />
                      <button
                        type="button"
                        onClick={() => handleFetchFromPlm(openFormulationGeo)}
                        disabled={isFetchingPlm}
                        className="px-4 py-2.5 bg-sky text-white hover:bg-dark disabled:bg-gray-200 disabled:text-gray-400 font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2"
                      >
                        {isFetchingPlm ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          "Fetch Specs"
                        )}
                      </button>
                    </div>
                  </div>

                  {fetchPlmError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{fetchPlmError}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Connecting directly to the **PLM Database**. Fetching will automatically extract formulation composition data, verified ingredients, and validate CUC mapping.
                  </p>
                </div>
              )}

              {formulationTab === "library" && (
                <div className="space-y-2.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                    Select standard specification from document library
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {[
                      { name: "Global_Active_Formulation_A_2026.pdf", size: "2.1 MB", update: "2 days ago" },
                      { name: "Moisturizer_Base_Specs_v4.pdf", size: "950 KB", update: "1 week ago" },
                      { name: "Dry_Skin_Therapy_Cert_Final.pdf", size: "1.8 MB", update: "3 weeks ago" },
                    ].map((libDoc) => {
                      const isSelected = geoFormulationDocs[openFormulationGeo]?.name === libDoc.name;
                      return (
                        <div
                          key={libDoc.name}
                          onClick={() => handleUploadFormulationDoc(openFormulationGeo, libDoc.name, libDoc.size)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-green-500 bg-green-50/30"
                              : "border-pebble hover:border-sky/40 hover:bg-earth"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className={`w-5 h-5 ${isSelected ? "text-green-600" : "text-sky"}`} />
                            <div>
                              <div className="text-sm text-night font-semibold">{libDoc.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{libDoc.size} · Updated {libDoc.update}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white stroke-[3px]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formulationTab === "upload" && (
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-2">
                    Upload formulation specs / PDF
                  </label>
                  <div 
                    onClick={() => handleUploadFormulationDoc(openFormulationGeo, `Formulation_Spec_${openFormulationGeo.replace(/\s+/g, '_')}_v1.pdf`)}
                    className="border-2 border-dashed border-gray-200 hover:border-sky/50 hover:bg-sky/5 rounded-xl p-6 text-center cursor-pointer transition-all group animate-fade-in"
                  >
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-sky mx-auto mb-2 transition-colors" />
                    <p className="text-xs font-semibold text-gray-600 group-hover:text-sky transition-colors">
                      Click to browse or drop formulation file here
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supports PDF, XLS, DOC up to 10MB
                    </p>
                  </div>
                </div>
              )}


            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-pebble bg-gray-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpenFormulationGeo(null)}
                className="px-4 py-2 border border-pebble hover:bg-earth text-sm font-semibold rounded-lg text-night transition-colors cursor-pointer"
              >
                Close
              </button>
              {geoFormulationDocs[openFormulationGeo] && (
                <button
                  type="button"
                  onClick={() => setOpenFormulationGeo(null)}
                  className="px-4 py-2 bg-sky text-white hover:bg-dark text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Formulation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}