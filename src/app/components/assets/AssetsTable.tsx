import { useState, Fragment, useMemo, useEffect } from 'react';
import {
  Check, ChevronDown, ChevronRight, Star, GripVertical,
  Link2, Shield, MessageSquare, History, X, Plus,
  FileText, Image, Film, Music, Package, Eye, EyeOff, MoreHorizontal, MoreVertical, Search, ArrowUpDown, ChevronUp, Archive, Sparkles
} from 'lucide-react';
import { Asset, ASSET_LIFECYCLE_COLORS } from '../../types';
import EmptyState from '../ui/EmptyState';
import { TablePagination } from '../ui/tableUtils';

const FILTER_NAMES: Record<string, string> = {
  lifecycle: 'Lifecycle State',
  subtype: 'Subtype',
  businessGroup: 'Business Group',
  geography: 'Geography',
  cbp: 'CBP',
  category: 'Category',
  createdBy: 'Created By',
};

const BASE_COLUMNS = [
  { id: 'name', label: 'Asset Name', width: 280 },
  { id: 'assetId', label: 'Asset ID', width: 110 },
  { id: 'subtype', label: 'Subtype', width: 150 },
  { id: 'lifecycle', label: 'Lifecycle', width: 140 },
  { id: 'version', label: 'Version', width: 100 },
  { id: 'businessGroup', label: 'Business Group', width: 180 },
  { id: 'geography', label: 'Geography', width: 140 },
  { id: 'createdBy', label: 'Created By', width: 150 },
  { id: 'modifiedOn', label: 'Modified On', width: 140 },
];

interface AssetsTableProps {
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAssetsChange: (assets: Asset[]) => void;
  onBulkAction: (action: string) => void;
  appliedFilters?: {
    lifecycle?: string[];
    subtype?: string[];
    businessGroup?: string[];
    geography?: string[];
    cbp?: string[];
  };
  onRemoveFilter?: (category: string, value: string) => void;
  onClearFilters?: () => void;
  activeLibraryView?: string;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image': return <Image className="w-4 h-4 text-blue-500" />;
    case 'video': return <Film className="w-4 h-4 text-purple-500" />;
    case 'audio': return <Music className="w-4 h-4 text-green-500" />;
    case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
    default: return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

export default function AssetsTable({
  assets,
  onAssetClick,
  selectedIds,
  onSelectionChange,
  onAssetsChange,
  onBulkAction,
  appliedFilters = {},
  onRemoveFilter,
  onClearFilters,
  activeLibraryView = "All Assets",
}: AssetsTableProps) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [expandedVersionIds, setExpandedVersionIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, 'support' | 'risk' | 'comments' | null>>({});

  // Search, Sorting & Table Settings
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [assets, appliedFilters]);

  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortCol(null);
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (colId: string) => {
    if (sortCol !== colId) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-colors" />;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-sky stroke-[2.5]" />
      : <ChevronDown className="w-3.5 h-3.5 text-sky stroke-[2.5]" />;
  };

