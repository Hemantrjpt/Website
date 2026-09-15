import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ScriptDetail from './pages/ScriptDetail';
import Executors from './pages/Executors';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminScripts from './pages/admin/AdminScripts';
import AdminExecutors from './pages/admin/AdminExecutors';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminActivity from './pages/admin/AdminActivity';
import AdminBackups from './pages/admin/AdminBackups';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scripts/:slug" element={<ScriptDetail />} />
      <Route path="/executors" element={<Executors />} />
      <Route path="/disclaimer" element={<Disclaimer />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="scripts" element={<AdminScripts />} />
        <Route path="executors" element={<AdminExecutors />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="backups" element={<AdminBackups />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
