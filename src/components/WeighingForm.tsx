import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { WeighingRecord } from "@/pages/Index";
import jsPDF from "jspdf";

interface WeighingFormProps {
  selectedRecord: WeighingRecord | null;
  onRecordAdded: (record: WeighingRecord) => void;
  onRecordUpdated: (record: WeighingRecord) => void;
}

const WeighingForm = ({ selectedRecord, onRecordAdded, onRecordUpdated }: WeighingFormProps) => {
  const [tonase, setTonase] = useState("");
  const [jenis, setJenis] = useState("Kardus");
  const [supplier, setSupplier] = useState("");

  const now = new Date();
  const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Sync supplier/jenis when a record is selected
  useEffect(() => {
    if (selectedRecord) {
      setSupplier(selectedRecord.supplier);
      setJenis(selectedRecord.jenis);
    }
  }, [selectedRecord]);

  const handleDownload = () => {
    if (!selectedRecord || !selectedRecord.printed) return;

    const formatDate = (tanggal: string) => {
      const d = new Date(tanggal);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const widthMm = 50;
    const heightMm = 80;
    const doc = new jsPDF({ unit: "mm", format: [widthMm, heightMm] });

    const lm = 3; // left margin
    let y = 5;

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("PT. Anugerah Berkat Kertas", widthMm / 2, y, { align: "center" });
    y += 4;

    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(selectedRecord.tanggal), widthMm / 2, y, { align: "center" });
    y += 5;

    doc.text(`Waktu timbang - ${selectedRecord.waktu} WITA`, widthMm / 2, y, { align: "center" });
    y += 5;

    doc.text(`Supplier: ${selectedRecord.supplier}`, lm, y);
    y += 4;

    doc.text(`Jenis: ${selectedRecord.jenis.toUpperCase()}`, lm, y);
    y += 4;

    doc.text(`Timbang penuh:  ${selectedRecord.tonase_awal} kg`, lm, y);
    y += 3.5;
    doc.text(`Timbang kosong: ${selectedRecord.tonase_kosong} kg`, lm, y);
    y += 3.5;
    doc.text(`Netto:          ${selectedRecord.netto} kg`, lm, y);
    y += 7;

    doc.text("Penimbang", widthMm / 2, y, { align: "center" });
    y += 8;
    doc.text("(            )", widthMm / 2, y, { align: "center" });

    doc.save(`timbang_${selectedRecord.supplier}_${selectedRecord.waktu.replace(":", "")}.pdf`);
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

    if (selectedRecord) {
      // Second weigh
      const tonaseKosong = parseInt(tonase);
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
        tonase_awal: parseInt(tonase),
        jenis,
        supplier,
        waktu: timeStr,
        tanggal: dateStr,
        tonase_kosong: null,
        netto: null,
        printed: false,
      };

      onRecordAdded(newRecord);
      setTonase("");
      setSupplier("");
      toast.success("Data berhasil disimpan!");
    }
  };

  const isPrinted = selectedRecord?.printed === true;
  const buttonLabel = isPrinted ? "Unduh" : "Timbang";
  const buttonColor = isPrinted
    ? "bg-[#0070C0]"
    : "bg-[#0070C0] md:bg-accent md:text-accent-foreground";

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 w-full max-w-lg">
      <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-1">
            {selectedRecord ? "Tonase Kosong" : "Tonase"}
          </Label>
          <Input
            type="number"
            value={isPrinted ? (selectedRecord?.tonase_kosong?.toString() ?? "") : tonase}
            onChange={(e) => setTonase(e.target.value)}
            placeholder="0"
            className="border-foreground/30"
            readOnly={isPrinted}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Waktu</Label>
          <Input value={waktu} readOnly className="border-foreground/30 bg-muted/50" />
        </div>

        {!selectedRecord && (
          <>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Jenis</Label>
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
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Tanggal</Label>
              <Input value={tanggal} readOnly className="border-foreground/30 bg-muted/50" />
            </div>
            <div className="col-span-1">
              <Label className="text-sm text-muted-foreground mb-1">Supplier</Label>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nama supplier"
                className="border-foreground/30"
              />
            </div>
          </>
        )}

        {selectedRecord && !isPrinted && (
          <div>
            <Label className="text-sm text-muted-foreground mb-1">Tanggal</Label>
            <Input value={tanggal} readOnly className="border-foreground/30 bg-muted/50" />
          </div>
        )}

        {isPrinted && (
          <>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Jenis</Label>
              <Input value={selectedRecord?.jenis ?? ""} readOnly className="border-foreground/30 bg-muted/50" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Tanggal</Label>
              <Input value={tanggal} readOnly className="border-foreground/30 bg-muted/50" />
            </div>
            <div className="col-span-1">
              <Label className="text-sm text-muted-foreground mb-1">Supplier</Label>
              <Input value={selectedRecord?.supplier ?? ""} readOnly className="border-foreground/30 bg-muted/50" />
            </div>
          </>
        )}
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
