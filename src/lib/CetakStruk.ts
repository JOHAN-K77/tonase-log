import { WeighingRecord } from "@/type/models";
import logoBw from "@/assets/logo-bw.png";
import jsPDF from "jspdf";
import { formatDate } from "@/components/WeighingForm";

const CetakStruk = (recordToPrint: WeighingRecord) => {
    const widthMm = 55;
        const tempDoc = new jsPDF({ unit: "mm", format: [widthMm, 200] });
    
        // Layout constants (mm) - reduced left padding to fit phone numbers on one line
        const lm = 1.5;
        const rm = widthMm - 1.5;
        const centerX = widthMm / 2;
    
        let y = 4;
    
        const headerLogoSize = 14;
        tempDoc.addImage(logoBw, "PNG", lm, y, headerLogoSize, headerLogoSize);
        const infoX = lm + headerLogoSize + 1.5;
        tempDoc.setFont("helvetica", "bold");
        tempDoc.setFontSize(7);
        tempDoc.text("PT. Anugerah Berkat Kertas", infoX, y + 3);
        tempDoc.setFont("helvetica", "normal");
        tempDoc.setFontSize(5.5);
        tempDoc.text("Denpasar - Bali", infoX, y + 6);
        tempDoc.text("Telp. 081932303445 / 081803081810", infoX, y + 8.5);
        y += headerLogoSize + 2;
    
        tempDoc.setFont("helvetica", "bold");
        tempDoc.setFontSize(10);
        tempDoc.text("NOTA TIMBANG", centerX, y, { align: "center" });
        y += 5;
    
        tempDoc.setFont("helvetica", "normal");
        tempDoc.setFontSize(7);
        tempDoc.text(
          `${formatDate(recordToPrint.tanggal)} - ${recordToPrint.waktu} WITA`,
          centerX, y, { align: "center" }
        );
        y += 5;
    
        tempDoc.setLineWidth(0.2);
        tempDoc.line(lm, y, rm, y);
        y += 4;
    
        const labelX = lm;
        const valueX = lm + 22;
        const fieldGap = 4;
        tempDoc.setFontSize(8);
    
        const drawRow = (label: string, value: string, bold = false) => {
          tempDoc.setFont("helvetica", "normal");
          tempDoc.text(label, labelX, y);
          tempDoc.setFont("helvetica", bold ? "bold" : "normal");
          tempDoc.text(`: ${value}`, valueX, y);
          y += fieldGap;
        };
    
        drawRow("No. Nota", recordToPrint.idnota ?? "");
        drawRow("No. Polisi", recordToPrint.nopol ?? "-");
        drawRow("Supplier", recordToPrint.nama_suppl);
        drawRow("Jenis Barang", recordToPrint.jenis.name.toUpperCase());
        y += 1;
        tempDoc.line(lm, y, rm, y);
        y += 4;
    
        drawRow("Berat Isi", `${recordToPrint.tonase_awal} kg`);
        drawRow("Berat Kosong", `${recordToPrint.tonase_kosong} kg`);
        drawRow("Netto", `${recordToPrint.netto} kg`, true);
    
        y += 4;
        tempDoc.line(lm, y, rm, y);
        y += 6;
    
        tempDoc.setFont("helvetica", "normal");
        tempDoc.setFontSize(7);
        const colLeftX = widthMm * 0.28;
        const colRightX = widthMm * 0.72;
        tempDoc.text("Tenaga Bongkar", colLeftX, y, { align: "center" });
        tempDoc.text("Penimbang", colRightX, y, { align: "center" });
        y += 12;
        tempDoc.text(`( ${recordToPrint.pembongkar ? recordToPrint.pembongkar.name : ""} )`, colLeftX, y, { align: "center" });
        tempDoc.text(`( ${recordToPrint.penimbang ? recordToPrint.penimbang.name : ""} )`, colRightX, y, { align: "center" });
        y += 6;
    
        const finalHeight = y + 10;
    
        // Re-create with exact height
        const doc = new jsPDF({ unit: "mm", format: [widthMm, finalHeight] });
        let y2 = 4;
        doc.addImage(logoBw, "PNG", lm, y2, headerLogoSize, headerLogoSize);
        const infoX2 = lm + headerLogoSize + 1.5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text("PT. Anugerah Berkat Kertas", infoX2, y2 + 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.text("Denpasar - Bali", infoX2, y2 + 6);
        doc.text("Telp. 081932303445 / 081803081810", infoX2, y2 + 8.5);
        y2 += headerLogoSize + 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("NOTA TIMBANG", centerX, y2, { align: "center" });
        y2 += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(
          `${formatDate(recordToPrint.tanggal)} - ${recordToPrint.waktu} WITA`,
          centerX, y2, { align: "center" }
        );
        y2 += 5;
        doc.text(recordToPrint.lokasi_gudang.nama_lok, lm, y2);
        y2 += 4;
        doc.setLineWidth(0.2);
        doc.line(lm, y2, rm, y2);
        y2 += 4;
        doc.setFontSize(8);
        const drawRow2 = (label: string, value: string, bold = false) => {
          doc.setFont("helvetica", "normal");
          doc.text(label, labelX, y2);
          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.text(`: ${value}`, valueX, y2);
          y2 += fieldGap;
        };
        drawRow2("No. Nota", recordToPrint.idnota ?? "");
        drawRow2("No. Polisi", recordToPrint.nopol ?? "-");
        drawRow2("Supplier", recordToPrint.nama_suppl);
        drawRow2("Jenis Barang", recordToPrint.jenis.name.toUpperCase());
        y2 += 1;
        doc.line(lm, y2, rm, y2);
        y2 += 4;
        drawRow2("Berat Isi", `${recordToPrint.tonase_awal} kg`);
        drawRow2("Berat Kosong", `${recordToPrint.tonase_kosong} kg`);
        drawRow2("Netto", `${recordToPrint.netto} kg`, true);
        y2 += 4;
        doc.line(lm, y2, rm, y2);
        y2 += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Tenaga Bongkar", colLeftX, y2, { align: "center" });
        doc.text("Penimbang", colRightX, y2, { align: "center" });
        y2 += 12;
        doc.text(`( ${recordToPrint.pembongkar ? recordToPrint.pembongkar.name : ""} )`, colLeftX, y2, { align: "center" });
        doc.text(`( ${recordToPrint.penimbang ? recordToPrint.penimbang.name : ""} )`, colRightX, y2, { align: "center" });
    
        doc.save(`nota_${recordToPrint.nama_suppl}_${recordToPrint.tanggal}.pdf`);
    }

    export default CetakStruk;