export interface ProductColor {
  name: string
  value: string
  image?: string
}

export interface FitFabricInfo {
  fit: string
  fabric: string
  care: string
}

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  alt: string
  category: 'T-Shirts' | 'Shirts' | 'Trousers & Jeans' | 'Jackets' | 'Essentials'
  colors: ProductColor[]
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[]
  inStock: boolean
  isNew?: boolean
  isBestseller?: boolean
  featuredOrder: number
  description?: string
  details?: string[]
  fitFabric?: FitFabricInfo
}

export const categories = [
  'Essentials',
  'T-Shirts',
  'Shirts',
  'Trousers & Jeans',
  'Jackets',
] as const

export type Category = (typeof categories)[number]

export const categoryImages: string[] = [
  '/images/funkyfox-storefront.jpg',
  '/images/category-tshirts.jpg',
  '/images/category-shirts.jpg',
  '/images/category-trousers.jpg',
  '/images/category-jackets.jpg',
]

export const formatPrice = (price: number): string =>
  `₹${price.toLocaleString('en-IN')}`

export const getCategoryFallbackImage = (category: Category | string): string => {
  switch (category) {
    case 'Essentials':
      return '/images/category-essentials.jpg'
    case 'T-Shirts':
      return '/images/category-tshirts.jpg'
    case 'Shirts':
      return '/images/category-shirts.jpg'
    case 'Trousers & Jeans':
      return '/images/category-trousers.jpg'
    case 'Jackets':
      return '/images/category-jackets.jpg'
    default:
      return '/images/funkyfox-storefront.jpg'
  }
}

