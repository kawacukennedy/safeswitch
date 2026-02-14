import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import DailyGlitch from './pages/DailyGlitch';
import Feed from './pages/Feed';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/settings/Settings';
import AccountManagement from './pages/settings/AccountManagement';
import BlockedUsers from './pages/settings/BlockedUsers';
import Notifications from './pages/settings/Notifications';
import Legal from './pages/settings/Legal';
import AuditHistory from './pages/history/AuditHistory';
import AuraHistory from './pages/history/AuraHistory';
import ReportStatus from './pages/history/ReportStatus';
import WeeklyRecap from './pages/recap/WeeklyRecap';
import Maintenance from './pages/static/Maintenance';
import Suspension from './pages/static/Suspension';
import Offline from './pages/static/Offline';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return <Offline />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App Routes (with Navigation) */}
        <Route element={<AppLayout />}>
          <Route path="/daily-glitch" element={<DailyGlitch />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Settings Module */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/account" element={<AccountManagement />} />
        <Route path="/settings/blocked" element={<BlockedUsers />} />
        <Route path="/settings/notifications" element={<Notifications />} />
        <Route path="/settings/privacy" element={<Legal type="privacy" />} />
        <Route path="/settings/terms" element={<Legal type="terms" />} />

        {/* History Module */}
        <Route path="/history/audit" element={<AuditHistory />} />
        <Route path="/history/aura" element={<AuraHistory />} />
        <Route path="/history/reports" element={<ReportStatus />} />

        {/* Standalone Pages */}
        <Route path="/recap" element={<WeeklyRecap />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/suspended" element={<Suspension />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
