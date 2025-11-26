import type {
  FilterQuery,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import type QueryString from 'qs';

type $ORFilterField = {
  [F: string]: {
    $regex: string;
    $options: string;
  };
};

type TSortReturn = {
  by: {
    [F: string]: 1 | -1 | 'asc' | 'desc';
  };
  fields: string[];
};

type TSearchReturn = {
  keyword: string;
  fields: $ORFilterField[];
  query: { $or: $ORFilterField[] };
};

type TSelectReturn = {
  fields: string[];
  projection: { [F: string]: boolean };
};

type GlobalParserOptions = { f: string };

type TPopulateReturn = {
  fields: string[];
  populate: PopulateOptions[];
};
type TParsed = Partial<{
  search: TSearchReturn;
  sort: TSortReturn;
  select: TSelectReturn;
  populate: TPopulateReturn;
}>;

export type ApiQueryFeaturesOptions<F extends object> = Partial<{
  projection: GlobalParserOptions & { execlude?: (keyof F)[] };
  populate: GlobalParserOptions & { execlude?: (keyof F)[]; ignoreInvalid?: boolean };
  sort: GlobalParserOptions;
  search: GlobalParserOptions & { fields: (keyof F)[] };
}>;

/**
 * A class for parsing and processing query parameters for MongoDB queries using Mongoose.
 *
 * This class provides methods to search, sort, select, and populate documents based on the query parameters.
 *
 * @template F - The type of the query document.
 * @property {FilterQuery<F>} filter - The filter query.
 * @property {ProjectionType<F>} projection - The projection query.
 * @property {QueryOptions<F>} queryOptions - The query options.
 * @property {TParsed} parsed - The parsed query parameters.
 *
 * @constructor
 * @param {ApiQueryFeaturesOptions<F>} [options={}] - The options for parsing the query parameters.
 * @param {QueryString.ParsedQs} [query={}] - The query parameters to parse.
 *
 * @example
 * const apiQueryFeatures = new ApiQueryFeatures<F>({
 *   search: { f: 'search', fields: ['name', 'description'] },
 *   sort: { f: 'sort' },
 *   projection: { f: 'projection', exclude: ['password'] },
 *   populate: { f: 'populate', exclude: ['user'] },
 * }
 *
 * const result = await apiQueryFeatures.search();
 * const searchResult = apiQueryFeatures.parsed.search;
 * const sortResult = apiQueryFeatures.parsed.sort;
 * const selectResult = apiQueryFeatures.parsed.select;
 * const populateResult = apiQueryFeatures.parsed.populate;
 */
export default class ApiQueryFeatures<F extends object> {
  public filter: FilterQuery<F> = {};
  public projection: ProjectionType<F> = {};
  public queryOptions: QueryOptions<F> = {};
  public parsed: TParsed = {};

  constructor(
    options: ApiQueryFeaturesOptions<F> = {},
    protected query: QueryString.ParsedQs = {},
  ) {
    const { search, sort, projection, populate } = options;

    if (search) {
      const q = this.search(search, this.query);
      this.parsed.search = q;
      this.filter = { ...this.filter, ...q.query };
    }

    if (sort) {
      const q = this.sort(sort, this.query);
      this.parsed.sort = q;
      this.queryOptions.sort = q.by;
    }

    if (projection) {
      const q = this.select(projection, this.query);
      this.parsed.select = q;
      this.projection = Object.assign(this.projection, q.projection);
    }

    if (populate) {
      const q = this.populate(populate, this.query);
      this.parsed.populate = q;
      this.queryOptions.populate = q.populate;
    }
  }

  /**
   * Parses the search query parameters and returns an object with the parsed fields, keyword, and query.
   *
   * @param {GlobalParserOptions & { fields: (keyof F)[] }} options - The options for parsing the search query parameters.
   * @param {QueryString.ParsedQs} query - The query parameters to parse.
   * @returns {TSearchReturn} An object with the parsed fields, keyword, and query.
   * @reqQuery {`[options.search.f]`: string}
   */
  search(
    options: GlobalParserOptions & { fields: (keyof F)[] },
    query: QueryString.ParsedQs,
  ): TSearchReturn {
    const { f, fields } = options;
    const qd: unknown = query[f];

    if (typeof qd !== 'string' || qd.length === 0)
      return { keyword: '', fields: [], query: { $or: [] } };

    const parsedFields = fields.map((field) => ({
      [field]: { $regex: qd, $options: 'i' },
    }));

    return {
      keyword: qd,
      fields: parsedFields,
      query: {
        $or: parsedFields,
      },
    };
  }

  /**
   * Parses the sort query parameters and returns an object with the sort fields and their corresponding order.
   *
   * @param {GlobalParserOptions} options - The options for parsing the sort query parameters.
   * @param {QueryString.ParsedQs} query - The query parameters to parse.
   * @returns {TSortReturn} An object with the sort fields and their corresponding order.
   * @reqQuery {`[options.sort.f]`: { updatedAt: 'asc', createdAt: '1' }}
   */
  sort(options: GlobalParserOptions, query: QueryString.ParsedQs): TSortReturn {
    const qd = query[options.f];
    const sort: TSortReturn = {
      by: {},
      fields: [],
    };

    if (!qd || typeof qd !== 'object') return sort;

    for (const [fieldName, order] of Object.entries(qd)) {
      if (!Number.isNaN(+fieldName)) continue;
      sort.by[fieldName] = order === '1' || order === 'asc' ? 1 : -1;
    }

    sort.fields = Object.keys(sort.by);

    return sort;
  }

  /**
   * Parses the select query parameters and returns an object with the selected fields and their corresponding projection.
   *
   * @param {GlobalParserOptions & { exclude?: (keyof F)[] }} options - The options for parsing the select query parameters.
   * @param {QueryString.ParsedQs} query - The query parameters to parse.
   * @returns {TSelectReturn} An object with the selected fields and their corresponding projection.
   * @reqQuery {`[options.projection.f]`: [ 'price', 'category', 'title', '-_id' ]
   */
  select(
    { execlude = [], ...options }: GlobalParserOptions & { execlude?: (keyof F)[] },
    query: QueryString.ParsedQs,
  ): TSelectReturn {
    const qd = query[options.f];
    const select: TSelectReturn = {
      fields: [],
      projection: {},
    };
    const qdFieldsArr: (keyof F)[] = [];

    if (typeof qd === 'string') qdFieldsArr.push(qd as keyof F);
    else if (Array.isArray(qd)) qdFieldsArr.push(...(qd as (keyof F)[]));
    else return select;

    // Exclude execlude fields
    execlude.forEach((field) => {
      select.projection[field as string] = false;
    });

    for (const fieldName of qdFieldsArr) {
      if (
        execlude.includes(fieldName as keyof F) ||
        typeof fieldName !== 'string' ||
        fieldName.length === 0
        // || !Number.isNaN(+fieldName) --> execlude numeric fields name
      )
        continue;

      const field = fieldName.startsWith('-')
        ? { name: fieldName.slice(1), isSelected: false }
        : {
            name: fieldName,
            isSelected: true,
          };

      select.projection[field.name] = field.isSelected;
    }

    select.fields = Object.keys(select.projection);

    return select;
  }

  /**
   * Parses the populate query parameters and returns an object with the populated fields and their corresponding paths and selections.
   *
   * @param {GlobalParserOptions & { exclude?: (keyof F)[]; ignoreInvalid?: boolean }} options - The options for parsing the populate query parameters.
   * @param {QueryString.ParsedQs} query - The query parameters to parse.
   * @returns {TPopulateReturn} An object with the populated fields and their corresponding paths and selections.
   * @reqQuery {`[options.projection.f]`: { profile: '*', posts: [ '-__v', '-updatedAt', '-createdAt' ] }
   */
  populate(
    {
      execlude = [],
      ...options
    }: GlobalParserOptions & { execlude?: (keyof F)[]; ignoreInvalid?: boolean },
    query: QueryString.ParsedQs,
  ): TPopulateReturn {
    const qd = query[options.f];
    const populate: TPopulateReturn = {
      fields: [],
      populate: [],
    };

    if (typeof qd !== 'object') return populate;

    for (const [populationField, selectedFields] of Object.entries(qd)) {
      const fields = [];

      if (selectedFields === '*' || selectedFields === '') fields.push('');
      else if (typeof selectedFields === 'string') fields.push(selectedFields);
      else if (Array.isArray(selectedFields)) fields.push(...selectedFields);
      else {
        if (options.ignoreInvalid) return populate;
      }

      if (execlude.includes(populationField as keyof F)) continue;

      populate.populate.push({
        path: populationField,
        select: fields.join(' '),
      });
    }

    populate.fields = populate.populate.map((field) => field.path);

    return populate;
  }
}
