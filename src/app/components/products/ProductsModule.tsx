import { useState } from 'react';
import { ProductItem, initialProducts, ProductType } from './productData';
import ProductsLandingPage from './ProductsLandingPage';

type ProductCreationAction = ProductType | 'Product';
import ProductDetailsPage, { ProductSection } from './ProductDetailsPage';
import ProductHierarchyPage from './ProductHierarchyPage';
import CreateProductModal from './CreateProductModal';
import ProductSavedViewsPanel, { ProductSavedView } from './ProductSavedViewsPanel';
import ProductCreationScreen from './ProductCreationScreen';
import SKUCreationScreen from './SKUCreationScreen';

export type ProductModuleView = 'landing' | 'hierarchy' | 'detail' | 'productCreation' | 'skuCreation';

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

  // Screen-based flow states
  const [skuCreationSource, setSkuCreationSource] = useState<'products' | 'productCreation'>('products');
  const [recentLocalVariants, setRecentLocalVariants] = useState<Array<{ id: string; name: string; variant: string; geography: string }>>([]);

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

  // Screen-based flow handlers
  const handleOpenProductCreation = (type?: ProductCreationAction) => {
    if (type === 'Product') {
      // Open the new screen-based product creation form
      setSkuCreationSource('products');
      onViewChange('productCreation');
    } else if (type === 'SKU') {
      // Open the SKU creation screen
      handleOpenSKUCreation('products');
    } else {
      // For Format, Technology, etc. - use the old modal (can be updated later)
      const actualType = typeof type === 'string' ? (type as ProductType) : undefined;
      setLocalCreateType(actualType);
      setLocalCreateModal(true);
    }
  };

  const handleOpenSKUCreation = (source: 'products' | 'productCreation' = 'products') => {
    setSkuCreationSource(source);
    onViewChange('skuCreation');
  };

  const handleBackFromProductCreation = () => {
    onViewChange('landing');
  };

  const handleBackFromSKUCreation = () => {
    if (skuCreationSource === 'productCreation') {
      onViewChange('productCreation');
    } else {
      onViewChange('landing');
    }
  };

  const handleProductCreated = (products: any[]) => {
    // Process and add products to state
    const itemsToAdd = Array.isArray(products) ? products : [products];
    const newItems: ProductItem[] = [];
    
    itemsToAdd.forEach((item, idx) => {
      const id = item.id || `prod-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
      const productId = item.productId || `PROD-${new Date().getFullYear()}-${String(newItems.length + 1).padStart(3, '0')}`;
      const full: ProductItem = {
        ...item,
        id,
        productId,
        lifecycleState: 'Created',
        childCount: 0,
        claimsCount: 0,
        projectsCount: 0,
        geographyCount: item.geographies?.length || 0,
        lastModified: new Date().toISOString().split('T')[0],
      };
      newItems.push(full);
    });

    setProducts(prev => [...newItems, ...prev]);

    // Extract local variants from the created products for SKU creation
    const localVariants = newItems
      .filter(item => item.type === 'Local Variant')
      .map((item, idx) => ({
        id: item.id,
        name: item.name,
        variant: item.parentName || '',
        geography: item.geographies?.[0] || 'Global'
      }));
    setRecentLocalVariants(localVariants);

    // Go back to landing
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

  if (activeProductView === 'productCreation') {
    return (
      <ProductCreationScreen
        onBack={handleBackFromProductCreation}
        onCreate={handleProductCreated}
        onCreateSKU={() => handleOpenSKUCreation('productCreation')}
        onCreateClaim={() => {
          // TODO: Navigate to ClaimCreationScreen
          handleBackFromProductCreation();
        }}
      />
    );
  }

  if (activeProductView === 'skuCreation') {
    return (
      <SKUCreationScreen
        onBack={handleBackFromSKUCreation}
        onCreate={(skus) => {
          // TODO: Handle SKU creation
          console.log('SKUs created:', skus);
          handleBackFromSKUCreation();
        }}
        recentLocalVariants={recentLocalVariants}
        sourceContext={skuCreationSource}
      />
    );
  }

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
        onCreateProduct={handleOpenProductCreation}
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
