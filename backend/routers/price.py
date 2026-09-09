"""Price-filter endpoint.

Returns the min/max/count of offering prices for the chosen filters, so the
frontend can configure the max-price control before the (future) search step.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Offering, Product
from schemas import PriceRange

router = APIRouter(tags=["price"])


@router.get("/price", response_model=PriceRange)
async def price_range(
    category_id: str | None = Query(None, description="Scope to a category."),
    product_id: str | None = Query(None, description="Scope to a single product."),
    attribute_id: str | None = Query(None, description="Scope to an attribute."),
    session: AsyncSession = Depends(get_session),
):
    """Available price range (EUR) for the given filters."""
    stmt = select(
        func.count(Offering.offering_id),
        func.min(Offering.price_eur),
        func.max(Offering.price_eur),
    ).join(Offering.product)

    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if product_id is not None:
        stmt = stmt.where(Offering.product_id == product_id)
    if attribute_id is not None:
        stmt = stmt.where(Product.attribute_id == attribute_id)

    count, min_price, max_price = (await session.execute(stmt)).one()
    return PriceRange(count=count, min_price=min_price, max_price=max_price)
