import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 68;

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/admin/employees', label: 'Manajemen Karyawan', icon: <PeopleIcon /> },
  { path: '/admin/attendance', label: 'Absensi', icon: <AttendanceIcon /> },
  { path: '/admin/schedule', label: 'Jadwal Kerja', icon: <CalendarIcon /> },
  { path: '/admin/leave-management', label: 'Persetujuan Cuti', icon: <LeaveIcon /> },
  { path: '/admin/reports', label: 'Laporan', icon: <ReportIcon /> },
  { divider: true },
  { path: '/admin/live-tracking', label: 'Live Tracking', icon: <MapIcon /> },
  { path: '/admin/company-location', label: 'Lokasi Kantor', icon: <LocationIcon /> },
  { path: '/admin/email-settings', label: 'Pengaturan Email', icon: <EmailIcon /> },
];

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

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

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
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={0} color="error">
                <NotificationIcon fontSize="small" />
              </Badge>
            </IconButton>

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
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
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
