import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useInstitusi } from '../context/InstitusiContext';
import type { Institusi, StatusKerjasama } from '../context/InstitusiContext';
import { useAuth } from '../context/AuthContext';
import { useLog } from '../context/LogContext';
import { Phone, User, BookOpen } from 'lucide-react';

// Setup custom marker icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  sudah: createIcon('#22c55e'), // green-500
  on_progress: createIcon('#eab308'), // yellow-500
  belum: createIcon('#ef4444') // red-500
};

// Component to handle map zooming when a sidebar item is clicked
function MapController({ activeId, institusiList }: { activeId: string | null, institusiList: Institusi[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (activeId) {
      const active = institusiList.find(i => i.id === activeId);
      if (active) {
        map.flyTo([active.lat, active.lng], 15, { duration: 1.5 });
      }
    }
  }, [activeId, map, institusiList]);

  return null;
}

export default function Map() {
  const { filteredInstitusi, activeInstitusiId, updateStatus } = useInstitusi();
  const { user } = useAuth();
  const { addLog } = useLog();

  const handleStatusChange = (institusi: Institusi, newStatus: StatusKerjasama) => {
    if (institusi.status_kerjasama === newStatus) return;
    updateStatus(institusi.id, newStatus);
    if (user) {
      addLog(user.name, institusi.nama, institusi.status_kerjasama, newStatus);
    }
  };

  return (
    <div className="flex-1 relative z-0">
      <MapContainer 
        center={[-7.5, 112.5]} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController activeId={activeInstitusiId} institusiList={filteredInstitusi} />

        {filteredInstitusi.map(institusi => (
          <Marker 
            key={institusi.id} 
            position={[institusi.lat, institusi.lng]}
            icon={icons[institusi.status_kerjasama]}
          >
            <Popup className="custom-popup" maxWidth={350}>
              <div className="p-1">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <h3 className="font-bold text-slate-800 text-sm m-0 leading-tight hover:text-blue-600 transition-colors">
                    <a 
                      href={institusi.jenis === 'Universitas' 
                        ? `https://pddikti.kemdikbud.go.id/search/${encodeURIComponent(institusi.nama)}`
                        : `https://dapo.kemdikbud.go.id/pencarian?q=${encodeURIComponent(institusi.nama)}`
                      }
                      target="_blank" 
                      rel="noopener noreferrer"
                      title={`Cari data resmi ${institusi.nama} di ${institusi.jenis === 'Universitas' ? 'PDDikti' : 'Dapodik Kemdikbud'}`}
                      className="underline decoration-blue-200 hover:decoration-blue-600"
                    >
                      {institusi.nama}
                    </a>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-0 line-clamp-2">
                    {institusi.alamat}
                  </p>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-xs">
                    <User size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-700">{institusi.kepala_sekolah.nama} (Kepsek)</div>
                      <div className="text-slate-500">{institusi.kepala_sekolah.hp} | {institusi.kepala_sekolah.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs">
                    <Phone size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-700">Kontak Utama</div>
                      <div className="text-slate-500">{institusi.kontak.telepon} | {institusi.kontak.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <BookOpen size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-700">Jurusan & Kajur</div>
                      {institusi.jurusan.map((j, idx) => (
                        <div key={idx} className="mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <div className="font-semibold">{j.nama}</div>
                          <div className="text-slate-500">{j.kajur.nama} ({j.kajur.hp})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Ubah Status Kerjasama</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button 
                      onClick={() => handleStatusChange(institusi, 'sudah')}
                      className={`text-xs py-1.5 px-1 rounded font-medium transition-colors ${
                        institusi.status_kerjasama === 'sudah' 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      Sudah MoU
                    </button>
                    <button 
                      onClick={() => handleStatusChange(institusi, 'on_progress')}
                      className={`text-xs py-1.5 px-1 rounded font-medium transition-colors ${
                        institusi.status_kerjasama === 'on_progress' 
                          ? 'bg-yellow-500 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-700'
                      }`}
                    >
                      On Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(institusi, 'belum')}
                      className={`text-xs py-1.5 px-1 rounded font-medium transition-colors ${
                        institusi.status_kerjasama === 'belum' 
                          ? 'bg-red-500 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
                      }`}
                    >
                      Belum MoU
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
