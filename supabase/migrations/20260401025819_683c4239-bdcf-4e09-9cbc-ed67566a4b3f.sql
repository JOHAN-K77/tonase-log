
CREATE TABLE public.weighing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tonase INTEGER NOT NULL,
  jenis TEXT NOT NULL,
  supplier TEXT NOT NULL,
  waktu TIME NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weighing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weighing records" ON public.weighing_records FOR SELECT USING (true);
CREATE POLICY "Anyone can insert weighing records" ON public.weighing_records FOR INSERT WITH CHECK (true);
