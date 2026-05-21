import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Download,
  MoreHorizontal,
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
  GripVertical
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

interface ProductsLandingPageProps {
  products: ProductItem[];
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
 
const DEFAULT_COLUMNS = [
  { id: 'name', label: 'Product Name', sortable: true, width: 280 },
  { id: 'productId', label: 'Product ID', sortable: true, width: 140 },
  { id: 'type', label: 'Product Type', sortable: true, width: 160 },
  { id: 'lifecycleState', label: 'Lifecycle State', sortable: true, width: 170 },
  { id: 'parentName', label: 'Parent Product', sortable: false, width: 180 },
  { id: 'childCount', label: 'Children', sortable: true, width: 120 },
  { id: 'claimsCount', label: 'Claims', sortable: true, width: 120 },
  { id: 'projectsCount', label: 'Projects', sortable: true, width: 120 },
  { id: 'createdBy', label: 'Created By', sortable: true, width: 160 },
  { id: 'createdDate', label: 'Created Date', sortable: true, width: 150 }
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

export default function ProductsLandingPage({
  products,
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
  const [sortCol, setSortCol] = useState<string | null>(externalSortCol ?? 'lastModified');
  const [sortDir, setSortDir] = useState<SortDir>(externalSortDir ?? 'desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, Sorting & Table Settings
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [isCreateProductDropdownOpen, setIsCreateProductDropdownOpen] = useState(false);
 
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
 
    // Apply column-specific search filters
    list = list.filter((p) => {
      return Object.entries(colSearch).every(([colId, query]) => {
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
    });

    return list;
  }, [
    products,
    activeView,
    favorites,
    recentIds,
    search,
    colSearch,
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
        return (
          <td 
            className={`px-4 py-3 ${isFrozen ? "sticky left-[80px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              ...(isFrozen ? { backgroundColor: nameBg } : {})
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
            <button
              onClick={onViewHierarchy}
              className="flex items-center gap-2 px-3 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth hover:border-sky transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              Hierarchy View
            </button>
 
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
                      onCreateProduct('Format');
                      setIsCreateProductDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-earth transition-colors border-b border-pebble/40 last:border-0"
                  >
                    Bulk Product
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
 
      {/* Selection count bar */}
      {selectedIds.size > 0 && (
        <div className="bg-pale border-b border-sky/20 px-6 py-2 flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-sky font-medium">{selectedIds.size} of {filteredProducts.length} selected</span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-gray-500 hover:text-night transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

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

                  {/* Star SECOND */}
                  <th
                    className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                    style={{
                      width: "40px",
                      minWidth: "40px",
                      maxWidth: "40px",
                      ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                    }}
                  ></th>
   
                  {columnOrder.map((col, index) => {
                    const isSticky = isFrozen && col.id === "name";
                    const leftOffset = 80;
                    return (
                      <th
                        key={col.id}
                        draggable
                        onDragStart={() => handleColumnDragStart(index)}
                        onDragOver={(e) => handleColumnDragOver(e, index)}
                        onDragEnd={handleColumnDragEnd}
                        style={{
                          width: col.width || 120,
                          minWidth: col.width || 120,
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
                              className={`p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 hover:text-sky flex items-center justify-center ${activeHeaderDropdown === col.id ? "text-sky bg-pebble/30" : ""} ${colSearch[col.id] ? "text-sky font-semibold" : ""}`}
                            >
                              <Search className="w-3 h-3" />
                            </button>

                            {activeHeaderDropdown === col.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(null); }} />
                                <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[240px] p-3 text-left font-normal normal-case tracking-normal animate-in fade-in duration-100" onClick={(e) => e.stopPropagation()}>
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter {col.label}</div>
                                  <div className="relative">
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
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {/* Table Settings Dropdown Header */}
                  <th className="w-10 px-3 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
                        className="p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 flex items-center justify-center focus:outline-none"
                        title="Table Settings"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isTableMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setIsTableMenuOpen(false)} />
                          <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[200px] py-1.5 overflow-hidden text-left font-normal normal-case tracking-normal">
                            <button
                              onClick={() => {
                                setIsTableMenuOpen(false);
                                setIsFrozen(!isFrozen);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-night hover:bg-earth transition-colors"
                            >
                              {isFrozen ? <EyeOff className="w-4 h-4 text-sky" /> : <Eye className="w-4 h-4 text-sky" />}
                              {isFrozen ? "Unfreeze Columns" : "Freeze Columns"}
                            </button>
                            <button
                              onClick={() => {
                                setIsTableMenuOpen(false);
                                setColumnOrder(DEFAULT_COLUMNS);
                                setSortCol(null);
                                setSortDir(null);
                                setColSearch({});
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-night hover:bg-earth transition-colors"
                            >
                              <span className="text-gray-400">↺</span> Reset Table State
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </th>
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

                      {/* Star SECOND */}
                      <td
                        className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : isHovered ? "#EEF4FB" : "#ffffff" } : {})
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
                      {columnOrder.map((col) => (
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
                            <div className="absolute right-0 top-full bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
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