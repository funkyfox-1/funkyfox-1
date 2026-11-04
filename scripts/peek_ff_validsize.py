with open('src/FunkyFox.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const validSize = G;')
print(text[idx-50:idx+500])

