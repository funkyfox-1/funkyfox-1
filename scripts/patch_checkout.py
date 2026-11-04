with open('src/components/CheckoutPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update subtotal calculation
target_subtotal = """  const subtotal = React.useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.id)
      const unitPrice = (item as any).price || product?.price || 0
      return acc + unitPrice * item.qty
    }, 0)
  }, [cartItems])"""

replace_subtotal = """  const subtotal = React.useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const product = storeService.getProductById(item.id) || products.find((p) => p.id === item.id)
      const unitPrice = product?.price || 0
      return acc + unitPrice * item.qty
    }, 0)
  }, [cartItems])"""

text = text.replace(target_subtotal, replace_subtotal, 1)

# 2. Update items mapping in handleFinalOrderConfirm
target_items = """        items: cartItems.map((ci) => {
          const prod = products.find((p) => p.id === ci.id)
          return {
            id: ci.id,
            name: prod?.name || 'Funky Fox Garment',
            price: prod?.price || 999,
            quantity: ci.qty,
            size: ci.size || 'M',
            color: ci.color || 'Standard',
            image: prod?.image || '/images/product-tshirt.webp',
          }
        }),"""

replace_items = """        items: cartItems.map((ci) => {
          const authProd = storeService.getProductById(ci.id) || products.find((p) => p.id === ci.id)
          if (!authProd) {
            throw new Error(`Product "${ci.id}" is no longer available in the active catalog.`)
          }
          return {
            id: ci.id,
            name: authProd.name,
            price: authProd.price,
            quantity: ci.qty,
            size: ci.size || 'M',
            color: ci.color || 'Standard',
            image: authProd.image || '/images/product-tshirt.webp',
          }
        }),"""

text = text.replace(target_items, replace_items, 1)

with open('src/components/CheckoutPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated CheckoutPage.tsx successfully!")

