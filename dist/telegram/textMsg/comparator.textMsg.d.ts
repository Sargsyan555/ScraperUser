export type InputText = {
    name: string;
    qty?: string | number;
    brand?: string;
};
import { ParsedRow } from "../exel/exel.types";
export declare function compareItemTextHandler(inputItem: InputText, skladItems: ParsedRow[]): Promise<{
    messages: string;
}>;
