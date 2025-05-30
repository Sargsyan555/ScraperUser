import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductBySeltex } from '../SeltexData';

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
    const product = findProductBySeltex(name);

    if (product) {
      result.found = true;
      result.name = product.name || '-';
      // Если цена в строке как строка, пробуем преобразовать в число
      result.price = product.price || '-';
      result.brand =
        product.brand && product.brand?.length > 1
          ? product.brand
          : 'нет бренда';
    }

    results.push(result);
  }

  return Promise.resolve(results);
}
