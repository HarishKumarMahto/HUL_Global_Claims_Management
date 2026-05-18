import { useState } from 'react';
import {
  Search, ChevronRight, ChevronDown, Star, Plus, Copy, Pencil,
  Trash2, History, MoreHorizontal, Globe, FileText, FolderKanban,
  GitBranch, Filter, X, ArrowLeft, Download
} from 'lucide-react';
import {
  ProductItem, buildHierarchyTree, HierarchyBrand, HierarchyNode,
  getLifecycleBadgeStyle, getProductTypeBg, getProductTypeColor, LifecycleState
} from './productData';
import ProductVersioningModal from './ProductVersioningModal';

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

interface ProductHierarchyPageProps {
  products: ProductItem[];
  favorites: Set<string>;
  onProductClick: (p: ProductItem, editMode?: boolean) => void;
  onFavoriteToggle: (id: string) => void;
  onBack: () => void;
  onCreateProduct: () => void;
}

function NodeCard({
  node, depth, favorites, onProductClick, onFavoriteToggle, selectedId, onSelect, recentIds, onCreateProduct, onCreateVersion
}: {
  node: HierarchyNode;
  depth: number;
  favorites: Set<string>;
  onProductClick: (p: ProductItem, editMode?: boolean) => void;
  onFavoriteToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  recentIds: string[];
  onCreateProduct: () => void;
  onCreateVersion?: (p: ProductItem) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [hovered, setHovered] = useState(false);
  const [actionMenu, setActionMenu] = useState(false);

  const { product, children } = node;
  const isFav = favorites.has(product.id);
  const isSelected = selectedId === product.id;
  const isRecent = recentIds.includes(product.id);
  const lcStyle = getLifecycleBadgeStyle(product.lifecycleState);
  const typeColor = getProductTypeColor(product.type);
  const typeBg = getProductTypeBg(product.type);
  const hasChildren = children.length > 0;

  const indentColors = ['#0066CC', '#47A3FF', '#85C2FF', '#C2E0FF', '#DBEAFE', '#EFF6FF'];
  const borderColor = indentColors[Math.min(depth, indentColors.length - 1)];

  return (
    <div className="relative">
      {/* Connector line */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: `${borderColor}40`, marginLeft: `${(depth - 1) * 28 + 14}px` }}
        />
      )}

      <div
        className="group relative"
        style={{ paddingLeft: `${depth * 28}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setActionMenu(false); }}
      >
        {/* Horizontal connector */}
        {depth > 0 && (
          <div
            className="absolute top-6 h-px"
            style={{ background: `${borderColor}40`, left: `${(depth - 1) * 28 + 14}px`, width: 14 }}
          />
        )}

        <div
          className={`relative flex items-start gap-2 p-3 mb-1.5 rounded-xl border transition-all cursor-pointer ${
            isSelected
              ? 'border-sky bg-pale shadow-md shadow-sky/10'
              : 'border-pebble bg-white hover:border-sky/40 hover:shadow-sm'
          }`}
          onClick={() => { onSelect(product.id); }}
        >
          {/* Expand toggle */}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${hasChildren ? 'hover:bg-earth' : 'invisible'}`}
          >
            {hasChildren && (expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />)}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm truncate ${isSelected ? 'text-sky' : 'text-night'}`} style={{ fontWeight: 500 }}>
                    {product.name}
                  </span>
                  {isRecent && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">Recent</span>
                  )}
                  {isFav && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: typeBg, color: typeColor, fontWeight: 500 }}>{product.type}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: lcStyle.dot }} />
                    <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: lcStyle.bg, color: lcStyle.text }}>{product.lifecycleState}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{product.productId}</span>
                </div>
              </div>

              {/* Hover actions */}
              {hovered && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onFavoriteToggle(product.id); }}
                    className="p-1.5 rounded-lg hover:bg-earth transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onProductClick(product); }}
                    className="p-1.5 px-2.5 rounded-lg bg-sky text-white hover:bg-dark transition-colors text-xs"
                  >
                    Open
                  </button>
                  <div className="relative">
                    <button
                      onClick={e => { e.stopPropagation(); setActionMenu(!actionMenu); }}
                      className="p-1.5 rounded-lg hover:bg-earth transition-colors"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {actionMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 w-64 overflow-hidden">
                          {/* US-M3-051: Wire all hierarchy node actions */}
                          {[
                            { label: 'Create New Version', icon: <GitBranch className="w-3.5 h-3.5" />, action: () => { setActionMenu(false); if (onCreateVersion) onCreateVersion(product); }, disabled: product.lifecycleState === 'Cancelled', isSky: true },
                            { label: 'Edit Product', icon: <Pencil className="w-3.5 h-3.5" />, action: () => onProductClick(product, true) },
                            product.type.toLowerCase() !== 'technology' ? { label: getCreateChildLabel(product.type), icon: <Plus className="w-3.5 h-3.5" />, action: () => { setActionMenu(false); onCreateProduct(); } } : null,
                            { label: 'Copy Product', icon: <Copy className="w-3.5 h-3.5" />, action: () => { setActionMenu(false); onCreateProduct(); } },
                            { label: 'Copy Claims', icon: <FileText className="w-3.5 h-3.5" />, action: () => { setActionMenu(false); onProductClick(product); } },
                            { label: 'Import Claims', icon: <Download className="w-3.5 h-3.5" />, action: () => { setActionMenu(false); onProductClick(product); } },
                            { label: 'Audit Log', icon: <History className="w-3.5 h-3.5" />, action: () => onProductClick(product) },
                          ].filter((a): a is NonNullable<typeof a> => a !== null).map(action => (
                            <button key={action.label} onClick={() => { if (!action.disabled) { setActionMenu(false); action.action(); } }}
                              disabled={action.disabled}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed ${action.isSky ? 'text-sky hover:bg-sky/5 border-b border-pebble/50' : 'text-night hover:bg-earth'}`}>
                              <span className={action.isSky ? 'text-sky' : 'text-gray-400'}>{action.icon}</span>{action.label}
                            </button>
                          ))}
                          <div className="border-t border-pebble">
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors text-left">
                              <Trash2 className="w-3.5 h-3.5" />Cancel Product
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
            <div className="flex items-center gap-3 mt-2">
              {product.geographyCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Globe className="w-3 h-3" />
                  {product.geographyCount}
                </div>
              )}
              {product.claimsCount > 0 && (
                <button onClick={e => { e.stopPropagation(); onProductClick(product); }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky transition-colors">
                  <FileText className="w-3 h-3" />
                  {product.claimsCount} claims
                </button>
              )}
              {product.projectsCount > 0 && (
                <button onClick={e => { e.stopPropagation(); onProductClick(product); }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky transition-colors">
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
                  {children.length} {children.length === 1 ? 'child' : 'children'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {expanded && hasChildren && (
          <div>
            {children.map(child => (
              <NodeCard
                key={child.product.id}
                node={child}
                depth={depth + 1}
                favorites={favorites}
                onProductClick={onProductClick}
                onFavoriteToggle={onFavoriteToggle}
                selectedId={selectedId}
                onSelect={onSelect}
                recentIds={recentIds}
                onCreateProduct={onCreateProduct}
                onCreateVersion={onCreateVersion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BrandSection({ brand, favorites, onProductClick, onFavoriteToggle, selectedId, onSelect, recentIds, defaultExpanded, onCreateProduct, onCreateVersion }: {
  brand: HierarchyBrand;
  favorites: Set<string>;
  onProductClick: (p: ProductItem, editMode?: boolean) => void;
  onFavoriteToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  recentIds: string[];
  defaultExpanded: boolean;
  onCreateProduct: () => void;
  onCreateVersion?: (p: ProductItem) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-pebble rounded-xl hover:bg-earth hover:border-sky/30 transition-all mb-2 group"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-sky transition-colors" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky transition-colors" />
        )}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0066CC, #004D99)', fontWeight: 700 }}>
          {brand.brandName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm text-night" style={{ fontWeight: 600 }}>{brand.brandName}</div>
          <div className="text-xs text-gray-400">{brand.formats.length} format{brand.formats.length !== 1 ? 's' : ''}</div>
        </div>
        {recentIds.includes(brand.formats[0]?.product?.id || '') && (
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">Recently Viewed</span>
        )}
        <div className="px-2 py-0.5 bg-earth text-gray-500 rounded-full text-xs">{brand.formats.length}</div>
      </button>

      {expanded && (
        <div className="pl-4">
          {brand.formats.map(node => (
            <NodeCard
              key={node.product.id}
              node={node}
              depth={0}
              favorites={favorites}
              onProductClick={onProductClick}
              onFavoriteToggle={onFavoriteToggle}
              selectedId={selectedId}
              onSelect={onSelect}
              recentIds={recentIds}
              onCreateProduct={onCreateProduct ?? (() => {})}
              onCreateVersion={onCreateVersion}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductHierarchyPage({
  products, favorites, onProductClick, onFavoriteToggle, onBack, onCreateProduct
}: ProductHierarchyPageProps) {
  const [search, setSearch] = useState('');
  const [lcFilter, setLcFilter] = useState<LifecycleState | ''>('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [versioningSource, setVersioningSource] = useState<ProductItem | null>(null);

  const tree = buildHierarchyTree(products);
  const recentIds = products.slice(0, 3).map(p => p.id);

  const filteredTree: HierarchyBrand[] = tree.map(brand => ({
    ...brand,
    formats: filterNodes(brand.formats, search, lcFilter),
  })).filter(b => b.formats.length > 0 && (!brandFilter || b.brandName === brandFilter));

  function filterNodes(nodes: HierarchyNode[], q: string, lc: string): HierarchyNode[] {
    return nodes.reduce((acc, node) => {
      const filteredChildren = filterNodes(node.children, q, lc);
      const matches =
        (!q || node.product.name.toLowerCase().includes(q.toLowerCase()) || node.product.productId.toLowerCase().includes(q.toLowerCase())) &&
        (!lc || node.product.lifecycleState === lc);
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, [] as HierarchyNode[]);
  }

  const brands = [...new Set(products.filter(p => p.type === 'Format').map(p => p.brand))].sort();
  const totalNodes = products.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-night">Product Hierarchy</h1>
                <span className="px-2.5 py-0.5 bg-pale text-sky rounded-full text-xs">{totalNodes} products</span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">Explore and navigate the complete product hierarchy tree</p>
            </div>
          </div>
          <button onClick={onCreateProduct}
            className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
            <Plus className="w-4 h-4" />Create Product
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left filter panel */}
        <aside className="w-64 bg-white border-r border-pebble flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-pebble">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search hierarchy..."
                className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Brand filter */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Filter className="w-3 h-3" />Brand
              </div>
              <div className="space-y-1">
                <button onClick={() => setBrandFilter('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!brandFilter ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth'}`}>
                  All Brands
                </button>
                {brands.map(b => (
                  <button key={b} onClick={() => setBrandFilter(b)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${brandFilter === b ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle filter */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Lifecycle State</div>
              <div className="space-y-1">
                <button onClick={() => setLcFilter('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!lcFilter ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth'}`}>
                  All States
                </button>
                {(['Created', 'In-use', 'Obsolete', 'Cancelled'] as LifecycleState[]).map(lc => {
                  const style = { Created: '#3B82F6', 'In-use': '#10B981', Obsolete: '#9CA3AF', Cancelled: '#EF4444' }[lc];
                  return (
                    <button key={lc} onClick={() => setLcFilter(lc)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${lcFilter === lc ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth'}`}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: style }} />
                      {lc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Hierarchy Levels</div>
              <div className="space-y-1.5">
                {(['Format', 'Subrange', 'Variant', 'Local Variant', 'SKU'] as const).map((type, i) => (
                  <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-0.5 rounded" style={{ background: `rgb(${Math.max(0, 0 + i * 30)}, ${Math.max(70, 100 + i * 20)}, ${Math.max(150, 200 - i * 10)})` }} />
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main tree area */}
        <main className="flex-1 overflow-y-auto p-6">
          {filteredTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <GitBranch className="w-12 h-12 text-gray-200 mb-3" />
              <div className="text-gray-400 text-sm">No products match your search criteria</div>
              <button onClick={() => { setSearch(''); setLcFilter(''); setBrandFilter(''); }}
                className="mt-3 text-xs text-sky hover:underline">Clear filters</button>
            </div>
          ) : (
            filteredTree.map((brand, i) => (
              <BrandSection
                key={brand.brandName}
                brand={brand}
                favorites={favorites}
                onProductClick={onProductClick}
                onFavoriteToggle={onFavoriteToggle}
                selectedId={selectedId}
                onSelect={setSelectedId}
                recentIds={recentIds}
                defaultExpanded={i === 0}
                onCreateProduct={onCreateProduct}
                onCreateVersion={setVersioningSource}
              />
            ))
          )}
        </main>
      </div>

      {versioningSource && (
        <ProductVersioningModal
          isOpen={true}
          onClose={() => setVersioningSource(null)}
          sourceProduct={versioningSource}
          allProducts={products}
          onVersionCreated={(newProduct, updatedSource) => {
            setVersioningSource(null);
            onProductClick(newProduct);
          }}
        />
      )}
    </div>
  );
}