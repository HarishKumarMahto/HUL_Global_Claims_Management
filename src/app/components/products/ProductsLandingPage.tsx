import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Download,
  MoreHorizontal,
  MoreVertical,
  Plus,
  X,
  ArrowUpDown,
  Grid3X3,
  Save,
  Bookmark,
  Edit3,
  Trash2,
  Share2,
  Copy,
  XCircle,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  RotateCcw
} from 'lucide-react';
import {
  ProductItem,
  ProductType,
  LifecycleState,
} from './productData';
import ProductFilterBar, { ProductFilter, applyProductFilters, FILTER_COLUMNS, FILTER_CONDITIONS } from './ProductFilterBar';
import AdvancedProductSearch, { AdvancedSearchTrigger } from './AdvancedProductSearch';
import ProductSavedViewsPanel, { ProductSavedView } from './ProductSavedViewsPanel';
import { TablePagination, formatDate } from '../ui/tableUtils';
import AuditLogModal, { AuditLogItem } from '../AuditLogModal';
import { ColumnConfig, TableState } from '../../types';

interface ProductsLandingPageProps {
  products: ProductItem[];
  onProductsChange?: (products: ProductItem[]) => void;
  activeView: string;
  favorites: Set<string>;
  recentIds: string[];
  onProductClick: (p: ProductItem) => void;
  onFavoriteToggle: (id: string) => void;
  onCreateProduct: (type?: ProductType | 'Product') => void;
  onViewHierarchy: () => void;
  // External state from saved views
  externalFilters?: ProductFilter[];
  externalColumnOrder?: string[];
  externalSortCol?: string | null;
  externalSortDir?: 'asc' | 'desc' | null;
  onTableStateChange?: (cols: string[], filters: ProductFilter[], sortCol: string | null, sortDir: 'asc' | 'desc' | null) => void;
  savedViews?: ProductSavedView[];
  onSavedViewsChange?: (views: ProductSavedView[]) => void;
  onApplyView?: (view: ProductSavedView) => void;
  onOpenSavedViews?: () => void;
  externalSearchQuery?: string;
}
 
type SortDir = 'asc' | 'desc' | null;
 
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Product Name', sortable: true, width: 280, visible: true },
  { id: 'productId', label: 'Product ID', sortable: true, width: 140, visible: true },
  { id: 'type', label: 'Product Type', sortable: true, width: 160, visible: true },
  { id: 'lifecycleState', label: 'Lifecycle State', sortable: true, width: 170, visible: true },
  { id: 'parentName', label: 'Parent Product', sortable: false, width: 180, visible: true },
  { id: 'childCount', label: 'Children', sortable: true, width: 120, visible: true },
  { id: 'claimsCount', label: 'Claims', sortable: true, width: 120, visible: true },
  { id: 'projectsCount', label: 'Projects', sortable: true, width: 120, visible: true },
  { id: 'createdBy', label: 'Created By', sortable: true, width: 160, visible: true },
  { id: 'createdDate', label: 'Created Date', sortable: true, width: 150, visible: true }
];
 
const generateProductLogs = (product: ProductItem): AuditLogItem[] => {
  return [
    {
      id: `${product.id}-log-1`,
      timestamp: product.createdDate || '2025-06-10',
      actor: product.createdBy || 'Sarah Johnson',
      role: 'Product Creator',
      action: 'Product master record created',
      details: `Product with level type "${product.type}" and parent "${product.parentName || 'None'}" created under brand "${product.brand}".`,
      type: 'create'
    },
    {
      id: `${product.id}-log-2`,
      timestamp: product.createdDate || '2025-06-11',
      actor: product.createdBy || 'Sarah Johnson',
      role: 'Product Creator',
      action: 'Lifecycle status initialized',
      details: `Initial lifecycle state set to "${product.lifecycleState}".`,
      type: 'status'
    },
    {
      id: `${product.id}-log-3`,
      timestamp: product.lastModified || '2026-03-15',
      actor: 'System Sync',
      role: 'System',
      action: 'Linked resources updated',
      details: `Count of child components set to ${product.childCount}, active claims tracked at ${product.claimsCount}, associated projects at ${product.projectsCount}.`,
      type: 'link'
    },
    {
      id: `${product.id}-log-4`,
      timestamp: product.lastModified || '2026-03-15',
      actor: product.createdBy || 'Sarah Johnson',
      role: 'Product Creator',
      action: 'Product metadata modified',
      details: `Description and regional specifications updated. Brand and business group classifications validated.`,
      type: 'update'
    }
  ];
};

