import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  Popover,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  HowToReg as AttendanceIcon,
  EventAvailable as LeaveIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountCircle,
  Map as MapIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Tune as TuneIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 68;

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { divider: true, label: 'HR Module' },
  { path: '/admin/hr/schedule', label: 'Jadwal Kerja', icon: <CalendarIcon /> },
  { path: '/admin/hr/attendance', label: 'Monitoring Absensi', icon: <AttendanceIcon /> },
  { path: '/admin/hr/leave', label: 'Persetujuan Cuti', icon: <LeaveIcon /> },
  { path: '/admin/hr/reports', label: 'Laporan', icon: <ReportIcon /> },
  { path: '/admin/hr/settings', label: 'Pengaturan', icon: <TuneIcon /> },
  { divider: true, label: 'Management' },
  { path: '/admin/employees', label: 'Manajemen Karyawan', icon: <PeopleIcon /> },
  { path: '/admin/live-tracking', label: 'Live Tracking', icon: <MapIcon /> },
  { path: '/admin/company-location', label: 'Lokasi Kantor', icon: <LocationIcon /> },
  { path: '/admin/email-settings', label: 'Pengaturan Email', icon: <EmailIcon /> },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
    }
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'HR': return 'Human Resources';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#e91e63';
      case 'HR': return '#9c27b0';
      case 'ADMIN': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1 : 2.5,
          py: 2,
          minHeight: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              PM
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                PresensiMu
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                Admin Panel
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle} size="small" sx={{ color: 'text.secondary' }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1.5, px: collapsed ? 0.5 : 1 }}>
        <List disablePadding>
          {menuItems.map((item, index) => {
            if ('divider' in item && item.divider) {
              return <Divider key={`div-${index}`} sx={{ my: 1, mx: collapsed ? 1 : 2 }} />;
            }
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }
                  }}
                  sx={{
                    minHeight: 42,
                    mx: collapsed ? 0.5 : 1,
                    mb: 0.25,
                    px: collapsed ? 1 : 2,
                    justifyContent: collapsed ? 'center' : 'initial',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: collapsed ? 0 : 36,
                      color: isActive ? 'white' : 'text.secondary',
                      justifyContent: 'center',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
            v1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              sx={{ color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
              onClick={(e) => setNotifAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationIcon fontSize="small" />
              </Badge>
            </IconButton>

            {/* Notification Popover */}
            <Popover
              open={Boolean(notifAnchor)}
              anchorEl={notifAnchor}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: { width: 360, maxHeight: 480, mt: 1, borderRadius: '12px', overflow: 'hidden' },
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Notifikasi</Typography>
                {unreadCount > 0 && (
                  <Button size="small" startIcon={<CheckIcon />} onClick={handleMarkAllAsRead}>
                    Tandai semua dibaca
                  </Button>
                )}
              </Box>
              <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                    <NotificationIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">Tidak ada notifikasi</Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <Box
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifAnchor(null);
                      }}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        bgcolor: n.isRead ? 'transparent' : '#f8f8ff',
                        '&:hover': { bgcolor: '#f1f5f9' },
                        display: 'flex',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ mt: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: n.isRead ? '#cbd5e1' : '#6366f1',
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 600, fontSize: '0.813rem' }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                          {new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Popover>

            {/* Profile */}
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                py: 0.5,
                px: 1,
                borderRadius: '8px',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                src={user?.foto || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getRoleBadgeColor(user?.role),
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {user?.nama?.charAt(0) || 'A'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.nama || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ color: getRoleBadgeColor(user?.role), fontWeight: 500 }}>
                  {getRoleLabel(user?.role)}
                </Typography>
              </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: { mt: 1, minWidth: 200, borderRadius: '12px' },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary={user?.nama}
                  secondary={user?.email}
                  slotProps={{
                    primary: { sx: { variant: 'body2', fontWeight: 600 } },
                    secondary: { sx: { variant: 'caption' } },
                  }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/hr/settings'); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/hr/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Pengaturan" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                <ListItemText primary="Keluar" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
