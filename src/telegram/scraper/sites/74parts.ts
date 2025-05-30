import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductBy74Part } from '../74PartsData';

export function scrape74Parts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  // Загружаем Excel-файл

  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.parts74,
      found: false,
    };

    // Ищем строку с артикулом в Excel (приводим к строке и обрезаем пробелы)
    const product = findProductBy74Part(name);

    if (product) {
      result.found = true;
      result.name = product.title || '-';
      // Если цена в строке как строка, пробуем преобразовать в число
      result.price = product.price || '-';
      result.brand =
        (product.title && extractBrand(product.title)) || 'нет бренда';
    }

    results.push(result);
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
