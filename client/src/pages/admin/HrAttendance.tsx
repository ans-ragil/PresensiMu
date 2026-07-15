import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Skeleton,
  InputAdornment,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import HrPageContainer from '../../components/hr/HrPageContainer';
import { attendanceApi, employeeApi, shiftApi, divisionApi } from '../../services/hrApi';
import type { Attendance, User, Shift } from '../../types';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  HADIR: 'success',
  TERLAMBAT: 'warning',
  PULANG_CEPAT: 'warning',
  ALPHA: 'error',
  CUTI: 'info',
  IZIN: 'info',
  WFH: 'info',
};

const STATUS_LABELS: Record<string, string> = {
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  PULANG_CEPAT: 'Pulang Cepat',
  ALPHA: 'Alpha',
  CUTI: 'Cuti',
  IZIN: 'Izin',
  WFH: 'WFH',
};

function formatTime(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function calcDuration(clockIn: string | null, clockOut: string | null) {
  if (!clockIn || !clockOut) return '-';
  const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}j ${m}m`;
}

function parseLocation(loc: string | null) {
  if (!loc) return null;
  try {
    const parsed = JSON.parse(loc);
    return { lat: parsed.lat || parsed.latitude, lng: parsed.lng || parsed.longitude };
  } catch {
    return null;
  }
}

export default function HrAttendance() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDivisi, setFilterDivisi] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [employees, setEmployees] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; nama: string }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Attendance | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attRes, empRes, divRes, shiftRes] = await Promise.all([
        attendanceApi.list(filterDate, filterDate),
        employeeApi.list({ limit: 200 }),
        divisionApi.list(),
        shiftApi.list(),
      ]);
      setRecords(attRes.data.data);
      setEmployees(empRes.data.data.employees);
      setDivisions(divRes.data.data);
      setShifts(shiftRes.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const enriched = records
    .map((r) => ({
      ...r,
      employee: employees.find((e) => e.id === r.userId) || r.user,
    }))
    .filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.employee?.nama?.toLowerCase().includes(q) && !r.employee?.email?.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterDivisi !== 'all' && r.employee?.divisiId !== filterDivisi) return false;
      if (filterShift !== 'all' && r.employee?.shiftId !== filterShift) return false;
      return true;
    });

  const paged = enriched.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <HrPageContainer title="Monitoring Absensi" subtitle="Pantau seluruh data absensi karyawan">
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Tanggal"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Cari Karyawan"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">Semua</MenuItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Divisi"
                value={filterDivisi}
                onChange={(e) => { setFilterDivisi(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">Semua</MenuItem>
                {divisions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.nama}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Shift"
                value={filterShift}
                onChange={(e) => { setFilterShift(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">Semua</MenuItem>
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.nama}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: enriched.length, color: '#6366f1' },
          { label: 'Hadir', count: enriched.filter((r) => r.status === 'HADIR').length, color: '#22c55e' },
          { label: 'Terlambat', count: enriched.filter((r) => r.status === 'TERLAMBAT').length, color: '#f59e0b' },
          { label: 'Alpha', count: enriched.filter((r) => r.status === 'ALPHA').length, color: '#ef4444' },
          { label: 'Cuti/Izin', count: enriched.filter((r) => r.status === 'CUTI' || r.status === 'IZIN').length, color: '#3b82f6' },
        ].map((s) => (
          <Box
            key={s.label}
            sx={{
              flex: 1,
              minWidth: 120,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
              {loading ? '-' : s.count}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Durasi</TableCell>
                <TableCell>Lokasi</TableCell>
                <TableCell>Selfie</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Tidak ada data absensi</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 13 }}>
                          {row.employee?.nama?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.employee?.nama || '-'}</Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.employee?.divisi || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatTime(row.clockIn)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatTime(row.clockOut)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{calcDuration(row.clockIn, row.clockOut)}</Typography>
                    </TableCell>
                    <TableCell>
                      {parseLocation(row.lokasiIn) ? (
                        <IconButton
                          size="small"
                          href={`https://www.google.com/maps?q=${parseLocation(row.lokasiIn)!.lat},${parseLocation(row.lokasiIn)!.lng}`}
                          target="_blank"
                          sx={{ color: '#3b82f6' }}
                        >
                          <LocationIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.fotoIn ? (
                        <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                          <ImageIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[row.status] || row.status}
                        color={STATUS_COLORS[row.status] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => { setSelected(row); setDetailOpen(true); }}
                        sx={{ color: '#6366f1' }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={enriched.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Baris:"
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Detail Absensi</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Employee Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#6366f1', fontSize: 22 }}>
                  {selected.employee?.nama?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selected.employee?.nama}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{selected.employee?.email}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{selected.employee?.divisi || ''} &middot; {selected.employee?.jabatan || ''}</Typography>
                </Box>
              </Box>

              <Divider />

              {/* Status */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Status</Typography>
                  <Chip
                    label={STATUS_LABELS[selected.status] || selected.status}
                    color={STATUS_COLORS[selected.status] || 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tanggal</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {new Date(selected.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
              </Box>

              {/* Time */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Card sx={{ flex: 1, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TimeIcon sx={{ color: '#22c55e', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>Clock In</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#166534' }}>
                      {formatTime(selected.clockIn)}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TimeIcon sx={{ color: '#ef4444', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>Clock Out</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#991b1b' }}>
                      {formatTime(selected.clockOut)}
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TimeIcon sx={{ color: '#3b82f6', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>Durasi</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e40af' }}>
                      {calcDuration(selected.clockIn, selected.clockOut)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Location */}
              {selected.lokasiIn && parseLocation(selected.lokasiIn) && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Lokasi</Typography>
                  <Card
                    sx={{
                      mt: 0.5,
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#6366f1' },
                    }}
                    onClick={() => {
                      const loc = parseLocation(selected.lokasiIn);
                      if (loc) window.open(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`, '_blank');
                    }}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                      <LocationIcon sx={{ color: '#ef4444' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {parseLocation(selected.lokasiIn)!.lat.toFixed(6)}, {parseLocation(selected.lokasiIn)!.lng.toFixed(6)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6366f1' }}>Buka di Google Maps</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Selfie */}
              {selected.fotoIn && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Foto Selfie</Typography>
                  <Card sx={{ mt: 0.5 }}>
                    <Box
                      component="img"
                      src={selected.fotoIn}
                      alt="Selfie"
                      sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 1 }}
                    />
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </HrPageContainer>
  );
}
