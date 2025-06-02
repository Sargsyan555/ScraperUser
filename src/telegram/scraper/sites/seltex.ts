import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductsBySeltex } from '../SeltexData';

export function scrapeSeltex(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  // Загружаем Excel-файл

  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.seltex,
      found: false,
    };

    // Ищем строку с артикулом в Excel (приводим к строке и обрезаем пробелы)
    const products = findProductsBySeltex(name);
    for (const product of products) {
      console.log('Seltex Nadasdnasn', product);

      if (product.price) {
        const result: ScrapedProduct = {
          shop: SOURCE_WEBPAGE_KEYS.seltex,
          found: true,
          name: product.articul || '-',
          price: product.price || '-',
          brand:
            product.brand && product.brand?.length > 1
              ? product.brand
              : 'нет бренда',
        };
        results.push(result);
        console.log('Seltex Res Nadasdnasn', result);
      }
    }
    if (!results.length) {
      results.push(result);
    }
  }

  return Promise.resolve(results);
}
