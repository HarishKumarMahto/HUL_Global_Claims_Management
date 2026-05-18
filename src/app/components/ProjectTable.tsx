import { useState, useRef, useEffect } from "react";
import {
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Settings,
  FolderOpen,
  FileText,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  GripVertical,
  Check,
  Plus,
  FolderKanban,
  Download,
  Search,
} from "lucide-react";
import { Project, TableState, ColumnConfig } from "../types";
import { ChevronDown } from "lucide-react";
import EmptyState from "./ui/EmptyState";
import { TablePagination, formatDate } from "./ui/tableUtils";
import AuditLogModal, { AuditLogItem } from "./AuditLogModal";


interface ProjectTableProps {
  onProjectClick: (project: Project) => void;
  activeView: string;
  savedState?: TableState;
  onStateChange?: (state: TableState) => void;
  recentlyAccessedIds?: string[];
  currentUserRoles?: {
    projectLead?: string;
    claimsLead?: string;
  };
  appliedFilters?: {
    status?: string[];
    region?: string[];
    businessGroup?: string[];
    projectType?: string[];
    category?: string[];
    scope?: string[];
    projectLead?: string[];
    claimsLead?: string[];
  };
  searchQuery?: string;
  projects: Project[];
  favorites: Set<string>;
  onFavoriteToggle: (id: string) => void;
  onClearFilters?: () => void;
  onRemoveFilter?: (category: string, value: string) => void;
  onProjectClone?: (project: Project) => void;
}

type SortDirection = "asc" | "desc" | null;
type SortableColumn = keyof Project;

const defaultColumnOrder: ColumnConfig[] = [
  { id: "favorite", label: "", width: 48, visible: true },
  {
    id: "name",
    label: "Project Name",
    sortKey: "name",
    width: 280,
    visible: true,
  },

  {
    id: "type",
    label: "Type",
    sortKey: "type",
    width: 160,
    visible: true,
  },
  {
    id: "businessGroup",
    label: "Business Group",
    sortKey: "businessGroup",
    width: 190,
    visible: true,
  },
  {
    id: "category",
    label: "Category",
    sortKey: "category",
    width: 150,
    visible: true,
  },
  {
    id: "scope",
    label: "Scope",
    sortKey: "scope",
    width: 120,
    visible: true,
  },
  {
    id: "region",
    label: "Region",
    sortKey: "region",
    width: 140,
    visible: true,
  },
  {
    id: "projectLead",
    label: "Project Creator",
    sortKey: "projectLead",
    width: 180,
    visible: true,
  },
  {
    id: "teamMembers",
    label: "Team Members",
    sortKey: "teamMembers",
    width: 180,
    visible: true,
  },
  {
    id: "pendingWith",
    label: "Pending With",
    sortKey: "pendingWith",
    width: 180,
    visible: true,
  },
  {
    id: "lifecycleStage",
    label: "Lifecycle State",
    sortKey: "lifecycleStage",
    width: 180,
    visible: true,
  },
  {
    id: "lastUpdated",
    label: "Last Updated",
    sortKey: "lastUpdated",
    width: 140,
    visible: true,
  },
];

// Removed colored badges and AvatarInitials per plain text UI requirements.

