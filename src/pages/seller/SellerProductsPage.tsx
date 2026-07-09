import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCcw,
  Shirt,
  Store,
  Power,
  RotateCcw,
  Upload,
  Pencil,
  Layers3,
} from 'lucide-react';
import { toast } from 'sonner';

import { getMyStores } from '../../api/store.api';
import { uploadProductImage } from '../../api/upload.api';
import {
  addProductImage,
  addProductVariant,
  createCategory,
  activateCategory,
  deactivateCategory,
  updateCategory,
  createProduct,
  deactivateProduct,
  activateProduct,
  updateProduct,
  getCategoriesByStore,
  getProductsByStore
} from '../../api/product.api';

import type { Store as StoreType } from '../../types/store.types';
import type { Category, Product } from '../../types/product.types';

import { assetUrl } from '../../utils/assets';
import { getErrorMessage } from '../../utils/getErrorMessage';

import { SellerProductTabs } from '../../components/seller/SellerProductTabs';
import type { ProductTab } from '../../components/seller/SellerProductTabs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ProductEditDialog } from '../../components/seller/ProductEditDialog';
import type { UpdateProductPayload } from '../../api/product.api';
import { ProductVariantsDialog } from '../../components/seller/ProductVariantsDialog';
import type { UpdateCategoryPayload } from '../../api/product.api';
import { CategoryEditDialog } from '../../components/seller/CategoryEditDialog';

