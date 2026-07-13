import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute, { isAdminRole } from './components/ProtectedRoute';
import { UserRole } from './contexts/AuthContext';
import EmployeeLayout from './components/EmployeeLayout';
import AdminLayout from './components/AdminLayout';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Employee pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Attendance = lazy(() => import('./pages/Attendance'));
const History = lazy(() => import('./pages/History'));
const Schedule = lazy(() => import('./pages/Schedule'));
const LeaveRequest = lazy(() => import('./pages/LeaveRequest'));
const LeaveHistory = lazy(() => import('./pages/LeaveHistory'));
const Profile = lazy(() => import('./pages/Profile'));
const Notification = lazy(() => import('./pages/Notification'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const LeaveManagement = lazy(() => import('./pages/admin/LeaveManagement'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const ScheduleManagement = lazy(() => import('./pages/admin/ScheduleManagement'));
const EmployeeList = lazy(() => import('./pages/admin/EmployeeList'));
const LiveTracking = lazy(() => import('./pages/admin/LiveTracking'));
const CompanyLocation = lazy(() => import('./pages/admin/CompanyLocation'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const EmailSettings = lazy(() => import('./pages/admin/EmailSettings'));

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'HR', 'SUPER_ADMIN'];

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (isAuthenticated) {
    return <Navigate to={isAdminRole(user?.role || 'EMPLOYEE') ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }
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
            <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeLayout><Dashboard /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/attendance" element={<ProtectedRoute><EmployeeLayout><Attendance /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/history" element={<ProtectedRoute><EmployeeLayout><History /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/schedule" element={<ProtectedRoute><EmployeeLayout><Schedule /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/leave-request" element={<ProtectedRoute><EmployeeLayout><LeaveRequest /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/leave-history" element={<ProtectedRoute><EmployeeLayout><LeaveHistory /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/profile" element={<ProtectedRoute><EmployeeLayout><Profile /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/notification" element={<ProtectedRoute><EmployeeLayout><Notification /></EmployeeLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><EmployeeList /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><AdminAttendance /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><ScheduleManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/leave-management" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><LeaveManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/live-tracking" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><LiveTracking /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/company-location" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><CompanyLocation /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/email-settings" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout><EmailSettings /></AdminLayout></ProtectedRoute>} />

            {/* Backward compatibility: old routes redirect */}
            <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/attendance" element={<Navigate to="/employee/attendance" replace />} />
            <Route path="/history" element={<Navigate to="/employee/history" replace />} />
            <Route path="/schedule" element={<Navigate to="/employee/schedule" replace />} />
            <Route path="/leave-request" element={<Navigate to="/employee/leave-request" replace />} />
            <Route path="/leave-history" element={<Navigate to="/employee/leave-history" replace />} />
            <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />
            <Route path="/notification" element={<Navigate to="/employee/notification" replace />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
