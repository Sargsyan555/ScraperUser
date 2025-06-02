import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductsByistkDeutz } from '../istkDeutzData';

export function scrapeIstkDeutz(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const products = findProductsByistkDeutz(name);

    if (products.length > 0) {
      for (const product of products) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.istk,
          found: true,
          name: product.title || '-',
          price: product.price || '-',
          brand: (product.title && extractBrand(product.title)) || 'нет бренда',
        });
      }
    } else {
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.istk,
        found: false,
      });
    }
  }

  return Promise.resolve(results);
}

function extractBrand(text: string): string {
  const match = text.match(/[A-Z]+/g);
  return match ? match.join(' ') : '';
}
