export type InputExelFile = {
  'кат.номер': string;
  'кол-во'?: number;
  '№': string;
};

export type ParsedRow = {
  'кат.номер': string;
  'название детали': string;
  'кол-во': number;
  'цена, RUB': number;
  'сумма, RUB': number;
};

export type ResultRow = {
  name: string;
  kalichestvo: number;
  luchshayaCena: number | string;
  summa: number;
  luchshiyPostavshik: string;
  sklad: any[];
  seltex: any[];
  imachinery: any[];
  impart: any[];
  '74parts': any[];
  zipteh: any[];
  'b2b.ixora-auto': any[];
  'vip.blumaq': any[];
  'solid-t': any[];
  pcagroup: any[];
  'spb.camsparts': any[];
  voltag: any[];
  dvpt: any[];
  recamgr: any[];
  intertrek: any[];
  kta50: any[];
  truckdrive: any[];
  truckmir: any[];
  'istk-deutz': any[];
  mirdiesel: any[];
  shtern: any[];
  udtTechnika: any[];
};
