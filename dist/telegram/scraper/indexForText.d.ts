import { ScrapedProduct } from 'src/types/context.interface';
import { InputText } from '../textMsg/comparator.textMsg';
export declare function scrapeAllForText(productNames: InputText): Promise<ScrapedProduct[]>;
