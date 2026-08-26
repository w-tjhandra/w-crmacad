import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import initialData from '../data/institusi.json';

export type StatusKerjasama = 'sudah' | 'on_progress' | 'belum';
export type JenisInstitusi = 'SMK' | 'Universitas';

export type KategoriInstitusi = 'Semua' | 'SMK' | 'PTN' | 'PTS';

export interface Institusi {
  id: string;
  nama: string;
  jenis: JenisInstitusi;
  kota: string;
  alamat: string;
  lat: number;
  lng: number;
  akreditasi: string;
  status_kepemilikan: string;
  status_kerjasama: StatusKerjasama;
  kontak: {
    email: string;
    telepon: string;
  };
  kepala_sekolah: {
    nama: string;
    email: string;
    hp: string;
  };
  jurusan: {
    nama: string;
    kajur: {
      nama: string;
      email: string;
      hp: string;
    };
  }[];
}

interface InstitusiContextType {
  institusiList: Institusi[];
  updateStatus: (id: string, newStatus: StatusKerjasama) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterKategori: KategoriInstitusi;
  setFilterKategori: (kategori: KategoriInstitusi) => void;
  filterStatus: StatusKerjasama | 'Semua';
  setFilterStatus: (status: StatusKerjasama | 'Semua') => void;
  filterKota: string;
  setFilterKota: (kota: string) => void;
  filteredInstitusi: Institusi[];
  activeInstitusiId: string | null;
  setActiveInstitusiId: (id: string | null) => void;
  setInstitusiList: React.Dispatch<React.SetStateAction<Institusi[]>>;
}

const InstitusiContext = createContext<InstitusiContextType | undefined>(undefined);

export function InstitusiProvider({ children }: { children: ReactNode }) {
  const [institusiList, setInstitusiList] = useState<Institusi[]>(() => {
    const saved = localStorage.getItem('institusi_data');
    const version = localStorage.getItem('institusi_data_version');
    
    // Filter function to ensure only TKJ schools are kept
    const filterTKJ = (data: Institusi[]) => {
      return data.filter(inst => {
        // Universitas / PTN / PTS biasanya tidak punya 'jurusan' dengan format SMK, 
        // tapi jika ingin di-keep, bisa diatur. Asumsinya MikroTik Academy fokus ke SMK/Kampus.
        // Jika Universitas tetap diizinkan tanpa filter jurusan, beri pengecualian.
        if (inst.jenis === 'Universitas') return true;
        
        // Untuk SMK, wajib punya jurusan TKJ
        if (!inst.jurusan || inst.jurusan.length === 0) return false;
        
        return inst.jurusan.some(j => {
          const namaJurusan = j.nama.toLowerCase();
          return namaJurusan.includes('tkj') || 
                 namaJurusan.includes('teknik komputer dan jaringan') ||
                 namaJurusan.includes('sistem informasi') || 
                 namaJurusan.includes('informatika');
        });
      });
    };

    if (saved && version === '2.3') {
      return JSON.parse(saved);
    }
    
    return filterTKJ(initialData as Institusi[]);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<KategoriInstitusi>('Semua');
  const [filterStatus, setFilterStatus] = useState<StatusKerjasama | 'Semua'>('Semua');
  const [filterKota, setFilterKota] = useState<string>('Semua');
  const [activeInstitusiId, setActiveInstitusiId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('institusi_data', JSON.stringify(institusiList));
    localStorage.setItem('institusi_data_version', '2.3');
  }, [institusiList]);

  const updateStatus = (id: string, newStatus: StatusKerjasama) => {
    setInstitusiList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status_kerjasama: newStatus } : item
      )
    );
  };

  const filteredInstitusi = institusiList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.kota.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesKategori = true;
    if (filterKategori === 'SMK') {
      matchesKategori = item.jenis === 'SMK';
    } else if (filterKategori === 'PTN') {
      matchesKategori = item.jenis === 'Universitas' && item.status_kepemilikan === 'Negeri';
    } else if (filterKategori === 'PTS') {
      matchesKategori = item.jenis === 'Universitas' && item.status_kepemilikan === 'Swasta';
    }

    const matchesStatus = filterStatus === 'Semua' || item.status_kerjasama === filterStatus;
    const matchesKota = filterKota === 'Semua' || item.kota === filterKota;
    
    return matchesSearch && matchesKategori && matchesStatus && matchesKota;
  });

  return (
    <InstitusiContext.Provider
      value={{
        institusiList,
        updateStatus,
        searchTerm,
        setSearchTerm,
        filterKategori,
        setFilterKategori,
        filterStatus,
        setFilterStatus,
        filterKota,
        setFilterKota,
        filteredInstitusi,
        activeInstitusiId,
        setActiveInstitusiId,
        setInstitusiList
      }}
    >
      {children}
    </InstitusiContext.Provider>
  );
}

export function useInstitusi() {
  const context = useContext(InstitusiContext);
  if (context === undefined) {
    throw new Error('useInstitusi must be used within a InstitusiProvider');
  }
  return context;
}
