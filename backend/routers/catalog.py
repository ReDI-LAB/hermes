"""Catalog endpoints: categories, attributes and products."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import Select, exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Attribute, Category, Product
from schemas import AttributeOut, CategoryOut, ProductOut

router = APIRouter(tags=["catalog"])

# Sentinel attribute_id for products that have no attribute (NULL in the DB).
# /attributes returns it as an "N/A" option; the product/price/search filters
# translate attribute_id=none into "attribute_id IS NULL".
NO_ATTRIBUTE_ID = "none"
NO_ATTRIBUTE = AttributeOut(
    attribute_id=NO_ATTRIBUTE_ID,
    attribute_name="N/A",
    description="Products without an attribute",
    sort_order=9999,
)


def apply_attribute_filter(stmt: Select, attribute_id: str | None) -> Select:
    """Filter on Product.attribute_id; the 'none' sentinel matches NULL.

    No attribute selected (None) adds no filter, so NULL-attribute products
    are kept.
    """
    if attribute_id is None:
        return stmt
    if attribute_id == NO_ATTRIBUTE_ID:
        return stmt.where(Product.attribute_id.is_(None))
    return stmt.where(Product.attribute_id == attribute_id)


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(session: AsyncSession = Depends(get_session)):
    """Top-level filter categories, in display order."""
    result = await session.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()


@router.get("/attributes", response_model=list[AttributeOut])
async def list_attributes(
    category_id: str | None = Query(
        default=None,
        description="Only attributes used by products in this category.",
    ),
    session: AsyncSession = Depends(get_session),
):
    """Attributes for the attribute filter.

    With category_id: only attributes used by that category's products.
    Without it: all attributes. In both cases an "N/A" entry
    (attribute_id="none") is appended when matching products have no
    attribute.
    """
    stmt = select(Attribute).order_by(Attribute.sort_order)
    null_check = select(Product.product_id).where(Product.attribute_id.is_(None))
    if category_id is not None:
        stmt = stmt.where(
            exists().where(
                Product.attribute_id == Attribute.attribute_id,
                Product.category_id == category_id,
            )
        )
        null_check = null_check.where(Product.category_id == category_id)

    attributes = [
        AttributeOut.model_validate(a)
        for a in (await session.execute(stmt)).scalars().all()
    ]
    if (await session.execute(select(exists(null_check)))).scalar():
        attributes.append(NO_ATTRIBUTE)
    return attributes


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    category_id: str | None = Query(
        default=None, description="Restrict to a single category."
    ),
    attribute_id: str | None = Query(
        default=None,
        description='Restrict to a single attribute; "none" = products without one.',
    ),
    session: AsyncSession = Depends(get_session),
):
    """Products, optionally filtered by category and/or attribute."""
    stmt = select(Product).order_by(Product.product_name, Product.variant)
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    stmt = apply_attribute_filter(stmt, attribute_id)
    result = await session.execute(stmt)
    return result.scalars().all()
