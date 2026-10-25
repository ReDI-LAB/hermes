"""Catalog endpoints: categories, attributes and products."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, exists, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db import get_session
from models import Attribute, Category, Product, ProductAttribute
from schemas import AttributeOut, CategoryOut, ProductOut

router = APIRouter(tags=["catalog"])

# Sentinel attribute_id for products that have no attributes at all (no rows
# in map_products_attributes). /attributes returns it as an "N/A" option; the
# product/price/search filters translate attribute_id=none into that check.
NO_ATTRIBUTE_ID = "none"
NO_ATTRIBUTE = AttributeOut(
    attribute_id=NO_ATTRIBUTE_ID,
    attribute_name="N/A",
    description="Products without an attribute",
    sort_order=9999,
)

ATTRIBUTE_FILTER_HELP = (
    "Repeat to select several attributes: a product must have ALL of them "
    "(e.g. ?attribute_id=A003&attribute_id=A005 = Vegan and Hot). "
    '"none" = products without any attribute; it cannot be combined.'
)


def _has_attribute(attribute_id: str):
    """SQL condition: the current Product has this attribute."""
    return exists().where(
        ProductAttribute.product_id == Product.product_id,
        ProductAttribute.attribute_id == attribute_id,
    )


def _has_no_attributes():
    """SQL condition: the current Product has no attributes at all."""
    return ~exists().where(ProductAttribute.product_id == Product.product_id)


def apply_attribute_filter(stmt: Select, attribute_ids: list[str] | None) -> Select:
    """Keep products that have ALL selected attributes.

    No attribute selected (None or empty) adds no filter, so products without
    attributes are kept. The 'none' sentinel keeps only products without any
    attribute. EXISTS (not a JOIN) keeps each product/offering exactly once.
    """
    if not attribute_ids:
        return stmt
    selected = list(dict.fromkeys(attribute_ids))  # drop repeats, keep order
    if NO_ATTRIBUTE_ID in selected:
        if len(selected) > 1:
            raise HTTPException(
                status_code=400,
                detail='attribute_id "none" cannot be combined with other attributes.',
            )
        return stmt.where(_has_no_attributes())
    for attribute_id in selected:
        stmt = stmt.where(_has_attribute(attribute_id))
    return stmt


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
    no_attribute_check = select(Product.product_id).where(_has_no_attributes())
    if category_id is not None:
        stmt = stmt.where(
            exists().where(
                ProductAttribute.attribute_id == Attribute.attribute_id,
                ProductAttribute.product_id == Product.product_id,
                Product.category_id == category_id,
            )
        )
        no_attribute_check = no_attribute_check.where(
            Product.category_id == category_id
        )

    attributes = [
        AttributeOut.model_validate(a)
        for a in (await session.execute(stmt)).scalars().all()
    ]
    if (await session.execute(select(exists(no_attribute_check)))).scalar():
        attributes.append(NO_ATTRIBUTE)
    return attributes


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    category_id: str | None = Query(
        default=None, description="Restrict to a single category."
    ),
    attribute_id: list[str] | None = Query(
        default=None, description=ATTRIBUTE_FILTER_HELP
    ),
    session: AsyncSession = Depends(get_session),
):
    """Products, optionally filtered by category and/or attributes."""
    stmt = (
        select(Product)
        .options(selectinload(Product.attributes))
        .order_by(Product.product_name, Product.variant)
    )
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    stmt = apply_attribute_filter(stmt, attribute_id)
    result = await session.execute(stmt)
    return result.scalars().all()
