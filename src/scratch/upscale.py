from PIL import Image

for name, (w, h) in [
    ('hero-art-full.png', (630, 500)),
    ('mission-rack-framed.png', (540, 390)),
    ('journey-collage-framed.png', (530, 340))
]:
    img = Image.open(f'public/images/about/{name}')
    img_2x = img.resize((w, h), Image.Resampling.LANCZOS)
    img_2x.save(f'public/images/about/{name.replace(".png", "@2x.png")}')
    print(f"Saved {name} at {w}x{h}")

