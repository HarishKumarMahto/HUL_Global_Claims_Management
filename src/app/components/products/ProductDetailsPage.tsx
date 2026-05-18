import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  Pencil,
  Copy,
  Trash2,
  HelpCircle,
  History,
  Plus,
  Globe,
  FileText,
  Package,
  Paperclip,
  FolderKanban,
  GitBranch,
  Check,
  X,
  ArrowLeft,
  Shield,
  AlertTriangle,
  ExternalLink,
  Archive,
  Search,
  GripVertical,
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal,
  Download,
  Users,
  Tag,
} from "lucide-react";
const ChevronRightIcon = ChevronRight;
import {
  ProductItem,
  ProductType,
  getLifecycleBadgeStyle,
  getProductTypeBg,
  getProductTypeColor,
  buildHierarchyTree,
  HierarchyNode,
} from "./productData";
import ClaimAssociationModal from "./ClaimAssociationModal";
import CopyClaimsModal from "./CopyClaimsModal";
import CreateProductModal from "./CreateProductModal";
import ImportClaimsModal from "./ImportClaimsModal";
import AuditLogModal, { AuditLogItem } from "../AuditLogModal";
import ProductVersioningModal from "./ProductVersioningModal";

export const getCreateChildLabel = (type: string): string => {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'technology':
      return "";
    case 'sku':
      return "Create SKU";
    case 'format':
      return "Create Subrange/Variant";
    case 'subrange':
      return "Create Variant";
    case 'variant':
      return "Create Local Variant";
    case 'local variant':
      return "Create SKU";
    default:
      return "Create Product";
  }
};

// ─── Section types (union of both versions) ──────────────────────────────────
export type ProductSection =
  | "Product Details"
  | "Parent Products"
  | "Available Parent Claims"
  | "Child Products"
  | "Available Child Claims"
  | "Claims"
  | "Related Claims"
  | "Related Assets"
  | "Related Regional / Local Claims"
  | "Related Projects"
  | "Audit Log";

export const SECTIONS: {
  id: ProductSection;
  icon: () => React.ReactNode;
  count?: number;
}[] = [
    {
      id: "Product Details",
      icon: () => <Package className="w-4 h-4" />,
    },
    {
      id: "Parent Products",
      icon: () => <GitBranch className="w-4 h-4" />,
      count: 1,
    },
    {
      id: "Available Parent Claims",
      icon: () => <FileText className="w-4 h-4" />,
      count: 4,
    },
    {
      id: "Child Products",
      icon: () => <Package className="w-4 h-4" />,
      count: 3,
    },
    {
      id: "Available Child Claims",
      icon: () => <FileText className="w-4 h-4" />,
      count: 2,
    },
    {
      id: "Claims",
      icon: () => <FileText className="w-4 h-4" />,
      count: 7,
    },
    {
      id: "Related Claims",
      icon: () => <FileText className="w-4 h-4" />,
      count: 8,
    },
    {
      id: "Related Assets",
      icon: () => <Paperclip className="w-4 h-4" />,
      count: 2,
    },
    {
      id: "Related Regional / Local Claims",
      icon: () => <Globe className="w-4 h-4" />,
      count: 3,
    },
    {
      id: "Related Projects",
      icon: () => <FolderKanban className="w-4 h-4" />,
      count: 2,
    },
    {
      id: "Audit Log",
      icon: () => <History className="w-4 h-4" />,
    },
  ];

