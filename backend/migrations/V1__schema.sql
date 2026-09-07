-- Project Hermes MVP schema.
-- Source of truth for the database structure. 

-- Model: Area 1:n Vendor; Category 1:n Product; Vendor n:m Product via Offering;
--        Offering 0:1 Activity_Details.

CREATE TABLE categories (
    category_id   TEXT PRIMARY KEY,
    category_name TEXT NOT NULL,
    description   TEXT,
    sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE areas (
    area_id     TEXT PRIMARY KEY,
    area_name   TEXT NOT NULL,
    description TEXT
);

CREATE TABLE vendors (
    vendor_id   TEXT PRIMARY KEY,
    vendor_name TEXT NOT NULL,
    vendor_type TEXT,
    area_id     TEXT NOT NULL REFERENCES areas (area_id),
    location    TEXT,
    notes       TEXT
);

CREATE TABLE products (
    product_id     TEXT PRIMARY KEY,
    category_id    TEXT NOT NULL REFERENCES categories (category_id),
    product_name   TEXT NOT NULL,
    variant        TEXT,
    unit           TEXT,
    is_traditional BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE offerings (
    offering_id      TEXT PRIMARY KEY,
    vendor_id        TEXT NOT NULL REFERENCES vendors (vendor_id),
    product_id       TEXT NOT NULL REFERENCES products (product_id),
    price_eur        NUMERIC(8, 2) NOT NULL CHECK (price_eur >= 0),
    is_new_this_year BOOLEAN NOT NULL DEFAULT FALSE,
    source           TEXT,
    last_price_update DATE
);

CREATE TABLE activity_details (
    offering_id    TEXT PRIMARY KEY REFERENCES offerings (offering_id),
    min_age        INTEGER,
    min_height_cm  INTEGER,
    max_height_cm  INTEGER,
    thrill_level   TEXT CHECK (thrill_level IN ('Low', 'Medium', 'High')),
    family_friendly BOOLEAN,
    access_note    TEXT
);

-- Indexes supporting the core Category -> Product -> Max Price -> Vendor query
-- and the Price / Product sort options.
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_offerings_product ON offerings (product_id);
CREATE INDEX idx_offerings_vendor ON offerings (vendor_id);
CREATE INDEX idx_offerings_price ON offerings (price_eur);
