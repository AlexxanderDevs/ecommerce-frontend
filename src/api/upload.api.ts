import { http } from './http';

export interface UploadResponse {
  ok: boolean;
  message: string;
  file: {
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  };
}

async function uploadImage(endpoint: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await http.post<UploadResponse>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data.file.url;
}

export function uploadStoreLogo(file: File) {
  return uploadImage('/uploads/stores/logo', file);
}

export function uploadStoreCover(file: File) {
  return uploadImage('/uploads/stores/cover', file);
}

export function uploadStoreLabel(file: File) {
  return uploadImage('/uploads/stores/label', file);
}

export function uploadProductImage(file: File) {
  return uploadImage('/uploads/products', file);
}