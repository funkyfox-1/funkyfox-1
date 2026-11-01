# Funky Fox — Made for Your Everyday

> **Premium Everyday Indian Streetwear & Men's Essentials Storefront**  
> *Cut well. Priced fair. Delivered across India.*

🌐 **Live Demo:** [https://funkyfox-demo1.vercel.app](https://funkyfox-demo1.vercel.app)  
📦 **Repository:** [https://github.com/prashanthpoloju990-oss/funkyfox](https://github.com/prashanthpoloju990-oss/funkyfox)

---

## 🦊 Overview

**Funky Fox** is a modern, high-conversion direct-to-consumer (D2C) e-commerce storefront crafted for the everyday Indian wardrobe. Engineered with editorial fashion sensibilities, tactile micro-interactions, and fluid micro-animations, it bridges high-fashion lookbook aesthetics with lightning-fast shopping utility.

---

## ✨ Key Highlights & Features

### 1. 🧥 Interactive Product Rail Gallery
- Inspired by boutique showroom racks, built from the signature **DHxWhy 21st.dev** rail gallery component.
- Interactive wooden hangers with real-time sliding, tilt rotations, tactile click inspection, and quick-add to bag.
- Automatic continuous carousel mode with smooth resume on user touch or drag.

### 2. ❓ 2-Column Text-Reveal FAQs (Ruixen UI Reference)
- Clean, editorial 2-column layout with a persistent desktop header and interactive support contact links.
- Streamlined to the 5 most critical customer decisions: fabric craftsmanship (220 GSM combed organic cotton), pan-India delivery speed & free thresholds, risk-free 15-day doorstep exchange guarantee, relaxed fit sizing guide, and payment methods (UPI, Cards, NetBanking, COD).
- Smooth chevron rotation and animated answer reveal.

### 3. 🫧 Floating Pill Navigation
- Ultra-modern floating frosted glass header bar with smooth scroll blur transitions.
- Quick navigation to **Home**, **Shop**, **About Us**, and **Rewards**.
- Inline utility actions: Customer account status indicator, live catalog search overlay, and reactive shopping bag counter with side slide-out drawer.
- Responsive mobile drawer menu with deep links into orders, saved fits, and support.

### 4. 📌 Pushpin Tear Poster Footer
- A showstopping site footer styled as an electric torn poster.
- Custom canvas-rendered paper grain texture, mathematically simulated jagged paper fibers, curling shadows, and an interactive glossy orange pushpin.
- Optimized with session-based memory so the rip animation plays once on first arrival, keeping navigation seamless.

### 5. 🎚️ Tactile JellyRadio Size Selectors
- Fluid physics-based animated chip selectors powered by motion.
- Integrated across product detail pages, the quick-size modal, and customer wishlist cards for an addictive, bouncy tactile experience.

### 6. 👤 Comprehensive Customer Account & Post-Purchase Hub
- **Account Overview:** VIP tier level (The Fox Club), reward points wallet, recent orders snapshot, and quick account shortcuts.
- **Order Tracking:** Real-time visual timeline stepper (Order Placed → Paid → Shipped → Courier Dispatch → Delivered), delivery ETA, package items, item pricing, and return requests.
- **Saved Fits Wishlist:** Live inventory badges, colorway pills, and single-click bag moves.
- **Saved Addresses & Profile:** Default shipping address selector and customer style preferences.

---

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables
- **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Animations:** [Framer Motion / Motion](https://motion.dev/) + Custom SVG Canvas Algorithms
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **Deployment:** [Vercel](https://vercel.com/) with single-page routing rewrite rules

---

## 📂 Project Structure

```text
funkyfox.web/
├── public/                     # Static media assets, hero cuts & model photography
│   └── images/
│       ├── about/              # Editorial lookbook photography & collage assets
│       └── products/           # Garment mockups & lifestyle product imagery
├── src/
│   ├── components/
│   │   ├── account/            # Customer account pages (Orders, Wishlist, Addresses, Profile)
│   │   ├── ui/                 # Reusable UI primitives (FloatingNavbar, FAQSection, JellyRadio, Footer)
│   │   ├── AboutPage.tsx       # Brand story, mission, metrics & values
│   │   ├── CartPage.tsx        # Shopping bag & shipping calculation
│   │   ├── CheckoutPage.tsx    # Multi-step pan-India checkout flow
│   │   ├── ClothingRailHero.tsx# Interactive clothing rail gallery
│   │   ├── HelpPage.tsx        # Customer support center
│   │   ├── HeroHighlightsStrip.tsx # Continuous announcement marquee ticker
│   │   ├── ProductDetailPage.tsx # PDP with JellyRadio sizing & gallery zoom
│   │   └── ShopPage.tsx        # Filterable catalog with search & sorting
│   ├── data/
│   │   ├── accountMockData.ts  # Demo customer account, orders & wishlist store
│   │   └── products.ts         # Garment catalog, pricing, fabric specs & colors
│   ├── FunkyFox.jsx            # Core application router & homepage layout
│   └── index.css               # Global theme tokens, typography & smooth scroll rules
├── vercel.json                 # Vercel SPA rewrite configuration
└── package.json                # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/prashanthpoloju990-oss/funkyfox.git

# Enter project directory
cd funkyfox

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
# Typecheck TypeScript definitions
npx tsc --noEmit

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

This project is licensed under the MIT License — feel free to explore, learn, and build upon it!
