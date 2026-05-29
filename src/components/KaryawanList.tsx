import type { Karyawan } from "@/type/models";

interface KaryawanListProps {
  karyList: Karyawan[];
  selectedKary: Karyawan | null;
  onSelectKary: (karyawan: Karyawan | null) => void;
}

const KaryawanList = ({ karyList, selectedKary, onSelectKary }: KaryawanListProps) => {
  console.log("Render KaryawanList dengan data:", karyList);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
        {karyList.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">Belum ada data</div>
        )}
        {karyList.map((k) => (
          <div
            key={k.id}
            className="px-6 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectKary(k)}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xl font-bold">{k.name}</span>
              </div>
              <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
                {k.role.toUpperCase()} ({k.no_kary})
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {k.lokasi?.nama_lok || "Lokasi tidak diketahui"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaryawanList;
