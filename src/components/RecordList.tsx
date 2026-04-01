interface Record {
  id: string;
  tonase: number;
  jenis: string;
  supplier: string;
  waktu: string;
  tanggal: string;
}

interface RecordListProps {
  records: Record[];
}

const RecordList = ({ records }: RecordListProps) => {
  const formatDate = (tanggal: string, waktu: string) => {
    const d = new Date(tanggal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}\n${waktu}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-primary-foreground px-6 py-4">
        <h2 className="text-3xl font-bold">Pencatatan</h2>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {records.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">Belum ada data</div>
        )}
        {records.map((r) => (
          <div key={r.id} className="px-6 py-3">
            <div className="flex justify-between items-start">
              <span className="text-xl font-bold">{r.tonase} kg</span>
              <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
                {formatDate(r.tanggal, r.waktu)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {r.supplier} ({r.jenis})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordList;
