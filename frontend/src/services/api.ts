import type { Category, SearchParams, SearchResponse, Offering } from "../types/types";

/** Server address, e.g. https://api.example.com (a trailing slash is removed). */
const BASE_URL: string = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");


/** Paths of your routes (appended to BASE_URL). */
export const ENDPOINTS = {
  categories: "/categories",
  search: "/search",
};

/**
 * Query-parameter names sent to GET /search.
 * Example request:  /search?category_id=C001&attribute_id=A001&max_price=15&q=helles
 */
export const PARAMS = {
  query: "q", // text typed in the search bar
  categoryId: "category_id", // Drinks, Food, ...
  attributeId: "attribute_id", // filter chip: Alcoholic, Vegan, ...
  maxPrice: "max_price", // budget dialog
};

/** Name of the price field in each offering of your API response (e.g. "price_eur" or "price"). */
const PRICE_FIELD = "price_eur";

type Query = Record<string, string | number | undefined>;

/** Builds the full address, e.g. https://api.example.com/search?category_id=C001. Empty values are left out. */
function buildUrl(path: string, query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  return `${BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
}

/** Sends a GET request and returns the JSON. Every failure gets a message that says what to fix. */
async function getJson<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Add it to .env (local) or to the Vercel environment variables, then rebuild.");
  }
  // A page opened over https cannot call an http:// API ("mixed content"), so say it clearly.
  if (globalThis.location?.protocol === "https:" && BASE_URL.startsWith("http://")) {
    throw new Error(`The API address ${BASE_URL} must start with https:// because this site uses https.`);
  }

  const url = buildUrl(path, query);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error; // cancelled on purpose, not an error
    throw new Error(`Could not reach ${url}. Check that the API is online and that its CORS settings allow this site.`);
  }

  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);

  // A wrong address often returns an HTML page with status 200; catch it here instead of crashing in response.json().
  if (!(response.headers.get("content-type") ?? "").includes("json")) {
    throw new Error(`${url} did not return JSON. Is VITE_API_BASE_URL the address of the API?`);
  }
  return (await response.json()) as T;
}

/** Copies the price from PRICE_FIELD into `price_eur`, the name the rest of the app uses. */
function normalizeOffering(raw: Offering): Offering {
  const value = (raw as unknown as Record<string, unknown>)[PRICE_FIELD];
  return { ...raw, price_eur: value === undefined || value === null ? "" : String(value) };
}

// Categories almost never change, so they are requested once and the answer is reused.
// (This also removes the duplicate request that React StrictMode causes in development.)
let categoriesRequest: Promise<Category[]> | null = null;

/** GET /categories. The signal parameter is unused: the shared request must not be cancelled by one component. */
export function fetchCategories(_signal?: AbortSignal): Promise<Category[]> {
  categoriesRequest ??= getJson<Category[]>(ENDPOINTS.categories)
    .then((categories) => {
      if (!Array.isArray(categories)) throw new Error(`${ENDPOINTS.categories} must return a list of categories.`);
      return [...categories].sort((a, b) => a.sort_order - b.sort_order);
    })
    .catch((error: unknown) => {
      categoriesRequest = null; // allow a new attempt after a failure
      throw error;
    });
  return categoriesRequest;
}

/** GET /search – the backend applies the filters and returns { count, offerings }. */
export async function fetchSearch(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse> {
  const data = await getJson<SearchResponse>(
    ENDPOINTS.search,
    {
      [PARAMS.query]: params.query,
      [PARAMS.categoryId]: params.categoryId,
      [PARAMS.attributeId]: params.attributeId,
      [PARAMS.maxPrice]: params.maxPrice,
    },
    signal,
  );
  if (!Array.isArray(data?.offerings)) {
    throw new Error(`${ENDPOINTS.search} must return { "count": ..., "offerings": [...] }.`);
  }
  return { ...data, offerings: data.offerings.map(normalizeOffering) };
}
