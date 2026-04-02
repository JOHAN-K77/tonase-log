import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface WeighingFormProps {
  onRecordAdded: () => void;
}

const WeighingForm = ({ onRecordAdded }: WeighingFormProps) => {
  const [tonase, setTonase] = useState("");
  const [jenis, setJenis] = useState("Kardus");
  const [supplier, setSupplier] = useState("");
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const waktu = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const tanggal = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleSubmit = async () => {
    if (!tonase || !supplier) {
      toast.error("Tonase dan Supplier harus diisi!");
      return;
    }

    setLoading(true);
    const currentDate = new Date();
    const timeStr = currentDate.toTimeString().slice(0, 5);
    const dateStr = currentDate.toISOString().slice(0, 10);

    const { error } = await supabase.from("weighing_records").insert({
      tonase: parseInt(tonase),
      jenis,
      supplier,
      waktu: timeStr,
      tanggal: dateStr,
    });

    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan data!");
      console.error(error);
    } else {
      toast.success("Data berhasil disimpan!");
      setTonase("");
      setSupplier("");
      onRecordAdded();
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 w-full max-w-lg">
      <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Tonase</Label>
          <Input
            type="number"
            value={tonase}
            onChange={(e) => setTonase(e.target.value)}
            placeholder="0"
            className="border-foreground/30"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Waktu</Label>
          <Input value={waktu} readOnly className="border-foreground/30 bg-muted/50" />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Jenis</Label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="flex h-10 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm"
          >
            <option value="Kardus">Kardus</option>
            <option value="Kertas">Kertas</option>
            <option value="Buram">Buram</option>
            <option value="Duplex">Duplex</option>
            <option value="Non kertas">Non kertas</option>
          </select>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-1">Tanggal</Label>
          <Input value={tanggal} readOnly className="border-foreground/30 bg-muted/50" />
        </div>
        <div className="col-span-1">
          <Label className="text-sm text-muted-foreground mb-1">Supplier</Label>
          <Input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Nama supplier"
            className="border-foreground/30"
          />
        </div>
      </div>

      <div className="flex justify-center mt-2 md:mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#0070C0] md:bg-accent text-white md:text-accent-foreground text-2xl md:text-3xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "..." : "Timbang"}
        </button>
      </div>
    </div>
  );
};

export default WeighingForm;