// Column Config Panel Component for Products
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
  const visibleCount = columns.filter(
    (c) => c.visible !== false,
  ).length;
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-64 overflow-hidden">
        <div className="px-4 py-3 border-b border-pebble flex items-center justify-between">
          <span
            className="text-sm text-night font-semibold"
          >
            Configure Columns
          </span>
          <span className="text-xs text-gray-400">
            {visibleCount} of {columns.length} visible
          </span>
        </div>
        <div className="p-2 max-h-56 overflow-y-auto">
          {columns.map((col) => {
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
                <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-night truncate flex-1">
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
        <div className="px-4 py-3 border-t border-pebble bg-earth/30 font-normal">
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

export default function ProductsLandingPage({
  products,
  onProductsChange,
  activeView,
  favorites,
  recentIds,
  onProductClick,
  onFavoriteToggle,
  onCreateProduct,
  onViewHierarchy,
  externalFilters,
  externalColumnOrder,
  externalSortCol,
  externalSortDir,
  onTableStateChange,
  savedViews = [],
  onSavedViewsChange,
  onApplyView,
  externalSearchQuery,
}: ProductsLandingPageProps) {
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (externalSearchQuery !== undefined && externalSearchQuery !== '') {
      setSearch(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [colCheckboxes, setColCheckboxes] = useState<Record<string, string[]>>({});
  const [sortCol, setSortCol] = useState<string | null>(externalSortCol ?? 'lastModified');
  const [sortDir, setSortDir] = useState<SortDir>(externalSortDir ?? 'desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, Sorting & Table Settings
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [isCreateProductDropdownOpen, setIsCreateProductDropdownOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"Obsolete" | "Cancel" | "Audit Log" | "Export to CSV" | "Export to Excel" | "Export to Word" | "Export to PDF" | null>(null);
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState<{
    isOpen: boolean;
    format: "pdf" | "excel" | "word" | "csv";
    selectedColumns: string[];
    rowsToExport?: Set<string>;
  } | null>(null);

  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

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

  const getColumnWidth = (col: ColumnConfig) => {
    return columnWidths[col.id] || col.width || 120;
  };
 
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [lcFilter, setLcFilter] = useState<LifecycleState | ''>('');
  const [bgFilter, setBgFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  const typeOptions = useMemo(() => {
    const types = new Set<ProductType>();
    products.forEach((p) => {
      if (p.type) types.add(p.type);
    });
    return Array.from(types).sort();
  }, [products]);

   const stageOptions = useMemo(() => {
    const stages = new Set<LifecycleState>();
    products.forEach((p) => {
      if (p.lifecycleState) stages.add(p.lifecycleState);
    });
    return Array.from(stages).sort();
  }, [products]);
 
  // Filter bar + advanced search state
  const [productFilters, setProductFilters] = useState<ProductFilter[]>(externalFilters ?? []);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [savedViewsPanelOpen, setSavedViewsPanelOpen] = useState(false);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const activeFilterChips = useMemo(() => {
    const list: Array<{ id: string; category: string; label: string; value: string; onClear: () => void }> = [];

    if (brandFilter) {
      list.push({
        id: 'brand',
        category: 'Brand',
        label: 'Brand',
        value: brandFilter,
        onClear: () => setBrandFilter(''),
      });
    }
    if (typeFilter) {
      list.push({
        id: 'type',
        category: 'Product Type',
        label: 'Product Type',
        value: typeFilter,
        onClear: () => setTypeFilter(''),
      });
    }
    if (lcFilter) {
      list.push({
        id: 'lifecycleState',
        category: 'Lifecycle Stage',
        label: 'Lifecycle Stage',
        value: lcFilter,
        onClear: () => setLcFilter(''),
      });
    }

    productFilters.forEach((f) => {
      const colLabel = FILTER_COLUMNS.find((c) => c.id === f.column)?.label ?? f.column;
      const condLabel = FILTER_CONDITIONS.find((c) => c.id === f.condition)?.label ?? f.condition;
      const isBlankCond = ['is_blank', 'is_not_blank'].includes(f.condition);
      const displayVal = isBlankCond ? condLabel : `"${f.value}"`;

      list.push({
        id: f.id,
        category: 'Custom',
        label: colLabel,
        value: displayVal,
        onClear: () => setProductFilters((prev) => prev.filter((pf) => pf.id !== f.id)),
      });
    });

    return list;
  }, [brandFilter, typeFilter, lcFilter, productFilters]);

  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  const [saveDialogState, setSaveDialogState] = useState<{ isOpen: boolean; name: string; overwriteWarning: boolean }>({
    isOpen: false, name: '', overwriteWarning: false
  });
  const [renameDialogState, setRenameDialogState] = useState<{ isOpen: boolean; name: string }>({
    isOpen: false, name: ''
  });
  const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false });
  const [shareDialogState, setShareDialogState] = useState({ isOpen: false, search: '', selectedUsers: [] as string[], makeDefault: false });

  const handleSaveViewConfirm = (nameToSave: string, forceOverwrite = false) => {
    const trimmedName = nameToSave.trim();
    if (!trimmedName) return;

    const existingIndex = savedViews.findIndex(v => v.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingIndex >= 0 && !forceOverwrite) {
      setSaveDialogState(prev => ({ ...prev, overwriteWarning: true, name: trimmedName }));
      return;
    }

    const currentView: ProductSavedView = {
      id: existingIndex >= 0 ? savedViews[existingIndex].id : `p-${Date.now()}`,
      name: trimmedName,
      description: 'Custom view saved from workspace',
      visibility: 'private',
      columnOrder: columnOrder.map(c => c.id),
      filters: productFilters,
      sortCol: sortCol || 'lastModified',
      sortDir: sortDir || 'desc',
      createdBy: 'Sarah Johnson',
      createdAt: new Date().toISOString().split('T')[0]
    };

    let updatedViews: ProductSavedView[];
    if (existingIndex >= 0) {
      updatedViews = savedViews.map((v, i) => i === existingIndex ? currentView : v);
    } else {
      updatedViews = [currentView, ...savedViews];
    }

    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
    onApplyView?.(currentView);
    setSaveDialogState({ isOpen: false, name: '', overwriteWarning: false });
  };

  const handleRenameViewConfirm = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (!activeView.startsWith('Saved: ')) return;
    const currentName = activeView.replace('Saved: ', '');

    const updatedViews = savedViews.map(v => v.name === currentName ? { ...v, name: trimmed } : v);
    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
    const matchedView = updatedViews.find(v => v.name === trimmed);
    if (matchedView) onApplyView?.(matchedView);
    setRenameDialogState({ isOpen: false, name: '' });
  };

  const handleDeleteViewConfirm = () => {
    if (!activeView.startsWith('Saved: ')) return;
    const currentName = activeView.replace('Saved: ', '');

    const updatedViews = savedViews.filter(v => v.name !== currentName);
    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
    setProductFilters([]);
    onTableStateChange?.(DEFAULT_COLUMNS.map(c => c.id), [], 'lastModified', 'desc');
    setDeleteDialogState({ isOpen: false });
  };

  const handleSetAsDefaultView = () => {
    let currentName = '';
    if (activeView.startsWith('Saved: ')) {
      currentName = activeView.replace('Saved: ', '');
    }

    const updatedViews = savedViews.map(v => ({
      ...v,
      isDefault: currentName ? v.name === currentName : false
    }));

    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
  };

  const handleShareViewConfirm = (users: string[]) => {
    if (!activeView.startsWith('Saved: ')) return;
    const currentName = activeView.replace('Saved: ', '');

    const updatedViews = savedViews.map(v => {
      if (v.name === currentName) {
        return {
          ...v,
          visibility: 'shared-all' as const,
          isDefault: shareDialogState.makeDefault ? true : v.isDefault
        };
      }
      return {
        ...v,
        isDefault: shareDialogState.makeDefault ? false : v.isDefault
      };
    });
    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));

    setShareDialogState({ isOpen: false, search: '', selectedUsers: [], makeDefault: false });
  };

  const handleSaveAsNewViewCopy = () => {
    if (!activeView.startsWith('Saved: ')) return;
    const currentName = activeView.replace('Saved: ', '');

    const sourceView = savedViews.find(v => v.name === currentName);
    if (!sourceView) return;

    const copyName = `${sourceView.name} (Copy)`;
    const copyView: ProductSavedView = {
      ...sourceView,
      id: `p-${Date.now()}`,
      name: copyName,
      visibility: 'private',
      isDefault: false
    };

    const updatedViews = [copyView, ...savedViews];
    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
    onApplyView?.(copyView);
  };

  const handleRemoveViewConfirmAction = () => {
    if (!activeView.startsWith('Saved: ')) return;
    const currentName = activeView.replace('Saved: ', '');

    const updatedViews = savedViews.filter(v => v.name !== currentName);
    onSavedViewsChange?.(updatedViews);
    localStorage.setItem('product_saved_views', JSON.stringify(updatedViews));
    setProductFilters([]);
    onTableStateChange?.(DEFAULT_COLUMNS.map(c => c.id), [], 'lastModified', 'desc');
  };
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedProductForAudit, setSelectedProductForAudit] = useState<ProductItem | null>(null);
 
  const [columnOrder, setColumnOrder] = useState(() =>
    externalColumnOrder && externalColumnOrder.length > 0
      ? DEFAULT_COLUMNS.filter(c => externalColumnOrder.includes(c.id))
          .sort((a, b) => externalColumnOrder.indexOf(a.id) - externalColumnOrder.indexOf(b.id))
      : DEFAULT_COLUMNS
  );
  const visibleColumns = columnOrder.filter(c => c.visible !== false);

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
    setColumnOrder(DEFAULT_COLUMNS);
    setColumnWidths({});
    setColumnConfigOpen(false);
  };

  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);

  // Sync external state when a saved view is applied
  useEffect(() => {
    if (externalFilters !== undefined) setProductFilters(externalFilters);
  }, [externalFilters]);
  useEffect(() => {
    if (externalSortCol !== undefined) setSortCol(externalSortCol);
  }, [externalSortCol]);
  useEffect(() => {
    if (externalSortDir !== undefined) setSortDir(externalSortDir ?? null);
  }, [externalSortDir]);
  useEffect(() => {
    if (externalColumnOrder && externalColumnOrder.length > 0) {
      setColumnOrder(
        DEFAULT_COLUMNS.filter(c => externalColumnOrder.includes(c.id))
          .sort((a, b) => externalColumnOrder.indexOf(a.id) - externalColumnOrder.indexOf(b.id))
      );
    }
  }, [externalColumnOrder]);


  const handleExport = (format: "pdf" | "excel" | "word" | "csv", rowsToExport?: Set<string>) => {
    const initialCols = columnOrder
      .filter(c => c.visible !== false && c.id !== "actions" && c.label !== "")
      .map(c => c.id);
    setExportConfig({
      isOpen: true,
      format,
      selectedColumns: initialCols,
      rowsToExport,
    });
  };

  const executeExport = (format: "pdf" | "excel" | "word" | "csv", selectedColIds: string[]) => {
    const baseList = filteredProducts;
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
              if (col.id === "productId") return `"${p.productId}"`;
              if (col.id === "type") return `"${p.type}"`;
              if (col.id === "lifecycleState") return `"${p.lifecycleState}"`;
              if (col.id === "parentName") return `"${p.parentName || ''}"`;
              if (col.id === "childCount") return `"${p.childCount}"`;
              if (col.id === "claimsCount") return `"${p.claimsCount}"`;
              if (col.id === "projectsCount") return `"${p.projectsCount}"`;
              if (col.id === "createdBy") return `"${p.createdBy}"`;
              if (col.id === "createdDate") return `"${formatDate(p.createdDate)}"`;
              return "";
            })
            .join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
                  if (col.id === "productId") return `<td>${p.productId}</td>`;
                  if (col.id === "type") return `<td>${p.type}</td>`;
                  if (col.id === "lifecycleState") return `<td>${p.lifecycleState}</td>`;
                  if (col.id === "parentName") return `<td>${p.parentName || ''}</td>`;
                  if (col.id === "childCount") return `<td>${p.childCount}</td>`;
                  if (col.id === "claimsCount") return `<td>${p.claimsCount}</td>`;
                  if (col.id === "projectsCount") return `<td>${p.projectsCount}</td>`;
                  if (col.id === "createdBy") return `<td>${p.createdBy}</td>`;
                  if (col.id === "createdDate") return `<td>${formatDate(p.createdDate)}</td>`;
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
      link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "word") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/><title>Products Export</title></head>
        <body>
          <h2>Product list export</h2>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #F6F7F0; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
            ${list.map(p => `
              <tr>
                ${activeCols.map(col => {
                  if (col.id === "name") return `<td>${p.name}</td>`;
                  if (col.id === "productId") return `<td>${p.productId}</td>`;
                  if (col.id === "type") return `<td>${p.type}</td>`;
                  if (col.id === "lifecycleState") return `<td>${p.lifecycleState}</td>`;
                  if (col.id === "parentName") return `<td>${p.parentName || ''}</td>`;
                  if (col.id === "childCount") return `<td>${p.childCount}</td>`;
                  if (col.id === "claimsCount") return `<td>${p.claimsCount}</td>`;
                  if (col.id === "projectsCount") return `<td>${p.projectsCount}</td>`;
                  if (col.id === "createdBy") return `<td>${p.createdBy}</td>`;
                  if (col.id === "createdDate") return `<td>${formatDate(p.createdDate)}</td>`;
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
      link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      let report = `========================================================================================\n`;
      report += `                                   PRODUCTS REPORT EXPORT                               \n`;
      report += `                             Generated on: ${new Date().toLocaleDateString()}           \n`;
      report += `========================================================================================\n\n`;

      list.forEach((p, idx) => {
        report += `${idx + 1}. PRODUCT NAME: ${p.name}\n`;
        report += `   ---------------------------------------------------------------------------------\n`;
        report += `   • ID: ${p.productId}\n`;
        report += `   • Type: ${p.type}\n`;
        report += `   • Lifecycle State: ${p.lifecycleState}\n`;
        report += `   • Parent Product: ${p.parentName || 'None'}\n`;
        report += `   • Children: ${p.childCount}\n`;
        report += `   • Claims Count: ${p.claimsCount}\n`;
        report += `   • Projects Count: ${p.projectsCount}\n`;
        report += `   • Created By: ${p.createdBy}\n`;
        report += `   • Created Date: ${formatDate(p.createdDate)}\n`;
        report += `========================================================================================\n\n`;
      });

      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };
 
  const handleColumnDragStart = (index: number) => {
    setDraggedColumn(index);
  };
 
  const handleColumnDragOver = (
    e: React.DragEvent<HTMLTableHeaderCellElement>,
    index: number
  ) => {
    e.preventDefault();
 
    if (draggedColumn === null || draggedColumn === index) return;
 
    const newOrder = [...columnOrder];
    const draggedItem = newOrder.splice(draggedColumn, 1)[0];
    newOrder.splice(index, 0, draggedItem);
 
    setColumnOrder(newOrder);
    setDraggedColumn(index);
  };
 
  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };
 
  const filteredProducts = useMemo(() => {
    let list = [...products];
 
    // Active view filter
    if (activeView === 'My Products') {
      list = list.filter((p) => p.createdBy === 'Sarah Johnson');
    } else if (activeView === 'Favorite Products') {
      list = list.filter((p) => favorites.has(p.id));
    } else if (activeView === 'Recent Products') {
      list = list.filter((p) => recentIds.includes(p.id));
    }
 
    // Search
    if (search) {
      const q = search.toLowerCase();
 
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.productId.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.parentName || '').toLowerCase().includes(q)
      );
    }
 
    // Legacy quick-filters (kept for backward compat)
    if (brandFilter) list = list.filter((p) => p.brand === brandFilter);
    if (typeFilter) list = list.filter((p) => p.type === typeFilter);
    if (lcFilter) list = list.filter((p) => p.lifecycleState === lcFilter);
    if (bgFilter) list = list.filter((p) => p.businessGroup === bgFilter);

    // Advanced filter bar
    if (productFilters.length > 0) {
      list = applyProductFilters(list as unknown as Record<string, unknown>[], productFilters) as unknown as ProductItem[];
    }
 
    // Sorting
    if (sortCol && sortDir) {
      list.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortCol] ?? '';
        const bVal = (b as Record<string, unknown>)[sortCol] ?? '';
 
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
 
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
 
    // Apply column-specific search and checkbox filters
    list = list.filter((p) => {
      // 1. Column specific search query filter
      const searchPassed = Object.entries(colSearch).every(([colId, query]) => {
        if (!query) return true;
        const q = query.toLowerCase();
        switch (colId) {
          case 'name':
            return p.name.toLowerCase().includes(q);
          case 'productId':
            return p.productId.toLowerCase().includes(q);
          case 'type':
            return p.type.toLowerCase().includes(q);
          case 'lifecycleState':
            return p.lifecycleState.toLowerCase().includes(q);
          case 'parentName':
            return (p.parentName || '').toLowerCase().includes(q);
          case 'childCount':
            return String(p.childCount).includes(q);
          case 'claimsCount':
            return String(p.claimsCount).includes(q);
          case 'projectsCount':
            return String(p.projectsCount).includes(q);
          case 'createdBy':
            return p.createdBy.toLowerCase().includes(q);
          case 'createdDate':
            return formatDate(p.createdDate).toLowerCase().includes(q);
          default:
            return true;
        }
      });

      // 2. Column specific checkboxes filter
      const checkboxesPassed = Object.entries(colCheckboxes).every(([colId, selectedList]) => {
        if (!selectedList || selectedList.length === 0) return true;
        let pVal = "";
        switch (colId) {
          case 'name': pVal = p.name; break;
          case 'productId': pVal = p.productId; break;
          case 'type': pVal = p.type; break;
          case 'lifecycleState': pVal = p.lifecycleState; break;
          case 'parentName': pVal = p.parentName || ""; break;
          case 'childCount': pVal = String(p.childCount); break;
          case 'claimsCount': pVal = String(p.claimsCount); break;
          case 'projectsCount': pVal = String(p.projectsCount); break;
          case 'createdBy': pVal = p.createdBy; break;
          case 'createdDate': pVal = formatDate(p.createdDate); break;
          default: return true;
        }
        return selectedList.includes(pVal);
      });

      return searchPassed && checkboxesPassed;
    });

    return list;
  }, [
    products,
    activeView,
    favorites,
    recentIds,
    search,
    colSearch,
    colCheckboxes,
    typeFilter,
    lcFilter,
    bgFilter,
    productFilters,
    sortCol,
    sortDir
  ]);
 
  const PAGE_SIZE = 10;
 
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
 
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
 
  const activeFilterCount = [brandFilter, typeFilter, lcFilter, bgFilter].filter(Boolean).length + productFilters.length;

  const isAllCurrentSelected =
    pagedProducts.length > 0 && pagedProducts.every((p) => selectedIds.has(p.id));
  const isSomeSelected =
    pagedProducts.some((p) => selectedIds.has(p.id)) && !isAllCurrentSelected;

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentSelected) {
        pagedProducts.forEach((p) => next.delete(p.id));
      } else {
        pagedProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
 
  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col)
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
 
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-sky" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-sky" />
    );
  };
 
  const renderCell = (product: ProductItem, colId: string, isHovered: boolean, isSelected: boolean) => {
    const col = columnOrder.find(c => c.id === colId);
    const colWidth = col?.width || 120;
    const cellStyle = {
      width: colWidth,
      minWidth: colWidth,
    };

    switch (colId) {
      case 'name':
        const nameBg = isSelected 
          ? '#F3F7FC' 
          : isHovered 
            ? '#EEF4FB' 
            : '#ffffff';
        const leftOffset = pendingAction ? 80 : 40;
        return (
          <td 
            className={`px-4 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              ...(isFrozen ? { position: "sticky", left: leftOffset, backgroundColor: nameBg } : {})
            }}
          >
            <div
              onClick={() => onProductClick(product)}
              className="cursor-pointer overflow-hidden text-left"
            >
              <div
                className="text-night hover:text-sky transition-colors truncate font-semibold text-sm"
              >
                {product.name}
              </div>
              {product.brand && (
                <div className="text-xs text-gray-500 mt-0.5 truncate font-normal">
                  {product.brand} · {product.businessGroup}
                </div>
              )}
            </div>
          </td>
        );

      case 'productId':
        return (
          <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate text-left" style={cellStyle}>
            {product.productId}
          </td>
        );

      case 'type':
        return (
          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap truncate text-left" style={cellStyle}>
            {product.type}
          </td>
        );

      case 'lifecycleState':
        return (
          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap truncate text-left" style={cellStyle}>
            {product.lifecycleState}
          </td>
        );

      case 'parentName':
        return (
          <td className="px-4 py-3 text-sm text-gray-600 truncate text-left" style={cellStyle}>
            <div className="truncate">
              {product.parentName || <span className="text-gray-300">—</span>}
            </div>
          </td>
        );

      case 'childCount':
        return (
          <td className="px-4 py-3 text-sm text-gray-700 text-center truncate" style={cellStyle}>
            {product.childCount}
          </td>
        );

      case 'claimsCount':
        return (
          <td className="px-4 py-3 text-sm text-gray-700 text-center truncate" style={cellStyle}>
            {product.claimsCount}
          </td>
        );

      case 'projectsCount':
        return (
          <td className="px-4 py-3 text-sm text-gray-700 text-center truncate" style={cellStyle}>
            {product.projectsCount}
          </td>
        );

      case 'createdBy':
        return (
          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate text-left" style={cellStyle}>
            {product.createdBy}
          </td>
        );

      case 'createdDate':
        return (
          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap truncate text-left" style={cellStyle}>
            {formatDate(product.createdDate)}
          </td>
        );

      default:
        return <td className="px-4 py-3 truncate text-left" style={cellStyle}>-</td>;
    }
  };
 
  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 relative">
            <h1 className="text-night flex items-center gap-2">
              {activeView.startsWith('Saved: ') ? activeView.replace('Saved: ', '') : activeView}
            </h1>



            <div className="relative inline-block text-left">
              <button
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="p-1.5 hover:bg-earth text-gray-500 hover:text-night rounded-lg transition-colors flex items-center justify-center border border-pebble shadow-sm"
                title="View Options"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {isViewMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsViewMenuOpen(false)} />
                  <div className="absolute left-0 mt-1.5 w-64 bg-white border border-pebble rounded-xl shadow-xl z-40 py-1.5 overflow-hidden">
                    <button
                      onClick={() => {
                        setIsViewMenuOpen(false);
                        setSaveDialogState({ isOpen: true, name: activeView.startsWith('Saved: ') ? activeView.replace('Saved: ', '') : '', overwriteWarning: false });
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <Save className="w-4 h-4 text-sky" />
                      Save Current View
                    </button>

                    {activeView.startsWith('Saved: ') && (
                      <>
                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            setRenameDialogState({ isOpen: true, name: activeView.replace('Saved: ', '') });
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                        >
                          <Edit3 className="w-4 h-4 text-sky" />
                          Rename View
                        </button>

                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            setDeleteDialogState({ isOpen: true });
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          Delete View
                        </button>

                        <div className="border-t border-pebble my-1" />

                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            handleSetAsDefaultView();
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                        >
                          <Star className={`w-4 h-4 ${savedViews.find(v => v.name === activeView.replace('Saved: ', ''))?.isDefault ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                          Set as Default View
                        </button>

                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            setShareDialogState({ isOpen: true, search: '', selectedUsers: [] });
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                        >
                          <Share2 className="w-4 h-4 text-sky" />
                          Share View
                        </button>

                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            handleSaveAsNewViewCopy();
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                        >
                          <Copy className="w-4 h-4 text-sky" />
                          Save as New View
                        </button>

                        <button
                          onClick={() => {
                            setIsViewMenuOpen(false);
                            handleRemoveViewConfirmAction();
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-earth transition-colors text-left border-t border-pebble"
                        >
                          <XCircle className="w-4 h-4 text-gray-400" />
                          Remove View
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
 
          <div className="flex items-center gap-2">
            {/* <button
              onClick={onViewHierarchy}
              className="flex items-center gap-2 px-3 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth hover:border-sky transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              Hierarchy View
            </button> */}
 
            <div className="relative">
              <button
                onClick={() => setIsCreateProductDropdownOpen(!isCreateProductDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Product
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isCreateProductDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-pebble rounded-lg shadow-lg z-20 min-w-[200px] overflow-hidden">
                  <button
                    onClick={() => {
                      onCreateProduct('Bulk Product');
                      setIsCreateProductDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-earth transition-colors border-b border-pebble/40 last:border-0"
                  >
                    Bulk Product
                  </button>
                  <button
                    onClick={() => {
                      onCreateProduct('Format');
                      setIsCreateProductDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-earth transition-colors border-b border-pebble/40 last:border-0"
                  >
                    Format
                  </button>
                  <button
                    onClick={() => {
                      onCreateProduct('Technology');
                      setIsCreateProductDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-earth transition-colors border-b border-pebble/40 last:border-0"
                  >
                    Technology
                  </button>
                  <button
                    onClick={() => {
                      onCreateProduct('SKU');
                      setIsCreateProductDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-earth transition-colors border-b border-pebble/40 last:border-0"
                  >
                    SKU
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Advanced Search trigger (binoculars) */}
          <AdvancedSearchTrigger
            onClick={() => setAdvancedSearchOpen(true)}
            title="Advanced Product Search"
          />

          {/* Filter bar — column / condition / value chips */}
          <div className="flex-shrink-0">
            <ProductFilterBar
              filters={[]}
              onFiltersChange={f => { setProductFilters(f); setCurrentPage(1); }}
            />
          </div>

          {/* Quick Filters - Brand */}
          <div className="relative flex-shrink-0">
            <select
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 border border-pebble rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky cursor-pointer shadow-sm min-w-[130px] text-sm hover:bg-earth hover:border-sky transition-all font-medium"
            >
              <option value="">Brand</option>
              {brandOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Filters - Product Type */}
          <div className="relative flex-shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as ProductType | ''); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 border border-pebble rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky cursor-pointer shadow-sm min-w-[140px] text-sm hover:bg-earth hover:border-sky transition-all font-medium"
            >
              <option value="">Product Type</option>
              {typeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Filters - Lifecycle Stage */}
          <div className="relative flex-shrink-0">
            <select
              value={lcFilter}
              onChange={(e) => { setLcFilter(e.target.value as LifecycleState | ''); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-1.5 border border-pebble rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky cursor-pointer shadow-sm min-w-[150px] text-sm hover:bg-earth hover:border-sky transition-all font-medium"
            >
              <option value="">Lifecycle Stage</option>
              {stageOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset button if active */}
          {(brandFilter || typeFilter || lcFilter) && (
            <button
              onClick={() => {
                setBrandFilter('');
                setTypeFilter('');
                setLcFilter('');
                setCurrentPage(1);
              }}
              className="text-sky hover:text-dark font-semibold hover:underline flex items-center gap-1 ml-1 transition-all cursor-pointer text-sm"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          {/* Active filter badge */}
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-pale text-sky rounded-full text-xs flex-shrink-0 font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedProductSearch
        isOpen={advancedSearchOpen}
        onClose={selected => {
          setAdvancedSearchOpen(false);
          // If a product was selected via advanced search, navigate to it
          if (selected.length > 0) {
            onProductClick(selected[0]);
          }
        }}
        selectionMode="single"
        contextLabel="Product"
        onCreateProduct={onCreateProduct}
      />
 
      {/* Top Toolbar */}
      <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0 font-normal">
        <div className="flex items-center gap-3">
          {pendingAction ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">
                Select products to {pendingAction} ({selectedIds.size} selected)
              </span>
              <button
                onClick={() => {
                  setPendingAction(null);
                  setSelectedIds(new Set());
                }}
                className="text-xs text-gray-500 hover:text-night transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : selectedIds.size > 0 ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">{selectedIds.size} of {filteredProducts.length} selected</span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-500 hover:text-night transition-colors cursor-pointer"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium ml-1">Products Library</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pendingAction && (
            <button
              disabled={selectedIds.size === 0}
              onClick={() => {
                const firstId = Array.from(selectedIds)[0];
                const p = products.find(prod => prod.id === firstId);
                if (pendingAction === "Audit Log" && p) {
                  setSelectedProductForAudit(p);
                } else if (pendingAction === "Obsolete") {
                  if (onProductsChange) {
                    const updated = products.map(prod => selectedIds.has(prod.id) ? { ...prod, lifecycleState: 'Obsolete' as const } : prod);
                    onProductsChange(updated);
                  }
                } else if (pendingAction === "Cancel") {
                  if (onProductsChange) {
                    const updated = products.map(prod => selectedIds.has(prod.id) ? { ...prod, lifecycleState: 'Cancelled' as const } : prod);
                    onProductsChange(updated);
                  }
                } else if (pendingAction.startsWith("Export")) {
                  const format = pendingAction === "Export to CSV" ? "csv" :
                                 pendingAction === "Export to Excel" ? "excel" :
                                 pendingAction === "Export to Word" ? "word" : "pdf";
                  handleExport(format, selectedIds);
                }
                setPendingAction(null);
                setSelectedIds(new Set());
              }}
              className="px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply {pendingAction}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setTopMenuOpen(!topMenuOpen)}
              className="p-1.5 border border-pebble rounded-lg text-gray-500 hover:bg-earth transition-colors hover:text-night shadow-sm bg-white cursor-pointer"
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

                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Actions</div>
                  {["Audit Log", "Obsolete", "Cancel"].map(action => (
                    <button
                      key={action}
                      onClick={() => {
                        setTopMenuOpen(false);
                        setSelectedIds(new Set());
                        setPendingAction(action as any);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors pl-8 ${action === "Cancel" ? "text-red-600 hover:bg-red-50" : "text-night hover:bg-earth"}`}
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
                        setSelectedIds(new Set());
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
                onExport={(format) => {
                  setColumnConfigOpen(false);
                  handleExport(format);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden p-5 flex flex-col">
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
          {/* Active filter chips row */}
          {activeFilterChips.length > 0 && (
            <div className="px-4 py-2 bg-earth/30 border-b border-gray-300 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 font-medium mr-1">
                  Active filters:
                </span>
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 text-sky rounded-full text-xs font-medium shadow-sm animate-fade-in"
                  >
                    <span className="text-gray-400 font-normal">{chip.label}:</span>
                    <span>{chip.value}</span>
                    <button
                      onClick={chip.onClear}
                      className="hover:text-red-500 ml-1 text-gray-400 transition-colors cursor-pointer"
                      title={`Clear ${chip.label} filter`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  setBrandFilter('');
                  setTypeFilter('');
                  setLcFilter('');
                  setProductFilters([]);
                  setCurrentPage(1);
                }}
                className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold px-2 py-1 hover:bg-red-50 rounded-lg mr-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex-1 overflow-auto no-scrollbar">
            <table className="w-full border-collapse text-sm min-w-[1100px]">
              <thead className="bg-earth border-b border-gray-300 sticky top-0 z-10">
                <tr className="border-b border-gray-300">
                  {/* Checkbox FIRST */}
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

                  {/* Star SECOND */}
                  <th
                    className={`px-3 py-3 ${isFrozen ? "sticky z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                    style={{
                      width: "40px",
                      minWidth: "40px",
                      maxWidth: "40px",
                      ...(isFrozen ? { position: "sticky", left: pendingAction ? 40 : 0, backgroundColor: "#F6F7F0" } : {})
                    }}
                  ></th>
   
                  {visibleColumns.map((col, index) => {
                    const isSticky = isFrozen && col.id === "name";
                    const leftOffset = pendingAction ? 80 : 40;
                    return (
                      <th
                        key={col.id}
                        draggable
                        onDragStart={() => handleColumnDragStart(index)}
                        onDragOver={(e) => handleColumnDragOver(e, index)}
                        onDragEnd={handleColumnDragEnd}
                        style={{
                          width: getColumnWidth(col),
                          minWidth: getColumnWidth(col),
                          ...(isSticky ? { position: "sticky", left: leftOffset, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                        }}
                        className={`px-4 py-3 text-left relative cursor-move ${draggedColumn === index ? "opacity-50 bg-pale" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-1.5 w-full">
                          <button
                            onClick={() => col.sortable && handleSort(col.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-sky rounded text-left truncate flex-1 font-semibold"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-move flex-shrink-0" />
                            <span className="truncate">{col.label}</span>
                            {col.sortable && <SortIcon col={col.id} />}
                          </button>

                          <div className="relative flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHeaderDropdown(activeHeaderDropdown === col.id ? null : col.id);
                              }}
                              className={`p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 hover:text-sky flex items-center justify-center ${activeHeaderDropdown === col.id ? "text-sky bg-pebble/30" : ""} ${(colSearch[col.id] || (colCheckboxes[col.id] && colCheckboxes[col.id].length > 0)) ? "text-sky font-semibold" : ""}`}
                            >
                              <Search className="w-3 h-3" />
                            </button>

                            {activeHeaderDropdown === col.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(null); }} />
                                <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[240px] p-3 text-left font-normal normal-case tracking-normal animate-in fade-in duration-100" onClick={(e) => e.stopPropagation()}>
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter {col.label}</div>
                                  <div className="relative mb-3">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="text"
                                      value={colSearch[col.id] || ""}
                                      onChange={(e) =>
                                        setColSearch((p) => ({
                                          ...p,
                                          [col.id]: e.target.value,
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
                                      const uniqueValues = products.reduce<string[]>((acc, p) => {
                                        let val = "";
                                        if (col.id === "name") val = p.name;
                                        else if (col.id === "productId") val = p.productId;
                                        else if (col.id === "type") val = p.type;
                                        else if (col.id === "lifecycleState") val = p.lifecycleState;
                                        else if (col.id === "parentName") val = p.parentName || "";
                                        else if (col.id === "childCount") val = String(p.childCount);
                                        else if (col.id === "claimsCount") val = String(p.claimsCount);
                                        else if (col.id === "projectsCount") val = String(p.projectsCount);
                                        else if (col.id === "createdBy") val = p.createdBy;
                                        else if (col.id === "createdDate") val = formatDate(p.createdDate);

                                        if (val && val.trim() && !acc.includes(val.trim())) {
                                          acc.push(val.trim());
                                        }
                                        return acc;
                                      }, []);

                                      const searchQueryLocal = (colSearch[col.id] || "").toLowerCase();
                                      const filteredVals = uniqueValues.filter(v => v.toLowerCase().includes(searchQueryLocal));

                                      if (filteredVals.length === 0) {
                                        return <div className="text-xs text-gray-400 py-1 italic font-normal">No options found</div>;
                                      }

                                      return filteredVals.map(val => {
                                        const isChecked = (colCheckboxes[col.id] || []).includes(val);
                                        return (
                                          <label key={val} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-earth cursor-pointer transition-colors text-xs text-night font-normal">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={() => {
                                                setColCheckboxes(prev => {
                                                  const current = prev[col.id] || [];
                                                  const nextList = current.includes(val)
                                                    ? current.filter(v => v !== val)
                                                    : [...current, val];
                                                  return { ...prev, [col.id]: nextList };
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
                                        setColSearch(prev => ({ ...prev, [col.id]: "" }));
                                        setColCheckboxes(prev => ({ ...prev, [col.id]: [] }));
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
                        </div>

                        {index < visibleColumns.length - 1 && (
                          <div
                            onMouseDown={(e) =>
                              handleResizeStart(
                                e,
                                col.id,
                                getColumnWidth(col),
                              )
                            }
                            className="absolute right-0 top-2 bottom-2 w-1 cursor-col-resize hover:bg-sky rounded-full transition-colors"
                            style={{ userSelect: "none" }}
                          />
                        )}
                      </th>
                    );
                  })}

                  <th className="w-10 px-3 py-3 bg-[#F6F7F0]"></th>
                </tr>
              </thead>
   
              <tbody className="divide-y divide-gray-300">
                {pagedProducts.map((product, idx) => {
                  const isFav = favorites.has(product.id);
                  const isHovered = hoveredRow === product.id;
                  const isSelected = selectedIds.has(product.id);
                  const rowBg = isSelected
                    ? 'bg-pale/30 font-medium'
                    : isHovered
                    ? 'bg-earth/50'
                    : 'bg-white';
   
                  return (
                    <tr
                      key={product.id}
                      onMouseEnter={() => setHoveredRow(product.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`border-b border-gray-300 transition-colors ${rowBg}`}
                    >
                      {/* Checkbox FIRST */}
                      {pendingAction && (
                        <td
                          className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                          style={{
                            width: "40px",
                            minWidth: "40px",
                            maxWidth: "40px",
                            ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : isHovered ? "#EEF4FB" : "#ffffff" } : {})
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleRow(product.id, e)}
                            className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                          />
                        </td>
                      )}

                      {/* Star SECOND */}
                      <td
                        className={`px-3 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          ...(isFrozen ? { position: "sticky", left: pendingAction ? 40 : 0, backgroundColor: isSelected ? "#F3F7FC" : isHovered ? "#EEF4FB" : "#ffffff" } : {})
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteToggle(product.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-yellow-500 hover:fill-yellow-100 transition-all hover:scale-110"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      </td>
                      {visibleColumns.map((col) => (
                        <React.Fragment key={col.id}>
                          {renderCell(product, col.id, isHovered, isSelected)}
                        </React.Fragment>
                      ))}
   
                      <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                        {(isHovered || actionMenuOpen === product.id) && (
                          <button 
                            onClick={() => setActionMenuOpen(actionMenuOpen === product.id ? null : product.id)}
                            className="p-1 rounded hover:bg-earth transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        {actionMenuOpen === product.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActionMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden text-left font-normal normal-case tracking-normal">
                              {["Open", "Audit Log", "Obsolete", "Cancel"].map(
                                (action) => (
                                  <button
                                    key={action}
                                    onClick={() => {
                                      setActionMenuOpen(null);
                                      if (action === "Open") {
                                        onProductClick(product);
                                      } else if (action === "Audit Log") {
                                        setSelectedProductForAudit(product);
                                      } else if (action === "Obsolete") {
                                        if (onProductsChange) {
                                          const updated = products.map(prod => prod.id === product.id ? { ...prod, lifecycleState: 'Obsolete' as const } : prod);
                                          onProductsChange(updated);
                                        }
                                      } else if (action === "Cancel") {
                                        if (onProductsChange) {
                                          const updated = products.map(prod => prod.id === product.id ? { ...prod, lifecycleState: 'Cancelled' as const } : prod);
                                          onProductsChange(updated);
                                        }
                                      }
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${action === "Cancel" ? "text-red-600 hover:bg-red-50" : "text-night hover:bg-earth"}`}
                                  >
                                    {action}
                                  </button>
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
 
        {/* Pagination */}
         <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filteredProducts.length}
          startIndex={(currentPage - 1) * PAGE_SIZE}
          itemsPerPage={PAGE_SIZE}
          label="products"
          onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPageSelect={setCurrentPage}
        />
      </div>
    </div>
      </div>

 {/* Local Saved Views Panel (US-M3-029, US-M3-030) */}
    <ProductSavedViewsPanel
      isOpen={savedViewsPanelOpen}
      onClose={() => setSavedViewsPanelOpen(false)}
      currentColumnOrder={columnOrder.map((c) => c.id)}
      currentFilters={productFilters}
      currentSortCol={sortCol}
      currentSortDir={sortDir as 'asc' | 'desc' | null}
      onApplyView={(view) => {
        onApplyView?.(view);
        setSavedViewsPanelOpen(false);
      }}
      savedViews={savedViews}
      onSavedViewsChange={onSavedViewsChange ?? (() => {})}
    />

      {/* Audit Log Modal */}
      {selectedProductForAudit && (
        <AuditLogModal
          isOpen={selectedProductForAudit !== null}
          onClose={() => setSelectedProductForAudit(null)}
          title="Product Audit Trail"
          itemName={selectedProductForAudit.name}
          itemId={selectedProductForAudit.productId}
          logs={generateProductLogs(selectedProductForAudit)}
        />
      )}
      {/* Product Saved Views Dialogs */}
      {saveDialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setSaveDialogState({ isOpen: false, name: '', overwriteWarning: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <Save className="w-5 h-5 text-sky" />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>Save Current View</h3>
                <p className="text-xs text-gray-500">Save your active filters and column states</p>
              </div>
            </div>

            {saveDialogState.overwriteWarning ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  A saved view named <strong className="font-semibold">"{saveDialogState.name}"</strong> already exists. Overwriting it will update its filters with your current layout.
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSaveDialogState(prev => ({ ...prev, overwriteWarning: false }))}
                    className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                  >
                    Choose Different Name
                  </button>
                  <button
                    onClick={() => handleSaveViewConfirm(saveDialogState.name, true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                  >
                    Overwrite View
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>View Name</label>
                  <input
                    type="text"
                    value={saveDialogState.name}
                    onChange={e => setSaveDialogState(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. In Progress Global Reviews"
                    className="w-full px-3.5 py-2.5 border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSaveDialogState({ isOpen: false, name: '', overwriteWarning: false })}
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
          <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setRenameDialogState({ isOpen: false, name: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <Edit3 className="w-5 h-5 text-sky" />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>Rename Saved View</h3>
                <p className="text-xs text-gray-500">Choose a new label for this custom configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>New Name</label>
                <input
                  type="text"
                  value={renameDialogState.name}
                  onChange={e => setRenameDialogState(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. My Custom Layout"
                  className="w-full px-3.5 py-2.5 border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRenameDialogState({ isOpen: false, name: '' })}
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameViewConfirm(renameDialogState.name)}
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
          <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setDeleteDialogState({ isOpen: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>Delete Saved View</h3>
                <p className="text-xs text-gray-500">This view will be permanently removed from your system</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you absolutely sure you want to delete the saved view <strong className="font-semibold">"{activeView.replace('Saved: ', '')}"</strong>? This action cannot be undone.
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
          <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={() => setShareDialogState({ isOpen: false, search: '', selectedUsers: [], makeDefault: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-full sm:max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pale rounded-lg">
                <Share2 className="w-5 h-5 text-sky" />
              </div>
              <div>
                <h3 className="text-lg text-night" style={{ fontWeight: 600 }}>Share Saved View</h3>
                <p className="text-xs text-gray-500">Allow team members to use this layout</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search input to filter team members */}
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Search &amp; Filter Users</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={shareDialogState.search}
                    onChange={e => setShareDialogState(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-8 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  {shareDialogState.search && (
                    <button
                      onClick={() => setShareDialogState(prev => ({ ...prev, search: '' }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2" style={{ fontWeight: 600 }}>Select Team Members (Multiselect)</label>
                <div className="flex flex-wrap gap-2 mb-3 max-h-[140px] overflow-y-auto p-1 border border-pebble/60 rounded-lg">
                  {['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis', 'Lisa Anderson']
                    .filter(user => user.toLowerCase().includes(shareDialogState.search.toLowerCase()))
                    .map(user => {
                      const isSelected = shareDialogState.selectedUsers.includes(user);
                      return (
                        <button
                          key={user}
                          onClick={() => {
                            setShareDialogState(prev => ({
                              ...prev,
                              selectedUsers: isSelected
                                ? prev.selectedUsers.filter(u => u !== user)
                                : [...prev.selectedUsers, user]
                            }));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                            isSelected
                              ? 'border-sky bg-pale text-sky font-medium shadow-sm'
                              : 'border-pebble text-gray-600 hover:border-sky/40 hover:bg-earth'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {user}
                        </button>
                      );
                    })}
                  {['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis', 'Lisa Anderson']
                    .filter(user => user.toLowerCase().includes(shareDialogState.search.toLowerCase())).length === 0 && (
                      <p className="text-xs text-gray-400 italic p-2">No users match your search.</p>
                    )}
                </div>
              </div>

              {/* Set as Default View checkbox option */}
              <div className="flex items-center gap-2.5 pt-3 pb-1 border-t border-pebble">
                <input
                  type="checkbox"
                  id="share-make-default-checkbox"
                  checked={shareDialogState.makeDefault}
                  onChange={e => setShareDialogState(prev => ({ ...prev, makeDefault: e.target.checked }))}
                  className="w-4 h-4 rounded text-sky focus:ring-sky border-pebble accent-sky cursor-pointer"
                />
                <label htmlFor="share-make-default-checkbox" className="text-sm text-gray-700 cursor-pointer select-none font-medium">
                  Set as Default View on share
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-pebble">
                <button
                  onClick={() => setShareDialogState({ isOpen: false, search: '', selectedUsers: [], makeDefault: false })}
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareViewConfirm(shareDialogState.selectedUsers)}
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
  </>
  );
}