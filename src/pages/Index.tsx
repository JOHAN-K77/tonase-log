import { useState, useCallback, useEffect } from "react";
import WeighingForm from "@/components/WeighingForm";
import RecordList from "@/components/RecordList";
import { WeighingRecord, Jenis, Supplier, Karyawan, Lokasi } from "@/type/models";
import api from "@/api/api";
import { useSession } from "@/context/SessionContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { sessionActive } = useSession();
  const navigate = useNavigate();

  const [countNewLog, setCountNewLog] = useState<number>(0);
  const [secondCount, setSecondCount] = useState<number>(0);

  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WeighingRecord | null>(null);

  const [jenisMaster, setJenisMaster] = useState<Jenis[]>([]);
  const [supplierMaster, setSupplierMaster] = useState<Supplier[]>([]);
  const [karyawanMaster, setKaryawanMaster] = useState<Karyawan[]>([]);
  const [lokasiMaster, setLokasiMaster] = useState<Lokasi[]>([]);

  console.log("Session aktif:", sessionActive);

  useEffect(() => {
    if (!sessionActive) return;

    Promise.all([
      api.post("/api/fetch-table", { table: "jenis" }),
      api.post("/api/fetch-table", { table: "supplier" }),
      api.post("/api/fetch-table", { table: "lokasi_gudang" }),
    ]).then(([jenisRes, supplierRes, lokasiRes]) => {
      const jenisData: Jenis[]= jenisRes.data.map((item: any) => ({
        id: String(item.jenis_id),
        name: item.nama_jenis,
        price: item.harga
      }));

      if (jenisData.length > 0) {
        console.log("Ambil tabel jenis dari database:", jenisRes.data)  
        setJenisMaster(jenisData);
      } else {
        console.log("Belum ada data jenis")
        setJenisMaster([]);
      }
      
      const supplierData: Supplier[]= supplierRes.data.map((item: any) => ({
        id: String(item.suppl_id),
        name: item.nama_suppl,
        nopol: item.nopol
      }));

      if (supplierData.length > 0) {
        console.log("Ambil tabel supplier dari database:", supplierRes.data)
        setSupplierMaster(supplierData);
      } else {
        console.log("Belum ada data supplier")
        setSupplierMaster([]);
      }
      
      const lokasiData: Lokasi[]= lokasiRes.data.map((item: any) => ({
        id: String(item.lokasi_id),
        nama_lok: item.nama_gudang,
        alamat: item.alamat
      }));
      if (lokasiData.length > 0) {
        console.log("Ambil tabel lokasi gudang dari database:", lokasiRes.data)
        setLokasiMaster(lokasiData);
      } else {
        console.log("Belum ada data lokasi gudang")
        setLokasiMaster([]);
      }

      api.post("/api/fetch-table", { table: "karyawan" }).then((res) => {
        const karyawanData: Karyawan[]= res.data.map((item: any) => ({
          id: String(item.kary_id),
          name: item.nama_kary,
          no_kary: item.no_kary,
          role: item.role,
          lokasi: lokasiData.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null
        }));
        
        if (res.data.length > 0) {
          console.log("Ambil tabel karyawan dari database:", res.data)
          setKaryawanMaster(karyawanData);
          console.log("Hasil konversi dari database:", karyawanData);
          const lok_log = lokasiData.find((l) => l.nama_lok === String(sessionActive?.lokasi)) || null;
          console.log("Lokasi login:", lok_log);

          api.post("/api/fetch-records", { printed: "0", lokasi_gudang_lokasi_id: lok_log?.id }).then((res) => {
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
              console.log("Belum ada data")
            }
          });
        } else {
          console.log("Belum ada data karyawan")
          setKaryawanMaster([]);
        }
      });
    });
  }, [sessionActive]);

  useEffect(() => {
    if (sessionActive && sessionActive.role === "admin") {
      navigate("/karyawan");
    }
  }, [sessionActive, navigate]);

  const addRecord = useCallback((record: WeighingRecord) => {
    setRecords((prev) => [record, ...prev]);

    if (countNewLog < 3) {
      setCountNewLog((prev) => prev + 1);
    } else {
      console.log("Batas log baru tercapai, menghapus log lama...");
      setRecords((prev) => {
          const printed = prev.map((r, idx) => (r.printed ? idx : -1)).filter(idx => idx !== -1).slice(0, 2);
          
          return prev.filter((_, idx) => !printed.includes(idx));
      });
      setCountNewLog(0);
      setSecondCount((prev) => prev + 1);
    }

    if (secondCount >= 3) {
      console.log("Batas log kedua tercapai, menghapus log lama...");
      setRecords((prev) => {
        const printed = prev.map((r, idx) => (r.printed ? idx : -1)).filter(idx => idx !== -1).slice(0, 1);

        return prev.filter((_, idx) => !printed.includes(idx));
      });
      setSecondCount(0);
    }
  }, []);

  const updateRecord = useCallback((updated: WeighingRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setSelectedRecord(updated);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col-reverse md:flex-row">
      <div className="flex-1 flex items-center justify-center p-4">
        <WeighingForm
          selectedRecord={selectedRecord}
          onRecordAdded={addRecord}
          onRecordUpdated={updateRecord}
          defaultOptions={{
            jenis: jenisMaster,
            supplier: supplierMaster,
            karyawan: karyawanMaster,
            lokasi: lokasiMaster,
          }}
        />
      </div>
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-l border-border bg-card flex flex-col max-h-[50vh] md:max-h-screen md:h-screen overflow-hidden">
        <RecordList
          records={records}
          selectedRecord={selectedRecord}
          onSelectRecord={setSelectedRecord}
          forWeighing={true}
        />
      </div>
    </div>
  );
};

export default Index;
