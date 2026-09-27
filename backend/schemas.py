"""Pydantic response/request models (the API contract)."""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CategoryOut(ORMModel):
    category_id: str
    category_name: str
    description: str | None = None
    sort_order: int


class AttributeOut(ORMModel):
    attribute_id: str
    attribute_name: str
    description: str | None = None
    sort_order: int


class ProductOut(ORMModel):
    product_id: str
    category_id: str
    product_name: str
    variant: str | None = None
    unit: str | None = None
    is_traditional: bool
    attribute_id: str | None = None


class PriceRange(BaseModel):
    """Min/max/count of offering prices for the current filters.

    Backs the price-filter control (e.g. a slider): the frontend reads the
    available range before the user picks a maximum price.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"count": 83, "min_price": "1.50", "max_price": "29.90"}
        }
    )

    count: int
    min_price: Decimal | None = None
    max_price: Decimal | None = None


class AreaOut(ORMModel):
    area_id: str
    area_name: str
    description: str | None = None


class VendorOut(ORMModel):
    vendor_id: str
    vendor_name: str
    vendor_type: str | None = None
    area_id: str
    location: str | None = None
    notes: str | None = None
    area: AreaOut | None = None


class ActivityDetailOut(ORMModel):
    offering_id: str
    min_age: int | None = None
    min_height_cm: int | None = None
    max_height_cm: int | None = None
    thrill_level: str | None = None
    family_friendly: bool | None = None
    access_note: str | None = None


class ProductDetailOut(ProductOut):
    """Product plus joined category and attribute for search results."""

    category: CategoryOut | None = None
    attribute: AttributeOut | None = None


class OfferingOut(ORMModel):
    """One vendor-product-price row with all related details."""

    offering_id: str
    vendor_id: str
    product_id: str
    price_eur: Decimal
    is_new_this_year: bool
    source: str | None = None
    last_price_update: date | None = None
    vendor: VendorOut
    product: ProductDetailOut
    activity_details: ActivityDetailOut | None = None


class SearchResponse(BaseModel):
    """Offerings that match the catalog + price filters."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "count": 2,
                "offerings": [
                    {
                        "offering_id": "O001",
                        "vendor_id": "V001",
                        "product_id": "P001",
                        "price_eur": "14.90",
                        "is_new_this_year": False,
                        "source": "Illustrative placeholder - not field verified",
                        "last_price_update": "2026-08-12",
                        "vendor": {
                            "vendor_id": "V001",
                            "vendor_name": "Augustiner-Festhalle",
                            "vendor_type": "large_tent",
                            "area_id": "A001",
                            "location": "Wirtestrasse",
                            "notes": "Large beer tent example",
                            "area": {
                                "area_id": "A001",
                                "area_name": "Oktoberfest",
                                "description": "Main Oktoberfest area on Theresienwiese",
                            },
                        },
                        "product": {
                            "product_id": "P001",
                            "category_id": "C001",
                            "product_name": "Mass Helles",
                            "variant": "1L",
                            "unit": "litre",
                            "is_traditional": True,
                            "attribute_id": "A001",
                            "category": {
                                "category_id": "C001",
                                "category_name": "Drinks",
                                "description": "All beverages",
                                "sort_order": 1,
                            },
                            "attribute": {
                                "attribute_id": "A001",
                                "attribute_name": "Alcoholic",
                                "description": "Beer and other alcoholic beverages",
                                "sort_order": 1,
                            },
                        },
                        "activity_details": None,
                    }
                ],
            }
        }
    )

    count: int
    offerings: list[OfferingOut]
