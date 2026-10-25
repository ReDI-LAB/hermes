-- Project Hermes MVP - a product can have several attributes (e.g. Hot + Vegan).
-- Source: Project_Hermes_MVP_Placeholder_Data_Model_5.xlsx
--   (sheets Attributes and Map_Attribute_Product).
--
-- 1. Add the new attributes Hot and Cold.
-- 2. Create the map_products_attributes mapping table (product n:m attribute).
-- 3. Fill it: every existing products.attribute_id link plus the new ones.
-- 4. Drop products.attribute_id, now replaced by the mapping table.

INSERT INTO attributes (attribute_id, attribute_name, description, sort_order) VALUES
    ('A005', 'Hot', 'Served warm, such as roast chicken, Kaiserschmarrn, hot chocolate or mulled wine', 5),
    ('A006', 'Cold', 'Served cold or chilled, such as beer, soft drinks, ice cream or salads', 6);

CREATE TABLE map_products_attributes (
    product_attribute_id TEXT PRIMARY KEY,
    product_id           TEXT NOT NULL REFERENCES products (product_id),
    attribute_id         TEXT NOT NULL REFERENCES attributes (attribute_id),
    -- The same attribute can be linked to a product only once.
    CONSTRAINT uq_map_products_attributes UNIQUE (product_id, attribute_id)
);

-- The unique constraint already indexes (product_id, attribute_id);
-- this one supports filtering products by attribute.
CREATE INDEX idx_map_products_attributes_attribute ON map_products_attributes (attribute_id);

COMMENT ON TABLE map_products_attributes IS
    'Mapping table: which attributes each product has (products n:m attributes).';

INSERT INTO map_products_attributes (product_attribute_id, product_id, attribute_id) VALUES
    ('PA001', 'P001', 'A001'),
    ('PA002', 'P001', 'A006'),
    ('PA003', 'P002', 'A001'),
    ('PA004', 'P002', 'A006'),
    ('PA005', 'P003', 'A001'),
    ('PA006', 'P003', 'A006'),
    ('PA007', 'P004', 'A001'),
    ('PA008', 'P004', 'A006'),
    ('PA009', 'P005', 'A002'),
    ('PA010', 'P005', 'A006'),
    ('PA011', 'P020', 'A002'),
    ('PA012', 'P020', 'A006'),
    ('PA013', 'P021', 'A002'),
    ('PA014', 'P021', 'A006'),
    ('PA015', 'P022', 'A002'),
    ('PA016', 'P022', 'A006'),
    ('PA017', 'P023', 'A002'),
    ('PA018', 'P023', 'A006'),
    ('PA019', 'P024', 'A002'),
    ('PA020', 'P024', 'A006'),
    ('PA021', 'P025', 'A002'),
    ('PA022', 'P025', 'A005'),
    ('PA023', 'P026', 'A002'),
    ('PA024', 'P026', 'A005'),
    ('PA025', 'P040', 'A004'),
    ('PA026', 'P040', 'A005'),
    ('PA027', 'P041', 'A004'),
    ('PA028', 'P041', 'A005'),
    ('PA029', 'P042', 'A004'),
    ('PA030', 'P042', 'A005'),
    ('PA031', 'P043', 'A004'),
    ('PA032', 'P043', 'A005'),
    ('PA033', 'P044', 'A004'),
    ('PA034', 'P045', 'A004'),
    ('PA035', 'P045', 'A005'),
    ('PA036', 'P046', 'A004'),
    ('PA037', 'P046', 'A005'),
    ('PA038', 'P047', 'A004'),
    ('PA039', 'P047', 'A005'),
    ('PA040', 'P048', 'A004'),
    ('PA041', 'P048', 'A006'),
    ('PA042', 'P049', 'A003'),
    ('PA043', 'P049', 'A005'),
    ('PA044', 'P050', 'A004'),
    ('PA045', 'P050', 'A005'),
    ('PA046', 'P051', 'A003'),
    ('PA047', 'P051', 'A005'),
    ('PA048', 'P052', 'A003'),
    ('PA049', 'P052', 'A005'),
    ('PA050', 'P053', 'A003');

-- Safety net: stop the migration (and roll it back) if any existing
-- products.attribute_id link is missing from the mapping above.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM products p
        WHERE p.attribute_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM map_products_attributes pa
              WHERE pa.product_id = p.product_id
                AND pa.attribute_id = p.attribute_id
          )
    ) THEN
        RAISE EXCEPTION 'map_products_attributes is missing an existing products.attribute_id link';
    END IF;
END $$;

DROP INDEX idx_products_attribute;
ALTER TABLE products DROP COLUMN attribute_id;
