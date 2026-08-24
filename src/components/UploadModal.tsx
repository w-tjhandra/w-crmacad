import { useState } from 'react';
import { useInstitusi } from '../context/InstitusiContext';
import type { Institusi, StatusKerjasama, JenisInstitusi } from '../context/InstitusiContext';
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const { setInstitusiList } = useInstitusi();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(0);
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ' Jawa Timur')}&limit=1`, {
        headers: { 'Accept-Language': 'id' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const processData = () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const newData: Institusi[] = [];
          
          for (const row of results.data as any[]) {
            if (!row.nama || !row.jenis || !row.kota) {
              throw new Error("Format CSV tidak valid. Harus ada kolom: nama, jenis, kota, alamat.");
            }

            let lat = parseFloat(row.lat);
            let lng = parseFloat(row.lng);

            // Geocode if missing lat/lng
            if (isNaN(lat) || isNaN(lng)) {
              const coords = await geocodeAddress(row.alamat || row.kota);
              if (coords) {
                lat = coords.lat;
                lng = coords.lng;
              } else {
                // Fallback to center of Jatim if geocoding fails
                lat = -7.5;
                lng = 112.5;
              }
              // Wait 1 second to respect Nominatim API rate limits (1 req/s)
              await new Promise(r => setTimeout(r, 1000));
            }

            const item: Institusi = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              nama: row.nama,
              jenis: row.jenis as JenisInstitusi,
              kota: row.kota,
              alamat: row.alamat || '',
              lat: lat,
              lng: lng,
              akreditasi: row.akreditasi || 'Belum Terakreditasi',
              status_kepemilikan: row.status_kepemilikan || 'Swasta',
              status_kerjasama: (row.status_kerjasama as StatusKerjasama) || 'belum',
              kontak: {
                email: row.email_institusi || '',
                telepon: row.telepon_institusi || ''
              },
              kepala_sekolah: {
                nama: row.nama_kepsek || '',
                email: row.email_kepsek || '',
                hp: row.hp_kepsek || ''
              },
              jurusan: [
                {
                  nama: row.nama_jurusan || (row.jenis === 'SMK' ? 'Teknik Komputer dan Jaringan (TKJ)' : 'Informatika'),
                  kajur: {
                    nama: row.nama_kajur || '',
                    email: row.email_kajur || '',
                    hp: row.hp_kajur || ''
                  }
                }
              ]
            };
            newData.push(item);
          }

          if (newData.length > 0) {
            setInstitusiList(prev => [...prev, ...newData]);
            setSuccess(newData.length);
          } else {
            setError("File CSV kosong.");
          }
        } catch (err: any) {
          setError(err.message || "Gagal memproses data.");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setError("Gagal membaca file CSV.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Upload Data CSV</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {success > 0 ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Berhasil!</h3>
              <p className="text-slate-500">Berhasil menambahkan {success} institusi baru ke dalam sistem.</p>
              <button 
                onClick={onClose}
                className="mt-6 w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-4">
                  Unggah file CSV dengan header: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">nama, jenis, kota, alamat, status_kerjasama</code> (dan kolom opsional lainnya). 
                  Sistem akan otomatis mencari titik koordinat jika lat/lng kosong.
                </p>
                
                <label className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">{file ? file.name : "Pilih File CSV"}</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-md flex gap-2 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                onClick={processData}
                disabled={!file || loading}
                className={`w-full py-2.5 rounded-md font-medium text-white flex items-center justify-center gap-2 transition-colors ${!file || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Memproses (Geocoding)...</> : 'Proses Data'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
