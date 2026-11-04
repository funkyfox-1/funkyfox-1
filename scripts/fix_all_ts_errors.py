# 1. Update src/admin/lib/types.ts: add notes?: string
with open('src/admin/lib/types.ts', 'r', encoding='utf-8') as f:
    types_text = f.read()

if 'internalNotes?: string[];' in types_text and 'notes?: string;' not in types_text:
    types_text = types_text.replace(
        'internalNotes?: string[];',
        'internalNotes?: string[];\n  notes?: string;'
    )
    with open('src/admin/lib/types.ts', 'w', encoding='utf-8') as f:
        f.write(types_text)
    print("Updated types.ts with notes?: string")

# 2. Update src/admin/services/storeService.ts
with open('src/admin/services/storeService.ts', 'r', encoding='utf-8') as f:
    store_text = f.read()

# Make sure newOrder.notes or newOrder.internalNotes is clean
store_text = store_text.replace(
    "newOrder.notes = '[LOCAL DEMO] Verified order created in local development mode';",
    "newOrder.notes = '[LOCAL DEMO] Verified order created in local development mode';\n      newOrder.internalNotes = ['[LOCAL DEMO] Verified order created in local development mode'];"
)
with open('src/admin/services/storeService.ts', 'w', encoding='utf-8') as f:
    f.write(store_text)
print("Updated storeService.ts notes assignment")

# 3. Update src/components/ShopPage.tsx
with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    shop_text = f.read()

# Fix currentCatalog declaration and typing
old_cat_decl = "  // Dynamic reactive product catalog from storeService with fallback to allProducts\n  const currentCatalog = React.useMemo(() => {"
new_cat_decl = "  // Dynamic reactive product catalog from storeService with fallback to allProducts\n  const currentCatalog: Product[] = React.useMemo(() => {"
shop_text = shop_text.replace(old_cat_decl, new_cat_decl)

# Fix dependency of currentCatalog
shop_text = shop_text.replace("}, [currentCatalog, storeTick]);", "}, [allProducts, storeTick]);")

# Fix availableColors iteration typing
old_colors_loop = """  const availableColors = React.useMemo(() => {
    const map = new Map<string, string>()
    currentCatalog.forEach((p) => {
      p.colors.forEach((c) => {"""
new_colors_loop = """  const availableColors = React.useMemo(() => {
    const map = new Map<string, string>()
    currentCatalog.forEach((p: Product) => {
      p.colors.forEach((c: { name: string; value: string }) => {"""
shop_text = shop_text.replace(old_colors_loop, new_colors_loop)

# Fix filteredProducts parameter typing
old_filter_pred = "  const filteredProducts = React.useMemo(() => {\n    return currentCatalog.filter((product) => {"
new_filter_pred = "  const filteredProducts = React.useMemo(() => {\n    return currentCatalog.filter((product: Product) => {"
shop_text = shop_text.replace(old_filter_pred, new_filter_pred)

old_size_some = "const hasSize = product.sizes.some((s) => selectedSizes.includes(s))"
new_size_some = "const hasSize = product.sizes.some((s: string) => selectedSizes.includes(s))"
shop_text = shop_text.replace(old_size_some, new_size_some)

old_color_some = "const hasColor = product.colors.some((c) => selectedColors.includes(c.name))"
new_color_some = "const hasColor = product.colors.some((c: { name: string; value: string }) => selectedColors.includes(c.name))"
shop_text = shop_text.replace(old_color_some, new_color_some)

old_color_chip = "product.colors.some((c) => selectedColors.includes(c.name))"
shop_text = shop_text.replace(old_color_chip, "product.colors.some((c: { name: string; value: string }) => selectedColors.includes(c.name))")

with open('src/components/ShopPage.tsx', 'w', encoding='utf-8') as f:
    f.write(shop_text)
print("Updated ShopPage.tsx typings")

# 4. Update src/components/ProductDetailPage.tsx
with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    pdp_text = f.read()

