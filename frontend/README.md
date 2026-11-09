# Hermes – Oktoberfest prices

A mobile-first MVP for comparing prices at Oktoberfest. It also works on tablets and desktops (a centered column up to 560 px wide).

**Stack:** React 18, TypeScript, Vite, Material UI. The data comes from your FastAPI backend.

## Quick start

```bash
npm install
# 1. Open .env and set VITE_API_BASE_URL to your FastAPI address
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

> After you change `.env` you must stop and restart `npm run dev`.

## Features

- **Home:** search bar with suggestions (from 2 letters). Only products whose **name contains exactly the typed characters** are shown (case and accents are ignored: "weiss" finds "Weißbier"). Enter opens the full results; categories come from `GET /categories`.
- **Categories:** Drinks, Foods, Rides, Games, Souvenirs, with a dropdown to switch category.
- **Filter chips per category:** Drinks (Alcoholic, Non-Alcoholic), Foods (Vegan, Non-Vegan), Rides and Games (Adult-Friendly, Family-Friendly), Souvenirs (All only).
- **Sorting:** the sort button is a toggle. Product list: A–Z / Z–A. Vendor list: cheapest first / most expensive first. A tooltip shows the current order.
- **Budget:** the filter button opens a dialog with a slider (and a text field) for the maximum price, from €0 to €20. The active budget is shown as an "Up to €X" chip.
- **Product list:** "FROM €X" shows the cheapest price. "Show more" loads 8 products at a time.
- **Drinks and Foods:** a click opens the vendor page of the product. **Rides, Games and Souvenirs:** vendors expand inside the list.
- **Vendor page:** vendors sorted by price, the cheapest ones (ties included) are marked BEST PRICE, "Show more" loads 8 vendors at a time, a click shows type and location (and age/height for rides).
- **About** page (info button in the header).

## Project structure

```
src/
  api.ts               <- the ONLY file that talks to the backend (base URL, endpoints, query parameters)
  types.ts             <- TypeScript types of the API responses
  group.ts             <- grouping offerings by product, sorting, price formatting
  categoryUi.tsx       <- category names, icons, filter chips
  theme.ts             <- colors, fonts, MUI theme
  useAsync.ts          <- small hook: runs a request and gives { data, loading, error }
  components/
    Home.tsx           <- search + category buttons
    SearchBox.tsx      <- search bar with suggestions
    BrowseScreen.tsx   <- category page, product list, vendor page
    OfferingRow.tsx    <- one vendor row (expands to type/location)
    BudgetDialog.tsx   <- maximum price dialog
    SortIcon.tsx, PricePill.tsx, Header.tsx, Logo.tsx, About.tsx
```

## Connecting your API

### 1. Base URL

In `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

Every request is sent to this address + the route, e.g. `http://localhost:8000/search?...`.

### 2. Routes and query parameter names

Open `src/api.ts`. At the top you will find two small objects:

```ts
export const ENDPOINTS = { categories: "/categories", search: "/search" };

export const PARAMS = {
  query: "q",                  // text typed in the search bar
  categoryId: "category_id",   // Drinks, Food, ...
  attributeId: "attribute_id", // filter chip: Alcoholic, Vegan, ...
  maxPrice: "max_price",       // budget dialog
};
```

If your backend uses other paths or other parameter names, change the **values on the right** and nothing else.

### 3. CORS (needed because the browser app and the API run on different ports)

If the browser console shows a "CORS" error, add this to your FastAPI app:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # address of this React app
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

## How filtering works

The idea: **the frontend sends the filters as query parameters, the backend does the filtering and returns only matching offerings.** The frontend then groups them by product.

A query parameter is the part of the URL after `?`, written as `name=value` and joined with `&`. Only the parameters that are actually used are sent.

| What the user does | Request sent by the app |
|---|---|
| Opens the home page | `GET /categories` |
| Taps **Drinks** | `GET /search?category_id=C001` |
| Taps the chip **Alcoholic** | `GET /search?category_id=C001&attribute_id=A001` |
| Sets the budget to €15 | `GET /search?category_id=C001&attribute_id=A001&max_price=15` |
| Types **helles** in the search bar and presses Enter | `GET /search?q=helles` |

