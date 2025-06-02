import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductsBy74Part } from '../74PartsData';

export function scrape74Parts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const products = findProductsBy74Part(name);

    if (products.length > 0) {
      for (const product of products) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.parts74,
          found: true,
          name: product.title || '-',
          price: product.price || '-',
          brand: (product.title && extractBrand(product.title)) || 'нет бренда',
        });
      }
    } else {
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.parts74,
        found: false,
      });
    }
  }

  return Promise.resolve(results);
}

function extractBrand(text: string): string {
  // Match all uppercase words (including commas and spaces between)
  const upperWords = text.match(/\b[A-Z0-9]+(?:\s+[A-Z0-9]+)*\b/g);

  if (!upperWords || upperWords.length === 0) {
    return ''; // No uppercase words found
  }

  if (upperWords.length === 1) {
    return upperWords[0]; // Only one brand
  }

  // Multiple uppercase words, return the last two joined with comma
  const lastTwo = upperWords.slice(-2).join(', ');
  return lastTwo;
}
