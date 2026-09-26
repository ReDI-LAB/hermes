export interface Product {
    id: number;
    product_name: string;
    variant: string;
    unit: string;
    is_traditional: boolean;
  
}

export interface Category {
    id: number;
    category_name: string;
    description?: string;
  
}

export interface Attribute {
    id: number;
    attribute_name: string;
    description: string;
}

//PriceRange to be develop






