import { useState, useCallback } from "react";
import WeighingForm from "@/components/WeighingForm";
import RecordList from "@/components/RecordList";

export interface WeighingRecord {
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

  const addRecord = useCallback((record: WeighingRecord) => {
    setRecords((prev) => [record, ...prev]);
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
        />
        />
      </div>
      <div className="w-full md:w-[420px] border-b md:border-b-0 md:border-l border-border bg-card flex flex-col max-h-[50vh] md:max-h-screen md:h-screen overflow-hidden">
        <RecordList
          records={records.filter((r) => r.tonase_kosong === null)}
          selectedRecord={selectedRecord}
          onSelectRecord={setSelectedRecord}
        />
      </div>
    </div>
  );
};

export default Index;
