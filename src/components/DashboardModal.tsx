import { useInstitusi, type StatusKerjasama } from '../context/InstitusiContext';
import { X } from 'lucide-react';

interface DashboardModalProps {
  onClose: () => void;
}

const STATUS_LABELS: Record<StatusKerjasama, string> = {
  sudah: 'Sudah MoU',
  on_progress: 'On Progress',
  belum: 'Belum MoU'
};

const STATUS_STYLES: Record<StatusKerjasama, string> = {
  sudah: 'bg-green-100 text-green-700 border-green-200',
  on_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  belum: 'bg-red-100 text-red-700 border-red-200'
};

export default function DashboardModal({ onClose }: DashboardModalProps) {
  const { 
    institusiList, 
    filteredInstitusi,
    filterKategori,
    setFilterKategori,
    filterKota,
    setFilterKota,
    filterStatus,
    setFilterStatus
  } = useInstitusi();

  // Extract unique cities from the original list
  const cities = Array.from(new Set(institusiList.map(i => i.kota))).sort();

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Data Institusi</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Filter Kategori</label>
            <select 
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value as any)}
              className="text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="PTN">PTN</option>
              <option value="PTS">PTS</option>
              <option value="SMK">SMK</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Filter Kota/Kabupaten</label>
            <select 
              value={filterKota}
              onChange={(e) => setFilterKota(e.target.value)}
              className="text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="Semua">Semua Kota</option>
              {cities.map(kota => (
                <option key={kota} value={kota}>{kota}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Filter Status Kerjasama</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusKerjasama | 'Semua')}
              className="text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="sudah">Sudah MoU</option>
              <option value="on_progress">On Progress</option>
              <option value="belum">Belum MoU</option>
            </select>
          </div>
          
          <div className="mt-auto ml-auto text-sm text-slate-500">
            Menampilkan <span className="font-bold text-slate-700">{filteredInstitusi.length}</span> dari {institusiList.length} data
          </div>
        </div>

        <div className="overflow-auto flex-1 p-0">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 border-b">Nama Institusi</th>
                <th className="px-4 py-3 border-b">Jenis</th>
                <th className="px-4 py-3 border-b">Kota/Kabupaten</th>
                <th className="px-4 py-3 border-b">Kepemilikan</th>
                <th className="px-4 py-3 border-b">Status Kerjasama</th>
                <th className="px-4 py-3 border-b">Kepala Sekolah/Rektor</th>
                <th className="px-4 py-3 border-b">Telepon</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitusi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredInstitusi.map((institusi) => (
                  <tr key={institusi.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{institusi.nama}</td>
                    <td className="px-4 py-3">{institusi.jenis}</td>
                    <td className="px-4 py-3">{institusi.kota}</td>
                    <td className="px-4 py-3 capitalize">{institusi.status_kepemilikan}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_STYLES[institusi.status_kerjasama]}`}>
                        {STATUS_LABELS[institusi.status_kerjasama]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{institusi.kepala_sekolah?.nama || '-'}</td>
                    <td className="px-4 py-3">{institusi.kontak?.telepon || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
