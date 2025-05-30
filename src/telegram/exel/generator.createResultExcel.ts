import * as XLSX from 'xlsx';
import { ResultRow } from './exel.types';

/** Build an Excel workbook entirely in memory and return it as a Buffer. */
export function createResultExcelBuffer(rows: ResultRow[]): Buffer {
  const headers = [
    'кат.номер',
    'кол-во',
    'лучшая цена',
    'сумма',
    'лучший поставщик',
    'склад',
    'seltex',
    'imachinery',
    'impart',
    'zipteh',
    '74parts',
    'b2b.ixora-auto',
    'vip.blumaq',
    'solid-t',
    'pcagroup',
    'spb.camsparts',
    'voltag',
    'dv-pt',
    'recamgr',
    'intertrek',
    'kta50',
    'truckdrive',
    'truckmir',
    'istk-deutz',
    'mirdiesel',
    'shtern',
    'udtTechnika',
  ];
  console.log(rows);

  const data = rows.map((row) => [
    row.name,
    row.kalichestvo,
    row.luchshayaCena,
    row.summa,
    row.luchshiyPostavshik,
    formatSuppliers(row.sklad),
    formatSuppliers(row.seltex),
    formatSuppliers(row.imachinery),
    formatSuppliers(row.impart),
    formatSuppliers(row.zipteh),
    formatSuppliers(row['74parts']),
    formatSuppliers(row['b2b.ixora-auto']),
    formatSuppliers(row['vip.blumaq']),
    formatSuppliers(row['solid-t']),
    formatSuppliers(row.pcagroup),
    formatSuppliers(row['spb.camsparts']),
    formatSuppliers(row.voltag),
    formatSuppliers(row['dv-pt']),
    formatSuppliers(row.recamgr),
    formatSuppliers(row.intertrek),
    formatSuppliers(row.kta50),
    formatSuppliers(row.truckdrive),
    formatSuppliers(row.truckmir),
    formatSuppliers(row['istk-deutz']),
    formatSuppliers(row.mirdiesel),
    formatSuppliers(row.shtern),
    formatSuppliers(row.udtTechnika),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Result');

  /** XLSX.write(..., { type: 'buffer' }) → Node.js Buffer with valid .xlsx bytes */
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

function formatSuppliers(value: any): string {
  if (Array.isArray(value)) {
    if (value[0] === '-') {
      return '';
    }
    if (value[0] && value[1]) return value.join(', ');
  }
  return String(value ?? '');
}
