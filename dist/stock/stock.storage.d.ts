import { ParsedRow } from "src/telegram/exel/exel.types";
export declare class StockStorage {
    private stockData;
    getData(): ParsedRow[];
    setData(data: ParsedRow[]): void;
}
