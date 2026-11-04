with open('src/components/ProductDetailPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the function signature
bad_head = "export default function ProductDetailPage({\n  const { id } = useParams"
good_head = "export default function ProductDetailPage({ addToCart }: ProductDetailPageProps) {\n  const { id } = useParams"

text = text.replace(bad_head, good_head, 1)

with open('src/components/ProductDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed ProductDetailPage function header")

