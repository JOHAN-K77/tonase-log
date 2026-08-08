import api from "@/api/api";
import RecordList from "@/components/RecordList";
import { useSession } from "@/context/SessionContext";
import { Jenis, Karyawan, Lokasi, Supplier, WeighingRecord } from "@/type/models";
import { useEffect, useState } from "react";
import { downloadExcel } from "@/lib/DownloadExcel";

const History = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WeighingRecord | null>(null);
  const { sessionActive } = useSession();

  const [lokasiList, setLokasi] = useState<Lokasi[]>([]);
  const [karyawanList, setKaryawan] = useState<Karyawan[]>([]);
  const [jenisList, setJenis] = useState<Jenis[]>([]);

  const [selectedLokasi, setSelectedLokasi] = useState<number | null>(null);
  const [namaSup, setNamaSup] = useState<string>("");
  const [namaTimb, setNamaTimb] = useState<number | null>(null);
  const [namaBongk, setNamaBongk] = useState<number | null>(null);
  const [selectedJenis, setSelectedJenis] = useState<number | null>(null);

  useEffect(() => {
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
        setJenis(jenisData);
        
        const supplierData: Supplier[]= supplierRes.data.map((item: any) => ({
          id: String(item.suppl_id),
          name: item.nama_suppl,
          nopol: item.nopol
        }));
        
        const lokasiData: Lokasi[]= lokasiRes.data.map((item: any) => ({
          id: String(item.lokasi_id),
          nama_lok: item.nama_gudang,
          alamat: item.alamat
        }));
        setLokasi(lokasiData);

        api.post("/api/fetch-table", { table: "karyawan" }).then((res) => {
          const karyawanData: Karyawan[]= res.data.map((item: any) => ({
            id: String(item.kary_id),
            name: item.nama_kary,
            no_kary: item.no_kary,
            role: item.role,
            lokasi: lokasiData.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null
          }));
          setKaryawan(karyawanData);
          
          if (res.data.length > 0) {
            const paramToSend = { printed: "1",
              ...(sessionActive?.lokasi && {
                lokasi_gudang_lokasi_id: lokasiData.find((l) => l.nama_lok === sessionActive.lokasi)?.id || lokasiData[0].id
              })
            };

            api.post("/api/fetch-records", paramToSend).then((res) => {
              console.log("Ambil semua record timbang dari database:", res.data)
              if (res.data.length > 0) {
                isiRecords(res.data, jenisData, karyawanData, lokasiData);
              } else {
                console.log("Belum ada riwayat timbang")
              }
            });
          } else {
            console.log("Belum ada data karyawan")
          }
        });
      });
    }, [sessionActive]);

    useEffect(() => {
      if (sessionActive?.role == "admin") {
        if (selectedLokasi || namaSup !== "" || namaTimb || namaBongk || selectedJenis) {
          console.log("Filter for lokasi:", selectedLokasi, "; supplier:", namaSup, "; Penimbang: ", namaTimb, "; Pembongkar: ", namaBongk)
          
          const paramToSend = { printed: "1",
            ...(selectedLokasi && { lokasi_gudang_lokasi_id: selectedLokasi }),
            ...(namaSup !== "" && { nama_suppl_like: namaSup }),
            ...(namaTimb && { penimbang_id: namaTimb }),
            ...(namaBongk !== null && { tenaga_bongkar_like: String(namaBongk) }),
            ...(selectedJenis && { jenis_jenis_id: selectedJenis })
          };
          api.post("/api/fetch-records", paramToSend).then((res) => {
            if (res.data.length > 0) {
              isiRecords(res.data, jenisList, karyawanList, lokasiList);  
            } else {
              isiRecords([], jenisList, karyawanList, lokasiList);
              console.log("Tidak ada record yang sesuai dengan filter")
            }
          })
        } else {
          api.post("/api/fetch-records", { printed: "1" }).then((res) => {
            if (res.data.length > 0) {
              isiRecords(res.data, jenisList, karyawanList, lokasiList);  
            }
          })
        }
      }
    }, [sessionActive, selectedLokasi, namaSup, namaTimb, namaBongk, selectedJenis])

  if (sessionActive === null) {
    return null;
  }

  function isiRecords(dataToTransfer: any[], daftarJenis: Jenis[], daftarKary: Karyawan[], daftarLok: Lokasi[]) {
    // Add this BEFORE the isiRecords function definition
    const convertToGMT8 = (waktuTimbangStr: string) => {
      // Parse the datetime string from database
      const [dateStr, timeStr] = waktuTimbangStr.split(' ');
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hour, minute, second] = timeStr.split(':').map(Number);
      
      // Create UTC date (database stores UTC)
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
      
      // Convert to GMT+8
      const formatter = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Singapore'
      });
      
      const parts = formatter.formatToParts(utcDate);
      const tanggal = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;
      const waktu = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}`;
      
      return { tanggal, waktu };
    };

    const log_timbang: WeighingRecord[] = dataToTransfer.map((item: any) => ({
      id: String(item.id_wlog),
      idnota: item.no_nota ?? null,
      nama_suppl: item.nama_suppl,
      nopol: item.nopol ?? null,
      tonase_awal: item.timbang_awal,
      tonase_kosong: item.timbang_kosong ?? null,
      netto: item.netto ?? null,
      printed: item.printed === 1,
      jenis: daftarJenis.find((j) => j.id === String(item.jenis_jenis_id)),
      lokasi_gudang: daftarLok.find((l) => l.id === String(item.lokasi_gudang_lokasi_id)) || null,
      penimbang: daftarKary.find((k) => k.id === String(item.penimbang_id)) || null,
      pembongkar1: daftarKary.find((k) => k.id === String(item.tenaga_bongkar1_id)) || null,
      pembongkar2: daftarKary.find((k) => k.id === String(item.tenaga_bongkar2_id)) || null,
      pembongkar3: daftarKary.find((k) => k.id === String(item.tenaga_bongkar3_id)) || null,
      tanggal: convertToGMT8(item.waktu_timbang).tanggal || null,
      waktu: convertToGMT8(item.waktu_timbang).waktu || null,
      supplier: null
    }))
    setRecords(log_timbang)
    console.log("Hasil konversi dari database:", log_timbang);
  }

  const currentDate = new Date();
  const options = { timeZone: "Asia/Singapore", hour12: false };

  const timeStr = currentDate.toLocaleTimeString("en-GB", { ...options, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentDate.toLocaleDateString("en-CA", options);

  const dateTimeStrCurr = `${dateStr} ${timeStr}`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {sessionActive.role == "admin" && (
        <div>
          <div className="input-group">
            <label className="input-group-text">Lokasi Gudang</label>
            <select className="form-control" value={String(selectedLokasi) ?? ""} onChange={(e) => setSelectedLokasi(e.target.value !== "" ? Number(e.target.value) : null)}>
              <option value="">Semua Lokasi</option>
              {lokasiList.map((l) => (
                <option key={`lok-${l.id}`} value={l.id}>
                  {l.nama_lok}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-group-text">Nama Supplier</label>
            <input type="text" className="form-control" value={String(namaSup) ?? ""} onChange={(e) => setNamaSup(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-group-text">Nama Penimbang</label>
            <select className="form-control" value={String(namaTimb) ?? ""} onChange={(e) => setNamaTimb(e.target.value !== "" ? Number(e.target.value) : null)}>
              <option value="">Pilih Penimbang</option>
              {karyawanList.map((k) => (
                <option key={`timb-${k.id}`} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-group-text">Nama Tenaga Bongkar</label>
            <select className="form-control" value={String(namaBongk) ?? ""} onChange={(e) => setNamaBongk(e.target.value !== "" ? Number(e.target.value) : null)}>
              <option value="">Pilih Tenaga Bongkar</option>
              {karyawanList.map((k) => (
                <option key={`bongk-${k.id}`} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-group-text">Jenis</label>
            <select className="form-control" value={String(selectedJenis) ?? ""} onChange={(e) => setSelectedJenis(e.target.value !== "" ? Number(e.target.value) : null)}>
              <option value="">Semua Jenis</option>
              {jenisList.map((j) => (
                <option key={`jenis-${j.id}`} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary mt-3" onClick={() => downloadExcel(records, "riwayat_timbang" + dateTimeStrCurr)}>
            Download Excel
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Riwayat</h1>
      {records.length > 0 ? (
        <div className="space-y-4">
          <RecordList records={records} selectedRecord={selectedRecord} onSelectRecord={setSelectedRecord} />
        </div>
      ) : (
        <p className="text-muted-foreground">
          Data riwayat tidak ditemukan
        </p>
      )}
    </div>
  );
};

export default History;
