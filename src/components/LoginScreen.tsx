import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.trim() && password.trim()) {
      const success = login(username.trim(), password.trim());
      if (!success) {
        setError('Username atau password salah');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">CRM Academy</h1>
          <p className="text-gray-500 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Masuk
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 MikroTik Academy CRM
          </p>
        </div>
      </div>
    </div>
  );
}
