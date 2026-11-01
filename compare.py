from PIL import Image

ref = Image.open('C:/Users/prashanth/.gemini/antigravity/brain/a614a5e7-ee4d-4444-b33f-ce0eddc74663/.user_uploaded/media_1793480054736_6d8bfbb7.jpg')
ref_w, ref_h = ref.size # 576, 1024

rendered = Image.open('public/images/about/about-desktop-rendered.png')
# Downscale rendered width to 576 to compare proportions and aspect ratio
rend_w, rend_h = rendered.size
scale = ref_w / rend_w
new_h = int(rend_h * scale)
rendered_scaled = rendered.resize((ref_w, new_h), Image.Resampling.LANCZOS)

print(f"Ref height: {ref_h}, Rendered scaled height: {new_h}")

# Let's save a side by side of the top sections (Hero + Stats + Mission):
top_h = min(ref_h, new_h, 1024)
comp = Image.new('RGB', (ref_w * 2, top_h))
comp.paste(ref.crop((0, 0, ref_w, top_h)), (0, 0))
comp.paste(rendered_scaled.crop((0, 0, ref_w, top_h)), (ref_w, 0))
comp.save('public/images/about/visual-comparison-top.jpg', quality=90)
print("Saved visual-comparison-top.jpg")

