// Renders a compact product summary.
import type { Product } from '../types/product';
export function ProductCard({ product }: { product: Product }) { return <article><h3>{product.name}</h3><p>{product.category} · {product.status}</p><strong>{product.finalPrice}</strong></article>; }