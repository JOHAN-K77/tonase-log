import api from "@/api/api";
import JenisItem from "@/components/JenisItem";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useSession } from "@/context/SessionContext";
import { Jenis } from "@/type/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const JenisPage = () => {
  const [jenis, setJenis] = useState<Jenis[]>([]);
  const [selectedJenis, setSelectedJenis] = useState<Jenis | null>(null);
  const [openModalJenis, setOpenModalJenis] = useState<boolean>(false);
  const [modeEdit, setModeEdit] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { sessionActive } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/api/fetch-table", { table: "jenis" }).then((res) => {
      const jenisData: Jenis[] = res.data.map((item: any) => ({
        id: String(item.jenis_id),
        name: item.nama_jenis,
        price: item.harga
      }));
      setJenis(jenisData);
    });
  }, [sessionActive]);
  
  if (sessionActive) {
    if (sessionActive.role !== "admin") {
      navigate("/index");
    }
  } else  {
    return null;
  }

  const openJenisModal = (jenis?: Jenis) => {
    setModeEdit(true);
    setSelectedJenis(jenis);
    setOpenModalJenis(true);
  }

  const addJenis = async () => {
    try {
      await api.post("/api/new-jenis", {
        name: selectedJenis?.name,
        price: selectedJenis?.price || null
      }).then((res) => {
        const newJenis: Jenis = {
          id: String(res.data.insertId),
          name: selectedJenis?.name,
          price: selectedJenis?.price || null
        };
        setJenis((prev) => [...prev, newJenis]);
        setOpenModalJenis(false);
      });
    }
    catch (error) {
      console.error("Error adding jenis:", error);
    }
  }

  const editJenis = async () => {
    try {
      await api.post("/api/update-jenis", {
        id: selectedJenis?.id,
        name: selectedJenis?.name,
        price: selectedJenis?.price || "0"
      }).then((res) => {
        setJenis((prev) => prev.map((j) => j.id === selectedJenis?.id ? { ...j, ...selectedJenis } : j));
        setOpenModalJenis(false);
      });
    } catch (error) {
      console.error("Error updating jenis:", error);
    }
  }

  const deleteJenis = async (jenis: Jenis) => {
    try {
      await api.post("/api/delete-row", {
        table: "jenis",
        kolom: "jenis_id",
        id: jenis.id
      }).then((res) => {
        setJenis((prev) => prev.filter((j) => j.id !== jenis.id));
      });
    } catch (error) {
      console.error("Error deleting jenis:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Jenis</h1>
      <button className="ml-4 px-4 py-2 bg-[#0070C0] text-white rounded font-semibold shadow" onClick={() => {
        setSelectedJenis(null);
        setModeEdit(false);
        setOpenModalJenis(true);
      }}>
        Tambah Jenis
      </button>
      {jenis.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
              {jenis.map((j) => 
                <JenisItem jenisDetail={j} onEditJenis={openJenisModal} onDeleteJenis={() => {
                  setSelectedJenis(j);
                  setOpenDialog(true);
                }} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Data jenis tidak tersedia
        </p>
      )}
      <Modal isOpen={openModalJenis} title={modeEdit ? "Edit Jenis" : "Tambah Jenis"} onClose={() => setOpenModalJenis(false)}>
        <div className="form-control">
          <label className="form-control-label">
            <span className="label-text">Nama</span>
          </label>
          <input
            type="text"
            placeholder="Nama"
            className="form-control-input"
            value={selectedJenis?.name || ""}
            onChange={(e) => {
              setSelectedJenis({ ...selectedJenis, name: e.target.value })
            }}
          />
        </div>
        <div className="form-control mt-4">
          <label className="form-control-label">
            <span className="label-text">Harga</span>
          </label>
          <input
            type="text"
            placeholder="Harga"
            className="form-control-input"
            value={selectedJenis?.price || "0"}
            onChange={(e) => {
              setSelectedJenis({ ...selectedJenis, price: Number(e.target.value) })
            }}
          />
        </div>
        <div className="btn btn-primary mt-6" onClick={modeEdit ? editJenis : addJenis}>
          Simpan Perubahan
        </div>
      </Modal>
      <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
          </DialogHeader>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus jenis ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
          <DialogFooter>
            <button className="btn btn-danger" onClick={() => {
              if (selectedJenis) {
                deleteJenis(selectedJenis);
              }
              setOpenDialog(false);
            }}>
              Hapus
            </button>
            <button className="btn" onClick={() => setOpenDialog(false)}>
              Batal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JenisPage;