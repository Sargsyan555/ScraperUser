import { InputExelFile, ParsedRow, ResultRow } from "./exel.types";
export declare function compareItems(inputItems: InputExelFile[], skladItems: ParsedRow[]): Promise<{
    messages: string[];
    notFound: string[];
    rows: ResultRow[];
}>;
