import { useEffect, useState, useCallback } from "react";
import WeighingForm from "@/components/WeighingForm";
import RecordList from "@/components/RecordList";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [records, setRecords] = useState<any[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from("weighing_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center">
        <WeighingForm onRecordAdded={fetchRecords} />
      </div>
      <div className="w-[420px] border-l border-border bg-card flex flex-col">
        <RecordList records={records} />
      </div>
    </div>
  );
};

export default Index;
