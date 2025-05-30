import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductByShtren } from '../ShtrenData';

export function scrapeShtren(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  // Загружаем Excel-файл

  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.shtern,
      found: false,
    };

    // Ищем строку с артикулом в Excel (приводим к строке и обрезаем пробелы)
    const product = findProductByShtren(name);

    if (product) {
      result.found = true;
      result.name = product.Name || '-';
      result.price = product.Price || '-';
      result.brand = product.Brand || 'нет бренда';
    }

    results.push(result);
  }

  return Promise.resolve(results);
}
