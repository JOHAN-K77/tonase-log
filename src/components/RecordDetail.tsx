import { X, ArrowLeft } from "lucide-react";
import type { WeighingRecord } from "@/pages/Index";

interface RecordDetailProps {
  record: WeighingRecord;
  onClose: () => void;
}

const RecordDetail = ({ record, onClose }: RecordDetailProps) => {
  const formatDate = (tanggal: string) => {
    const d = new Date(tanggal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-primary-foreground px-6 py-4">
        <h2 className="text-3xl font-bold">Pencatatan</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
        {/* Desktop: X button, Mobile: back arrow */}
        <div className="flex justify-between items-start">
          <div className="space-y-4 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground">waktu:</span>
              <span className="text-2xl font-bold">{record.waktu}</span>
              <span className="text-muted-foreground">({formatDate(record.tanggal)})</span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="text-xl font-semibold">
                {record.supplier}{record.nopol ? ` (${record.nopol})` : ""} - {record.jenis}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground">Timbang Penuh:</span>
              <span className="text-3xl font-bold">{record.tonase_awal} kg</span>
            </div>
            {record.tonase_kosong !== null && (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">Timbang Kosong:</span>
                  <span className="text-3xl font-bold">{record.tonase_kosong} kg</span>
                </div>
                <hr className="border-foreground/30" />
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">Netto:</span>
                  <span className="text-3xl font-bold">{record.netto} kg</span>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded hidden md:block">
            <X className="h-6 w-6" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded md:hidden">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetail;
