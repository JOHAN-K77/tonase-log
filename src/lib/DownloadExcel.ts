import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export type ExcelColumnDefinition = {
  header: string;
  key: string;
  value?: (item: any) => any;
  after?: string;
};

function buildColumns(baseColumns: Array<{ header: string; key: string }>, customColumns: ExcelColumnDefinition[]) {
  const ordered: Array<{ header: string; key: string }> = [];

  baseColumns.forEach((column) => {
    ordered.push(column);

    const inserted = customColumns.filter((item) => item.after === column.key);
    inserted.forEach((item) => {
      ordered.push({ header: item.header, key: item.key });
    });
  });

  customColumns
    .filter((item) => !item.after)
    .forEach((item) => {
      ordered.push({ header: item.header, key: item.key });
    });

  return ordered;
}

export async function downloadExcel(data: any[], filename: string, customColumns: ExcelColumnDefinition[] = []) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    if (data.length === 0) {
        worksheet.addRow(['No data available']);
    } else {
        const baseColumns = [
            { header: 'ID Nota', key: 'idnota' },
            { header: 'Nama Supplier', key: 'nama_suppl' },
            { header: 'No. Polisi', key: 'nopol' },
            { header: 'Timbang Penuh', key: 'tonase_awal' },
            { header: 'Timbang Kosong', key: 'tonase_kosong' },
            { header: 'Netto', key: 'netto' },
            { header: 'Printed', key: 'printed' },
            { header: 'Jenis', key: 'jenis' },
            { header: 'Lokasi Gudang', key: 'lokasi_gudang' },
            { header: 'Penimbang', key: 'penimbang' },
            { header: 'Pembongkar 1', key: 'pembongkar1' },
            { header: 'Tonase Rinci', key: 'rinci1' },
            { header: 'Pembongkar 2', key: 'pembongkar2' },
            { header: 'Tonase Rinci', key: 'rinci2' },
            { header: 'Pembongkar 3', key: 'pembongkar3' },
            { header: 'Tonase Rinci', key: 'rinci3' },
        ];

        const columns = buildColumns(baseColumns, customColumns);
        worksheet.columns = columns;

        data.forEach((item) => {
            const jmlBongkar: number = [item.pembongkar1, item.pembongkar2, item.pembongkar3].filter(Boolean).length ?? 0;

            const row: any = {
                ...item,
                jenis: item.jenis?.name ?? '',
                lokasi_gudang: item.lokasi_gudang?.nama_lok ?? '',
                penimbang: item.penimbang ? item.penimbang.name : '',
                pembongkar1: item.pembongkar1 ? item.pembongkar1.name : '',
                rinci1: jmlBongkar > 1 && item.pembongkar1 ? (item.netto / jmlBongkar) : '',
                pembongkar2: item.pembongkar2 ? item.pembongkar2.name : '',
                rinci2: jmlBongkar > 1 && item.pembongkar2 ? (item.netto / jmlBongkar) : '',
                pembongkar3: item.pembongkar3 ? item.pembongkar3.name : '',
                rinci3: jmlBongkar > 1 && item.pembongkar3 ? (item.netto / jmlBongkar) : '',
            };

            customColumns.forEach((column) => {
                row[column.key] = column.value ? column.value(item) : item[column.key] ?? '';
            });

            worksheet.addRow(row);
        });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
}