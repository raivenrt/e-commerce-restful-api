type PaginationDataT = {
  documentsCount: number;
  limit?: number;
  page?: number;
};

/**
 * Calculates pagination details based on the total number of documents, limit per page, and current page.
 *
 * @param {PaginationDataT} params - The pagination parameters.
 * @param {number} params.documentsCount - Total number of documents available.
 * @param {number} [params.limit] - Maximum number of documents per page. Defaults to the total document count if not provided.
 * @param {number} [params.page=1] - The current page number. Defaults to 1.
 * @returns {{
 *   documentsCount: number;
 *   skip: number;
 *   limit: number;
 *   pages: number;
 *   avilablePages: number;
 *   page: number;
 *   nextPage: number | false;
 *   prevPage: number | false;
 * }} An object containing pagination details:
 *   - documentsCount: Total number of documents.
 *   - skip: Number of documents to skip for the current page.
 *   - limit: Number of documents per page.
 *   - pages: Total number of pages.
 *   - avilablePages: Total number of available pages (rounded up).
 *   - page: Current page number.
 *   - nextPage: Next page number, or false if there is no next page.
 *   - prevPage: Previous page number, or false if there is no previous page.
 *
 * @example pagination({ documentsCount: 1, limit: 1, page: 1})
 */
export default function pagination({
  documentsCount,
  limit: argLimit = 10,
  page: argPage = 1,
}: PaginationDataT) {
  const limit = argLimit || 10;
  const page = argPage || 1;

  const skip = (page - 1) * limit;

  const pages = Math.ceil(documentsCount / limit);
  const avilablePages = Math.ceil((documentsCount - skip) / limit);

  const nextPage = page + 1 <= avilablePages ? page + 1 : false;
  const prevPage = page - 1 >= avilablePages ? page - 1 : false;

  return { documentsCount, skip, limit, pages, avilablePages, page, nextPage, prevPage };
}
