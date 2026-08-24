import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Briefcase } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Sales Representative');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim(), role);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 bg-opacity-95 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 opacity-20 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600 opacity-20 blur-[100px]"></div>

      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CRM Academy</h1>
          <p className="text-blue-200 mt-1">Sistem Manajemen Kerjasama</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama Anda..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Peran (Role)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase size={18} className="text-slate-400" />
              </div>
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="Sales Representative">Sales Representative</option>
                <option value="Regional Manager">Regional Manager</option>
                <option value="Academy Coordinator">Academy Coordinator</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Masuk ke Dashboard
          </button>
        </form>
        
        <p className="text-center text-slate-400 text-xs mt-6">
          &copy; 2026 MikroTik Academy CRM. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
