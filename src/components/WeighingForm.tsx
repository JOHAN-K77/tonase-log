import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { WeighingRecord } from "@/pages/Index";
import jsPDF from "jspdf";
import logoBw from "@/assets/logo-bw.png";

interface WeighingFormProps {
  selectedRecord: WeighingRecord | null;
  onRecordAdded: (record: WeighingRecord) => void;
  onRecordUpdated: (record: WeighingRecord) => void;
}

const WeighingForm = ({ selectedRecord, onRecordAdded, onRecordUpdated }: WeighingFormProps) => {
  const [tonase, setTonase] = useState("");
  const [jenis, setJenis] = useState("Kardus");
  const [supplier, setSupplier] = useState("");
  const [nopol, setNopol] = useState("");

  // Sync supplier/jenis/nopol when a record is selected
  useEffect(() => {
    if (selectedRecord) {
      setSupplier(selectedRecord.supplier);
      setJenis(selectedRecord.jenis);
      setNopol(selectedRecord.nopol ?? "");
    }
  }, [selectedRecord]);

  const formatDate = (tanggal: string) => {
    const d = new Date(tanggal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDownload = () => {
    if (!selectedRecord || !selectedRecord.printed) return;

    const widthMm = 55;
    // Estimate height generously; we'll recreate with actual height after content.
    const tempDoc = new jsPDF({ unit: "mm", format: [widthMm, 200] });

    // Layout constants (mm)
    const lm = 3;
    const rm = widthMm - 3;
    const centerX = widthMm / 2;
    const logoSize = 18;

    let y = 4;

    // Header: Logo on left, company info on right
    const headerLogoSize = 14;
    tempDoc.addImage(logoBw, "PNG", lm, y, headerLogoSize, headerLogoSize);
    const infoX = lm + headerLogoSize + 2;
    tempDoc.setFont("helvetica", "bold");
    tempDoc.setFontSize(7);
    tempDoc.text("PT. Anugerah Berkat Kertas", infoX, y + 3);
    tempDoc.setFont("helvetica", "normal");
    tempDoc.setFontSize(5.5);
    tempDoc.text("Denpasar - Bali", infoX, y + 6);
    tempDoc.text("Telp. 081932303445 /", infoX, y + 8.5);
    tempDoc.text("081803081810", infoX, y + 11);
    y += headerLogoSize + 2;

    // Title
    tempDoc.setFont("helvetica", "bold");
    tempDoc.setFontSize(10);
    tempDoc.text("NOTA TIMBANG", centerX, y, { align: "center" });
    y += 5;

    // Date - time
    tempDoc.setFont("helvetica", "normal");
    tempDoc.setFontSize(7);
    tempDoc.text(
      `${formatDate(selectedRecord.tanggal)} - ${selectedRecord.waktu} WITA`,
      centerX,
      y,
      { align: "center" }
    );
    y += 5;

    // Divider
    tempDoc.setLineWidth(0.2);
    tempDoc.line(lm, y, rm, y);
    y += 4;

    // Field rows: label : value
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

    drawRow("No. Nota", selectedRecord.idnota ?? "");
    drawRow("No. Polisi", selectedRecord.nopol ?? "-");
    drawRow("Supplier", selectedRecord.supplier);
    drawRow("Jenis Barang", selectedRecord.jenis.toUpperCase());
    y += 1;
    tempDoc.line(lm, y, rm, y);
    y += 4;

    drawRow("Berat Isi", `${selectedRecord.tonase_awal} kg`);
    drawRow("Berat Kosong", `${selectedRecord.tonase_kosong} kg`);
    drawRow("Netto", `${selectedRecord.netto} kg`, true);

    y += 4;
    tempDoc.line(lm, y, rm, y);
    y += 6;

    // Signature columns
    tempDoc.setFont("helvetica", "normal");
    tempDoc.setFontSize(7);
    const colLeftX = widthMm * 0.28;
    const colRightX = widthMm * 0.72;
    tempDoc.text("Tenaga Bongkar", colLeftX, y, { align: "center" });
    tempDoc.text("Penimbang", colRightX, y, { align: "center" });
    y += 12;
    tempDoc.text("(            )", colLeftX, y, { align: "center" });
    tempDoc.text("(            )", colRightX, y, { align: "center" });
    y += 6;

    // Bottom padding ~40px ≈ 14mm at 72dpi conversion (40px / 96 * 25.4 ≈ 10.6mm). Use ~14mm for safety.
    const finalHeight = y + 10;

    // Re-create with exact height
    const doc = new jsPDF({ unit: "mm", format: [widthMm, finalHeight] });
    let y2 = 4;
    const headerLogoSize2 = 14;
    doc.addImage(logoBw, "PNG", lm, y2, headerLogoSize2, headerLogoSize2);
    const infoX2 = lm + headerLogoSize2 + 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("PT. Anugerah Berkat Kertas", infoX2, y2 + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.text("Denpasar - Bali", infoX2, y2 + 6);
    doc.text("Telp. 081932303445 /", infoX2, y2 + 8.5);
    doc.text("081803081810", infoX2, y2 + 11);
    y2 += headerLogoSize2 + 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("NOTA TIMBANG", centerX, y2, { align: "center" });
    y2 += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      `${formatDate(selectedRecord.tanggal)} - ${selectedRecord.waktu} WITA`,
      centerX,
      y2,
      { align: "center" }
    );
    y2 += 5;
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
    drawRow2("No. Nota", selectedRecord.idnota ?? "");
    drawRow2("No. Polisi", selectedRecord.nopol ?? "-");
    drawRow2("Supplier", selectedRecord.supplier);
    drawRow2("Jenis Barang", selectedRecord.jenis.toUpperCase());
    y2 += 1;
    doc.line(lm, y2, rm, y2);
    y2 += 4;
    drawRow2("Berat Isi", `${selectedRecord.tonase_awal} kg`);
    drawRow2("Berat Kosong", `${selectedRecord.tonase_kosong} kg`);
    drawRow2("Netto", `${selectedRecord.netto} kg`, true);
    y2 += 4;
    doc.line(lm, y2, rm, y2);
    y2 += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Tenaga Bongkar", colLeftX, y2, { align: "center" });
    doc.text("Penimbang", colRightX, y2, { align: "center" });
    y2 += 12;
    doc.text("(            )", colLeftX, y2, { align: "center" });
    doc.text("(            )", colRightX, y2, { align: "center" });

    doc.save(`nota_${selectedRecord.supplier}_${selectedRecord.waktu.replace(":", "")}.pdf`);
  };

  const handleSubmit = () => {
    if (selectedRecord?.printed) {
      handleDownload();
      return;
    }

    if (!tonase) {
      toast.error("Tonase harus diisi!");
      return;
    }

    const tonaseValue = parseInt(tonase);
    if (tonaseValue <= 0) {
      toast.error("Tonase tidak boleh nol atau negatif!");
      return;
    }

    if (selectedRecord && tonaseValue >= selectedRecord.tonase_awal) {
      toast.error("Tonase kosong harus kurang dari tonase awal!");
      return;
    }

    if (selectedRecord) {
      // Second weigh
      const tonaseKosong = tonaseValue;
      const netto = selectedRecord.tonase_awal - tonaseKosong;
      const updated: WeighingRecord = {
        ...selectedRecord,
        tonase_kosong: tonaseKosong,
        netto,
        printed: true,
      };
      onRecordUpdated(updated);
      setTonase("");
      toast.success("Timbang kosong berhasil disimpan!");
    } else {
      // First weigh
      if (!supplier) {
        toast.error("Supplier harus diisi!");
        return;
      }

      const currentDate = new Date();
      const timeStr = currentDate.toTimeString().slice(0, 5);
      const dateStr = currentDate.toISOString().slice(0, 10);

      const newRecord: WeighingRecord = {
        id: crypto.randomUUID(),
        tonase_awal: tonaseValue,
        jenis,
        supplier,
        waktu: timeStr,
        tanggal: dateStr,
        tonase_kosong: null,
        netto: null,
        printed: false,
        nopol: nopol || null,
        idnota: null,
      };

      onRecordAdded(newRecord);
      setTonase("");
      setSupplier("");
      setNopol("");
      toast.success("Data berhasil disimpan!");
    }
  };

  const isPrinted = selectedRecord?.printed === true;
  const buttonLabel = isPrinted ? "Unduh" : "Timbang";
  const buttonColor = isPrinted
    ? "bg-[#0070C0]"
    : "bg-[#0070C0] md:bg-accent md:text-accent-foreground";

  // Display values (read-only when a record is selected)
  const jenisValue = selectedRecord ? selectedRecord.jenis : jenis;
  const supplierValue = selectedRecord ? selectedRecord.supplier : supplier;
  const nopolValue = selectedRecord ? (selectedRecord.nopol ?? "") : nopol;
  const tonaseDisplay = isPrinted
    ? (selectedRecord?.tonase_kosong?.toString() ?? "")
    : tonase;

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 w-full max-w-lg">
      <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
        {/* Row 1: Tonase | Jenis */}
        <div>
          <Label className="text-sm text-muted-foreground mb-1">
            {selectedRecord ? "Tonase Kosong" : "Tonase"}
          </Label>
          <Input
            type="number"
            step="10"
            value={tonaseDisplay}
            onChange={(e) => setTonase(e.target.value)}
            placeholder="0"
            className="border-foreground/30"
            readOnly={isPrinted}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Jenis</Label>
          {selectedRecord ? (
            <Input value={jenisValue} readOnly className="border-foreground/30 bg-muted/50" />
          ) : (
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm"
            >
              <option value="Kardus">Kardus</option>
              <option value="Kertas">Kertas</option>
              <option value="Buram">Buram</option>
              <option value="Duplex">Duplex</option>
              <option value="Non kertas">Non kertas</option>
            </select>
          )}
        </div>

        {/* Row 2: Supplier | No. Polisi */}
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Supplier</Label>
          <Input
            value={supplierValue}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Nama supplier"
            className={
              selectedRecord
                ? "border-foreground/30 bg-muted/50"
                : "border-foreground/30"
            }
            readOnly={!!selectedRecord}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">No. Polisi</Label>
          <Input
            value={nopolValue}
            onChange={(e) => setNopol(e.target.value)}
            placeholder="DK 1234 BC"
            className={
              selectedRecord
                ? "border-foreground/30 bg-muted/50"
                : "border-foreground/30"
            }
            readOnly={!!selectedRecord}
          />
        </div>
      </div>

      <div className="flex justify-center mt-2 md:mt-4">
        <button
          onClick={handleSubmit}
          className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${buttonColor} text-white text-2xl md:text-3xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all`}
        >
          {isPrinted ? (
            <span className="text-yellow-300 font-bold">{buttonLabel}</span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
};

export default WeighingForm;
