import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LogEntry {
  id: string;
  userName: string;
  institusiNama: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (userName: string, institusiNama: string, oldStatus: string, newStatus: string) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const savedLogs = localStorage.getItem('crm_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    localStorage.setItem('crm_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (userName: string, institusiNama: string, oldStatus: string, newStatus: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      userName,
      institusiNama,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    };
    
    setLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => {
    if(window.confirm('Yakin ingin menghapus seluruh riwayat aktivitas?')) {
      setLogs([]);
    }
  };

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};
