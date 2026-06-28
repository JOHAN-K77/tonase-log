import type { Jenis } from "@/type/models";

interface JenisItemProps {
  jenisDetail: Jenis;
  onEditJenis: (jenis: Jenis) => void;
  onDeleteJenis: (jenis: Jenis) => void;
}

const JenisItem = ({ jenisDetail, onEditJenis, onDeleteJenis }: JenisItemProps) => {

  return (
    <div
      key={jenisDetail.id}
      className="px-6 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xl font-bold">{jenisDetail.name}</span>
        </div>
        {jenisDetail.price && jenisDetail.price !== undefined && jenisDetail.price !== 0 &&
        <span className="text-sm text-right whitespace-pre-line text-muted-foreground">
          {jenisDetail.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
        </span>}
        <div className="flex gap-2 mt-4">
            <div className="btn btn-sm btn-warning" onClick={() => onEditJenis(jenisDetail)}>
            Edit
            </div>
            <div className="btn btn-sm btn-danger" onClick={() => onDeleteJenis(jenisDetail)}>
            Delete
            </div>
        </div>    
      </div>
    </div>
  );
};

export default JenisItem;