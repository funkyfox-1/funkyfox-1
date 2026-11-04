with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add storeService import
import_target = "import { products, formatPrice, getCategoryFallbackImage, ALL_SIZES, type Product } from '../data/products'"
import_replace = "import { products, formatPrice, getCategoryFallbackImage, ALL_SIZES, type Product } from '../data/products'\nimport { storeService } from '../admin/services/storeService'"
text = text.replace(import_target, import_replace, 1)

# 2. Update product lookup
product_target = "  // Find product by id\n  const product = products.find((p) => p.id === id)"
product_replace = """  // Find product by id (authoritative from storeService with fallback to products)
  const product = React.useMemo(() => {
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
        };
      }
    } catch {}
    return products.find((p) => p.id === id);
  }, [id, storeTick]);

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
  );"""

text = text.replace(product_target, product_replace, 1)

# 3. Update JellyRadio
jelly_target = """                <JellyRadio
                  items={ALL_SIZES.map((size) => ({
                    value: size,
                    label: size,
                    disabled: !product.sizes.includes(
                      size as (typeof product.sizes)[number]
                    ),
                  }))}
                  value={selectedSize}
                  onChange={(size) => handleSelectSize(size)}
                  name="product-size"
                />"""

jelly_replace = """                <JellyRadio
                  items={ALL_SIZES.map((size) => {
                    const isPartOfProduct = product.sizes.includes(
                      size as (typeof product.sizes)[number]
                    );
                    const available = isSizeAvailable(size);
                    return {
                      value: size,
                      label: isPartOfProduct && !available ? `${size} (Out of Stock)` : size,
                      disabled: !available,
                    };
                  })}
                  value={selectedSize}
                  onChange={(size) => handleSelectSize(size)}
                  name="product-size"
                />"""

text = text.replace(jelly_target, jelly_replace, 1)

# 4. Update handleAddToCart size validation
add_target = """    // Size validation
    if (!selectedSize) {
      setSizeError('Please choose a size before adding to bag.')
      // Scroll to size selector if needed
      const sizeElement = document.getElementById('size-selector-area')
      if (sizeElement) {
        sizeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setSizeError('')"""

add_replace = """    // Size validation
    if (!selectedSize) {
      setSizeError('Please choose a size before adding to bag.')
      // Scroll to size selector if needed
      const sizeElement = document.getElementById('size-selector-area')
      if (sizeElement) {
        sizeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Availability validation
    if (!isSizeAvailable(selectedSize)) {
      setSizeError(`Size ${selectedSize} is currently out of stock. Please select another size.`)
      return
    }

    setSizeError('')"""

text = text.replace(add_target, add_replace, 1)

with open('src/components/ProductDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated ProductDetailPage.tsx successfully!")

