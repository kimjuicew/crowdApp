import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/crowd/LoginPage';
import { UserDashboard } from './components/crowd/UserDashboard';
import { LocationDetail } from './components/crowd/LocationDetail';
import { UserProfile } from './components/crowd/UserProfile';
import { EditProfile } from './components/crowd/EditProfile';
import { AdminDashboard } from './components/crowd/AdminDashboard';
import { RealTimeSeatStatus } from './components/crowd/RealTimeSeatStatus';
import { Events } from './components/crowd/Events';
import { NotificationSettings } from './components/crowd/NotificationSettings';
import { LanguageSettings } from './components/crowd/LanguageSettings';
import { ThemeSettings } from './components/crowd/ThemeSettings';
import { SupportChat } from './components/crowd/SupportChat';
import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import type { UserRole } from './data/mockData';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Load user session from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserId && storedUserRole) {
      setUserId(storedUserId);
      setUserRole(storedUserRole as UserRole);
    }
  }, []);

  const handleLogin = (id: string, role: UserRole) => {
    setUserId(id);
    setUserRole(role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: userId ? (
        userRole === 'admin' ? (
          <Navigate to="/admin" replace />
        ) : (
          <Navigate to="/dashboard" replace />
        )
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/login',
      element: userId ? (
        <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />
      ) : (
        <LoginPage onLogin={handleLogin} />
      ),
    },
    {
      path: '/dashboard',
      element: userId && userRole === 'user' ? (
        <UserDashboard userId={userId} onLogout={handleLogout} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/location/:id',
      element: userId ? <LocationDetail /> : <Navigate to="/login" replace />,
    },
    {
      path: '/profile',
      element: userId && userRole === 'user' ? (
        <UserProfile userId={userId} onLogout={handleLogout} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/profile/edit',
      element: userId && userRole === 'user' ? (
        <EditProfile userId={userId} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/profile/notifications',
      element: userId && userRole === 'user' ? (
        <NotificationSettings userId={userId} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/profile/language',
      element: userId ? <LanguageSettings /> : <Navigate to="/login" replace />,
    },
    {
      path: '/profile/theme',
      element: userId ? <ThemeSettings /> : <Navigate to="/login" replace />,
    },
    {
      path: '/profile/support',
      element: userId && userRole === 'user' ? (
        <SupportChat userId={userId} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/admin',
      element: userId && userRole === 'admin' ? (
        <AdminDashboard userId={userId} onLogout={handleLogout} />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '/seats',
      element: <RealTimeSeatStatus />,
    },
    {
      path: '/events',
      element: userId ? <Events /> : <Navigate to="/login" replace />,
    },
  ]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocationProvider>
          <RouterProvider router={router} />
          <Toaster />
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}