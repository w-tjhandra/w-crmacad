import { Building, CheckCircle2, Clock, XCircle, BarChart3, UploadCloud, History, LogOut } from 'lucide-react';
import { useInstitusi } from '../context/InstitusiContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenDashboard: () => void;
  onOpenUpload: () => void;
  onOpenActivity?: () => void;
}

export default function Header({ onOpenDashboard, onOpenUpload, onOpenActivity }: HeaderProps) {
  const { institusiList } = useInstitusi();
  const { user, logout } = useAuth();

  const total = institusiList.length;
  const sudahMoU = institusiList.filter(i => i.status_kerjasama === 'sudah').length;
  const onProgress = institusiList.filter(i => i.status_kerjasama === 'on_progress').length;
  const belumMoU = institusiList.filter(i => i.status_kerjasama === 'belum').length;

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-sm z-20 relative">
      <div className="flex items-center gap-2 text-blue-600">
        <Building size={24} />
        <h1 className="font-bold text-lg text-slate-800 hidden md:block">
          CRM Academy <span className="font-normal text-slate-500 text-sm ml-2">Peta Institusi Vokasi</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* Statistics hidden on very small screens */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium mr-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            <span className="font-bold">{total}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
            <CheckCircle2 size={16} className="text-green-500"/> <span>{sudahMoU}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
            <Clock size={16} className="text-yellow-500"/> <span>{onProgress}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 mr-2 pr-4 border-r border-slate-200">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</div>
          </div>
          <button 
            onClick={logout}
            className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenActivity && (
            <button 
              onClick={onOpenActivity}
              className="p-1.5 text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-blue-600 transition-colors"
              title="Riwayat Aktivitas"
            >
              <History size={18} />
            </button>
          )}
          <button 
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors hidden sm:flex"
            title="Upload CSV"
          >
            <UploadCloud size={16} />
          </button>
          <button 
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <BarChart3 size={16} /> <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>
      </div>
    </header>
  );
}
