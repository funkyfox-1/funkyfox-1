with open('src/FunkyFox.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function U(w, ct, G, qtyToAdd = 1)')
print(text[idx:idx+1200])

