"""Pydantic response/request models (the API contract)."""
from __future__ import annotations

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
