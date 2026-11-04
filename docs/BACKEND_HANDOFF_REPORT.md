# Funky Fox E-Commerce — Backend Architecture & Handoff Report

**Date**: November 4, 2026  
**Project**: Funky Fox Web Storefront & Admin Panel  
**Audience**: Backend Engineering Team, Database Administrators, Product Architecture  
**Database**: Supabase PostgreSQL (`https://gcvtitcegolmkhjqqpit.supabase.co`)  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS  

---

## Executive Summary

Today's work completed the stabilization of the product catalog, performed a deep read-only security audit of customer authentication, and designed the comprehensive database migration for real customer authentication, profile provisioning, order ownership, customer-scoped Row Level Security (RLS), hardened checkout, and order cancellation.

All database work has been implemented as an idempotent, transaction-safe migration file:
[`supabase/migrations/20261104171000_customer_auth_security_foundation.sql`](../supabase/migrations/20261104171000_customer_auth_security_foundation.sql).

**Current Status**: The migration file has been completely reviewed and corrected locally. It is staged and ready for your team's manual review. **It has not yet been applied to the remote Supabase database.**

---

## 1. What We Did Today

### 1.1 Catalog Stabilization & Inventory Reconciliation (Phase 1)
- Reconciled discrepancies between static data (`src/data/products.ts`), Supabase seed scripts, and the live database.
- Cleaned up automated test records from earlier runs (1 test product, 4 test variants, test orders).
- Audited and verified live database counts:
  - **Products**: Exactly 158 active catalog products.
  - **Variants**: Exactly 1,336 color/size variants.
  - **Categories**: Exactly 4 core categories (`Suits`, `Blazers`, `Trousers`, `Ethnic Wear`).
  - **Customer Orders**: 0 test orders (database is in a pristine state).
  - **Customers**: 0 dummy customers.
  - **Admin Users**: 1 authoritative admin (`funkyfox269@gmail.com`).
- Resolved image path mappings for demo apparel across all categories.

### 1.2 Phase 2A Customer Authentication & Database Security Audit
- Audited existing customer auth: found that the storefront previously simulated customer login using `localStorage` (`user` / `auth_token`), completely bypassed Supabase Auth (`auth.users`), and displayed mock orders in the customer account area.
- Discovered that `public.customers` and `public.orders` lacked `auth_user_id` foreign keys, preventing cryptographic order ownership.
- Audited RLS policies, store settings, coupon engine, checkout concurrency, and inventory deduction mechanisms.

### 1.3 Phase 2B.1 Database Foundation Migration
Authored and refined [`supabase/migrations/20261104171000_customer_auth_security_foundation.sql`](../supabase/migrations/20261104171000_customer_auth_security_foundation.sql) to establish real authentication and database integrity. Key features:

1. **Schema Enhancements**:
   - Added `auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` to `public.customers`.
   - Added `auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL` to `public.orders`.
   - Replaced table-level `customers_email_key` with a partial unique index `uq_customers_registered_email ON customers(lower(email)) WHERE auth_user_id IS NOT NULL`. This allows historical guest purchases (`auth_user_id IS NULL`) to coexist with registered accounts without unique constraint collisions.

2. **Automated Customer Profile Provisioning (`handle_new_user`)**:
   - `AFTER INSERT ON auth.users` trigger.
   - Automatically provisions a dedicated customer record in `public.customers` when a user signs up.
   - **Crucial Security Fix**: It does **not** automatically claim historical guest records based on email matching alone. Registered profiles start clean, isolating past guest order data until explicit verification is implemented.

3. **Field Protection Trigger (`protect_customer_fields`)**:
   - `BEFORE UPDATE ON public.customers`.
   - Blocks non-admin callers from modifying sensitive fields (`id`, `auth_user_id`, `email`, `total_orders`, `total_spent`, `notes`, `created_at`).

4. **Normalized Customer Addresses (`customer_addresses`)**:
   - Stores multiple delivery addresses per authenticated user.
   - Enforces database-level constraint `uq_customer_addresses_default (user_id) WHERE is_default = true`.
   - Trigger `handle_default_customer_address` automatically demotes previous default addresses when a new default is set.

5. **Wishlist Table (`wishlist_items`)**:
   - Stores customer favorites with `UNIQUE (user_id, product_id)`.
   - Protected by user-scoped RLS policies.

6. **Product Reviews & Verified Purchase Validation (`product_reviews`)**:
   - Enforces that reviews submitted or updated by customers are forced to `status = 'pending'` (admin moderation required).
   - Trigger `validate_review_submission` validates verified-purchase status (`is_verified_purchase`): strictly verifies that the submitted `order_id` belongs to `auth.uid()`, has `shipping_status = 'delivered'`, and actually contained the reviewed `product_id`.

