import RecordDetail from "./RecordDetail";
import type { WeighingRecord } from "@/type/models";

interface RecordListProps {
  records: WeighingRecord[];
  selectedRecord: WeighingRecord | null;
  onSelectRecord: (record: WeighingRecord | null) => void;
  forWeighing?: boolean;
}

const RecordList = ({ records, selectedRecord, onSelectRecord, forWeighing = false }: RecordListProps) => {
  const formatDate = (tanggal: string, waktu: string) => {
    const d = new Date(tanggal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}\n${waktu}`;
  };

  if (selectedRecord) {
    return <RecordDetail record={selectedRecord} onClose={() => onSelectRecord(null)} canPrint={!forWeighing} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {forWeighing && (
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <h2 className="text-3xl font-bold">Pencatatan</h2>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/60 scrollbar-track-transparent divide-y divide-border">
        {records.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">Belum ada data</div>
        )}
        {records.map((r) => (
          <div
            key={r.id}
            className="px-6 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectRecord(r)}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xl font-bold">{r.tonase_awal} kg</span>
                {r.tonase_kosong !== null && (
                  <span className="text-muted-foreground text-lg"> → {r.tonase_kosong} kg</span>
                )}
              </div>
              <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
                {formatDate(r.tanggal, r.waktu)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {r.nama_suppl} {r.nopol && ` - ${r.nopol}`} ({r.jenis?.name})
            </div>
            {r.tonase_kosong !== null && (
              <div className="text-sm font-bold mt-1">
                {r.netto} kg
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordList;
