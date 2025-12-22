import path from 'path';
import sharp from 'sharp';
// GLOBAL
export const BASE_DIR = path.join(import.meta.dirname, '..');
export const ROOT_DIR = path.join(BASE_DIR, '..');
export const UPLOAD_DIR = path.join(BASE_DIR, 'uploads');

// STATIC SERVING
export const IMAGES_UPLOAD_DIR = path.join(UPLOAD_DIR, 'images');
export const IMAGES_UPLOAD_URL = '/images';

export const BRAND_UPLOAD_DIR = path.join(IMAGES_UPLOAD_DIR, 'brands');
export const BRAND_UPLOAD_URL = '/images/brands';

export const CATEGORY_UPLOAD_DIR = path.join(IMAGES_UPLOAD_DIR, 'categories');
export const CATEGORY_UPLOAD_URL = '/images/categories';

export const SUBCATEGORY_UPLOAD_DIR = path.join(IMAGES_UPLOAD_DIR, 'subcategories');
export const SUBCATEGORY_UPLOAD_URL = '/images/subcategories';

export const PRODUCTS_UPLOAD_DIR = path.join(IMAGES_UPLOAD_DIR, 'products');
export const PRODUCTS_UPLOAD_URL = '/images/products';

export const AVATARS_UPLOAD_DIR = path.join(IMAGES_UPLOAD_DIR, 'avatar');
export const AVATARS_UPLOAD_URL = '/images/avatar';

export const SERV: { path: string; root: string }[] = [
  {
    path: IMAGES_UPLOAD_URL,
    root: IMAGES_UPLOAD_DIR,
  },
];

// UPLOAD
export const ALLOWED_MIME_TYPES: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes -> Warning: Do not exceed 5MB DDOS
export const MAX_FILE_COUNT = 10;

// IMAGE OPTIMIZATION
export const IMAGE_OPTIONS: {
  w: number;
  h: number;
  fit: keyof sharp.FitEnum;
  quality: number;
  effort: 0 | 1 | 2 | 3 | 4 | 5 | 6;
} = {
  w: 400,
  h: 400,
  fit: 'cover',
  effort: 4,
  quality: 70,
};
