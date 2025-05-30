"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResultExcelBuffer = createResultExcelBuffer;
const XLSX = require("xlsx");
function createResultExcelBuffer(rows) {
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
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
}
function formatSuppliers(value) {
    if (Array.isArray(value)) {
        if (value[0] === '-') {
            return '';
        }
        if (value[0] && value[1])
            return value.join(', ');
    }
    return String(value ?? '');
}
//# sourceMappingURL=generator.createResultExcel.js.map