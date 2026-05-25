import type { ProductSection } from "./components/products/ProductDetailsPage";
import React, { useState, useEffect, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import DescriptionIcon from "@mui/icons-material/Description";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BarChart2Icon from "@mui/icons-material/StackedBarChart";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Popover as MuiPopover,
  MenuList,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import ProjectTable from "./components/ProjectTable";
import ProjectWorkspace from "./components/ProjectWorkspace";
import LeftNavigation from "./components/LeftNavigation";
import SavedViewsModal, { SavedView } from "./components/SavedViewsModal";
import FilterPanel, { FilterState } from "./components/FilterPanel";
import CreateProjectModal from "./components/CreateProjectModal";
import CloneProjectModal from "./components/CloneProjectModal";
import Logo from "./components/Logo";
import {
  Project,
  TableState,
  initialProjects,
  BUSINESS_GROUPS,
  CATEGORIES,
  PROJECT_SCOPES,
  REGIONS,
  STATUS_OPTIONS,
  LIFECYCLE_STAGES,
  Claim,
  ClaimBaseView,
  ClaimWorkView,
  ClaimsModuleView,
  mockClaims,
  CURRENT_USER,
  CURRENT_USER_ROLE,
  Asset,
  mockAssets,
  generateTeamMembersForProject,
  isProjectArchived,
  mockHomeTasks,
} from "./types";
import ProductsModule from "./components/products/ProductsModule";
import type { ProductModuleView } from "./components/products/ProductsModule";
import type { ProductItem } from "./components/products/productData";
import { initialProducts } from "./components/products/productData";
import ClaimsModule from "./components/claims/ClaimsModule";
import ClaimWorkspace from "./components/claims/ClaimWorkspace";
import HomePage from "./components/home/HomePage";
import AssetsModule from "./components/assets/AssetsModule";
import AssetWorkspace from "./components/assets/AssetWorkspace";
import { ToastContainer } from "./components/ui/Toast";
import { useToast } from "./hooks/useToast";
import CreateAssetModal from "./components/assets/CreateAssetModal";
// import { ThemeToggle } from './components/ui/ThemeToggle';
import UserManagementModule from "./components/userManagement/UserManagementModule";
import DocumentsModule from "./components/documents/DocumentsModule";
import DocumentWorkspace from "./components/documents/DocumentWorkspace";
import { initialDocuments } from "./components/documents/documentsData";
import type { DocumentRecord } from "./components/documents/documentsData";

type WorkspaceSection =
  | "Project Details"
  | "Project Team"
  | "Geography"
  | "Related Products"
  | "Related Claims"
  | "Risk & Review"
  | "Related Assets";

const SESSION_KEY = "claims_mgmt_session";
const RECENT_KEY = "claims_mgmt_recent";

const getFilterOptions = (category: keyof FilterState) => {
  switch (category) {
    case "businessGroup":
      return BUSINESS_GROUPS;
    case "category":
      return Object.values(CATEGORIES).flat();
    case "scope":
      return PROJECT_SCOPES;
    case "status":
      return STATUS_OPTIONS;
    case "lifecycleStage":
      return LIFECYCLE_STAGES;
    default:
      return [];
  }
};

function FilterDropdown({
  label,
  category,
  selectedValues,
  onToggle,
  onClear,
}: {
  label: string;
  category: keyof FilterState;
  selectedValues: string[];
  onToggle: (category: keyof FilterState, value: string) => void;
  onClear: (category: keyof FilterState) => void;
}) {
  const options = getFilterOptions(category);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          border: "1px solid #DEDED7",
          fontSize: 13,
          color: "#6B7589",
          borderRadius: 8,
          background: "white",
          cursor: "pointer",
        }}
      >
        {label}
        <ExpandMoreIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
      </button>

      <MuiPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 288,
            borderRadius: 2,
            border: "1px solid #DEDED7",
            boxShadow: 3,
            mt: 0.5,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography fontSize={13} fontWeight={600} color="text.primary">
              {label}
            </Typography>
            {selectedValues.length > 0 && (
              <MuiButton
                size="small"
                variant="text"
                sx={{
                  fontSize: 11,
                  p: 0,
                  minWidth: "auto",
                  color: "primary.main",
                }}
                onClick={() => {
                  onClear(category);
                  setAnchorEl(null);
                }}
              >
                Clear
              </MuiButton>
            )}
          </Box>
          <Box
            sx={{
              maxHeight: 224,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
            }}
          >
            {options.map((option) => {
              const isChecked = selectedValues.includes(option);
              return (
                <Box
                  key={option}
                  onClick={() => onToggle(category, option)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    bgcolor: isChecked ? "#C2E0FF" : "transparent",
                    "&:hover": { bgcolor: isChecked ? "#C2E0FF" : "#F6F7F0" },
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    size="small"
                    disableRipple
                    sx={{ p: 0 }}
                    onChange={() => onToggle(category, option)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Typography
                    fontSize={13}
                    color={isChecked ? "primary.main" : "text.secondary"}
                    fontWeight={isChecked ? 500 : 400}
                  >
                    {option}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Typography fontSize={11} color="text.disabled" mt={1.5}>
            {selectedValues.length} selected
          </Typography>
        </Box>
      </MuiPopover>
    </>
  );
}

const NAV_ITEMS = [
  { id: "Home", label: "Home", icon: <HomeIcon sx={{ fontSize: 16 }} /> },
  {
    id: "Projects",
    label: "Projects",
    icon: <FolderSpecialIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "Products",
    label: "Products",
    icon: <Inventory2Icon sx={{ fontSize: 16 }} />,
  },
  {
    id: "Claims",
    label: "Claims",
    icon: <DescriptionIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "Assets",
    label: "Assets",
    icon: <AttachFileIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "Documents",
    label: "Documents",
    icon: <MenuBookIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "Reports",
    label: "Reports",
    icon: <BarChartIcon sx={{ fontSize: 16 }} />,
  },
  {
    id: "OtherReports",
    label: "Analytics",
    icon: <BarChart2Icon sx={{ fontSize: 16 }} />,
  },
];

const NOTIFICATIONS = [
  {
    id: "1",
    title: "RA review requested",
    message: "Dove Intensive Repair – Global Claim #3 needs your review",
    time: "10m ago",
    unread: true,
  },
  {
    id: "2",
    title: "Task overdue",
    message: "FTC pre-clearance for US claim #5 is past due",
    time: "2h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Comment mention",
    message: "Emma Williams mentioned you in a comment",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    title: "Project approved",
    message: "Simple Kind to Skin has reached Assessment Complete",
    time: "1d ago",
    unread: false,
  },
];

export default function App() {
  // Toast notification system
  const toast = useToast();

  const [activeModule, setActiveModule] = useState("Home");
  const [activeView, setActiveView] = useState("My Projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToClone, setProjectToClone] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<
    (keyof FilterState)[]
  >(["businessGroup", "category", "scope", "lifecycleStage"]);
  const [activeWorkspaceSection, setActiveWorkspaceSection] =
    useState<WorkspaceSection>("Project Details");
  const [relatedClaimsSubFilter, setRelatedClaimsSubFilter] =
    useState<string>("all");
  const [tableState, setTableState] = useState<TableState | undefined>(
    undefined,
  );
  const [recentlyAccessedIds, setRecentlyAccessedIds] = useState<string[]>([]);
  const [isSavedViewsModalOpen, setIsSavedViewsModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterPanelCategory, setFilterPanelCategory] = useState<
    keyof FilterState | null
  >(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [pendingChainedProject, setPendingChainedProject] = useState<Omit<Project, "id"> | null>(null);
  const [pendingChainedProduct, setPendingChainedProduct] = useState<any[] | null>(null);
  const [isCreateAssetModalOpen, setIsCreateAssetModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    status: [],
    lifecycleStage: [],
    businessGroup: [],
    projectType: [],
    category: [],
    scope: [],
    projectLead: [],
    claimsLead: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchObject, setGlobalSearchObject] = useState("Projects");
  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [claimSearchQuery, setClaimSearchQuery] = useState("");
  const [assetSearchQuery, setAssetSearchQuery] = useState("");

  const headerRef = React.useRef<HTMLDivElement>(null);
  const handleHeaderMouseMove = (e: React.MouseEvent) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    headerRef.current.style.setProperty("--mouse-x", `${x}px`);
    headerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const [projects, setProjects] = useState<Project[]>(() => {
    return initialProjects.map((p) => ({
      ...p,
      teamMembers: generateTeamMembersForProject(
        p.businessGroup,
        p.region ? p.region.split(",").map((r) => r.trim()) : [],
        p.projectLead,
      ),
    }));
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Saved Views State (Projects)
  const [projectSavedViews, setProjectSavedViews] = useState<SavedView[]>(
    () => {
      const saved = localStorage.getItem("project_saved_views");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
      return [
        {
          id: "1",
          name: "High Priority Reviews",
          type: "admin",
          isDefault: true,
          description:
            "All in-progress projects in review stage, sorted by last updated",
          filters: { status: ["In Progress", "Under Review"] },
        },
        {
          id: "2",
          name: "BPC Global Projects",
          type: "shared",
          description:
            "Beauty & Personal Care global scope projects across all stages",
          filters: { businessGroup: ["Beauty & Personal Care"] },
        },
        {
          id: "3",
          name: "My Active Work",
          type: "user",
          description: "Projects I lead that are currently in progress",
          filters: { status: ["In Progress"] },
        },
      ];
    },
  );

  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [saveDialogState, setSaveDialogState] = useState<{
    isOpen: boolean;
    name: string;
    overwriteWarning: boolean;
  }>({
    isOpen: false,
    name: "",
    overwriteWarning: false,
  });
  const [renameDialogState, setRenameDialogState] = useState<{
    isOpen: boolean;
    name: string;
  }>({
    isOpen: false,
    name: "",
  });
  const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false });
  const [shareDialogState, setShareDialogState] = useState({
    isOpen: false,
    search: "",
    selectedUsers: [] as string[],
    makeDefault: false,
  });

  // UI Dropdown states
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  // Products module state
  const [activeProductView, setActiveProductView] =
    useState<ProductModuleView>("landing");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [activeProductListView, setActiveProductListView] =
    useState("My Products");
  const [activeProductSection, setActiveProductSection] =
    useState<ProductSection>("Product Details");
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isProductSavedViewsPanelOpen, setIsProductSavedViewsPanelOpen] =
    useState(false);

  // Saved Views State (Products)
  const [productSavedViews, setProductSavedViews] = useState<any[]>(() => {
    const saved = localStorage.getItem("product_saved_views");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: "p-1",
        name: "Active Dove Formats",
        description: "Dove products in Active state, sorted by modified date",
        visibility: "private",
        columnOrder: [
          "name",
          "productId",
          "type",
          "lifecycleState",
          "childCount",
          "claimsCount",
        ],
        filters: [
          { field: "brand", operator: "equals", value: "Dove" },
          { field: "lifecycleState", operator: "equals", value: "Active" },
        ],
        sortCol: "lastModified",
        sortDir: "desc",
        createdBy: "Sarah Johnson",
        createdAt: "2026-03-01",
        isDefault: true,
      },
      {
        id: "p-2",
        name: "BPC Global Brands",
        description: "Global Beauty & Personal Care products",
        visibility: "shared-all",
        columnOrder: [
          "name",
          "productId",
          "type",
          "lifecycleState",
          "projectsCount",
        ],
        filters: [
          {
            field: "businessGroup",
            operator: "equals",
            value: "Beauty & Personal Care",
          },
        ],
        sortCol: "name",
        sortDir: "asc",
        createdBy: "Michael Chen",
        createdAt: "2026-02-15",
      },
    ];
  });

  const [appliedProductView, setAppliedProductView] = useState<any | null>(
    null,
  );

  const handleSelectProductSavedView = (view: any) => {
    setActiveProductListView(`Saved: ${view.name}`);
    setAppliedProductView(view);
    setActiveProductView("landing");
    setIsProductSavedViewsPanelOpen(false);
  };

  // Claims module state
  const [activeClaimsBaseView, setActiveClaimsBaseView] =
    useState<ClaimBaseView>("Global Claims");
  const [activeClaimsWorkView, setActiveClaimsWorkView] =
    useState<ClaimWorkView | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimsModuleView, setClaimsModuleView] =
    useState<ClaimsModuleView>("table");
  const [activeClaimsWorkspaceSection, setActiveClaimsWorkspaceSection] =
    useState("Claim Details");
  const [claims, setClaims] = useState<Claim[]>(mockClaims);

  // F03 — blocking dialog state for Proposed→Assessed with missing Support Strategy
  const [supportStrategyBlocker, setSupportStrategyBlocker] = useState<{
    claimId: string;
    claimLabel: string;
  } | null>(null);

  // F05 — dynamic notifications (bell tray)
  const [dynamicNotifs, setDynamicNotifs] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      unread: boolean;
    }>
  >([]);

  // ─── Assets Module State ─────────────────────────────────────────────────
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetsModuleView, setAssetsModuleView] = useState<
    "library" | "workspace"
  >("library");
  const [activeAssetsLibraryView, setActiveAssetsLibraryView] =
    useState("My Assets");
  const [activeAssetSection, setActiveAssetSection] = useState("Asset Details");

  // ─── Documents Module State ───────────────────────────────────────────────
  const [documents, setDocuments] =
    useState<DocumentRecord[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentRecord | null>(null);
  const [activeDocumentsView, setActiveDocumentsView] =
    useState("My Documents");
  const [activeDocumentSection, setActiveDocumentSection] =
    useState("Document Details");

  useEffect(() => {
    let hasLoaded = false;
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lastView) {
          setActiveView(parsed.lastView);
          hasLoaded = true;
        }
        setTableState(parsed.tableState);
        setRecentlyAccessedIds(parsed.recentlyAccessed || []);
      } catch (_) {}
    }
    const recent = localStorage.getItem(RECENT_KEY);
    if (recent) {
      try {
        setRecentlyAccessedIds(JSON.parse(recent));
      } catch (_) {}
    }

    if (!hasLoaded) {
      const defaultView = projectSavedViews.find((v) => v.isDefault);
      if (defaultView) {
        setActiveView(`Saved View: ${defaultView.name}`);
        setAppliedFilters({
          ...{
            status: [],
            lifecycleStage: [],
            businessGroup: [],
            projectType: [],
            category: [],
            scope: [],
            projectLead: [],
            claimsLead: [],
          },
          ...defaultView.filters,
        });
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      lastView: activeView,
      tableState: tableState || {
        sortColumn: null,
        sortDirection: null,
        currentPage: 1,
        columnOrder: [],
        columnWidths: {},
      },
      recentlyAccessed: recentlyAccessedIds,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [activeView, recentlyAccessedIds, tableState]);

  // F05 — Listen for support strategy change events and push into notification tray
  useEffect(() => {
    const lastNotifTimes: Record<string, number> = {};
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{
        claimId: string;
        modifiedBy: string;
        timestamp: string;
        strategy?: string;
      }>;
      const { claimId, modifiedBy, timestamp, strategy } = ev.detail;
      const now = Date.now();
      // Throttle: at most one notification per 5 minutes per claim
      if (
        lastNotifTimes[claimId] &&
        now - lastNotifTimes[claimId] < 5 * 60 * 1000
      )
        return;
      lastNotifTimes[claimId] = now;
      const claim = claims.find((c) => c.id === claimId);
      const claimLabel = claim
        ? claim.versions[claim.currentVersion]?.globalStatement?.slice(0, 40) ||
          claimId
        : claimId;

      // F05 — email preview snippet (first 200 chars)
      const claimStrategy = strategy || claim?.supportStrategy || "";
      const snippet =
        claimStrategy.length > 200
          ? claimStrategy.slice(0, 200) + "…"
          : claimStrategy;

      setDynamicNotifs((prev) =>
        [
          {
            id: `NOTIF-SS-${Date.now()}`,
            title: "Strategy updated",
            message: `${modifiedBy} updated Support Strategy on ${claimLabel}…\n"${snippet}"`,
            time: "Just now",
            unread: true,
          },
          ...prev,
        ].slice(0, 20),
      );
    };
    window.addEventListener("supportStrategyChanged", handler);
    return () => window.removeEventListener("supportStrategyChanged", handler);
  }, [claims]);

  // Listen for navigateToClaimsView custom events to switch the module tab to specific claims base views
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ view: ClaimBaseView }>;
      const targetView = ev.detail?.view || "Global Claims";
      setActiveModule("Claims");
      setActiveClaimsBaseView(targetView);
      setSelectedProject(null);
      setSelectedProduct(null);
      setSelectedClaim(null);
      setClaimsModuleView("table");
    };
    window.addEventListener("navigateToClaimsView", handler);
    return () => window.removeEventListener("navigateToClaimsView", handler);
  }, []);

  // Listen for navigateToClaimDetails custom events to navigate to a specific claim's detail workspace
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ claimId: string }>;
      const claimId = ev.detail?.claimId;
      if (!claimId) return;

      const foundClaim = claims.find((c) => c.id === claimId);
      if (foundClaim) {
        setActiveModule("Claims");
        if (foundClaim.claimType === "Global")
          setActiveClaimsBaseView("Global Claims");
        else if (foundClaim.claimType === "Regional")
          setActiveClaimsBaseView("Regional Claims");
        else if (foundClaim.claimType === "Local")
          setActiveClaimsBaseView("Local Claims");
        else if (foundClaim.claimType === "Local SKU")
          setActiveClaimsBaseView("SKU Claims");

        setSelectedClaim(foundClaim);
        setClaimsModuleView("workspace");
        setActiveClaimsWorkspaceSection("Claim Details");
        setSelectedProject(null);
        setSelectedProduct(null);
      }
    };
    window.addEventListener("navigateToClaimDetails", handler);
    return () => window.removeEventListener("navigateToClaimDetails", handler);
  }, [claims]);

  useEffect(() => {
    const handler = () => {
      setActiveModule("Claims");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("internalOpenClaimCreation"));
      }, 50);
    };
    window.addEventListener("openClaimCreation", handler);
    return () => window.removeEventListener("openClaimCreation", handler);
  }, []);

  useEffect(() => {
    const handleBackToProject = () => {
      setActiveModule("Projects");
      setIsCreateProjectModalOpen(true);
    };
    window.addEventListener('backToProjectCreation', handleBackToProject);
    return () => window.removeEventListener('backToProjectCreation', handleBackToProject);
  }, []);

  useEffect(() => {
    const handleBackToProduct = () => {
      setActiveModule("Products");
      setIsCreateProductModalOpen(true);
    };
    window.addEventListener('backToProductCreation', handleBackToProduct);
    return () => window.removeEventListener('backToProductCreation', handleBackToProduct);
  }, []);

  useEffect(() => {
    const handleFinalize = (e: Event) => {
      const ev = e as CustomEvent<{ claims: Claim[] }>;
      const claimsPayload = ev.detail?.claims || [];

      let finalProjectId = "";
      if (pendingChainedProject) {
        const newProject: Project = { id: String(Date.now()), ...pendingChainedProject };
        finalProjectId = newProject.id;
        setProjects((prev) => [newProject, ...prev]);
      }

      let finalProducts: any[] = [];
      if (pendingChainedProduct) {
        finalProducts = pendingChainedProduct.map((prod, idx) => {
          const id = prod.id || `prod-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
          const productId = prod.productId || `PROD-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`;
          return {
            ...prod,
            id,
            productId,
            projects: finalProjectId ? [finalProjectId] : [],
            lifecycleState: 'Created',
            childCount: 0,
            claimsCount: 0,
            projectsCount: 1,
            geographyCount: prod.geographies?.length || 0,
            lastModified: new Date().toISOString().split('T')[0],
          };
        });
      }
      
      if (finalProducts.length > 0) {
        window.dispatchEvent(new CustomEvent('finalizeProducts', { detail: { products: finalProducts } }));
      }

      let finalClaims: Claim[] = [];
      if (claimsPayload.length > 0) {
        finalClaims = claimsPayload.map(claim => {
          return {
            ...claim,
            linkedProducts: finalProducts.map(p => p.id),
            relatedProjectIds: finalProjectId ? [finalProjectId] : [],
          };
        });
        setClaims(prev => [...finalClaims, ...prev]);
      }

      setPendingChainedProject(null);
      setPendingChainedProduct(null);
      setActiveModule("Claims");
    };
    window.addEventListener('finalizeChainedCreation', handleFinalize);
    return () => window.removeEventListener('finalizeChainedCreation', handleFinalize);
  }, [pendingChainedProject, pendingChainedProduct]);

  useEffect(() => {
    const handleStashProduct = (e: Event) => {
      const ev = e as CustomEvent<{ products: any[] }>;
      setPendingChainedProduct(ev.detail?.products || null);
    };
    window.addEventListener('stashChainedProduct', handleStashProduct);
    return () => window.removeEventListener('stashChainedProduct', handleStashProduct);
  }, []);

  useEffect(() => {
    const handleCancel = () => {
      setPendingChainedProject(null);
      setPendingChainedProduct(null);
    };
    window.addEventListener('cancelChainedCreation', handleCancel);
    return () => window.removeEventListener('cancelChainedCreation', handleCancel);
  }, []);

  // ─── Phase 6: Lifecycle Engine — SE Expiry Cascade ───────────────────────
  // Re-evaluate SE lifecycle on every documents change; push toast when expired
  useEffect(() => {
    const now = new Date();
    let docsChanged = false;
    let claimsChanged = false;
    let assetsChanged = false;

    const updatedDocs = documents.map((doc) => {
      if (doc.documentType !== "Substantiation Evidence") return doc;

      if (doc.lifecycleState !== "Cancelled" && doc.lifecycleState !== "Expired") {
        const isExpired = doc.validToDate && new Date(doc.validToDate) < now;
        if (isExpired) {
          docsChanged = true;
          return {
            ...doc,
            lifecycleState: "Expired" as const,
            modifiedDate: now.toISOString(),
          };
        }
      }

      if (doc.lifecycleState !== "Cancelled" && doc.lifecycleState !== "Expired") {
        const hasLinks =
          (doc.linkedClaimIds?.length ?? 0) > 0 ||
          (doc.linkedAssetIds?.length ?? 0) > 0;
        const targetState = hasLinks ? "In Use" : "Draft";
        if (doc.lifecycleState !== targetState) {
          docsChanged = true;
          return {
            ...doc,
            lifecycleState: targetState as any,
            modifiedDate: now.toISOString(),
          };
        }
      }
      return doc;
    });

    const finalClaims = [...claims];
    const finalAssets = [...assets];

    updatedDocs.forEach((doc) => {
      if (doc.documentType !== "Substantiation Evidence") return;
      if (doc.lifecycleState === "Cancelled" || doc.lifecycleState === "Expired") {
        const targetState = doc.lifecycleState;
        
        doc.linkedClaimIds?.forEach((cid) => {
          const cIndex = finalClaims.findIndex((c) => c.id === cid);
          if (cIndex >= 0 && finalClaims[cIndex].lifecycleStage !== targetState) {
            finalClaims[cIndex] = { ...finalClaims[cIndex], lifecycleStage: targetState as any };
            claimsChanged = true;
            toast.showToast({
              title: `Claim ${targetState}`,
              message: `Claim ${cid} moved to ${targetState} because its substantiation evidence (${doc.id}) is ${targetState}.`,
              type: targetState === "Cancelled" ? "error" : "warning"
            });
          }
        });

        doc.linkedAssetIds?.forEach((aid) => {
          const aIndex = finalAssets.findIndex((a) => a.id === aid);
          if (aIndex >= 0 && finalAssets[aIndex].lifecycleStage !== targetState) {
            finalAssets[aIndex] = { ...finalAssets[aIndex], lifecycleStage: targetState as any };
            assetsChanged = true;
            toast.showToast({
              title: `Asset ${targetState}`,
              message: `Asset ${aid} moved to ${targetState} because its substantiation evidence (${doc.id}) is ${targetState}.`,
              type: targetState === "Cancelled" ? "error" : "warning"
            });
          }
        });
      }
    });

    if (docsChanged) setDocuments(updatedDocs);
    if (claimsChanged) setClaims(finalClaims);
    if (assetsChanged) setAssets(finalAssets);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, claims, assets]);

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    // Always reset workspace state for ALL modules so that clicking any top nav item
    // (including the currently active one) always returns to that module's main page.
    setSelectedProject(null);
    setSelectedProduct(null);
    setActiveProductView("landing");
    setSelectedClaim(null);
    setClaimsModuleView("table");
    setSelectedAsset(null);
    setAssetsModuleView("library");
    setSelectedDocument(null);
    setIsCreateProjectModalOpen(false);
    setIsCreateProductModalOpen(false);
    setPendingChainedProject(null);
    setPendingChainedProduct(null);
  };

  const handleViewChange = (view: string) => {
    if (view === "Saved Views") {
      setIsSavedViewsModalOpen(true);
      return;
    }
    setActiveView(view);
    setSelectedProject(null);
    setSearchQuery("");
    if (!view.startsWith("Saved View: ")) {
      setAppliedFilters({
        status: [],
        businessGroup: [],
        projectType: [],
        category: [],
        scope: [],
        region: [],
        projectLead: [],
        claimsLead: [],
      });
    }
  };

  const handleSaveViewConfirm = (
    nameToSave: string,
    forceOverwrite = false,
  ) => {
    const trimmedName = nameToSave.trim();
    if (!trimmedName) return;

    const existingIndex = projectSavedViews.findIndex(
      (v) => v.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (existingIndex >= 0 && !forceOverwrite) {
      setSaveDialogState((prev) => ({
        ...prev,
        overwriteWarning: true,
        name: trimmedName,
      }));
      return;
    }

    const filtersToSave = { ...appliedFilters };
    const currentView: SavedView = {
      id:
        existingIndex >= 0
          ? projectSavedViews[existingIndex].id
          : String(Date.now()),
      name: trimmedName,
      type: "user",
      description: "Custom view saved from workspace",
      filters: filtersToSave,
    };

    let updatedViews: SavedView[];
    if (existingIndex >= 0) {
      updatedViews = projectSavedViews.map((v, i) =>
        i === existingIndex ? currentView : v,
      );
      toast.showToast({
        type: "success",
        title: "View Overwritten",
        message: `Successfully updated view "${trimmedName}"!`,
      });
    } else {
      updatedViews = [currentView, ...projectSavedViews];
      toast.showToast({
        type: "success",
        title: "View Saved",
        message: `View "${trimmedName}" has been saved and is now in the sidebar!`,
      });
    }

    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    setActiveView(`Saved View: ${trimmedName}`);
    setSaveDialogState({ isOpen: false, name: "", overwriteWarning: false });
  };

  const handleRenameViewConfirm = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (!activeView.startsWith("Saved View: ")) return;
    const currentName = activeView.replace("Saved View: ", "");

    const updatedViews = projectSavedViews.map((v) =>
      v.name === currentName ? { ...v, name: trimmed } : v,
    );
    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    setActiveView(`Saved View: ${trimmed}`);
    setRenameDialogState({ isOpen: false, name: "" });
    toast.showToast({
      type: "success",
      title: "View Renamed",
      message: `Successfully renamed view to "${trimmed}"!`,
    });
  };

  const handleDeleteViewConfirm = () => {
    if (!activeView.startsWith("Saved View: ")) return;
    const currentName = activeView.replace("Saved View: ", "");

    const updatedViews = projectSavedViews.filter(
      (v) => v.name !== currentName,
    );
    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    setActiveView("All Projects");
    setAppliedFilters({
      status: [],
      lifecycleStage: [],
      businessGroup: [],
      projectType: [],
      category: [],
      scope: [],
      projectLead: [],
      claimsLead: [],
    });
    setDeleteDialogState({ isOpen: false });
    toast.showToast({
      type: "info",
      title: "View Deleted",
      message: `View "${currentName}" has been removed.`,
    });
  };

  const handleSetAsDefaultView = () => {
    let currentName = "";
    if (activeView.startsWith("Saved View: ")) {
      currentName = activeView.replace("Saved View: ", "");
    }

    const updatedViews = projectSavedViews.map((v) => ({
      ...v,
      isDefault: currentName ? v.name === currentName : false,
    }));

    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    toast.showToast({
      type: "success",
      title: "Default View Set",
      message: currentName
        ? `"${currentName}" is now your default view.`
        : '"All Projects" is now your default view.',
    });
  };

  const handleShareViewConfirm = (users: string[]) => {
    if (!activeView.startsWith("Saved View: ")) return;
    const currentName = activeView.replace("Saved View: ", "");

    const updatedViews = projectSavedViews.map((v) => {
      if (v.name === currentName) {
        return {
          ...v,
          type: "shared" as const,
          isDefault: shareDialogState.makeDefault ? true : v.isDefault,
        };
      }
      return {
        ...v,
        isDefault: shareDialogState.makeDefault ? false : v.isDefault,
      };
    });
    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));

    setShareDialogState({
      isOpen: false,
      search: "",
      selectedUsers: [],
      makeDefault: false,
    });
    toast.showToast({
      type: "success",
      title: "View Shared",
      message: `Successfully shared "${currentName}" with ${users.length} team member(s)!`,
    });
  };

  const handleSaveAsNewViewCopy = () => {
    if (!activeView.startsWith("Saved View: ")) return;
    const currentName = activeView.replace("Saved View: ", "");

    const sourceView = projectSavedViews.find((v) => v.name === currentName);
    if (!sourceView) return;

    const copyName = `${sourceView.name} (Copy)`;
    const copyView: SavedView = {
      ...sourceView,
      id: String(Date.now()),
      name: copyName,
      type: "user",
      isDefault: false,
    };

    const updatedViews = [copyView, ...projectSavedViews];
    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    setActiveView(`Saved View: ${copyName}`);
    toast.showToast({
      type: "success",
      title: "Copied View",
      message: `Created personal copy: "${copyName}".`,
    });
  };

  const handleRemoveViewConfirmAction = () => {
    if (!activeView.startsWith("Saved View: ")) return;
    const currentName = activeView.replace("Saved View: ", "");

    const updatedViews = projectSavedViews.filter(
      (v) => v.name !== currentName,
    );
    setProjectSavedViews(updatedViews);
    localStorage.setItem("project_saved_views", JSON.stringify(updatedViews));
    setActiveView("All Projects");
    setAppliedFilters({
      status: [],
      businessGroup: [],
      projectType: [],
      category: [],
      scope: [],
      region: [],
      projectLead: [],
      claimsLead: [],
    });
    toast.showToast({
      type: "info",
      title: "View Removed",
      message: `Shared view "${currentName}" has been removed from your list.`,
    });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setActiveWorkspaceSection("Project Details");
    const updated = [
      project.id,
      ...recentlyAccessedIds.filter((id) => id !== project.id),
    ].slice(0, 10);
    setRecentlyAccessedIds(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    setActiveWorkspaceSection("Project Details");
  };

  const handleProjectSave = (updated: Project) => {
    setProjects((prev) => {
      if (!prev.some((p) => p.id === updated.id)) {
        return [updated, ...prev];
      }
      return prev.map((p) => (p.id === updated.id ? updated : p));
    });
    setSelectedProject(updated);
  };

  const handleBack = () => setSelectedProject(null);

  const handleSelectSavedView = (view: SavedView) => {
    setActiveView(`Saved View: ${view.name}`);
    setSearchQuery("");
    setAppliedFilters({
      ...{
        status: [],
        lifecycleStage: [],
        businessGroup: [],
        projectType: [],
        category: [],
        scope: [],
        projectLead: [],
        claimsLead: [],
      },
      ...view.filters,
    });
    setSelectedProject(null);
    if (view.sorting) {
      setTableState((prev) => ({
        ...prev!,
        sortColumn: view.sorting!.column as any,
        sortDirection: view.sorting!.direction,
        currentPage: 1,
      }));
    }
  };

  const handleCreateProject = (project: Omit<Project, "id">, navigateNext?: boolean) => {
    if (navigateNext) {
      setPendingChainedProject(project);
      setActiveModule("Products");
      setIsCreateProductModalOpen(true);
    } else {
      const newProject: Project = { id: String(Date.now()), ...project };
      setProjects((prev) => [newProject, ...prev]);
      setActiveModule("Projects");
      handleProjectClick(newProject);
    }
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openFilterPanel = (category: keyof FilterState | null = null) => {
    setFilterPanelCategory(category);
    setIsFilterPanelOpen(true);
  };

  const ALL_FILTER_CATEGORIES: Array<{
    label: string;
    category: keyof FilterState;
  }> = [
    { label: "Status", category: "status" },
    { label: "Stage", category: "lifecycleStage" },
    { label: "Business Group", category: "businessGroup" },
    { label: "Project Type", category: "projectType" },
    { label: "Category", category: "category" },
    { label: "Project Scope", category: "scope" },
    { label: "Project Creator", category: "projectLead" },
    { label: "Claims Lead", category: "claimsLead" },
  ];

  const QUICK_FILTERS = ALL_FILTER_CATEGORIES.filter((f) =>
    activeQuickFilters.includes(f.category),
  );

  const activeFilterCount = Object.values(appliedFilters).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );
  const allNotifications = [...dynamicNotifs, ...NOTIFICATIONS];
  const unreadNotifCount = allNotifications.filter((n) => n.unread).length;
  const currentProjectIndex = selectedProject
    ? projects.findIndex((p) => p.id === selectedProject.id)
    : -1;

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchKeyword.trim()) return;
    const keyword = globalSearchKeyword.trim();

    if (globalSearchObject === "Projects") {
      setActiveModule("Projects");
      setSearchQuery(keyword);
    } else if (globalSearchObject === "Products") {
      setActiveModule("Products");
      setProductSearchQuery(keyword);
    } else if (globalSearchObject === "Claims") {
      setActiveModule("Claims");
      setClaimSearchQuery(keyword);
    } else if (globalSearchObject === "Assets") {
      setActiveModule("Assets");
      setAssetSearchQuery(keyword);
    } else if (globalSearchObject === "Documents") {
      setActiveModule("Documents");
    } else if (globalSearchObject === "Reports") {
      setActiveModule("Reports");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Global Header */}
      <header
        ref={headerRef}
        onMouseMove={handleHeaderMouseMove}
        className="border-b border-[#0052A3]/40 flex-shrink-0 relative shadow-[0_4px_20px_rgba(0,102,204,0.15)] z-30 animate-fade-in transition-all duration-300 bg-[#004D99]"
        style={{ height: 60 }}
      >
        {/* Background container with overflow hidden to prevent any media spillover */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          {/* Static Gradient Background (Matches Image) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 120% at -5% 120%, #5bb3d6 0%, #2a94c8 30%, #0076bc 60%, #0076bc 100%)",
            }}
          />

          {/* Interactive Mouse Hover Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 800px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12), transparent)`,
            }}
          />
        </div>

        <div className="h-full px-4 sm:px-5 flex items-center justify-between relative z-10">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <div className="hover:scale-[1.03] transition-transform duration-300">
              <Logo size={44} smSize={48} lightBg={false} />
            </div>

            <nav className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = activeModule === item.id;
                const navyBlue = "#001F5C"; // Unilever Navy Blue
                const cyanHighlight = "#00B5E2"; // Unilever Cyan
                const baseColor = "#FAF9F6"; // Off-White

                return (
                  <button
                    key={item.id}
                    onClick={() => handleModuleChange(item.id)}
                    className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1 h-[38px] transition-all duration-300 hover:scale-[1.02] active:scale-95 group overflow-hidden ${
                      isActive ? "bg-white shadow-sm" : "hover:bg-white/10"
                    }`}
                    style={{
                      borderRadius: "12px 4px 12px 4px",
                      border: isActive
                        ? `1px solid ${navyBlue}22`
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <span
                      className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                      style={{ color: isActive ? navyBlue : `${baseColor}CC` }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`hidden ${!globalSearchOpen ? "xl:inline" : ""} tracking-wider font-bold text-[11px] uppercase transition-colors duration-300`}
                      style={{ color: isActive ? navyBlue : `${baseColor}CC` }}
                    >
                      {item.label}
                    </span>

                    {/* Full-width responsive underline bar - Cyan Highlight */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-500 transform ${isActive ? "scale-x-100" : "scale-x-0"}`}
                      style={{ backgroundColor: cyanHighlight }}
                    />

                    {/* Active internal soft overlay */}
                    {isActive && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: `${cyanHighlight}05` }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Expanding Search Bar */}
            <div className="relative flex items-center">
              {globalSearchOpen ? (
                <form
                  onSubmit={handleGlobalSearchSubmit}
                  className="flex items-center bg-white/15 border border-white/20 rounded-xl pl-2 pr-1 py-1 shadow-inner animate-fade-in w-72 lg:w-96"
                >
                  <select
                    value={globalSearchObject}
                    onChange={(e) => setGlobalSearchObject(e.target.value)}
                    className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1 border-r border-white/20 py-1"
                    style={{ color: "#ffffff" }}
                  >
                    <option value="Projects" className="text-night bg-white">
                      Projects
                    </option>
                    <option value="Products" className="text-night bg-white">
                      Products
                    </option>
                    <option value="Claims" className="text-night bg-white">
                      Claims
                    </option>
                    <option value="Assets" className="text-night bg-white">
                      Assets
                    </option>
                    <option value="Documents" className="text-night bg-white">
                      Documents
                    </option>
                    <option value="Reports" className="text-night bg-white">
                      Reports
                    </option>
                  </select>
                  <input
                    type="text"
                    value={globalSearchKeyword}
                    onChange={(e) => setGlobalSearchKeyword(e.target.value)}
                    placeholder={`Search ${globalSearchObject}...`}
                    className="bg-transparent text-white placeholder-white/60 text-xs pl-3 pr-2 py-1 w-full focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center mr-0.5"
                    title="Search"
                  >
                    <SearchIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalSearchOpen(false);
                      setGlobalSearchKeyword("");
                    }}
                    className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                    title="Close"
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setGlobalSearchOpen(true)}
                  className="p-2.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center w-10 h-10 shadow-sm"
                  title="Global Search"
                >
                  <SearchIcon sx={{ fontSize: 16 }} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                  setCreateMenuOpen(false);
                }}
                className="relative p-2.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl transition-all duration-300 animate-wiggle shadow-sm active:scale-95 flex items-center justify-center w-10 h-10"
              >
                <NotificationsIcon sx={{ fontSize: 16 }} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-sky animate-ping-glow">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setSettingsMenuOpen((p) => !p);
                  setNotifOpen(false);
                  setUserMenuOpen(false);
                }}
                className="p-2.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl transition-all duration-300 hover:rotate-45 active:scale-95 flex items-center justify-center w-10 h-10"
                title="Settings"
              >
                <SettingsIcon sx={{ fontSize: 16 }} />
              </button>
              {settingsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSettingsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#DEDED7] rounded-2xl shadow-[0_12px_40px_rgba(19,48,98,0.12)] z-50 w-56 overflow-hidden animate-drop-in">
                    <div className="px-4 py-2.5 bg-[#F6F7F0]/60 border-b border-[#DEDED7]">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Settings
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleModuleChange("UserManagement");
                          setSettingsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#133062]/80 hover:text-[#0066CC] hover:bg-[#C2E0FF]/10 transition-colors text-left font-semibold"
                      >
                        <VerifiedUserIcon
                          sx={{ fontSize: 16 }}
                          className="text-[#133062]/40"
                        />
                        User Management
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#133062]/80 hover:text-[#0066CC] hover:bg-[#C2E0FF]/10 transition-colors text-left font-semibold">
                        <PersonIcon
                          sx={{ fontSize: 16 }}
                          className="text-[#133062]/40"
                        />
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#133062]/80 hover:text-[#0066CC] hover:bg-[#C2E0FF]/10 transition-colors text-left font-semibold">
                        <SettingsIcon
                          sx={{ fontSize: 16 }}
                          className="text-[#133062]/40"
                        />
                        Preferences
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                  setCreateMenuOpen(false);
                }}
                className="flex items-center gap-3 pl-2.5 pr-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300 shadow-sm group text-left active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-white text-sky flex items-center justify-center text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
                  SJ
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs text-white font-semibold tracking-wide">
                    Sarah Johnson
                  </div>
                  <div className="text-[10px] text-white/60 group-hover:text-[#23E7FF] transition-colors font-medium">
                    Project Lead
                  </div>
                </div>
                <ExpandMoreIcon sx={{ fontSize: 16 }} />
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 bg-white border border-pale rounded-2xl shadow-[0_12px_40px_rgba(19,48,98,0.12)] z-50 w-56 overflow-hidden backdrop-blur-md animate-drop-in">
                    <div className="px-4 py-3 bg-pale/20 border-b border-pale/50">
                      <div className="text-sm text-night font-bold">
                        Sarah Johnson
                      </div>
                      <div className="text-[11px] text-gray-500 truncate font-medium mt-0.5">
                        s.johnson@unilever.com
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        {
                          icon: <PersonIcon sx={{ fontSize: 16 }} />,
                          label: "Profile Settings",
                        },
                        {
                          icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />,
                          label: "Permissions",
                        },
                        {
                          icon: <SettingsIcon sx={{ fontSize: 16 }} />,
                          label: "Preferences",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-night/80 hover:text-sky hover:bg-pale/10 transition-colors text-left font-semibold"
                        >
                          <span className="text-night/40">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-pale/40 bg-red-500/[0.02]">
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left font-semibold">
                        <LogoutIcon sx={{ fontSize: 16 }} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Level Notifications Panel - Right Aligned to Screen */}
        {notifOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setNotifOpen(false)}
            ></div>
            <div className="absolute right-5 top-[56px] bg-white border border-pale rounded-2xl shadow-[0_12px_40px_rgba(19,48,98,0.12)] z-50 w-80 overflow-hidden backdrop-blur-md animate-drop-in">
              <div className="px-4 py-3 bg-pale/20 border-b border-pale/50 flex items-center justify-between">
                <span className="text-sm text-night font-bold tracking-wide">
                  Notifications
                </span>
                <span
                  className="text-xs text-[#0066CC] cursor-pointer hover:underline font-semibold"
                  onClick={() => setDynamicNotifs([])}
                >
                  Mark all read
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {allNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-pale/30 hover:bg-pale/5 cursor-pointer flex gap-3 transition-colors ${notif.unread ? "bg-pale/5" : ""}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.unread ? "bg-[#0066CC] shadow-[0_0_6px_#0066CC]" : "bg-transparent"}`}
                    ></div>
                    <div>
                      <div className="text-xs text-night font-bold leading-snug">
                        {notif.title}
                      </div>
                      <div className="text-[11px] text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                        {notif.message}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />{" "}
                        {notif.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bottom accent gradient bar */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 2,
            background: "linear-gradient(to right, #23E7FF, #47A3FF, #0066CC)",
          }}
        />
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {!(activeModule === "Products" && (activeProductView === "formatCreation" || activeProductView === "technologyCreation")) && (
          <LeftNavigation
            activeModule={activeModule}
            activeView={activeView}
            onViewChange={handleViewChange}
            isInWorkspace={!!selectedProject}
            activeWorkspaceSection={activeWorkspaceSection}
            onWorkspaceSectionChange={setActiveWorkspaceSection}
            relatedClaimsSubFilter={relatedClaimsSubFilter}
            onRelatedClaimsSubFilterChange={setRelatedClaimsSubFilter}
            activeProductView={activeProductView}
            onProductViewChange={setActiveProductView}
            activeProductListView={activeProductListView}
            onProductListViewChange={(view) => {
              if (view === "Saved Views") {
                setActiveProductView("landing");
                const defaultView = productSavedViews.find((v) => v.isDefault);
                if (defaultView) {
                  setActiveProductListView(`Saved: ${defaultView.name}`);
                  setAppliedProductView(defaultView);
                } else if (productSavedViews.length > 0) {
                  setActiveProductListView(`Saved: ${productSavedViews[0].name}`);
                  setAppliedProductView(productSavedViews[0]);
                }
                setIsProductSavedViewsPanelOpen(true);
              } else {
                setActiveProductListView(view);
                setActiveProductView("landing");
              }
            }}
            isInProductDetail={
              activeModule === "Products" && activeProductView === "detail"
            }
            activeProductSection={activeProductSection}
            onProductSectionChange={setActiveProductSection}
            activeClaimsBaseView={activeClaimsBaseView}
            onClaimsBaseViewChange={setActiveClaimsBaseView}
            activeClaimsWorkView={activeClaimsWorkView}
            onClaimsWorkViewChange={setActiveClaimsWorkView}
            isInClaimsWorkspace={activeModule === "Claims" && !!selectedClaim}
            activeClaimsWorkspaceSection={activeClaimsWorkspaceSection}
            onClaimsWorkspaceSectionChange={setActiveClaimsWorkspaceSection}
            claims={claims}
            onClaimClick={(claim) => {
              setSelectedClaim(claim);
              setClaimsModuleView("workspace");
              if (activeClaimsWorkView) {
                setActiveClaimsWorkspaceSection(activeClaimsWorkView);
              }
            }}
            onModuleChange={(module, view) => {
              handleModuleChange(module);
              if (view) setActiveView(view);
            }}
            activeAssetsLibraryView={activeAssetsLibraryView}
            onAssetsLibraryViewChange={setActiveAssetsLibraryView}
            isInAssetWorkspace={activeModule === "Assets" && !!selectedAsset}
            activeAssetSection={activeAssetSection}
            onAssetSectionChange={setActiveAssetSection}
            projectSavedViews={projectSavedViews}
            onSelectProjectSavedView={handleSelectSavedView}
            productSavedViews={productSavedViews}
            onSelectProductSavedView={handleSelectProductSavedView}
            activeDocumentsLibraryView={activeDocumentsView}
            onDocumentsLibraryViewChange={setActiveDocumentsView}
            isInDocumentWorkspace={
              activeModule === "Documents" && !!selectedDocument
            }
            activeDocumentSection={activeDocumentSection}
            onDocumentSectionChange={setActiveDocumentSection}
            selectedDocument={selectedDocument}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeModule === "Home" ? (
            <HomePage
              projects={projects}
              onProjectClick={(project) => {
                handleProjectClick(project);
                setActiveModule("Projects");
              }}
              onViewAllProjects={() => {
                handleModuleChange("Projects");
                setActiveView("My Projects");
              }}
              onAssetClick={(asset) => {
                handleModuleChange("Assets");
              }}
              onViewAllAssets={() => handleModuleChange("Assets")}
              onViewAllTasks={() => handleModuleChange("Projects")}
              onViewAllActivities={() => handleModuleChange("Projects")}
              onCreateProjectClick={() => setIsCreateProjectModalOpen(true)}
              onCreateAssetClick={() => setIsCreateAssetModalOpen(true)}
            />
          ) : selectedProject ? (
            // Project Workspace
            <ProjectWorkspace
              project={selectedProject}
              projects={projects}
              currentIndex={currentProjectIndex}
              onBack={handleBack}
              onProjectChange={handleProjectChange}
              onProjectSave={handleProjectSave}
              activeSection={activeWorkspaceSection}
              onSectionChange={setActiveWorkspaceSection}
              relatedClaimsSubFilter={relatedClaimsSubFilter}
              onRelatedClaimsSubFilterChange={setRelatedClaimsSubFilter}
              documents={documents}
              onDocumentChange={(doc) => setDocuments(docs => docs.map(d => d.id === doc.id ? doc : d))}
              onDocumentAdd={(doc) => setDocuments(docs => [doc, ...docs])}
            />
          ) : activeModule === "Projects" ? (
            activeView.startsWith("My Asset:") ? (
              <AssetsModule
                assets={assets}
                onAssetsChange={setAssets}
                activeLibraryView={activeView.replace("My Asset: ", "")}
                onLibraryViewChange={(view) => setActiveView("My Asset: " + view)}
                onAssetClick={(asset) => {
                  setSelectedAsset(asset);
                  setAssetsModuleView("workspace");
                  setActiveModule("Assets");
                }}
                externalSearchQuery={assetSearchQuery}
              />
            ) : activeView === "My Tasks" ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-sky-50/20">
                {/* Tasks Page Header */}
                <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h1 className="text-night font-bold text-lg">My Tasks</h1>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Track and manage your assigned tasks and project actions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tasks Table Container */}
                <div className="flex-1 p-6 overflow-auto">
                  <div className="bg-white rounded-xl border border-pebble shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-earth/40 border-b border-pebble text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3.5">Project Name</th>
                          <th className="px-6 py-3.5">Task Detail</th>
                          <th className="px-6 py-3.5">Assigned By</th>
                          <th className="px-6 py-3.5">Due Date</th>
                          <th className="px-6 py-3.5">Priority</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pebble/60 text-sm">
                        {mockHomeTasks.map((task) => {
                          const assignedBy = task.id === 'TSK-001' ? 'Emma Williams' : 
                                             task.id === 'TSK-002' ? 'Michael Chen' : 
                                             task.id === 'TSK-003' ? 'Emma Williams' : 
                                             task.id === 'TSK-004' ? 'Michael Chen' : 
                                             task.id === 'TSK-005' ? 'Emma Williams' : 
                                             task.id === 'TSK-006' ? 'System' : 
                                             task.id === 'TSK-007' ? 'Emma Williams' : 'Michael Chen';
                          const isOverdue = task.status === "Overdue";
                          const isDueToday = task.status === "Due Today";
                          
                          let badgeBg = "bg-gray-100 text-gray-700";
                          if (isOverdue) badgeBg = "bg-red-50 text-red-700 border border-red-100";
                          else if (isDueToday) badgeBg = "bg-amber-50 text-amber-700 border border-amber-100";
                          else if (task.status === "Completed") badgeBg = "bg-green-50 text-green-700 border border-green-100";
                          else badgeBg = "bg-sky-50 text-sky-700 border border-sky-100";

                          let prioColor = "text-gray-600";
                          if (task.priority === "High") prioColor = "text-red-600 font-semibold";
                          else if (task.priority === "Medium") prioColor = "text-amber-600 font-semibold";

                          return (
                            <tr key={task.id} className="hover:bg-earth/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-night max-w-[220px] truncate">
                                {task.projectName}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-night">{task.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{task.description}</div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                {assignedBy}
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                {task.dueDate}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs ${prioColor}`}>{task.priority}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}>
                                  {task.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Page Header */}
              <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 relative">
                    <h1 className="text-night flex items-center gap-2">
                      {activeView.startsWith("Saved View: ")
                        ? activeView.replace("Saved View: ", "")
                        : activeView}
                    </h1>

                    {activeView.startsWith("Saved View: ") && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          projectSavedViews.find(
                            (v) =>
                              v.name === activeView.replace("Saved View: ", ""),
                          )?.type === "admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : projectSavedViews.find(
                                  (v) =>
                                    v.name ===
                                    activeView.replace("Saved View: ", ""),
                                )?.type === "shared"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {projectSavedViews.find(
                          (v) =>
                            v.name === activeView.replace("Saved View: ", ""),
                        )?.type === "admin"
                          ? "Admin Default"
                          : projectSavedViews.find(
                                (v) =>
                                  v.name ===
                                  activeView.replace("Saved View: ", ""),
                              )?.type === "shared"
                            ? "Shared View"
                            : "My View"}
                      </span>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                        className="p-1.5 hover:bg-earth text-gray-500 hover:text-night rounded-lg transition-colors flex items-center justify-center border border-pebble shadow-sm"
                        title="View Options"
                      >
                        <ExpandMoreIcon sx={{ fontSize: 16 }} />
                      </button>

                      {isViewMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsViewMenuOpen(false)}
                          />
                          <div className="absolute left-0 mt-1.5 w-64 bg-white border border-pebble rounded-xl shadow-xl z-40 py-1.5 overflow-hidden">
                            <button
                              onClick={() => {
                                setIsViewMenuOpen(false);
                                setSaveDialogState({
                                  isOpen: true,
                                  name: activeView.startsWith("Saved View: ")
                                    ? activeView.replace("Saved View: ", "")
                                    : "",
                                  overwriteWarning: false,
                                });
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                            >
                              <SaveIcon sx={{ fontSize: 16 }} />
                              Save Current View
                            </button>

                            {activeView.startsWith("Saved View: ") && (
                              <>
                                <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    setRenameDialogState({
                                      isOpen: true,
                                      name: activeView.replace(
                                        "Saved View: ",
                                        "",
                                      ),
                                    });
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                  Rename View
                                </button>

                                <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    setDeleteDialogState({ isOpen: true });
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                  Delete View
                                </button>

                                <div className="border-t border-pebble my-1" />

                                {/* <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    handleSetAsDefaultView();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                                >
                                  <Star className={`w-4 h-4 ${projectSavedViews.find(v => v.name === activeView.replace('Saved View: ', ''))?.isDefault ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                                  Set as Default View
                                </button> */}

                                <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    setShareDialogState({
                                      isOpen: true,
                                      search: "",
                                      selectedUsers: [],
                                      makeDefault: false,
                                    });
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                                >
                                  <ShareIcon sx={{ fontSize: 16 }} />
                                  Share View
                                </button>

                                <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    handleSaveAsNewViewCopy();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                                >
                                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                                  Save as New View
                                </button>

                                <button
                                  onClick={() => {
                                    setIsViewMenuOpen(false);
                                    handleRemoveViewConfirmAction();
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-earth transition-colors text-left border-t border-pebble"
                                >
                                  <CancelIcon sx={{ fontSize: 16 }} />
                                  Remove View
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                    Create Project
                  </button>
                </div>

                {/* Toolbar: Search + Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
                      <SearchIcon sx={{ fontSize: 16 }} />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects..."
                      className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>

                  {/* Dedicated Filter Button */}
                  <button
                    onClick={() => openFilterPanel(null)}
                    className="flex items-center gap-2 px-3 py-2 border border-pebble text-sm text-gray-600 rounded-lg hover:bg-earth hover:border-sky transition-colors"
                  >
                    <FilterListIcon sx={{ fontSize: 16 }} />
                    <span className="hidden sm:inline">Add Quick Filters</span>
                  </button>

                  {/* Quick Filter Dropdowns - Scrollable container */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[calc(100vw-600px)]">
                    {QUICK_FILTERS.map((filter) => (
                      <FilterDropdown
                        key={filter.label}
                        label={filter.label}
                        category={filter.category}
                        selectedValues={appliedFilters[filter.category] || []}
                        onToggle={(category, value) => {
                          setAppliedFilters((prev) => {
                            const current = prev[category] || [];
                            return {
                              ...prev,
                              [category]: current.includes(value)
                                ? current.filter((v) => v !== value)
                                : [...current, value],
                            };
                          });
                        }}
                        onClear={(category) =>
                          setAppliedFilters((prev) => ({
                            ...prev,
                            [category]: [],
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 p-5 overflow-hidden">
                <ProjectTable
                  onProjectClick={handleProjectClick}
                  activeView={activeView}
                  savedState={tableState}
                  onStateChange={setTableState}
                  recentlyAccessedIds={recentlyAccessedIds}
                  appliedFilters={appliedFilters}
                  searchQuery={searchQuery}
                  projects={projects.filter((p) => {
                    if (p.status === "Cancelled") return false;
                    if (showArchived) return true;
                    if (isProjectArchived(p)) return false;
                    return true;
                  })}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClearFilters={() =>
                    setAppliedFilters({
                      status: [],
                      lifecycleStage: [],
                      businessGroup: [],
                      projectType: [],
                      category: [],
                      scope: [],
                      projectLead: [],
                      claimsLead: [],
                    })
                  }
                  onRemoveFilter={(category, value) => {
                    setAppliedFilters((prev) => ({
                      ...prev,
                      [category]: (prev[category] || []).filter(
                        (v) => v !== value,
                      ),
                    }));
                  }}
                  onProjectClone={setProjectToClone}
                />
              </div>
            </>)
          ) : activeModule === "Claims" ? (
            // Claims Module
            selectedClaim && claimsModuleView === "workspace" ? (
              <ClaimWorkspace
                claim={selectedClaim}
                claims={claims.filter((c) => {
                  if (activeClaimsBaseView === "Global Claims")
                    return c.claimType === "Global";
                  if (activeClaimsBaseView === "Regional Claims")
                    return c.claimType === "Regional";
                  if (activeClaimsBaseView === "Local Claims")
                    return c.claimType === "Local";
                  if (activeClaimsBaseView === "SKU Claims")
                    return c.claimType === "Local SKU";
                  return true;
                })}
                onBack={() => {
                  setSelectedClaim(null);
                  setClaimsModuleView("table");
                }}
                onClaimSave={(updated) => {
                  setClaims((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c)),
                  );
                  setSelectedClaim(updated);
                }}
                onClaimsChange={setClaims}
                activeSection={activeClaimsWorkspaceSection}
                onSectionChange={setActiveClaimsWorkspaceSection}
                onClaimSelect={setSelectedClaim}
              />
            ) : (
              <ClaimsModule
                claims={claims}
                onClaimsChange={setClaims}
                activeBaseView={activeClaimsBaseView}
                onBaseViewChange={setActiveClaimsBaseView}
                activeWorkView={activeClaimsWorkView}
                onClaimClick={(claim) => {
                  setSelectedClaim(claim);
                  setClaimsModuleView("workspace");
                }}
                onAssessedBlocked={(claimId, claimLabel) =>
                  setSupportStrategyBlocker({ claimId, claimLabel })
                }
                externalSearchQuery={claimSearchQuery}
                isChainedFlow={!!pendingChainedProject}
                pendingProducts={pendingChainedProduct}
              />
            )
          ) : activeModule === "Products" ? (
            <ProductsModule
              pendingProductData={pendingChainedProduct}
              activeProductView={activeProductView}
              onViewChange={setActiveProductView}
              selectedProduct={selectedProduct}
              onProductSelect={setSelectedProduct}
              productListView={activeProductListView}
              onProductListViewChange={setActiveProductListView}
              activeProductSection={activeProductSection}
              onProductSectionChange={setActiveProductSection}
              showCreateModal={isCreateProductModalOpen}
              onCloseCreateModal={() => {
                setIsCreateProductModalOpen(false);
                if (activeModule === "Products") {
                  setPendingChainedProject(null);
                  setPendingChainedProduct(null);
                }
              }}
              showSavedViewsPanel={isProductSavedViewsPanelOpen}
              onCloseSavedViewsPanel={() =>
                setIsProductSavedViewsPanelOpen(false)
              }
              savedViews={productSavedViews}
              onSavedViewsChange={setProductSavedViews}
              appliedView={appliedProductView}
              onApplyView={handleSelectProductSavedView}
              externalSearchQuery={productSearchQuery}
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          ) : activeModule === "Assets" ? (
            selectedAsset && assetsModuleView === "workspace" ? (
              <AssetWorkspace
                asset={selectedAsset}
                assets={assets}
                onBack={() => {
                  setSelectedAsset(null);
                  setAssetsModuleView("library");
                }}
                onAssetSave={(updated) => {
                  setAssets((prev) =>
                    prev.map((a) => (a.id === updated.id ? updated : a)),
                  );
                  setSelectedAsset(updated);
                }}
                activeSection={activeAssetSection}
                onSectionChange={setActiveAssetSection}
                onAssetSelect={setSelectedAsset}
                onNavigateToProject={(projectId) => {
                  const project = projects.find(
                    (p) => p.id === projectId || p.projectId === projectId,
                  );
                  if (project) {
                    setSelectedProject(project);
                    setActiveModule("Projects");
                    setActiveWorkspaceSection("Project Details");
                    setSelectedAsset(null);
                    setAssetsModuleView("library");
                  }
                }}
                onNavigateToClaim={(claimId) => {
                  const claim = claims.find((c) => c.id === claimId);
                  if (claim) {
                    setSelectedClaim(claim);
                    setClaimsModuleView("workspace");
                    setActiveModule("Claims");
                    setActiveClaimsWorkspaceSection("Claim Details");
                    if (claim.claimType === "Global")
                      setActiveClaimsBaseView("Global Claims");
                    else if (claim.claimType === "Regional")
                      setActiveClaimsBaseView("Regional Claims");
                    else if (claim.claimType === "Local")
                      setActiveClaimsBaseView("Local Claims");
                    else setActiveClaimsBaseView("Local Claims SKU");
                    setSelectedAsset(null);
                    setAssetsModuleView("library");
                  }
                }}
              />
            ) : (
              <AssetsModule
                assets={assets}
                onAssetsChange={setAssets}
                activeLibraryView={activeAssetsLibraryView}
                onLibraryViewChange={setActiveAssetsLibraryView}
                onAssetClick={(asset) => {
                  setSelectedAsset(asset);
                  setAssetsModuleView("workspace");
                }}
                externalSearchQuery={assetSearchQuery}
              />
            )
          ) : activeModule === "Documents" ? (
            selectedDocument ? (
              <DocumentWorkspace
                document={selectedDocument}
                activeSection={activeDocumentSection}
                onSectionChange={setActiveDocumentSection}
                onDocumentSelect={setSelectedDocument}
                onClose={() => {
                  setSelectedDocument(null);
                  setActiveDocumentSection("Document Details");
                }}
                onDocumentChange={(updated) => {
                  setDocuments((prev) =>
                    prev.map((d) => (d.id === updated.id ? updated : d)),
                  );
                  setSelectedDocument(updated);
                }}
                onNewDocumentCreated={(newDoc) =>
                  setDocuments((prev) => [newDoc, ...prev])
                }
                allClaims={claims}
                allAssets={assets}
                allDocuments={documents}
                onNavigateToClaim={(claimId) => {
                  const claim = claims.find((c) => c.id === claimId);
                  if (claim) {
                    setSelectedClaim(claim);
                    setClaimsModuleView("workspace");
                    setActiveModule("Claims");
                    setActiveClaimsWorkspaceSection("Claim Details");
                    if (claim.claimType === "Global")
                      setActiveClaimsBaseView("Global Claims");
                    else if (claim.claimType === "Regional")
                      setActiveClaimsBaseView("Regional Claims");
                    else if (claim.claimType === "Local")
                      setActiveClaimsBaseView("Local Claims");
                    else setActiveClaimsBaseView("Local Claims SKU");
                    setSelectedDocument(null);
                  }
                }}
                onNavigateToAsset={(assetId) => {
                  const asset = assets.find((a) => a.id === assetId);
                  if (asset) {
                    setSelectedAsset(asset);
                    setAssetsModuleView("workspace");
                    setActiveModule("Assets");
                    setActiveAssetSection("Asset Details");
                    setSelectedDocument(null);
                  }
                }}
                onNavigateToProduct={(productId) => {
                  const product = initialProducts.find(
                    (p) => p.id === productId || p.productId === productId,
                  );
                  if (product) {
                    setSelectedProduct(product);
                    setActiveProductView("detail");
                    setActiveModule("Products");
                    setActiveProductSection("Product Details");
                    setSelectedDocument(null);
                  }
                }}
              />
            ) : (
              <DocumentsModule
                documents={documents}
                onDocumentsChange={setDocuments}
                activeLibraryView={activeDocumentsView}
                onLibraryViewChange={setActiveDocumentsView}
                onDocumentClick={(doc) => {
                  setSelectedDocument(doc);
                  setActiveDocumentSection("Document Details");
                }}
              />
            )
          ) : activeModule === "UserManagement" ? (
            <UserManagementModule />
          ) : (
            // Other modules placeholder
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-earth rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderSpecialIcon sx={{ fontSize: 16 }} />
                </div>
                <h3 className="text-night mb-2">{activeModule}</h3>
                <p className="text-sm text-gray-400">
                  This module is coming soon
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SavedViewsModal
        isOpen={isSavedViewsModalOpen}
        onClose={() => setIsSavedViewsModalOpen(false)}
        onSelectView={handleSelectSavedView}
      />
      <FilterPanel
        isOpen={isFilterPanelOpen}
        selectedCategory={filterPanelCategory}
        onShowAllFilters={() => setFilterPanelCategory(null)}
        onClose={() => setIsFilterPanelOpen(false)}
        onApplyFilters={setAppliedFilters}
        currentFilters={appliedFilters}
        quickFilters={activeQuickFilters as any}
        onApplyQuickFilters={(categories) => {
          setActiveQuickFilters(categories as any);
        }}
        showArchived={showArchived}
        onToggleShowArchived={setShowArchived}
      />
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => {
          setIsCreateProjectModalOpen(false);
          setPendingChainedProject(null);
          setPendingChainedProduct(null);
        }}
        onCreateProject={handleCreateProject}
        existingProjectNames={projects.map((p) => p.name)}
        initialData={pendingChainedProject}
      />
      {projectToClone && (
        <CloneProjectModal
          isOpen={true}
          onClose={() => setProjectToClone(null)}
          sourceProject={projectToClone}
          existingProjects={projects}
          onCloneProject={(clonedProject) => {
            setProjects((prev) => [clonedProject, ...prev]);
            toast.success(
              "Project Cloned",
              `"${clonedProject.name}" has been successfully cloned!`,
            );
            setProjectToClone(null);
          }}
        />
      )}
      {isCreateAssetModalOpen && (
        <CreateAssetModal
          isOpen={true}
          onClose={() => setIsCreateAssetModalOpen(false)}
          onCreate={(partial) => {
            const now = new Date().toISOString();
            const num = String(assets.length + 1).padStart(3, "0");
            const newAsset: Asset = {
              id: `AT-${num}`,
              name: partial.name || "",
              subtype: partial.subtype || null,
              businessGroup: partial.businessGroup || "",
              category: partial.category || "",
              currentVersionNumber: "1.0",
              versions: [
                {
                  versionNumber: "1.0",
                  fileType: partial.isPlaceholder ? "placeholder" : "image",
                  fileSizeMB: 0,
                  uploadedAt: now,
                  uploadedBy: "Current User",
                  riskRecords: [],
                  finalRisk: {
                    finalRiskLevel: null,
                    marketingRiskSignoff: false,
                  },
                },
              ],
              lifecycleStage: partial.lifecycleStage || "Proposed",
              isPlaceholder: partial.isPlaceholder || false,
              geography: partial.geography || [],
              linkedClaimIds: partial.linkedClaimIds || [],
              linkedProjectIds: partial.linkedProjectIds || [],
              relatedAssetIds: partial.relatedAssetIds || [],
              anchors: partial.anchors || [],
              assetLevelComments: partial.assetLevelComments || [],
              approvalWorkflow: partial.approvalWorkflow || null,
              auditLog: partial.auditLog || [],
              createdAt: partial.createdAt || now,
              modifiedAt: partial.modifiedAt || now,
              createdBy: partial.createdBy || "Current User",
              isFavorite: partial.isFavorite || false,
            };
            setAssets((prev) => [...prev, newAsset]);
            setIsCreateAssetModalOpen(false);
          }}
        />
      )}

      {/* F03 — Support Strategy required before Assessed transition */}
      {supportStrategyBlocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-200">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Assessment Blocked
                </h3>
                <p className="text-xs text-amber-600 mt-0.5">
                  {supportStrategyBlocker.claimId}
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-night leading-relaxed">
                <strong>Support Strategy is required before assessment.</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                This claim cannot transition to{" "}
                <span className="font-medium text-night">Assessed</span> until a
                non-empty Support Strategy is provided. Please add the
                justification and try again.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-pebble bg-gray-50">
              <button
                onClick={() => {
                  setSupportStrategyBlocker(null);
                  // Jump to the claim workspace, Support Strategy section
                  const claim = claims.find(
                    (c) => c.id === supportStrategyBlocker.claimId,
                  );
                  if (claim) {
                    setSelectedClaim(claim);
                    setClaimsModuleView("workspace");
                    setActiveClaimsWorkspaceSection(
                      "Support Strategy & Substantiation",
                    );
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky text-white rounded-xl text-sm font-medium hover:bg-dark transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
                Go to Support Strategy
              </button>
              <button
                onClick={() => setSupportStrategyBlocker(null)}
                className="px-4 py-2.5 border border-pebble text-gray-600 rounded-xl text-sm hover:bg-earth transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Views Dialogs */}
      {saveDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/50 backdrop-blur-sm"
            onClick={() =>
              setSaveDialogState({
                isOpen: false,
                name: "",
                overwriteWarning: false,
              })
            }
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <SaveIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>
                  Save Current View
                </h3>
                <p className="text-xs text-gray-500">
                  Save your active filters and column states
                </p>
              </div>
            </div>

            {saveDialogState.overwriteWarning ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  A saved view named{" "}
                  <strong className="font-semibold">
                    "{saveDialogState.name}"
                  </strong>{" "}
                  already exists. Overwriting it will update its filters with
                  your current layout.
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() =>
                      setSaveDialogState((prev) => ({
                        ...prev,
                        overwriteWarning: false,
                      }))
                    }
                    className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                  >
                    Choose Different Name
                  </button>
                  <button
                    onClick={() =>
                      handleSaveViewConfirm(saveDialogState.name, true)
                    }
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                  >
                    Overwrite View
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-xs text-gray-500 uppercase tracking-wide mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    View Name
                  </label>
                  <input
                    type="text"
                    value={saveDialogState.name}
                    onChange={(e) =>
                      setSaveDialogState((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. In Progress Global Reviews"
                    className="w-full px-3.5 py-2.5 border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() =>
                      setSaveDialogState({
                        isOpen: false,
                        name: "",
                        overwriteWarning: false,
                      })
                    }
                    className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveViewConfirm(saveDialogState.name)}
                    disabled={!saveDialogState.name.trim()}
                    className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40 transition-colors"
                  >
                    Save View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {renameDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/50 backdrop-blur-sm"
            onClick={() => setRenameDialogState({ isOpen: false, name: "" })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <EditIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>
                  Rename Saved View
                </h3>
                <p className="text-xs text-gray-500">
                  Choose a new label for this custom configuration
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs text-gray-500 uppercase tracking-wide mb-1"
                  style={{ fontWeight: 600 }}
                >
                  New Name
                </label>
                <input
                  type="text"
                  value={renameDialogState.name}
                  onChange={(e) =>
                    setRenameDialogState((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. My Custom Layout"
                  className="w-full px-3.5 py-2.5 border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() =>
                    setRenameDialogState({ isOpen: false, name: "" })
                  }
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleRenameViewConfirm(renameDialogState.name)
                  }
                  disabled={!renameDialogState.name.trim()}
                  className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40 transition-colors"
                >
                  Rename View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/50 backdrop-blur-sm"
            onClick={() => setDeleteDialogState({ isOpen: false })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <DeleteIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>
                  Delete Saved View
                </h3>
                <p className="text-xs text-gray-500">
                  This view will be permanently removed from your system
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you absolutely sure you want to delete the saved view{" "}
                <strong className="font-semibold">
                  "{activeView.replace("Saved View: ", "")}"
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteDialogState({ isOpen: false })}
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteViewConfirm}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Delete View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shareDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-night/50 backdrop-blur-sm"
            onClick={() =>
              setShareDialogState({
                isOpen: false,
                search: "",
                selectedUsers: [],
                makeDefault: false,
              })
            }
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <ShareIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>
                  Share Saved View
                </h3>
                <p className="text-xs text-gray-500">
                  Allow team members to use this layout
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search input to filter team members */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">
                  Search &amp; Filter Users
                </label>
                <div className="relative">
                  <SearchIcon sx={{ fontSize: 16 }} />
                  <input
                    type="text"
                    value={shareDialogState.search}
                    onChange={(e) =>
                      setShareDialogState((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    placeholder="Search users..."
                    className="w-full pl-9 pr-8 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  {shareDialogState.search && (
                    <button
                      onClick={() =>
                        setShareDialogState((prev) => ({ ...prev, search: "" }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs text-gray-500 uppercase tracking-wide mb-2"
                  style={{ fontWeight: 600 }}
                >
                  Select Team Members (Multiselect)
                </label>
                <div className="flex flex-wrap gap-2 mb-3 max-h-[140px] overflow-y-auto p-1 border border-pebble/60 rounded-lg">
                  {[
                    "Sarah Johnson",
                    "Michael Chen",
                    "Emma Williams",
                    "James Brown",
                    "Jennifer Davis",
                    "Lisa Anderson",
                  ]
                    .filter((user) =>
                      user
                        .toLowerCase()
                        .includes(shareDialogState.search.toLowerCase()),
                    )
                    .map((user) => {
                      const isSelected =
                        shareDialogState.selectedUsers.includes(user);
                      return (
                        <button
                          key={user}
                          onClick={() => {
                            setShareDialogState((prev) => ({
                              ...prev,
                              selectedUsers: isSelected
                                ? prev.selectedUsers.filter((u) => u !== user)
                                : [...prev.selectedUsers, user],
                            }));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                            isSelected
                              ? "border-sky bg-pale text-sky font-medium shadow-sm"
                              : "border-pebble text-gray-600 hover:border-sky/40 hover:bg-earth"
                          }`}
                        >
                          {isSelected && <CheckIcon sx={{ fontSize: 16 }} />}
                          {user}
                        </button>
                      );
                    })}
                  {[
                    "Sarah Johnson",
                    "Michael Chen",
                    "Emma Williams",
                    "James Brown",
                    "Jennifer Davis",
                    "Lisa Anderson",
                  ].filter((user) =>
                    user
                      .toLowerCase()
                      .includes(shareDialogState.search.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-xs text-gray-400 italic p-2">
                      No users match your search.
                    </p>
                  )}
                </div>
              </div>

              {/* Set as Default View checkbox option */}
              <div className="flex items-center gap-2.5 pt-3 pb-1 border-t border-pebble">
                <input
                  type="checkbox"
                  id="share-make-default-checkbox-app"
                  checked={shareDialogState.makeDefault}
                  onChange={(e) =>
                    setShareDialogState((prev) => ({
                      ...prev,
                      makeDefault: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-sky focus:ring-sky border-pebble accent-sky cursor-pointer"
                />
                <label
                  htmlFor="share-make-default-checkbox-app"
                  className="text-sm text-gray-700 cursor-pointer select-none font-medium"
                >
                  Set as Default View on share{" "}
                  <span className="text-[10px] text-gray-400 font-normal ml-0.5">
                    (Field enabled only for Business Admin)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-pebble">
                <button
                  onClick={() =>
                    setShareDialogState({
                      isOpen: false,
                      search: "",
                      selectedUsers: [],
                      makeDefault: false,
                    })
                  }
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleShareViewConfirm(shareDialogState.selectedUsers)
                  }
                  disabled={shareDialogState.selectedUsers.length === 0}
                  className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-40 transition-colors"
                >
                  Share View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
