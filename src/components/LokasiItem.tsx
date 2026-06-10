import type { Lokasi } from "@/type/models";

interface LokasiItemProps {
  lokasiDetail: Lokasi;
  onEditLokasi: (lokasi: Lokasi) => void;
  onDeleteLokasi: (lokasi: Lokasi) => void;
}

const LokasiItem = ({ lokasiDetail, onEditLokasi, onDeleteLokasi }: LokasiItemProps) => {

  return (
    <div
      key={lokasiDetail.id}
      className="px-6 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-bold">{lokasiDetail.nama_lok}</span>
        </div>
        <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
          {lokasiDetail.alamat || ""}
        </span>
        <div className="flex gap-2 mt-4">
            <div className="btn btn-sm btn-warning" onClick={() => onEditLokasi(lokasiDetail)}>
            Edit
            </div>
            <div className="btn btn-sm btn-danger" onClick={() => onDeleteLokasi(lokasiDetail)}>
            Delete
            </div>
        </div>    
      </div>
    </div>
  );
};

export default LokasiItem;