export const products: Product[] = [
  {
    id: "essential-reversible-leather-belt",
    name: "Reversible Full-Grain Leather Belt",
    price: 899,
    originalPrice: 1299,
    image: "/images/category-essentials.jpg",
    images: ["/images/category-essentials.jpg"],
    alt: "Reversible black and brown full-grain leather belt with brushed metallic buckle",
    category: "Essentials",
    colors: [
      { name: "Black / Cognac Brown", value: "#1a1a1a" },
      { name: "Dark Tan / Espresso", value: "#4a3525" }
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 1,
    description: "Reversible 100% full-grain leather belt engineered with a rotatable twist buckle. Wear black for formal meetings or flip to warm cognac for casual weekend denim.",
    details: ["100% Genuine full-grain leather", "Brushed gunmetal rotatable buckle", "Handcrafted edge burnishing", "Width: 35mm"],
    fitFabric: {
      fit: "Adjustable 5-hole tailored fit.",
      fabric: "Full-grain genuine oil-pull-up leather.",
      care: "Wipe with clean dry microfiber cloth."
    }
  },
  {
    id: "essential-feather-edge-formal-leather-belt",
    name: "Italian Feather-Edge Formal Dress Belt",
    price: 999,
    originalPrice: 1499,
    image: "/images/category-essentials.jpg",
    images: ["/images/category-essentials.jpg"],
    alt: "Italian feather-edge formal dress belt with polished palladium buckle",
    category: "Essentials",
    colors: [
      { name: "Executive Jet Black", value: "#111827" },
      { name: "Deep Oxford Brown", value: "#451a03" }
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isNew: true,
    featuredOrder: 2,
    description: "Sleek 30mm formal belt designed for suited tailoring. Features tapered feather edges, vegetable-tanned aniline leather, and polished chrome palladium buckle.",
    details: ["Italian vegetable-tanned aniline leather", "Precision stitched feathered edges", "Solid zinc palladium buckle", "Width: 30mm formal profile"],
    fitFabric: {
      fit: "Tailored suit trouser fit.",
      fabric: "100% Full-grain Italian cowhide.",
      care: "Condition with neutral cream leather balm."
    }
  },
  {
    id: "essential-signature-amber-wood-perfume",
    name: "Funky Fox Signature Amber Wood EDP (100ml)",
    price: 1499,
    originalPrice: 2199,
    image: "/images/products/demo-perfume.jpg",
    images: ["/images/products/demo-perfume.jpg"],
    alt: "Funky Fox Signature Amber Wood Eau De Parfum bottle",
    category: "Essentials",
    colors: [
      { name: "Amber Wood & Spiced Bergamot", value: "#92400e" }
    ],
    sizes: ["M"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 3,
    description: "A bold, long-lasting 100ml Eau De Parfum crafted for the modern man. Opens with zesty Italian bergamot and cracked black pepper, settling into warm amber, cedarwood, and smoky vetiver.",
    details: ["100ml Eau De Parfum (20% oil concentration)", "8-12 hour skin longevity", "Top: Bergamot, Pink Peppercorn", "Base: Cedarwood, Amber, Bourbon Vanilla"],
    fitFabric: {
      fit: "All-day versatility (Office to Evening).",
      fabric: "Artisanal fine fragrance oil blend.",
      care: "Store in a cool, dry place away from direct sunlight."
    }
  },
  {
    id: "essential-aqua-vetiver-fresh-cologne",
    name: "Funky Fox Fresh Aqua Vetiver Cologne (100ml)",
    price: 1299,
    originalPrice: 1899,
    image: "/images/products/demo-perfume.jpg",
    images: ["/images/products/demo-perfume.jpg"],
    alt: "Funky Fox Fresh Aqua Vetiver Cologne bottle",
    category: "Essentials",
    colors: [
      { name: "Aqua Marine & Vetiver", value: "#0284c7" }
    ],
    sizes: ["M"],
    inStock: true,
    isNew: true,
    featuredOrder: 4,
    description: "Crisp ocean air, sunlit Sicilian lemon, and earthy Haitian vetiver. The definitive daytime fragrance for hot summer afternoons and active workouts.",
    details: ["100ml Eau De Cologne", "Energizing top notes of sea salt and crushed mint", "Heart notes of green cardamom and neroli", "Base notes of smoky Haitian vetiver and white musk"],
    fitFabric: {
      fit: "Crisp daytime signature scent.",
      fabric: "Natural citrus and marine aromatic extracts.",
      care: "Keep bottle upright in cool temperature."
    }
  },
  {
    id: "essential-cotton-air-weave-trunks-pack3",
    name: "Breathable Combed Cotton Trunks (Pack of 3)",
    price: 799,
    originalPrice: 1099,
    image: "/images/products/demo-inners.jpg",
    images: ["/images/products/demo-inners.jpg"],
    alt: "Funky Fox Combed Cotton Air-Weave Trunks Pack of 3",
    category: "Essentials",
    colors: [
      { name: "Navy / Black / Grey", value: "#1e293b" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 5,
    description: "Premium essentials daily inners: 3-pack of ultra-soft combed cotton trunks with anti-chafing flatlock stitching and micro-modal contoured pouch.",
    details: ["Pack of 3 core neutrals", "Silky soft anti-roll waistband", "Antimicrobial & moisture wicking", "No-ride-up leg construction"],
    fitFabric: {
      fit: "Form-fitting contour support.",
      fabric: "95% Long-staple combed cotton, 5% Elastane.",
      care: "Machine wash warm, tumble dry low."
    }
  },
  {
    id: "essential-modal-ribbed-vests-pack3",
    name: "Ultra-Soft Ribbed Cotton Vests (Pack of 3)",
    price: 699,
    originalPrice: 999,
    image: "/images/products/demo-inners.jpg",
    images: ["/images/products/demo-inners.jpg"],
    alt: "Funky Fox Ultra-Soft Ribbed Cotton Undershirts / Vests Pack of 3",
    category: "Essentials",
    colors: [
      { name: "Classic White / Charcoal / Slate", value: "#f1f5f9" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 6,
    description: "All-day undershirt comfort. Premium 2x2 rib knit in combed Egyptian cotton that stays tucked, absorbs moisture, and disappears invisibly under dress shirts.",
    details: ["Pack of 3 breathable vests", "Engineered stay-tucked extended length", "Tagless neck label prevents scratching", "Ultra-durable ribbed binding around armholes"],
    fitFabric: {
      fit: "Body-contoured base layer.",
      fabric: "100% Super-combed breathable cotton.",
      care: "Machine wash warm, tumble dry low."
    }
  },
  {
    id: "essential-unstructured-casual-blazer",
    name: "Tailored Modern Unstructured Casual Blazer",
    price: 3499,
    originalPrice: 4799,
    image: "/images/products/demo-blazer.jpg",
    images: ["/images/products/demo-blazer.jpg"],
    alt: "Unstructured casual navy cotton-linen blazer",
    category: "Essentials",
    colors: [
      { name: "Midnight Navy", value: "#172554" },
      { name: "Smoky Charcoal", value: "#374151" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 7,
    description: "Lightweight, soft-shouldered blazer crafted without stiff padding. Combines sartorial elegance with the effortless ease of a cardigan.",
    details: ["Unpadded natural shoulder construction", "Unlined interior with piped seams", "Classic notch lapels with two-button stance", "Dual patch front pockets & interior ticket pouch"],
    fitFabric: {
      fit: "Tailored modern fit.",
      fabric: "70% Cotton, 30% Belgian Linen blend.",
      care: "Dry clean only to preserve natural drape."
    }
  },
  {
    id: "essential-classic-italian-formal-blazer",
    name: "Executive Italian-Cut Formal Wool-Blend Blazer",
    price: 3999,
    originalPrice: 5499,
    image: "/images/products/demo-blazer.jpg",
    images: ["/images/products/demo-blazer.jpg"],
    alt: "Executive Italian-cut formal wool-blend blazer in charcoal black",
    category: "Essentials",
    colors: [
      { name: "Charcoal Black", value: "#1f2937" },
      { name: "Royal Prussian Navy", value: "#1e3a8a" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 8,
    description: "Structured boardroom-ready formal blazer constructed with half-canvas chest piece, pick-stitch lapels, and silky breathable cupro lining.",
    details: ["Half-canvas construction moulds to your torso", "Pick-stitched notch lapels", "Twin rear vents for easy seated movement", "Genuine corozo horn buttons"],
    fitFabric: {
      fit: "Sharp European executive fit.",
      fabric: "65% Merino Wool, 33% Viscose, 2% Elastane.",
      care: "Professional dry clean only."
    }
  },
  {
    id: "essential-wrinkle-free-formal-trousers",
    name: "Sharp Crease Wrinkle-Free Formal Trousers",
    price: 1699,
    originalPrice: 2299,
    image: "/images/products/demo-pleated-wide-leg-trousers.jpg",
    images: ["/images/products/demo-pleated-wide-leg-trousers.jpg"],
    alt: "Sharp crease formal trousers in charcoal dark navy",
    category: "Essentials",
    colors: [
      { name: "Formal Charcoal", value: "#334155" },
      { name: "Formal Navy", value: "#1e293b" },
      { name: "Jet Black", value: "#09090b" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    featuredOrder: 9,
    description: "Crisp, impeccably creased formal trousers tailored for boardrooms and celebrations. Resistant to creases throughout 14+ hours of active wear.",
    details: ["Nano-treated wrinkle-repellent blend", "Permanent razor-sharp center crease", "French fly tab with interior anchor button", "Blind-stitched clean hem"],
    fitFabric: {
      fit: "Contemporary tailored formal fit.",
      fabric: "65% Poly-viscose, 33% Cotton, 2% Lycra.",
      care: "Dry clean or gentle cold machine wash."
    }
  },
  {
    id: "essential-crisp-oxford-cotton-shirt",
    name: "Crisp Royal Oxford Cotton Casual & Formal Shirt",
    price: 1499,
    originalPrice: 1999,
    image: "/images/product-shirt.webp",
    images: ["/images/product-shirt.webp"],
    alt: "Crisp Royal Oxford cotton button-down shirt in optic white and light blue",
    category: "Essentials",
    colors: [
      { name: "Optic White", value: "#ffffff" },
      { name: "Sky Blue", value: "#93c5fd" },
      { name: "French Navy", value: "#1e3a8a" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 10,
    description: "The quintessential menswear shirt. Woven from 60s two-ply organic long-staple cotton with a substantial basketweave Oxford texture, semi-spread collar, and mother-of-pearl buttons.",
    details: ["60s Two-ply combed organic Oxford cotton", "Reinforced side hem gussets", "Button-down collar that stays structured", "Curved shirttail hem for tucked or untucked wear"],
    fitFabric: {
      fit: "Tailored regular fit.",
      fabric: "100% Long-staple organic cotton.",
      care: "Machine wash warm, iron while slightly damp."
    }
  },
  {
    id: "essential-tailored-stretch-chinos",
    name: "Tailored Stretch Cotton Chinos",
    price: 1599,
    originalPrice: 2199,
    image: "/images/products/demo-relaxed-tapered-chinos.jpg",
    images: ["/images/products/demo-relaxed-tapered-chinos.jpg"],
    alt: "Tailored stretch cotton chinos in classic British khaki",
    category: "Essentials",
    colors: [
      { name: "British Khaki", value: "#c29b68" },
      { name: "Midnight Navy", value: "#0f172a" },
      { name: "Slate Olive", value: "#3f4f3c" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 11,
    description: "The ultimate weekday-to-weekend trouser. Crafted from peach-finished compact cotton twill with an internal comfort waistband and clean rear welt pockets.",
    details: ["Peach-finish compact twill", "Flexible stretch waistband curtain", "Front slash pockets & twin back welts", "Horn button front closure with sturdy YKK zip"],
    fitFabric: {
      fit: "Slim-tailored straight leg.",
      fabric: "97% Cotton, 3% Spandex twill.",
      care: "Machine wash cold. Warm iron if needed."
    }
  },
  {
    id: "essential-french-terry-weekend-shorts",
    name: "Relaxed Weekend French Terry Sweat Shorts",
    price: 999,
    originalPrice: 1499,
    image: "/images/products/demo-french-terry-hoodie.jpg",
    images: ["/images/products/demo-french-terry-hoodie.jpg"],
    alt: "Relaxed weekend French terry sweat shorts in heather grey",
    category: "Essentials",
    colors: [
      { name: "Heather Grey", value: "#9ca3af" },
      { name: "Washed Black", value: "#18181b" },
      { name: "Sage Mist", value: "#84a98c" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    featuredOrder: 12,
    description: "Ultra-comfy 320 GSM French terry sweat shorts with a 7-inch inseam, deep pockets that keep your phone secure, and elasticized drawcord waist.",
    details: ["320 GSM Cotton French terry", "Modern 7-inch inseam hit above knee", "Deep side pockets & rear patch pocket", "Tubular cotton drawcord with dipped silicone tips"],
    fitFabric: {
      fit: "Relaxed above-the-knee fit.",
      fabric: "100% Combed ring-spun cotton.",
      care: "Machine wash cold with like colors."
    }
  },
  {
    id: "essential-classic-stretch-chino-shorts",
    name: "Tailored 8-Inch Stretch Chino Walk Shorts",
    price: 1199,
    originalPrice: 1699,
    image: "/images/products/demo-relaxed-tapered-chinos.jpg",
    images: ["/images/products/demo-relaxed-tapered-chinos.jpg"],
    alt: "Tailored stretch chino shorts in summer sand khaki",
    category: "Essentials",
    colors: [
      { name: "Summer Sand", value: "#e5dccb" },
      { name: "Navy Blazer", value: "#1e3a8a" },
      { name: "Washed Olive", value: "#4d5b43" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 13,
    description: "Crisp, refined summer walk shorts tailored from lightweight stretch cotton twill. Perfect balance of casual resort ease and smart polish.",
    details: ["8-inch inseam tailored walk cut", "Internal shirt-gripper waistband", "Front coin pocket and buttoned rear welts", "Reinforced crotch gusset prevents blowout"],
    fitFabric: {
      fit: "Tailored modern short fit.",
      fabric: "98% Cotton, 2% Elastane twill.",
      care: "Machine wash cold, tumble dry low."
    }
  },
  {
    id: "essential-slim-rfid-leather-wallet",
    name: "Slim Bi-Fold RFID Top-Grain Leather Wallet",
    price: 999,
    originalPrice: 1499,
    image: "/images/product-jacket.webp",
    images: ["/images/product-jacket.webp"],
    alt: "Slim bi-fold RFID-blocking top-grain leather wallet in chestnut brown",
    category: "Essentials",
    colors: [
      { name: "Chestnut Brown", value: "#78350f" },
      { name: "Obsidian Black", value: "#09090b" }
    ],
    sizes: ["M"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 14,
    description: "Ultra-slim front-pocket wallet handcrafted from top-grain vegetable-tanned leather. Holds up to 8 cards and full-length currency notes with RFID anti-theft lining.",
    details: ["Top-grain vegetable-tanned leather", "Certified RFID-blocking protective lining", "6 Quick-access card slots + currency sleeve", "Slim 8mm profile that won't bulge in trousers"],
    fitFabric: {
      fit: "Fits comfortably in front or back pockets.",
      fabric: "100% Natural top-grain cowhide leather.",
      care: "Condition with leather balm once a year."
    }
  },
  {
    id: "essential-minimalist-chronograph-watch",
    name: "Minimalist Matte Black Chronograph Watch",
    price: 2499,
    originalPrice: 3499,
    image: "/images/products/demo-zip-neck-textured-polo.png",
    images: ["/images/products/demo-zip-neck-textured-polo.png"],
    alt: "Minimalist matte black chronograph wristwatch with mesh strap",
    category: "Essentials",
    colors: [
      { name: "Matte Black & Gunmetal", value: "#18181b" },
      { name: "Brushed Silver / Tan Leather", value: "#a1a1aa" }
    ],
    sizes: ["M"],
    inStock: true,
    isNew: true,
    featuredOrder: 15,
    description: "An understated, architectural timepiece featuring high-precision Japanese quartz movement, hardened sapphire-crystal glass, and 50M water resistance.",
    details: ["Japanese quartz movement", "316L Surgical stainless steel case", "Scratch-resistant sapphire crystal glass", "5 ATM / 50M Water resistant"],
    fitFabric: {
      fit: "40mm case diameter with quick-release 20mm strap.",
      fabric: "316L Stainless steel and genuine leather.",
      care: "Clean case with microfiber cloth."
    }
  },
  {
    id: "essential-fox-embroidered-cotton-cap",
    name: "Embroidered Fox-Head Cotton Dad Cap",
    price: 699,
    originalPrice: 999,
    image: "/images/standard/avatar-beige.png",
    images: ["/images/standard/avatar-beige.png"],
    alt: "Funky Fox Embroidered Fox-Head Cotton Dad Cap",
    category: "Essentials",
    colors: [
      { name: "Vintage Washed Navy", value: "#1e3a8a" },
      { name: "Stone Khaki", value: "#d6cfbe" },
      { name: "Jet Black", value: "#18181b" }
    ],
    sizes: ["M"],
    inStock: true,
    featuredOrder: 16,
    description: "Low-profile 6-panel unstructured dad cap made from washed cotton chino twill. Accented with subtle tonal 3D embroidered Funky Fox mascot.",
    details: ["100% Washed cotton chino twill", "Subtle tonal embroidery at crown", "Antique brass tri-glide buckle strap", "Moisture-absorbent interior sweatband"],
    fitFabric: {
      fit: "One size fits all (adjustable strap).",
      fabric: "100% Breathable cotton twill.",
      care: "Spot clean with damp cloth."
    }
  },
  {
    id: "essential-urban-fleece-trackpants",
    name: "Urban Heavyweight Fleece Trackpants",
    price: 1299,
    originalPrice: 1799,
    image: "/images/products/demo-pleated-wide-leg-trousers.jpg",
    images: ["/images/products/demo-pleated-wide-leg-trousers.jpg"],
    alt: "Model wearing charcoal heavyweight cotton fleece trackpants",
    category: "Trousers & Jeans",
    colors: [
      { name: "Charcoal Heather", value: "#2b2b2b" },
      { name: "Jet Black", value: "#141414" },
      { name: "Oatmeal Melange", value: "#d9d5ce" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "Ultra-comfortable 380 GSM combed cotton fleece trackpants featuring deep zip-safe pockets, reinforced drawcord waistband, and ribbed ankle cuffs.",
    details: ["380 GSM Combed cotton loopback fleece", "Dual concealed zip side pockets", "Metal-tipped cotton drawcords", "Anti-pilling enzyme wash"],
    fitFabric: {
      fit: "Relaxed athletic tapered fit.",
      fabric: "95% Cotton, 5% Spandex loopback fleece.",
      care: "Machine wash cold with like colors."
    }
  },
  {
    id: "essential-vintage-washed-stretch-jeans",
    name: "Vintage Washed Stretch Denim Jeans",
    price: 1799,
    originalPrice: 2499,
    image: "/images/product-jeans.webp",
    images: ["/images/product-jeans.webp"],
    alt: "Classic vintage washed indigo blue stretch denim jeans",
    category: "Trousers & Jeans",
    colors: [
      { name: "Vintage Indigo", value: "#1e3a8a" },
      { name: "Faded Mid-Blue", value: "#3b82f6" },
      { name: "Washed Carbon Black", value: "#27272a" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "12.5 oz ring-spun cotton denim woven with 2% comfort stretch. Hand-buffed whiskering and tailored regular fit that never feels restrictive.",
    details: ["12.5 oz Premium ring-spun denim", "2% Spandex for active comfort flex", "Custom antique brass rivets and shanks", "Reinforced triple-needle back yoke"],
    fitFabric: {
      fit: "Regular straight fit with slight ankle taper.",
      fabric: "98% Cotton, 2% Elastane.",
      care: "Wash inside out in cold water. Hang to air dry."
    }
  },
  {
    id: "essential-relaxed-baggy-cargo-pants",
    name: "Streetwear Relaxed Baggy Cargo Trousers",
    price: 1899,
    originalPrice: 2599,
    image: "/images/product-jeans.webp",
    images: ["/images/product-jeans.webp"],
    alt: "Streetwear relaxed baggy cargo trousers in army olive",
    category: "Trousers & Jeans",
    colors: [
      { name: "Army Olive", value: "#4d533c" },
      { name: "Washed Black", value: "#262626" },
      { name: "Desert Sand", value: "#d6cfbe" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "Authentic 90s-inspired baggy utility cargos featuring 6 reinforced bellows pockets, knee articulation darts, and adjustable ankle bungee cords.",
    details: ["Heavyweight 280 GSM cotton ripstop", "6 Deep tactical utility pockets", "Reinforced seat and knee panels", "Adjustable bungee toggle hem"],
    fitFabric: {
      fit: "Wide-leg relaxed baggy cut.",
      fabric: "100% High-density cotton ripstop.",
      care: "Machine wash cold with mild detergent."
    }
  },
  {
    id: "essential-regular-fit-everyday-trousers",
    name: "Everyday Regular Fit Comfort Trousers",
    price: 1499,
    originalPrice: 1999,
    image: "/images/products/demo-relaxed-tapered-chinos.jpg",
    images: ["/images/products/demo-relaxed-tapered-chinos.jpg"],
    alt: "Everyday regular fit comfort trousers in grey and beige",
    category: "Trousers & Jeans",
    colors: [
      { name: "Cement Grey", value: "#64748b" },
      { name: "Warm Almond", value: "#d4c5b9" },
      { name: "Dark Navy", value: "#0f172a" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    featuredOrder: 0,
    description: "Reliable, easy-to-style regular fit cotton trousers designed for all-day commuting and casual workwear.",
    details: ["Standard room through thigh and seat", "Breathable 240 GSM twill weave", "Anti-fray hem tape", "Deep coin pocket inside right hip"],
    fitFabric: {
      fit: "Classic regular fit.",
      fabric: "98% Cotton, 2% Spandex.",
      care: "Machine wash cold."
    }
  },
  {
    id: "essential-classic-straight-fit-pants",
    name: "Classic Straight Fit Cotton Chino Pants",
    price: 1599,
    originalPrice: 2099,
    image: "/images/products/demo-pleated-wide-leg-trousers.jpg",
    images: ["/images/products/demo-pleated-wide-leg-trousers.jpg"],
    alt: "Classic straight fit cotton chino pants in sand",
    category: "Trousers & Jeans",
    colors: [
      { name: "Sand Khaki", value: "#d7cbb5" },
      { name: "Deep Charcoal", value: "#374151" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    featuredOrder: 0,
    description: "Timeless straight-leg cut from hip to hem. Pairs effortlessly with sneakers, loafers, and dress boots.",
    details: ["Traditional straight leg silhouette", "Double-stitched stress points", "Mid-rise comfortable waist", "Clean-profile rear button pockets"],
    fitFabric: {
      fit: "True straight fit.",
      fabric: "100% Combed ring-spun cotton twill.",
      care: "Machine wash cold, tumble dry low."
    }
  },
  {
    id: "essential-flare-bootcut-trousers-black",
    name: "Tailored Flare Bootcut Trousers (Jet Black)",
    price: 1899,
    originalPrice: 2499,
    image: "/images/products/demo-pleated-wide-leg-trousers.jpg",
    images: ["/images/products/demo-pleated-wide-leg-trousers.jpg"],
    alt: "Tailored retro flare bootcut trousers in pitch jet black",
    category: "Trousers & Jeans",
    colors: [
      { name: "Pitch Jet Black", value: "#09090b" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 0,
    description: "High-fashion tailored bootcut pants featuring a slim fit through thigh and a subtle flare below the knee that stacks over boots and chunky sneakers.",
    details: ["Subtle 19-inch bootcut leg opening", "High-density poly-viscose stretch gabardine", "Formal curtain waistband with grip tape", "Non-fade deep sulfur black dye"],
    fitFabric: {
      fit: "Tailored bootcut flare silhouette.",
      fabric: "68% Polyester, 29% Viscose, 3% Elastane.",
      care: "Machine wash cold, line dry in shade."
    }
  },
  {
    id: "essential-technical-windbreaker-jacket",
    name: "Performance Technical Windbreaker Sports Jacket",
    price: 2299,
    originalPrice: 2999,
    image: "/images/product-jacket.webp",
    images: ["/images/product-jacket.webp"],
    alt: "Performance technical windbreaker sport jacket in black and forest green",
    category: "Jackets",
    colors: [
      { name: "Matte Black", value: "#18181b" },
      { name: "Alpine Forest", value: "#14532d" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "Featherweight DWR weather-repellent windbreaker engineered for sudden drizzles, morning commutes, and gym warmups.",
    details: ["Durable Water Repellent (DWR) finish", "Waterproof taped zip closures", "Underarm breathable mesh vents", "Packs into its own internal pocket"],
    fitFabric: {
      fit: "Athletic layer fit.",
      fabric: "100% Ripstop micro-polyester with Teflon coating.",
      care: "Machine wash cold on gentle cycle."
    }
  },
  {
    id: "essential-heavyweight-fleece-hoodie",
    name: "Heavyweight 400GSM Loopback Cotton Hoodie",
    price: 1999,
    originalPrice: 2699,
    image: "/images/products/demo-french-terry-hoodie.jpg",
    images: ["/images/products/demo-french-terry-hoodie.jpg"],
    alt: "Heavyweight 400GSM loopback cotton hoodie in washed black",
    category: "Jackets",
    colors: [
      { name: "Washed Charcoal", value: "#262626" },
      { name: "Warm Off-White", value: "#f5f5f4" },
      { name: "Deep Maroon", value: "#7f1d1d" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "Heavyweight luxury hoodie made from 400 GSM 100% organic cotton loopback French terry. Features double-layered hood without tacky drawstrings for clean aesthetic.",
    details: ["400 GSM Organic cotton loopback French terry", "Double-layered sculptural hood", "Seamless kangaroo pouch pocket", "Heavy ribbing at cuffs and hem"],
    fitFabric: {
      fit: "Boxy streetwear drape with dropped shoulders.",
      fabric: "100% Organic combed cotton.",
      care: "Cold wash inside out, lay flat to dry."
    }
  },
  {
    id: "modern-bandhgala-kurta",
    name: "Terracotta Raw Silk Bandhgala Kurta",
    price: 1899,
    originalPrice: 2499,
    image: "/images/products/ethnic-bandhgala-rust.webp",
    images: [
      "/images/products/ethnic-bandhgala-rust.webp",
      "/images/products/ethnic-nehru-jacket.webp"
    ],
    alt: "Indian male model wearing a modern tailored short Bandhgala Kurta in rich rust orange",
    category: "Shirts",
    colors: [
      { name: "Terracotta Rust", value: "#C25E34" },
      { name: "Sand Cream", value: "#EDE3D1" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "A contemporary take on traditional festive wear. Tailored with clean lines, structured mandarin collar, and breathable slub blend for all-day weddings and cultural events.",
    details: [
      "Raw Silk & Slub Cotton Blend (220 GSM)",
      "Structured mandarin band collar with inner facing",
      "Handcrafted mother-of-pearl buttons"
    ]
  },
  {
    id: "sandstone-nehru-jacket",
    name: "Textured Nehru Waistcoat & Kurta Set",
    price: 2299,
    originalPrice: 2999,
    image: "/images/products/ethnic-nehru-jacket.webp",
    images: [
      "/images/products/ethnic-nehru-jacket.webp",
      "/images/products/ethnic-bandhgala-rust.webp"
    ],
    alt: "Indian male model wearing a textured Nehru waistcoat in champagne gold over ivory kurta",
    category: "Shirts",
    colors: [
      { name: "Champagne Sand", value: "#D8C7A5" },
      { name: "Ivory Bone", value: "#F5F2EA" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 0,
    description: "Artisanal woven Nehru jacket layered over an ivory base. Designed for sangeets, poojas, and celebratory evening dinners.",
    details: [
      "Textured Jacquard & Pure Linen weave",
      "Chest pocket with integrated pocket square",
      "Full satin interior lining for breathability"
    ]
  },
  {
    id: "sage-olive-linen-kurta",
    name: "Minimalist Sage Linen Kurta Shirt",
    price: 1499,
    originalPrice: 1999,
    image: "/images/products/ethnic-linen-kurta.webp",
    images: [
      "/images/products/ethnic-linen-kurta.webp",
      "/images/products/ethnic-asymmetric-kurta.webp"
    ],
    alt: "Indian male model wearing a relaxed linen kurta shirt in muted olive sage",
    category: "Shirts",
    colors: [
      { name: "Sage Olive", value: "#7A846E" },
      { name: "Terracotta", value: "#B86542" }
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isBestseller: true,
    featuredOrder: 0,
    description: "Effortless fusion of casual shirt and festive kurta. Roll the sleeves up for weekend gatherings or pair with trousers for cultural occasions.",
    details: [
      "100% Breathable Organic European Linen",
      "Roll-tab sleeves with horn button fastenings",
      "Garment washed for ultra-soft lived-in texture"
    ]
  },
  {
    id: "midnight-asymmetric-kurta",
    name: "Midnight Asymmetric Festive Kurta",
    price: 1999,
    originalPrice: 2699,
    image: "/images/products/ethnic-asymmetric-kurta.webp",
    images: [
      "/images/products/ethnic-asymmetric-kurta.webp",
      "/images/products/ethnic-linen-kurta.webp"
    ],
    alt: "Indian male model wearing an asymmetric jacquard festive kurta in deep navy",
    category: "Shirts",
    colors: [
      { name: "Midnight Navy", value: "#1E2838" },
      { name: "Deep Wine", value: "#4A1D2B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    featuredOrder: 0,
    description: "Dramatic architectural drape meeting heritage Indian silhouette. Features metallic horn buttons and an angled diagonal placket.",
    details: [
      "Fine Viscose Silk Blend with micro jacquard weave",
      "Angled diagonal placket with concealed snaps",
      "Side slits for easy movement and pocket access"
    ]
  },
  {
    "id": "essential-cotton-t-shirt",
    "name": "Essential Cotton T-Shirt",
    "price": 599,
    "originalPrice": 799,
    "image": "/images/product-tshirt.webp",
    "images": [
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg",
      "/images/hero-model.jpg"
    ],
    "alt": "Model wearing an ivory cotton crew-neck T-shirt with dark trousers",
    "category": "T-Shirts",
    "colors": [
      {
        "name": "Ivory",
        "value": "#e8e3d7"
      },
      {
        "name": "Charcoal",
        "value": "#393b39"
      },
      {
        "name": "Olive",
        "value": "#777d63"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "featuredOrder": 1,
    "description": "An everyday essential with a relaxed fit and an easy-to-style silhouette. Made from 100% breathable combed cotton with a clean ribbed neckline and relaxed drape.",
    "details": [
      "100% single-jersey combed cotton (190 GSM)",
      "Pre-washed to resist post-laundry shrinkage",
      "Reinforced shoulder-to-shoulder tape for shape retention"
    ],
    "fitFabric": {
      "fit": "Relaxed classic fit — true to size.",
      "fabric": "100% Cotton with smooth finish.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "id": "heavyweight-boxy-tee",
    "name": "Heavyweight Boxy Tee",
    "price": 699,
    "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Heavyweight boxy crew tee in washed slate",
    "category": "T-Shirts",
    "colors": [
      {
        "name": "Washed Black",
        "value": "#2e3032"
      },
      {
        "name": "Bone",
        "value": "#ebe8dc"
      },
      {
        "name": "Slate",
        "value": "#58626c"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "featuredOrder": 5,
    "description": "240 GSM heavy jersey with dropped shoulders, structured boxy drape, and wide rib neckline.",
    "details": [
      "Heavyweight 240 GSM carded cotton",
      "Drop shoulder streetwear silhouette",
      "Thick 2.5cm ribbed neckband"
    ],
    "fitFabric": {
      "fit": "Boxy streetwear fit with extra room in chest.",
      "fabric": "100% Heavy Cotton Jersey.",
      "care": "Machine wash cold."
    }
  },
  {
    "id": "vintage-wash-pocket-tee",
    "name": "Vintage Wash Pocket Tee",
    "price": 649,
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "/images/product-tshirt.webp"
    ],
    "alt": "Vintage washed olive pocket tee",
    "category": "T-Shirts",
    "colors": [
      {
        "name": "Faded Olive",
        "value": "#6b725c"
      },
      {
        "name": "Dusty Clay",
        "value": "#9b6b55"
      },
      {
        "name": "Washed Navy",
        "value": "#36454f"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 6,
    "description": "Pigment garment-dyed crewneck tee with functional patch chest pocket and soft hand feel.",
    "details": [
      "Single spade chest patch pocket",
      "Pigment dye wash delivers lived-in fade",
      "Clean taped neck seam"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit.",
      "fabric": "100% Ring-Spun Cotton.",
      "care": "Wash cold with like colors."
    },
    "isBestseller": false
  },
  {
    "id": "waffle-knit-crew-tee",
    "name": "Waffle-Knit Crew Tee",
    "price": 749,
    "originalPrice": 949,
    "image": "/images/products/demo-waffle-knit-crew-tee.png",
    "images": [
      "/images/products/demo-waffle-knit-crew-tee.png",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Textured thermal waffle-knit crew tee in ecru",
    "category": "T-Shirts",
    "colors": [
      {
        "name": "Ecru",
        "value": "#f1eee6"
      },
      {
        "name": "Black",
        "value": "#1a1a1a"
      },
      {
        "name": "Muted Sage",
        "value": "#7d8a7c"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 7,
    "description": "Micro-thermal waffle texture adds depth and warmth to a transitional everyday short-sleeve tee.",
    "details": [
      "Breathable cotton waffle knit",
      "Pre-shrunk dimensional honeycomb texture",
      "Ribbed collar and sleeve cuff bands"
    ],
    "fitFabric": {
      "fit": "Slim-straight fit.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold gentle."
    },
    "isBestseller": false
  },
  {
    "name": "Relaxed Slub Cotton Tee",
    "price": 549,
    "id": "tshirt-relaxed-slub-cotton",
    "colors": [
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Sage",
        "value": "#8a9a86"
      }
    ],
    "featuredOrder": 18,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Relaxed Slub Cotton Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday relaxed slub cotton tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Classic Pique Polo Shirt",
    "price": 799,
    "originalPrice": 999,
    "id": "tshirt-classic-pique-polo",
    "colors": [
      {
        "name": "Navy",
        "value": "#1b2a4a"
      },
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Burgundy",
        "value": "#5b2333"
      }
    ],
    "featuredOrder": 19,
    "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Classic Pique Polo Shirt for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday classic pique polo shirt designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Breton Striped Crew Tee",
    "price": 649,
    "id": "tshirt-breton-striped-crew",
    "colors": [
      {
        "name": "Navy/White",
        "value": "#1b2a4a"
      },
      {
        "name": "Olive/Ecru",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 20,
    "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Breton Striped Crew Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday breton striped crew tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Minimal Tokyo Graphic Tee",
    "price": 699,
    "id": "tshirt-minimal-tokyo-graphic",
    "colors": [
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Black",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 21,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Minimal Tokyo Graphic Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday minimal tokyo graphic tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Oversized Drop-Shoulder Tee",
    "price": 749,
    "id": "tshirt-oversized-drop-shoulder",
    "colors": [
      {
        "name": "Charcoal",
        "value": "#36454f"
      },
      {
        "name": "Sand",
        "value": "#d2b48c"
      }
    ],
    "featuredOrder": 22,
    "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Oversized Drop-Shoulder Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday oversized drop-shoulder tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Garment-Dyed Heavyweight Tee",
    "price": 799,
    "originalPrice": 999,
    "id": "tshirt-garment-dyed-heavyweight",
    "colors": [
      {
        "name": "Terracotta",
        "value": "#cc4e3b"
      },
      {
        "name": "Washed Black",
        "value": "#2f353b"
      }
    ],
    "featuredOrder": 23,
    "image": "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Garment-Dyed Heavyweight Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday garment-dyed heavyweight tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Knit Collar Resort Polo",
    "price": 849,
    "id": "tshirt-knit-collar-resort-polo",
    "colors": [
      {
        "name": "Ivory",
        "value": "#fffff0"
      },
      {
        "name": "Forest Green",
        "value": "#228b22"
      }
    ],
    "featuredOrder": 24,
    "image": "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Knit Collar Resort Polo for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday knit collar resort polo designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Vintage Athletic Crew Tee",
    "price": 599,
    "id": "tshirt-vintage-athletic-crew",
    "colors": [
      {
        "name": "Heather Grey",
        "value": "#d3d3d3"
      },
      {
        "name": "Navy",
        "value": "#000080"
      }
    ],
    "featuredOrder": 25,
    "image": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Vintage Athletic Crew Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday vintage athletic crew tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Acid Wash Boxy T-Shirt",
    "price": 699,
    "id": "tshirt-acid-wash-boxy",
    "colors": [
      {
        "name": "Acid Grey",
        "value": "#4f5b66"
      },
      {
        "name": "Acid Blue",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 26,
    "image": "/images/product-tshirt.webp",
    "images": [
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Acid Wash Boxy T-Shirt for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday acid wash boxy t-shirt designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Textured Ribbed Crew Tee",
    "price": 599,
    "id": "tshirt-textured-ribbed-crew",
    "colors": [
      {
        "name": "Muted Clay",
        "value": "#b36b00"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 27,
    "image": "/images/category-tshirts.jpg",
    "images": [
      "/images/category-tshirts.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Textured Ribbed Crew Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday textured ribbed crew tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Raw Edge Pocket T-Shirt",
    "price": 549,
    "id": "tshirt-raw-edge-pocket",
    "colors": [
      {
        "name": "Sandstone",
        "value": "#d8b18a"
      },
      {
        "name": "White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 28,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Raw Edge Pocket T-Shirt for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday raw edge pocket t-shirt designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Retro Motoring Graphic Tee",
    "price": 699,
    "id": "tshirt-retro-motoring-graphic",
    "colors": [
      {
        "name": "Off-White",
        "value": "#faf0e6"
      },
      {
        "name": "Dark Green",
        "value": "#006400"
      }
    ],
    "featuredOrder": 29,
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Retro Motoring Graphic Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday retro motoring graphic tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Organic Cotton Everyday Tee",
    "price": 499,
    "id": "tshirt-organic-cotton-everyday",
    "colors": [
      {
        "name": "Pure White",
        "value": "#ffffff"
      },
      {
        "name": "Deep Black",
        "value": "#0a0a0a"
      }
    ],
    "featuredOrder": 30,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Organic Cotton Everyday Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday organic cotton everyday tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Zip-Neck Textured Polo",
    "price": 899,
    "id": "tshirt-zip-neck-textured-polo",
    "colors": [
      {
        "name": "Charcoal",
        "value": "#36454f"
      },
      {
        "name": "Navy",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 31,
    "image": "/images/products/demo-zip-neck-textured-polo.png",
    "images": [
      "/images/products/demo-zip-neck-textured-polo.png",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Zip-Neck Textured Polo for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday zip-neck textured polo designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Micro-Stripe Relaxed Tee",
    "price": 599,
    "id": "tshirt-micro-stripe-relaxed",
    "colors": [
      {
        "name": "Grey Stripe",
        "value": "#808080"
      },
      {
        "name": "Blue Stripe",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 32,
    "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Micro-Stripe Relaxed Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday micro-stripe relaxed tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Heavyweight Street Tee",
    "price": 799,
    "originalPrice": 999,
    "id": "tshirt-heavyweight-street",
    "colors": [
      {
        "name": "Washed Brown",
        "value": "#5c4033"
      },
      {
        "name": "Black",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 33,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Heavyweight Street Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday heavyweight street tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Washed Terry Crew Tee",
    "price": 699,
    "id": "tshirt-washed-terry-crew",
    "colors": [
      {
        "name": "Oatmeal",
        "value": "#e3dac9"
      },
      {
        "name": "Sage Green",
        "value": "#9caf88"
      }
    ],
    "featuredOrder": 34,
    "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Washed Terry Crew Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday washed terry crew tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Sun-Faded Cotton Tee",
    "price": 649,
    "id": "tshirt-sun-faded-cotton",
    "colors": [
      {
        "name": "Faded Coral",
        "value": "#e9967a"
      },
      {
        "name": "Faded Teal",
        "value": "#008080"
      }
    ],
    "featuredOrder": 35,
    "image": "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Sun-Faded Cotton Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday sun-faded cotton tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Minimal Monochrome Tee",
    "price": 499,
    "id": "tshirt-minimal-monochrome",
    "colors": [
      {
        "name": "Ink Black",
        "value": "#050505"
      },
      {
        "name": "Bone White",
        "value": "#fdfbf7"
      }
    ],
    "featuredOrder": 36,
    "image": "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Minimal Monochrome Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday minimal monochrome tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Chunky Collar Heavy Tee",
    "price": 749,
    "id": "tshirt-chunky-collar-heavy",
    "colors": [
      {
        "name": "Chalk White",
        "value": "#f4f4f4"
      },
      {
        "name": "Dark Navy",
        "value": "#000033"
      }
    ],
    "featuredOrder": 37,
    "image": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Chunky Collar Heavy Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday chunky collar heavy tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Clean-Cut V-Neck Tee",
    "price": 499,
    "id": "tshirt-clean-cut-vneck",
    "colors": [
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Charcoal",
        "value": "#333333"
      }
    ],
    "featuredOrder": 38,
    "image": "/images/product-tshirt.webp",
    "images": [
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Clean-Cut V-Neck Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday clean-cut v-neck tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Split-Hem Relaxed T-Shirt",
    "price": 599,
    "id": "tshirt-split-hem-relaxed",
    "colors": [
      {
        "name": "Olive Green",
        "value": "#556b2f"
      },
      {
        "name": "Stone Grey",
        "value": "#928e85"
      }
    ],
    "featuredOrder": 39,
    "image": "/images/category-tshirts.jpg",
    "images": [
      "/images/category-tshirts.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Split-Hem Relaxed T-Shirt for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday split-hem relaxed t-shirt designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Abstract Line Graphic Tee",
    "price": 649,
    "id": "tshirt-abstract-line-graphic",
    "colors": [
      {
        "name": "Ecru",
        "value": "#f3e5ab"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 40,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Abstract Line Graphic Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday abstract line graphic tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Tipped Collar Pique Polo",
    "price": 849,
    "originalPrice": 1049,
    "id": "tshirt-tipped-collar-pique-polo",
    "colors": [
      {
        "name": "White/Navy",
        "value": "#ffffff"
      },
      {
        "name": "Black/Gold",
        "value": "#111111"
      }
    ],
    "featuredOrder": 41,
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Tipped Collar Pique Polo for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday tipped collar pique polo designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Pigment-Dyed Pocket Tee",
    "price": 699,
    "id": "tshirt-pigment-dyed-pocket",
    "colors": [
      {
        "name": "Rust",
        "value": "#b7410e"
      },
      {
        "name": "Seafoam",
        "value": "#93e9be"
      }
    ],
    "featuredOrder": 42,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Pigment-Dyed Pocket Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday pigment-dyed pocket tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Vintage Sports Club Tee",
    "price": 649,
    "id": "tshirt-vintage-sports-club",
    "colors": [
      {
        "name": "Vintage White",
        "value": "#fdf5e6"
      },
      {
        "name": "Heather Grey",
        "value": "#c0c0c0"
      }
    ],
    "featuredOrder": 43,
    "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Vintage Sports Club Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday vintage sports club tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Mercerised Cotton Tee",
    "price": 899,
    "id": "tshirt-mercerised-cotton",
    "colors": [
      {
        "name": "Lustre Black",
        "value": "#000000"
      },
      {
        "name": "Lustre Navy",
        "value": "#000080"
      }
    ],
    "featuredOrder": 44,
    "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Mercerised Cotton Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday mercerised cotton tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Loose-Fit Skater T-Shirt",
    "price": 699,
    "id": "tshirt-loose-fit-skater",
    "colors": [
      {
        "name": "Off-Black",
        "value": "#222222"
      },
      {
        "name": "Mustard",
        "value": "#ffdb58"
      }
    ],
    "featuredOrder": 45,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Loose-Fit Skater T-Shirt for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday loose-fit skater t-shirt designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Waffle-Knit Henley Tee",
    "price": 799,
    "id": "tshirt-waffle-knit-henley",
    "colors": [
      {
        "name": "Natural",
        "value": "#ece2d0"
      },
      {
        "name": "Army Green",
        "value": "#4b5320"
      }
    ],
    "featuredOrder": 46,
    "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Waffle-Knit Henley Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday waffle-knit henley tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Subtle Embroidery Crew Tee",
    "price": 649,
    "id": "tshirt-subtle-embroidery-crew",
    "colors": [
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Charcoal",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 47,
    "image": "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Subtle Embroidery Crew Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday subtle embroidery crew tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Mineral Wash Oversized Tee",
    "price": 749,
    "id": "tshirt-mineral-wash-oversized",
    "colors": [
      {
        "name": "Mineral Charcoal",
        "value": "#43464b"
      },
      {
        "name": "Mineral Sage",
        "value": "#778899"
      }
    ],
    "featuredOrder": 48,
    "image": "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Mineral Wash Oversized Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday mineral wash oversized tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Fine-Ribbed Everyday Tee",
    "price": 549,
    "id": "tshirt-fine-ribbed-everyday",
    "colors": [
      {
        "name": "Deep Olive",
        "value": "#3b4432"
      },
      {
        "name": "Chalk White",
        "value": "#f7f7f7"
      }
    ],
    "featuredOrder": 49,
    "image": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80",
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Fine-Ribbed Everyday Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday fine-ribbed everyday tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Colourblock Casual Polo",
    "price": 849,
    "id": "tshirt-colourblock-casual-polo",
    "colors": [
      {
        "name": "Navy/White",
        "value": "#1b2a4a"
      },
      {
        "name": "Olive/Black",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 50,
    "image": "/images/product-tshirt.webp",
    "images": [
      "/images/product-tshirt.webp",
      "/images/category-tshirts.jpg",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Colourblock Casual Polo for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday colourblock casual polo designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Distressed Collar Heavy Tee",
    "price": 699,
    "id": "tshirt-distressed-collar-heavy",
    "colors": [
      {
        "name": "Washed Black",
        "value": "#242424"
      },
      {
        "name": "Faded Khaki",
        "value": "#c3b091"
      }
    ],
    "featuredOrder": 51,
    "image": "/images/category-tshirts.jpg",
    "images": [
      "/images/category-tshirts.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Distressed Collar Heavy Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday distressed collar heavy tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Washed Charcoal Boxy Tee",
    "price": 749,
    "originalPrice": 949,
    "id": "tshirt-washed-charcoal-boxy",
    "colors": [
      {
        "name": "Charcoal Wash",
        "value": "#383838"
      }
    ],
    "featuredOrder": 52,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Washed Charcoal Boxy Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday washed charcoal boxy tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Bold Type Editorial Tee",
    "price": 649,
    "id": "tshirt-bold-type-editorial",
    "colors": [
      {
        "name": "Bone",
        "value": "#e3dac9"
      },
      {
        "name": "Black",
        "value": "#0f0f0f"
      }
    ],
    "featuredOrder": 53,
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Bold Type Editorial Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday bold type editorial tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Slub Jersey Pocket Tee",
    "price": 549,
    "id": "tshirt-slub-jersey-pocket",
    "colors": [
      {
        "name": "Muted Blue",
        "value": "#4a6b82"
      },
      {
        "name": "White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 54,
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Slub Jersey Pocket Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday slub jersey pocket tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Retro Striped Cotton Polo",
    "price": 899,
    "id": "tshirt-retro-striped-cotton-polo",
    "colors": [
      {
        "name": "Cream/Brown Stripe",
        "value": "#d2b48c"
      },
      {
        "name": "Navy/White Stripe",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 55,
    "image": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Retro Striped Cotton Polo for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday retro striped cotton polo designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Heavy Drape Relaxed Tee",
    "price": 799,
    "id": "tshirt-heavy-drape-relaxed",
    "colors": [
      {
        "name": "Shadow Black",
        "value": "#1e1e1e"
      },
      {
        "name": "Warm Taupe",
        "value": "#8b8589"
      }
    ],
    "featuredOrder": 56,
    "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Heavy Drape Relaxed Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday heavy drape relaxed tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Essential Organic Crew - White",
    "price": 449,
    "id": "tshirt-essential-organic-crew-white",
    "colors": [
      {
        "name": "Pure White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 57,
    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Essential Organic Crew - White for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday essential organic crew - white designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "name": "Core Black Everyday Tee",
    "price": 449,
    "id": "tshirt-core-black-everyday",
    "colors": [
      {
        "name": "Core Black",
        "value": "#121212"
      }
    ],
    "featuredOrder": 58,
    "image": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80",
      "/images/category-tshirts.jpg"
    ],
    "alt": "Core Black Everyday Tee for everyday men\\'s style",
    "category": "T-Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Clean everyday core black everyday tee designed for comfort, durability, and natural silhouette.",
    "details": [
      "Breathable 100% cotton construction",
      "Ribbed neckline retains shape through wash",
      "Clean twin-needle hem finishing"
    ],
    "fitFabric": {
      "fit": "Standard relaxed fit — true to size.",
      "fabric": "100% Combed Cotton.",
      "care": "Machine wash cold with like colours."
    }
  },
  {
    "id": "relaxed-fit-shirt",
    "name": "Relaxed Fit Shirt",
    "price": 899,
    "image": "/images/product-shirt.webp",
    "images": [
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg",
      "/images/editorial-campaign.webp"
    ],
    "alt": "Model wearing a relaxed olive button-up shirt in a warm studio",
    "category": "Shirts",
    "colors": [
      {
        "name": "Sage Olive",
        "value": "#6b725c"
      },
      {
        "name": "Sand",
        "value": "#d7cdb9"
      },
      {
        "name": "Ink Navy",
        "value": "#242a38"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 2,
    "description": "A contemporary button-up crafted from breathable garment-washed cotton poplin with a laid-back camp-ready drape.",
    "details": [
      "Soft pre-washed cotton poplin (120 GSM)",
      "Convertible camp collar with top-button loop",
      "Tonal matte buttons with cross-stitching"
    ],
    "fitFabric": {
      "fit": "Relaxed boxy cut with straight hem.",
      "fabric": "100% Cotton Poplin.",
      "care": "Machine wash warm."
    },
    "isBestseller": true
  },
  {
    "id": "linen-blend-resort-shirt",
    "name": "Linen-Blend Resort Shirt",
    "price": 1099,
    "originalPrice": 1399,
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Linen blend resort shirt in natural flax",
    "category": "Shirts",
    "colors": [
      {
        "name": "Natural Flax",
        "value": "#e2dac8"
      },
      {
        "name": "Terracotta",
        "value": "#b55a40"
      },
      {
        "name": "Chalk White",
        "value": "#f4f4f2"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "featuredOrder": 8,
    "description": "Airy linen-cotton blend short-sleeve shirt designed with an easy camp collar for warm-weather styling.",
    "details": [
      "55% Linen, 45% Combed Cotton",
      "Breathable open weave with natural slub texture",
      "Straight vented side hems"
    ],
    "fitFabric": {
      "fit": "Easy relaxed fit.",
      "fabric": "55% Linen, 45% Cotton.",
      "care": "Wash cold delicate, hang dry."
    }
  },
  {
    "id": "classic-oxford-overshirt",
    "name": "Classic Oxford Overshirt",
    "price": 1199,
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "/images/product-shirt.webp"
    ],
    "alt": "Classic oxford cotton button-down in light blue",
    "category": "Shirts",
    "colors": [
      {
        "name": "Sky Blue",
        "value": "#a6c2d9"
      },
      {
        "name": "Optic White",
        "value": "#f8f8f8"
      },
      {
        "name": "Soft Pink",
        "value": "#ebd1d1"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 9,
    "description": "Substantial basketweave oxford cloth shirt featuring a roll button-down collar and rear box pleat.",
    "details": [
      "Heavy 100% combed cotton Oxford cloth",
      "Button-down collar with gentle roll",
      "Single rounded chest pocket and locker loop"
    ],
    "fitFabric": {
      "fit": "Regular tailored silhouette.",
      "fabric": "100% Cotton Oxford.",
      "care": "Machine wash warm."
    },
    "isBestseller": false
  },
  {
    "id": "corduroy-overshirt",
    "name": "Corduroy Overshirt",
    "price": 1299,
    "image": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Fine-wale corduroy overshirt in tobacco brown",
    "category": "Shirts",
    "colors": [
      {
        "name": "Tobacco Brown",
        "value": "#795034"
      },
      {
        "name": "Forest Green",
        "value": "#2d4739"
      },
      {
        "name": "Midnight",
        "value": "#1b2230"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 10,
    "description": "14-wale velvety cotton corduroy overshirt tailored with twin flap chest pockets for easy fall layering.",
    "details": [
      "14-wale fine micro-ribbed cotton corduroy",
      "Dual utility flap chest pockets with button tabs",
      "Straight back yoke and side split hem"
    ],
    "fitFabric": {
      "fit": "Relaxed layerable overshirt fit.",
      "fabric": "100% Cotton Corduroy.",
      "care": "Wash cold inside-out."
    },
    "isBestseller": false
  },
  {
    "name": "Gingham Poplin Button-Down",
    "price": 899,
    "id": "shirt-gingham-poplin-buttondown",
    "colors": [
      {
        "name": "Navy/White Gingham",
        "value": "#1b2a4a"
      },
      {
        "name": "Black/White",
        "value": "#111111"
      }
    ],
    "featuredOrder": 59,
    "image": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Gingham Poplin Button-Down in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday gingham poplin button-down with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Washed Indigo Chambray Shirt",
    "price": 1199,
    "originalPrice": 1499,
    "id": "shirt-washed-indigo-chambray",
    "colors": [
      {
        "name": "Light Indigo",
        "value": "#5c7a99"
      },
      {
        "name": "Mid Wash",
        "value": "#3f5d7d"
      }
    ],
    "featuredOrder": 60,
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Washed Indigo Chambray Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday washed indigo chambray shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Camp Collar Linen Shirt",
    "price": 1099,
    "id": "shirt-camp-collar-linen",
    "colors": [
      {
        "name": "Ecru",
        "value": "#eae2d0"
      },
      {
        "name": "Olive",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 61,
    "image": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Camp Collar Linen Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday camp collar linen shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Classic Striped Oxford Shirt",
    "price": 999,
    "id": "shirt-classic-striped-oxford",
    "colors": [
      {
        "name": "Blue Bengal Stripe",
        "value": "#4682b4"
      },
      {
        "name": "Grey Stripe",
        "value": "#708090"
      }
    ],
    "featuredOrder": 62,
    "image": "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Classic Striped Oxford Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday classic striped oxford shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Brushed Cotton Check Shirt",
    "price": 1249,
    "id": "shirt-brushed-cotton-check",
    "colors": [
      {
        "name": "Red/Navy Plaid",
        "value": "#8b0000"
      },
      {
        "name": "Green Check",
        "value": "#2e8b57"
      }
    ],
    "featuredOrder": 63,
    "image": "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Brushed Cotton Check Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday brushed cotton check shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Textured Twill Overshirt",
    "price": 1349,
    "id": "shirt-textured-twill-overshirt",
    "colors": [
      {
        "name": "Dark Khaki",
        "value": "#bdb76b"
      },
      {
        "name": "Charcoal",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 64,
    "image": "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Textured Twill Overshirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday textured twill overshirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Mandarin Collar Linen Shirt",
    "price": 1149,
    "id": "shirt-mandarin-collar-linen",
    "colors": [
      {
        "name": "White",
        "value": "#ffffff"
      },
      {
        "name": "Sky Blue",
        "value": "#87ceeb"
      }
    ],
    "featuredOrder": 65,
    "image": "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Mandarin Collar Linen Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday mandarin collar linen shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Cuban Collar Resort Shirt",
    "price": 999,
    "id": "shirt-cuban-collar-resort",
    "colors": [
      {
        "name": "Black Palm",
        "value": "#1a1a1a"
      },
      {
        "name": "Rust Geometric",
        "value": "#b7410e"
      }
    ],
    "featuredOrder": 66,
    "image": "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg"
    ],
    "alt": "Cuban Collar Resort Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday cuban collar resort shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Seersucker Striped Summer Shirt",
    "price": 1099,
    "originalPrice": 1399,
    "id": "shirt-seersucker-striped",
    "colors": [
      {
        "name": "Navy Seersucker",
        "value": "#1b2a4a"
      },
      {
        "name": "Tan Seersucker",
        "value": "#d2b48c"
      }
    ],
    "featuredOrder": 67,
    "image": "/images/product-shirt.webp",
    "images": [
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg",
      "/images/category-shirts.jpg"
    ],
    "alt": "Seersucker Striped Summer Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday seersucker striped summer shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Garment-Dyed Utility Shirt",
    "price": 1299,
    "id": "shirt-garment-dyed-utility",
    "colors": [
      {
        "name": "Dusty Olive",
        "value": "#6b725c"
      },
      {
        "name": "Washed Clay",
        "value": "#9b6b55"
      }
    ],
    "featuredOrder": 68,
    "image": "/images/category-shirts.jpg",
    "images": [
      "/images/category-shirts.jpg",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Garment-Dyed Utility Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday garment-dyed utility shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Micro-Houndstooth Casual Shirt",
    "price": 999,
    "id": "shirt-micro-houndstooth-casual",
    "colors": [
      {
        "name": "Black/White",
        "value": "#222222"
      },
      {
        "name": "Navy/White",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 69,
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Micro-Houndstooth Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday micro-houndstooth casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Vintage Flannel Overshirt",
    "price": 1399,
    "originalPrice": 1699,
    "id": "shirt-vintage-flannel-overshirt",
    "colors": [
      {
        "name": "Mustard/Navy Plaid",
        "value": "#ffdb58"
      },
      {
        "name": "Grey Buffalo",
        "value": "#4f5b66"
      }
    ],
    "featuredOrder": 70,
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Vintage Flannel Overshirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday vintage flannel overshirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Clean Poplin Casual Shirt",
    "price": 849,
    "id": "shirt-clean-poplin-casual",
    "colors": [
      {
        "name": "Pure White",
        "value": "#ffffff"
      },
      {
        "name": "Muted Sage",
        "value": "#7d8a7c"
      }
    ],
    "featuredOrder": 71,
    "image": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Clean Poplin Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday clean poplin casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Short-Sleeve Textured Shirt",
    "price": 899,
    "id": "shirt-short-sleeve-textured",
    "colors": [
      {
        "name": "Dobby White",
        "value": "#fcfcfc"
      },
      {
        "name": "Navy Waffle",
        "value": "#000080"
      }
    ],
    "featuredOrder": 72,
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Short-Sleeve Textured Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday short-sleeve textured shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Slub Linen Relaxed Shirt",
    "price": 1199,
    "id": "shirt-slub-linen-relaxed",
    "colors": [
      {
        "name": "Natural Sand",
        "value": "#e2dac8"
      },
      {
        "name": "Washed Coral",
        "value": "#f08080"
      }
    ],
    "featuredOrder": 73,
    "image": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Slub Linen Relaxed Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday slub linen relaxed shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Tattersall Check Oxford Shirt",
    "price": 1049,
    "id": "shirt-tattersall-check-oxford",
    "colors": [
      {
        "name": "White/Navy/Red",
        "value": "#f8f8ff"
      }
    ],
    "featuredOrder": 74,
    "image": "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Tattersall Check Oxford Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday tattersall check oxford shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Lightweight Denim Work Shirt",
    "price": 1249,
    "id": "shirt-lightweight-denim-work",
    "colors": [
      {
        "name": "Rinse Dark",
        "value": "#1e2d42"
      },
      {
        "name": "Stonewash",
        "value": "#607d8b"
      }
    ],
    "featuredOrder": 75,
    "image": "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Lightweight Denim Work Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday lightweight denim work shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Vertical Stripe Camp Shirt",
    "price": 949,
    "id": "shirt-vertical-stripe-camp",
    "colors": [
      {
        "name": "Ecru/Navy Stripe",
        "value": "#eae2d0"
      },
      {
        "name": "Sage Stripe",
        "value": "#8fbc8f"
      }
    ],
    "featuredOrder": 76,
    "image": "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Vertical Stripe Camp Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday vertical stripe camp shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Minimal Snap-Button Overshirt",
    "price": 1399,
    "id": "shirt-minimal-snap-button",
    "colors": [
      {
        "name": "Matte Black",
        "value": "#1c1c1c"
      },
      {
        "name": "Stone Grey",
        "value": "#708090"
      }
    ],
    "featuredOrder": 77,
    "image": "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Minimal Snap-Button Overshirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday minimal snap-button overshirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Herringbone Cotton Casual Shirt",
    "price": 1199,
    "id": "shirt-herringbone-cotton-casual",
    "colors": [
      {
        "name": "Olive Herringbone",
        "value": "#556b2f"
      },
      {
        "name": "Khaki",
        "value": "#f0e68c"
      }
    ],
    "featuredOrder": 78,
    "image": "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg"
    ],
    "alt": "Herringbone Cotton Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday herringbone cotton casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Raw-Silk Blend Resort Shirt",
    "price": 1449,
    "originalPrice": 1799,
    "id": "shirt-raw-silk-blend-resort",
    "colors": [
      {
        "name": "Champagne Silk",
        "value": "#f7e7ce"
      },
      {
        "name": "Nightshade",
        "value": "#2c3539"
      }
    ],
    "featuredOrder": 79,
    "image": "/images/product-shirt.webp",
    "images": [
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg",
      "/images/category-shirts.jpg"
    ],
    "alt": "Raw-Silk Blend Resort Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday raw-silk blend resort shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Windowpane Plaid Casual Shirt",
    "price": 999,
    "id": "shirt-windowpane-plaid-casual",
    "colors": [
      {
        "name": "White/Navy Grid",
        "value": "#ffffff"
      },
      {
        "name": "Grey/Black Grid",
        "value": "#d3d3d3"
      }
    ],
    "featuredOrder": 80,
    "image": "/images/category-shirts.jpg",
    "images": [
      "/images/category-shirts.jpg",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Windowpane Plaid Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday windowpane plaid casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Soft-Brushed Twill Shirt",
    "price": 1099,
    "id": "shirt-soft-brushed-twill",
    "colors": [
      {
        "name": "Warm Tobacco",
        "value": "#8b5a2b"
      },
      {
        "name": "Deep Navy",
        "value": "#000080"
      }
    ],
    "featuredOrder": 81,
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Soft-Brushed Twill Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday soft-brushed twill shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Grandad Collar Cotton Shirt",
    "price": 949,
    "id": "shirt-grandad-collar-cotton",
    "colors": [
      {
        "name": "Crisp White",
        "value": "#ffffff"
      },
      {
        "name": "Soft Blue",
        "value": "#b0c4de"
      }
    ],
    "featuredOrder": 82,
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Grandad Collar Cotton Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday grandad collar cotton shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Washed Linen Overshirt",
    "price": 1349,
    "id": "shirt-washed-linen-overshirt",
    "colors": [
      {
        "name": "Earthy Green",
        "value": "#4b5320"
      },
      {
        "name": "Charcoal Linen",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 83,
    "image": "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Washed Linen Overshirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday washed linen overshirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Retro Bowling Casual Shirt",
    "price": 1049,
    "id": "shirt-retro-bowling-casual",
    "colors": [
      {
        "name": "Black/White Block",
        "value": "#1a1a1a"
      },
      {
        "name": "Navy/Mustard",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 84,
    "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Retro Bowling Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday retro bowling casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Classic Chambray Button-Down",
    "price": 1149,
    "id": "shirt-classic-chambray-buttondown",
    "colors": [
      {
        "name": "Vintage Blue",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 85,
    "image": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Classic Chambray Button-Down in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday classic chambray button-down with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Buffalo Check Flannel Shirt",
    "price": 1299,
    "originalPrice": 1599,
    "id": "shirt-buffalo-check-flannel",
    "colors": [
      {
        "name": "Red/Black Check",
        "value": "#8b0000"
      },
      {
        "name": "Green/Black",
        "value": "#006400"
      }
    ],
    "featuredOrder": 86,
    "image": "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Buffalo Check Flannel Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday buffalo check flannel shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Heavy Drape Poplin Shirt",
    "price": 999,
    "id": "shirt-heavy-drape-poplin",
    "colors": [
      {
        "name": "Bone White",
        "value": "#f5f5dc"
      },
      {
        "name": "Ink Navy",
        "value": "#121924"
      }
    ],
    "featuredOrder": 87,
    "image": "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1620012253295-c15c429f6dd1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Heavy Drape Poplin Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday heavy drape poplin shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Slub Cotton Short-Sleeve Shirt",
    "price": 849,
    "id": "shirt-slub-cotton-short-sleeve",
    "colors": [
      {
        "name": "Dusty Mint",
        "value": "#98ff98"
      },
      {
        "name": "White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 88,
    "image": "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Slub Cotton Short-Sleeve Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday slub cotton short-sleeve shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Utility Pocket Cotton Shirt",
    "price": 1199,
    "id": "shirt-utility-pocket-cotton",
    "colors": [
      {
        "name": "Army Olive",
        "value": "#4b5320"
      },
      {
        "name": "Khaki Sand",
        "value": "#c2b280"
      }
    ],
    "featuredOrder": 89,
    "image": "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Utility Pocket Cotton Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday utility pocket cotton shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Pinpoint Oxford Casual Shirt",
    "price": 1099,
    "id": "shirt-pinpoint-oxford-casual",
    "colors": [
      {
        "name": "Light Blue Pinpoint",
        "value": "#add8e6"
      },
      {
        "name": "White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 90,
    "image": "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1622445268462-349f48512130?w=800&auto=format&fit=crop&q=80",
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg"
    ],
    "alt": "Pinpoint Oxford Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday pinpoint oxford casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Striped Linen-Blend Shirt",
    "price": 1149,
    "id": "shirt-striped-linen-blend",
    "colors": [
      {
        "name": "Blue/White Stripe",
        "value": "#6495ed"
      },
      {
        "name": "Brown/Cream",
        "value": "#a0522d"
      }
    ],
    "featuredOrder": 91,
    "image": "/images/product-shirt.webp",
    "images": [
      "/images/product-shirt.webp",
      "/images/category-shirts.jpg",
      "/images/category-shirts.jpg"
    ],
    "alt": "Striped Linen-Blend Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday striped linen-blend shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Heavy Cord Workshirt",
    "price": 1399,
    "originalPrice": 1699,
    "id": "shirt-heavy-cord-workshirt",
    "colors": [
      {
        "name": "Dark Rust",
        "value": "#b7410e"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 92,
    "image": "/images/category-shirts.jpg",
    "images": [
      "/images/category-shirts.jpg",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Heavy Cord Workshirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday heavy cord workshirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Monochrome Black Casual Shirt",
    "price": 899,
    "id": "shirt-monochrome-black-casual",
    "colors": [
      {
        "name": "Triple Black",
        "value": "#080808"
      }
    ],
    "featuredOrder": 93,
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Monochrome Black Casual Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday monochrome black casual shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "name": "Pure Cotton White Oxford Shirt",
    "price": 949,
    "id": "shirt-pure-cotton-white-oxford",
    "colors": [
      {
        "name": "Optic White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 94,
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80",
      "/images/category-shirts.jpg"
    ],
    "alt": "Pure Cotton White Oxford Shirt in casual menswear cut",
    "category": "Shirts",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Versatile everyday pure cotton white oxford shirt with clean stitching, durable buttons, and effortless drape.",
    "details": [
      "Breathable pre-washed fabric",
      "Reinforced collar band and durable buttons",
      "Curved hem designed to be worn untucked or tucked"
    ],
    "fitFabric": {
      "fit": "Regular relaxed fit with easy mobility.",
      "fabric": "100% Breathable Cotton.",
      "care": "Machine wash warm, hang dry."
    }
  },
  {
    "id": "everyday-straight-leg-jeans",
    "name": "Everyday Straight-Leg Jeans",
    "price": 1499,
    "originalPrice": 1899,
    "image": "/images/product-jeans.webp",
    "images": [
      "/images/product-jeans.webp",
      "/images/category-trousers.jpg",
      "/images/hero-model.jpg"
    ],
    "alt": "Model wearing relaxed vintage-wash straight jeans with white sneakers",
    "category": "Trousers & Jeans",
    "colors": [
      {
        "name": "Vintage Mid Wash",
        "value": "#506e8b"
      },
      {
        "name": "Raw Indigo",
        "value": "#23344c"
      },
      {
        "name": "Washed Black",
        "value": "#36393e"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "featuredOrder": 3,
    "description": "12.5oz rigid-look denim engineered with 1% elastane for daily mobility. Sits comfortably at natural waist.",
    "details": [
      "12.5oz cotton denim with comfort stretch",
      "Classic 5-pocket construction with branded nickel rivets",
      "Chain-stitched hem and heavy-gauge amber thread"
    ],
    "fitFabric": {
      "fit": "Straight leg from hip through ankle.",
      "fabric": "99% Cotton, 1% Elastane.",
      "care": "Wash cold inside-out, hang dry."
    }
  },
  {
    "id": "relaxed-tapered-chinos",
    "name": "Relaxed Tapered Chinos",
    "price": 1199,
    "image": "/images/products/demo-relaxed-tapered-chinos.jpg",
    "images": [
      "/images/products/demo-relaxed-tapered-chinos.jpg",
      "/images/category-trousers.jpg"
    ],
    "alt": "Relaxed tapered casual chinos in warm khaki",
    "category": "Trousers & Jeans",
    "colors": [
      {
        "name": "Warm Khaki",
        "value": "#bca685"
      },
      {
        "name": "Dark Olive",
        "value": "#4e5645"
      },
      {
        "name": "Charcoal",
        "value": "#3b3d40"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 11,
    "description": "Enzyme-washed cotton twill chinos offering room in the seat and thigh with a clean taper down to the hem.",
    "details": [
      "Heavy cotton stretch broken-twill (260 GSM)",
      "Slanted front slash pockets and rear welt pockets",
      "Durable horn-look urea buttons and YKK metal zip fly"
    ],
    "fitFabric": {
      "fit": "Relaxed tapered cut.",
      "fabric": "98% Cotton Twill, 2% Spandex.",
      "care": "Machine wash warm."
    },
    "isBestseller": false
  },
  {
    "id": "pleated-wide-leg-trousers",
    "name": "Pleated Wide-Leg Trousers",
    "price": 1399,
    "originalPrice": 1699,
    "image": "/images/products/demo-pleated-wide-leg-trousers.jpg",
    "images": [
      "/images/products/demo-pleated-wide-leg-trousers.jpg",
      "/images/product-jeans.webp"
    ],
    "alt": "Pleated wide-leg everyday trousers in slate grey",
    "category": "Trousers & Jeans",
    "colors": [
      {
        "name": "Slate Grey",
        "value": "#676e73"
      },
      {
        "name": "Black",
        "value": "#1a1a1a"
      },
      {
        "name": "Muted Brown",
        "value": "#6b584a"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "featuredOrder": 12,
    "description": "Single-forward pleat trousers cut with a generous drape and gentle break over sneakers or loafers.",
    "details": [
      "Fluid poly-viscose twill with soft wool-like hand",
      "Single front pleats add ease and volume",
      "Adjustable internal drawstring waistband with belt loops"
    ],
    "fitFabric": {
      "fit": "Relaxed wide leg through hem.",
      "fabric": "65% Polyester, 33% Rayon, 2% Spandex.",
      "care": "Machine wash cold gentle."
    }
  },
  {
    "id": "drawstring-utility-pants",
    "name": "Drawstring Utility Pants",
    "price": 1099,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Drawstring utility trousers with cargo pocket in washed black",
    "category": "Trousers & Jeans",
    "colors": [
      {
        "name": "Washed Black",
        "value": "#2e3032"
      },
      {
        "name": "Olive Green",
        "value": "#4d5543"
      },
      {
        "name": "Sand Khaki",
        "value": "#c7bca7"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 13,
    "description": "Lightweight ripstop cotton pants with elasticated drawstring waist, articulated knees, and discreet side pockets.",
    "details": [
      "Durable cotton mini-ripstop grid weave",
      "Elastic waistband with heavy round cotton drawcord",
      "Twin slanted hand pockets and low-profile thigh pocket"
    ],
    "fitFabric": {
      "fit": "Easy relaxed carrot fit with tapered cuff.",
      "fabric": "100% Cotton Ripstop.",
      "care": "Machine wash cold."
    },
    "isBestseller": false
  },
  {
    "name": "Raw Indigo Straight Jeans",
    "price": 1599,
    "originalPrice": 1999,
    "id": "jeans-raw-indigo-straight",
    "colors": [
      {
        "name": "Raw Indigo",
        "value": "#1f2e4d"
      }
    ],
    "featuredOrder": 95,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Raw Indigo Straight Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday raw indigo straight jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Slim-Stretch Casual Chinos",
    "price": 1249,
    "id": "trouser-slim-stretch-chinos",
    "colors": [
      {
        "name": "Navy",
        "value": "#1b2a4a"
      },
      {
        "name": "Khaki",
        "value": "#c3b091"
      }
    ],
    "featuredOrder": 96,
    "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Slim-Stretch Casual Chinos casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday slim-stretch casual chinos engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Carpenter Denim with Hammer Loop",
    "price": 1699,
    "originalPrice": 2099,
    "id": "jeans-carpenter-denim",
    "colors": [
      {
        "name": "Washed Indigo",
        "value": "#4682b4"
      },
      {
        "name": "Natural Ecru",
        "value": "#fdf5e6"
      }
    ],
    "featuredOrder": 97,
    "image": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Carpenter Denim with Hammer Loop casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday carpenter denim with hammer loop engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Vintage Fade Relaxed Jeans",
    "price": 1499,
    "id": "jeans-vintage-fade-relaxed",
    "colors": [
      {
        "name": "Light Vintage",
        "value": "#87ceeb"
      },
      {
        "name": "Mid Wash",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 98,
    "image": "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Vintage Fade Relaxed Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday vintage fade relaxed jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Ripstop Cargo Trousers",
    "price": 1399,
    "id": "trouser-ripstop-cargo",
    "colors": [
      {
        "name": "Military Olive",
        "value": "#556b2f"
      },
      {
        "name": "Stealth Black",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 99,
    "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Ripstop Cargo Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday ripstop cargo trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Double-Knee Workwear Pants",
    "price": 1549,
    "id": "trouser-double-knee-workwear",
    "colors": [
      {
        "name": "Duck Brown",
        "value": "#8b5a2b"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 100,
    "image": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Double-Knee Workwear Pants casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday double-knee workwear pants engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Washed Charcoal Slim Jeans",
    "price": 1399,
    "id": "jeans-washed-charcoal-slim",
    "colors": [
      {
        "name": "Charcoal Wash",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 101,
    "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Washed Charcoal Slim Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday washed charcoal slim jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Pleated Casual Chinos",
    "price": 1299,
    "id": "trouser-pleated-casual-chinos",
    "colors": [
      {
        "name": "Sand Khaki",
        "value": "#c2b280"
      },
      {
        "name": "Dark Navy",
        "value": "#000080"
      }
    ],
    "featuredOrder": 102,
    "image": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
      "/images/product-jeans.webp",
      "/images/category-trousers.jpg"
    ],
    "alt": "Pleated Casual Chinos casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday pleated casual chinos engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Wide-Leg Skater Jeans",
    "price": 1599,
    "id": "jeans-wide-leg-skater",
    "colors": [
      {
        "name": "90s Bleached Blue",
        "value": "#b0e0e6"
      },
      {
        "name": "Grey Tint",
        "value": "#708090"
      }
    ],
    "featuredOrder": 103,
    "image": "/images/product-jeans.webp",
    "images": [
      "/images/product-jeans.webp",
      "/images/category-trousers.jpg",
      "/images/category-trousers.jpg"
    ],
    "alt": "Wide-Leg Skater Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday wide-leg skater jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Linen-Blend Drawstring Trousers",
    "price": 1349,
    "originalPrice": 1649,
    "id": "trouser-linen-blend-drawstring",
    "colors": [
      {
        "name": "Natural Flax",
        "value": "#e2dac8"
      },
      {
        "name": "White",
        "value": "#ffffff"
      }
    ],
    "featuredOrder": 104,
    "image": "/images/category-trousers.jpg",
    "images": [
      "/images/category-trousers.jpg",
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Linen-Blend Drawstring Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday linen-blend drawstring trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Tapered Utility Cargo Pants",
    "price": 1449,
    "id": "trouser-tapered-utility-cargo",
    "colors": [
      {
        "name": "Combat Grey",
        "value": "#4f5b66"
      },
      {
        "name": "Army Olive",
        "value": "#4b5320"
      }
    ],
    "featuredOrder": 105,
    "image": "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Tapered Utility Cargo Pants casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday tapered utility cargo pants engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Heavy Cotton Twill Trousers",
    "price": 1299,
    "id": "trouser-heavy-cotton-twill",
    "colors": [
      {
        "name": "Tobacco",
        "value": "#795034"
      },
      {
        "name": "Navy",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 106,
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Heavy Cotton Twill Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday heavy cotton twill trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Light Stonewash Straight Jeans",
    "price": 1499,
    "id": "jeans-light-stonewash-straight",
    "colors": [
      {
        "name": "Stonewash Blue",
        "value": "#5d8aa8"
      }
    ],
    "featuredOrder": 107,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Light Stonewash Straight Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday light stonewash straight jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Corduroy Relaxed Trousers",
    "price": 1399,
    "originalPrice": 1699,
    "id": "trouser-corduroy-relaxed",
    "colors": [
      {
        "name": "Rich Brown",
        "value": "#654321"
      },
      {
        "name": "Forest Olive",
        "value": "#2e4a2e"
      }
    ],
    "featuredOrder": 108,
    "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Corduroy Relaxed Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday corduroy relaxed trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Easy-Stretch Everyday Chinos",
    "price": 1149,
    "id": "trouser-easy-stretch-everyday-chinos",
    "colors": [
      {
        "name": "Beige",
        "value": "#f5f5dc"
      },
      {
        "name": "Charcoal",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 109,
    "image": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Easy-Stretch Everyday Chinos casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday easy-stretch everyday chinos engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Cropped Straight-Leg Trousers",
    "price": 1299,
    "id": "trouser-cropped-straight-leg",
    "colors": [
      {
        "name": "Off-Black",
        "value": "#1c1c1c"
      },
      {
        "name": "Grey Melange",
        "value": "#a9a9a9"
      }
    ],
    "featuredOrder": 110,
    "image": "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Cropped Straight-Leg Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday cropped straight-leg trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Distressed Vintage Wash Jeans",
    "price": 1649,
    "originalPrice": 1999,
    "id": "jeans-distressed-vintage-wash",
    "colors": [
      {
        "name": "Vintage Tint",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 111,
    "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Distressed Vintage Wash Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday distressed vintage wash jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Drawstring Relaxed Denim",
    "price": 1399,
    "id": "jeans-drawstring-relaxed-denim",
    "colors": [
      {
        "name": "Mid Blue",
        "value": "#4169e1"
      },
      {
        "name": "Dark Blue",
        "value": "#00008b"
      }
    ],
    "featuredOrder": 112,
    "image": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Drawstring Relaxed Denim casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday drawstring relaxed denim engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Classic Regular-Fit Khakis",
    "price": 1199,
    "id": "trouser-classic-regular-fit-khakis",
    "colors": [
      {
        "name": "Classic Khaki",
        "value": "#c3b091"
      },
      {
        "name": "Navy",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 113,
    "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Classic Regular-Fit Khakis casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday classic regular-fit khakis engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Monochrome Black Straight Jeans",
    "price": 1449,
    "id": "jeans-monochrome-black-straight",
    "colors": [
      {
        "name": "Pitch Black",
        "value": "#0a0a0a"
      }
    ],
    "featuredOrder": 114,
    "image": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
      "/images/product-jeans.webp",
      "/images/category-trousers.jpg"
    ],
    "alt": "Monochrome Black Straight Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday monochrome black straight jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Herringbone Wool-Blend Trousers",
    "price": 1699,
    "originalPrice": 2099,
    "id": "trouser-herringbone-wool-blend",
    "colors": [
      {
        "name": "Charcoal Herringbone",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 115,
    "image": "/images/product-jeans.webp",
    "images": [
      "/images/product-jeans.webp",
      "/images/category-trousers.jpg",
      "/images/category-trousers.jpg"
    ],
    "alt": "Herringbone Wool-Blend Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday herringbone wool-blend trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Loose-Fit Carpenter Pants",
    "price": 1499,
    "id": "trouser-loose-fit-carpenter",
    "colors": [
      {
        "name": "Washed Off-White",
        "value": "#faf0e6"
      },
      {
        "name": "Khaki Twill",
        "value": "#bdb76b"
      }
    ],
    "featuredOrder": 116,
    "image": "/images/category-trousers.jpg",
    "images": [
      "/images/category-trousers.jpg",
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Loose-Fit Carpenter Pants casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday loose-fit carpenter pants engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Washed Olive Military Cargos",
    "price": 1449,
    "id": "trouser-washed-olive-military-cargos",
    "colors": [
      {
        "name": "Faded Olive",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 117,
    "image": "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Washed Olive Military Cargos casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": false,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday washed olive military cargos engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Classic Dark-Wash Slim Jeans",
    "price": 1399,
    "id": "jeans-classic-dark-wash-slim",
    "colors": [
      {
        "name": "Dark Rinse",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 118,
    "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Classic Dark-Wash Slim Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday classic dark-wash slim jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Casual Linen Everyday Trousers",
    "price": 1299,
    "id": "trouser-casual-linen-everyday",
    "colors": [
      {
        "name": "Sand",
        "value": "#d2b48c"
      },
      {
        "name": "Olive Linen",
        "value": "#6b8e23"
      }
    ],
    "featuredOrder": 119,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Casual Linen Everyday Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday casual linen everyday trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Heavy Canvas Utility Trousers",
    "price": 1499,
    "id": "trouser-heavy-canvas-utility",
    "colors": [
      {
        "name": "Field Khaki",
        "value": "#c2b280"
      },
      {
        "name": "Black Canvas",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 120,
    "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Heavy Canvas Utility Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday heavy canvas utility trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Baggy-Fit 90s Blue Jeans",
    "price": 1599,
    "originalPrice": 1899,
    "id": "jeans-baggy-fit-90s-blue",
    "colors": [
      {
        "name": "90s Blue Wash",
        "value": "#4682b4"
      }
    ],
    "featuredOrder": 121,
    "image": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Baggy-Fit 90s Blue Jeans casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday baggy-fit 90s blue jeans engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Pleated Flannel Trousers",
    "price": 1499,
    "id": "trouser-pleated-flannel",
    "colors": [
      {
        "name": "Heather Grey",
        "value": "#808080"
      },
      {
        "name": "Dark Navy",
        "value": "#000080"
      }
    ],
    "featuredOrder": 122,
    "image": "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Pleated Flannel Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday pleated flannel trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Slim-Tapered Cotton Trousers",
    "price": 1199,
    "id": "trouser-slim-tapered-cotton",
    "colors": [
      {
        "name": "Clean Khaki",
        "value": "#f0e68c"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 123,
    "image": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Slim-Tapered Cotton Trousers casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday slim-tapered cotton trousers engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Stretch Twill Commuter Pants",
    "price": 1249,
    "id": "trouser-stretch-twill-commuter",
    "colors": [
      {
        "name": "Navy Commuter",
        "value": "#191970"
      },
      {
        "name": "Grey",
        "value": "#708090"
      }
    ],
    "featuredOrder": 124,
    "image": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Stretch Twill Commuter Pants casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday stretch twill commuter pants engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "name": "Essential Black Casual Chinos",
    "price": 1099,
    "id": "trouser-essential-black-chinos",
    "colors": [
      {
        "name": "Core Black",
        "value": "#141414"
      }
    ],
    "featuredOrder": 125,
    "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
      "/images/category-trousers.jpg"
    ],
    "alt": "Essential Black Casual Chinos casual bottoms",
    "category": "Trousers & Jeans",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "description": "Dependable everyday essential black casual chinos engineered with comfortable room in the seat and natural leg profile.",
    "details": [
      "Durable cotton construction with comfort stretch",
      "Heavy-duty bar-tacks at stress points",
      "Functional multi-pocket styling with zip fly"
    ],
    "fitFabric": {
      "fit": "Regular straight cut with clean break.",
      "fabric": "98% Cotton, 2% Elastane.",
      "care": "Machine wash cold inside-out."
    }
  },
  {
    "id": "lightweight-utility-jacket",
    "name": "Lightweight Utility Jacket",
    "price": 1799,
    "originalPrice": 2299,
    "image": "/images/product-jacket.webp",
    "images": [
      "/images/product-jacket.webp",
      "/images/category-jackets.jpg",
      "/images/editorial-campaign.webp"
    ],
    "alt": "Model wearing a military-inspired utility jacket in washed khaki",
    "category": "Jackets",
    "colors": [
      {
        "name": "Washed Khaki",
        "value": "#9e927c"
      },
      {
        "name": "Dark Olive",
        "value": "#444d3d"
      },
      {
        "name": "Onyx Black",
        "value": "#242426"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "featuredOrder": 4,
    "description": "Durable cotton canvas transitional layer engineered with four bellow pockets, concealed zip front, and waist cinch.",
    "details": [
      "100% garment-washed cotton canvas (280 GSM)",
      "Four pleated utility cargo pockets with snap flaps",
      "Concealed two-way zip closure with snap storm placket"
    ],
    "fitFabric": {
      "fit": "Straight relaxed over-jacket cut.",
      "fabric": "100% Cotton Canvas.",
      "care": "Machine wash cold."
    }
  },
  {
    "id": "canvas-workwear-jacket",
    "name": "Canvas Workwear Jacket",
    "price": 1999,
    "image": "/images/products/demo-canvas-workwear-jacket.jpg",
    "images": [
      "/images/products/demo-canvas-workwear-jacket.jpg",
      "/images/product-jacket.webp"
    ],
    "alt": "Heavy duck canvas workwear chore coat in tobacco brown",
    "category": "Jackets",
    "colors": [
      {
        "name": "Tobacco Duck",
        "value": "#835232"
      },
      {
        "name": "Black Canvas",
        "value": "#212121"
      },
      {
        "name": "Raw Natural",
        "value": "#dfd8c8"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "featuredOrder": 14,
    "description": "Traditional chore jacket silhouette crafted from rugged 10oz duck canvas with contrasting corduroy collar.",
    "details": [
      "Heavyweight 10oz cotton duck canvas",
      "Soft fine-wale contrast corduroy collar",
      "Triple-stitched main seams with reinforced bar-tacks"
    ],
    "fitFabric": {
      "fit": "Boxy workwear cut with room for hoodies.",
      "fabric": "Body: 100% Cotton. Collar: 100% Cotton.",
      "care": "Machine wash warm."
    }
  },
  {
    "id": "minimalist-bomber-jacket",
    "name": "Minimalist Bomber Jacket",
    "price": 1899,
    "image": "/images/products/demo-minimalist-bomber-jacket.jpg",
    "images": [
      "/images/products/demo-minimalist-bomber-jacket.jpg",
      "/images/category-jackets.jpg"
    ],
    "alt": "Minimalist satin-finish bomber jacket in black",
    "category": "Jackets",
    "colors": [
      {
        "name": "Matte Black",
        "value": "#1b1b1c"
      },
      {
        "name": "Deep Navy",
        "value": "#192330"
      },
      {
        "name": "Olive",
        "value": "#606450"
      }
    ],
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "inStock": true,
    "isNew": false,
    "featuredOrder": 15,
    "description": "Streamlined matte-finish shell jacket with tonal ribbing, two-way metal zipper, and interior welt pocket.",
    "details": [
      "Matte water-resistant polyester-nylon shell",
      "Heavy ribbed collar, cuffs, and waist hem",
      "Dual snap-closure hand pockets and zip sleeve pocket"
    ],
    "fitFabric": {
      "fit": "Clean modern bomber cut hitting at the hip.",
      "fabric": "Shell: 70% Polyester, 30% Nylon. Lining: 100% Polyester.",
      "care": "Dry clean recommended."
    },
    "isBestseller": false
  },
  {
    "id": "denim-overshirt-jacket",
    "name": "Denim Overshirt Jacket",
    "price": 1699,
    "originalPrice": 1999,
    "image": "/images/products/demo-denim-overshirt-jacket.png",
    "images": [
      "/images/products/demo-denim-overshirt-jacket.png",
      "/images/product-jacket.webp",
      "/images/editorial-campaign.webp"
    ],
    "alt": "Model wearing a vintage wash denim overshirt jacket with dual chest pockets",
    "category": "Jackets",
    "colors": [
      {
        "name": "Indigo",
        "value": "#465d70"
      },
      {
        "name": "Washed Black",
        "value": "#3d4144"
      }
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "inStock": true,
    "isNew": true,
    "featuredOrder": 16,
    "description": "11oz washed denim overshirt jacket finished with antique nickel shank buttons and subtle faded highs.",
    "details": [
      "11oz ring-spun cotton indigo denim",
      "Vintage enzyme wash gives soft drape and high-low fades",
      "Twin flap chest pockets and hidden welt waist pockets"
    ],
    "fitFabric": {
      "fit": "Relaxed layering piece with straight hem.",
      "fabric": "100% Cotton Denim.",
      "care": "Wash cold inside-out."
    },
    "isBestseller": false
  },
  {
    "name": "Classic Twill Harrington Jacket",
    "price": 1899,
    "id": "jacket-classic-twill-harrington",
    "colors": [
      {
        "name": "Khaki Tan",
        "value": "#c2b280"
      },
      {
        "name": "Navy",
        "value": "#1b2a4a"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 126,
    "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Classic Twill Harrington Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering classic twill harrington jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Washed Sherpa Trucker Jacket",
    "price": 2299,
    "originalPrice": 2699,
    "id": "jacket-washed-sherpa-trucker",
    "colors": [
      {
        "name": "Washed Denim/Cream",
        "value": "#4682b4"
      },
      {
        "name": "Washed Black",
        "value": "#222222"
      }
    ],
    "featuredOrder": 127,
    "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Washed Sherpa Trucker Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering washed sherpa trucker jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Matte Nylon Windbreaker",
    "price": 1499,
    "id": "jacket-matte-nylon-windbreaker",
    "colors": [
      {
        "name": "Olive Green",
        "value": "#556b2f"
      },
      {
        "name": "Slate Grey",
        "value": "#708090"
      }
    ],
    "featuredOrder": 128,
    "image": "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Matte Nylon Windbreaker outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering matte nylon windbreaker tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Cotton Twill Coach Jacket",
    "price": 1649,
    "id": "jacket-cotton-twill-coach",
    "colors": [
      {
        "name": "Dark Navy",
        "value": "#000080"
      },
      {
        "name": "Sand",
        "value": "#d2b48c"
      }
    ],
    "featuredOrder": 129,
    "image": "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Cotton Twill Coach Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering cotton twill coach jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Heavy Corduroy Trucker Jacket",
    "price": 1999,
    "originalPrice": 2399,
    "id": "jacket-heavy-corduroy-trucker",
    "colors": [
      {
        "name": "Tobacco Cord",
        "value": "#8b5a2b"
      },
      {
        "name": "Navy Cord",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 130,
    "image": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Heavy Corduroy Trucker Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering heavy corduroy trucker jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Quilted Liner Zip Jacket",
    "price": 1699,
    "id": "jacket-quilted-liner-zip",
    "colors": [
      {
        "name": "Military Olive",
        "value": "#4b5320"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 131,
    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Quilted Liner Zip Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering quilted liner zip jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Multi-Pocket Field Jacket",
    "price": 2199,
    "originalPrice": 2599,
    "id": "jacket-multi-pocket-field",
    "colors": [
      {
        "name": "Desert Tan",
        "value": "#d2b48c"
      },
      {
        "name": "Deep Olive",
        "value": "#3b4432"
      }
    ],
    "featuredOrder": 132,
    "image": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Multi-Pocket Field Jacket outerwear piece",
    "category": "Jackets",
    "inStock": false,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering multi-pocket field jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Waxed Cotton Chore Coat",
    "price": 2399,
    "originalPrice": 2899,
    "id": "jacket-waxed-cotton-chore",
    "colors": [
      {
        "name": "Dark Oak",
        "value": "#4b3621"
      },
      {
        "name": "Forest Green",
        "value": "#2e4a2e"
      }
    ],
    "featuredOrder": 133,
    "image": "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
      "/images/product-jacket.webp",
      "/images/category-jackets.jpg"
    ],
    "alt": "Waxed Cotton Chore Coat outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering waxed cotton chore coat tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Retro Track Zip Jacket",
    "price": 1399,
    "id": "jacket-retro-track-zip",
    "colors": [
      {
        "name": "Navy/White Stripe",
        "value": "#1b2a4a"
      },
      {
        "name": "Green/White",
        "value": "#006400"
      }
    ],
    "featuredOrder": 134,
    "image": "/images/product-jacket.webp",
    "images": [
      "/images/product-jacket.webp",
      "/images/category-jackets.jpg",
      "/images/category-jackets.jpg"
    ],
    "alt": "Retro Track Zip Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering retro track zip jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Casual Polar Fleece Jacket",
    "price": 1299,
    "id": "jacket-casual-polar-fleece",
    "colors": [
      {
        "name": "Oatmeal Heather",
        "value": "#dcd4c9"
      },
      {
        "name": "Charcoal",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 135,
    "image": "/images/category-jackets.jpg",
    "images": [
      "/images/category-jackets.jpg",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Casual Polar Fleece Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering casual polar fleece jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Vintage Black Denim Jacket",
    "price": 1899,
    "id": "jacket-vintage-black-denim",
    "colors": [
      {
        "name": "Faded Black",
        "value": "#2b2b2b"
      }
    ],
    "featuredOrder": 136,
    "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Vintage Black Denim Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering vintage black denim jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Lightweight Hooded Rain Shell",
    "price": 1599,
    "id": "jacket-lightweight-hooded-rain-shell",
    "colors": [
      {
        "name": "Steel Blue",
        "value": "#4682b4"
      },
      {
        "name": "Black",
        "value": "#111111"
      }
    ],
    "featuredOrder": 137,
    "image": "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Lightweight Hooded Rain Shell outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering lightweight hooded rain shell tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Heavy Wool-Blend Overshirt Jacket",
    "price": 2149,
    "originalPrice": 2499,
    "id": "jacket-heavy-wool-blend-overshirt",
    "colors": [
      {
        "name": "Charcoal Plaid",
        "value": "#4a4a4a"
      },
      {
        "name": "Brown Houndstooth",
        "value": "#654321"
      }
    ],
    "featuredOrder": 138,
    "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Heavy Wool-Blend Overshirt Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering heavy wool-blend overshirt jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Safari Pocket Utility Jacket",
    "price": 1949,
    "id": "jacket-safari-pocket-utility",
    "colors": [
      {
        "name": "Khaki Beige",
        "value": "#c3b091"
      },
      {
        "name": "Olive",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 139,
    "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Safari Pocket Utility Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering safari pocket utility jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Minimalist Zip Overcoat",
    "price": 2499,
    "id": "jacket-minimalist-zip-overcoat",
    "colors": [
      {
        "name": "Pitch Black",
        "value": "#0a0a0a"
      },
      {
        "name": "Dark Grey",
        "value": "#2f4f4f"
      }
    ],
    "featuredOrder": 140,
    "image": "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Minimalist Zip Overcoat outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering minimalist zip overcoat tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Fleece-Lined Cotton Trucker",
    "price": 2099,
    "id": "jacket-fleece-lined-cotton-trucker",
    "colors": [
      {
        "name": "Washed Tan",
        "value": "#d2b48c"
      },
      {
        "name": "Washed Olive",
        "value": "#556b2f"
      }
    ],
    "featuredOrder": 141,
    "image": "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Fleece-Lined Cotton Trucker outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering fleece-lined cotton trucker tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Reversible Souvenir Bomber Jacket",
    "price": 2249,
    "originalPrice": 2599,
    "id": "jacket-reversible-souvenir-bomber",
    "colors": [
      {
        "name": "Black/Olive Reversible",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 142,
    "image": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Reversible Souvenir Bomber Jacket outerwear piece",
    "category": "Jackets",
    "inStock": false,
    "isNew": true,
    "isBestseller": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering reversible souvenir bomber jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Washed Canvas Chore Jacket",
    "price": 1799,
    "id": "jacket-washed-canvas-chore",
    "colors": [
      {
        "name": "Natural Sand",
        "value": "#e2dac8"
      },
      {
        "name": "Navy Canvas",
        "value": "#1b2a4a"
      }
    ],
    "featuredOrder": 143,
    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Washed Canvas Chore Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering washed canvas chore jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Lightweight Harrington - Khaki",
    "price": 1749,
    "id": "jacket-lightweight-harrington-khaki",
    "colors": [
      {
        "name": "Pure Khaki",
        "value": "#c3b091"
      }
    ],
    "featuredOrder": 144,
    "image": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Lightweight Harrington - Khaki outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering lightweight harrington - khaki tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Water-Repellent Commuter Shell",
    "price": 1699,
    "id": "jacket-water-repellent-commuter",
    "colors": [
      {
        "name": "Dark Navy",
        "value": "#000080"
      },
      {
        "name": "Charcoal Grey",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 145,
    "image": "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=800&auto=format&fit=crop&q=80",
      "/images/product-jacket.webp",
      "/images/category-jackets.jpg"
    ],
    "alt": "Water-Repellent Commuter Shell outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering water-repellent commuter shell tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Classic Mac Rain Jacket",
    "price": 2299,
    "id": "jacket-classic-mac-rain",
    "colors": [
      {
        "name": "British Tan",
        "value": "#d2b48c"
      },
      {
        "name": "Midnight Blue",
        "value": "#191970"
      }
    ],
    "featuredOrder": 146,
    "image": "/images/product-jacket.webp",
    "images": [
      "/images/product-jacket.webp",
      "/images/category-jackets.jpg",
      "/images/category-jackets.jpg"
    ],
    "alt": "Classic Mac Rain Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering classic mac rain jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Distressed Denim Trucker Jacket",
    "price": 1849,
    "id": "jacket-distressed-denim-trucker",
    "colors": [
      {
        "name": "Vintage Stonewash",
        "value": "#5f9ea0"
      }
    ],
    "featuredOrder": 147,
    "image": "/images/category-jackets.jpg",
    "images": [
      "/images/category-jackets.jpg",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Distressed Denim Trucker Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": true,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering distressed denim trucker jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Snap-Front Flannel Shacket",
    "price": 1549,
    "id": "jacket-snap-front-flannel-shacket",
    "colors": [
      {
        "name": "Shadow Plaid",
        "value": "#2f4f4f"
      },
      {
        "name": "Rust Check",
        "value": "#b7410e"
      }
    ],
    "featuredOrder": 148,
    "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Snap-Front Flannel Shacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering snap-front flannel shacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Cotton Ripstop Field Jacket",
    "price": 1899,
    "id": "jacket-cotton-ripstop-field",
    "colors": [
      {
        "name": "Army Green",
        "value": "#4b5320"
      },
      {
        "name": "Black Ripstop",
        "value": "#1a1a1a"
      }
    ],
    "featuredOrder": 149,
    "image": "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Cotton Ripstop Field Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering cotton ripstop field jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Varsity Collar Casual Jacket",
    "price": 1799,
    "id": "jacket-varsity-collar-casual",
    "colors": [
      {
        "name": "Navy/Cream",
        "value": "#1b2a4a"
      },
      {
        "name": "Forest/White",
        "value": "#228b22"
      }
    ],
    "featuredOrder": 150,
    "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Varsity Collar Casual Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": true,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering varsity collar casual jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  },
  {
    "name": "Tailored Casual Blazer Jacket",
    "price": 2399,
    "originalPrice": 2799,
    "id": "jacket-tailored-casual-blazer",
    "colors": [
      {
        "name": "Navy Twill",
        "value": "#191970"
      },
      {
        "name": "Charcoal Melange",
        "value": "#36454f"
      }
    ],
    "featuredOrder": 151,
    "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
    "images": [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80",
      "/images/category-jackets.jpg"
    ],
    "alt": "Tailored Casual Blazer Jacket outerwear piece",
    "category": "Jackets",
    "inStock": true,
    "isNew": false,
    "isBestseller": false,
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "description": "Substantial layering tailored casual blazer jacket tailored for cool mornings and evening utility.",
    "details": [
      "Heavyweight weather-resistant shell",
      "Premium hardware with smooth action",
      "Dual secure hand pockets and interior storage"
    ],
    "fitFabric": {
      "fit": "Layer-ready relaxed cut through chest and arms.",
      "fabric": "Heavyweight Durable Cotton / Poly Blend.",
      "care": "Machine wash gentle cold or dry clean."
    }
  }
]

import { kidsProducts } from './kidsProducts'
products.push(...kidsProducts)

export { kidsProducts }

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'

/**
 * All valid sizes discovered dynamically from the product dataset, ordered from smallest to largest.
 */
export const ALL_SIZES: ProductSize[] = Array.from(
  new Set(products.flatMap((p) => p.sizes))
).sort((a, b) => {
  const order: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 }
  return (order[a] || 99) - (order[b] || 99)
}) as ProductSize[]

