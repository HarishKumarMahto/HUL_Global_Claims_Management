import { useState, Fragment, useMemo } from 'react';
import {
  Check, ChevronDown, ChevronRight, Star, GripVertical,
  Link2, Shield, MessageSquare, History, X, Plus,
  FileText, Image, Film, Music, Package, Eye, EyeOff, MoreHorizontal, Search, ArrowUpDown, ChevronUp
} from 'lucide-react';
import { Asset, ASSET_LIFECYCLE_COLORS } from '../../types';
import EmptyState from '../ui/EmptyState';

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
}: AssetsTableProps) {
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Search, Sorting & Table Settings
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);
  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

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

  const toggleFavorite = (asset: Asset) => {
    const updated = { ...asset, isFavorite: !asset.isFavorite };
    onAssetsChange(assets.map(a => a.id === asset.id ? updated : a));
  };

  const toggleExpand = (assetId: string) => {
    if (expandedAssetId === assetId) {
      setExpandedAssetId(null);
      setExpandedSection(null);
    } else {
      setExpandedAssetId(assetId);
      setExpandedSection(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderCell = (asset: Asset, colId: string, isSelected: boolean) => {
    const col = columnOrder.find(c => c.id === colId);
    const colWidth = col ? col.width : 100;
    const cellStyle = {
      width: colWidth,
      minWidth: colWidth,
    };

    switch (colId) {
      case 'name':
        return (
          <td 
            key={colId} 
            className={`px-4 py-3 ${isFrozen ? "sticky left-[128px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : "#ffffff" } : {})
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="truncate">
                <button
                  onClick={() => onAssetClick(asset)}
                  className="text-sm text-sky hover:underline text-left truncate block max-w-full font-medium"
                >
                  {asset.name}
                </button>
                {asset.isPlaceholder && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
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
            <span className="text-xs text-gray-600 font-mono block truncate">{asset.id}</span>
          </td>
        );
      case 'subtype':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-sm text-gray-600 block truncate">
              {asset.subtype || <span className="text-gray-400">Unclassified</span>}
            </span>
          </td>
        );
      case 'lifecycle':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-sm text-gray-600 block truncate">
              {asset.lifecycleStage}
            </span>
          </td>
        );
      case 'version':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-sm text-gray-600 block truncate">{asset.currentVersionNumber}</span>
          </td>
        );
      case 'businessGroup':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-sm text-gray-600 block truncate">{asset.businessGroup}</span>
          </td>
        );
      case 'geography':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-sm text-gray-600 block truncate">
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
            <span className="text-sm text-gray-600 block truncate">{asset.createdBy}</span>
          </td>
        );
      case 'modifiedOn':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className="text-xs text-gray-500 block truncate">{formatRelativeDate(asset.modifiedAt)}</span>
          </td>
        );
      default:
        return <td key={colId} className="px-4 py-3" style={cellStyle}></td>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full border-collapse" style={{ minWidth: "1200px" }}>
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {/* Checkbox */}
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

              {/* Star */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  width: "48px",
                  minWidth: "48px",
                  maxWidth: "48px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Expand */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky left-[88px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Draggable columns */}
              {columnOrder.map((col, index) => {
                const isSticky = isFrozen && col.id === "name";
                const leftOffset = 128;
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
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-move flex-shrink-0" />
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
                            setColumnOrder(BASE_COLUMNS);
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
            {filteredAndSortedAssets.map(asset => {
              const isSelected = selectedIds.includes(asset.id);
              const isExpanded = expandedAssetId === asset.id;
              const rowBg = isSelected
                ? "bg-pale/30 font-medium"
                : isExpanded
                ? "bg-earth/50"
                : "hover:bg-earth/30";

              return (
                <Fragment key={asset.id}>
                  <tr className={`border-b border-gray-300 transition-colors ${rowBg}`}>
                    {/* Checkbox */}
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

                    {/* Star */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
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
                            asset.isFavorite
                              ? 'fill-yellow-400 text-yellow-500'
                              : 'text-gray-400 hover:text-yellow-500 hover:fill-yellow-100'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Expand */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky left-[88px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { backgroundColor: isSelected ? "#F3F7FC" : "#ffffff" } : {})
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(asset.id)}
                        className="p-0.5 hover:bg-pebble rounded transition-colors"
                      >
                        {expandedAssetId === asset.id ? (
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
                        onClick={() => setActionMenuOpen(actionMenuOpen === asset.id ? null : asset.id)}
                        className="p-1.5 hover:bg-earth rounded-lg transition-colors text-gray-400 hover:text-night"
                        title="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {actionMenuOpen === asset.id && (
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
                {expandedAssetId === asset.id && (
                  <tr>
                    <td colSpan={columnOrder.length + 4} className="px-0 py-0">
                      <div className="bg-pale/10 border-l-4 border-sky">
                        {/* Context Header */}
                        <div className="px-6 py-3 bg-white border-b border-pebble sticky top-0 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-night font-medium">{asset.name}</span>
                            <span className={`px-2 py-0.5 rounded-full ${ASSET_LIFECYCLE_COLORS[asset.lifecycleStage]}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                              {asset.lifecycleStage}
                            </span>
                            <span className="text-xs text-gray-500">{asset.subtype || 'Unclassified'}</span>
                          </div>
                          <button
                            onClick={() => onAssetClick(asset)}
                            className="text-sm text-sky hover:underline"
                          >
                            Open full view →
                          </button>
                        </div>

                        {/* Accordion Sections */}
                        <div className="p-4 space-y-2">
                          {/* Section 1: Claims & Adaptations */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden">
                            <button
                              onClick={() => toggleSection('claims')}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Link2 className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-night font-medium">Related Claims & Adaptations</span>
                                <span className="text-xs text-gray-500">
                                  {asset.linkedClaimIds.length} claims linked
                                </span>
                              </div>
                              {expandedSection === 'claims' ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            {expandedSection === 'claims' && (
                              <div className="px-4 pb-4 border-t border-pebble">
                                <div className="mt-3 space-y-2">
                                  {asset.linkedClaimIds.length === 0 ? (
                                    <p className="text-sm text-gray-400">No linked claims</p>
                                  ) : (
                                    asset.linkedClaimIds.map(claimId => (
                                      <div key={claimId} className="flex items-center justify-between p-2 bg-earth rounded">
                                        <span className="text-sm text-night">{claimId}</span>
                                        <button className="text-gray-400 hover:text-red-500">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))
                                  )}
                                  <button className="text-sm text-sky hover:underline flex items-center gap-1 mt-2">
                                    <Plus className="w-3.5 h-3.5" />
                                    Link Claim
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Section 2: Risk */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden">
                            <button
                              onClick={() => toggleSection('risk')}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-night font-medium">Risk Level Assessments</span>
                                {asset.versions.find(v => v.versionNumber === asset.currentVersionNumber)?.finalRisk.finalRiskLevel && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">
                                    {asset.versions.find(v => v.versionNumber === asset.currentVersionNumber)?.finalRisk.finalRiskLevel}
                                  </span>
                                )}
                              </div>
                              {expandedSection === 'risk' ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            {expandedSection === 'risk' && (
                              <div className="px-4 pb-4 border-t border-pebble">
                                <div className="mt-3">
                                  {asset.versions.find(v => v.versionNumber === asset.currentVersionNumber)?.riskRecords.map(record => (
                                    <div key={record.id} className="mb-2 p-2 bg-earth rounded">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-night">{record.department}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">
                                          {record.riskLevel}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{record.comments}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Section 3: Comments */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden">
                            <button
                              onClick={() => toggleSection('comments')}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-night font-medium">Comments</span>
                                <span className="text-xs text-gray-500">
                                  {asset.assetLevelComments.length} comments, {asset.anchors.length} anchors
                                </span>
                              </div>
                              {expandedSection === 'comments' ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            {expandedSection === 'comments' && (
                              <div className="px-4 pb-4 border-t border-pebble">
                                <div className="mt-3 space-y-2">
                                  {asset.assetLevelComments.map(comment => (
                                    <div key={comment.id} className="p-2 bg-earth rounded">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-night">{comment.author}</span>
                                        <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{comment.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Section 4: History */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden">
                            <button
                              onClick={() => toggleSection('history')}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-night font-medium">Audit Log</span>
                                <span className="text-xs text-gray-500">{asset.auditLog.length} entries</span>
                              </div>
                              {expandedSection === 'history' ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            {expandedSection === 'history' && (
                              <div className="px-4 pb-4 border-t border-pebble">
                                <div className="mt-3 space-y-1">
                                  {asset.auditLog.map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-pebble last:border-0">
                                      <div className="flex-1">
                                        <span className="text-sm text-night">{entry.action}</span>
                                        <span className="text-xs text-gray-500 ml-2">by {entry.actor}</span>
                                      </div>
                                      <span className="text-xs text-gray-400">{formatRelativeDate(entry.timestamp)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
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
    </div>
  );
}