  const filteredAndSortedAssets = useMemo(() => {
    let list = [...assets];
    
    // Column-specific search filters
    list = list.filter(asset => {
      return Object.entries(colSearch).every(([colId, query]) => {
        if (!query) return true;
        const q = query.toLowerCase();
        switch (colId) {
          case 'name': return asset.name.toLowerCase().includes(q);
          case 'assetId': return asset.id.toLowerCase().includes(q);
          case 'subtype': return (asset.subtype || '').toLowerCase().includes(q);
          case 'lifecycle': return asset.lifecycleStage.toLowerCase().includes(q);
          case 'version': return asset.currentVersionNumber.toLowerCase().includes(q);
          case 'businessGroup': return asset.businessGroup.toLowerCase().includes(q);
          case 'geography': return asset.geography.some(g => g.toLowerCase().includes(q));
          case 'createdBy': return asset.createdBy.toLowerCase().includes(q);
          case 'modifiedOn': return formatRelativeDate(asset.modifiedAt).toLowerCase().includes(q);
          default: return true;
        }
      });
    });

    if (sortCol && sortDir) {
      list.sort((a, b) => {
        let aVal = '';
        let bVal = '';
        if (sortCol === 'assetId') { aVal = a.id; bVal = b.id; }
        else if (sortCol === 'lifecycle') { aVal = a.lifecycleStage; bVal = b.lifecycleStage; }
        else if (sortCol === 'version') { aVal = a.currentVersionNumber; bVal = b.currentVersionNumber; }
        else if (sortCol === 'modifiedOn') { aVal = a.modifiedAt; bVal = b.modifiedAt; }
        else {
          aVal = (a as any)[sortCol] || '';
          bVal = (b as any)[sortCol] || '';
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return list;
  }, [assets, sortCol, sortDir, colSearch]);

  const handleColDragStart = (i: number) => setDraggedCol(i);
  const handleColDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedCol === null || draggedCol === i) return;
    const next = [...columnOrder];
    const [item] = next.splice(draggedCol, 1);
    next.splice(i, 0, item);
    setColumnOrder(next);
    setDraggedCol(i);
  };
  const handleColDragEnd = () => setDraggedCol(null);

  const allSelected = filteredAndSortedAssets.length > 0 && selectedIds.length === filteredAndSortedAssets.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredAndSortedAssets.length;

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAndSortedAssets.map(a => a.id));
    }
  };

  const toggleFavorite = (asset: any) => {
    const updatedVersions = [...asset.versions];
    const versionIndex = updatedVersions.findIndex((v: any) => v.versionNumber === asset.currentVersionNumber);
    if (versionIndex > -1) {
      updatedVersions[versionIndex] = {
        ...updatedVersions[versionIndex],
        isFavorite: !updatedVersions[versionIndex].isFavorite
      };
    }
    const updated = { ...asset, versions: updatedVersions };
    onAssetsChange(assets.map(a => a.id === asset.id ? updated : a));
  };

  const toggleExpand = (assetId: string) => {
    if (expandedAssetId === assetId) {
      setExpandedAssetId(null);
      setExpandedSections({});
    } else {
      setExpandedAssetId(assetId);
      setExpandedSections({});
    }
  };

  const toggleExpandVersion = (id: string) => {
    setExpandedVersionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSection = (id: string, section: 'support' | 'risk' | 'comments') => {
    setExpandedSections(prev => ({ ...prev, [id]: prev[id] === section ? null : section }));
  };

  const renderCell = (asset: any, colId: string, isSelected: boolean, isSubRow = false) => {
    const col = columnOrder.find(c => c.id === colId);
    const colWidth = col ? col.width : 100;
    const cellStyle = {
      width: colWidth,
      minWidth: colWidth,
    };

    const textClass = isSubRow ? "text-gray-400" : "text-gray-600";
    const titleClass = isSubRow ? "text-gray-400 font-medium" : "text-sky hover:underline font-medium";
    const nameClass = isSubRow ? "text-gray-400 font-medium" : "text-night font-medium";

    const currentVersionData = asset.versions.find((v: any) => v.versionNumber === asset.currentVersionNumber) || asset.versions[0];

    switch (colId) {
      case 'name':
        return (
          <td 
            key={colId} 
            className={`px-4 py-3 ${isFrozen ? "sticky left-[128px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              ...(isFrozen ? { backgroundColor: isSubRow ? "#f9fafb" : isSelected ? "#F3F7FC" : "#ffffff" } : {})
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="truncate">
                {isSubRow ? (
                  <span className={`text-xs text-left truncate block max-w-full ${titleClass}`}>
                    {asset.name}
                  </span>
                ) : (
                  <button
                    onClick={() => onAssetClick(asset)}
                    className={`text-xs text-left truncate block max-w-full ${titleClass}`}
                  >
                    {asset.name}
                  </button>
                )}
                {asset.isPlaceholder && (
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] border ${isSubRow ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    Placeholder
                  </span>
                )}
              </div>
            </div>
          </td>
        );
      case 'assetId':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs font-mono block truncate ${textClass}`}>{asset.id}</span>
          </td>
        );
      case 'subtype':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${textClass}`}>
              {currentVersionData.fileType || asset.subtype || <span className="text-gray-400">Unclassified</span>}
            </span>
          </td>
        );
      case 'lifecycle':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${textClass}`}>
              {currentVersionData.lifecycleStage || asset.lifecycleStage}
            </span>
          </td>
        );
      case 'version': {
        const isLatest = asset.versions.length > 0 && asset.currentVersionNumber === asset.versions[asset.versions.length - 1].versionNumber;
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <div className="flex flex-col gap-1 overflow-hidden items-start">
              {asset.versions.length > 1 && !isSubRow ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandVersion(asset.uniqueRowId);
                  }}
                  className={`text-xs flex items-center gap-1 text-left ${titleClass}`}
                >
                  v{asset.currentVersionNumber}
                  {expandedVersionIds.has(asset.uniqueRowId) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              ) : (
                <span className={`text-xs block truncate ${nameClass}`}>v{asset.currentVersionNumber}</span>
              )}
              {isLatest && <span className={`text-[10px] font-medium block truncate ${isSubRow ? 'text-gray-400' : 'text-green-700'}`}>Latest</span>}
            </div>
          </td>
        );
      }
      case 'businessGroup':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${textClass}`}>{asset.businessGroup}</span>
          </td>
        );
      case 'geography':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${textClass}`}>
              {asset.geography.slice(0, 2).join(', ')}
              {asset.geography.length > 2 && (
                <span className="text-gray-400"> +{asset.geography.length - 2}</span>
              )}
            </span>
          </td>
        );
      case 'createdBy':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${textClass}`}>{currentVersionData.uploadedBy || asset.createdBy}</span>
          </td>
        );
      case 'modifiedOn':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs block truncate ${isSubRow ? 'text-gray-400' : 'text-gray-500'}`}>{formatRelativeDate(currentVersionData.uploadedAt || asset.modifiedAt)}</span>
          </td>
        );
      default:
        return <td key={colId} className="px-4 py-3" style={cellStyle}></td>;
    }
  };

  const activeFilters = Object.entries(appliedFilters || {}).filter(([_, values]) => values && values.length > 0);
  const activeFiltersCount = activeFilters.length;

  const flattenedAndSortedVersions = useMemo(() => {
    return filteredAndSortedAssets.flatMap(asset => {
      return asset.versions.map(ver => {
        return {
          ...asset,
          currentVersionNumber: ver.versionNumber,
          uniqueRowId: `${asset.id}-v${ver.versionNumber}`
        };
      });
    });
  }, [filteredAndSortedAssets]);

  const itemsPerPage = 10;
  const totalRecords = flattenedAndSortedVersions.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedAssets = useMemo(() => {
    return flattenedAndSortedVersions.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedAndSortedVersions, startIndex]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
      {/* Active filter chips row - styled identically to Projects */}
      {appliedFilters &&
        Object.values(appliedFilters).some(
          (v) => v.length > 0,
        ) && (
          <div className="px-4 py-2 bg-earth/30 border-b border-pebble flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-1">
                Active filters:
              </span>
              {Object.entries(appliedFilters).map(([key, values]) => {
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
              })}
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

      {/* Top Toolbar / Header Row */}
      <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {isBulkMode && selectedIds.length > 0 ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">
                {selectedIds.length} of {assets.length} selected
              </span>
              <button
                onClick={() => onSelectionChange([])}
                className="text-xs text-gray-500 hover:text-night transition-colors font-medium"
              >
                Clear selection
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium ml-1">
              Asset Library
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
              className="p-1.5 border border-pebble rounded-lg text-gray-500 hover:bg-earth transition-colors hover:text-night shadow-sm bg-white"
              title="Table Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

              {isTableMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsTableMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[220px] py-1.5 overflow-hidden text-left font-normal normal-case tracking-normal">
                    <button
                      onClick={() => {
                        setIsTableMenuOpen(false);
                        setIsFrozen(!isFrozen);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      {isFrozen ? <EyeOff className="w-4 h-4 text-sky" /> : <Eye className="w-4 h-4 text-sky" />}
                      <span>{isFrozen ? "Unfreeze Columns" : "Freeze Columns"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsTableMenuOpen(false);
                        setColumnOrder(BASE_COLUMNS);
                        setSortCol(null);
                        setSortDir(null);
                        setColSearch({});
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <span className="text-gray-400">↺</span>
                      <span>Reset Table State</span>
                    </button>
                    
                    <div className="border-t border-pebble my-1" />
                    <button
                      onClick={() => {
                        setIsTableMenuOpen(false);
                        setIsBulkMode(!isBulkMode);
                        if (isBulkMode) onSelectionChange([]);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors font-medium text-left"
                    >
                      <MoreHorizontal className="w-4 h-4 text-sky" />
                      <span>{isBulkMode ? "Disable Bulk Actions" : "Enable Bulk Actions"}</span>
                    </button>

                    {isBulkMode && selectedIds.length > 0 && (
                      <>
                        <div className="border-t border-pebble my-1" />
                        <div className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">Bulk Actions ({selectedIds.length} selected)</div>
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            onBulkAction('reclassify');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-night hover:bg-earth transition-colors text-left pl-8"
                        >
                          <Check className="w-4 h-4 text-sky" />
                          <span>Reclassify Assets</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            onBulkAction('change-lifecycle');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-night hover:bg-earth transition-colors text-left pl-8"
                        >
                          <Check className="w-4 h-4 text-sky" />
                          <span>Change Lifecycle</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            onBulkAction('run-sparci');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-night hover:bg-earth transition-colors text-left pl-8"
                        >
                          <Sparkles className="w-4 h-4 text-sky animate-pulse" />
                          <span>Run SPARCi Review</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            onBulkAction('archive');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left pl-8 border-t border-pebble"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Mark as Not Used</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full border-collapse" style={{ minWidth: "1200px" }}>
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {/* Checkbox */}
              {isBulkMode && (
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
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                  />
                </th>
              )}

              {/* Star */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  left: isFrozen ? (isBulkMode ? 40 : 0) : undefined,
                  width: "48px",
                  minWidth: "48px",
                  maxWidth: "48px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Expand */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  left: isFrozen ? (isBulkMode ? 88 : 48) : undefined,
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Draggable columns */}
              {columnOrder.map((col, index) => {
                const isSticky = isFrozen && col.id === "name";
                const leftOffset = isBulkMode ? 128 : 88;
                return (
                  <th
                    key={col.id}
                    draggable
                    onDragStart={() => handleColDragStart(index)}
                    onDragOver={(e) => handleColDragOver(e, index)}
                    onDragEnd={handleColDragEnd}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      ...(isSticky ? { position: "sticky", left: leftOffset, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                    }}
                    className={`px-4 py-3 text-left relative ${col.id !== "actions" ? "cursor-move" : ""} ${draggedCol === index ? "opacity-50 bg-pale" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <button
                        onClick={() => handleSort(col.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-sky rounded text-left truncate flex-1"
                      >
                        <span className="truncate">{col.label}</span>
                        {renderSortIcon(col.id)}
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
                            <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[240px] p-3 text-left font-normal normal-case tracking-normal" onClick={(e) => e.stopPropagation()}>
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

              {/* Table Level Actions Dropdown Header */}
              <th className="w-10 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {paginatedAssets.map(asset => {
              const isSelected = selectedIds.includes(asset.id);
              const isExpanded = expandedAssetId === asset.uniqueRowId;
              const rowBg = isSelected
                ? "bg-pale/30 font-medium"
                : isExpanded
                ? "bg-earth/50"
                : "hover:bg-earth/30";

              const currentVersionData = asset.versions.find((v: any) => v.versionNumber === asset.currentVersionNumber) || asset.versions[0];

              return (
                <Fragment key={asset.uniqueRowId}>
                  <tr className={`border-b border-gray-300 transition-colors ${rowBg}`}>
                    {/* Checkbox */}
                    {isBulkMode && (
                      <td
                        className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : "#ffffff" } : {})
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(asset.id)}
                          className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                        />
                      </td>
                    )}

                    {/* Star */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        left: isFrozen ? (isBulkMode ? 40 : 0) : undefined,
                        width: "48px",
                        minWidth: "48px",
                        maxWidth: "48px",
                        ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : "#ffffff" } : {})
                      }}
                    >
                      <button
                        onClick={() => toggleFavorite(asset)}
                        className="focus:outline-none transition-transform duration-200 transform hover:scale-110"
                      >
                        <Star
                          className={`w-4.5 h-4.5 transition-all ${
                            currentVersionData.isFavorite
                              ? 'fill-yellow-400 text-yellow-500'
                              : 'text-gray-400 hover:text-yellow-500 hover:fill-yellow-100'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Expand */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        left: isFrozen ? (isBulkMode ? 88 : 48) : undefined,
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : "#ffffff" } : {})
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(asset.uniqueRowId)}
                        className="p-0.5 hover:bg-pebble rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Data columns */}
                    {columnOrder.map(col => renderCell(asset, col.id, isSelected))}

                    {/* Actions column cell — 3-dots row menu */}
                    <td className="px-3 py-3 w-10 relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === asset.uniqueRowId ? null : asset.uniqueRowId)}
                        className="p-1.5 hover:bg-earth rounded-lg transition-colors text-gray-400 hover:text-night"
                        title="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === asset.uniqueRowId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                          <div className="absolute right-0 top-full bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
                            {['Open', 'Download', 'Duplicate', 'Reclassify', 'Change Lifecycle'].map(action => (
                              <button
                                key={action}
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  if (action === 'Open') onAssetClick(asset);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors"
                              >
                                {action}
                              </button>
                            ))}
                            <div className="border-t border-pebble" />
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                onAssetsChange(assets.map(a => a.id === asset.id ? { ...a, lifecycleStage: 'Not Used' as any } : a));
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Mark as Not Used
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>

                {/* Inline Workbench */}
                {isExpanded && (
                  <tr>
                    <td colSpan={columnOrder.length + (isBulkMode ? 4 : 3)} className="px-0 py-0">
                      <div className="border-b-2 border-sky/20" style={{ background: '#EEF4FB' }}>
                        <div className="p-4 space-y-2">
                        {/* Section 1: Substantiations */}
                        <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleSection(asset.uniqueRowId, 'support')}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-night font-medium">Substantiations</span>
                            </div>
                            {expandedSections[asset.uniqueRowId] === 'support' ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {expandedSections[asset.uniqueRowId] === 'support' && (
                            <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                              <div className="text-sm text-gray-600">
                                {asset.linkedClaimIds.length > 0 ? (
                                  <div className="space-y-2">
                                    {asset.linkedClaimIds.map((claimId: string) => (
                                      <div key={claimId} className="flex items-center gap-2 p-2 bg-earth rounded">
                                        <span className="text-sm text-night">{claimId}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">No substantiation data</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 2: Risk Level Assessments */}
                        <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleSection(asset.uniqueRowId, 'risk')}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-night font-medium">Risk Level Assessments</span>
                              {currentVersionData.finalRisk?.finalRiskLevel && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">
                                  {currentVersionData.finalRisk.finalRiskLevel}
                                </span>
                              )}
                            </div>
                            {expandedSections[asset.uniqueRowId] === 'risk' ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {expandedSections[asset.uniqueRowId] === 'risk' && (
                            <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                              <div className="space-y-3">
                                {currentVersionData.riskRecords?.map((record: any) => (
                                  <div key={record.id} className="p-3 bg-white border border-pebble rounded">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-night">{record.department}</span>
                                      <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-semibold">
                                        {record.riskLevel}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{record.comments}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 3: Comments */}
                        <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleSection(asset.uniqueRowId, 'comments')}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-night font-medium">Comments</span>
                              <span className="text-xs text-gray-500">
                                {asset.assetLevelComments.length} comments
                              </span>
                            </div>
                            {expandedSections[asset.uniqueRowId] === 'comments' ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {expandedSections[asset.uniqueRowId] === 'comments' && (
                            <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                              <div className="space-y-3">
                                {asset.assetLevelComments.length > 0 ? (
                                  asset.assetLevelComments.map((comment: any) => (
                                    <div key={comment.id} className="p-3 bg-white border border-pebble rounded">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-night">{comment.author}</span>
                                        <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{comment.content}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No comments yet</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Version History Expansion - read-only grey text */}
                {expandedVersionIds.has(asset.uniqueRowId) && asset.versions.map((ver: any) => {
                  if (ver.versionNumber === asset.currentVersionNumber) return null; // Skip current version
                  const oldAsset = { ...asset, currentVersionNumber: ver.versionNumber };
                  return (
                    <tr
                      key={`${asset.uniqueRowId}-sub-v${ver.versionNumber}`}
                      className="border-b border-gray-200 bg-gray-50 opacity-90 transition-opacity"
                      style={{ height: 48 }}
                    >
                      {/* Checkbox (empty) */}
                      {isBulkMode && (
                        <td className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}></td>
                      )}
                      
                      {/* Favorite (empty) */}
                      <td className={`px-3 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ left: isFrozen ? (isBulkMode ? 40 : 0) : undefined, width: "48px", minWidth: "48px", maxWidth: "48px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}></td>

                      {/* Expand chevron (indent) */}
                      <td className={`px-3 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ left: isFrozen ? (isBulkMode ? 88 : 48) : undefined, width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}>
                        <span className="text-gray-400 flex justify-center text-lg">↳</span>
                      </td>

                      {/* Draggable data cells */}
                      {columnOrder.map(col => renderCell(oldAsset, col.id, false, true))}

                      {/* Actions column cell */}
                      <td className="px-3 py-3 w-10"></td>
                    </tr>
                  );
                })}
              </Fragment>
            )})}
          </tbody>
        </table>

        {filteredAndSortedAssets.length === 0 && (
          <EmptyState
            icon={Package}
            title="No assets found"
            description="Adjust your filters or search to find the assets you're looking for."
          />
        )}
      </div>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        label="assets"
        onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        onPageSelect={(p) => setCurrentPage(p)}
      />
    </div>
  );
}