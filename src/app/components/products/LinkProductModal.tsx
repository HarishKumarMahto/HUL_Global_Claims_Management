import { useState } from 'react';
import { X, Search, Package, Check } from 'lucide-react';
import { Project } from '../../types';
import { initialProducts, ProductItem } from './productData';

interface LinkProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (products: ProductItem[]) => void;
  onSwitchToCreate: () => void;
  project?: Project;
}

export default function LinkProductModal({ isOpen, onClose, onLink, onSwitchToCreate, project }: LinkProductModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  // In a real app we'd filter by the project's allowed BGs/Categories
  // "Project's BG + Categories restricts which products can be linked."
  const projectAllowedBGs = project?.businessGroup ? [project.businessGroup] : [];
  const projectAllowedCategories = project?.category ? [project.category] : [];

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.cucSpecNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Strict enforcement: product must match project BG and Category if they exist
    let matchesProjectConstraints = true;
    if (projectAllowedBGs.length > 0 && p.businessGroup) {
       matchesProjectConstraints = matchesProjectConstraints && projectAllowedBGs.includes(p.businessGroup);
    }
    if (projectAllowedCategories.length > 0 && p.category) {
       matchesProjectConstraints = matchesProjectConstraints && projectAllowedCategories.includes(p.category);
    }

    return matchesSearch && matchesProjectConstraints;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProductIds(next);
  };

  const handleLink = () => {
    const selected = initialProducts.filter(p => selectedProductIds.has(p.id));
    onLink(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden transition-all duration-300" style={{ minHeight: "600px", maxHeight: "90vh" }}>
        
        {/* Header matching CreateProductModal */}
        <div className="flex-shrink-0 border-b border-pebble bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-night">Add Product to Project</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Search and link existing products from the library
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-earth rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex px-6 gap-6">
            <button 
              className="pb-3 text-sm font-semibold border-b-2 border-sky text-sky transition-colors"
            >
              Search Library
            </button>
            <button 
              onClick={onSwitchToCreate}
              className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-500 hover:text-night transition-colors"
            >
              Create New Product
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-earth/30 p-6 flex flex-col overflow-hidden">
          <div className="relative mb-6 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by name, brand, or code..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-pebble rounded-xl focus:outline-none focus:ring-2 focus:ring-sky bg-white"
            />
          </div>

          <div className="flex-1 bg-white border border-pebble rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 p-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No products found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or create a new product</p>
                  {projectAllowedBGs.length > 0 && (
                    <p className="text-xs text-amber-600 mt-4 max-w-sm mx-auto bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Results are constrained to the Project's BG: <strong>{projectAllowedBGs[0]}</strong> and Category: <strong>{projectAllowedCategories[0]}</strong>.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => toggleSelection(p.id)}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${selectedProductIds.has(p.id) ? 'border-sky bg-sky/5' : 'border-transparent hover:bg-earth'}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedProductIds.has(p.id) ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                        {selectedProductIds.has(p.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-night truncate">{p.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="bg-earth px-2 py-0.5 rounded text-gray-600">{p.type}</span>
                          {p.businessGroup && (
                            <>
                              <span>•</span>
                              <span>{p.businessGroup}</span>
                            </>
                          )}
                          {p.category && (
                            <>
                              <span>•</span>
                              <span>{p.category}</span>
                            </>
                          )}
                          {p.cucSpecNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] bg-pale text-sky px-1.5 py-0.5 rounded">{p.cucSpecNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-5 border-t border-pebble bg-white flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">
            {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-night hover:bg-earth rounded-xl transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleLink}
              disabled={selectedProductIds.size === 0}
              className="px-5 py-2.5 text-sm font-semibold bg-sky text-white rounded-xl hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Link Selected
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
