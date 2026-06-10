import api from "@/api/api";
import KaryawanItem from "@/components/KaryawanItem";
import Modal from "@/components/ui/modal";
import { useSession } from "@/context/SessionContext";
import { Karyawan, Lokasi } from "@/type/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const KaryawanPage = () => {
  const [employees, setEmployees] = useState<Karyawan[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(null);
  const [editEmployee, setEditEmployee] = useState<boolean>(false);

  const { sessionActive } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/api/fetch-table", { table: "lokasi_gudang" }).then((res) => {
      const lokasiData: Lokasi[] = res.data.map((item: any) => ({
        id: String(item.lokasi_id),
        nama_lok: item.nama_gudang,
        alamat: item.alamat
      }));
      setLokasi(lokasiData);

      api.post("/api/fetch-table", { table: "karyawan" }).then((res) => {
        const karyawanData: Karyawan[] = res.data.map((item: any) => ({
          id: String(item.kary_id),
          name: item.nama_kary,
          no_kary: item.no_kary,
          role: item.role,
          lokasi: lokasiData.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null
        }));

          if (karyawanData.length > 0) {
            console.log("Ambil tabel karyawan dari database:", res.data)
            setEmployees(karyawanData);
          } else {
            console.log("Belum ada data karyawan")
            setEmployees([]);
          }
      });
    });
  }, [sessionActive]);
  
  if (sessionActive) {
    if (sessionActive.role !== "admin") {
      navigate("/index");
    }
  } else  {
    return null;
  }

  const openEditKaryawan = (karyawan: Karyawan) => {
    setSelectedEmployee(karyawan);
    setEditEmployee(true);
  }

  const editKaryawan = async () => {
    try {
      await api.post("/api/update-karyawan", {
        id: selectedEmployee?.id,
        nama: selectedEmployee?.name,
        no_identitas: selectedEmployee?.no_kary || null,
        role: selectedEmployee?.role,
        lokasi_id: selectedEmployee?.lokasi?.id
      }).then((res) => {
        setEmployees((prev) => prev.map((e) => e.id === selectedEmployee?.id ? { ...e, ...selectedEmployee } : e));
      });
      setEditEmployee(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  }

  const deleteKaryawan = (karyawan: Karyawan) => {

  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Karyawan</h1>
      {employees.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
              {employees.map((empl) => 
                <KaryawanItem karyDetail={empl} onEditKary={openEditKaryawan} onDeleteKary={deleteKaryawan} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Data karyawan tidak tersedia karena aplikasi tidak menggunakan database.
        </p>
      )}
      <Modal isOpen={editEmployee} title="Edit Karyawan" onClose={() => setEditEmployee(false)}>
        <div className="form-control">
          <label className="form-control-label">
            <span className="label-text">Nama</span>
          </label>
          <input
            type="text"
            placeholder="Nama"
            className="form-control-input"
            value={selectedEmployee?.name || ""}
            onChange={(e) => {
              setSelectedEmployee({ ...selectedEmployee, name: e.target.value })
            }}
          />
        </div>
        <div className="form-control mt-4">
          <label className="form-control-label">
            <span className="label-text">No Karyawan</span>
          </label>
          <input
            type="text"
            placeholder="No Karyawan"
            className="form-control-input"
            value={selectedEmployee?.no_kary || ""}
            onChange={(e) => {
              setSelectedEmployee({ ...selectedEmployee, no_kary: e.target.value })
            }}
          />
        </div>
        <div className="form-control mt-4">
          <label className="form-control-label">
            <span className="label-text">Role</span>
          </label>
          <select
            className="form-control-input"
            value={selectedEmployee?.role || ""}
            onChange={(e) => {
              const newRole = e.target.value as "Penimbang" | "Pembongkar";
              setSelectedEmployee({ ...selectedEmployee, role: newRole })
            }}
          >
            <option value="Penimbang">Penimbang</option>
            <option value="Pembongkar">Pembongkar</option>
          </select>
        </div>
        <div className="form-control mt-4">
          <label className="form-control-label">
            <span className="label-text">Lokasi Gudang</span>
          </label>
          <select
            className="form-control-input"
            value={selectedEmployee?.lokasi?.id || ""}
            onChange={(e) => {
              const newLokasi = lokasi.find((l) => l.id === e.target.value);
              setSelectedEmployee({ ...selectedEmployee, lokasi: newLokasi || null });
            }}
          >
            <option value="">Pilih Lokasi</option>
            {lokasi.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama_lok}
              </option>
            ))}
          </select>
        </div>
        <div className="btn btn-primary mt-6" onClick={editKaryawan}>
          Simpan Perubahan
        </div>
      </Modal>
    </div>
  );
};

export default KaryawanPage;
