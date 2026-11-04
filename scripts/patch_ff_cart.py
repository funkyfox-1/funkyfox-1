with open('src/FunkyFox.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """    const validSize = G;

    s((W) => {"""

replacement = """    const validSize = G;

    // Authoritative Variant Stock Verification
    try {
      const sp = storeService.getProductById(w.id);
      if (sp) {
        if (sp.status !== 'active' || sp.totalStock <= 0) {
          X(`${w.name} is currently out of stock`);
          return;
        }
        if (sp.variants && sp.variants.length > 0) {
          const normColor = (selectedColor || '').toLowerCase().trim();
          const variant = sp.variants.find(
            (v) =>
              v.size.toLowerCase().trim() === validSize.toLowerCase().trim() &&
              (!normColor || v.colorName.toLowerCase().trim() === normColor)
          );
          if (variant && (variant.stock <= 0 || variant.inStock === false)) {
            X(`${w.name} (${validSize}) is currently out of stock`);
            return;
          }
        }
      }
    } catch {}

    s((W) => {"""

text = text.replace(target, replacement, 1)

with open('src/FunkyFox.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated FunkyFox.jsx successfully!")

