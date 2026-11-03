-- ====================================================================
-- FUNKY FOX ECOMMERCE PLATFORM
-- Migration: 20261102100000_add_unique_variant_index.sql
-- Description: Enforce catalog integrity by preventing duplicate variants
--              for the same product with identical normalized size and color.
-- Safe for execution: Fully idempotent.
-- Target: Supabase PostgreSQL (Run via Supabase Dashboard -> SQL Editor)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PRE-MIGRATION AUDIT (Diagnostic Query)
-- Run this check before applying the unique index. If any duplicate rows
-- are returned, resolve them prior to running step 2.
-- --------------------------------------------------------------------
/*
SELECT
    product_id,
    pg_catalog.lower(pg_catalog.btrim(size)) AS normalized_size,
    pg_catalog.lower(pg_catalog.btrim(color_name)) AS normalized_color,
    pg_catalog.count(*) AS duplicate_count,
    pg_catalog.array_agg(id) AS variant_ids,
    pg_catalog.array_agg(stock) AS stock_distributions
FROM public.product_variants
GROUP BY
    product_id,
    pg_catalog.lower(pg_catalog.btrim(size)),
    pg_catalog.lower(pg_catalog.btrim(color_name))
HAVING pg_catalog.count(*) > 1;
*/

-- --------------------------------------------------------------------
-- 2. NORMALIZED UNIQUE INDEX ON PRODUCT VARIANTS
-- --------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_variants_prod_size_color
ON public.product_variants (
    product_id,
    (pg_catalog.lower(pg_catalog.btrim(size))),
    (pg_catalog.lower(pg_catalog.btrim(color_name)))
);
