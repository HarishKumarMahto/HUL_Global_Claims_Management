import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  FolderOpen,
  Bookmark,
  LayoutGrid,
  Info,
  Users,
  Globe,
  Package,
  FileText,
  Paperclip,
  Layers,
  GitBranch,
  Shield,
  History,
  Plus,
} from "lucide-react";
import type { ReactElement } from "react";
import type { ProductModuleView } from "./products/ProductsModule";
import type { ProductSection } from "./products/ProductDetailsPage";
import type { ClaimBaseView, ClaimWorkView, Claim, ClaimType } from "../types";
import type { SavedView } from "./SavedViewsModal";

type WorkspaceSection =
  | "Project Details"
  | "Project Team"
  | "Geography"
  | "Related Products"
  | "Related Claims"
  // | 'Risk & Review'
  | "Project Documents"
  | "Related Assets";

interface LeftNavigationProps {
  activeModule: string;
  activeView: string;
  onViewChange: (view: string) => void;
  isInWorkspace?: boolean;
  activeWorkspaceSection?: WorkspaceSection;
  onWorkspaceSectionChange?: (section: WorkspaceSection) => void;
  activeProductView?: ProductModuleView;
  onProductViewChange?: (view: ProductModuleView) => void;
  activeProductListView?: string;
  onProductListViewChange?: (view: string) => void;
  isInProductDetail?: boolean;
  // Product detail section nav
  activeProductSection?: ProductSection;
  onProductSectionChange?: (s: ProductSection) => void;
  // Claims module nav
  activeClaimsBaseView?: ClaimBaseView;
  onClaimsBaseViewChange?: (view: ClaimBaseView) => void;
  activeClaimsWorkView?: ClaimWorkView | null;
  onClaimsWorkViewChange?: (view: ClaimWorkView | null) => void;
  isInClaimsWorkspace?: boolean;
  activeClaimsWorkspaceSection?: string;
  onClaimsWorkspaceSectionChange?: (section: string) => void;
  claims?: Claim[];
  onClaimClick?: (claim: Claim) => void;
  // Home module nav
  onModuleChange?: (module: string, view?: string | null) => void;
  // Assets module nav
  activeAssetsLibraryView?: string;
  onAssetsLibraryViewChange?: (view: string) => void;
  isInAssetWorkspace?: boolean;
  activeAssetSection?: string;
  onAssetSectionChange?: (section: string) => void;
  // Project & Product Saved Views additions
  projectSavedViews?: SavedView[];
  onSelectProjectSavedView?: (view: SavedView) => void;
  productSavedViews?: any[];
  onSelectProductSavedView?: (view: any) => void;
  relatedClaimsSubFilter?: string;
  onRelatedClaimsSubFilterChange?: (filter: string) => void;
  // Documents module nav
  activeDocumentsLibraryView?: string;
  onDocumentsLibraryViewChange?: (view: string) => void;
  isInDocumentWorkspace?: boolean;
  activeDocumentSection?: string;
  onDocumentSectionChange?: (section: string) => void;
  selectedDocument?: any;
}

const PROJECT_VIEWS = [
  {
    id: "My Projects",
    label: "My Projects",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "All Projects",
    label: "All Projects",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: "Recent Projects",
    label: "Recent",
    icon: <Clock className="w-4 h-4" />,
  },
  { id: "Favorites", label: "Favorites", icon: <Star className="w-4 h-4" /> },
  {
    id: "Saved Views",
    label: "Saved Views",
    icon: <Bookmark className="w-4 h-4" />,
  },
];

