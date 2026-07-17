import { Routes, Route, Navigate } from 'react-router-dom';

// We will use React.lazy for code splitting
import React, { Suspense } from 'react';
import { Spinner } from '@/components/ui';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterUserPage = React.lazy(() => import('./pages/RegisterUserPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const BookingConfirmPage = React.lazy(() => import('./pages/BookingConfirmPage'));
const BookingsPage = React.lazy(() => import('./pages/BookingsPage'));
const TrackingPage = React.lazy(() => import('./pages/TrackingPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const DriverRegisterPage = React.lazy(() => import('./pages/DriverRegisterPage'));
const DriverDashboardPage = React.lazy(() => import('./pages/DriverDashboardPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const AdminDriversPage = React.lazy(() => import('./pages/AdminDriversPage'));

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
    </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterUserPage />} />
        {/* Next.js used /register/user, redirect to /register */}
        <Route path="/register/user" element={<Navigate to="/register" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/booking-confirm" element={<BookingConfirmPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/track/:bookingId" element={<TrackingPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Driver Routes */}
        <Route path="/driver/register" element={<DriverRegisterPage />} />
        <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/drivers" element={<AdminDriversPage />} />
        
        {/* Redirects for legacy routes */}
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/driver/login" element={<Navigate to="/login?role=driver" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