# Let's inspect top of ProductDetailPage function
# We need storeTick and sync effect before product and isSizeAvailable, and selectedColor before isSizeAvailable
old_pdp_head_idx = pdp_text.find('export default function ProductDetailPage')
pdp_body_idx = pdp_text.find('{', old_pdp_head_idx)

# Find where handleAddToCart starts
cart_handler_idx = pdp_text.find('const handleAddToCart =')

# Replace the state section of ProductDetailPage cleanly
pdp_state_section = """  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Live Storefront Synchronization with Admin Store
  const [storeTick, setStoreTick] = React.useState<number>(0)
  React.useEffect(() => {
    const handleSync = () => setStoreTick((t) => t + 1)
    window.addEventListener('funkyfox:store_updated', handleSync)
    return () => window.removeEventListener('funkyfox:store_updated', handleSync)
  }, [])

  // Find product by id (authoritative from storeService with fallback to products)
  const product: Product | undefined = React.useMemo(() => {
    try {
      const sp = storeService.getProductById(id || '');
      if (sp) {
        return {
          id: sp.id,
          name: sp.name,
          price: sp.price,
          originalPrice: sp.originalPrice,
          image: sp.image,
          images: sp.images && sp.images.length > 0 ? sp.images : [sp.image],
          alt: sp.alt || sp.name,
          category: sp.category as any,
          colors:
            sp.variants && sp.variants.length > 0
              ? Array.from(
                  new Map(
                    sp.variants.map((v) => [v.colorName, { name: v.colorName, value: v.colorHex }])
                  ).values()
                )
              : [{ name: 'Standard', value: '#171717' }],
          sizes:
            sp.variants && sp.variants.length > 0
              ? (Array.from(new Set(sp.variants.map((v) => v.size))) as any)
              : (['S', 'M', 'L', 'XL'] as any),
          inStock: sp.totalStock > 0 && sp.status === 'active',
          isNew: sp.isNew,
          isBestseller: sp.isBestseller,
          featuredOrder: sp.featuredOrder || 99,
          description: sp.description,
          details: sp.details,
          fitFabric: (sp as any).fitFabric || (products.find((p) => p.id === id) as any)?.fitFabric,
        };
      }
    } catch {}
    return products.find((p) => p.id === id);
  }, [id, storeTick]);

  // Gallery state
  const images = React.useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length > 0) {
      return product.images
    }
    return [product.image]
  }, [product])

  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0)

  // Selection states
  const [selectedColor, setSelectedColor] = React.useState<string>(
    product?.colors[0]?.name || ''
  )
  const [selectedSize, setSelectedSize] = React.useState<string>('')
  const [quantity, setQuantity] = React.useState<number>(1)
  const [sizeError, setSizeError] = React.useState<string>('')
  const [showStickyBar, setShowStickyBar] = React.useState<boolean>(false)

  // Variant availability checking
  const isSizeAvailable = React.useCallback(
    (size: string) => {
      if (!product || !product.sizes.includes(size as any)) return false;
      try {
        const ap = storeService.getProductById(product.id);
        if (ap && ap.variants && ap.variants.length > 0) {
          const normCol = (selectedColor || '').toLowerCase().trim();
          const variant = ap.variants.find(
            (v) =>
              v.size.toLowerCase().trim() === size.toLowerCase().trim() &&
              (!normCol || v.colorName.toLowerCase().trim() === normCol)
          );
          if (variant) {
            return variant.stock > 0 && variant.inStock !== false;
          }
        }
      } catch {}
      return product.inStock;
    },
    [product, selectedColor, storeTick]
  );
"""

# Replace between pdp_body_idx+1 and cart_handler_idx
pdp_text = pdp_text[:pdp_body_idx+1] + "\n" + pdp_state_section + "\n" + pdp_text[cart_handler_idx:]

# Also fix line 1554 parameter sz: string
pdp_text = pdp_text.replace("product.sizes.map((sz) =>", "product.sizes.map((sz: string) =>")

with open('src/components/ProductDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(pdp_text)
print("Updated ProductDetailPage.tsx state declarations and typings")

