import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { ModelGovernancePage } from './pages/ModelGovernancePage';
import { ReportsPage } from './pages/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';

// Map URL paths to tab IDs and vice-versa
const PATH_TO_TAB = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/map': 'map',
  '/projects': 'projects',
  '/alerts': 'alerts',
  '/interventions': 'interventions',
  '/reports': 'reports',
  '/governance': 'governance',
};

const TAB_TO_PATH = {
  'dashboard': '/',
  'map': '/map',
  'projects': '/projects',
  'alerts': '/alerts',
  'interventions': '/interventions',
  'reports': '/reports',
  'governance': '/governance',
  'project-detail': '/projects', // detail shares the projects path
};

function getTabFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return PATH_TO_TAB[path] || 'dashboard';
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTabState] = useState(getTabFromPath);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // Wrapper that also updates the browser URL
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const targetPath = TAB_TO_PATH[tab] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  // Handle browser back / forward buttons
  useEffect(() => {
    const onPopState = (e) => {
      const tab = e.state?.tab || getTabFromPath();
      setActiveTabState(tab);
      if (tab !== 'project-detail') setSelectedProjectId(null);
    };
    window.addEventListener('popstate', onPopState);
    // Replace current history entry with tab info so first back works
    window.history.replaceState({ tab: activeTab }, '', window.location.pathname);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAlertCount = async () => {
    try {
      const activeAlerts = await api.getAlerts('ACTIVE');
      setActiveAlertsCount(activeAlerts.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlertCount();
      const interval = setInterval(fetchAlertCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setActiveTab('project-detail');
  };

  const handleNavigateReport = (id) => {
    setSelectedProjectId(id);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={activeAlertsCount}
      />

      <div className="flex-1 flex">
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'project-detail') setSelectedProjectId(null);
            }}
            alertCount={activeAlertsCount}
          />
        </div>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onSelectProject={handleSelectProject}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'map' && (
            <RiskMapPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'project-detail' && selectedProjectId && (
            <ProjectDetailPage
              projectId={selectedProjectId}
              onBack={() => setActiveTab('projects')}
              onNavigateReport={handleNavigateReport}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'interventions' && (
            <InterventionsPage onSelectProject={handleSelectProject} />
          )}

          {activeTab === 'governance' && (
            <ModelGovernancePage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
