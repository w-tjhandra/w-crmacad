import { useState } from 'react';
import { useInstitusi, type StatusKerjasama } from '../context/InstitusiContext';
import { X, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

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

  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Extract unique cities from the original list
  const cities = Array.from(new Set(institusiList.map(i => i.kota))).sort();

  const exportToExcel = () => {
    // Siapkan data untuk diexport
    const exportData = filteredInstitusi.map((item, index) => ({
      'No': index + 1,
      'ID Institusi': item.id,
      'Nama Institusi': item.nama,
      'Kategori': item.jenis,
      'Kota/Kabupaten': item.kota,
      'Alamat Lengkap': item.alamat,
      'Status Kepemilikan': item.status_kepemilikan === 'N' ? 'Negeri' : (item.status_kepemilikan === 'S' ? 'Swasta' : item.status_kepemilikan),
      'Akreditasi': item.akreditasi || '-',
      'Status Kerjasama': STATUS_LABELS[item.status_kerjasama],
      'Nama Kepala Sekolah/Rektor': item.kepala_sekolah?.nama || '-',
      'No. HP Pimpinan': item.kepala_sekolah?.hp || '-',
      'Email Pimpinan': item.kepala_sekolah?.email || '-',
      'Kontak Institusi (Telp)': item.kontak?.telepon || '-',
      'Email Institusi': item.kontak?.email || '-',
      'Titik Koordinat (Lat, Lng)': `${item.lat}, ${item.lng}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Atur lebar kolom agar rapi
    const colWidths = [
      { wch: 5 }, { wch: 12 }, { wch: 35 }, { wch: 12 }, { wch: 20 }, 
      { wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 25 }, 
      { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 25 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Prospek CRM');

    // Generate dan download file excel
    XLSX.writeFile(workbook, 'Data_Prospek_CRM_Academy.xlsx');
  };

  const generateProposal = async (institusi: any, format: 'docx' | 'pdf') => {
    setIsGenerating(institusi.id);
    try {
      // 1. Ambil template docx
      const response = await fetch('/templates/Template Surat Penawaran MikroTik Academy.docx');
      if (!response.ok) throw new Error('Template tidak ditemukan');
      
      const content = await response.arrayBuffer();

      // 2. Isi data menggunakan docxtemplater
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        'NAMA SEKOLAH': institusi.nama,
        'ALAMAT SEKOLAH': institusi.alamat || institusi.kota,
        'NOMOR SURAT/MA/MONTH/YEAR': `0${institusi.id.replace('INS', '')}/MA/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
        'link pendaftaran/coming soon': 'coming soon'
      });

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const safeName = institusi.nama.replace(/[^a-zA-Z0-9]/g, '_');

      // Jika user minta DOCX, langsung download saja tanpa melalui backend
      if (format === 'docx') {
        saveAs(out, `Surat_Penawaran_${safeName}.docx`);
        return;
      }

      // Jika user minta PDF, kirim DOCX ke Backend Golang untuk dikonversi menjadi PDF
      const formData = new FormData();
      formData.append('document', out, `Surat_${safeName}.docx`);

      const convertRes = await fetch('http://localhost:8080/convert', {
        method: 'POST',
        body: formData
      });

      if (!convertRes.ok) throw new Error('Gagal mengonversi dokumen di server');

      // 4. Download hasil PDF
      const pdfBlob = await convertRes.blob();
      saveAs(pdfBlob, `Surat_Penawaran_${safeName}.pdf`);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Gagal membuat surat penawaran PDF. Pastikan backend server (Golang) sudah berjalan di port 8080.');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Data Institusi</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <X size={20} />
            </button>
          </div>
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
                <th className="px-4 py-3 border-b text-center">Aksi (Penawaran)</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitusi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => generateProposal(institusi, 'docx')}
                          disabled={isGenerating === institusi.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[65px] justify-center"
                          title="Download DOCX"
                        >
                          {isGenerating === institusi.id ? <Loader2 size={12} className="animate-spin" /> : 'DOCX'}
                        </button>
                        <button
                          onClick={() => generateProposal(institusi, 'pdf')}
                          disabled={isGenerating === institusi.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[65px] justify-center"
                          title="Convert to PDF via Server"
                        >
                          {isGenerating === institusi.id ? <Loader2 size={12} className="animate-spin" /> : 'PDF'}
                        </button>
                      </div>
                    </td>
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
