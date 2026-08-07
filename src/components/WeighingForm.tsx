import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { WeighingRecord, Supplier, Jenis, Karyawan, Lokasi } from "@/type/models";
import api from "@/api/api";
import CetakStruk from "@/lib/CetakStruk";
import { useSession } from "@/context/SessionContext";

interface WeighingFormProps {
  selectedRecord: WeighingRecord | null;
  onRecordAdded: (record: WeighingRecord) => void;
  onRecordUpdated: (record: WeighingRecord) => void;
  defaultOptions: {
    jenis: Jenis[];
    supplier: Supplier[];
    karyawan: Karyawan[];
    lokasi: Lokasi[];
  };
}

export const formatDate = (tanggal: string) => {
  const d = new Date(tanggal);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const WeighingForm = ({ selectedRecord, onRecordAdded, onRecordUpdated, defaultOptions }: WeighingFormProps) => {
  const { sessionActive } = useSession();

  const [tonase, setTonase] = useState("");
  const [jenis, setJenis] = useState<Jenis>(null);
  const [supplier, setSupplier] = useState("");
  const [nopol, setNopol] = useState("");
  const [idnota, setIdnota] = useState("");
  const [penimbang, setPenimbang] = useState<Karyawan>(null);
  const [pembongkar1, setPembongkar1] = useState<Karyawan>(null);
  const [pembongkar2, setPembongkar2] = useState<Karyawan>(null);
  const [pembongkar3, setPembongkar3] = useState<Karyawan>(null);

  // Sync fields when a record is selected
  useEffect(() => {
    if (selectedRecord) {
      setSupplier(selectedRecord.nama_suppl);
      setJenis(selectedRecord.jenis);
      setNopol(selectedRecord.nopol ?? "");
      setIdnota(selectedRecord.idnota ?? "");
      setPenimbang(selectedRecord.penimbang ?? null);
      setPembongkar1(selectedRecord.pembongkar1 ?? null);
      setPembongkar2(selectedRecord.pembongkar2 ?? null);
      setPembongkar3(selectedRecord.pembongkar3 ?? null);
    }
  }, [selectedRecord]);

  useEffect(() => {
    if (!jenis && defaultOptions.jenis.length > 0) {
      setJenis(defaultOptions.jenis[0]);
    }
  }, [defaultOptions.jenis]);

  useEffect(() => {
    if (selectedRecord && !penimbang && defaultOptions.karyawan.length > 0) {
      setPenimbang(defaultOptions.karyawan[0]);
    }
  }, [selectedRecord, penimbang, defaultOptions]);

  const handleDownload = () => {
    if (!selectedRecord || !selectedRecord.printed) return;

    CetakStruk(selectedRecord);
    return;
  };

  const handleSubmit = async () => {
    if (selectedRecord?.printed) {
      handleDownload();
      return;
    }

    if (!tonase) {
      toast.error("Tonase harus diisi!");
      return;
    }

    const tonaseValue = parseInt(tonase);
    if (tonaseValue <= 0) {
      toast.error("Tonase tidak boleh nol atau negatif!");
      return;
    }

    if (selectedRecord && tonaseValue >= selectedRecord.tonase_awal) {
      toast.error("Tonase kosong harus kurang dari tonase awal!");
      return;
    }

    if (selectedRecord && (!penimbang || !pembongkar1)) {
      toast.error("Penimbang dan tenaga bongkar 1 wajib dipilih saat timbang kedua!");
      return;
    }

    if (selectedRecord) {
      // Second weigh — prioritize latest edits except for initial/final weight
      const tonaseKosong = tonaseValue;
      const netto = selectedRecord.tonase_awal - tonaseKosong;
      const updated: WeighingRecord = {
        ...selectedRecord,
        jenis,
        nopol: nopol || null,
        idnota: idnota || null,
        penimbang: penimbang || null,
        pembongkar1: pembongkar1 || null,
        pembongkar2: pembongkar2 || null,
        pembongkar3: pembongkar3 || null,
        tonase_kosong: tonaseKosong,
        netto,
        printed: true,
      };
      onRecordUpdated(updated);

      try {
        await api.post("/api/update-log", {
          id: updated.id,
          no_nota: updated.idnota || null,
          tonase_kosong: updated.tonase_kosong,
          netto: updated.netto,
          jenis_id: updated.jenis?.id,
          penimbang_id: updated.penimbang?.id || null,
          pembongkar1_id: updated.pembongkar1?.id || null,
          pembongkar2_id: updated.pembongkar2?.id || null,
          pembongkar3_id: updated.pembongkar3?.id || null,
          printed: 1,
        }).then((res) => {
          setTonase("");
          setSupplier("");
          setNopol("");
          setIdnota("");
          toast.success("Timbang kosong berhasil disimpan!");

          const income = updated.netto * (updated.jenis?.price || 0);
          api.post("/api/make-transaction", {
            harga_kg: updated.jenis?.price || 0,
            pendapatan: income,
            log_id: updated.id
          }).then((res) => {
            console.log("Transaksi berhasil dibuat untuk log ID:", updated.id);
          }).catch((err) => {
            console.error("Gagal membuat transaksi untuk log ID:", updated.id, err);
          });
        });
      } catch (error) {
        toast.error("Gagal menyimpan data ke server!");
        return;
      }
    } else {
      // First weigh
      if (!supplier) {
        toast.error("Supplier harus diisi!");
        return;
      }

      const currentDate = new Date();
      const options = { timeZone: "Asia/Singapore", hour12: false };

      const timeStr = currentDate.toLocaleTimeString("en-GB", { ...options, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const dateStr = currentDate.toLocaleDateString("en-CA", options);
      
      const newRecord: WeighingRecord = {
        id: crypto.randomUUID(),
        tonase_awal: tonaseValue,
        supplier: null,
        jenis,
        waktu: timeStr,
        tanggal: dateStr,
        tonase_kosong: null,
        netto: null,
        printed: false,
        nopol: nopol || null,
        idnota: idnota || null,
        penimbang: null,
        pembongkar1: null,
        pembongkar2: null,
        pembongkar3: null,
        nama_suppl: supplier,
        lokasi_gudang: defaultOptions.lokasi.find((opt) => opt.nama_lok === sessionActive.lokasi) || defaultOptions.lokasi[0],
        // lokasi_gudang: defaultOptions.lokasi[0],
      };

      try {
        await api.post("/api/new-log", {
          no_nota: newRecord.idnota || null,
          waktu_timbang: newRecord.tanggal + " " + newRecord.waktu,
          timbang_awal: newRecord.tonase_awal,
          nama_supplier: newRecord.nama_suppl,
          nopol: newRecord.nopol,
          idjenis: newRecord.jenis?.id,
          idlokasi: newRecord.lokasi_gudang?.id,
          printed: 0,
        }).then((res) => {
          console.log("Response from server after adding new log:", res.data);

          newRecord.id = res.data.id; // Update the record ID with the one generated by the server
          onRecordAdded(newRecord);

          setTonase("");
          setSupplier("");
          setNopol("");
          setIdnota("");
          setPembongkar1(null);
          setPembongkar2(null);
          setPembongkar3(null);
          toast.success("Data berhasil disimpan!");
        });
      } catch (error) {
        toast.error("Gagal menyimpan data ke server!");
        return;
      }
    }
  };

  const isPrinted = selectedRecord?.printed === true;
  const buttonLabel = isPrinted ? "Unduh" : "Timbang";
  const buttonColor = isPrinted
    ? "bg-[#0070C0]"
    : "bg-[#0070C0] md:bg-accent md:text-accent-foreground";

  const tonaseDisplay = isPrinted
    ? (selectedRecord?.tonase_kosong?.toString() ?? "")
    : tonase;

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 w-full max-w-lg">
      {/* No. Nota — always visible */}
      <div>
        <Label className="text-sm text-muted-foreground mb-1">No. Nota</Label>
        <Input
          value={idnota}
          onChange={(e) => setIdnota(e.target.value)}
          placeholder="(opsional)"
          className="border-foreground/30"
          readOnly={isPrinted}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
        {/* Row 1: Tonase | Jenis */}
        <div>
          <Label className="text-sm text-muted-foreground mb-1">
            {selectedRecord ? "Tonase Kosong" : "Tonase"}
          </Label>
          <Input
            type="number"
            step="10"
            value={tonaseDisplay}
            onChange={(e) => setTonase(e.target.value)}
            placeholder="0"
            className="border-foreground/30"
            readOnly={isPrinted}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Jenis</Label>
          <select
            value={jenis?.id ?? ""}
            onChange={(e) => {
              if (selectedRecord && selectedRecord.jenis?.id !== e.target.value) {
                const confirmed = window.confirm("Apakah anda yakin ingin mengubah jenis?");
                if (confirmed) {
                  setJenis(defaultOptions.jenis.find((j) => j.id === e.target.value));
                }
              } else {
                setJenis(defaultOptions.jenis.find((j) => j.id === e.target.value));
              }
            }}
            disabled={isPrinted}
            className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm disabled:opacity-70"
          >
            {defaultOptions.jenis.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Supplier | No. Polisi */}
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Supplier</Label>
          <Input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Nama supplier"
            className="border-foreground/30"
            readOnly={isPrinted}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">No. Polisi</Label>
          <Input
            value={nopol}
            onChange={(e) => setNopol(e.target.value)}
            placeholder="DK 1234 BC"
            className="border-foreground/30"
            readOnly={isPrinted}
          />
        </div>

        {/* Penimbang | Kary. Bongkar — only when a record is selected */}
        {selectedRecord && (
          <>
            <div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">Penimbang</Label>
                <select
                  value={penimbang?.id ?? ""}
                  onChange={(e) => setPenimbang(defaultOptions.karyawan.find((k) => k.id === e.target.value) || null)}
                  disabled={isPrinted}
                  className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm disabled:opacity-70"
                >
                  {defaultOptions.karyawan.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">Kary. Bongkar 2</Label>
                <select
                  value={pembongkar2?.id ?? ""}
                  onChange={(e) => setPembongkar2(defaultOptions.karyawan.find((k) => k.id === e.target.value) || null)}
                  disabled={isPrinted}
                  className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm disabled:opacity-70"
                >
                  <option value={null}> (opsional)</option>
                  {defaultOptions.karyawan.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">Kary. Bongkar 1</Label>
                <select
                  value={pembongkar1?.id ?? ""}
                  onChange={(e) => setPembongkar1(defaultOptions.karyawan.find((k) => k.id === e.target.value) || null)}
                  disabled={isPrinted}
                  className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm disabled:opacity-70"
                >
                  <option value={null}> (opsional)</option>
                  {defaultOptions.karyawan.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">Kary. Bongkar 3</Label>
                <select
                  value={pembongkar3?.id ?? ""}
                  onChange={(e) => setPembongkar3(defaultOptions.karyawan.find((k) => k.id === e.target.value) || null)}
                  disabled={isPrinted}
                  className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm disabled:opacity-70"
                >
                  <option value={null}> (opsional)</option>
                  {defaultOptions.karyawan.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center mt-2 md:mt-4">
        <button
          onClick={handleSubmit}
          className={`w-32 h-32 md:w-48 md:h-48 rounded-full ${buttonColor} text-white text-2xl md:text-3xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all`}
        >
          {isPrinted ? (
            <span className="text-yellow-300 font-bold">{buttonLabel}</span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
};

export default WeighingForm;