Filters are combined: the more filters are active, the more parameters are added. Missing parameters mean "no filter".

**What the backend must do** for `GET /search`:

1. Start with all offerings.
2. If `category_id` is given, keep offerings whose product belongs to that category.
3. If `attribute_id` is given, keep offerings whose product has that attribute.
4. If `max_price` is given, keep offerings with `price_eur <= max_price`.
5. If `q` is given, keep offerings whose **product name** contains the text, ignoring upper/lower case. Do not match vendor names, otherwise unrelated products appear (the frontend also drops them as a safety net).
6. Return `{ "count": ..., "offerings": [...] }`.

A minimal FastAPI example (replace `load_offerings()` with your database query):

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/search")
def search(
    q: str | None = None,
    category_id: str | None = None,
    attribute_id: str | None = None,
    max_price: float | None = None,
):
    offerings = load_offerings()  # your data: a list of offerings (see "Response shapes")

    if category_id:
        offerings = [o for o in offerings if o["product"]["category_id"] == category_id]
    if attribute_id:
        offerings = [o for o in offerings if attribute_id in o["product"]["attribute_ids"]]
    if max_price is not None:
        offerings = [o for o in offerings if float(o["price_eur"]) <= max_price]
    if q:
        text = q.lower()
        offerings = [o for o in offerings if text in o["product"]["product_name"].lower()]

    return {"count": len(offerings), "offerings": offerings}
```

FastAPI turns the function arguments into query parameters automatically, and a parameter with `= None` is optional.

**What the frontend does by itself (no request):**

- Grouping offerings into products and calculating the "FROM" price.
- Sorting (A–Z, Z–A, price low/high). Sorting happens in the browser, so it does not trigger a request.
- "Show more" (the full result is loaded once, 8 items are shown at a time).
- The **Adult-Friendly / Family-Friendly** chips: they use `activity_details.family_friendly` of each offering. If you prefer the backend to filter them, add a parameter in `PARAMS`, send it in `fetchSearch`, and remove the `family` filter in `BrowseScreen.tsx`.

**Filter chips and ids:** the chips of each category are defined in `CATEGORY_CHIPS` in `src/categoryUi.tsx`. Their ids (`A001`, `A002`, ...) must be the same `attribute_id` values that your backend knows.

## Response shapes

- `GET /categories` returns `[{ category_id, category_name, description, sort_order }]`.
- `GET /search` returns `{ count, offerings }`. Each offering contains `offering_id`, `price_eur` (string such as `"14.90"`), `is_new_this_year`, `last_price_update`, and the nested objects `vendor` (with `vendor_name`, `vendor_type`, `location`, `area`), `product` (with `product_name`, `variant`, `category_id`, `attribute_ids`, `category`, `attributes`) and `activity_details` (or `null`).

The exact TypeScript types are in `src/types.ts`. If a field has a different name in your API, change it in `types.ts` and where it is used.

## Customizing

- **Budget limits:** `BUDGET_MIN` and `BUDGET_MAX` in `src/components/BudgetDialog.tsx`.
- **Items per page:** `PAGE_SIZE` in `src/components/BrowseScreen.tsx`.
- **Category names shown in the app:** `src/categoryUi.tsx`.
- **Colors and fonts:** `src/theme.ts`.

## Troubleshooting

Open the browser developer tools (F12). The **Network** tab shows every request and its status, the **Console** tab shows errors.

| Problem | Likely cause |
|---|---|
| The page shows "VITE_API_BASE_URL is not set" | `.env` is missing or you did not restart `npm run dev` |
| Console shows a CORS error | Add the CORS middleware (see above) |
| Request returns 404 | The path in `ENDPOINTS` is wrong |
| Filters do nothing | The parameter name in `PARAMS` differs from the one your backend expects; check the URL in the Network tab |
| The list is empty | The backend returned `{ "count": 0, "offerings": [] }`; open the request URL directly in the browser to see the response |
