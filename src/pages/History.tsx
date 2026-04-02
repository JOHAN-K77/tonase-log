import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface WeighingRecord {
  id: string;
  tonase_awal: number;
  jenis: string;
  supplier: string;
  waktu: string;
  tanggal: string;
  tonase_kosong: number | null;
  netto: number | null;
  printed: boolean;
}

const History = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from("weighing_records")
      .select("*")
      .not("tonase_kosong", "is", null)
      .order("created_at", { ascending: false });
    if (data) setRecords(data as WeighingRecord[]);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const formatDate = (tanggal: string) => {
    const d = new Date(tanggal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Riwayat</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-left">Jenis</th>
              <th className="px-4 py-3 text-right">Tonase Awal</th>
              <th className="px-4 py-3 text-right">Tonase Kosong</th>
              <th className="px-4 py-3 text-right">Netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Belum ada data riwayat
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{formatDate(r.tanggal)}</td>
                <td className="px-4 py-3">{r.waktu}</td>
                <td className="px-4 py-3">{r.supplier}</td>
                <td className="px-4 py-3">{r.jenis}</td>
                <td className="px-4 py-3 text-right">{r.tonase_awal} kg</td>
                <td className="px-4 py-3 text-right">{r.tonase_kosong} kg</td>
                <td className="px-4 py-3 text-right font-bold">{r.netto} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
