import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductsByShtren } from '../ShtrenData';

export function scrapeShtren(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const products = findProductsByShtren(name.trim());

    if (products.length > 0) {
      for (const product of products) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.shtern,
          found: true,
          name: product.Name || '-',
          price: product.Price || '-',
          brand: product.Brand || 'нет бренда',
        });
      }
    } else {
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.shtern,
        found: false,
      });
    }
  }

  return Promise.resolve(results);
}
