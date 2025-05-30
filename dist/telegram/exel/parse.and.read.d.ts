import { InputExelFile, ParsedRow } from './exel.types';
import { Telegram } from 'telegraf';
export declare function parseExcelFromTelegram(fileId: string, telegram: Telegram): Promise<InputExelFile[]>;
export declare function readExcelFromYandexDisk(publicUrl: string): Promise<ParsedRow[]>;
