import { useInstitusi } from '../context/InstitusiContext';
import { Search, MapPin, Building2, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function Sidebar() {
  const { 
    institusiList,
    searchTerm, setSearchTerm, 
    filterKategori, setFilterKategori, 
    filterStatus, setFilterStatus,
    filterKota, setFilterKota,
    filteredInstitusi,
    setActiveInstitusiId,
    activeInstitusiId
  } = useInstitusi();

  const exportCSV = () => {
    // Flatten data for CSV
    const csvData = filteredInstitusi.map(item => ({
      ID: item.id,
      Nama: item.nama,
      Jenis: item.jenis,
      Kota: item.kota,
      Alamat: item.alamat,
      Lat: item.lat,
      Lng: item.lng,
      Status_Kepemilikan: item.status_kepemilikan,
      Status_Kerjasama: item.status_kerjasama,
      Email: item.kontak.email,
      Telepon: item.kontak.telepon,
      Kepala_Sekolah: item.kepala_sekolah.nama
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_institusi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const json = JSON.stringify(filteredInstitusi, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_institusi.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 relative">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Search size={18} /> Pencarian & Filter
        </h2>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Cari nama atau kota..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Kota/Kabupaten</label>
              <select 
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                value={filterKota}
                onChange={(e) => setFilterKota(e.target.value)}
              >
                <option value="Semua">Semua Kota</option>
                {Array.from(new Set(institusiList.map(i => i.kota))).sort().map(kota => (
                  <option key={kota} value={kota}>{kota}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
                <select 
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value as any)}
                >
                  <option value="Semua">Semua</option>
                  <option value="PTN">PTN</option>
                  <option value="PTS">PTS</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select 
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="Semua">Semua</option>
                  <option value="sudah">Sudah MoU</option>
                  <option value="on_progress">On Progress</option>
                  <option value="belum">Belum MoU</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredInstitusi.length === 0 ? (
            <div className="text-center p-4 text-sm text-slate-500">
              Tidak ada data ditemukan.
            </div>
          ) : (
            filteredInstitusi.map(item => (
              <div 
                key={item.id}
                onClick={() => setActiveInstitusiId(item.id)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${activeInstitusiId === item.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <h3 className="font-medium text-slate-800 text-sm truncate" title={item.nama}>
                  {item.nama}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Building2 size={12} /> {item.jenis}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {item.kota}</span>
                </div>
                <div className="mt-2 flex">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.status_kerjasama === 'sudah' ? 'bg-green-100 text-green-700' :
                    item.status_kerjasama === 'on_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status_kerjasama === 'sudah' ? 'Sudah MoU' :
                     item.status_kerjasama === 'on_progress' ? 'On Progress' : 'Belum MoU'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <button 
            onClick={exportCSV}
            className="flex-1 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1"
          >
            <Download size={14} /> CSV
          </button>
          <button 
            onClick={exportJSON}
            className="flex-1 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1"
          >
            <Download size={14} /> JSON
          </button>
        </div>
      </div>
    </aside>
  );
}
