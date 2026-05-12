import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { AddSubscription } from './pages/AddSubscription';
import { SubscriptionDetail } from './pages/SubscriptionDetail';
import { CalendarView } from './pages/CalendarView';
import { Accounts } from './pages/Accounts';
import { PaymentMethods } from './pages/PaymentMethods';
import { Alerts } from './pages/Alerts';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="subtrack-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/subscription/:id" element={<ProtectedRoute><SubscriptionDetail /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddSubscription /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}