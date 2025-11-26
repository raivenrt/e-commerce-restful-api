import { default as slug } from 'slugify';

/**
 * Slugifies a given string, trimming whitespace, converting to lowercase, and
 * removing non-word characters.
 *
 * @param {string} value - The string to be slugified.
 *
 * @returns {string} The slugified string.
 */
export default function slugify(value: string) {
  return slug.default(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}