export function SellerProductsPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submittingVariant, setSubmittingVariant] = useState(false);
  const [productActionLoading, setProductActionLoading] = useState('');


  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<ProductTab>('categories');

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [productImage, setProductImage] = useState<File | null>(null);
  const [productCategory, setProductCategory] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [requiresVariants, setRequiresVariants] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductLoading, setEditingProductLoading] = useState(false);
  const [variantManagerProduct, setVariantManagerProduct] = useState<Product | null>(null);


  const [variantProductId, setVariantProductId] = useState('');
  const [variantSku, setVariantSku] = useState('');
  const [variantSize, setVariantSize] = useState('');
  const [variantColor, setVariantColor] = useState('');
  const [variantDescription, setVariantDescription] = useState('');
  const [variantStock, setVariantStock] = useState('');
  const [variantExtraPrice, setVariantExtraPrice] = useState('0');

  const [confirmProductAction, setConfirmProductAction] = useState<{
    open: boolean;
    type: 'deactivate' | 'activate';
    product: Product | null;
  }>({
    open: false,
    type: 'deactivate',
    product: null
  });

  const [categoryActionLoading, setCategoryActionLoading] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryLoading, setEditingCategoryLoading] = useState(false);

  const [confirmCategoryAction, setConfirmCategoryAction] = useState<{
    open: boolean;
    type: 'deactivate' | 'activate';
    category: Category | null;
  }>({
    open: false,
    type: 'deactivate',
    category: null
  });


  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadCatalogData(selectedStoreId);
    }
  }, [selectedStoreId]);

  async function loadStores() {
    try {
      setLoading(true);
      setError('');

      const data = await getMyStores();
      const activeStores = data.filter((store) => store.estado === 'ACTIVA');

      setStores(activeStores);

      if (activeStores.length > 0) {
        setSelectedStoreId(activeStores[0].id_tienda);
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudieron cargar las tiendas.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalogData(storeId: string) {
    try {
      setError('');

      const [categoriesData, productsData] = await Promise.all([
        getCategoriesByStore(storeId),
        getProductsByStore(storeId)
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo cargar el catálogo de la tienda.'
      );

      setError(message);
      toast.error(message);
    }
  }

  async function handleCreateCategory(event: FormEvent) {
    event.preventDefault();

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setSubmittingCategory(true);
      setMessage('');
      setError('');

      await createCategory({
        id_tienda: selectedStoreId,
        nombre: categoryName,
        descripcion: categoryDescription || undefined
      });

      setCategoryName('');
      setCategoryDescription('');

      setMessage('Categoría creada correctamente.');
      toast.success('Categoría creada correctamente.');

      await loadCatalogData(selectedStoreId);

      setActiveTab('products');
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo crear la categoría.');

      setError(message);
      toast.error(message);
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function handleCreateProduct(event: FormEvent) {
    event.preventDefault();

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setSubmittingProduct(true);
      setMessage('');
      setError('');

      let imageUrl: string | undefined;

      if (productImage) {
        imageUrl = await uploadProductImage(productImage);
      }

      const productNeedsVariants = requiresVariants;

      const createdProduct = await createProduct({
        id_tienda: selectedStoreId,
        id_categoria: productCategory || undefined,
        codigo_producto: productCode || undefined,
        nombre: productName,
        descripcion: productDescription || undefined,
        precio: Number(productPrice),
        stock_general: requiresVariants ? 0 : Number(productStock || 0),
        requiere_variantes: requiresVariants,
        destacado: featured,
        imagen_principal_url: imageUrl
      });

      setProductImage(null);
      setProductCategory('');
      setProductCode('');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductStock('');
      setRequiresVariants(false);
      setFeatured(false);

      setMessage('Producto creado correctamente.');
      toast.success('Producto creado correctamente.');

      await loadCatalogData(selectedStoreId);

      if (productNeedsVariants) {
        setVariantProductId(createdProduct.id_producto);
        setActiveTab('variants');
      } else {
        setActiveTab('list');
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo crear el producto. Revisa los datos.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setSubmittingProduct(false);
    }
  }

  async function handleCreateVariant(event: FormEvent) {
    event.preventDefault();

    if (!variantProductId) {
      const message = 'Selecciona un producto que requiera variantes.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setSubmittingVariant(true);
      setMessage('');
      setError('');

      await addProductVariant(variantProductId, {
        sku: variantSku || undefined,
        talla: variantSize || undefined,
        color: variantColor || undefined,
        descripcion_variante: variantDescription || undefined,
        stock: Number(variantStock),
        precio_adicional: Number(variantExtraPrice || 0)
      });

      setVariantSku('');
      setVariantSize('');
      setVariantColor('');
      setVariantDescription('');
      setVariantStock('');
      setVariantExtraPrice('0');

      setMessage('Variante agregada correctamente.');
      toast.success('Variante agregada correctamente.');

      await loadCatalogData(selectedStoreId);

      setActiveTab('list');
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo agregar la variante.');

      setError(message);
      toast.error(message);
    } finally {
      setSubmittingVariant(false);
    }
  }


  function openDeactivateProductDialog(product: Product) {
    setConfirmProductAction({
      open: true,
      type: 'deactivate',
      product
    });
  }

  function openActivateProductDialog(product: Product) {
    setConfirmProductAction({
      open: true,
      type: 'activate',
      product
    });
  }

  function closeProductDialog() {
    if (productActionLoading) return;

    setConfirmProductAction({
      open: false,
      type: 'deactivate',
      product: null
    });
  }

  async function handleConfirmProductAction() {
    const product = confirmProductAction.product;

    if (!product) return;

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setProductActionLoading(product.id_producto);
      setMessage('');
      setError('');

      if (confirmProductAction.type === 'deactivate') {
        await deactivateProduct(product.id_producto);

        setMessage('Producto desactivado correctamente.');
        toast.success('Producto desactivado correctamente.');
      } else {
        await activateProduct(product.id_producto);

        setMessage('Producto reactivado correctamente.');
        toast.success('Producto reactivado correctamente.');
      }

      await loadCatalogData(selectedStoreId);

      setConfirmProductAction({
        open: false,
        type: 'deactivate',
        product: null
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        confirmProductAction.type === 'deactivate'
          ? 'No se pudo desactivar el producto.'
          : 'No se pudo reactivar el producto.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setProductActionLoading('');
    }
  }



  async function handleAddExtraImage(productId: string, file: File | null) {
    if (!file) return;

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setProductActionLoading(productId);
      setMessage('');
      setError('');

      const imageUrl = await uploadProductImage(file);

      await addProductImage(productId, {
        url_imagen: imageUrl,
        es_principal: false,
        orden: 2
      });

      setMessage('Imagen agregada correctamente.');
      toast.success('Imagen agregada correctamente.');

      await loadCatalogData(selectedStoreId);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo agregar la imagen al producto.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setProductActionLoading('');
    }
  }

  function openEditProductDialog(product: Product) {
    setEditingProduct(product);
  }

  function closeEditProductDialog() {
    if (editingProductLoading) return;
    setEditingProduct(null);
  }

  async function handleUpdateProduct(payload: UpdateProductPayload) {
    if (!editingProduct) return;

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setEditingProductLoading(true);
      setMessage('');
      setError('');

      await updateProduct(editingProduct.id_producto, payload);

      setMessage('Producto actualizado correctamente.');
      toast.success('Producto actualizado correctamente.');

      await loadCatalogData(selectedStoreId);

      setEditingProduct(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo actualizar el producto.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setEditingProductLoading(false);
    }
  }



  function handleProductImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setProductImage(file);
  }

  const productsWithVariants = products.filter(
    (product) => product.requiere_variantes
  );

  const activeCategories = categories.filter(
    (category) => category.estado === 'ACTIVO'
  );

  function openVariantManager(product: Product) {
    setVariantManagerProduct(product);
  }

  function closeVariantManager() {
    setVariantManagerProduct(null);
  }

  function openEditCategoryDialog(category: Category) {
    setEditingCategory(category);
  }

  function closeEditCategoryDialog() {
    if (editingCategoryLoading) return;
    setEditingCategory(null);
  }

  async function handleUpdateCategory(payload: UpdateCategoryPayload) {
    if (!editingCategory) return;

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setEditingCategoryLoading(true);
      setMessage('');
      setError('');

      await updateCategory(editingCategory.id_categoria, payload);

      setMessage('Categoría actualizada correctamente.');
      toast.success('Categoría actualizada correctamente.');

      await loadCatalogData(selectedStoreId);

      setEditingCategory(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No se pudo actualizar la categoría.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setEditingCategoryLoading(false);
    }
  }

  function openDeactivateCategoryDialog(category: Category) {
    setConfirmCategoryAction({
      open: true,
      type: 'deactivate',
      category
    });
  }

  function openActivateCategoryDialog(category: Category) {
    setConfirmCategoryAction({
      open: true,
      type: 'activate',
      category
    });
  }

  function closeCategoryDialog() {
    if (categoryActionLoading) return;

    setConfirmCategoryAction({
      open: false,
      type: 'deactivate',
      category: null
    });
  }

  async function handleConfirmCategoryAction() {
    const category = confirmCategoryAction.category;

    if (!category) return;

    if (!selectedStoreId) {
      const message = 'Primero debes seleccionar una tienda activa.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setCategoryActionLoading(category.id_categoria);
      setMessage('');
      setError('');

      if (confirmCategoryAction.type === 'deactivate') {
        await deactivateCategory(category.id_categoria);

        setMessage('Categoría desactivada correctamente.');
        toast.success('Categoría desactivada correctamente.');
      } else {
        await activateCategory(category.id_categoria);

        setMessage('Categoría reactivada correctamente.');
        toast.success('Categoría reactivada correctamente.');
      }

      await loadCatalogData(selectedStoreId);

      setConfirmCategoryAction({
        open: false,
        type: 'deactivate',
        category: null
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        confirmCategoryAction.type === 'deactivate'
          ? 'No se pudo desactivar la categoría.'
          : 'No se pudo reactivar la categoría.'
      );

      setError(message);
      toast.error(message);
    } finally {
      setCategoryActionLoading('');
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos del vendedor</h1>
          <p className="mt-2 text-slate-600">
            Registra categorías, productos, imágenes y variantes como tallas o colores.
          </p>
        </div>

        <button
          onClick={() => selectedStoreId && loadCatalogData(selectedStoreId)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          Cargando información...
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Store className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold">No tienes tiendas activas</h2>
          <p className="mt-2 text-slate-600">
            Primero el administrador debe aprobar tu tienda para que puedas registrar productos.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-sm font-medium">
              Seleccionar tienda activa
            </label>

            <select
              value={selectedStoreId}
              onChange={(event) => {
                setSelectedStoreId(event.target.value);
                setVariantProductId('');
                setActiveTab('categories');
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            >
              {stores.map((store) => (
                <option key={store.id_tienda} value={store.id_tienda}>
                  {store.nombre}
                </option>
              ))}
            </select>
          </div>

          <SellerProductTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            categoriesCount={categories.length}
            productsCount={products.length}
          />

          <div>
            {activeTab === 'categories' && (
              <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
                <form
                  onSubmit={handleCreateCategory}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white">
                      <Plus className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">Crear categoría</h2>
                      <p className="text-sm text-slate-600">
                        Ejemplo: Ropa, Perfumes, Calzado.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="Ropa"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Descripción</label>
                      <textarea
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="Productos relacionados con ropa..."
                      />
                    </div>

                    <button
                      disabled={submittingCategory}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {submittingCategory && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Crear categoría
                    </button>
                  </div>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white">
                      <Layers3 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">Categorías registradas</h2>
                      <p className="text-sm text-slate-600">
                        Edita, desactiva o reactiva categorías.
                      </p>
                    </div>
                  </div>

                  {categories.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 p-8 text-center text-slate-600">
                      Aún no hay categorías registradas.
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4">
                      {categories.map((category) => (
                        <CategoryCard
                          key={category.id_categoria}
                          category={category}
                          loading={categoryActionLoading === category.id_categoria}
                          onEdit={() => openEditCategoryDialog(category)}
                          onDeactivate={() => openDeactivateCategoryDialog(category)}
                          onActivate={() => openActivateCategoryDialog(category)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <form
                onSubmit={handleCreateProduct}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    <PackagePlus className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Crear producto</h2>
                    <p className="text-sm text-slate-600">
                      Registra productos simples o productos con tallas.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                    >
                      <option value="">Sin categoría</option>
                      {activeCategories.map((category) => (
                        <option
                          key={category.id_categoria}
                          value={category.id_categoria}
                        >
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Código</label>
                    <input
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      placeholder="PROD-001"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      placeholder="Perfume Invictus"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      placeholder="Descripción del producto..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Precio</label>
                    <input
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Stock general</label>
                    <input
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      type="number"
                      min="0"
                      disabled={requiresVariants}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 disabled:bg-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mt-1 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600 hover:bg-slate-50">
                      <ImagePlus className="h-5 w-5" />
                      <span>
                        {productImage
                          ? productImage.name
                          : 'Seleccionar imagen del producto'}
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleProductImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      checked={requiresVariants}
                      onChange={(e) => setRequiresVariants(e.target.checked)}
                      type="checkbox"
                      className="h-4 w-4"
                    />

                    <span className="text-sm">
                      Este producto requiere variantes, tallas o colores
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      type="checkbox"
                      className="h-4 w-4"
                    />

                    <span className="text-sm">Producto destacado</span>
                  </label>

                  <button
                    disabled={submittingProduct}
                    className="md:col-span-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {submittingProduct && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Crear producto
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'variants' && (
              <form
                onSubmit={handleCreateVariant}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    <Shirt className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Agregar variante</h2>
                    <p className="text-sm text-slate-600">
                      Para ropa o calzado: talla, color y stock.
                    </p>
                  </div>
                </div>

                {productsWithVariants.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                    No tienes productos que requieran variantes. Primero crea un
                    producto y marca la opción “requiere variantes, tallas o colores”.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Producto</label>
                      <select
                        value={variantProductId}
                        onChange={(e) => setVariantProductId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      >
                        <option value="">Seleccionar producto</option>
                        {productsWithVariants.map((product) => (
                          <option
                            key={product.id_producto}
                            value={product.id_producto}
                          >
                            {product.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Talla</label>
                        <input
                          value={variantSize}
                          onChange={(e) => setVariantSize(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                          placeholder="M, L, 40..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Color</label>
                        <input
                          value={variantColor}
                          onChange={(e) => setVariantColor(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                          placeholder="Negro"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">SKU</label>
                      <input
                        value={variantSku}
                        onChange={(e) => setVariantSku(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="CAM-001-M-NEGRO"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Descripción</label>
                      <input
                        value={variantDescription}
                        onChange={(e) => setVariantDescription(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="Talla M color negro"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Stock</label>
                        <input
                          value={variantStock}
                          onChange={(e) => setVariantStock(e.target.value)}
                          type="number"
                          min="0"
                          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Precio adicional
                        </label>
                        <input
                          value={variantExtraPrice}
                          onChange={(e) => setVariantExtraPrice(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      disabled={submittingVariant}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {submittingVariant && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Agregar variante
                    </button>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'list' && (
              <div>
                <h2 className="mb-4 text-xl font-bold">
                  Productos registrados
                </h2>

                {products.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    Aún no hay productos registrados.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id_producto}
                        product={product}
                        loading={productActionLoading === product.id_producto}
                        onEdit={() => openEditProductDialog(product)}
                        onDeactivate={() => openDeactivateProductDialog(product)}
                        onActivate={() => openActivateProductDialog(product)}
                        onAddImage={(file) => handleAddExtraImage(product.id_producto, file)}
                        onManageVariants={() => openVariantManager(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <CategoryEditDialog
        open={!!editingCategory}
        category={editingCategory}
        categories={categories}
        loading={editingCategoryLoading}
        onClose={closeEditCategoryDialog}
        onSubmit={handleUpdateCategory}
      />

      <ConfirmDialog
        open={confirmCategoryAction.open}
        title={
          confirmCategoryAction.type === 'deactivate'
            ? '¿Desactivar categoría?'
            : '¿Reactivar categoría?'
        }
        description={
          confirmCategoryAction.type === 'deactivate'
            ? `La categoría "${confirmCategoryAction.category?.nombre}" dejará de estar disponible para nuevos productos.`
            : `La categoría "${confirmCategoryAction.category?.nombre}" volverá a estar disponible para nuevos productos.`
        }
        confirmText={
          confirmCategoryAction.type === 'deactivate'
            ? 'Sí, desactivar'
            : 'Sí, reactivar'
        }
        variant={
          confirmCategoryAction.type === 'deactivate'
            ? 'danger'
            : 'success'
        }
        loading={
          !!confirmCategoryAction.category &&
          categoryActionLoading === confirmCategoryAction.category.id_categoria
        }
        onConfirm={handleConfirmCategoryAction}
        onClose={closeCategoryDialog}
      />

      <ProductVariantsDialog
        open={!!variantManagerProduct}
        product={variantManagerProduct}
        onClose={closeVariantManager}
        onChanged={() => selectedStoreId && loadCatalogData(selectedStoreId)}
      />
      <ProductEditDialog
        open={!!editingProduct}
        product={editingProduct}
        categories={categories}
        loading={editingProductLoading}
        onClose={closeEditProductDialog}
        onSubmit={handleUpdateProduct}
      />
      <ConfirmDialog
        open={confirmProductAction.open}
        title={
          confirmProductAction.type === 'deactivate'
            ? '¿Desactivar producto?'
            : '¿Reactivar producto?'
        }
        description={
          confirmProductAction.type === 'deactivate'
            ? `El producto "${confirmProductAction.product?.nombre}" dejará de aparecer en la tienda pública. Podrás reactivarlo después si lo necesitas.`
            : `El producto "${confirmProductAction.product?.nombre}" volverá a mostrarse en la tienda pública.`
        }
        confirmText={
          confirmProductAction.type === 'deactivate'
            ? 'Sí, desactivar'
            : 'Sí, reactivar'
        }
        variant={
          confirmProductAction.type === 'deactivate'
            ? 'danger'
            : 'success'
        }
        loading={
          !!confirmProductAction.product &&
          productActionLoading === confirmProductAction.product.id_producto
        }
        onConfirm={handleConfirmProductAction}
        onClose={closeProductDialog}
      />
    </section>
  );
}
interface CategoryCardProps {
  category: Category;
  loading: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

function CategoryCard({
  category,
  loading,
  onEdit,
  onDeactivate,
  onActivate
}: CategoryCardProps) {
  const isInactive =
    category.estado === 'INACTIVO' || category.estado === 'ELIMINADO';

  return (
    <article
      className={`rounded-2xl border p-4 ${
        isInactive
          ? 'border-red-200 bg-red-50/40 opacity-80'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{category.nombre}</h3>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isInactive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {category.estado}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Padre: {category.categoria_padre || 'Sin categoría padre'}
          </p>

          {category.descripcion && (
            <p className="mt-2 text-sm text-slate-600">
              {category.descripcion}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>

          {isInactive ? (
            <button
              type="button"
              onClick={onActivate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Reactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              Desactivar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface ProductCardProps {
  product: Product;
  loading: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onAddImage: (file: File | null) => void;
  onManageVariants: () => void;
}
function ProductCard({
  product,
  loading,
  onEdit,
  onDeactivate,
  onActivate,
  onAddImage,
  onManageVariants
}: ProductCardProps) {
  const isInactive =
    product.estado === 'INACTIVO' || product.estado === 'ELIMINADO';

  return (
    <article
      className={`rounded-3xl border bg-white p-4 shadow-sm ${isInactive ? 'border-red-200 opacity-80' : 'border-slate-200'
        }`}
    >
      <div className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {product.imagen_principal ? (
            <img
              src={assetUrl(product.imagen_principal)}
              alt={product.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <PackagePlus className="h-8 w-8 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{product.nombre}</h3>

            {product.destacado && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                Destacado
              </span>
            )}

            {product.requiere_variantes && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                Con variantes
              </span>
            )}

            {isInactive && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                Desactivado
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {product.categoria || 'Sin categoría'}
          </p>

          <div className="mt-3 grid gap-1 text-sm text-slate-700 md:grid-cols-3">
            <p>
              <strong>Precio:</strong> ${Number(product.precio).toFixed(2)}
            </p>

            <p>
              <strong>Stock:</strong>{' '}
              {product.stock_disponible ?? product.stock_general}
            </p>

            <p>
              <strong>Estado:</strong> {product.estado}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
        {product.requiere_variantes && (
          <button
            type="button"
            onClick={onManageVariants}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-60"
          >
            <Shirt className="h-4 w-4" />
            Ver variantes
          </button>
        )}

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
          <Upload className="h-4 w-4" />
          Agregar imagen

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={loading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onAddImage(file);
              event.target.value = '';
            }}
          />
        </label>

        {isInactive ? (
          <button
            type="button"
            onClick={onActivate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Reactivar
          </button>
        ) : (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            Desactivar
          </button>
        )}
      </div>
    </article>
  );
}