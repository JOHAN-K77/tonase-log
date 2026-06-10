import type { Karyawan } from "@/type/models";

interface KaryawanItemProps {
  karyDetail: Karyawan;
  onEditKary: (karyawan: Karyawan) => void;
  onDeleteKary: (karyawan: Karyawan) => void;
}

const KaryawanItem = ({ karyDetail, onEditKary, onDeleteKary }: KaryawanItemProps) => {

  return (
    <div
      key={karyDetail.id}
      className="px-6 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-bold">{karyDetail.name}</span>
        </div>
        <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
          {karyDetail.role.toUpperCase()} ({karyDetail.no_kary})
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {karyDetail.lokasi?.nama_lok || "Lokasi tidak diketahui"}
      </div>
      <div className="flex gap-2 mt-4">
        <div className="btn btn-sm btn-warning" onClick={() => onEditKary(karyDetail)}>
          Edit
        </div>
        <div className="btn btn-sm btn-danger" onClick={() => onDeleteKary(karyDetail)}>
          Delete
        </div>
      </div>    
    </div>
  );
};

export default KaryawanItem;