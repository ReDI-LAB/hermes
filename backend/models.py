"""SQLAlchemy ORM models.

These mirror the Flyway-managed schema in db/migration/V1__schema.sql. They are
used only for querying/mapping - Flyway remains the single source of truth for
the schema, so there is no Alembic and these models never emit DDL.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[str] = mapped_column(Text, primary_key=True)
    category_name: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer)

    products: Mapped[list[Product]] = relationship(back_populates="category")


class Attribute(Base):
    __tablename__ = "attributes"

    attribute_id: Mapped[str] = mapped_column(Text, primary_key=True)
    attribute_name: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer)

    products: Mapped[list[Product]] = relationship(back_populates="attribute")


class Area(Base):
    __tablename__ = "areas"

    area_id: Mapped[str] = mapped_column(Text, primary_key=True)
    area_name: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)

    vendors: Mapped[list[Vendor]] = relationship(back_populates="area")


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id: Mapped[str] = mapped_column(Text, primary_key=True)
    vendor_name: Mapped[str] = mapped_column(Text)
    vendor_type: Mapped[str | None] = mapped_column(Text)
    area_id: Mapped[str] = mapped_column(ForeignKey("areas.area_id"))
    location: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)

    area: Mapped[Area] = relationship(back_populates="vendors")
    offerings: Mapped[list[Offering]] = relationship(back_populates="vendor")


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(Text, primary_key=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.category_id"))
    product_name: Mapped[str] = mapped_column(Text)
    variant: Mapped[str | None] = mapped_column(Text)
    unit: Mapped[str | None] = mapped_column(Text)
    is_traditional: Mapped[bool] = mapped_column(Boolean)
    attribute_id: Mapped[str | None] = mapped_column(
        ForeignKey("attributes.attribute_id")
    )

    category: Mapped[Category] = relationship(back_populates="products")
    attribute: Mapped[Attribute | None] = relationship(back_populates="products")
    offerings: Mapped[list[Offering]] = relationship(back_populates="product")


class Offering(Base):
    __tablename__ = "offerings"

    offering_id: Mapped[str] = mapped_column(Text, primary_key=True)
    vendor_id: Mapped[str] = mapped_column(ForeignKey("vendors.vendor_id"))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.product_id"))
    price_eur: Mapped[Decimal] = mapped_column(Numeric(8, 2))
    is_new_this_year: Mapped[bool] = mapped_column(Boolean)
    source: Mapped[str | None] = mapped_column(Text)
    last_price_update: Mapped[date | None] = mapped_column()

    vendor: Mapped[Vendor] = relationship(back_populates="offerings")
    product: Mapped[Product] = relationship(back_populates="offerings")
    activity_details: Mapped[ActivityDetail | None] = relationship(
        back_populates="offering", uselist=False
    )


class ActivityDetail(Base):
    __tablename__ = "activity_details"

    offering_id: Mapped[str] = mapped_column(
        ForeignKey("offerings.offering_id"), primary_key=True
    )
    min_age: Mapped[int | None] = mapped_column(Integer)
    min_height_cm: Mapped[int | None] = mapped_column(Integer)
    max_height_cm: Mapped[int | None] = mapped_column(Integer)
    thrill_level: Mapped[str | None] = mapped_column(Text)
    family_friendly: Mapped[bool | None] = mapped_column(Boolean)
    access_note: Mapped[str | None] = mapped_column(Text)

    offering: Mapped[Offering] = relationship(back_populates="activity_details")
