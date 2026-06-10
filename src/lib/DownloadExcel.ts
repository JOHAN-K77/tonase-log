import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function downloadExcel(data: any[], filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    if (data.length === 0) {
        worksheet.addRow(['No data available']);
    } else {
        const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        worksheet.columns = columns;
        data.forEach(item => {
            worksheet.addRow({...item,
                Jenis: item.jenis.name,
                lokasi_gudang: item.lokasi_gudang.nama_lok,
                pembongkar: item.pembongkar ? item.pembongkar.name : "",
                penimbang: item.penimbang ? item.penimbang.name : ""
             });
        });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
}