/**
 * @file search.ts
 * @description Shared product search normalization and matching logic.
 * Ensures consistent search behaviour between SearchOverlay and ShopPage.
 */

import type { Product } from '../data/products'

/**
 * Common apparel term equivalents to bridge common user searches like
 * 'tshirt', 't shirt', 't-shirt', 'tee', 'tees', 'jeans', 'trousers', etc.
 */
const APPAREL_SYNONYMS: Record<string, string[]> = {
  tshirt: ['t-shirt', 't shirt', 't-shirts', 't shirts', 'tee', 'tees'],
  tshirts: ['t-shirt', 't shirt', 't-shirts', 't shirts', 'tee', 'tees'],
  't-shirt': ['tshirt', 't shirt', 't-shirts', 't shirts', 'tee', 'tees'],
  't-shirts': ['tshirt', 't-shirt', 't shirt', 'tshirts', 'tees'],
  't shirt': ['tshirt', 't-shirt', 't-shirts', 'tee'],
  't shirts': ['tshirt', 't-shirts', 't-shirt', 'tees'],
  tee: ['t-shirt', 'tshirt', 't shirt', 't-shirts'],
  tees: ['t-shirt', 'tshirt', 't-shirts', 'tshirts'],
  shirt: ['shirts'],
  shirts: ['shirt'],
  trouser: ['trousers', 'pants', 'jeans'],
  trousers: ['trouser', 'pants', 'jeans'],
  jean: ['jeans', 'denim'],
  jeans: ['jean', 'denim'],
  jacket: ['jackets', 'outerwear', 'overshirt', 'bomber'],
  jackets: ['jacket', 'outerwear', 'overshirt', 'bomber'],
}

/**
 * Builds the searchable corpus string for a product.
 * Combines: name, category, description, colors, details, fitFabric.
 */
export function buildProductSearchHaystack(product: Product): {
  raw: string
  normalizedWithSpaces: string
  normalizedCollapsed: string
} {
  const name = product.name || ''
  const category = product.category || ''
  const desc = product.description || ''
  const colors = (product.colors || []).map((c) => c.name).join(' ')
  const details = (product.details || []).join(' ')
  const fitFabric = product.fitFabric
    ? `${product.fitFabric.fit} ${product.fitFabric.fabric} ${product.fitFabric.care}`
    : ''

  const raw = `${name} ${category} ${desc} ${colors} ${details} ${fitFabric}`.toLowerCase()
  const normalizedWithSpaces = raw.replace(/[-_]/g, ' ')
  // Collapsed form without hyphens for compound words like 'tshirt' vs 't-shirt'
  const normalizedCollapsed = raw.replace(/[-_]/g, '')

  return {
    raw,
    normalizedWithSpaces,
    normalizedCollapsed,
  }
}

/**
 * Tests whether a product matches a search query.
 * Splits query into tokens and checks that every token (or its common apparel synonym)
 * matches within the product's searchable content.
 */
export function matchesProductSearch(product: Product, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true

  const { raw, normalizedWithSpaces, normalizedCollapsed } =
    buildProductSearchHaystack(product)

  const cleanQuery = trimmed.replace(/[-_]/g, ' ')
  const collapsedQuery = trimmed.replace(/[-_\s]/g, '')

  // Direct phrase match
  if (
    raw.includes(trimmed) ||
    normalizedWithSpaces.includes(cleanQuery) ||
    normalizedCollapsed.includes(collapsedQuery)
  ) {
    return true
  }

  // Token-by-token check
  const tokens = cleanQuery.split(/\s+/).filter(Boolean)

  return tokens.every((token) => {
    // 1. Direct token match against raw or normalized variants
    if (
      raw.includes(token) ||
      normalizedWithSpaces.includes(token) ||
      normalizedCollapsed.includes(token)
    ) {
      return true
    }

    // 2. Check apparel synonym expansion
    const synonyms = APPAREL_SYNONYMS[token]
    if (
      synonyms &&
      synonyms.some((syn) => {
        const synClean = syn.replace(/[-_]/g, ' ')
        const synCollapsed = syn.replace(/[-_\s]/g, '')
        return (
          raw.includes(syn) ||
          normalizedWithSpaces.includes(synClean) ||
          normalizedCollapsed.includes(synCollapsed)
        )
      })
    ) {
      return true
    }

    return false
  })
}

/**
 * Fast Levenshtein distance computation for typo detection.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Curated list of verified catalog terms and categories to match against.
 */
const CANONICAL_CATALOG_TERMS = [
  'T-Shirts',
  'Shirts',
  'Trousers & Jeans',
  'Jackets',
  'T-Shirt',
  'Shirt',
  'Trouser',
  'Jacket',
  'Jeans',
  'Oversized',
  'Heavyweight',
  'Cotton',
  'Linen',
  'Denim',
  'Cargo',
  'Chino',
  'Bomber',
  'Poplin',
  'Relaxed',
  'Oxford',
  'Polo',
  'Corduroy',
  'Flannel',
  'Twill',
]

/**
 * Suggests valid typo corrections or related catalog categories based on user query.
 */
export function findTypoSuggestions(query: string, maxSuggestions = 3): string[] {
  const clean = query.trim().toLowerCase().replace(/[-_]/g, '')
  if (!clean || clean.length < 2) return []

  const scored: { term: string; distance: number }[] = []

  for (const term of CANONICAL_CATALOG_TERMS) {
    const cleanTerm = term.toLowerCase().replace(/[-_\s&]/g, '')

    const displayTerm =
      term === 'T-Shirt'
        ? 'T-Shirts'
        : term === 'Shirt'
        ? 'Shirts'
        : term === 'Trouser' || term === 'Jeans'
        ? 'Trousers & Jeans'
        : term === 'Jacket'
        ? 'Jackets'
        : term

    // Check direct substring
    if (cleanTerm.includes(clean) || clean.includes(cleanTerm)) {
      scored.push({ term: displayTerm, distance: Math.abs(cleanTerm.length - clean.length) })
      continue
    }

    // Levenshtein check
    const dist = levenshteinDistance(clean, cleanTerm)
    const maxAllowed = clean.length <= 3 ? 1 : 2
    if (dist <= maxAllowed) {
      scored.push({ term: displayTerm, distance: dist })
    }
  }

  scored.sort((a, b) => a.distance - b.distance)
  const unique = Array.from(new Set(scored.map((s) => s.term)))
  return unique.slice(0, maxSuggestions)
}

