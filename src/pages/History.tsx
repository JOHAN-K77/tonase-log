import api from "@/api/api";
import RecordList from "@/components/RecordList";
// import { useSession } from "@/context/SessionContext";
import { Jenis, Karyawan, Lokasi, Supplier, WeighingRecord } from "@/type/models";
import { useEffect, useState } from "react";

const History = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WeighingRecord | null>(null);

  // const { sessionActive } = useSession();
  // if (sessionActive === null) {
  //   return null;
  // }

  useEffect(() => {
      Promise.all([
        api.post("/api/fetch-table", { table: "jenis" }),
        api.post("/api/fetch-table", { table: "supplier" }),
        api.post("/api/fetch-table", { table: "lokasi_gudang" }),
      ]).then(([jenisRes, supplierRes, lokasiRes]) => {
        const jenisData: Jenis[]= jenisRes.data.map((item: any) => ({
          id: String(item.jenis_id),
          nama_lok: item.nama_jenis,
          price: item.harga
        }));
        
        const supplierData: Supplier[]= supplierRes.data.map((item: any) => ({
          id: String(item.suppl_id),
          name: item.nama_suppl,
          nopol: item.nopol
        }));
        
        const lokasiData: Lokasi[]= lokasiRes.data.map((item: any) => ({
          id: String(item.lokasi_id),
          name: item.nama_gudang,
          alamat: item.alamat
        }));
  
        api.post("/api/fetch-table", { table: "karyawan" }).then((res) => {
          const karyawanData: Karyawan[]= res.data.map((item: any) => ({
            id: String(item.kary_id),
            name: item.nama_kary,
            no_kary: item.no_kary,
            role: item.role,
            lokasi: lokasiData.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null
          }));
          
          if (res.data.length > 0) {
  
            api.post("/api/fetch-records", { printed: "1", lokasi_gudang_lokasi_id: lokasiData[0]?.id }).then((res) => {
              console.log("Ambil semua record timbang dari database:", res.data)
              if (res.data.length > 0) {
                const log_timbang: WeighingRecord[] = res.data.map((item: any) => ({
                  id: String(item.id_wlog),
                  idnota: item.no_nota ?? null,
                  nama_suppl: item.nama_suppl,
                  nopol: item.nopol ?? null,
                  tonase_awal: item.timbang_awal,
                  tonase_kosong: item.timbang_kosong ?? null,
                  netto: item.netto ?? null,
                  printed: item.printed === 1,
                  jenis: jenisData.find((j) => j.id === String(item.jenis_jenis_id)),
                  lokasi: lokasiData.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null,
                  penimbang: karyawanData.find((k) => k.id === String(item.penimbang_id)) || null,
                  pembongkar: karyawanData.find((k) => k.id === String(item.tenaga_bongkar_id)) || null,
                  tanggal: item.waktu_timbang ? new Date(item.waktu_timbang).toISOString().slice(0, 10) : null,
                  waktu: item.waktu_timbang ? new Date(item.waktu_timbang).toISOString().slice(11, 16) : null,
                }))
                setRecords(log_timbang)
                console.log("Hasil konversi dari database:", log_timbang);
              } else {
                console.log("Belum ada riwayat timbang")
              }
            });
          } else {
            console.log("Belum ada data karyawan")
          }
        });
      });
    }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Riwayat</h1>
      {records.length > 0 ? (
        <div className="space-y-4">
          <RecordList records={records} selectedRecord={selectedRecord} onSelectRecord={setSelectedRecord} />
        </div>
      ) : (
        <p className="text-muted-foreground">
          Data riwayat tidak tersedia karena aplikasi tidak menggunakan database.
        </p>
      )}
    </div>
  );
};

export default History;
