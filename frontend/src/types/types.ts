// Shapes of the FastAPI responses

export interface Category {
  category_id: string;
  category_name: string;
  description: string;
  sort_order: number;
}

export interface Attribute {
  attribute_id: string;
  attribute_name: string;
  description: string;
  sort_order: number;
}

export interface Area {
  area_id: string;
  area_name: string;
  description: string;
}

export interface Vendor {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  area_id: string;
  location: string;
  notes: string;
  area: Area;
}

export interface Product {
  product_id: string;
  category_id: string;
  product_name: string;
  variant: string;
  unit: string;
  is_traditional: boolean;
  attribute_ids: string[];
  category: Category;
  attributes: Attribute[];
}

export interface ActivityDetails {
  offering_id: string;
  min_age: number | null;
  min_height_cm: number | null;
  max_height_cm: number | null;
  thrill_level: string;
  family_friendly: boolean;
  access_note: string;
}

export interface Offering {
  offering_id: string;
  vendor_id: string;
  product_id: string;
  price_eur: string; // npr. "14.90"
  is_new_this_year: boolean;
  source: string;
  last_price_update: string;
  vendor: Vendor;
  product: Product;
  activity_details: ActivityDetails | null;
}

export interface SearchResponse {
  count: number;
  offerings: Offering[];
}

export interface SearchParams {
  query?: string;
  categoryId?: string;
  attributeId?: string;
  maxPrice?: number;
}

/** A product with all of its offerings (vendors) – computed in the browser */
export interface ProductGroup {
  product: Product;
  minPrice: number;
  offerings: Offering[];
}
