"""Price range and search endpoints.

GET /price  — min/max offering prices for the current catalog filters
              (used to draw the price slider).
GET /search — offerings in that range, with vendor, product, area and
              activity details joined from the related tables.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import get_settings
from db import get_session
from models import Offering, Product, Vendor
from schemas import OfferingOut, PriceRange, SearchResponse

router = APIRouter(tags=["price"])


def _catalog_filters(
    stmt: Select[Any],
    *,
    category_id: str | None,
    product_id: str | None,
    attribute_id: str | None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
) -> Select[Any]:
    """Restrict offerings via the joined products table and optional price bounds."""
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if product_id is not None:
        stmt = stmt.where(Offering.product_id == product_id)
    if attribute_id is not None:
        stmt = stmt.where(Product.attribute_id == attribute_id)
    if min_price is not None:
        stmt = stmt.where(Offering.price_eur >= min_price)
    if max_price is not None:
        stmt = stmt.where(Offering.price_eur <= max_price)
    return stmt


def _price_bounds(min_price: Decimal | None, max_price: Decimal | None) -> None:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=400,
            detail="min_price must be less than or equal to max_price.",
        )


@router.get("/price", response_model=PriceRange)
async def price_range(
    category_id: str | None = Query(None, description="Scope to a category."),
    product_id: str | None = Query(None, description="Scope to a single product."),
    attribute_id: str | None = Query(None, description="Scope to an attribute."),
    session: AsyncSession = Depends(get_session),
):
    """Available price range (EUR) for offerings matching the catalog filters."""
    stmt = select(
        func.count(Offering.offering_id),
        func.min(Offering.price_eur),
        func.max(Offering.price_eur),
    ).join(Offering.product)
    stmt = _catalog_filters(
        stmt,
        category_id=category_id,
        product_id=product_id,
        attribute_id=attribute_id,
    )

    count, min_price, max_price = (await session.execute(stmt)).one()
    return PriceRange(count=count, min_price=min_price, max_price=max_price)


@router.get("/search", response_model=SearchResponse)
async def search_offerings(
    category_id: str | None = Query(None, description="Filter by category."),
    product_id: str | None = Query(None, description="Filter by a single product."),
    attribute_id: str | None = Query(None, description="Filter by attribute."),
    min_price: Decimal | None = Query(
        None, ge=0, description="Inclusive lower bound in EUR."
    ),
    max_price: Decimal | None = Query(
        None, ge=0, description="Inclusive upper bound in EUR (price slider)."
    ),
    offset: int = Query(0, ge=0),
    limit: int | None = Query(
        None,
        ge=1,
        description="Page size. Defaults to DEFAULT_PAGE_SIZE; capped at MAX_PAGE_SIZE.",
    ),
    session: AsyncSession = Depends(get_session),
):
    """Offerings within the selected filters, with vendor and product details."""
    _price_bounds(min_price, max_price)
    settings = get_settings()
    page_size = min(limit or settings.default_page_size, settings.max_page_size)

    count_stmt = select(func.count(Offering.offering_id)).join(Offering.product)
    count_stmt = _catalog_filters(
        count_stmt,
        category_id=category_id,
        product_id=product_id,
        attribute_id=attribute_id,
        min_price=min_price,
        max_price=max_price,
    )
    total = (await session.execute(count_stmt)).scalar_one()

    stmt = (
        select(Offering)
        .join(Offering.product)
        .join(Offering.vendor)
        .options(
            selectinload(Offering.vendor).selectinload(Vendor.area),
            selectinload(Offering.product).selectinload(Product.category),
            selectinload(Offering.product).selectinload(Product.attribute),
            selectinload(Offering.activity_details),
        )
    )
    stmt = _catalog_filters(
        stmt,
        category_id=category_id,
        product_id=product_id,
        attribute_id=attribute_id,
        min_price=min_price,
        max_price=max_price,
    )

    stmt = (
        stmt.order_by(Offering.price_eur, Vendor.vendor_name, Product.product_name)
        .offset(offset)
        .limit(page_size)
    )
    rows = (await session.execute(stmt)).scalars().unique().all()

    return SearchResponse(
        count=total,
        offerings=[OfferingOut.model_validate(row) for row in rows],
    )
