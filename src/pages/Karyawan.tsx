import api from "@/api/api";
import KaryawanList from "@/components/KaryawanList";
import { useSession } from "@/context/SessionContext";
import { Jenis, Karyawan, Lokasi, Supplier, WeighingRecord } from "@/type/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const KaryawanPage = () => {
  const [employees, setEmployees] = useState<Karyawan[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(null);

  const { sessionActive } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    api.post("/api/fetch-table", { table: "lokasi_gudang" }).then((res) => {
      const lokasiData: Lokasi[] = res.data.map((item: any) => ({
        id: String(item.lokasi_id),
        nama_lok: item.nama_gudang,
        alamat: item.alamat
      }));

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
  }, []);
  
  if (sessionActive) {
    if (sessionActive.role !== "admin") {
      navigate("/index");
    }
  } else  {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Karyawan</h1>
      {employees.length > 0 ? (
        <div className="space-y-4">
          <KaryawanList karyList={employees} selectedKary={selectedEmployee} onSelectKary={setSelectedEmployee} />
        </div>
      ) : (
        <p className="text-muted-foreground">
          Data karyawan tidak tersedia karena aplikasi tidak menggunakan database.
        </p>
      )}
    </div>
  );
};

export default KaryawanPage;
