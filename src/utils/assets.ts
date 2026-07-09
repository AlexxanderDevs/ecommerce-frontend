import { STATIC_URL } from '../api/http';

export function assetUrl(path?: string | null): string {
  if (!path) {
    return '';
  }

  if (path.startsWith('http')) {
    return path;
  }

  return `${STATIC_URL}${path}`;
}