7. **Hardened Checkout RPC (`create_customer_order`)**:
   - **Identity Binding**: Automatically detects `auth.uid()`. If authenticated, derives customer email authoritatively from `auth.users` / JWT claims (ignoring spoofed client email inputs).
   - **Safe Guest Checkout**:
     - *New Email*: Inserts dedicated guest record into `public.customers` (`auth_user_id = NULL`) so `orders.customer_id` satisfies foreign key constraints.
     - *Email Belongs to Registered Account*: Sets `orders.customer_id := NULL` and `orders.auth_user_id := NULL`. In PostgreSQL, `NULL` satisfies nullable foreign keys. The registered customer's profile is not modified, touched, or contaminated.
     - *Existing Guest Record*: Reuses existing guest record and updates contact details.
   - **Rate Limiting**: Restored 5 orders per 10 minutes limit per email / user identity.
   - **Coupon Validation**: Strict percentage bounds (`> 0 AND <= 100`), fixed discount bounds (`> 0`), usage limits, and explicit rejection of unsupported discount types.
   - **Inventory Locking & Aggregation**: Locks product/variant rows `FOR UPDATE`. Enforces maximum 10 units per consolidated line item.

8. **Secure Order Cancellation RPC (`cancel_customer_order`)**:
   - Accessible only to authenticated owners (`auth.uid()`) and store admins (`public.is_admin()`). Public/anon access revoked.
   - Serializes concurrent cancellation attempts using row-level locking (`orders FOR UPDATE`).
   - Validates state machine: only orders in `('pending', 'confirmed', 'processing', 'packed')` can be cancelled. Once cancelled, repeated calls immediately abort, preventing duplicate stock restorations.
   - Locks catalog products and exact child variants. If a variant cannot be found, aborts transaction (refuses silent parent stock restoration).
   - Atomically restores both variant `stock` and parent `total_stock`, and records accurate `previous_quantity` and `new_quantity` in `inventory_logs`.
   - Appends an audit event to `orders.timeline`.

9. **Customer-Scoped Row Level Security (RLS)**:
   - Full RLS policies for `customers`, `orders`, `order_items`, `customer_addresses`, `wishlist_items`, and `product_reviews`.
   - Direct table `INSERT` / `UPDATE` on `orders` and `order_items` is disabled for customers; all orders must go through the transactional RPCs.

---

## 2. Where We Are Right Now

```
+--------------------------------------------------------------------------------+
| CURRENT ARCHITECTURAL STATE                                                    |
+--------------------------------------------------------------------------------+
| Catalog & Inventory        |  158 Products, 1,336 Variants, 4 Categories        |
| Storefront UI & Routing     |  Complete & Functional (Production Build Passes)   |
| Remote Database State      |  Clean Baseline (0 test orders, 1 admin user)     |
| Phase 2B.1 Migration       |  Written, Verified, Ready to Apply (Local SQL)    |
| Remote Supabase DB Applied |  NOT YET APPLIED (Awaiting Backend Review)        |
| Razorpay Payment Gateway   |  POSTPONED (Pending Merchant Account Approval)    |
+--------------------------------------------------------------------------------+
```

1. **Local Files Modified**:
   - `supabase/migrations/20261104171000_customer_auth_security_foundation.sql` (Comprehensive security migration).
2. **Frontend Build Verification**:
   - `tsc -b && vite build` succeeded in 24.3s with zero errors.
3. **Database Operations Executed Today**:
   - Read-only queries for audit and inspection.
   - Cleaned up isolated test data from earlier testing sessions.
   - **Zero schema changes or destructive operations applied to remote database.**

---

## 3. What's Left for Backend & Supabase (Roadmap to 100% Production Ready)

To make Funky Fox 100% complete and production-ready, here is the prioritized checklist for the backend team:

### Priority 1: Apply and Verify Database Foundation Migration
- [ ] **Review Migration**: Inspect [`supabase/migrations/20261104171000_customer_auth_security_foundation.sql`](../supabase/migrations/20261104171000_customer_auth_security_foundation.sql).
- [ ] **Execute Migration**: Run the migration in the Supabase Dashboard SQL Editor (runs within a single transaction `BEGIN ... COMMIT`).
- [ ] **Verify Database Objects**:
  - Check columns: `customers.auth_user_id`, `orders.auth_user_id`.
  - Check triggers: `trg_protect_customer_fields` on `customers`, `on_auth_user_created` on `auth.users`, `trg_handle_default_customer_address` on `customer_addresses`, `trg_validate_review_submission` on `product_reviews`.
  - Check RPCs: `create_customer_order(jsonb)`, `cancel_customer_order(text, text)`.
  - Check permissions: Verify execute permissions on RPCs and ensure triggers have public execute revoked.

### Priority 2: Supabase Auth & Email Configuration
- [ ] **Configure Supabase Auth Settings**:
  - In Supabase Dashboard -> Authentication -> Providers -> Email:
    - Determine email confirmation policy: If "Confirm email" is enabled, configure SMTP.
    - If disabled during development/demo, confirm auto-confirm behavior.
  - Set Site URL and Redirect URLs (`http://localhost:5173`, production domain).
