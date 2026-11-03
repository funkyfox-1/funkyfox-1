# Funky Fox — Storefront Client Handover Documentation

Welcome to the **Funky Fox** e-commerce codebase! This repository contains the complete customer-facing web storefront built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 1. Quick Start

### Prerequisites
* **Node.js** >= 18.0.0
* **npm** >= 9.0.0

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
# -> Local server starts at http://localhost:5173
```

### Production Build & Verification
```bash
# Type check and build optimized static assets
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Brand Identity & Design System

Funky Fox uses an editorial design aesthetic inspired by high-end direct-to-consumer fashion brands.

### Brand Color Tokens
Defined in [`src/index.css`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/index.css):
* **Fox Orange (Primary):** `#E87535` (`--color-fox` / `--color-orange-primary`)
* **Fox Orange Deep (Hover/Active):** `#C95D25` (`--color-fox-deep` / `--color-orange-hover`)
* **Warm Paper (Background):** `#F7F7F5` / `#FAF9F6` (`--color-paper`)
* **Ink Black (Primary Text):** `#191919` (`--color-ink`)
* **Soft Neutral (Muted Text):** `#737373` (`--color-soft`)
* **Border Line:** `#E7E7E5` (`--color-line`)

### Typography
* **Display / Editorial Headings:** `Archivo`, `Bricolage Grotesque`
* **Body / UI Controls:** `Montserrat`, system sans-serif
* **Handwritten Editorial Notes:** `Caveat`

### Custom Theming Polish
* Custom `::selection` highlighted with subtle 22% Fox Orange tint.
* Custom input `caret-color: #E87535`.
* Thin themed scrollbars on desktop.
* Mobile form inputs styled with `16px` font-size to prevent unwanted iOS Safari viewport auto-zoom.

---

## 3. Storefront Architecture & Routes

| Route | Page Component | Features & Purpose |
|---|---|---|
| `/` | `HomePage` ([`FunkyFox.jsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/FunkyFox.jsx)) | Interactive Clothing Rail Hero, Category circles, Highlights strip, Everyday Lineup, Ethnic Wear section, FAQ accordion, Brand Standard Bento, and Pushpin Tear Footer. |
| `/products` | `ShopPage` ([`ShopPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/ShopPage.tsx)) | Full catalog with category chips, price/color/size filtering, search query filtering, and custom sorting dropdown. |
| `/products/:id` | `ProductDetailPage` ([`ProductDetailPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/ProductDetailPage.tsx)) | Multi-angle photo gallery, size selector, live pincode delivery estimator, tactile add-to-bag button, sticky mobile purchase bar, and 3-column recommendation tiers. |
| `/cart`, `/bag` | `CartPage` ([`CartPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/CartPage.tsx)) | Bag contents, quantity adjustments, free shipping progress bar, promo code validation engine, and empty state. |
| `/checkout` | `CheckoutPage` ([`CheckoutPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/CheckoutPage.tsx)) | 3-step checkout (Delivery Address, Payment Method, Order Review), live state dropdown, SlideCommit purchase button, and TilesLoader transition. |
| `/order-confirmation` | `OrderConfirmationPage` ([`OrderConfirmationPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/OrderConfirmationPage.tsx)) | Minimalist post-purchase screen featuring mascot illustration, checkmark badge, and return-to-shop CTA. |
| `/account` | `AccountOverview` ([`AccountOverview.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountOverview.tsx)) | Customer portal dashboard with SVG-blended mascot, Fox Club loyalty tier, rewards points, and quick action cards. |
| `/account/orders` | `AccountOrders` ([`AccountOrders.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountOrders.tsx)) | Order history, real-time shipment status badges, and direct "Rate Fit" review triggers. |
| `/account/orders/:orderId` | `OrderDetailPage` ([`OrderDetailPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/OrderDetailPage.tsx)) | Order receipt breakdown, live tracking stepper milestones, cancel/return modal, and Delivered Order Review Card. |
| `/account/wishlist` | `AccountWishlist` ([`AccountWishlist.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountWishlist.tsx)) | 3 products per row grid, quick size selectors, color swatches, stock badges, batch "Move All to Bag", and trending piece recommendations. |
| `/account/reviews` | `AccountReviews` ([`AccountReviews.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountReviews.tsx)) | Verified customer product ratings, fit perception breakdown, and new review composer. |
| `/account/addresses` | `AccountAddresses` ([`AccountAddresses.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountAddresses.tsx)) | Saved delivery address management (add, edit, delete, set default). |
| `/account/profile` | `AccountProfile` ([`AccountProfile.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AccountProfile.tsx)) | Customer details, catalog preferences, fit sizing preferences, and password settings. |
| `/login`, `/register` | `AuthPages` ([`AuthPages.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/account/AuthPages.tsx)) | Responsive horizontal split authentication screens with brand testimonial sidebars. |
| `/about` | `AboutPage` ([`AboutPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/AboutPage.tsx)) | Brand heritage, fabric craftsmanship, and sustainability ethos. |
| `/help`, `/contact` | `HelpPage` ([`HelpPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/HelpPage.tsx)) | Support topics, shipping policies, returns FAQ, and contact ticket submission. |

---

## 4. Backend & API Integration Guide

The storefront currently runs in **Demo Mode** using persistent `localStorage` and simulated services. To connect to your live backend (Supabase, Firebase, or Custom REST / GraphQL):

### 1. Products & Catalog
* **Current file:** [`src/data/products.ts`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/data/products.ts)
* **Integration point:** Replace static arrays with API fetch calls (`GET /api/v1/products`). The `Product` TypeScript interface matches standard e-commerce schemas.

### 2. User Authentication & Profile
* **Current file:** [`src/data/accountMockData.ts`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/data/accountMockData.ts)
* **Integration point:** Replace `getDemoUser()` and `setDemoUser()` with your auth provider (Supabase Auth, Auth0, or NextAuth session cookie).

### 3. Orders & Tracking
* **Current file:** [`src/data/accountMockData.ts`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/data/accountMockData.ts)
* **Integration point:** Replace `getDemoOrders()` and `createDemoOrder()` with endpoints:
  * `POST /api/v1/orders` (called on successful checkout)
  * `GET /api/v1/orders/:orderId` (order details & milestone tracking)
  * `POST /api/v1/orders/:orderId/cancel` (order cancellation)
  * `POST /api/v1/orders/:orderId/return` (exchange or return RMA generation)

### 4. Payments
* **Current file:** [`src/components/CheckoutPage.tsx`](file:///c:/Users/prashanth/Downloads/funkyfox.web/src/components/CheckoutPage.tsx)
* **Integration point:** In `handlePaymentProceed()`, initialize your gateway (Razorpay Standard Checkout SDK or Stripe Elements). On payment webhook success, navigate to `/order-confirmation?orderId=...`.

---

## 5. Deployment

### Vercel / Netlify Deploy
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Install Command:** `npm install`
* **Single Page Application Routing:** Ensure all routes redirect to `index.html` (configured via `vercel.json` or `_redirects`).

---

© 2026 Funky Fox Menswear. Crafted for everyday life.

