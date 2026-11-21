import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth';
import { AppShell } from './components/AppShell';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Assistant from './pages/Assistant';
import Personal from './pages/Personal';
import Business from './pages/Business';
import Lensiyana from './pages/Lensiyana';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import More from './pages/More';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="personal" element={<Personal />} />
              <Route path="business" element={<Business />} />
              <Route path="lensiyana" element={<Lensiyana />} />
              <Route path="finance" element={<Finance />} />
              <Route path="settings" element={<Settings />} />
              <Route path="more" element={<More />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
