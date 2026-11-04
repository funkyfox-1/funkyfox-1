with open('src/components/ShopPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add storeService import
import_target = "import { isDemoLoggedIn, toggleDemoWishlist, getDemoWishlist } from '../data/accountMockData'"
import_replace = "import { storeService } from '../admin/services/storeService'\nimport { isDemoLoggedIn, toggleDemoWishlist, getDemoWishlist } from '../data/accountMockData'"
text = text.replace(import_target, import_replace, 1)

# Add currentCatalog definition right before availableColors
target_colors = "  const availableColors = React.useMemo(() => {\n    const map = new Map<string, string>()\n    allProducts.forEach((p) => {"
replace_colors = """  // Dynamic reactive product catalog from storeService with fallback to allProducts
  const currentCatalog = React.useMemo(() => {
    try {
      const activeAdminProducts = storeService.getProducts().filter((p) => p.status === 'active');
      if (activeAdminProducts.length > 0) {
        return activeAdminProducts.map((ap) => ({
          id: ap.id,
          name: ap.name,
          price: ap.price,
          originalPrice: ap.originalPrice,
          image: ap.image,
          images: ap.images && ap.images.length > 0 ? ap.images : [ap.image],
          alt: ap.alt || ap.name,
          category: ap.category as any,
          colors:
            ap.variants && ap.variants.length > 0
              ? Array.from(
                  new Map(
                    ap.variants.map((v) => [v.colorName, { name: v.colorName, value: v.colorHex }])
                  ).values()
                )
              : [{ name: 'Standard', value: '#171717' }],
          sizes:
            ap.variants && ap.variants.length > 0
              ? (Array.from(new Set(ap.variants.map((v) => v.size))) as any)
              : (['S', 'M', 'L', 'XL'] as any),
          inStock: ap.totalStock > 0,
          isNew: ap.isNew || false,
          isBestseller: ap.isBestseller || false,
          featuredOrder: ap.featuredOrder || 99,
          description: ap.description,
          details: ap.details,
        }));
      }
    } catch {}
    return allProducts;
  }, [allProducts, storeTick]);

  const availableColors = React.useMemo(() => {
    const map = new Map<string, string>()
    currentCatalog.forEach((p) => {"""

text = text.replace(target_colors, replace_colors, 1)

# Update availableColors dependency
target_colors_dep = "  }, [allProducts, storeTick])"
replace_colors_dep = "  }, [currentCatalog, storeTick])"
text = text.replace(target_colors_dep, replace_colors_dep, 1)

# Update filteredProducts definition and dependencies
target_filter = """  // Filter products
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter((product) => {"""
replace_filter = """  // Filter products
  const filteredProducts = React.useMemo(() => {
    return currentCatalog.filter((product) => {"""
text = text.replace(target_filter, replace_filter, 1)

target_filter_dep = "  }, [searchQuery, activeCategory, selectedSizes, selectedColors, selectedPriceRange, onlyInStock])"
replace_filter_dep = "  }, [currentCatalog, searchQuery, activeCategory, selectedSizes, selectedColors, selectedPriceRange, onlyInStock, storeTick])"
text = text.replace(target_filter_dep, replace_filter_dep, 1)

# Update resultsCountText
target_results = "    if (visibleProducts.length < allProducts.length) {\n      return `SHOWING ${visibleProducts.length} OF ${allProducts.length} PRODUCTS`\n    }\n    return `${allProducts.length} PRODUCTS`"
replace_results = "    if (visibleProducts.length < currentCatalog.length) {\n      return `SHOWING ${visibleProducts.length} OF ${currentCatalog.length} PRODUCTS`\n    }\n    return `${currentCatalog.length} PRODUCTS`"
text = text.replace(target_results, replace_results, 1)

with open('src/components/ShopPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated ShopPage.tsx successfully!")