// Column Config Panel Component
function ColumnConfigPanel({
  columns,
  onToggle,
  onRestore,
  onClose,
  onExport,
}: {
  columns: ColumnConfig[];
  onToggle: (id: string) => void;
  onRestore: () => void;
  onClose: () => void;
  onExport: (format: "pdf" | "excel" | "word" | "csv") => void;
}) {
  const configurableColumns = columns.filter(
    (c) => c.id !== "favorite" && c.id !== "actions",
  );
  const visibleCount = configurableColumns.filter(
    (c) => c.visible !== false,
  ).length;
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-64 overflow-hidden">
        <div className="px-4 py-3 border-b border-pebble flex items-center justify-between">
          <span
            className="text-sm text-night"
            style={{ fontWeight: 600 }}
          >
            Configure Columns
          </span>
          <span className="text-xs text-gray-400">
            {visibleCount} of {configurableColumns.length}{" "}
            visible
          </span>
        </div>
        <div className="p-2 max-h-56 overflow-y-auto">
          {configurableColumns.map((col) => {
            const isVisible = col.visible !== false;
            return (
              <button
                key={col.id}
                onClick={() => onToggle(col.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth transition-colors text-left"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isVisible ? "bg-sky border-sky" : "border-gray-300"}`}
                >
                  {isVisible && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-sm text-night">
                  {col.label}
                </span>
                <span className="ml-auto">
                  {isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Export Options Panel Section */}
        <div className="px-4 py-3 border-t border-pebble bg-earth/30">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Export Table
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Excel", format: "excel", color: "text-green-600 hover:bg-green-50 hover:border-green-300" },
              { label: "CSV", format: "csv", color: "text-blue-600 hover:bg-blue-50 hover:border-blue-300" },
              { label: "PDF", format: "pdf", color: "text-red-600 hover:bg-red-50 hover:border-red-300" },
              { label: "Word", format: "word", color: "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onExport(item.format as any)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 border border-pebble rounded-lg text-xs font-medium transition-colors bg-white ${item.color}`}
              >
                <Download className="w-3 h-3 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-pebble flex items-center gap-2 bg-white">
          <button
            onClick={onRestore}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors px-2 py-1 rounded hover:bg-earth"
          >
            <RotateCcw className="w-3 h-3" />
            Restore
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

const generateProjectLogs = (project: Project): AuditLogItem[] => {
  return [
    {
      id: `${project.id}-log-1`,
      timestamp: project.startDate || '2026-01-10',
      actor: project.projectCreator || project.projectLead || "Sarah Johnson",
      role: 'Project Creator',
      action: 'Project initialized',
      details: `Project "${project.name}" master record created with initial status "${project.status}" and category "${project.category}".`,
      type: 'create'
    },
    {
      id: `${project.id}-log-2`,
      timestamp: project.startDate || '2026-01-11',
      actor: project.projectLead,
      role: 'Project Lead',
      action: 'External reference added',
      details: `Linked external system reference key: ${project.externalRef || "N/A"}.`,
      type: 'link'
    },
    {
      id: `${project.id}-log-3`,
      timestamp: '2026-02-15',
      actor: project.projectLead,
      role: 'Project Lead',
      action: 'Lifecycle Stage updated',
      details: `Transitioned stage from Draft to ${project.lifecycleStage || 'Substantiate'}.`,
      type: 'status'
    },
    {
      id: `${project.id}-log-4`,
      timestamp: '2026-03-22',
      actor: project.claimsLead || 'Michael Chen',
      role: 'Claims Lead',
      action: 'Associated resources verified',
      details: 'Validated claims database compliance thresholds and attached marketing materials.',
      type: 'update'
    },
    {
      id: `${project.id}-log-5`,
      timestamp: project.lastUpdated || '2026-04-25',
      actor: 'System Integration Agent',
      role: 'System',
      action: 'Master sync complete',
      details: `Synced across all regions. Last modified date recorded as ${project.lastUpdated || '2026-04-25'}.`,
      type: 'system'
    }
  ];
};

export const getProjectTeamMembers = (projectId: string, projects?: Project[]) => {
  if (projects) {
    const proj = projects.find(p => p.id === projectId);
    if (proj && proj.teamMembers) {
      return proj.teamMembers
        .filter(m => m.status === 'active')
        .map(m => {
          const color = m.teamId === 'rd' ? 'bg-blue-100 text-blue-700' : m.teamId === 'ra' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';
          return {
            initials: m.avatar,
            name: m.name,
            role: m.role,
            color
          };
        });
    }
  }
  return projectId === "1"
    ? [
      { initials: "SJ", name: "Dr. Sarah Johnson", role: "Project Creator", color: "bg-blue-100 text-blue-700" },
      { initials: "PS", name: "Dr. Priya Sharma", role: "R&D Scientist", color: "bg-blue-100 text-blue-700" },
      { initials: "MC", name: "Michael Chen", role: "Claims Lead", color: "bg-purple-100 text-purple-700" },
      { initials: "EW", name: "Emma Williams", role: "Regulatory Manager", color: "bg-purple-100 text-purple-700" },
      { initials: "RT", name: "Robert Taylor", role: "Legal Counsel", color: "bg-green-100 text-green-700" },
    ]
    : projectId === "2"
      ? [
        { initials: "SJ", name: "Dr. Sarah Johnson", role: "Project Creator", color: "bg-blue-100 text-blue-700" },
        { initials: "MC", name: "Michael Chen", role: "Claims Lead", color: "bg-purple-100 text-purple-700" },
        { initials: "PM", name: "Patricia Martinez", role: "IP Attorney", color: "bg-green-100 text-green-700" },
      ]
      : [
        { initials: "SJ", name: "Dr. Sarah Johnson", role: "Project Creator", color: "bg-blue-100 text-blue-700" },
        { initials: "PS", name: "Dr. Priya Sharma", role: "R&D Scientist", color: "bg-blue-100 text-blue-700" },
        { initials: "MC", name: "Michael Chen", role: "Claims Lead", color: "bg-purple-100 text-purple-700" },
      ];
};

export const getPendingTeamMembers = (projectId: string, projects?: Project[]) => {
  if (projects) {
    const proj = projects.find(p => p.id === projectId);
    if (proj && proj.teamMembers) {
      return proj.teamMembers
        .filter(m => m.status === 'pending')
        .map(m => {
          const color = m.teamId === 'rd' ? 'bg-blue-100 text-blue-700' : m.teamId === 'ra' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';
          return {
            initials: m.avatar,
            name: m.name,
            role: m.role,
            color
          };
        });
    }
  }
  return projectId === "1"
    ? [
      { initials: "PS", name: "Dr. Priya Sharma", role: "R&D Scientist", color: "bg-blue-100 text-blue-700" },
      { initials: "EW", name: "Emma Williams", role: "Regulatory Manager", color: "bg-purple-100 text-purple-700" },
    ]
    : projectId === "2"
      ? [
        { initials: "MC", name: "Michael Chen", role: "Claims Lead", color: "bg-purple-100 text-purple-700" },
        { initials: "PM", name: "Patricia Martinez", role: "IP Attorney", color: "bg-green-100 text-green-700" },
      ]
      : projectId === "3"
        ? []
        : projectId === "4"
          ? [
            { initials: "RT", name: "Robert Taylor", role: "Legal Counsel", color: "bg-green-100 text-green-700" },
          ]
          : projectId === "5"
            ? [
              { initials: "EW", name: "Emma Williams", role: "Regulatory Manager", color: "bg-purple-100 text-purple-700" },
            ]
            : projectId === "6"
              ? [
                { initials: "PM", name: "Patricia Martinez", role: "IP Attorney", color: "bg-green-100 text-green-700" },
              ]
              : [
                { initials: "PS", name: "Dr. Priya Sharma", role: "R&D Scientist", color: "bg-blue-100 text-blue-700" },
              ];
};

const FILTER_NAMES: Record<string, string> = {
  status: "Status",
  lifecycleStage: "Stage",
  businessGroup: "Business Group",
  projectType: "Project Type",
  category: "Category",
  scope: "Project Scope",
  projectLead: "Project Creator",
  claimsLead: "Claims Lead",
};

export default function ProjectTable({
  onProjectClick,
  activeView,
  savedState,
  onStateChange,
  recentlyAccessedIds = [],
  currentUserRoles = {
    projectLead: "Sarah Johnson",
    claimsLead: "Michael Chen",
  },
  appliedFilters,
  searchQuery = "",
  projects,
  favorites,
  onFavoriteToggle,
  onClearFilters,
  onRemoveFilter,
  onProjectClone,
}: ProjectTableProps) {
  const [sortColumn, setSortColumn] =
    useState<SortableColumn | null>(
      (savedState?.sortColumn as SortableColumn | null) || null,
    );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(savedState?.sortDirection || null);
  const [currentPage, setCurrentPage] = useState(
    savedState?.currentPage || 1,
  );
  const [columnOrder, setColumnOrder] = useState<
    ColumnConfig[]
  >(
    savedState?.columnOrder?.length
      ? savedState.columnOrder
      : defaultColumnOrder,
  );
  const [columnWidths, setColumnWidths] = useState<
    Record<string, number>
  >(savedState?.columnWidths || {});
  const [draggedColumn, setDraggedColumn] = useState<
    number | null
  >(null);
  const [resizingColumn, setResizingColumn] = useState<
    string | null
  >(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(
    new Set(),
  );
  const [actionMenuOpen, setActionMenuOpen] = useState<
    string | null
  >(null);
  const [columnConfigOpen, setColumnConfigOpen] =
    useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"Clone" | "Audit Log" | "Cancel Project" | "Export to CSV" | "Export to Excel" | "Export to Word" | "Export to PDF" | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [colCheckboxes, setColCheckboxes] = useState<Record<string, string[]>>({});
  const [selectedProjectForAudit, setSelectedProjectForAudit] = useState<Project | null>(null);
  const [projectToCancel, setProjectToCancel] = useState<Project | null>(null);
  const [cancelledProjectIds, setCancelledProjectIds] = useState<Set<string>>(new Set());
  const [exportConfig, setExportConfig] = useState<{
    isOpen: boolean;
    format: "pdf" | "excel" | "word" | "csv";
    selectedColumns: string[];
    rowsToExport?: Set<string>;
  } | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (columnOrder.some(c => c.id === "claimsLead") || columnOrder.some(c => c.id === "status") || !columnOrder.some(c => c.id === "pendingWith")) {
      setColumnOrder(defaultColumnOrder);
    }
  }, [columnOrder]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        sortColumn,
        sortDirection,
        currentPage,
        columnOrder,
        columnWidths,
      });
    }
  }, [
    sortColumn,
    sortDirection,
    currentPage,
    columnOrder,
    columnWidths,
  ]);

  const getFilteredProjects = (): Project[] => {
    let filtered = projects;

    switch (activeView) {
      case "Recent Projects":
        if (recentlyAccessedIds.length === 0) {
          return [...projects]
            .sort(
              (a, b) =>
                new Date(b.lastUpdated).getTime() -
                new Date(a.lastUpdated).getTime(),
            )
            .slice(0, 5);
        }
        return recentlyAccessedIds
          .map((id) => projects.find((p) => p.id === id))
          .filter((p): p is Project => !!p);
      case "My Projects": {
        const hasActiveFilters = appliedFilters && Object.values(appliedFilters).some(arr => arr?.length > 0);
        if (!hasActiveFilters) {
          filtered = projects.filter(
            (p) =>
              p.projectLead === currentUserRoles.projectLead ||
              p.claimsLead === currentUserRoles.claimsLead,
          );
        }
        break;
      }
      case "Favorites":
        filtered = projects.filter((p) => favorites.has(p.id));
        break;
      default:
        break;
    }

    if (appliedFilters) {
      if (appliedFilters.status?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.status!.includes(p.status),
        );
      if (appliedFilters.lifecycleStage?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.lifecycleStage!.includes(p.lifecycleStage),
        );
      if (appliedFilters.region?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.region!.includes(p.region),
        );
      if (appliedFilters.businessGroup?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.businessGroup!.includes(
            p.businessGroup,
          ),
        );
      if (appliedFilters.projectType?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.projectType!.includes(p.type),
        );
      if (appliedFilters.category?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.category!.includes(p.category),
        );
      if (appliedFilters.scope?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.scope!.includes(p.scope),
        );
      if (appliedFilters.projectLead?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.projectLead!.includes(p.projectLead),
        );
      if (appliedFilters.claimsLead?.length)
        filtered = filtered.filter((p) =>
          appliedFilters.claimsLead!.includes(p.claimsLead),
        );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.projectId.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.businessGroup.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.projectLead.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }

    // Apply column-specific search and checkbox filters
    filtered = filtered.filter((p) => {
      // 1. Column specific search query filter
      const searchPassed = Object.entries(colSearch).every(([colId, query]) => {
        if (!query) return true;
        const q = query.toLowerCase();
        switch (colId) {
          case "name":
            return p.name.toLowerCase().includes(q);
          case "projectId":
            return p.projectId.toLowerCase().includes(q);
          case "type":
            return p.type.toLowerCase().includes(q);
          case "businessGroup":
            return p.businessGroup.toLowerCase().includes(q);
          case "category":
            return (p.category || "").toLowerCase().includes(q);
          case "scope":
            return p.scope.toLowerCase().includes(q);
          case "region":
            return p.region.toLowerCase().includes(q);
          case "projectLead":
            return p.projectLead.toLowerCase().includes(q);
          case "teamMembers": {
            const tm = getProjectTeamMembers(p.id, projects).map(m => m.name || m.fullName).join(", ").toLowerCase();
            return tm.includes(q);
          }
          case "pendingWith": {
            const tm = getPendingTeamMembers(p.id, projects).map(m => m.name || m.fullName).join(", ").toLowerCase();
            return tm.includes(q);
          }
          case "status":
            return p.status.toLowerCase().includes(q);
          case "lifecycleStage":
            return p.lifecycleStage.toLowerCase().includes(q);
          case "lastUpdated":
            return formatDate(p.lastUpdated).toLowerCase().includes(q);
          default:
            return true;
        }
      });

      // 2. Column specific checkboxes filter
      const checkboxesPassed = Object.entries(colCheckboxes).every(([colId, selectedList]) => {
        if (!selectedList || selectedList.length === 0) return true;
        let pVal = "";
        switch (colId) {
          case "name": pVal = p.name; break;
          case "projectId": pVal = p.projectId; break;
          case "type": pVal = p.type; break;
          case "businessGroup": pVal = p.businessGroup; break;
          case "category": pVal = p.category || ""; break;
          case "scope": pVal = p.scope; break;
          case "region": pVal = p.region; break;
          case "projectLead": pVal = p.projectLead; break;
          case "status": pVal = p.status; break;
          case "lifecycleStage": pVal = p.lifecycleStage; break;
          default: return true;
        }
        return selectedList.includes(pVal);
      });

      return searchPassed && checkboxesPassed;
    });

    return filtered;
  };

  const handleSort = (key: SortableColumn) => {
    if (sortColumn === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortProjects = (list: Project[]) => {
    if (!sortColumn || !sortDirection) return list;
    return [...list].sort((a, b) => {
      const aVal = a[sortColumn] as string;
      const bVal = b[sortColumn] as string;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleExport = (format: "pdf" | "excel" | "word" | "csv", rowsToExport?: Set<string>) => {
    const initialCols = columnOrder
      .filter(c => c.visible !== false && c.id !== "favorite" && c.id !== "actions" && c.label !== "")
      .map(c => c.id);
    setExportConfig({
      isOpen: true,
      format,
      selectedColumns: initialCols,
      rowsToExport,
    });
  };

  const executeExport = (format: "pdf" | "excel" | "word" | "csv", selectedColIds: string[]) => {
    const baseList = getFilteredProjects();
    const list = exportConfig?.rowsToExport && exportConfig.rowsToExport.size > 0 
      ? baseList.filter(p => exportConfig.rowsToExport!.has(p.id)) 
      : baseList;
    const activeCols = columnOrder.filter(c => selectedColIds.includes(c.id));
    const headers = activeCols.map(col => col.label);

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...list.map(p =>
          activeCols
            .map(col => {
              if (col.id === "name") return `"${p.name}"`;
              if (col.id === "type") return `"${p.type}"`;
              if (col.id === "businessGroup") return `"${p.businessGroup}"`;
              if (col.id === "category") return `"${p.category}"`;
              if (col.id === "scope") return `"${p.scope}"`;
              if (col.id === "region") return `"${p.region}"`;
              if (col.id === "projectLead") return `"${p.projectLead}"`;
              if (col.id === "status") return `"${p.status}"`;
              if (col.id === "lifecycleStage") return `"${p.lifecycleStage}"`;
              if (col.id === "lastUpdated") return `"${formatDate(p.lastUpdated)}"`;
              return "";
            })
            .join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            <tr style="background-color: #F6F7F0; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
            ${list.map(p => `
              <tr>
                ${activeCols.map(col => {
        if (col.id === "name") return `<td>${p.name}</td>`;
        if (col.id === "type") return `<td>${p.type}</td>`;
        if (col.id === "businessGroup") return `<td>${p.businessGroup}</td>`;
        if (col.id === "category") return `<td>${p.category}</td>`;
        if (col.id === "scope") return `<td>${p.scope}</td>`;
        if (col.id === "region") return `<td>${p.region}</td>`;
        if (col.id === "projectLead") return `<td>${p.projectLead}</td>`;
        if (col.id === "status") return `<td>${p.status}</td>`;
        if (col.id === "lifecycleStage") return `<td>${p.lifecycleStage}</td>`;
        if (col.id === "lastUpdated") return `<td>${formatDate(p.lastUpdated)}</td>`;
        return "";
      }).join("")}
              </tr>
            `).join("")}
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_export_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "word") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/><title>Projects Export</title></head>
        <body>
          <h2>Project list export</h2>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #F6F7F0; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
            ${list.map(p => `
              <tr>
                ${activeCols.map(col => {
        if (col.id === "name") return `<td>${p.name}</td>`;
        if (col.id === "type") return `<td>${p.type}</td>`;
        if (col.id === "businessGroup") return `<td>${p.businessGroup}</td>`;
        if (col.id === "category") return `<td>${p.category}</td>`;
        if (col.id === "scope") return `<td>${p.scope}</td>`;
        if (col.id === "region") return `<td>${p.region}</td>`;
        if (col.id === "projectLead") return `<td>${p.projectLead}</td>`;
        if (col.id === "status") return `<td>${p.status}</td>`;
        if (col.id === "lifecycleStage") return `<td>${p.lifecycleStage}</td>`;
        if (col.id === "lastUpdated") return `<td>${formatDate(p.lastUpdated)}</td>`;
        return "";
      }).join("")}
              </tr>
            `).join("")}
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_export_${new Date().toISOString().slice(0, 10)}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      let report = `========================================================================================\n`;
      report += `                                   PROJECTS REPORT EXPORT                               \n`;
      report += `                             Generated on: ${new Date().toLocaleDateString()}           \n`;
      report += `========================================================================================\n\n`;

      list.forEach((p, idx) => {
        report += `${idx + 1}. PROJECT NAME: ${p.name}\n`;
        report += `   ---------------------------------------------------------------------------------\n`;
        report += `   • Type: ${p.type}\n`;
        report += `   • Business Group: ${p.businessGroup}\n`;
        report += `   • Category: ${p.category}\n`;
        report += `   • Scope: ${p.scope}\n`;
        report += `   • Region/Geography: ${p.region}\n`;
        report += `   • Project Creator: ${p.projectLead}\n`;
        report += `   • Status: ${p.status}\n`;
        report += `   • Lifecycle Stage: ${p.lifecycleStage}\n`;
        report += `   • Last Sync/Updated: ${formatDate(p.lastUpdated)}\n`;
        report += `========================================================================================\n\n`;
      });

      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_export_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleColumnDragStart = (index: number) =>
    setDraggedColumn(index);
  const handleColumnDragOver = (
    e: React.DragEvent,
    index: number,
  ) => {
    e.preventDefault();
    if (draggedColumn === null || draggedColumn === index)
      return;
    const newOrder = [...columnOrder];
    const [dragged] = newOrder.splice(draggedColumn, 1);
    newOrder.splice(index, 0, dragged);
    setColumnOrder(newOrder);
    setDraggedColumn(index);
  };
  const handleColumnDragEnd = () => setDraggedColumn(null);

  const handleResizeStart = (
    e: React.MouseEvent,
    columnId: string,
    currentWidth: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentWidth;
  };

  useEffect(() => {
    if (!resizingColumn) return;
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(
        60,
        resizeStartWidth.current + diff,
      );
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };
    const handleMouseUp = () => setResizingColumn(null);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn]);

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleColumnVisibility = (id: string) => {
    setColumnOrder((prev) =>
      prev.map((col) =>
        col.id === id
          ? {
            ...col,
            visible: col.visible === false ? true : false,
          }
          : col,
      ),
    );
  };

  const handleRestoreDefaults = () => {
    setColumnOrder(defaultColumnOrder);
    setColumnWidths({});
    setColumnConfigOpen(false);
  };

  const filteredProjects = getFilteredProjects();
  const sortedProjects = sortProjects(filteredProjects);
  const totalPages = Math.max(
    1,
    Math.ceil(sortedProjects.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProjects = sortedProjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalRecords = sortedProjects.length;

  const isAllCurrentSelected = currentProjects.length > 0 && currentProjects.every(p => selectedRows.has(p.id));

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set([...selectedRows, ...currentProjects.map(p => p.id)]));
    } else {
      const newSet = new Set(selectedRows);
      currentProjects.forEach(p => newSet.delete(p.id));
      setSelectedRows(newSet);
    }
  };

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getColumnWidth = (col: ColumnConfig) =>
    columnWidths[col.id] || col.width;

  const renderSortIcon = (key?: string) => {
    if (!key) return null;
    if (sortColumn !== key)
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-colors" />
      );
    if (sortDirection === "asc")
      return <ArrowUp className="w-3.5 h-3.5 text-sky stroke-[2.5]" />;
    return <ArrowDown className="w-3.5 h-3.5 text-sky stroke-[2.5]" />;
  };

  const renderCell = (
    project: Project,
    column: ColumnConfig,
  ) => {
    switch (column.id) {
      case "favorite":
        return (
          <td
            key={column.id}
            className={`px-3 py-3 ${isFrozen ? (pendingAction ? "sticky left-[40px] z-10" : "sticky left-0 z-10") : ""}`}
            style={{
              width: "48px",
              minWidth: "48px",
              maxWidth: "48px",
              ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onFavoriteToggle(project.id)}
              className="focus:outline-none transition-transform duration-200 transform hover:scale-110"
            >
              <Star
                className={`w-4.5 h-4.5 transition-all ${favorites.has(project.id) ? "fill-yellow-400 text-yellow-500" : "text-gray-400 hover:text-yellow-500 hover:fill-yellow-100"}`}
              />
            </button>
          </td>
        );
      case "name":
        return (
          <td
            key={column.id}
            className={`px-4 py-3 ${isFrozen ? (pendingAction ? "sticky left-[88px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : "sticky left-[48px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]") : ""}`}
            style={{
              width: getColumnWidth(column),
              minWidth: getColumnWidth(column),
              ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
            }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => onProjectClick(project)}
                className="text-sky hover:text-dark hover:underline text-sm text-left truncate max-w-full"
              >
                {project.name}
              </button>
            </div>
          </td>
        );

      case "status":
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {project.status}
          </td>
        );
      case "lifecycleStage":
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {project.lifecycleStage}
          </td>
        );
      case "scope":
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {project.scope}
          </td>
        );
      case "projectLead":
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {project.projectLead}
          </td>
        );
      case "teamMembers": {
        const teamMembersList = getProjectTeamMembers(project.id, projects);

        return (
          <td
            key={column.id}
            className="px-4 py-3"
            style={{
              width: getColumnWidth(column),
              minWidth: getColumnWidth(column),
            }}
          >
            <div
              className="flex items-center -space-x-1.5 overflow-hidden cursor-pointer"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverCoords({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
                setHoveredProjectId(project.id);
                setHoveredColumnId("teamMembers");
              }}
              onMouseLeave={() => {
                setHoveredProjectId(null);
                setHoveredColumnId(null);
              }}
            >
              {teamMembersList.slice(0, 4).map((member, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${member.color}`}
                >
                  {member.initials}
                </div>
              ))}
              {teamMembersList.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                  +{teamMembersList.length - 4}
                </div>
              )}
            </div>
          </td>
        );
      }
      case "pendingWith": {
        const pendingList = getPendingTeamMembers(project.id, projects);

        return (
          <td
            key={column.id}
            className="px-4 py-3"
            style={{
              width: getColumnWidth(column),
              minWidth: getColumnWidth(column),
            }}
          >
            {pendingList.length === 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-full font-medium">
                <Check className="w-3 h-3 stroke-[2.5]" /> Approved
              </span>
            ) : (
              <div
                className="flex flex-wrap gap-1 cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverCoords({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                  setHoveredProjectId(project.id);
                  setHoveredColumnId("pendingWith");
                }}
                onMouseLeave={() => {
                  setHoveredProjectId(null);
                  setHoveredColumnId(null);
                }}
              >
                {pendingList.map((member, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.color}`}
                  >
                    {member.initials}
                  </span>
                ))}
              </div>
            )}
          </td>
        );
      }
      case "lastUpdated":
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {formatDate(project.lastUpdated)}
          </td>
        );
      default: {
        const val = project[column.sortKey as keyof Project];
        return (
          <td
            key={column.id}
            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap"
          >
            {String(val ?? "")}
          </td>
        );
      }
    }
  };

  const visibleColumns = columnOrder.filter(
    (col) => col.visible !== false && col.id !== "actions",
  );

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">

      {/* Active filter chips row */}
      {appliedFilters &&
        Object.values(appliedFilters).some(
          (v) => v.length > 0,
        ) && (
          <div className="px-4 py-2 bg-earth/30 border-b border-pebble flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-1">
                Active filters:
              </span>
              {Object.entries(appliedFilters).map(
                ([key, values]) => {
                  const arr = values as string[];
                  if (!arr || arr.length === 0) return null;
                  const filterLabel = FILTER_NAMES[key] || key;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm"
                    >
                      <span className="text-gray-400 font-normal">{filterLabel}:</span>
                      <span>{arr.join(", ")}</span>
                      {onRemoveFilter && (
                        <button
                          onClick={() => {
                            arr.forEach((val) => onRemoveFilter(key, val));
                          }}
                          className="hover:text-red-500 ml-1 text-gray-400 transition-colors"
                          title={`Clear all ${filterLabel} filters`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </span>
                  );
                }
              )}
            </div>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold px-2 py-1 hover:bg-red-50 rounded-lg mr-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}

      {/* Top Toolbar */}
      <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {pendingAction ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">
                Select projects to {pendingAction} ({selectedRows.size} selected)
              </span>
              <button
                onClick={() => {
                  setPendingAction(null);
                  setSelectedRows(new Set());
                }}
                className="text-xs text-gray-500 hover:text-night transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : selectedRows.size > 0 ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">{selectedRows.size} of {totalRecords} selected</span>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-xs text-gray-500 hover:text-night transition-colors"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium ml-1">Projects Library</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pendingAction && (
             <button
               disabled={selectedRows.size === 0}
               onClick={() => {
                 const firstId = Array.from(selectedRows)[0];
                 const p = projects.find(proj => proj.id === firstId);
                 if (p) {
                   if (pendingAction === "Clone" && onProjectClone) onProjectClone(p);
                   if (pendingAction === "Audit Log") setSelectedProjectForAudit(p);
                   if (pendingAction === "Cancel Project") setProjectToCancel(p);
                 }
                 if (pendingAction && pendingAction.startsWith("Export")) {
                   const format = pendingAction === "Export to CSV" ? "csv" :
                                  pendingAction === "Export to Excel" ? "excel" :
                                  pendingAction === "Export to Word" ? "word" : "pdf";
                   handleExport(format, selectedRows);
                 }
                 setPendingAction(null);
                 setSelectedRows(new Set());
               }}
               className="px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Apply {pendingAction}
             </button>
          )}

          <div className="relative">
            <button
              onClick={() => setTopMenuOpen(!topMenuOpen)}
              className="p-1.5 border border-pebble rounded-lg text-gray-500 hover:bg-earth transition-colors hover:text-night shadow-sm bg-white"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {topMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTopMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[220px] py-1.5 overflow-hidden text-left font-normal normal-case tracking-normal">
                  <button
                    onClick={() => {
                      setTopMenuOpen(false);
                      setColumnConfigOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Configure Column</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFrozen(!isFrozen);
                      setTopMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span>Freeze Column</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isFrozen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isFrozen ? "ON" : "OFF"}
                    </span>
                  </button>

                  <div className="border-t border-pebble my-1" />

                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Actions</div>
                  {["Clone", "Audit Log", "Cancel Project"].map(action => (
                    <button
                      key={action}
                      onClick={() => {
                        setTopMenuOpen(false);
                        setSelectedRows(new Set());
                        setPendingAction(action as any);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors pl-8 ${action === "Cancel Project" ? "text-red-600 hover:bg-red-50" : "text-night hover:bg-earth"}`}
                    >
                      {action}
                    </button>
                  ))}

                  <div className="border-t border-pebble my-1" />

                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Export Functions</div>
                  {[
                    { label: "Export to CSV", action: "Export to CSV" },
                    { label: "Export to Excel", action: "Export to Excel" },
                    { label: "Export to Word", action: "Export to Word" },
                    { label: "Export to PDF (Report)", action: "Export to PDF" }
                  ].map(item => (
                    <button
                      key={item.action}
                      onClick={() => {
                        setTopMenuOpen(false);
                        setSelectedRows(new Set());
                        setPendingAction(item.action as any);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-night hover:bg-earth transition-colors text-left pl-8"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {columnConfigOpen && (
              <ColumnConfigPanel
                columns={columnOrder}
                onToggle={handleToggleColumnVisibility}
                onRestore={handleRestoreDefaults}
                onClose={() => setColumnConfigOpen(false)}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto no-scrollbar">
        <table
          className="w-full border-collapse"
          style={{ minWidth: "1200px" }}
        >
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {/* Checkbox */}
              {pendingAction && (
                <th
                  className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                  style={{
                    width: "40px",
                    minWidth: "40px",
                    maxWidth: "40px",
                    ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                  />
                </th>
              )}
              {visibleColumns.map((column, index) => {
                const isSticky = isFrozen && (column.id === "favorite" || column.id === "name");
                let leftOffset = 0;
                if (column.id === "favorite") leftOffset = pendingAction ? 40 : 0;
                if (column.id === "name") leftOffset = pendingAction ? 88 : 48;
                return (
                  <th
                    key={column.id}
                    draggable={
                      column.id !== "favorite" &&
                      column.id !== "actions"
                    }
                    onDragStart={() =>
                      handleColumnDragStart(index)
                    }
                    onDragOver={(e) =>
                      handleColumnDragOver(e, index)
                    }
                    onDragEnd={handleColumnDragEnd}
                    style={{
                      width: getColumnWidth(column),
                      minWidth: getColumnWidth(column),
                      ...(isSticky ? { position: "sticky", left: leftOffset, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: column.id === "name" ? "2px 0 5px -2px rgba(0,0,0,0.1)" : "none" } : {})
                    }}
                    className={`px-4 py-3 text-left relative ${column.id !== "favorite" && column.id !== "actions" ? "cursor-move" : ""} ${draggedColumn === index ? "opacity-50 bg-pale" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      {column.sortKey ? (
                        <button
                          onClick={() =>
                            handleSort(
                              column.sortKey as SortableColumn,
                            )
                          }
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-sky rounded text-left truncate flex-1"
                        >
                          <span className="truncate">{column.label}</span>
                          {renderSortIcon(column.sortKey)}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 uppercase tracking-wide truncate flex-1">
                          {column.label}
                        </span>
                      )}

                      {column.id !== "actions" && column.id !== "favorite" && (
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHeaderDropdown(activeHeaderDropdown === column.id ? null : column.id);
                            }}
                            className={`p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 hover:text-sky flex items-center justify-center ${activeHeaderDropdown === column.id ? "text-sky bg-pebble/30" : ""} ${(colSearch[column.id] || (colCheckboxes[column.id] && colCheckboxes[column.id].length > 0)) ? "text-sky font-semibold" : ""}`}
                          >
                            <Search className="w-3 h-3" />
                          </button>

                          {activeHeaderDropdown === column.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(null); }} />
                              <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[240px] p-3 text-left font-normal normal-case tracking-normal" onClick={(e) => e.stopPropagation()}>
                                {/* Header / Title */}
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter {column.label}</div>

                                {/* Search bar */}
                                <div className="relative mb-3">
                                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={colSearch[column.id] || ""}
                                    onChange={(e) =>
                                      setColSearch((p) => ({
                                        ...p,
                                        [column.id]: e.target.value,
                                      }))
                                    }
                                    placeholder={`Search...`}
                                    className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky text-night bg-white font-normal"
                                  />
                                </div>

                                {/* Common Categories checklist */}
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Common Categories</div>
                                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 mb-3">
                                  {(() => {
                                    const uniqueValues = projects.reduce<string[]>((acc, p) => {
                                      let val = "";
                                      if (column.id === "name") val = p.name;
                                      else if (column.id === "projectId") val = p.projectId;
                                      else if (column.id === "type") val = p.type;
                                      else if (column.id === "businessGroup") val = p.businessGroup;
                                      else if (column.id === "category") val = p.category || "";
                                      else if (column.id === "scope") val = p.scope;
                                      else if (column.id === "region") val = p.region;
                                      else if (column.id === "projectLead") val = p.projectLead;
                                      else if (column.id === "status") val = p.status;
                                      else if (column.id === "lifecycleStage") val = p.lifecycleStage;

                                      if (val && val.trim() && !acc.includes(val.trim())) {
                                        acc.push(val.trim());
                                      }
                                      return acc;
                                    }, []);

                                    const searchQueryLocal = (colSearch[column.id] || "").toLowerCase();
                                    const filteredVals = uniqueValues.filter(v => v.toLowerCase().includes(searchQueryLocal));

                                    if (filteredVals.length === 0) {
                                      return <div className="text-xs text-gray-400 py-1 italic font-normal">No options found</div>;
                                    }

                                    return filteredVals.map(val => {
                                      const isChecked = (colCheckboxes[column.id] || []).includes(val);
                                      return (
                                        <label key={val} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-earth cursor-pointer transition-colors text-xs text-night font-normal">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              setColCheckboxes(prev => {
                                                const current = prev[column.id] || [];
                                                const nextList = current.includes(val)
                                                  ? current.filter(v => v !== val)
                                                  : [...current, val];
                                                return { ...prev, [column.id]: nextList };
                                              });
                                            }}
                                            className="w-3.5 h-3.5 text-sky rounded border-pebble focus:ring-sky"
                                          />
                                          <span className="truncate">{val}</span>
                                        </label>
                                      );
                                    });
                                  })()}
                                </div>

                                {/* Reset button */}
                                <div className="flex justify-end pt-1.5 border-t border-pebble">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setColSearch(prev => ({ ...prev, [column.id]: "" }));
                                      setColCheckboxes(prev => ({ ...prev, [column.id]: [] }));
                                    }}
                                    className="text-[10px] text-gray-500 hover:text-red-500 font-semibold uppercase tracking-wider transition-colors"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {index < visibleColumns.length - 1 &&
                      column.id !== "actions" && (
                        <div
                          onMouseDown={(e) =>
                            handleResizeStart(
                              e,
                              column.id,
                              getColumnWidth(column),
                            )
                          }
                          className="absolute right-0 top-2 bottom-2 w-1 cursor-col-resize hover:bg-sky rounded-full transition-colors"
                          style={{ userSelect: "none" }}
                        />
                      )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {currentProjects.map((project) => (
              <tr
                key={project.id}
                className={`hover:bg-earth cursor-pointer transition-colors ${selectedRows.has(project.id) ? "bg-pale/40" : ""}`}
                onClick={() => onProjectClick(project)}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && onProjectClick(project)
                }
                style={{ outline: "none" }}
                onFocus={(e) =>
                (e.currentTarget.style.outline =
                  "2px solid #0066CC")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.outline = "none")
                }
              >
                {/* Checkbox td */}
                {pendingAction && (
                  <td
                    className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10" : ""}`}
                    style={{
                      width: "40px",
                      minWidth: "40px",
                      maxWidth: "40px",
                      ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.has(project.id)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRows((prev) => {
                          const next = new Set(prev);
                          next.has(project.id) ? next.delete(project.id) : next.add(project.id);
                          return next;
                        });
                      }}
                    />
                  </td>
                )}
                {visibleColumns.map((column) =>
                  renderCell(project, column),
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {currentProjects.length === 0 && (
          filteredProjects.length === 0 && projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Get started by creating your first project to track claims, products, and risks."
              action={{
                label: "Create Project",
                onClick: () => console.log("Create project"),
              }}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No projects found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          )
        )}
      </div>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        label="projects"
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onPageSelect={goToPage}
      />

      {/* Audit Log Modal */}
      {selectedProjectForAudit && (
        <AuditLogModal
          isOpen={selectedProjectForAudit !== null}
          onClose={() => setSelectedProjectForAudit(null)}
          title="Project Audit Trail"
          itemName={selectedProjectForAudit.name}
          itemId={selectedProjectForAudit.projectId}
          logs={generateProjectLogs(selectedProjectForAudit)}
        />
      )}

      {/* Cancel Project Confirmation Pop-Up */}
      {projectToCancel && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" onClick={() => setProjectToCancel(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-150 border border-pebble">
              <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600 font-bold">
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h2 className="text-lg font-bold text-night">Cancel Project</h2>
                </div>
                <button onClick={() => setProjectToCancel(null)} className="p-1.5 hover:bg-pebble rounded-lg transition-colors text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 leading-relaxed text-left">
                  Are you sure you want to cancel <span className="font-bold text-night">"{projectToCancel.name}"</span>? This action should only be taken if the project will not proceed further.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-pebble flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectToCancel(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-earth rounded-lg transition-colors cursor-pointer"
                >
                  Keep Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Confirmed cancelling project:", projectToCancel.name);
                    projectToCancel.status = "Cancelled";
                    setCancelledProjectIds(prev => new Set([...prev, projectToCancel.id]));
                    setProjectToCancel(null);
                  }}
                  className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Yes, Cancel Project
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Columns Selection Pop-Up Modal */}
      {exportConfig && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" onClick={() => setExportConfig(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-150 border border-pebble">
              <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky/10 rounded-xl text-sky font-bold">
                    <Download className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-night">Select Columns to Export</h2>
                    <p className="text-xs text-gray-500">Format: {exportConfig.format.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setExportConfig(null)} className="p-1.5 hover:bg-pebble rounded-lg transition-colors text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5 text-left">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Exportable Attributes</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = columnOrder.filter(c => c.id !== "favorite" && c.id !== "actions" && c.label !== "").map(c => c.id);
                      const isAllSelected = exportConfig.selectedColumns.length === allIds.length;
                      setExportConfig(prev => prev ? { ...prev, selectedColumns: isAllSelected ? [] : allIds } : null);
                    }}
                    className="text-sky hover:underline cursor-pointer lowercase font-semibold"
                  >
                    Select All
                  </button>
                </div>
                {columnOrder.filter(c => c.id !== "favorite" && c.id !== "actions" && c.label !== "").map(col => {
                  const isChecked = exportConfig.selectedColumns.includes(col.id);
                  return (
                    <label key={col.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-earth cursor-pointer transition-colors border border-transparent hover:border-pebble">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setExportConfig(prev => {
                            if (!prev) return prev;
                            const nextCols = isChecked
                              ? prev.selectedColumns.filter(id => id !== col.id)
                              : [...prev.selectedColumns, col.id];
                            return { ...prev, selectedColumns: nextCols };
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
                      />
                      <span className="text-sm text-night font-medium">{col.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-pebble flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExportConfig(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-earth rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={exportConfig.selectedColumns.length === 0}
                  onClick={() => {
                    executeExport(exportConfig.format, exportConfig.selectedColumns);
                    setExportConfig(null);
                  }}
                  className="px-4 py-2 text-sm font-bold bg-sky text-white hover:bg-dark rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Confirm &amp; Export
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Team Members Hover Tooltip Popover */}
      {hoveredProjectId && (
        <div
          className="fixed z-50 bg-white border border-pebble rounded-xl shadow-xl p-4 w-64 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2.5 transition-all duration-200"
          style={{
            left: hoverCoords.x,
            top: hoverCoords.y,
          }}
        >
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            {hoveredColumnId === "pendingWith" ? "Pending Approvals" : "Team Members"}
          </div>
          <div className="space-y-2.5">
            {(hoveredColumnId === "pendingWith" ? getPendingTeamMembers(hoveredProjectId, projects) : getProjectTeamMembers(hoveredProjectId, projects)).map((member, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.color}`}>
                  {member.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-night leading-none">{member.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-none">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Tooltip pointer arrow */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-pebble" />
        </div>
      )}
    </div>
  );
}