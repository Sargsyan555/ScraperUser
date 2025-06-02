import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductsByVoltag } from '../VoltagData';

export function scrapeVoltag(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const products = findProductsByVoltag(name.trim());

    if (products.length > 0) {
      for (const product of products) {
        const result: ScrapedProduct = {
          shop: SOURCE_WEBPAGE_KEYS.voltag,
          found: true,
          name: product.Name || '-',
          price: product.Price || '-',
          brand: product.Brand || 'нет бренда',
        };
        results.push(result);
      }
    } else {
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.voltag,
        found: false,
      });
    }
  }

  return Promise.resolve(results);
}
