import { useState } from 'react';
import { InstitusiProvider } from './context/InstitusiContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogProvider } from './context/LogContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import DashboardModal from './components/DashboardModal';
import UploadModal from './components/UploadModal';
import LoginScreen from './components/LoginScreen';
import ActivityLog from './components/ActivityLog';

function AppContent() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-white text-slate-900 font-sans">
      <Header 
        onOpenDashboard={() => setShowDashboard(true)} 
        onOpenUpload={() => setShowUpload(true)} 
        onOpenActivity={() => setShowActivity(true)}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Map />
      </main>

      {showDashboard && <DashboardModal onClose={() => setShowDashboard(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showActivity && <ActivityLog onClose={() => setShowActivity(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LogProvider>
        <InstitusiProvider>
          <AppContent />
        </InstitusiProvider>
      </LogProvider>
    </AuthProvider>
  );
}

export default App;
