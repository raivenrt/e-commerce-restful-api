import { default as slug } from 'slugify';

export default function slugify(value: string) {
  return slug.default(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}
