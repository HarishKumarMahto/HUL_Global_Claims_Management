import { useState } from 'react';
import { ProductItem, initialProducts, ProductType } from './productData';
import ProductsLandingPage from './ProductsLandingPage';
import ProductDetailsPage, { ProductSection } from './ProductDetailsPage';
import ProductHierarchyPage from './ProductHierarchyPage';
import CreateProductModal from './CreateProductModal';
import ProductSavedViewsPanel, { ProductSavedView } from './ProductSavedViewsPanel';

export type ProductModuleView = 'landing' | 'hierarchy' | 'detail';

interface Props {
  activeProductView: ProductModuleView;
  onViewChange: (view: ProductModuleView) => void;
  selectedProduct: ProductItem | null;
  onProductSelect: (p: ProductItem | null) => void;
  productListView: string;
  onProductListViewChange: (view: string) => void;
  // Section nav for product detail (passed from LeftNavigation)
  activeProductSection: ProductSection;
  onProductSectionChange: (s: ProductSection) => void;
  // Global "New Product" trigger
  showCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  // Saved Views panel open trigger from left nav
  showSavedViewsPanel?: boolean;
  onCloseSavedViewsPanel?: () => void;
  // Dynamic top-level synchronized Saved Views props
  savedViews?: ProductSavedView[];
  onSavedViewsChange?: (views: ProductSavedView[]) => void;
  appliedView?: ProductSavedView | null;
  onApplyView?: (view: ProductSavedView) => void;
  externalSearchQuery?: string;
}

