export interface WeighingRecord {
  id: string;
  tonase_awal: number;
  jenis: Jenis;
  supplier: Supplier | null;
  waktu: string;
  tanggal: string;
  tonase_kosong: number | null;
  netto: number | null;
  printed: boolean;
  idnota: string | null;
  penimbang: Karyawan | null;
  pembongkar: Karyawan | null;
  nama_suppl: string;
  nopol: string | null;
  lokasi_gudang: Lokasi;
}

export interface Supplier {
  id: string;
  name: string;
  nopol: string;
}

export interface Jenis {
  id: string;
  name: string;
  price: number;
}

export interface Karyawan {
  id: string;
  name: string;
  no_kary: string;
  role: "Penimbang" | "Pembongkar";
  lokasi: Lokasi;
}

export interface Lokasi {
  id: string;
  nama_lok: string;
  alamat: string | null
}