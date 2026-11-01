from PIL import Image

ref = Image.open('C:/Users/prashanth/.gemini/antigravity/brain/a614a5e7-ee4d-4444-b33f-ce0eddc74663/.user_uploaded/media_1793480054736_6d8bfbb7.jpg')
rendered = Image.open('public/images/about/about-desktop-rendered.png')

# Resize rendered to same height as ref (1024) or compare with side by side
# Ref is 576 x 1024.
# Rendered at 576 width is 576 x 1825.
# Let's create an image showing Ref on left (scaled to match rendered height 1825) and Rendered on right:
ref_scaled = ref.resize((576, 1825), Image.Resampling.LANCZOS)
rendered_scaled = rendered.resize((576, 1825), Image.Resampling.LANCZOS)

full_comp = Image.new('RGB', (1152, 1825))
full_comp.paste(ref_scaled, (0, 0))
full_comp.paste(rendered_scaled, (576, 0))
full_comp.save('public/images/about/full-side-by-side-comparison.jpg', quality=90)
print("Saved full-side-by-side-comparison.jpg")