export default function ProductsModule({
  activeProductView, onViewChange, selectedProduct, onProductSelect, productListView,
  onProductListViewChange,
  activeProductSection, onProductSectionChange,
  showCreateModal = false, onCloseCreateModal,
  showSavedViewsPanel = false, onCloseSavedViewsPanel,
  savedViews: propsSavedViews,
  onSavedViewsChange: propsOnSavedViewsChange,
  appliedView: propsAppliedView,
  onApplyView: propsOnApplyView,
  externalSearchQuery,
}: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['fmt-1', 'var-1', 'tech-1', 'fmt-3']));
  const [recentIds, setRecentIds] = useState<string[]>(['var-1', 'sub-1', 'fmt-3']);
  const [localCreateModal, setLocalCreateModal] = useState(false);
  const [localCreateType, setLocalCreateType] = useState<ProductType | undefined>(undefined);
  const [localSavedViews, setLocalSavedViews] = useState<ProductSavedView[]>([]);
  const [productEditMode, setProductEditMode] = useState(false);

  // External state applied from a saved view
  const [localAppliedView, setLocalAppliedView] = useState<ProductSavedView | null>(null);

  const savedViews = propsSavedViews !== undefined ? propsSavedViews : localSavedViews;
  const setSavedViews = propsOnSavedViewsChange !== undefined ? propsOnSavedViewsChange : setLocalSavedViews;

  const appliedView = propsAppliedView !== undefined ? propsAppliedView : localAppliedView;
  const setAppliedView = propsOnApplyView !== undefined ? propsOnApplyView : setLocalAppliedView;

  const isCreateOpen = showCreateModal || localCreateModal;
  const handleCloseCreate = () => {
    setLocalCreateModal(false);
    setLocalCreateType(undefined);
    onCloseCreateModal?.();
  };

  const handleOpenCreate = (type?: ProductType) => {
    const actualType = typeof type === 'string' ? type : undefined;
    setLocalCreateType(actualType);
    setLocalCreateModal(true);
  };

  const handleProductClick = (p: ProductItem, editMode: boolean = false) => {
    setProducts(prev => prev.map(item => item.id === p.id ? p : item));
    onProductSelect(p);
    onViewChange('detail');
    onProductSectionChange('Product Details');
    setProductEditMode(editMode);
    setRecentIds(prev => [p.id, ...prev.filter(id => id !== p.id)].slice(0, 10));
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBack = () => {
    onProductSelect(null);
    onViewChange('landing');
  };

  const handleCreateProduct = (newProduct: Omit<ProductItem, 'id' | 'productId' | 'lifecycleState' | 'childCount' | 'claimsCount' | 'projectsCount' | 'geographyCount' | 'lastModified'>) => {
    const id = `prod-${Date.now()}`;
    const productId = `PROD-${new Date().getFullYear()}-${String(products.length + 1).padStart(3, '0')}`;
    const full: ProductItem = {
      ...newProduct,
      id,
      productId,
      lifecycleState: 'Created',
      childCount: 0,
      claimsCount: 0,
      projectsCount: 0,
      geographyCount: newProduct.geographies?.length || 0,
      lastModified: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [full, ...prev]);
    handleCloseCreate();
    handleProductClick(full);
  };

  // Apply a saved view — push external state down into the landing page
  const handleApplyView = (view: ProductSavedView) => {
    if (propsOnApplyView) {
      propsOnApplyView(view);
    } else {
      onProductListViewChange(`Saved: ${view.name}`);
      setLocalAppliedView(view);
      onViewChange('landing');
      onCloseSavedViewsPanel?.();
    }
  };

  if (activeProductView === 'detail' && selectedProduct) {
    return (
      <>
        <ProductDetailsPage
          product={selectedProduct}
          allProducts={products}
          onBack={handleBack}
          onProductChange={handleProductClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          activeSection={activeProductSection}
          onSectionChange={onProductSectionChange}
          initialEditMode={productEditMode}
        />
        {isCreateOpen && (
          <CreateProductModal isOpen={isCreateOpen} onClose={handleCloseCreate} onCreate={handleCreateProduct} preselectedType={localCreateType} />
        )}
        <ProductSavedViewsPanel
          isOpen={showSavedViewsPanel}
          onClose={() => onCloseSavedViewsPanel?.()}
          currentColumnOrder={appliedView?.columnOrder ?? []}
          currentFilters={appliedView?.filters ?? []}
          currentSortCol={appliedView?.sortCol ?? null}
          currentSortDir={appliedView?.sortDir ?? null}
          onApplyView={handleApplyView}
          savedViews={savedViews}
          onSavedViewsChange={setSavedViews}
        />
      </>
    );
  }

  if (activeProductView === 'hierarchy') {
    return (
      <>
        <ProductHierarchyPage
          products={products}
          favorites={favorites}
          onProductClick={handleProductClick}
          onFavoriteToggle={handleFavoriteToggle}
          onBack={handleBack}
          onCreateProduct={handleOpenCreate}
        />
        {isCreateOpen && (
          <CreateProductModal isOpen={isCreateOpen} onClose={handleCloseCreate} onCreate={handleCreateProduct} preselectedType={localCreateType} />
        )}
        <ProductSavedViewsPanel
          isOpen={showSavedViewsPanel}
          onClose={() => onCloseSavedViewsPanel?.()}
          currentColumnOrder={appliedView?.columnOrder ?? []}
          currentFilters={appliedView?.filters ?? []}
          currentSortCol={appliedView?.sortCol ?? null}
          currentSortDir={appliedView?.sortDir ?? null}
          onApplyView={handleApplyView}
          savedViews={savedViews}
          onSavedViewsChange={setSavedViews}
        />
      </>
    );
  }

  return (
    <>
      <ProductsLandingPage
        products={products}
        activeView={productListView}
        favorites={favorites}
        recentIds={recentIds}
        onProductClick={handleProductClick}
        onFavoriteToggle={handleFavoriteToggle}
        onCreateProduct={handleOpenCreate}
        onViewHierarchy={() => onViewChange('hierarchy')}
        // expose table state up for saved views
        externalFilters={appliedView?.filters}
        externalColumnOrder={appliedView?.columnOrder}
        externalSortCol={appliedView?.sortCol ?? null}
        externalSortDir={appliedView?.sortDir ?? null}
        savedViews={savedViews}
        onSavedViewsChange={setSavedViews}
        onApplyView={handleApplyView}
        externalSearchQuery={externalSearchQuery}
      />
      {isCreateOpen && (
        <CreateProductModal isOpen={isCreateOpen} onClose={handleCloseCreate} onCreate={handleCreateProduct} preselectedType={localCreateType} />
      )}
      <ProductSavedViewsPanel
        isOpen={showSavedViewsPanel}
        onClose={() => onCloseSavedViewsPanel?.()}
        currentColumnOrder={appliedView?.columnOrder ?? []}
        currentFilters={appliedView?.filters ?? []}
        currentSortCol={appliedView?.sortCol ?? null}
        currentSortDir={appliedView?.sortDir ?? null}
        onApplyView={handleApplyView}
        savedViews={savedViews}
        onSavedViewsChange={setSavedViews}
      />
    </>
  );
}
