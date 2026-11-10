import type { Category, SearchParams, SearchResponse } from "../types/types";

/** Server address, e.g. http://localhost:8000 (no trailing slash needed). */
const BASE_URL = import.meta.env.VITE_VERCEL_ENV || "http://localhost:8000";

/** Paths of your routes (appended to BASE_URL). */
export const ENDPOINTS = {
  categories: "/categories",
  search: "/search",
};

/**
 * Query-parameter names sent to GET /search.
 * Example request:  /search?category_id=C001&attribute_id=A001&max_price=15&q=helles
 * Change the values on the right if your backend uses different names.
 */
export const PARAMS = {
  query: "q", // text typed in the search bar
  categoryId: "category_id", // Drinks, Food, ...
  attributeId: "attribute_id", // filter chip: Alcoholic, Vegan, ...
  maxPrice: "max_price", // budget dialog
};

//type Query = Record<string, string | number | undefined>;


// Define a more specific type for query params if possible, e.g., Record<string, string | number | boolean | undefined | null>

type QueryValue = string | number | boolean | undefined | null;
type Query = Record<string, QueryValue>;

/** Sends a GET request and returns the parsed JSON. Empty values are omitted. */
async function getJson<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Add it to the .env file and restart `npm run dev`.");
  }

  // Filter out empty/undefined/null values cleanly using reduce or Object.entries
  const validEntries = Object.entries(query).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ""
  );
  
  const params = new URLSearchParams(validEntries.map(([k, v]) => [k, String(v)]));
  const queryString = params.toString();
  const url = `${BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, { signal });
  
  if (!response.ok) {
    // Try to extract backend error message if available
    let errorDetail = "";
    try {
      const errorBody = await response.json();
      errorDetail = errorBody.message || JSON.stringify(errorBody);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`Request to ${path} failed (${response.status}): ${errorDetail}`);
  }

  return response.json() as Promise<T>;
}

/** GET /categories */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const categories = await getJson<Category[]>(ENDPOINTS.categories, {}, signal);
  // Using .toSorted() if target environment supports ES2023+, 
  // otherwise fallback to [...categories].sort()
  return [...categories].sort((a, b) => a.sort_order - b.sort_order);
}

/** GET /search – the backend applies the filters and returns { count, offerings }. */
export function fetchSearch(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse> {
  return getJson<SearchResponse>(
    ENDPOINTS.search,
    {
      [PARAMS.query]: params.query,
      [PARAMS.categoryId]: params.categoryId,
      [PARAMS.attributeId]: params.attributeId,
      [PARAMS.maxPrice]: params.maxPrice,
    },
    signal,
  );
}






/** Sends a GET request and returns the parsed JSON. Empty values are not added to the URL. */
/*async function getJson<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Add it to the .env file and restart `npm run dev`.");
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();

  const response = await fetch(`${BASE_URL}${path}${queryString ? `?${queryString}` : ""}`, { signal });
  if (!response.ok) throw new Error(`Request to ${path} failed (${response.status})`);
  return response.json() as Promise<T>;
}

/** GET /categories */
/*export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const categories = await getJson<Category[]>(ENDPOINTS.categories, {}, signal);
  return [...categories].sort((a, b) => a.sort_order - b.sort_order);
}

/** GET /search – the backend applies the filters and returns { count, offerings }. */
/*export function fetchSearch(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse> {
  return getJson<SearchResponse>(
    ENDPOINTS.search,
    {
      [PARAMS.query]: params.query,
      [PARAMS.categoryId]: params.categoryId,
      [PARAMS.attributeId]: params.attributeId,
      [PARAMS.maxPrice]: params.maxPrice,
    },
    signal,
  );
}*/
