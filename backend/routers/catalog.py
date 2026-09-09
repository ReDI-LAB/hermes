"""Catalog endpoints: categories, attributes and products."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from models import Attribute, Category, Product
from schemas import AttributeOut, CategoryOut, ProductOut

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(session: AsyncSession = Depends(get_session)):
    """Top-level filter categories, in display order."""
    result = await session.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()


@router.get("/attributes", response_model=list[AttributeOut])
async def list_attributes(session: AsyncSession = Depends(get_session)):
    """Product attributes (Alcoholic, Non-Alcoholic, Vegan, Non-Vegan)."""
    result = await session.execute(select(Attribute).order_by(Attribute.sort_order))
    return result.scalars().all()


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    category_id: str | None = Query(
        default=None, description="Restrict to a single category."
    ),
    attribute_id: str | None = Query(
        default=None, description="Restrict to a single attribute."
    ),
    session: AsyncSession = Depends(get_session),
):
    """Products, optionally filtered by category and/or attribute."""
    stmt = select(Product).order_by(Product.product_name, Product.variant)
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if attribute_id is not None:
        stmt = stmt.where(Product.attribute_id == attribute_id)
    result = await session.execute(stmt)
    return result.scalars().all()
