import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  HolidayVillage as HolidayIcon,
  AccessTime as TimeIcon,
  MyLocation as GpsIcon,
} from '@mui/icons-material';
import HrPageContainer from '../../components/hr/HrPageContainer';
import { locationApi, holidayApi, settingsApi } from '../../services/hrApi';
import type { Holiday } from '../../types';

const SETTINGS_TABS = [
  { label: 'Profil Perusahaan', value: 'company' },
  { label: 'Lokasi Kantor', value: 'location' },
  { label: 'Jam Kerja', value: 'worktime' },
  { label: 'SMTP / Email', value: 'smtp' },
  { label: 'Logo', value: 'logo' },
  { label: 'Hari Libur', value: 'holiday' },
];

export default function HrSettings() {
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Company profile
  const [companyName, setCompanyName] = useState('PT PresensiMu Indonesia');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // Location
  const [locName, setLocName] = useState('');
  const [locLat, setLocLat] = useState('');
  const [locLng, setLocLng] = useState('');
  const [locRadius, setLocRadius] = useState(500);

  // Work time
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [tolerance, setTolerance] = useState(30);

  // SMTP
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');

  // Logo
  const [logo, setLogo] = useState<string | null>(null);

  // Holidays
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayNama, setHolidayNama] = useState('');
  const [holidayTanggal, setHolidayTanggal] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [locRes, holRes, profileRes, workTimeRes, smtpRes, logoRes] = await Promise.all([
        locationApi.get().catch(() => ({ data: { data: null } })),
        holidayApi.list(),
        settingsApi.getCompanyProfile().catch(() => ({ data: { data: { name: '', address: '', phone: '', email: '' } } })),
        settingsApi.getWorkTime().catch(() => ({ data: { data: { workStart: '08:00', workEnd: '17:00', toleranceMinutes: 30 } } })),
        settingsApi.getSmtp().catch(() => ({ data: { data: { host: '', port: '587', user: '', pass: '', from: '' } } })),
        settingsApi.getLogo().catch(() => ({ data: { data: { logo: '' } } })),
      ]);

      // Location
      if (locRes.data.data) {
        const loc = locRes.data.data;
        setLocName(loc.nama);
        setLocLat(String(loc.latitude));
        setLocLng(String(loc.longitude));
        setLocRadius(loc.radius);
      }

      // Holidays
      setHolidays(holRes.data.data);

      // Company profile
      const profile = profileRes.data.data;
      if (profile.name) setCompanyName(profile.name);
      if (profile.address) setCompanyAddress(profile.address);
      if (profile.phone) setCompanyPhone(profile.phone);
      if (profile.email) setCompanyEmail(profile.email);

      // Work time
      const wt = workTimeRes.data.data;
      setWorkStart(wt.workStart);
      setWorkEnd(wt.workEnd);
      setTolerance(wt.toleranceMinutes);

      // SMTP
      const smtp = smtpRes.data.data;
      setSmtpHost(smtp.host);
      setSmtpPort(smtp.port);
      setSmtpUser(smtp.user);
      setSmtpPass(smtp.pass);
      setSmtpFrom(smtp.from);

      // Logo
      if (logoRes.data.data.logo) setLogo(logoRes.data.data.logo);
    } catch {
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveLocation = async () => {
    try {
      await locationApi.set({
        nama: locName,
        latitude: parseFloat(locLat),
        longitude: parseFloat(locLng),
        radius: locRadius,
      });
      showToast('Lokasi kantor berhasil disimpan', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan lokasi', 'error');
    }
  };

  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocLat(String(pos.coords.latitude));
          setLocLng(String(pos.coords.longitude));
          showToast('Lokasi berhasil dideteksi', 'success');
        },
        () => showToast('Gagal mendeteksi lokasi', 'error')
      );
    }
  };

  const handleSaveHoliday = async () => {
    try {
      await holidayApi.create({ nama: holidayNama, tanggal: holidayTanggal });
      showToast('Hari libur berhasil ditambahkan', 'success');
      setHolidayDialogOpen(false);
      setHolidayNama('');
      setHolidayTanggal('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Hapus hari libur ini?')) return;
    try {
      await holidayApi.delete(id);
      showToast('Hari libur berhasil dihapus', 'success');
      fetchData();
    } catch {
      showToast('Gagal menghapus', 'error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setLogo(base64);
      try {
        await settingsApi.setLogo(base64);
        showToast('Logo berhasil disimpan', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Gagal menyimpan logo', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  const handleSaveCompanyProfile = async () => {
    try {
      await settingsApi.setCompanyProfile({ name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail });
      showToast('Profil perusahaan berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleSaveWorkTime = async () => {
    try {
      await settingsApi.setWorkTime({ workStart, workEnd, toleranceMinutes: tolerance });
      showToast('Jam kerja berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleSaveSmtp = async () => {
    try {
      await settingsApi.setSmtp({ host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass, from: smtpFrom });
      showToast('SMTP settings berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    }
  };

  return (
    <HrPageContainer title="Pengaturan" subtitle="Konfigurasi pengaturan perusahaan">
      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            {SETTINGS_TABS.map((t) => (
              <Tab
                key={t.value}
                label={<Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>{t.label}</Typography>}
                sx={{ minHeight: 40, py: 0 }}
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Company Profile */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#6366f1' }}><BusinessIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Profil Perusahaan</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Nama Perusahaan" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Email Perusahaan" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="No. Telepon" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={3} label="Alamat" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompanyProfile}>
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#ef4444' }}><LocationIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Lokasi Kantor</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Nama Lokasi" value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Contoh: Kantor Pusat" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Latitude" value={locLat} onChange={(e) => setLocLat(e.target.value)} type="number" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Longitude" value={locLng} onChange={(e) => setLocLng(e.target.value)} type="number" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Radius (meter)"
                  value={locRadius}
                  onChange={(e) => setLocRadius(parseInt(e.target.value))}
                  type="number"
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">meter</InputAdornment>,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<GpsIcon />} onClick={handleGetMyLocation}>
                    Ambil Lokasi Saya
                  </Button>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveLocation}>
                    Simpan Lokasi
                  </Button>
                </Box>
              </Grid>
              {locLat && locLng && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 1, borderRadius: 2 }}>
                    <iframe
                      src={`https://www.google.com/maps?q=${locLat},${locLng}&z=15&output=embed`}
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: 8 }}
                      loading="lazy"
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Work Time */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#f59e0b' }}><TimeIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Jam Kerja</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Jam Masuk"
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Jam Pulang"
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Toleransi Keterlambatan"
                  type="number"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">menit</InputAdornment>,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveWorkTime}>
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* SMTP */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#3b82f6' }}><EmailIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Pengaturan SMTP</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="SMTP Host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="SMTP Port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Username" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Password" type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Email Pengirim" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder="noreply@presensimu.com" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSmtp}>
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Logo */}
      {tab === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#8b5cf6' }}><ImageIcon /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Logo Perusahaan</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {logo ? (
                <Box
                  component="img"
                  src={logo}
                  alt="Logo"
                  sx={{ maxWidth: 300, maxHeight: 200, objectFit: 'contain', borderRadius: 2, border: '1px solid #e2e8f0' }}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 150,
                    border: '2px dashed #e2e8f0',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">Belum ada logo</Typography>
                </Box>
              )}
              <Button variant="outlined" component="label">
                Upload Logo
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Holidays */}
      {tab === 5 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#22c55e' }}><HolidayIcon /></Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Hari Libur</Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setHolidayDialogOpen(true)}>
                Tambah
              </Button>
            </Box>
            {holidays.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
                <HolidayIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">Belum ada hari libur</Typography>
              </Box>
            ) : (
              <List>
                {holidays.map((h) => (
                  <ListItem key={h.id} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 1 }}>
                    <ListItemText
                      primary={<Typography variant="body1" sx={{ fontWeight: 600 }}>{h.nama}</Typography>}
                      secondary={
                        <Typography variant="caption">
                          {new Date(h.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="error" onClick={() => handleDeleteHoliday(h.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Tambah Hari Libur</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField fullWidth label="Nama Hari Libur" value={holidayNama} onChange={(e) => setHolidayNama(e.target.value)} />
            <TextField fullWidth label="Tanggal" type="date" value={holidayTanggal} onChange={(e) => setHolidayTanggal(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveHoliday}>Simpan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </HrPageContainer>
  );
}
