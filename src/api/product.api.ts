import { http } from './http';
import type {
  Category,
  CreateCategoryPayload,
  CreateProductPayload,
  CreateVariantPayload,
  Product,
  ProductImage,
  ProductVariant,
  PublicProductDetail 
} from '../types/product.types';

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await http.post('/catalog/seller/categories', payload);
  return data.category as Category;
}

export async function getCategoriesByStore(storeId: string) {
  const { data } = await http.get(`/catalog/seller/stores/${storeId}/categories`);
  return data.categories as Category[];
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await http.post('/catalog/seller/products', payload);
  return data.product as Product;
}

export async function getProductsByStore(storeId: string) {
  const { data } = await http.get(`/catalog/seller/stores/${storeId}/products`);
  return data.products as Product[];
}

export async function addProductVariant(
  productId: string,
  payload: CreateVariantPayload
) {
  const { data } = await http.post(
    `/catalog/seller/products/${productId}/variants`,
    payload
  );

  return data.variant;
}

export async function deactivateProduct(productId: string) {
  const { data } = await http.patch(
    `/catalog/seller/products/${productId}/deactivate`
  );

  return data.product as Product;
}

export async function getPublicProductsByStoreSlug(slug: string) {
  const { data } = await http.get(`/catalog/public/stores/${slug}/products`);
  return data.products as Product[];
}

export async function getPublicProductDetail(productId: string) {
  const { data } = await http.get(`/catalog/public/products/${productId}`);
  return data.data as PublicProductDetail;
}

export async function addProductImage(
  productId: string,
  payload: {
    url_imagen: string;
    es_principal?: boolean;
    orden?: number;
  }
) {
  const { data } = await http.post(
    `/catalog/seller/products/${productId}/images`,
    payload
  );

  return data.image;
}

export async function activateProduct(productId: string) {
  const { data } = await http.patch(
    `/catalog/seller/products/${productId}/activate`
  );

  return data.product as Product;
}

export interface UpdateProductPayload {
  id_categoria?: string | null;
  codigo_producto?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock_general: number;
  requiere_variantes: boolean;
  destacado: boolean;
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload
) {
  const { data } = await http.patch(
    `/catalog/seller/products/${productId}`,
    payload
  );

  return data.product as Product;
}

export interface UpdateVariantPayload {
  sku?: string | null;
  talla?: string | null;
  color?: string | null;
  descripcion_variante?: string | null;
  stock: number;
  precio_adicional: number;
}

export async function getSellerProductVariants(productId: string) {
  const { data } = await http.get(
    `/catalog/seller/products/${productId}/variants`
  );

  return data.variants as ProductVariant[];
}

export async function updateSellerProductVariant(
  variantId: string,
  payload: UpdateVariantPayload
) {
  const { data } = await http.patch(
    `/catalog/seller/variants/${variantId}`,
    payload
  );

  return data.variant as ProductVariant;
}

export async function deactivateSellerProductVariant(variantId: string) {
  const { data } = await http.patch(
    `/catalog/seller/variants/${variantId}/deactivate`
  );

  return data.variant as ProductVariant;
}

export async function activateSellerProductVariant(variantId: string) {
  const { data } = await http.patch(
    `/catalog/seller/variants/${variantId}/activate`
  );

  return data.variant as ProductVariant;
}
// Category Management
export interface UpdateCategoryPayload {
  id_categoria_padre?: string | null;
  nombre: string;
  descripcion?: string | null;
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload
) {
  const { data } = await http.patch(
    `/catalog/seller/categories/${categoryId}`,
    payload
  );

  return data.category as Category;
}

export async function deactivateCategory(categoryId: string) {
  const { data } = await http.patch(
    `/catalog/seller/categories/${categoryId}/deactivate`
  );

  return data.category as Category;
}

export async function activateCategory(categoryId: string) {
  const { data } = await http.patch(
    `/catalog/seller/categories/${categoryId}/activate`
  );

  return data.category as Category;
}

// Product Images
export async function getSellerProductImages(productId: string) {
  const { data } = await http.get(
    `/catalog/seller/products/${productId}/images`
  );

  return data.images as ProductImage[];
}

export async function setMainSellerProductImage(imageId: string) {
  const { data } = await http.patch(
    `/catalog/seller/images/${imageId}/main`
  );

  return data.image as ProductImage;
}

export async function deactivateSellerProductImage(imageId: string) {
  const { data } = await http.patch(
    `/catalog/seller/images/${imageId}/deactivate`
  );

  return data.image as ProductImage;
}