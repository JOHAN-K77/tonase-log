
ALTER TABLE public.weighing_records RENAME COLUMN tonase TO tonase_awal;

ALTER TABLE public.weighing_records ADD COLUMN tonase_kosong integer;
ALTER TABLE public.weighing_records ADD COLUMN netto integer;
ALTER TABLE public.weighing_records ADD COLUMN printed boolean NOT NULL DEFAULT false;

CREATE POLICY "Anyone can update weighing records"
ON public.weighing_records
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
