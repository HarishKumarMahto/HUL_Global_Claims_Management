import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Settings, Package, Search, X, Check, Eye, EyeOff, MoreHorizontal, Trash2, Pencil, GripVertical } from 'lucide-react';
import CreateProductModal from '../products/CreateProductModal';
import LinkProductModal from '../products/LinkProductModal';
import { TableShell, TableToolbar, TableScrollArea, TablePagination, AvatarInitials } from '../ui/tableUtils';
import { Project } from '../../types';

interface Product {
  id: string;
  name: string;
  type: 'parent' | 'variant' | 'local_variant' | 'sku';
  bg: string;
  category: string;
  format: string;
  technology1: string;
  technology2: string;
  children?: Product[];
}

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Dove Intensive Repair Body Wash',
    type: 'parent',
    bg: 'Beauty & Personal Care',
    category: 'Skin Care',
    format: 'Body Wash',
    technology1: 'NutriumMoisture™',
    technology2: 'Pro-Ceramide',
    children: [
      {
        id: 'p1v1',
        name: 'Dove Intensive Repair Body Wash - Fragrance Free',
        type: 'variant',
        bg: 'Beauty & Personal Care',
        category: 'Skin Care',
        format: 'Body Wash',
        technology1: 'NutriumMoisture™',
        technology2: 'Pro-Ceramide',
        children: [
          {
            id: 'p1v1lv1',
            name: 'Dove IF BW UK Formulation',
            type: 'local_variant',
            bg: 'Beauty & Personal Care',
            category: 'Skin Care',
            format: 'Body Wash',
            technology1: 'NutriumMoisture™',
            technology2: 'Pro-Ceramide',
            children: [
              { id: 'p1v1s1', name: 'Dove IF BW 500ml UK', type: 'sku', bg: 'Beauty & Personal Care', category: 'Skin Care', format: '500ml', technology1: 'NutriumMoisture™', technology2: '' },
              { id: 'p1v1s2', name: 'Dove IF BW 250ml UK', type: 'sku', bg: 'Beauty & Personal Care', category: 'Skin Care', format: '250ml', technology1: 'NutriumMoisture™', technology2: '' },
            ]
          }
        ]
      },
      {
        id: 'p1v2',
        name: 'Dove Intensive Repair Body Wash - Sensitive',
        type: 'variant',
        bg: 'Beauty & Personal Care',
        category: 'Skin Care',
        format: 'Body Wash',
        technology1: 'NutriumMoisture™',
        technology2: 'Allantoin',
        children: [
          {
            id: 'p1v2lv1',
            name: 'Dove IR Sensitive BW DE Formulation',
            type: 'local_variant',
            bg: 'Beauty & Personal Care',
            category: 'Skin Care',
            format: 'Body Wash',
            technology1: 'NutriumMoisture™',
            technology2: 'Allantoin',
            children: [
              { id: 'p1v2s1', name: 'Dove IR Sensitive BW 500ml DE', type: 'sku', bg: 'Beauty & Personal Care', category: 'Skin Care', format: '500ml', technology1: 'NutriumMoisture™', technology2: 'Allantoin' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Dove Intensive Repair Body Lotion',
    type: 'parent',
    bg: 'Beauty & Personal Care',
    category: 'Skin Care',
    format: 'Body Lotion',
    technology1: 'NutriumMoisture™',
    technology2: 'Shea Butter',
    children: [
      {
        id: 'p2v1',
        name: 'Dove Intensive Repair Body Lotion - Original',
        type: 'variant',
        bg: 'Beauty & Personal Care',
        category: 'Skin Care',
        format: 'Body Lotion',
        technology1: 'NutriumMoisture™',
        technology2: 'Shea Butter',
        children: [
          {
            id: 'p2v1lv1',
            name: 'Dove IR Lotion US Formulation',
            type: 'local_variant',
            bg: 'Beauty & Personal Care',
            category: 'Skin Care',
            format: 'Body Lotion',
            technology1: 'NutriumMoisture™',
            technology2: 'Shea Butter',
            children: [
              { id: 'p2v1s1', name: 'Dove IR Lotion 400ml US', type: 'sku', bg: 'Beauty & Personal Care', category: 'Skin Care', format: '400ml', technology1: 'NutriumMoisture™', technology2: 'Shea Butter' },
            ]
          }
        ]
      }
    ]
  }
];

const TYPE_STYLES: Record<Product['type'], string> = {
  parent: 'bg-sky text-white',
  variant: 'bg-pale text-sky',
  local_variant: 'bg-amber-100 text-amber-800 border border-amber-200',
  sku: 'bg-earth text-gray-600'
};

const TYPE_LABELS: Record<Product['type'], string> = {
  parent: 'Format',
  variant: 'Variant',
  local_variant: 'Local Variant',
  sku: 'SKU'
};

interface ProductRowProps {
  product: Product;
  depth: number;
  columnOrder: Array<{ id: string; label: string; width: number; visible: boolean }>;
}

function ProductRow({ product, depth, columnOrder }: ProductRowProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0 || depth === 1);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);
  const hasChildren = product.children && product.children.length > 0;
  const indent = depth * 24;

  return (
    <>
      <tr className={`hover:bg-earth transition-colors border-b border-pebble ${product.type === 'parent' ? 'bg-white' : product.type === 'variant' ? 'bg-white' : product.type === 'local_variant' ? 'bg-white/80' : 'bg-earth/40'}`}>
        {columnOrder.map(col => {
          if (col.visible === false) return null;

          switch (col.id) {
            case 'name':
              return (
                <td key={col.id} className="px-4 py-3">
                  <div className="flex items-center gap-2" style={{ paddingLeft: indent }}>
                    {hasChildren ? (
                      <button onClick={() => setIsExpanded(!isExpanded)}
                        className="p-0.5 hover:bg-pebble rounded transition-colors text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className="w-5" />
                    )}
                    <span className={`text-sm ${product.type === 'parent' ? 'text-night font-medium' : product.type === 'variant' ? 'text-night font-medium' : product.type === 'local_variant' ? 'text-night' : 'text-gray-600'}`}>
                      {product.name}
                    </span>
                  </div>
                </td>
              );
            case 'type':
              return (
                <td key={col.id} className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${TYPE_STYLES[product.type]}`}>{TYPE_LABELS[product.type]}</span>
                </td>
              );
            case 'bg':
              return <td key={col.id} className="px-4 py-3 text-sm text-gray-600">{product.bg}</td>;
            case 'category':
              return <td key={col.id} className="px-4 py-3 text-sm text-gray-600">{product.category}</td>;
            case 'format':
              return <td key={col.id} className="px-4 py-3 text-sm text-gray-600">{product.format}</td>;
            case 'technology1':
              return <td key={col.id} className="px-4 py-3 text-sm text-gray-600">{product.technology1}</td>;
            case 'technology2':
              return <td key={col.id} className="px-4 py-3 text-sm text-gray-600">{product.technology2 || <span className="text-gray-300">—</span>}</td>;
            default:
              return null;
          }
        })}
        <td className="px-4 py-3 w-10 relative">
          <button onClick={() => setRowMenuOpen(!rowMenuOpen)}
            className="p-0.5 hover:bg-pebble rounded transition-colors text-gray-400">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {rowMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setRowMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-40 overflow-hidden">
                <button onClick={() => setRowMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />Edit
                </button>
                <div className="border-t border-pebble">
                  <button onClick={() => setRowMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Unlink
                  </button>
                </div>
              </div>
            </>
          )}
        </td>
      </tr>
      {isExpanded && product.children?.map(child => (
        <ProductRow key={child.id} product={child} depth={depth + 1} columnOrder={columnOrder} />
      ))}
    </>
  );
}

// Product column config (US-M1-91)
const BASE_COLUMNS = [
  { id: 'name', label: 'Product Name', width: 280, visible: true },
  { id: 'type', label: 'Type', width: 100, visible: true },
  { id: 'bg', label: 'Business Group', width: 180, visible: true },
  { id: 'category', label: 'Category', width: 140, visible: true },
  { id: 'format', label: 'Format', width: 120, visible: true },
  { id: 'technology1', label: 'Technology 1', width: 160, visible: true },
  { id: 'technology2', label: 'Technology 2', width: 160, visible: true },
];

interface LinkedProductsTabProps {
  project?: Project;
}

export default function LinkedProductsTab({ project }: LinkedProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [colConfigOpen, setColConfigOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'none' | 'search' | 'create'>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

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

  const filtered = searchQuery
    ? mockProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockProducts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const isColVisible = (id: string) => columnOrder.find(c => c.id === id)?.visible !== false;
  const toggleColumn = (id: string) => setColumnOrder(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-night">Linked Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">Product hierarchy associated with this claims project</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalMode('search')}
            className="flex items-center gap-2 px-3 py-2 border border-sky text-sky rounded-lg text-sm hover:bg-pale transition-colors">
            <Plus className="w-4 h-4" />Add Product
          </button>
          {/* <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
            <Plus className="w-4 h-4" />Create Product
          </button> */}
        </div>
      </div>

      {/* Table shell — same pattern as Projects + Products tables */}
      <div className="flex-1 overflow-hidden">
        <TableShell>
          {/* Toolbar bar */}
          <TableToolbar>
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative max-w-xs flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              {/* Legend removed per user request */}
            </div>
            {/* Column config */}
            <div className="relative">
              <button onClick={() => setColConfigOpen(!colConfigOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors border ${colConfigOpen ? 'bg-sky text-white border-sky' : 'text-gray-500 hover:bg-earth border-pebble'}`}>
                <Settings className="w-3.5 h-3.5" />Columns
              </button>
              {colConfigOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setColConfigOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-56 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-pebble text-xs text-gray-500 uppercase tracking-wide" style={{ fontWeight: 600 }}>Show / Hide Columns</div>
                    <div className="p-2">
                      {columnOrder.filter(c => c.id !== 'name').map(col => (
                        <button key={col.id} onClick={() => toggleColumn(col.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth text-left transition-colors">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${col.visible ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                            {col.visible && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-sm text-night">{col.label}</span>
                          <span className="ml-auto">{col.visible ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}</span>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-pebble">
                      <button onClick={() => setColConfigOpen(false)} className="w-full text-center text-xs text-sky hover:underline">Done</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TableToolbar>

          {/* Scrollable table */}
          <TableScrollArea>
            <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
              <thead className="bg-earth sticky top-0 z-10">
                <tr className="border-b border-pebble">
                  {columnOrder.map((col, i) =>
                    col.visible !== false ? (
                      <th
                        key={col.id}
                        draggable
                        onDragStart={() => handleColDragStart(i)}
                        onDragOver={(e) => handleColDragOver(e, i)}
                        onDragEnd={handleColDragEnd}
                        style={{ width: col.width, minWidth: col.width }}
                        className={`px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide cursor-move select-none transition-colors ${
                          draggedCol === i ? 'bg-pale opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          {col.label}
                        </div>
                      </th>
                    ) : null
                  )}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble">
                {pagedItems.map(product => (
                  <ProductRow key={product.id} product={product} depth={0} columnOrder={columnOrder} />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No products found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableScrollArea>

          {/* Footer info bar */}
           <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filtered.length}
            startIndex={startIndex}
            itemsPerPage={PAGE_SIZE}
            label="products"
            onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            onPageSelect={setCurrentPage}
          />
        </TableShell>
      </div>
      <LinkProductModal
        isOpen={modalMode === 'search'}
        onClose={() => setModalMode('none')}
        onLink={() => setModalMode('none')} // Mock linking action
        onSwitchToCreate={() => setModalMode('create')}
        project={project}
      />
      <CreateProductModal
        isOpen={modalMode === 'create'}
        onClose={() => setModalMode('none')}
        onCreate={() => setModalMode('none')}
        onSwitchToSearch={() => setModalMode('search')}
        project={project}
      />
    </div>
  );
}