import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeLayout from './components/EmployeeLayout';
import AdminLayout from './components/AdminLayout';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Attendance = lazy(() => import('./pages/Attendance'));
const History = lazy(() => import('./pages/History'));
const Schedule = lazy(() => import('./pages/Schedule'));
const LeaveRequest = lazy(() => import('./pages/LeaveRequest'));
const LeaveHistory = lazy(() => import('./pages/LeaveHistory'));
const Profile = lazy(() => import('./pages/Profile'));
const Notification = lazy(() => import('./pages/Notification'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const LeaveManagement = lazy(() => import('./pages/admin/LeaveManagement'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const ScheduleManagement = lazy(() => import('./pages/admin/ScheduleManagement'));
const EmployeeList = lazy(() => import('./pages/admin/EmployeeList'));
const LiveTracking = lazy(() => import('./pages/admin/LiveTracking'));
const CompanyLocation = lazy(() => import('./pages/admin/CompanyLocation'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const EmailSettings = lazy(() => import('./pages/admin/EmailSettings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Employee Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><EmployeeLayout><Dashboard /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><EmployeeLayout><Attendance /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><EmployeeLayout><History /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><EmployeeLayout><Schedule /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/leave-request" element={<ProtectedRoute><EmployeeLayout><LeaveRequest /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/leave-history" element={<ProtectedRoute><EmployeeLayout><LeaveHistory /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><EmployeeLayout><Profile /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/notification" element={<ProtectedRoute><EmployeeLayout><Notification /></EmployeeLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/leave-management" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><LeaveManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><AdminAttendance /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/schedule-management" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><ScheduleManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><EmployeeList /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/live-tracking" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><LiveTracking /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/company-location" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><CompanyLocation /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/email-settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout><EmailSettings /></AdminLayout></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