interface Props {
  product: ProductItem;
  allProducts: ProductItem[];
  onBack: () => void;
  onProductChange: (p: ProductItem, editMode?: boolean) => void;
  onFavoriteToggle: (id: string) => void;
  favorites: Set<string>;
  activeSection: ProductSection;
  onSectionChange: (s: ProductSection) => void;
  initialEditMode?: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function containsId(node: HierarchyNode, id: string): boolean {
  return node.children.some(
    (c) => c.product.id === id || containsId(c, id),
  );
}

// ─── Full interactive hierarchy node (from V1) ───────────────────────────────
function InlineNodeCard({
  node,
  depth,
  favorites,
  onOpen,
  onFavoriteToggle,
  selectedId,
  onSelect,
  currentId,
  onCreateVersion,
}: {
  node: HierarchyNode;
  depth: number;
  favorites: Set<string>;
  onOpen: (p: ProductItem) => void;
  onFavoriteToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentId: string;
  onCreateVersion?: (p: ProductItem) => void;
}) {
  const [expanded, setExpanded] = useState(
    depth < 2 ||
    node.product.id === currentId ||
    containsId(node, currentId),
  );
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { product, children } = node;
  const isFav = favorites.has(product.id);
  const isCurrent = product.id === currentId;
  const isSelected = selectedId === product.id;
  const lcStyle = getLifecycleBadgeStyle(
    product.lifecycleState,
  );
  const typeColor = getProductTypeColor(product.type);
  const typeBg = getProductTypeBg(product.type);
  const hasChildren = children.length > 0;

  const depthColors = [
    "#0066CC",
    "#47A3FF",
    "#85C2FF",
    "#C2E0FF",
    "#DBEAFE",
    "#EFF6FF",
  ];
  const lineColor =
    depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background: `${lineColor}50`,
            marginLeft: `${(depth - 1) * 24 + 12}px`,
          }}
        />
      )}
      <div
        className="group relative"
        style={{ paddingLeft: `${depth * 24}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setMenuOpen(false);
        }}
      >
        {depth > 0 && (
          <div
            className="absolute top-5 h-px"
            style={{
              background: `${lineColor}50`,
              left: `${(depth - 1) * 24 + 12}px`,
              width: 12,
            }}
          />
        )}
        <div
          className={`relative flex items-start gap-2 p-3 mb-1 rounded-xl border transition-all cursor-pointer ${isCurrent
            ? "border-sky bg-pale shadow-sm shadow-sky/10"
            : isSelected
              ? "border-sky/60 bg-pale/50"
              : "border-pebble bg-white hover:border-sky/40 hover:shadow-sm"
            }`}
          onClick={() => onSelect(product.id)}
        >
          {/* Expand toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${hasChildren ? "hover:bg-earth" : "invisible"}`}
          >
            {hasChildren &&
              (expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
              ))}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm truncate ${isCurrent ? "text-sky" : "text-night"}`}
                    style={{
                      fontWeight: isCurrent ? 600 : 500,
                    }}
                  >
                    {product.name}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-sky px-1.5 py-0.5 bg-sky/10 rounded">
                      Current
                    </span>
                  )}
                  {isFav && (
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: typeBg,
                      color: typeColor,
                      fontWeight: 500,
                    }}
                  >
                    {product.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: lcStyle.dot }}
                    />
                    <span
                      className="px-1.5 py-0.5 rounded-full text-xs"
                      style={{
                        background: lcStyle.bg,
                        color: lcStyle.text,
                      }}
                    >
                      {product.lifecycleState}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {product.productId}
                  </span>
                </div>
              </div>

              {/* Hover actions */}
              {hovered && (
                <div
                  className="flex items-center gap-1 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onFavoriteToggle(product.id)}
                    className="p-1.5 rounded-lg hover:bg-earth transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                    />
                  </button>
                  <button
                    onClick={() => onOpen(product)}
                    className="px-2.5 py-1 rounded-lg bg-sky text-white hover:bg-dark transition-colors text-xs"
                  >
                    Open
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-1.5 rounded-lg hover:bg-earth transition-colors"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {menuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 w-64 overflow-hidden">
                          {/* Create New Version — top of tree node menu */}
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              if (onCreateVersion) {
                                onCreateVersion(product);
                              } else {
                                onOpen(product);
                              }
                            }}
                            disabled={product.lifecycleState === 'Cancelled'}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-sky hover:bg-sky/5 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed border-b border-pebble/50"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-sky" />
                            Create New Version
                          </button>
                          {[
                            {
                              label: "Edit Product",
                              icon: (
                                <Pencil className="w-3.5 h-3.5" />
                              ),
                            },
                            {
                              label: getCreateChildLabel(product.type),
                              icon: (
                                <Plus className="w-3.5 h-3.5" />
                              ),
                            },
                            {
                              label: "Copy Product",
                              icon: (
                                <Copy className="w-3.5 h-3.5" />
                              ),
                            },
                            {
                              label: "Copy Claims",
                              icon: (
                                <FileText className="w-3.5 h-3.5" />
                              ),
                            },
                            {
                              label: "Audit Log",
                              icon: (
                                <History className="w-3.5 h-3.5" />
                              ),
                            },
                          ].map((a) => (
                            <button
                              key={a.label}
                              onClick={() => {
                                setMenuOpen(false);
                                onOpen(product);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-night hover:bg-earth transition-colors text-left"
                            >
                              <span className="text-gray-400">
                                {a.icon}
                              </span>
                              {a.label}
                            </button>
                          ))}
                          <div className="border-t border-pebble">
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              Cancel Product
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {product.geographyCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Globe className="w-3 h-3" />
                  {product.geographyCount}
                </div>
              )}
              {product.claimsCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(product);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {product.claimsCount} claims
                </button>
              )}
              {product.projectsCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(product);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky transition-colors"
                >
                  <FolderKanban className="w-3 h-3" />
                  {product.projectsCount} projects
                </button>
              )}
              {product.technology1 && (
                <div className="flex items-center gap-1 text-xs text-purple-500">
                  <span className="text-purple-400">⚗</span>
                  {product.technology1}
                </div>
              )}
              {hasChildren && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <GitBranch className="w-3 h-3" />
                  {children.length}{" "}
                  {children.length === 1 ? "child" : "children"}
                </div>
              )}
            </div>
          </div>
        </div>

        {expanded && hasChildren && (
          <div>
            {children.map((child) => (
              <InlineNodeCard
                key={child.product.id}
                node={child}
                depth={depth + 1}
                favorites={favorites}
                onOpen={onOpen}
                onFavoriteToggle={onFavoriteToggle}
                selectedId={selectedId}
                onSelect={onSelect}
                currentId={currentId}
                onCreateVersion={onCreateVersion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline Hierarchy Widget (from V1, searchable + filterable) ───────────────
function InlineHierarchyWidget({
  product,
  allProducts,
  favorites,
  onProductChange,
  onFavoriteToggle,
  onCreateVersion,
}: {
  product: ProductItem;
  allProducts: ProductItem[];
  favorites: Set<string>;
  onProductChange: (p: ProductItem) => void;
  onFavoriteToggle: (id: string) => void;
  onCreateVersion: (p: ProductItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [lcFilter, setLcFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    product.id,
  );

  const tree = buildHierarchyTree(allProducts);
  const productBrand = tree.find(
    (b) => b.brandName === product.brand,
  );

  function filterNodes(
    nodes: HierarchyNode[],
    q: string,
    lc: string,
  ): HierarchyNode[] {
    return nodes.reduce((acc, node) => {
      const filteredChildren = filterNodes(
        node.children,
        q,
        lc,
      );
      const matches =
        (!q ||
          node.product.name
            .toLowerCase()
            .includes(q.toLowerCase()) ||
          node.product.productId
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!lc || node.product.lifecycleState === lc);
      if (matches || filteredChildren.length > 0)
        acc.push({ ...node, children: filteredChildren });
      return acc;
    }, [] as HierarchyNode[]);
  }

  const filteredNodes = productBrand
    ? filterNodes(productBrand.formats, search, lcFilter)
    : [];

  return (
    <div className="border border-pebble rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-earth border-b border-pebble">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hierarchy..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-pebble rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        <select
          value={lcFilter}
          onChange={(e) => setLcFilter(e.target.value)}
          className="appearance-none pl-3 pr-7 py-1.5 border border-pebble rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky"
        >
          <option value="">All States</option>
          {["Created", "In-use", "Obsolete", "Cancelled"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </select>
        {(search || lcFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setLcFilter("");
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Brand header */}
      {productBrand && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-pebble">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #0066CC, #004D99)",
              fontWeight: 700,
            }}
          >
            {productBrand.brandName.charAt(0)}
          </div>
          <div>
            <div
              className="text-sm text-night"
              style={{ fontWeight: 600 }}
            >
              {productBrand.brandName}
            </div>
            <div className="text-xs text-gray-400">
              {productBrand.formats.length} format
              {productBrand.formats.length !== 1 ? "s" : ""} ·{" "}
              {
                allProducts.filter(
                  (p) => p.brand === productBrand.brandName,
                ).length
              }{" "}
              products
            </div>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="p-3 max-h-96 overflow-y-auto">
        {filteredNodes.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {!productBrand
              ? "No hierarchy available for this product"
              : "No results match your filter"}
          </div>
        ) : (
          filteredNodes.map((node) => (
            <InlineNodeCard
              key={node.product.id}
              node={node}
              depth={0}
              favorites={favorites}
              onOpen={onProductChange}
              onFavoriteToggle={onFavoriteToggle}
              selectedId={selectedId}
              onSelect={setSelectedId}
              currentId={product.id}
              onCreateVersion={onCreateVersion}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function AttrCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="bg-earth rounded-xl p-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-sm text-night">{value}</div>
    </div>
  );
}

const AUDIT_ENTRIES = [
  {
    field: "Lifecycle State",
    old: "Created",
    new: "In-use",
    by: "System",
    dt: "2026-04-10 14:32",
  },
  {
    field: "Technology 1",
    old: "—",
    new: "MicroMoisture Technology",
    by: "Sarah Johnson",
    dt: "2026-04-08 09:15",
  },
  {
    field: "Tier",
    old: "—",
    new: "Standard",
    by: "Sarah Johnson",
    dt: "2026-04-08 09:10",
  },
  {
    field: "Description",
    old: "—",
    new: "Regular intensive repair body wash…",
    by: "Sarah Johnson",
    dt: "2026-04-05 11:00",
  },
  {
    field: "Target Audience",
    old: "—",
    new: "Adults 25–45",
    by: "Michael Chen",
    dt: "2026-03-28 16:22",
  },
];

const lcMap: Record<string, { bg: string; text: string }> = {
  Assessed: { bg: "#D1FAE5", text: "#065F46" },
  Proposed: { bg: "#DBEAFE", text: "#1D4ED8" },
  "In Review": { bg: "#FEF3C7", text: "#92400E" },
};

type PClaimStatus =
  | "Assessed"
  | "Proposed"
  | "In Review"
  | "Approved"
  | "Rejected";
type PRiskLevel = "low" | "medium" | "high";

const CLAIM_STATUS_STYLES: Record<PClaimStatus, string> = {
  Assessed: "bg-green-100 text-green-700",
  Approved: "bg-green-100 text-green-700",
  Proposed: "bg-blue-100 text-blue-700",
  "In Review": "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const RISK_COLOR: Record<PRiskLevel, string> = {
  low: "text-green-600",
  medium: "text-amber-600",
  high: "text-orange-600",
};

const ALL_PRODUCT_CLAIMS = [
  {
    id: "CLM-001",
    text: "Clinically proven to hydrate skin for 24 hours",
    lifecycle: "Assessed" as PClaimStatus,
    risk: "low" as PRiskLevel,
    channel: "All Channels",
    strategy: "Clinical Study",
    version: "v2.1",
    order: 1,
    productName: "Dove Body Wash Intensive Repair",
    restrictedUse: false,
    restrictedUseComment: "",
    claimIdentifier: "Clinical Performance",
    claimCategories: ["Hydration", "Skin Care"],
    geography: "Global",
    relatedProjects: ["PRJ-001"],
    challenged: false,
    copiedFrom: "",
    riskAssessment: "Completed by R&D on 2025-10-10",
    lifecycleToAssessed: "Legal approved on 2025-10-15",
    riskInputs: "Clinical trial data attached",
  },
  {
    id: "CLM-002",
    text: "Leaves skin visibly smoother after first use",
    lifecycle: "Proposed" as PClaimStatus,
    risk: "medium" as PRiskLevel,
    channel: "Digital",
    strategy: "Consumer Research",
    version: "v1.3",
    order: 2,
    productName: "Dove Body Wash Intensive Repair",
    restrictedUse: true,
    restrictedUseComment: "Do not use in EMEA without disclaimer",
    claimIdentifier: "Consumer Perception",
    claimCategories: ["Appearance", "Fast Acting"],
    geography: "North America",
    relatedProjects: ["PRJ-004"],
    challenged: true,
    copiedFrom: "CLM-000",
    riskAssessment: "Pending Legal Review",
    lifecycleToAssessed: "Awaiting RA inputs",
    riskInputs: "Consumer survey results",
  },
  {
    id: "CLM-003",
    text: "Contains 1/4 moisturising milk",
    lifecycle: "Assessed" as PClaimStatus,
    risk: "low" as PRiskLevel,
    channel: "All Channels",
    strategy: "Formulation Data",
    version: "v3.0",
    order: 3,
    productName: "Dove Body Wash Intensive Repair",
    restrictedUse: false,
    restrictedUseComment: "",
    claimIdentifier: "Ingredient",
    claimCategories: ["Formulation"],
    geography: "Global",
    relatedProjects: [],
    challenged: false,
    copiedFrom: "",
    riskAssessment: "Self-assessed",
    lifecycleToAssessed: "Approved by formulation lead",
    riskInputs: "BOM review",
  },
  {
    id: "CLM-004",
    text: "Dermatologist tested formula",
    lifecycle: "Assessed" as PClaimStatus,
    risk: "low" as PRiskLevel,
    channel: "All Channels",
    strategy: "Expert Endorsement",
    version: "v1.2",
    order: 4,
    productName: "Dove Body Wash Intensive Repair",
    restrictedUse: false,
    restrictedUseComment: "",
    claimIdentifier: "Endorsement",
    claimCategories: ["Safety", "Expert"],
    geography: "Global",
    relatedProjects: ["PRJ-012"],
    challenged: false,
    copiedFrom: "",
    riskAssessment: "Dermatology panel sign-off",
    lifecycleToAssessed: "Legal approved",
    riskInputs: "Panel study #442",
  },
];

const REGIONAL_CLAIMS = [
  {
    id: "RC-001",
    text: "Proven to strengthen skin barrier function (EMEA)",
    lifecycle: "In Review" as PClaimStatus,
    risk: "medium" as PRiskLevel,
    channel: "All Channels",
    strategy: "Clinical Data (EFSA)",
    version: "v1.0",
  },
  {
    id: "RC-002",
    text: "Restores skin's natural moisture in 7 days (North America)",
    lifecycle: "In Review" as PClaimStatus,
    risk: "high" as PRiskLevel,
    channel: "TV, Digital, OOH",
    strategy: "US Consumer Use Study",
    version: "v1.1",
  },
  {
    id: "RC-003",
    text: "BIS-certified skin care formula (India)",
    lifecycle: "Proposed" as PClaimStatus,
    risk: "low" as PRiskLevel,
    channel: "All Channels",
    strategy: "BIS Certification IS 6608",
    version: "v1.0",
  },
];

// Flat list used by the simple "Related Claims" section (V2-style)
const RELATED_CLAIMS_SIMPLE = ALL_PRODUCT_CLAIMS.map(
  ({ id, text, lifecycle, risk, channel, strategy }) => ({
    id,
    text,
    lifecycle,
    risk,
    channel,
    strategy,
  }),
);

const LOCAL_REGIONAL_CLAIMS = [
  {
    geo: "United Kingdom",
    type: "Local Variant",
    id: "LV-UK-001",
    state: "In-use",
    claims: 4,
    cuc: "CUC-2026-UK-041",
  },
  {
    geo: "Germany",
    type: "Local Variant",
    id: "LV-DE-002",
    state: "Created",
    claims: 3,
    cuc: "CUC-2026-DE-042",
  },
  {
    geo: "India",
    type: "SKU",
    id: "CU-IN-001",
    state: "Created",
    claims: 2,
    cuc: "CUC-2026-IN-015",
  },
];

// ─── Collapsible claims block with column configurator (from V1) ─────────────
function ProductClaimBlock({
  title,
  description,
  claims,
  onAddClaim,
  onImportClaims,
}: {
  title: string;
  description: string;
  claims: typeof ALL_PRODUCT_CLAIMS;
  onAddClaim: () => void;
  onImportClaims?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [showColCfg, setShowColCfg] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    version: true,
    status: true,
    channel: true,
    risk: true,
    strategy: true,
  });

  const filtered = claims.filter((c) => {
    const matchSearch =
      !searchQuery ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      !statusFilter || c.lifecycle === statusFilter;
    const matchRisk = !riskFilter || c.risk === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const toggleCol = (col: keyof typeof visibleCols) =>
    setVisibleCols((prev) => ({ ...prev, [col]: !prev[col] }));

  return (
    <div className="bg-white rounded-xl border border-pebble overflow-hidden mb-4">
      {/* Section header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-earth transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-sky" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-sky" />
          )}
          <div className="text-left">
            <div
              className="text-sm text-night"
              style={{ fontWeight: 600 }}
            >
              {title}
            </div>
            <div className="text-xs text-gray-500">
              {description} · {filtered.length} claims
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-gray-500 bg-earth px-2 py-1 rounded">
            {filtered.length}
          </span>
          {/* Column configurator */}
          <div className="relative">
            <button
              onClick={() => setShowColCfg(!showColCfg)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${showColCfg ? "border-sky text-sky bg-pale" : "border-pebble text-gray-500 hover:bg-earth"}`}
            >
              <Settings className="w-3 h-3" />
              Cols
            </button>
            {showColCfg && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowColCfg(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-52 overflow-hidden">
                  <div
                    className="px-4 py-2.5 border-b border-pebble text-xs text-gray-500 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    Visible Columns
                  </div>
                  <div className="p-2">
                    {(
                      Object.keys(
                        visibleCols,
                      ) as (keyof typeof visibleCols)[]
                    ).map((col) => (
                      <button
                        key={col}
                        onClick={() => toggleCol(col)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth text-left transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${visibleCols[col] ? "bg-sky border-sky" : "border-gray-300"}`}
                        >
                          {visibleCols[col] && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-night capitalize">
                          {col === "risk"
                            ? "Risk Level"
                            : col === "strategy"
                              ? "Support Strategy"
                              : col}
                        </span>
                        <span className="ml-auto">
                          {visibleCols[col] ? (
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-pebble">
                    <button
                      onClick={() => setShowColCfg(false)}
                      className="w-full text-center text-xs text-sky hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onImportClaims && (
              <button
                onClick={onImportClaims}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-pebble text-night rounded-lg hover:bg-earth transition-colors"
              >
                <Download className="w-3 h-3" /> Import
              </button>
            )}
            <button
              onClick={onAddClaim}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-sky text-white rounded-lg hover:bg-dark transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-pebble">
          {/* Search + filters */}
          <div className="flex items-center gap-3 px-5 py-3 bg-earth/40 border-b border-pebble">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-pebble rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="appearance-none pl-3 pr-7 py-1.5 border border-pebble rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky cursor-pointer"
              >
                <option value="">All Statuses</option>
                {(
                  [
                    "Assessed",
                    "Proposed",
                    "In Review",
                    "Approved",
                    "Rejected",
                  ] as PClaimStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 border border-pebble rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-sky cursor-pointer"
              >
                <option value="">All Risk Levels</option>
                {(
                  ["low", "medium", "high"] as PRiskLevel[]
                ).map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {(statusFilter || riskFilter) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setRiskFilter("");
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Claims table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth">
                <tr>
                  <th className="w-8 px-2 py-2.5" />
                  <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide min-w-[240px]">
                    Claim Statement
                  </th>
                  {visibleCols.version && (
                    <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide w-16">
                      Ver.
                    </th>
                  )}
                  {visibleCols.status && (
                    <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  )}
                  {visibleCols.channel && (
                    <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Channel
                    </th>
                  )}
                  {visibleCols.risk && (
                    <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Risk Level
                    </th>
                  )}
                  {visibleCols.strategy && (
                    <th className="px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Support Strategy
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <>
                    <tr
                      key={claim.id}
                      className={`border-b border-pebble hover:bg-earth cursor-pointer transition-colors ${expandedRow === claim.id ? "bg-pale/30" : ""}`}
                      onClick={() =>
                        setExpandedRow((prev) =>
                          prev === claim.id ? null : claim.id,
                        )
                      }
                    >
                      <td className="px-2 py-3">
                        <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors mx-auto" />
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-night hover:text-sky transition-colors text-left group flex items-center gap-1"
                            style={{ fontWeight: 500 }}
                          >
                            {claim.text}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-sky" />
                          </button>
                          {expandedRow !== claim.id && (
                            <div className="text-xs text-gray-400 mt-0.5 font-mono">
                              {claim.id}
                            </div>
                          )}
                        </div>
                      </td>
                      {visibleCols.version && (
                        <td className="px-3 py-3">
                          <span className="text-xs bg-earth text-gray-600 px-1.5 py-0.5 rounded">
                            {claim.version}
                          </span>
                        </td>
                      )}
                      {visibleCols.status && (
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${CLAIM_STATUS_STYLES[claim.lifecycle]}`}
                          >
                            {claim.lifecycle}
                          </span>
                        </td>
                      )}
                      {visibleCols.channel && (
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {claim.channel}
                        </td>
                      )}
                      {visibleCols.risk && (
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            {claim.risk === "low" ? (
                              <Shield className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <AlertTriangle
                                className={`w-3.5 h-3.5 ${claim.risk === "medium" ? "text-amber-500" : "text-orange-500"}`}
                              />
                            )}
                            <span
                              className={`text-xs capitalize ${RISK_COLOR[claim.risk]}`}
                              style={{ fontWeight: 500 }}
                            >
                              {claim.risk}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleCols.strategy && (
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {claim.strategy}
                        </td>
                      )}
                    </tr>
                    {expandedRow === claim.id && (
                      <tr key={`${claim.id}-exp`}>
                        <td
                          colSpan={7}
                          className="px-0 py-0 border-b-2 border-sky"
                        >
                          <div className="bg-pale/30 border-l-4 border-sky px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400">
                                  {claim.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${CLAIM_STATUS_STYLES[claim.lifecycle]}`}
                                >
                                  {claim.lifecycle}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setExpandedRow(null)
                                }
                                className="p-1 hover:bg-earth rounded"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            {/* Extended Claim Details Grid */}
                            <div className="grid grid-cols-3 gap-y-6 gap-x-6">
                              <div className="col-span-3">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Claim Statement</div>
                                <div className="text-sm text-night bg-white p-3 rounded-lg border border-pebble">{claim.text}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Product Name</div>
                                <div className="text-sm text-night">{(claim as any).productName || "N/A"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Version & Order</div>
                                <div className="text-sm text-night">Version: {claim.version} &nbsp;|&nbsp; Order: {(claim as any).order || 1}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Marketing Channels</div>
                                <div className="text-sm text-night">{claim.channel}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  Final Risk Level
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help" title="Editable By: Claims Lead / R&D / Legal">Roles</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                  {claim.risk === "low" ? (
                                    <Shield className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <AlertTriangle className={`w-3.5 h-3.5 ${claim.risk === "medium" ? "text-amber-500" : "text-orange-500"}`} />
                                  )}
                                  <span className={`capitalize ${RISK_COLOR[claim.risk]}`} style={{ fontWeight: 500 }}>{claim.risk}</span>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Restricted Use</div>
                                <div className="text-sm text-night">
                                  {(claim as any).restrictedUse ? <span className="text-orange-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Yes</span> : "No"}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Restricted Use Comment</div>
                                <div className="text-sm text-night">{(claim as any).restrictedUseComment || "—"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Claim Identifier</div>
                                <div className="text-sm text-night">{(claim as any).claimIdentifier || "N/A"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Claim Categories</div>
                                <div className="flex flex-wrap gap-1">
                                  {((claim as any).claimCategories || []).map((c: string) => (
                                    <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{c}</span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Geography</div>
                                <div className="text-sm text-night">{(claim as any).geography || "Global"}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Related Projects</div>
                                <div className="flex flex-wrap gap-1">
                                  {((claim as any).relatedProjects || []).length > 0 ? ((claim as any).relatedProjects || []).map((p: string) => (
                                    <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p}</span>
                                  )) : <span className="text-sm text-night">—</span>}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Challenged</div>
                                <div className="text-sm text-night">
                                  {(claim as any).challenged ? <span className="text-red-500 font-medium">Yes</span> : "No"}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Copied From</div>
                                <div className="text-sm text-night font-medium">
                                  {(claim as any).copiedFrom || "—"}
                                </div>
                              </div>

                              {/* Editable Review Sections */}
                              <div className="col-span-3 grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-pebble border-dashed">
                                <div className="bg-white p-3 rounded-lg border border-pebble relative group">
                                  <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-sky opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    Support Strategy
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help" title="Editable By: Claims Lead / R&D / Legal">Roles</span>
                                  </div>
                                  <div className="text-sm text-night">{claim.strategy}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-pebble relative group">
                                  <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-sky opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    Risk Assessment
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help" title="Editable By: Legal / RA / R&D / Claims Lead">Roles</span>
                                  </div>
                                  <div className="text-sm text-night">{(claim as any).riskAssessment || "Pending"}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-pebble relative group">
                                  <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-sky opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    Lifecycle to Assessed
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help" title="Editable By: Legal / Claims Lead">Roles</span>
                                  </div>
                                  <div className="text-sm text-night">{(claim as any).lifecycleToAssessed || "Pending"}</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-pebble relative group">
                                  <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-sky opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    Risk Inputs
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help" title="Editable By: Legal / RA / R&D">Roles</span>
                                  </div>
                                  <div className="text-sm text-night">{(claim as any).riskInputs || "N/A"}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      No claims match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// // ─── Regional & Local Adaptations cards block (from V1) ──────────────────────
// function AdaptationsBlock() {
//   const [expanded, setExpanded] = useState(true);

//   return (
//     <div className="bg-white rounded-xl border border-pebble overflow-hidden mb-4">
//       <button
//         className="w-full flex items-center justify-between px-5 py-4 hover:bg-earth transition-colors"
//         onClick={() => setExpanded(!expanded)}
//       >
//         <div className="flex items-center gap-3">
//           {expanded
//             ? <ChevronDown className="w-4 h-4 text-sky" />
//             : <ChevronRightIcon className="w-4 h-4 text-sky" />}
//           <div className="text-left">
//             <div className="text-sm text-night" style={{ fontWeight: 600 }}>Regional &amp; Local Adaptations</div>
//             <div className="text-xs text-gray-500">Local variants and regional adaptations · {ADAPTATIONS.length} entries</div>
//           </div>
//         </div>
//         <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
//           <span className="text-xs text-gray-500 bg-earth px-2 py-1 rounded">{ADAPTATIONS.length}</span>
//           <button className="flex items-center gap-1 text-xs px-3 py-1.5 bg-sky text-white rounded-lg hover:bg-dark ml-1 transition-colors">
//             <Plus className="w-3 h-3" /> Add Adaptation
//           </button>
//         </div>
//       </button>
//       {expanded && (
//         <div className="border-t border-pebble p-5">
//           <div className="grid grid-cols-3 gap-3">
//             {ADAPTATIONS.map(item => {
//               const ls = getLifecycleBadgeStyle(item.state as any);
//               return (
//                 <div key={item.id}
//                   className="border border-pebble rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer hover:border-sky group">
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       <Globe className="w-4 h-4 text-sky" />
//                       <span className="text-sm text-night" style={{ fontWeight: 500 }}>{item.geo}</span>
//                     </div>
//                     <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
//                       style={{ background: ls.bg, color: ls.text }}>{item.state}</span>
//                   </div>
//                   <div className="text-xs text-gray-400 mb-2">{item.type} · <span className="font-mono">{item.id}</span></div>
//                   <div className="text-xs text-sky font-mono mb-3">{item.cuc}</div>
//                   <div className="flex items-center justify-between text-xs text-gray-500">
//                     <span>{item.claims} claims</span>
//                     <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky" />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Merged Claims section (V1 combined view) ──────────────────
function ClaimsSection({
  onAddClaim,
  onImportClaims,
}: {
  onAddClaim: () => void;
  onImportClaims: () => void;
}) {
  const totalClaims =
    ALL_PRODUCT_CLAIMS.length + REGIONAL_CLAIMS.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Manage all claims and regional claims associated
          with this product
        </p>
        <span className="text-xs text-gray-500 bg-earth px-2.5 py-1 rounded-lg">
          {totalClaims} total claims
        </span>
      </div>
      <ProductClaimBlock
        title="Related Claims"
        description="Core claims applicable across all markets"
        claims={ALL_PRODUCT_CLAIMS}
        onAddClaim={onAddClaim}
        onImportClaims={onImportClaims}
      />
      <ProductClaimBlock
        title="Regional &amp; Local Claims"
        description="Claims adapted for specific regional regulatory requirements"
        claims={REGIONAL_CLAIMS}
        onAddClaim={onAddClaim}
        onImportClaims={onImportClaims}
      />
      {/* <AdaptationsBlock /> */}
    </div>
  );
}

const mapProductEntriesToLogs = (entries: any[]): AuditLogItem[] => {
  return entries.map((entry, index) => {
    let type: 'create' | 'update' | 'delete' | 'status' | 'link' | 'system' = 'update';
    if (entry.field === 'Lifecycle State') {
      type = 'status';
    } else if (entry.by === 'System') {
      type = 'system';
    }

    return {
      id: `prod-det-log-${index}`,
      timestamp: entry.dt,
      actor: entry.by,
      role: entry.by === 'System' ? 'System' : 'Product Lead',
      action: `Modified ${entry.field}`,
      details: `Field "${entry.field}" modified from "${entry.old}" to "${entry.new}".`,
      type
    };
  });
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetailsPage({
  product,
  allProducts,
  onBack,
  onProductChange,
  onFavoriteToggle,
  favorites,
  activeSection,
  onSectionChange,
  initialEditMode = false,
}: Props) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [showClaimAssoc, setShowClaimAssoc] = useState(false);
  const [showCopyClaims, setShowCopyClaims] = useState(false);
  const [showImportClaims, setShowImportClaims] =
    useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editForm, setEditForm] = useState({ ...product });
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [childPreselectedType, setChildPreselectedType] = useState<ProductType | undefined>(undefined);
  const [showFormatChildPrompt, setShowFormatChildPrompt] = useState(false);
  const [versioningSource, setVersioningSource] = useState<ProductItem | null>(null);

  const handleCreateChildClick = () => {
    if (product.type === "Format") {
      setShowFormatChildPrompt(true);
    } else {
      let type: ProductType = "Variant";
      if (product.type === "Subrange") {
        type = "Variant";
      } else if (product.type === "Variant") {
        type = "Local Variant";
      } else if (product.type === "Local Variant") {
        type = "SKU";
      } else if (product.type === "Technology") {
        type = "Technology";
      }
      setChildPreselectedType(type);
      setShowCreateChild(true);
    }
  };
  const [showCancelConfirm, setShowCancelConfirm] =
    useState(false);
  const [showObsoleteConfirm, setShowObsoleteConfirm] =
    useState(false);
  const [localShowAudit, setLocalShowAudit] = useState(false);

  useEffect(() => {
    setEditForm({ ...product });
    setIsEditing(initialEditMode);
  }, [product, initialEditMode]);

  const isFav = favorites.has(product.id);
  const lcStyle = getLifecycleBadgeStyle(
    product.lifecycleState,
  );
  const typeColor = getProductTypeColor(product.type);
  const typeBg = getProductTypeBg(product.type);
  const isInUse = product.lifecycleState === "In-use";

  const tree = buildHierarchyTree(allProducts);
  const productBrand = tree.find(
    (b) => b.brandName === product.brand,
  );

  const allIds = allProducts.map((p) => p.id);
  const currentIdx = allIds.indexOf(product.id);
  const prevProduct =
    currentIdx > 0 ? allProducts[currentIdx - 1] : null;
  const nextProduct =
    currentIdx < allProducts.length - 1
      ? allProducts[currentIdx + 1]
      : null;

  // Editable attribute (US-M3-052)
  const EditableAttr = ({
    label,
    field,
    options,
  }: {
    label: string;
    field: keyof ProductItem;
    options?: string[];
  }) => {
    const val = (editForm[field] as string) || "";
    if (!isEditing) {
      if (!val) return null;
      return <AttrCard label={label} value={val} />;
    }
    return (
      <div className="bg-earth rounded-xl p-3">
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
          {label}
        </label>
        {options ? (
          <select
            value={val}
            onChange={(e) =>
              setEditForm((f) => ({
                ...f,
                [field]: e.target.value,
              }))
            }
            className="w-full bg-white border border-pebble rounded-lg px-2 py-1.5 text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={val}
            onChange={(e) =>
              setEditForm((f) => ({
                ...f,
                [field]: e.target.value,
              }))
            }
            className="w-full bg-white border border-pebble rounded-lg px-2 py-1.5 text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky"
          />
        )}
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      // ── Product Details ──────────────────────────────────────────────────
      case "Product Details":
        return (
          <div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2 mb-4">
              {/* Comprehensive Product Details Fields */}
              <EditableAttr label="Product Name" field="name" />
              <AttrCard
                label="Product Hierarchy"
                value={`${product.type}`}
              />
              <AttrCard label="Business Group (BG)" value={product.businessGroup} />
              <AttrCard label="Category" value={product.category} />
              <AttrCard label="Brand" value={product.brand} />

              <EditableAttr label="Technology Linkage (Primary)" field="technology1" />
              <EditableAttr label="Consumer Benefit Platform" field="consumerBenefitPlatform" />
              <EditableAttr label="Target Audience" field="targetAudience" />

              <AttrCard
                label="Product ID"
                value={
                  <span className="font-mono text-sky">
                    {product.productId}
                  </span>
                }
              />
              <AttrCard
                label="Lifecycle State"
                value={
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: lcStyle.bg,
                      color: lcStyle.text,
                    }}
                  >
                    {product.lifecycleState}
                  </span>
                }
              />

              {/* Additional optional fields based on product type */}
              {(product.type === 'Subrange' || product.type === 'Variant' ||
                product.type === 'Local Variant' || product.type === 'SKU') && (
                  <EditableAttr label="Technology 2" field="technology2" />
                )}
              {(product.type === 'Subrange' || product.type === 'Variant') && (
                <EditableAttr label="Tier" field="tier" />
              )}

              {/* Geographies - shown for Local Variant and SKU */}
              {(product.type === 'Local Variant' || product.type === 'SKU') &&
                product.geographies.length > 0 && (
                  <AttrCard
                    label="Geographies"
                    value={
                      <div className="flex flex-wrap gap-1">
                        {product.geographies.map((g) => (
                          <span
                            key={g}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}

              {/* CUC Specification Number - shown for Local Variant and SKU */}
              {(product.type === 'Local Variant' || product.type === 'SKU') &&
                product.cucSpecNumber && (
                  <AttrCard
                    label="CUC Specification Number"
                    value={
                      <span className="font-mono text-sky">
                        {product.cucSpecNumber}
                      </span>
                    }
                  />
                )}

              {/* Version info — shown when product has versioning metadata */}
              {product.versionNumber && (
                <div className="col-span-full">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-earth rounded-xl flex-1 min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Version Number</div>
                        <div className="text-sm text-night font-mono font-bold">{product.versionNumber}</div>
                      </div>
                    </div>
                    {product.versionedFrom && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-earth rounded-xl flex-1 min-w-0">
                        <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-400 uppercase tracking-wide">Versioned From</div>
                          <div className="text-sm text-night font-medium truncate">{product.versionedFrom.name}</div>
                          <div className="text-xs text-sky font-mono">{product.versionedFrom.versionNumber}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Versions created from this product */}
              {product.productVersions && product.productVersions.length > 0 && (
                <div className="col-span-full">
                  <div className="border border-pebble rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-earth border-b border-pebble">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Versions</span>
                      <span className="ml-auto text-xs bg-sky/10 text-sky px-2 py-0.5 rounded-full">{product.productVersions.length}</span>
                    </div>
                    <div className="divide-y divide-pebble">
                      {product.productVersions.map(ver => (
                        <div key={ver.productId} className="flex items-center gap-3 px-4 py-3 hover:bg-earth transition-colors">
                          <span className="text-xs font-mono font-bold text-sky bg-sky/10 px-2 py-0.5 rounded-full">{ver.versionNumber}</span>
                          <span className="text-sm text-night truncate flex-1">{ver.name}</span>
                          <span className="text-xs font-mono text-gray-400">{ver.productId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <AttrCard
                label="Created By"
                value={product.createdBy}
              />
              <AttrCard
                label="Created Date"
                value={new Date(
                  product.createdDate,
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <AttrCard
                label="Last Modified"
                value={new Date(
                  product.lastModified,
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>

            <div className="mb-6 bg-earth rounded-xl p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">
                Description
              </div>
              {isEditing ? (
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-4 bg-white rounded-xl text-sm text-night border border-pebble focus:outline-none focus:ring-2 focus:ring-sky resize-none shadow-sm"
                  placeholder="Describe this product..."
                />
              ) : (
                <div className="text-sm text-night leading-relaxed">
                  {product.description || <span className="text-gray-400 italic">No description provided.</span>}
                </div>
              )}
            </div>

            {/* Searchable hierarchy widget (V1) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-400" />
                  <span
                    className="text-sm text-gray-500 uppercase tracking-wide"
                    style={{ fontWeight: 500 }}
                  >
                    Product Hierarchy
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {
                    allProducts.filter(
                      (p) => p.brand === product.brand,
                    ).length
                  }{" "}
                  products in brand
                </div>
              </div>
              <InlineHierarchyWidget
                product={product}
                allProducts={allProducts}
                favorites={favorites}
                onProductChange={onProductChange}
                onFavoriteToggle={onFavoriteToggle}
                onCreateVersion={setVersioningSource}
              />
            </div>
          </div>
        );

      // ── Claims (merged, V1) ────────────────────────────────
      case "Claims":
        return (
          <ClaimsSection
            onAddClaim={() => setShowClaimAssoc(true)}
            onImportClaims={() => setShowImportClaims(true)}
          />
        );

      // ── Related Claims (simple table, V2) ────────────────────────────────
      case "Related Claims":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {RELATED_CLAIMS_SIMPLE.length} claims associated
                with this product
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportClaims(true)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Import Claims
                </button>
                <button
                  onClick={() => setShowClaimAssoc(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Claims
                </button>
              </div>
            </div>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Claim Statement
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Lifecycle
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Strategy
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Channel
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RELATED_CLAIMS_SIMPLE.map((claim, i) => {
                    const ls = lcMap[claim.lifecycle] || {
                      bg: "#F3F4F6",
                      text: "#6B7280",
                    };
                    return (
                      <tr
                        key={claim.id}
                        className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-earth/30"}`}
                      >
                        <td className="px-4 py-3">
                          <button className="text-night hover:text-sky transition-colors text-left flex items-center gap-1 group">
                            {claim.text}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-sky" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-sky">
                          {claim.id}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: ls.bg,
                              color: ls.text,
                            }}
                          >
                            {claim.lifecycle}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {claim.risk === "low" ? (
                              <Shield className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="text-xs capitalize text-gray-600">
                              {claim.risk}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {claim.strategy}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {claim.channel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── Available Parent Claims ──────────────────────────────────────────
      case "Available Parent Claims":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Claims from parent products available for
                inheritance
              </p>
              <button
                onClick={() => setShowClaimAssoc(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add from Parent
              </button>
            </div>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Claim Statement
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Source Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Product Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Lifecycle
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Risk
                    </th>
                    <th className="px-4 py-3 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "PC-001",
                      text: "NutriumMoisture technology — clinically tested",
                      source: "Dove Body Wash",
                      productType: "Format",
                      lifecycle: "Assessed",
                      risk: "low",
                    },
                    {
                      id: "PC-002",
                      text: "Pro-Ceramide skin barrier strengthening",
                      source: "Dove Body Wash",
                      productType: "Format",
                      lifecycle: "Assessed",
                      risk: "low",
                    },
                    {
                      id: "PC-003",
                      text: "Dermatologist recommended",
                      source: "Dove",
                      productType: "Technology",
                      lifecycle: "In Review",
                      risk: "medium",
                    },
                    {
                      id: "PC-004",
                      text: "98% naturally derived ingredients",
                      source: "Dove",
                      productType: "Technology",
                      lifecycle: "Proposed",
                      risk: "low",
                    },
                  ].map((claim, i) => {
                    const ls = lcMap[claim.lifecycle] || {
                      bg: "#F3F4F6",
                      text: "#6B7280",
                    };
                    return (
                      <tr
                        key={claim.id}
                        className={`border-b border-pebble hover:bg-earth transition-colors ${i % 2 === 0 ? "" : "bg-earth/30"}`}
                      >
                        <td className="px-4 py-3 text-night">
                          {claim.text}
                        </td>
                        <td className="px-4 py-3 text-xs text-sky">
                          {claim.source}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-earth text-gray-600 text-xs border border-pebble">
                            {claim.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: ls.bg,
                              color: ls.text,
                            }}
                          >
                            {claim.lifecycle}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {claim.risk === "low" ? (
                              <Shield className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="text-xs capitalize text-gray-600">
                              {claim.risk}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-2 py-1 text-xs bg-sky text-white rounded-lg hover:bg-dark transition-colors">
                            Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── Available Child Claims ───────────────────────────────────────────
      case "Available Child Claims":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Claims from child products that may require review
              at this level
            </p>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Claim Statement
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Source Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Product Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Lifecycle
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Geography
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "CC-001",
                      text: "BIS-certified formula",
                      source: "Dove IR BW India",
                      productType: "SKU",
                      lifecycle: "Proposed",
                      geo: "India",
                    },
                    {
                      id: "CC-002",
                      text: "Restores natural moisture in 7 days",
                      source:
                        "Dove IR BW North America",
                      productType: "Variant",
                      lifecycle: "In Review",
                      geo: "North America",
                    },
                  ].map((claim, i) => {
                    const ls = lcMap[claim.lifecycle] || {
                      bg: "#F3F4F6",
                      text: "#6B7280",
                    };
                    return (
                      <tr
                        key={claim.id}
                        className={`border-b border-pebble hover:bg-earth transition-colors ${i % 2 === 0 ? "" : "bg-earth/30"}`}
                      >
                        <td className="px-4 py-3 text-night">
                          {claim.text}
                        </td>
                        <td className="px-4 py-3 text-xs text-sky">
                          {claim.source}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-earth text-gray-600 text-xs border border-pebble">
                            {claim.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: ls.bg,
                              color: ls.text,
                            }}
                          >
                            {claim.lifecycle}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {claim.geo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── Related Assets ───────────────────────────────────────────────────
      case "Related Assets":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Assets supporting this product's claims
              </p>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Link Asset
              </button>
            </div>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Asset Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Clinical Study Report 2026",
                      type: "Study Report",
                      status: "Approved",
                      date: "2026-02-15",
                    },
                    {
                      name: "Consumer Perception Study",
                      type: "Clinical Data",
                      status: "Approved",
                      date: "2026-03-10",
                    },
                  ].map((asset, i) => (
                    <tr
                      key={asset.name}
                      className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-earth/30"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-night">
                            {asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {asset.date}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-earth rounded text-gray-400 hover:text-sky transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ── Related Regional / Local Claims (dedicated section, V2) ────
      case "Related Regional / Local Claims":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Regional and local claims of this product
              </p>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add Claim
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOCAL_REGIONAL_CLAIMS.map((item) => {
                const ls = getLifecycleBadgeStyle(
                  item.state as any,
                );
                return (
                  <div
                    key={item.id}
                    className="border border-pebble rounded-xl p-4 bg-white hover:shadow-sm transition-shadow cursor-pointer hover:border-sky group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky" />
                        <span
                          className="text-sm text-night"
                          style={{ fontWeight: 500 }}
                        >
                          {item.geo}
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: ls.bg,
                          color: ls.text,
                        }}
                      >
                        {item.state}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {item.type} ·{" "}
                      <span className="font-mono">
                        {item.id}
                      </span>
                    </div>
                    <div className="text-xs text-sky font-mono mb-3">
                      {item.cuc}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.claims} claims</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── Related Projects ─────────────────────────────────────────────────
      case "Related Projects": {
        const relatedProjects = [
          {
            name: "Dove Intensive Repair Claims Project",
            id: "PRJ-2026-001",
            status: "In Progress",
            lead: "Sarah Johnson",
            stage: "Substantiate",
          },
          {
            name: "Vaseline Intensive Care Reformulation",
            id: "PRJ-2026-008",
            status: "In Progress",
            lead: "Matthew Jackson",
            stage: "Review & Risk Assessment",
          },
        ];
        return (
          <div>
            <div className="text-sm text-gray-500 mb-4">
              {relatedProjects.length} projects using this
              product
            </div>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Project Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Project ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                      Lead
                    </th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {relatedProjects.map((proj, i) => (
                    <tr
                      key={proj.id}
                      className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-earth/30"}`}
                    >
                      <td className="px-4 py-3">
                        <button className="text-sky hover:underline text-left flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5 flex-shrink-0" />
                          {proj.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">
                        {proj.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {proj.stage}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {proj.lead}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-earth rounded text-gray-400 hover:text-sky transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      // ── Child Products ───────────────────────────────────────────────────
      case "Child Products": {
        const children = allProducts.filter(
          (p) => p.parentId === product.id,
        );
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {children.length} child products
              </div>
              <button
                onClick={handleCreateChildClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {getCreateChildLabel(product.type)}
              </button>
            </div>
            {children.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {children.map((child) => {
                  const cls = getLifecycleBadgeStyle(
                    child.lifecycleState,
                  );
                  return (
                    <div
                      key={child.id}
                      onClick={() => onProductChange(child)}
                      className="border border-pebble rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-white hover:border-sky"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="text-sm text-night"
                          style={{ fontWeight: 500 }}
                        >
                          {child.name}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                          style={{
                            background: cls.bg,
                            color: cls.text,
                          }}
                        >
                          {child.lifecycleState}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {child.productId}
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <span>{child.claimsCount} claims</span>
                        <span>
                          {child.projectsCount} projects
                        </span>
                        {child.geographies.length > 0 && (
                          <span>{child.geographies[0]}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                No child products found
              </div>
            )}
          </div>
        );
      }

      // ── Parent Products ──────────────────────────────────────────────────
      case "Parent Products": {
        const parent = product.parentId
          ? allProducts.find((p) => p.id === product.parentId)
          : null;
        return (
          <div>
            {parent ? (
              <div
                onClick={() => onProductChange(parent)}
                className="border border-pebble rounded-xl p-5 bg-white hover:shadow-md transition-shadow cursor-pointer hover:border-sky"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="text-sm text-night"
                      style={{ fontWeight: 600 }}
                    >
                      {parent.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {parent.productId} · {parent.type}
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: getLifecycleBadgeStyle(
                        parent.lifecycleState,
                      ).bg,
                      color: getLifecycleBadgeStyle(
                        parent.lifecycleState,
                      ).text,
                    }}
                  >
                    {parent.lifecycleState}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div>
                    <div className="text-xs text-gray-400">
                      Brand
                    </div>
                    <div className="text-sm text-night">
                      {parent.brand}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">
                      Category
                    </div>
                    <div className="text-sm text-night">
                      {parent.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">
                      Claims
                    </div>
                    <div className="text-sm text-night">
                      {parent.claimsCount}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                {product.type === "Format" ||
                  product.type === "Technology"
                  ? "This is a top-level product with no parent."
                  : "No parent product found."}
              </div>
            )}
          </div>
        );
      }

      case "Audit Log":
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-pebble rounded-2xl shadow-sm p-8">
            <div className="w-16 h-16 bg-sky/10 rounded-2xl flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-sky" />
            </div>
            <h4 className="text-night font-bold text-lg mb-1">Audit Log Pop-up Opened</h4>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              We have launched the complete product audit trail in a centralized pop-up overlay.
            </p>
            <button
              onClick={() => {
                onSectionChange("Product Details");
              }}
              className="mt-6 px-4 py-2 bg-earth hover:bg-pebble/30 text-night rounded-lg text-xs font-semibold transition-colors border border-pebble"
            >
              Go Back to Details Tab
            </button>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-earth rounded-xl flex items-center justify-center mb-3">
              {SECTIONS.find(
                (s) => s.id === activeSection,
              )?.icon()}
            </div>
            <div className="text-sm text-gray-500">
              {activeSection}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Content coming soon
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header (V2 two-row layout) ────────────────────────────────────── */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        {/* Row 1: breadcrumb + actions + navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-sky transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Products
            </button>
            <span>/</span>
            <span className="text-night truncate max-w-[300px]">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Record navigation */}
            <div className="flex items-center border border-pebble rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() =>
                  prevProduct && onProductChange(prevProduct)
                }
                disabled={!prevProduct}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-r border-pebble"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="px-2.5 text-xs text-gray-500 font-medium">
                {currentIdx + 1} / {allProducts.length}
              </span>
              <button
                onClick={() =>
                  nextProduct && onProductChange(nextProduct)
                }
                disabled={!nextProduct}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-l border-pebble"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>


            {/* Actions dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setActionMenuOpen(!actionMenuOpen)
                }
                className="flex items-center gap-2 px-3 py-1.5 border border-pebble rounded-lg text-sm transition-colors shadow-sm text-night hover:bg-earth bg-white"
              >
                Actions <ChevronDown className="w-4 h-4" />
              </button>
              {actionMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActionMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 w-64 overflow-hidden">
                    {/* Create New Version */}
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setVersioningSource(product);
                      }}
                      disabled={product.lifecycleState === 'Cancelled'}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <GitBranch className="w-4 h-4 text-sky" />
                      <div className="flex flex-col items-start">
                        <span>Create New Version</span>
                        {product.productVersions && product.productVersions.length > 0 && (
                          <span className="text-xs text-gray-400">{product.productVersions.length} existing version{product.productVersions.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </button>
                    <div className="border-t border-pebble/50 mx-3" />
                    {product.type.toLowerCase() !== 'technology' && (
                      <button
                        onClick={() => {
                          setActionMenuOpen(false);
                          handleCreateChildClick();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                        {getCreateChildLabel(product.type)}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setShowCreateChild(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                      Copy Product
                    </button>
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setShowCopyClaims(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      Copy Claims
                    </button>
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setShowImportClaims(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      Import Claims
                    </button>
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setLocalShowAudit(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <History className="w-4 h-4 text-gray-400" />
                      Audit Log
                    </button>
                    <button
                      onClick={() => {
                        setActionMenuOpen(false);
                        setShowObsoleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      Mark as Obsolete
                    </button>
                    <div className="border-t border-pebble">
                      <button
                        onClick={() => {
                          setActionMenuOpen(false);
                          setShowCancelConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel Product
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: identity */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => onFavoriteToggle(product.id)}
            className="mt-1 flex-shrink-0"
          >
            <Star
              className={`w-5 h-5 transition-all ${isFav ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-night truncate">
                {product.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-earth text-gray-500 flex-shrink-0">
                {product.productId}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                style={{
                  background: lcStyle.bg,
                  color: lcStyle.text,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: lcStyle.dot }}
                />
                {product.lifecycleState}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                style={{ background: typeBg, color: typeColor }}
              >
                {product.type}
              </span>
              {product.businessGroup && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky/10 text-sky border border-sky/20 rounded-full text-xs flex-shrink-0">
                  {product.businessGroup}
                </span>
              )}
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                {product.category}
              </span>
              {product.geographies.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs flex-shrink-0">
                  <Globe className="w-3 h-3" />
                  {product.geographies.length === 1
                    ? product.geographies[0]
                    : `${product.geographies.length} geographies`}
                </span>
              )}
              <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs flex-shrink-0">
                {product.claimsCount} Claims
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 bg-transparent">
        {activeSection === "Claims" ? (
          renderSection()
        ) : (
          <div className="bg-white rounded-xl border border-pebble p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>
                {activeSection}
              </h3>
              {activeSection === "Product Details" && (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setEditForm({ ...product });
                          setIsEditing(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-pebble text-night rounded-lg hover:bg-earth transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />Discard
                      </button>
                      <button
                        onClick={() => {
                          onProductChange(editForm);
                          setIsEditing(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg hover:bg-dark transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-sky text-sky rounded-lg hover:bg-pale transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-2"
                    >
                      <Pencil className="w-4 h-4" />Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditing && activeSection === "Product Details" && (
              <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>You are in edit mode. Changes are not yet saved.</span>
              </div>
            )}

            {renderSection()}
          </div>
        )}
      </main>

      {/* ── Cancel confirmation (US-M3-056) ───────────────────────────────── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/40 backdrop-blur-sm"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-night">Cancel Product?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Cancelling{" "}
              <span className="font-medium text-night">
                "{product.name}"
              </span>{" "}
              will remove it from active use. This action cannot
              be easily undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth"
              >
                Keep Product
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Cancel Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark as Obsolete confirmation (US-M3-037) ─────────────────────── */}
      {showObsoleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/40 backdrop-blur-sm"
            onClick={() => setShowObsoleteConfirm(false)}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Archive className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-night">Mark as Obsolete?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              This marks{" "}
              <span className="font-medium text-night">
                "{product.name}"
              </span>{" "}
              as Obsolete — it will remain for historical
              reference but will no longer appear in active
              product lists.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowObsoleteConfirm(false)}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowObsoleteConfirm(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
              >
                Mark Obsolete
              </button>
            </div>
          </div>
        </div>
      )}

      <ClaimAssociationModal
        isOpen={showClaimAssoc}
        onClose={() => setShowClaimAssoc(false)}
        productName={product.name}
      />
      <CopyClaimsModal
        isOpen={showCopyClaims}
        onClose={() => setShowCopyClaims(false)}
        sourceProduct={product}
      />
      <ImportClaimsModal
        isOpen={showImportClaims}
        onClose={() => setShowImportClaims(false)}
        targetProduct={product}
        allProducts={allProducts}
        onImport={(
          sourceProductId,
          claimIds,
          copySubstantiations,
        ) => {
          console.log("Importing claims:", {
            sourceProductId,
            claimIds,
            copySubstantiations,
          });
          // In a real implementation, this would create new claim records in the backend
        }}
      />
      {showCreateChild && (
        <CreateProductModal
          isOpen={showCreateChild}
          onClose={() => setShowCreateChild(false)}
          onCreate={() => setShowCreateChild(false)}
          preselectedType={childPreselectedType}
        />
      )}
      {versioningSource && (
        <ProductVersioningModal
          isOpen={true}
          onClose={() => setVersioningSource(null)}
          sourceProduct={versioningSource}
          allProducts={allProducts}
          onVersionCreated={(newProduct, updatedSource) => {
            setVersioningSource(null);
            // Update source product in parent state
            onProductChange(updatedSource);
            onProductChange(newProduct);
          }}
        />
      )}

      {showFormatChildPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/40 backdrop-blur-sm"
            onClick={() => setShowFormatChildPrompt(false)}
          />
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 relative z-10 border border-pebble">
            {/* Close icon at top of pop-up */}
            <button
              onClick={() => setShowFormatChildPrompt(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-earth rounded-lg transition-colors text-gray-400 hover:text-night"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-6">
              <div className="p-2.5 bg-sky/10 rounded-xl">
                <HelpCircle className="w-5 h-5 text-sky" />
              </div>
              <h3 className="text-night font-bold text-lg">{getCreateChildLabel(product.type)}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Do you want to create a <strong className="text-night font-semibold">Subrange</strong>?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFormatChildPrompt(false);
                  setChildPreselectedType("Subrange");
                  setShowCreateChild(true);
                }}
                className="px-4 py-2 border border-pebble text-night rounded-lg text-xs hover:bg-earth transition-colors font-medium"
              >
                yes
              </button>
              <button
                onClick={() => {
                  setShowFormatChildPrompt(false);
                  setChildPreselectedType("Variant");
                  setShowCreateChild(true);
                }}
                className="px-4 py-2 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky/50 font-bold"
              >
                No(Create a variant)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {(activeSection === "Audit Log" || localShowAudit) && (
        <AuditLogModal
          isOpen={activeSection === "Audit Log" || localShowAudit}
          onClose={() => {
            setLocalShowAudit(false);
            if (activeSection === "Audit Log") {
              onSectionChange("Product Details");
            }
          }}
          title="Product Audit Trail"
          itemName={product.name}
          itemId={product.productId}
          logs={mapProductEntriesToLogs(AUDIT_ENTRIES)}
        />
      )}
    </div>
  );
}