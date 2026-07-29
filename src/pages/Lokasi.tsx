import api from "@/api/api";
import LokasiItem from "@/components/LokasiItem";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useSession } from "@/context/SessionContext";
import { Lokasi } from "@/type/models";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LokasiPage = () => {
    const [lokasi, setLokasi] = useState<Lokasi[]>([]);
      const [selectedLokasi, setSelectedLokasi] = useState<Lokasi | null>(null);
      const [openModalLokasi, setOpenModalLokasi] = useState<boolean>(false);
      const [modeEdit, setModeEdit] = useState<boolean>(false);
      const [openDialog, setOpenDialog] = useState<boolean>(false);
    
      const { sessionActive } = useSession();
      const navigate = useNavigate();
    
      useEffect(() => {
        api.post("/api/fetch-table", { table: "lokasi_gudang" }).then((res) => {
          const lokasiData: Lokasi[] = res.data.map((item: any) => ({
            id: String(item.lokasi_id),
            nama_lok: item.nama_gudang,
            alamat: item.alamat || ""
          }));
          setLokasi(lokasiData);
        });
      }, [sessionActive]);
      
      if (sessionActive) {
        if (sessionActive.role !== "admin") {
          navigate("/index");
        }
      } else  {
        return null;
      }
    
      const openLokasiModal = (lokasi?: Lokasi) => {
        setModeEdit(true);
        setSelectedLokasi(lokasi);
        setOpenModalLokasi(true);
      }
    
      const addLokasi = async () => {
        try {
          await api.post("/api/new-lokasi", {
            name: selectedLokasi?.nama_lok,
            alamat: selectedLokasi?.alamat || null
          }).then((res) => {
            const insertedId = res.data.id ?? res.data.insertId ?? null;
            const newLokasi: Lokasi = {
              id: insertedId ? String(insertedId) : "",
              nama_lok: selectedLokasi?.nama_lok,
              alamat: selectedLokasi?.alamat || null
            };
            setLokasi((prev) => [...prev, newLokasi]);
            setOpenModalLokasi(false);
          });
        }
        catch (error) {
          console.error("Error adding lokasi:", error);
        }
      }
    
      const editLokasi = async () => {
        try {
          await api.post("/api/update-lokasi", {
            id: selectedLokasi?.id,
            name: selectedLokasi?.nama_lok,
            alamat: selectedLokasi?.alamat || null
          }).then((res) => {
            setLokasi((prev) => prev.map((l) => l.id === selectedLokasi?.id ? { ...l, ...selectedLokasi } : l));
            setOpenModalLokasi(false);
          });
        } catch (error) {
          console.error("Error updating lokasi:", error);
        }
      }
    
      const deleteLokasi = async (lokasi: Lokasi) => {
        try {
          await api.post("/api/delete-row", {
            table: "lokasi_gudang",
            kolom: "lokasi_id",
            id: lokasi.id
          }).then((res) => {
            setLokasi((prev) => prev.filter((l) => l.id !== lokasi.id));
          });
        } catch (error) {
          console.error("Error deleting lokasi:", error);
        }
      }
    
      return (
        <div className="min-h-screen bg-background p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Lokasi</h1>
          <button className="ml-4 px-4 py-2 bg-[#0070C0] text-white rounded font-semibold shadow" onClick={() => {
            setSelectedLokasi(null);
            setModeEdit(false);
            setOpenModalLokasi(true);
          }}>
            Tambah Lokasi
          </button>
          {lokasi.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
                  {lokasi.map((l) => 
                    <LokasiItem lokasiDetail={l} onEditLokasi={openLokasiModal} onDeleteLokasi={() => {
                      setSelectedLokasi(l);
                      setOpenDialog(true);
                    }} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Data lokasi tidak tersedia
            </p>
          )}
          <Modal isOpen={openModalLokasi} title={modeEdit ? "Edit Lokasi" : "Tambah Lokasi"} onClose={() => setOpenModalLokasi(false)}>
            <div className="form-control">
              <label className="form-control-label">
                <span className="label-text">Nama</span>
              </label>
              <input
                type="text"
                placeholder="Nama"
                className="form-control-input"
                value={selectedLokasi?.nama_lok || ""}
                onChange={(e) => {
                  setSelectedLokasi({ ...selectedLokasi, nama_lok: e.target.value })
                }}
              />
            </div>
            <div className="form-control mt-4">
              <label className="form-control-label">
                <span className="label-text">Alamat</span>
              </label>
              <input
                type="text"
                placeholder="Alamat"
                className="form-control-input"
                value={selectedLokasi?.alamat || ""}
                onChange={(e) => {
                  setSelectedLokasi({ ...selectedLokasi, alamat: e.target.value })
                }}
              />
            </div>
            <div className="btn btn-primary mt-6" onClick={modeEdit ? editLokasi : addLokasi}>
              Simpan Perubahan
            </div>
          </Modal>
          <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
            <DialogContent>
              <DialogHeader>
                <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
              </DialogHeader>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus lokasi ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
              <DialogFooter>
                <button className="btn btn-danger" onClick={() => {
                  if (selectedLokasi) {
                    deleteLokasi(selectedLokasi);
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
}

export default LokasiPage;