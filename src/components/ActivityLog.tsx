import React from 'react';
import { X, Clock, Trash2, User } from 'lucide-react';
import { useLog } from '../context/LogContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ActivityLogProps {
  onClose: () => void;
}

export default function ActivityLog({ onClose }: ActivityLogProps) {
  const { logs, clearLogs } = useLog();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'sudah': return 'bg-green-100 text-green-700';
      case 'on_progress': return 'bg-yellow-100 text-yellow-700';
      case 'belum': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'sudah': return 'Sudah MoU';
      case 'on_progress': return 'On Progress';
      case 'belum': return 'Belum MoU';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Riwayat Aktivitas</h2>
            <p className="text-sm text-slate-500 mt-1">Lacak perubahan status kerjasama secara real-time</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clearLogs}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Bersihkan Riwayat"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Clock size={48} className="mb-4 opacity-50" />
              <p>Belum ada aktivitas yang terekam.</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {logs.map((log, i) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    <User size={16} />
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{log.userName}</span>
                      <time className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: id })}
                      </time>
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      Mengubah status <span className="font-semibold text-slate-700">{log.institusiNama}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs font-medium">
                      <span className={`px-2 py-1 rounded ${getStatusColor(log.oldStatus)}`}>
                        {getStatusLabel(log.oldStatus)}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className={`px-2 py-1 rounded shadow-sm ${getStatusColor(log.newStatus)}`}>
                        {getStatusLabel(log.newStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
