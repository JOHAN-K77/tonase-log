import { useEffect, useState, useCallback } from "react";
import WeighingForm from "@/components/WeighingForm";
import RecordList from "@/components/RecordList";
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

const Index = () => {
  const [records, setRecords] = useState<WeighingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WeighingRecord | null>(null);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from("weighing_records")
      .select("*")
      .is("tonase_kosong", null)
      .order("created_at", { ascending: false });
    if (data) setRecords(data as WeighingRecord[]);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="min-h-screen bg-background flex flex-col-reverse md:flex-row">
      <div className="flex-1 flex items-center justify-center p-4">
        <WeighingForm
          onRecordAdded={fetchRecords}
          selectedRecord={selectedRecord}
          onClearSelection={() => setSelectedRecord(null)}
        />
      </div>
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-l border-border bg-card flex flex-col max-h-[50vh] md:max-h-screen md:h-screen overflow-hidden">
        <RecordList
          records={records}
          selectedRecord={selectedRecord}
          onSelectRecord={setSelectedRecord}
        />
      </div>
    </div>
  );
};

export default Index;
