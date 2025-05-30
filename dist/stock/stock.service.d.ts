import { OnModuleInit } from '@nestjs/common';
import { StockStorage } from './stock.storage';
import { ParsedRow } from 'src/telegram/exel/exel.types';
export declare class StockService implements OnModuleInit {
    private readonly stockStorage;
    constructor(stockStorage: StockStorage);
    onModuleInit(): Promise<void>;
    updateStock(): Promise<void>;
    getStock(): ParsedRow[];
}