- [ ] **Transactional Email SMTP Setup**:
  - Connect custom SMTP provider (e.g. Resend, SendGrid, Amazon SES) in Supabase Auth settings to avoid the default rate limit (3 emails/hour on free tier).
  - Customize email templates for:
    - User Sign Up / Email Confirmation.
    - Password Reset.
    - Magic Link (if enabled).

### Priority 3: Frontend Supabase Auth Integration (Phase 2B.2 & 2B.3)
- [ ] **Replace Simulated Auth Service**:
  - Migrate [`src/services/customerAuthService.ts`](../src/services/customerAuthService.ts) from `localStorage` mock to real Supabase Auth:
    - `supabase.auth.signUp({ email, password, options: { data: { name, phone } } })`
    - `supabase.auth.signInWithPassword({ email, password })`
    - `supabase.auth.signOut()`
    - `supabase.auth.onAuthStateChange()` session listener.
- [ ] **Bind Customer Profile & Account Pages**:
  - In `src/pages/Account.tsx`, `Orders.tsx`, `Addresses.tsx`, `Wishlist.tsx`:
    - Fetch orders directly from `supabase.from('orders').select('*, order_items(*)')`.
    - Because of RLS (`auth_user_id = auth.uid()`), queries automatically return only orders owned by the logged-in customer.
- [ ] **Enable Customer Order Cancellation**:
  - In `src/pages/OrderDetail.tsx`, wire the "Cancel Order" button to call:
    `supabase.rpc('cancel_customer_order', { p_order_id: orderId, p_reason: reason })`.

### Priority 4: Razorpay Payment Integration (When Merchant Approval Arrives)
- [ ] **Serverless / Edge Function for Razorpay Order Creation**:
  - Create Supabase Edge Function `create-razorpay-order`:
    - Calls Razorpay API: `POST /v1/orders` with amount in paise and currency `INR`.
    - Returns `razorpay_order_id`.
- [ ] **Serverless / Edge Function for Webhook & Signature Verification**:
  - Create Supabase Edge Function `verify-razorpay-payment`:
    - Computes HMAC SHA-256 signature using `RAZORPAY_KEY_SECRET`.
    - Compares with `razorpay_signature`.
    - On valid signature, transitions order `payment_status := 'paid'`.

### Priority 5: Order Notifications & Webhooks
- [ ] **Database Webhook or Edge Function on Order Placement**:
  - Send transactional customer notifications:
    - Order Confirmation Email with order summary and tracking link.
    - WhatsApp / SMS notification (optional, via Twilio / Gupshup / WhatsApp Cloud API).
- [ ] **Order Status Change Notifications**:
  - When admin updates status to `shipped` or `out_for_delivery` in the admin panel, trigger notification with tracking number and courier link.

### Priority 6: Storage Buckets & Policies
- [ ] **Verify Storage Buckets in Supabase**:
  - `product-images`: Public read.
  - `media-library`: Admin-only write, public read.
  - Review storage RLS policies in `supabase/schema.sql` (lines 1085–1123).

---

## 4. Key Database Constraints & Definitions Reference

For quick reference by the backend team, here are the critical constraints in the schema:

| Table | Constraint / Index | Type | Definition / Purpose |
|---|---|---|---|
| `customers` | `uq_customers_registered_email` | Partial Unique Index | `UNIQUE (lower(email)) WHERE auth_user_id IS NOT NULL` — Prevents registered email collisions while permitting historical guest orders. |
| `customers` | `uq_customers_auth_user_id` | Partial Unique Index | `UNIQUE (auth_user_id) WHERE auth_user_id IS NOT NULL` — 1:1 binding with Supabase Auth. |
| `customer_addresses` | `uq_customer_addresses_default` | Partial Unique Index | `UNIQUE (user_id) WHERE is_default = true` — Exactly one default address per customer. |
| `wishlist_items` | `uq_wishlist_user_product` | Unique Constraint | `UNIQUE (user_id, product_id)` — Prevents duplicate wishlist entries. |
| `product_reviews` | `uq_product_reviews_user_product` | Unique Constraint | `UNIQUE (user_id, product_id)` — One review per product per user. |
| `orders` | `chk_orders_shipping_status` | Check Constraint | Strictly limits status to: `pending`, `confirmed`, `processing`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`. |
| `orders` | `uq_orders_order_number` | Unique Constraint | Ensures unique reference numbers (`FF-YYMMDD-XXXXXX`). |
| `orders` | `idx_orders_idempotency_key` | Partial Unique Index | `UNIQUE (idempotency_key) WHERE idempotency_key IS NOT NULL` — Prevents duplicate order placement. |

---

## 5. Contact & Questions

If you have any questions or need adjustments to the RPC parameters, state machines, or schema definitions before applying the migration, refer to:
- Migration: [`supabase/migrations/20261104171000_customer_auth_security_foundation.sql`](../supabase/migrations/20261104171000_customer_auth_security_foundation.sql)
- Baseline Schema: [`supabase/schema.sql`](../supabase/schema.sql)
- Connection Guide: [`docs/SUPABASE_CONNECTION.md`](SUPABASE_CONNECTION.md)