const ASSET_VIEWS = [
  {
    id: "My Assets",
    label: "My Assets",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "All Assets",
    label: "All Assets",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  { id: "Favorites", label: "Favorites", icon: <Star className="w-4 h-4" /> },
  {
    id: "Recently Viewed",
    label: "Recent",
    icon: <Clock className="w-4 h-4" />,
  },
];

const DOCUMENT_VIEWS = [
  {
    id: "My Documents",
    label: "My Documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "All Documents",
    label: "All Documents",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: "Substantiation Evidence",
    label: "Substantiation Evidence",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "Formulation Documents",
    label: "Formulation Documents",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "Project Documents",
    label: "Project Documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
];

const DOCUMENT_WORKSPACE_SECTIONS = [
  {
    id: "Document Details",
    label: "Document Details",
    icon: <Info className="w-4 h-4" />,
  },
  {
    id: "Related Claims",
    label: "Related Claims",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "Related Assets",
    label: "Related Assets",
    icon: <Paperclip className="w-4 h-4" />,
  },
  {
    id: "Related Products",
    label: "Related Products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "Version History",
    label: "Version History",
    icon: <History className="w-4 h-4" />,
  },
  { id: "Comments", label: "Comments", icon: <FileText className="w-4 h-4" /> },
];

const ASSET_WORKSPACE_SECTIONS = [
  {
    id: "Asset Details",
    label: "Asset Details",
    icon: <Info className="w-4 h-4" />,
  },
  {
    id: "Support Strategy & Substantiation",
    label: "Support Strategy & Substantiation",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "Final Risk Level Summary",
    label: "Final Risk Level Summary",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "Risk Level Assessments",
    label: "Risk Level Assessments",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: "Approval Workflow",
    label: "Approval Workflow",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "Linked Claims",
    label: "Linked Claims",
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: "Related Projects",
    label: "Related Projects",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "Related Products",
    label: "Related Products",
    icon: <Package className="w-4 h-4" />,
  },
];

const PRODUCT_VIEWS = [
  {
    id: "My Products",
    label: "My Products",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "All Products",
    label: "All Products",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: "Recent Products",
    label: "Recent",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "Favorite Products",
    label: "Favorites",
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: "Saved Views",
    label: "Saved Views",
    icon: <Bookmark className="w-4 h-4" />,
  },
  {
    id: "Product Hierarchy",
    label: "Product Hierarchy",
    icon: <GitBranch className="w-4 h-4" />,
  },
];

const WORKSPACE_SECTIONS: {
  id: WorkspaceSection;
  label: string;
  icon: ReactElement;
}[] = [
  {
    id: "Project Details",
    label: "Project Details",
    icon: <Info className="w-4 h-4" />,
  },
  { id: "Geography", label: "Geography", icon: <Globe className="w-4 h-4" /> },
  {
    id: "Project Team",
    label: "Project Team",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "Related Products",
    label: "Related Products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "Related Claims",
    label: "Related Claims",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "Related Assets",
    label: "Related Assets",
    icon: <Paperclip className="w-4 h-4" />,
  },
  {
    id: "Project Documents",
    label: "Project Documents",
    icon: <FileText className="w-4 h-4" />,
  },
  // { id: 'Risk & Review', label: 'Risk & Review', icon: <Shield className="w-4 h-4" /> },
];

export default function LeftNavigation({
  activeModule,
  activeView,
  onViewChange,
  isInWorkspace = false,
  activeWorkspaceSection = "Project Details",
  onWorkspaceSectionChange,
  activeProductView,
  onProductViewChange,
  activeProductListView = "All Products",
  onProductListViewChange,
  isInProductDetail = false,
  // Product detail section nav
  activeProductSection,
  onProductSectionChange,
  // Claims module nav
  activeClaimsBaseView = "Global Claims",
  onClaimsBaseViewChange,
  activeClaimsWorkView = null,
  onClaimsWorkViewChange,
  isInClaimsWorkspace = false,
  activeClaimsWorkspaceSection = "Claim Details",
  onClaimsWorkspaceSectionChange,
  // Home module nav
  onModuleChange,
  claims = [],
  onClaimClick,
  // Assets module nav
  activeAssetsLibraryView = "All Assets",
  onAssetsLibraryViewChange,
  isInAssetWorkspace = false,
  activeAssetSection = "Asset Details",
  onAssetSectionChange,
  projectSavedViews = [],
  onSelectProjectSavedView,
  productSavedViews = [],
  onSelectProductSavedView,
  relatedClaimsSubFilter = "all",
  onRelatedClaimsSubFilterChange,
  activeDocumentsLibraryView = "My Documents",
  onDocumentsLibraryViewChange,
  isInDocumentWorkspace = false,
  activeDocumentSection = "Document Details",
  onDocumentSectionChange,
  selectedDocument,
}: LeftNavigationProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isSavedViewsFolderExpanded, setIsSavedViewsFolderExpanded] =
    useState(true);
  const [
    isProductSavedViewsFolderExpanded,
    setIsProductSavedViewsFolderExpanded,
  ] = useState(true);
  const [isRelatedClaimsExpanded, setIsRelatedClaimsExpanded] = useState(true);
  const [expandedClaimSections, setExpandedClaimSections] = useState<
    Record<ClaimBaseView, boolean>
  >({
    "Global Claims": true,
    "Regional Claims": false,
    "Local Claims": false,
    "Local Claims SKU": false,
  });
  // US-M4-003: sub-section open state per view
  const [claimSubOpen, setClaimSubOpen] = useState<
    Record<string, "recents" | "favorites" | null>
  >({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMyAssetDropdownExpanded, setIsMyAssetDropdownExpanded] = useState(false);

  useEffect(() => {
    if (activeView && activeView.startsWith("My Asset:")) {
      setIsMyAssetDropdownExpanded(true);
    }
  }, [activeView]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const sidebarClass = `bg-white border-r border-pebble flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative ${
    isCollapsed ? "w-0" : "w-64"
  }`;

  const CollapseButton = () => (
    <button
      onClick={toggleSidebar}
      className={`absolute top-6 -right-3 z-35 w-6 h-6 bg-white border border-pebble rounded-full flex items-center justify-center text-gray-400 hover:text-sky hover:border-sky shadow-sm transition-transform duration-300 ${isCollapsed ? "translate-x-3 rotate-180" : ""}`}
      title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );

  const CLAIM_TYPE_MAP: Record<ClaimBaseView, ClaimType> = {
    "Global Claims": "Global",
    "Regional Claims": "Regional",
    "Local Claims": "Local",
    "Local Claims SKU": "Local SKU",
  };

  // ─── HOME MODULE ──────────────────────────────────────────────────────────
  if (activeModule === "Home") {
    return null;
  }

  // ─── USER MANAGEMENT ──────────────────────────────────────────────────────
  if (activeModule === "UserManagement") {
    return null; // Module has its own built-in left panel
  }

  // ─── DOCUMENTS MODULE ──────────────────────────────────────────────
  if (activeModule === "Documents" && !isInDocumentWorkspace) {
    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="px-4 py-3 border-b border-pebble">
            <div
              className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              <FileText className="w-3.5 h-3.5" />
              Library Views
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              {DOCUMENT_VIEWS.map((view) => {
                const isActive = activeDocumentsLibraryView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => onDocumentsLibraryViewChange?.(view.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${isActive ? "bg-pale text-sky" : "text-gray-600 hover:bg-earth hover:text-night"}`}
                  >
                    <span className={isActive ? "text-sky" : "text-gray-400"}>
                      {view.icon}
                    </span>
                    <span
                      className="flex-1 text-left"
                      style={{ fontWeight: isActive ? 500 : 400 }}
                    >
                      {view.label}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  if (activeModule === "Documents" && isInDocumentWorkspace) {
    const isSubstantiationEvidence =
      selectedDocument?.documentType === "Substantiation Evidence";
    const sectionsToRender = DOCUMENT_WORKSPACE_SECTIONS.filter((s) => {
      if (isSubstantiationEvidence) {
        return [
          "Document Details",
          "Related Claims",
          "Related Assets",
          "Related Products",
        ].includes(s.id);
      }
      return true;
    }).map((s) => {
      if (isSubstantiationEvidence && s.id === "Document Details") {
        return { ...s, label: "Substantiation Evidence Details" };
      }
      return s;
    });

    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="px-4 py-3 border-b border-pebble">
            <div
              className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              <Layers className="w-3.5 h-3.5" />
              Document Workspace
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              {sectionsToRender.map((section) => {
                const isActive = activeDocumentSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => onDocumentSectionChange?.(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${isActive ? "bg-pale text-sky" : "text-gray-600 hover:bg-earth hover:text-night"}`}
                  >
                    <span className={isActive ? "text-sky" : "text-gray-400"}>
                      {section.icon}
                    </span>
                    <span
                      className="flex-1 text-left truncate"
                      style={{ fontWeight: isActive ? 500 : 400 }}
                    >
                      {section.label}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  // ─── ASSETS MODULE ────────────────────────────────────────────────────────
  if (activeModule === "Assets" && !isInAssetWorkspace) {
    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="px-4 py-3 border-b border-pebble">
            <div
              className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              <Paperclip className="w-3.5 h-3.5" />
              Library Views
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              {ASSET_VIEWS.map((view) => {
                const isActive = activeAssetsLibraryView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => onAssetsLibraryViewChange?.(view.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                      isActive
                        ? "bg-pale text-sky"
                        : "text-gray-600 hover:bg-earth hover:text-night"
                    }`}
                  >
                    <span className={isActive ? "text-sky" : "text-gray-400"}>
                      {view.icon}
                    </span>
                    <span
                      className="flex-1 text-left"
                      style={{ fontWeight: isActive ? 500 : 400 }}
                    >
                      {view.label}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
          {/* <div className="p-3 border-t border-pebble">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 500 }}>Actions</div>
            <button className="w-full bg-sky text-white rounded-lg px-4 py-2.5 text-sm hover:bg-dark transition-all duration-150 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Create Asset
            </button>
          </div> */}
        </div>
      </aside>
    );
  }

  // ─── ASSETS WORKSPACE ─────────────────────────────────────────────────────
  if (activeModule === "Assets" && isInAssetWorkspace) {
    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="px-4 py-3 border-b border-pebble">
            <div
              className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              <Layers className="w-3.5 h-3.5" />
              Asset Workspace
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              {ASSET_WORKSPACE_SECTIONS.map((section) => {
                const isActive = activeAssetSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => onAssetSectionChange?.(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                      isActive
                        ? "bg-pale text-sky"
                        : "text-gray-600 hover:bg-earth hover:text-night"
                    }`}
                  >
                    <span className={isActive ? "text-sky" : "text-gray-400"}>
                      {section.icon}
                    </span>
                    <span
                      className="flex-1 text-left truncate"
                      style={{ fontWeight: isActive ? 500 : 400 }}
                    >
                      {section.label}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  // ─── PROJECT WORKSPACE ────────────────────────────────────────────────────
  if (isInWorkspace) {
    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="px-4 py-3 border-b border-pebble">
            <div
              className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              <Layers className="w-3.5 h-3.5" />
              Project Workspace
            </div>
          </div>
          <nav className="p-3 flex-1">
            <div className="space-y-0.5">
              {WORKSPACE_SECTIONS.map((section) => {
                const isActive = activeWorkspaceSection === section.id;
                const isRelatedClaims = section.id === "Related Claims";
                return (
                  <div key={section.id} className="space-y-0.5">
                    <div
                      onClick={() => {
                        onWorkspaceSectionChange?.(section.id);
                        if (isRelatedClaims) {
                          onRelatedClaimsSubFilterChange?.("all");
                          setIsRelatedClaimsExpanded(true);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm cursor-pointer ${
                        isActive
                          ? "bg-pale text-sky"
                          : "text-gray-600 hover:bg-earth hover:text-night"
                      }`}
                    >
                      <span className={isActive ? "text-sky" : "text-gray-400"}>
                        {section.icon}
                      </span>
                      <span
                        className="flex-1 text-left"
                        style={{ fontWeight: isActive ? 500 : 400 }}
                      >
                        {section.label}
                      </span>
                      {isRelatedClaims && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRelatedClaimsExpanded(
                              !isRelatedClaimsExpanded,
                            );
                          }}
                          className="p-1 hover:bg-earth/60 rounded transition-colors text-gray-400 hover:text-night flex items-center justify-center flex-shrink-0"
                        >
                          {isRelatedClaimsExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {isActive && !isRelatedClaims && (
                        <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                      )}
                    </div>
                    {isRelatedClaims && isRelatedClaimsExpanded && (
                      <div className="ml-7 pl-2 border-l border-pebble space-y-0.5 mt-1 mb-1">
                        {[
                          { label: "Global", id: "global" },
                          { label: "Regional", id: "regional" },
                          { label: "Local Claim", id: "local" },
                          { label: "SKU Claim", id: "local_sku" },
                        ].map((sub) => {
                          const isSubActive =
                            activeWorkspaceSection === "Related Claims" &&
                            relatedClaimsSubFilter === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onWorkspaceSectionChange?.("Related Claims");
                                onRelatedClaimsSubFilterChange?.(sub.id);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                                isSubActive
                                  ? "bg-sky/10 text-sky font-semibold"
                                  : "text-gray-500 hover:bg-earth hover:text-night"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${isSubActive ? "bg-sky" : "bg-gray-300"}`}
                              />
                              <span className="text-left flex-1 truncate">
                                {sub.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
          <div className="px-4 py-3 border-t border-pebble">
            <div className="text-xs text-gray-400">
              {WORKSPACE_SECTIONS.findIndex(
                (s) => s.id === activeWorkspaceSection,
              ) + 1}{" "}
              / {WORKSPACE_SECTIONS.length} sections
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ─── PRODUCTS MODULE ──────────────────────────────────────────────────────
  if (activeModule === "Products") {
    if (isInProductDetail) {
      const PRODUCT_DETAIL_SECTIONS: {
        label: ProductSection;
        icon: ReactElement;
        count?: number;
      }[] = [
        { label: "Product Details", icon: <Package className="w-4 h-4" /> },
        {
          label: "Parent Products",
          icon: <GitBranch className="w-4 h-4" />,
          count: 1,
        },
        { label: "Claims", icon: <FileText className="w-4 h-4" />, count: 7 },
        {
          label: "Available Parent Claims",
          icon: <FileText className="w-4 h-4" />,
          count: 4,
        },
        {
          label: "Available Child Claims",
          icon: <FileText className="w-4 h-4" />,
          count: 2,
        },
        {
          label: "Child Products",
          icon: <Package className="w-4 h-4" />,
          count: 3,
        },
        {
          label: "Related Assets",
          icon: <Paperclip className="w-4 h-4" />,
          count: 2,
        },
        {
          label: "Related Projects",
          icon: <FolderOpen className="w-4 h-4" />,
          count: 2,
        },
      ];
      return (
        <aside className={sidebarClass}>
          <CollapseButton />
          <div
            className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
          >
            <div className="px-4 py-3 border-b border-pebble">
              <div
                className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
                style={{ fontWeight: 500 }}
              >
                <Package className="w-3.5 h-3.5" />
                Product Details
              </div>
            </div>
            <nav className="p-3 flex-1 overflow-y-auto">
              <div className="space-y-0.5">
                {PRODUCT_DETAIL_SECTIONS.map((section) => {
                  const isActive = activeProductSection === section.label;
                  return (
                    <button
                      key={section.label}
                      onClick={() => onProductSectionChange?.(section.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                        isActive
                          ? "bg-pale text-sky"
                          : "text-gray-600 hover:bg-earth hover:text-night"
                      }`}
                    >
                      <span className={isActive ? "text-sky" : "text-gray-400"}>
                        {section.icon}
                      </span>
                      <span
                        className="flex-1 text-left truncate"
                        style={{ fontWeight: isActive ? 500 : 400 }}
                      >
                        {section.label}
                      </span>
                      {section.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs flex-shrink-0 ${isActive ? "bg-sky/20 text-sky" : "bg-earth text-gray-400"}`}
                        >
                          {section.count}
                        </span>
                      )}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>
      );
    }

    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="p-3 flex-1">
            <div className="mb-2">
              <button
                onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 uppercase tracking-wide hover:text-night transition-all duration-150 rounded-lg hover:bg-earth"
              >
                <span>Products</span>
                {isProductsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isProductsExpanded && (
                <nav className="mt-1 space-y-0.5">
                  {PRODUCT_VIEWS.map((view) => {
                    if (view.id === "Saved Views") {
                      const isAnyProdSavedActive =
                        activeProductListView.startsWith("Saved:");
                      return (
                        <div key={view.id} className="space-y-0.5">
                          <button
                            onClick={() => {
                              setIsProductSavedViewsFolderExpanded(
                                !isProductSavedViewsFolderExpanded,
                              );
                              onProductListViewChange?.("Saved Views");
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                              isAnyProdSavedActive ||
                              activeProductListView === "Saved Views"
                                ? "bg-pale text-sky"
                                : "text-gray-600 hover:bg-earth hover:text-night"
                            }`}
                          >
                            <span
                              className={
                                isAnyProdSavedActive ||
                                activeProductListView === "Saved Views"
                                  ? "text-sky"
                                  : "text-gray-400"
                              }
                            >
                              {view.icon}
                            </span>
                            <span
                              className="flex-1 text-left"
                              style={{
                                fontWeight:
                                  isAnyProdSavedActive ||
                                  activeProductListView === "Saved Views"
                                    ? 500
                                    : 400,
                              }}
                            >
                              {view.label}
                            </span>
                            {isProductSavedViewsFolderExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                          {isProductSavedViewsFolderExpanded &&
                            productSavedViews &&
                            productSavedViews.map((sv) => {
                              const isSvActive =
                                activeProductListView === `Saved: ${sv.name}`;
                              return (
                                <button
                                  key={sv.id}
                                  onClick={() => onSelectProductSavedView?.(sv)}
                                  className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg transition-all duration-150 text-xs ${
                                    isSvActive
                                      ? "bg-sky/5 text-sky font-medium"
                                      : "text-gray-500 hover:bg-earth hover:text-night"
                                  }`}
                                >
                                  <span className="truncate flex-1 text-left">
                                    {sv.name}
                                  </span>
                                  {isSvActive && (
                                    <div className="w-1 h-1 rounded-full bg-sky flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      );
                    }

                    const isHierarchy = view.id === "Product Hierarchy";
                    const isActive = isHierarchy
                      ? activeProductView === "hierarchy"
                      : activeProductListView === view.id &&
                        activeProductView !== "hierarchy";
                    return (
                      <button
                        key={view.id}
                        onClick={() => {
                          if (isHierarchy) {
                            onProductViewChange?.("hierarchy");
                          } else {
                            onProductViewChange?.("landing");
                            onProductListViewChange?.(view.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                          isActive
                            ? "bg-pale text-sky"
                            : "text-gray-600 hover:bg-earth hover:text-night"
                        }`}
                      >
                        <span
                          className={isActive ? "text-sky" : "text-gray-400"}
                        >
                          {view.icon}
                        </span>
                        <span style={{ fontWeight: isActive ? 500 : 400 }}>
                          {view.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ─── CLAIMS MODULE ────────────────────────────────────────────────────────
  if (activeModule === "Claims") {
    if (isInClaimsWorkspace) {
      const CLAIMS_WORKSPACE_SECTIONS = [
        { label: "Claim Details", icon: <FileText className="w-4 h-4" /> },
        {
          label: "Support Strategy & Substantiation",
          icon: <Shield className="w-4 h-4" />,
        },
        { label: "Final Risk Summary", icon: <Shield className="w-4 h-4" /> },
        {
          label: "Risk Level Assessments",
          icon: <Shield className="w-4 h-4" />,
        },
        { label: "Related Assets", icon: <Paperclip className="w-4 h-4" /> },
      ];
      return (
        <aside className={sidebarClass}>
          <CollapseButton />
          <div
            className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
          >
            <div className="px-4 py-3 border-b border-pebble">
              <div
                className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider"
                style={{ fontWeight: 500 }}
              >
                <Layers className="w-3.5 h-3.5" />
                Claim Workspace
              </div>
            </div>
            <nav className="p-3 flex-1">
              <div className="space-y-0.5">
                {CLAIMS_WORKSPACE_SECTIONS.map((section) => {
                  const isActive =
                    activeClaimsWorkspaceSection === section.label;
                  return (
                    <button
                      key={section.label}
                      onClick={() =>
                        onClaimsWorkspaceSectionChange?.(section.label)
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                        isActive
                          ? "bg-pale text-sky"
                          : "text-gray-600 hover:bg-earth hover:text-night"
                      }`}
                    >
                      <span className={isActive ? "text-sky" : "text-gray-400"}>
                        {section.icon}
                      </span>
                      <span
                        className="flex-1 text-left"
                        style={{ fontWeight: isActive ? 500 : 400 }}
                      >
                        {section.label}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>
      );
    }

    const CLAIM_BASE_VIEWS: ClaimBaseView[] = [
      "Global Claims",
      "Regional Claims",
      "Local Claims",
      "Local Claims SKU",
    ];
    const CLAIM_WORK_VIEWS: ClaimWorkView[] = [
      "Support Strategy & Substantiation",
      "Risk Level Assessments",
      "Final Risk Summary",
    ];

    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="p-3 flex-1 overflow-y-auto">
            <div
              className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              Base Views
            </div>
            {CLAIM_BASE_VIEWS.map((view) => {
              const isExpanded = expandedClaimSections[view];
              const isActive = activeClaimsBaseView === view;
              return (
                <div key={view} className="mb-1">
                  <button
                    onClick={() => {
                      onClaimsBaseViewChange?.(view);
                      setExpandedClaimSections((prev) => ({
                        ...prev,
                        [view]: !prev[view],
                      }));
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                      isActive
                        ? "bg-pale text-sky"
                        : "text-gray-600 hover:bg-earth hover:text-night"
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <FileText className="w-4 h-4" />
                    <span
                      className="flex-1 text-left"
                      style={{ fontWeight: isActive ? 500 : 400 }}
                    >
                      {view}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky" />
                    )}
                  </button>
                  {isExpanded &&
                    (() => {
                      const claimType = CLAIM_TYPE_MAP[view];
                      const typeFilteredClaims = claims.filter(
                        (c) => c.claimType === claimType,
                      );
                      const recentClaims = typeFilteredClaims
                        .slice(-3)
                        .reverse();
                      const favClaims = typeFilteredClaims.filter(
                        (c) => c.isFavorite,
                      );
                      const sub = claimSubOpen[view];
                      const getPrimaryStatement = (c: Claim) =>
                        c.claimType === "Global"
                          ? c.versions[c.currentVersion]?.globalStatement
                          : c.versions[c.currentVersion]?.localStatement;
                      return (
                        <div className="ml-9 mt-1 space-y-0.5">
                          {/* Recents toggle */}
                          <button
                            onClick={() =>
                              setClaimSubOpen((p) => ({
                                ...p,
                                [view]:
                                  p[view] === "recents" ? null : "recents",
                              }))
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-earth hover:text-night transition-all duration-150"
                          >
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="flex-1 text-left">Recents</span>
                            {sub === "recents" ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                          {sub === "recents" && (
                            <div className="ml-5 space-y-0.5">
                              {recentClaims.length === 0 ? (
                                <p className="px-3 py-1.5 text-xs text-gray-400 italic">
                                  No recent claims
                                </p>
                              ) : (
                                recentClaims.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => onClaimClick?.(c)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-earth hover:text-night rounded-lg transition-colors truncate"
                                    title={getPrimaryStatement(c)}
                                  >
                                    {getPrimaryStatement(c)?.slice(0, 40) ||
                                      c.id}
                                    …
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                          {/* Favorites toggle */}
                          <button
                            onClick={() =>
                              setClaimSubOpen((p) => ({
                                ...p,
                                [view]:
                                  p[view] === "favorites" ? null : "favorites",
                              }))
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-earth hover:text-night transition-all duration-150"
                          >
                            <Star className="w-3.5 h-3.5 text-gray-400" />
                            <span className="flex-1 text-left">Favorites</span>
                            {sub === "favorites" ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                          {sub === "favorites" && (
                            <div className="ml-5 space-y-0.5">
                              {favClaims.length === 0 ? (
                                <p className="px-3 py-1.5 text-xs text-gray-400 italic">
                                  No favorites yet
                                </p>
                              ) : (
                                favClaims.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => onClaimClick?.(c)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-earth hover:text-night rounded-lg transition-colors truncate"
                                    title={getPrimaryStatement(c)}
                                  >
                                    <Star className="w-3 h-3 inline mr-1 text-amber-400" />
                                    {getPrimaryStatement(c)?.slice(0, 36) ||
                                      c.id}
                                    …
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                </div>
              );
            })}

            <div className="my-3 border-t border-pebble" />

            {/* Work Views */}
            <div
              className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider"
              style={{ fontWeight: 500 }}
            >
              Views
            </div>
            {CLAIM_WORK_VIEWS.map((view) => {
              const isActive = activeClaimsWorkView === view;
              const iconMap: Record<ClaimWorkView, ReactElement> = {
                "Support Strategy & Substantiation": (
                  <FileText className="w-4 h-4" />
                ),
                "Risk Level Assessments": <Shield className="w-4 h-4" />,
                "Final Risk Summary": <Shield className="w-4 h-4" />,
              };
              return (
                <button
                  key={view}
                  onClick={() =>
                    onClaimsWorkViewChange?.(isActive ? null : view)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-pale text-sky"
                      : "text-gray-600 hover:bg-earth hover:text-night"
                  }`}
                >
                  <span className={isActive ? "text-sky" : "text-gray-400"}>
                    {iconMap[view]}
                  </span>
                  <span
                    className="flex-1 text-left"
                    style={{ fontWeight: isActive ? 500 : 400 }}
                  >
                    {view}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }

  // ─── PROJECTS MODULE ──────────────────────────────────────────────────────
  if (activeModule !== "Projects") {
    return (
      <aside className={sidebarClass}>
        <CollapseButton />
        <div
          className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
        >
          <div className="text-sm text-gray-400 text-center mt-4 p-4">
            Select a module to view navigation options
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={sidebarClass}>
      <CollapseButton />
      <div
        className={`flex flex-col h-full w-64 ${isCollapsed ? "invisible opacity-0" : "visible opacity-100"} transition-all duration-200`}
      >
        <div className="p-3 flex-1">
          <div className="mb-2">
            <button
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 uppercase tracking-wide hover:text-night transition-all duration-150 rounded-lg hover:bg-earth"
            >
              <span>Projects</span>
              {isProjectsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isProjectsExpanded && (
              <nav className="mt-1 space-y-0.5">
                {PROJECT_VIEWS.map((view) => {
                  if (view.id === "Saved Views") {
                    const isAnySavedViewActive =
                      activeView.startsWith("Saved View:");
                    return (
                      <div key={view.id} className="space-y-0.5">
                        <button
                          onClick={() => {
                            setIsSavedViewsFolderExpanded(
                              !isSavedViewsFolderExpanded,
                            );
                            // onViewChange('Saved Views');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                            isAnySavedViewActive || activeView === "Saved Views"
                              ? "bg-pale text-sky"
                              : "text-gray-600 hover:bg-earth hover:text-night"
                          }`}
                        >
                          <span
                            className={
                              isAnySavedViewActive ||
                              activeView === "Saved Views"
                                ? "text-sky"
                                : "text-gray-400"
                            }
                          >
                            {view.icon}
                          </span>
                          <span
                            className="flex-1 text-left"
                            style={{
                              fontWeight:
                                isAnySavedViewActive ||
                                activeView === "Saved Views"
                                  ? 500
                                  : 400,
                            }}
                          >
                            {view.label}
                          </span>
                          {isSavedViewsFolderExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                        {isSavedViewsFolderExpanded &&
                          projectSavedViews &&
                          projectSavedViews.map((sv) => {
                            const isSvActive =
                              activeView === `Saved View: ${sv.name}`;
                            return (
                              <button
                                key={sv.id}
                                onClick={() => onSelectProjectSavedView?.(sv)}
                                className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg transition-all duration-150 text-xs ${
                                  isSvActive
                                    ? "bg-sky/5 text-sky font-medium"
                                    : "text-gray-500 hover:bg-earth hover:text-night"
                                }`}
                              >
                                <span className="truncate flex-1 text-left">
                                  {sv.name}
                                </span>
                                {isSvActive && (
                                  <div className="w-1 h-1 rounded-full bg-sky flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                      </div>
                    );
                  }

                  const isActive = activeView === view.id;
                  return (
                    <button
                      key={view.id}
                      onClick={() => onViewChange(view.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                        isActive
                          ? "bg-pale text-sky"
                          : "text-gray-600 hover:bg-earth hover:text-night"
                      }`}
                    >
                      <span className={isActive ? "text-sky" : "text-gray-400"}>
                        {view.icon}
                      </span>
                      <span style={{ fontWeight: isActive ? 500 : 400 }}>
                        {view.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky" />
                      )}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="my-3 border-t border-pebble" />

          {/* Marketing Team Only Options */}
          <div className="space-y-0.5">
            {/* <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Marketing View
            </div> */}

            {/* My Asset */}
            <button
              onClick={() => onViewChange("My Asset: My Assets")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${
                activeView.startsWith("My Asset:")
                  ? "bg-pale text-sky"
                  : "text-gray-600 hover:bg-earth hover:text-night"
              }`}
            >
              <span className={activeView.startsWith("My Asset:") ? "text-sky" : "text-gray-400"}>
                <Paperclip className="w-4 h-4" />
              </span>
              <span
                className="flex-1 text-left"
                style={{
                  fontWeight: activeView.startsWith("My Asset:") ? 500 : 400,
                }}
              >
                My Asset
              </span>
            </button>

            {/* My Tasks Button */}
            <button
              onClick={() => onViewChange("My Tasks")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm mt-1 ${
                activeView === "My Tasks"
                  ? "bg-pale text-sky"
                  : "text-gray-600 hover:bg-earth hover:text-night"
              }`}
            >
              <span className={activeView === "My Tasks" ? "text-sky" : "text-gray-400"}>
                <FileText className="w-4 h-4" />
              </span>
              <span
                className="flex-1 text-left"
                style={{
                  fontWeight: activeView === "My Tasks" ? 500 : 400,
                }}
              >
                My Tasks
              </span>
              {activeView === "My Tasks" && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
