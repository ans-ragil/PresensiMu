import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Chip,
  Snackbar,
  Alert,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as CsvIcon,
} from '@mui/icons-material';
import HrPageContainer from '../../components/hr/HrPageContainer';
import { reportApi, employeeApi } from '../../services/hrApi';
import type { User, DailyReport } from '../../types';

const REPORT_TABS = [
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Per Karyawan', value: 'employee' },
  { label: 'Cuti', value: 'leave' },
];

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  HADIR: 'success',
  TERLAMBAT: 'warning',
  PULANG_CEPAT: 'warning',
  ALPHA: 'error',
  CUTI: 'info',
  IZIN: 'info',
  WFH: 'info',
};

function formatTime(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function HrReports() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Filter states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Report data
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    employeeApi.list({ limit: 200 }).then((res) => setEmployees(res.data.data.employees)).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const currentTab = REPORT_TABS[tab].value;
      if (currentTab === 'daily') {
        const res = await reportApi.daily(date);
        setDailyData(res.data.data);
        setReportData(null);
      } else if (currentTab === 'weekly') {
        const res = await reportApi.weekly(startDate, endDate);
        setReportData(res.data.data);
        setDailyData(null);
      } else if (currentTab === 'monthly') {
        const res = await reportApi.monthly(month, year);
        setReportData(res.data.data);
        setDailyData(null);
      } else if (currentTab === 'employee' && selectedUser) {
        const res = await reportApi.employee(selectedUser.id, startDate, endDate);
        setReportData(res.data.data);
        setDailyData(null);
      } else if (currentTab === 'leave') {
        const res = await reportApi.leave(startDate, endDate);
        setReportData(res.data.data);
        setDailyData(null);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [tab, date, startDate, endDate, month, year, selectedUser]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      const currentTab = REPORT_TABS[tab].value;
      const params: Record<string, string> = { format, type: currentTab };
      if (currentTab === 'daily') params.date = date;
      else if (currentTab === 'weekly') { params.startDate = startDate; params.endDate = endDate; }
      else if (currentTab === 'monthly') { params.month = String(month); params.year = String(year); }
      else if (currentTab === 'employee' && selectedUser) { params.userId = selectedUser.id; params.startDate = startDate; params.endDate = endDate; }
      else if (currentTab === 'leave') { params.startDate = startDate; params.endDate = endDate; }

      const res = await reportApi.export(params);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${currentTab}-${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(`Export ${format.toUpperCase()} berhasil`, 'success');
    } catch {
      showToast('Gagal export', 'error');
    }
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  const currentTab = REPORT_TABS[tab].value;

  return (
    <HrPageContainer
      title="Laporan"
      subtitle="Lihat dan export laporan absensi, keterlambatan, cuti, dan alpha"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => handleExport('pdf')}>PDF</Button>
          <Button variant="outlined" startIcon={<ExcelIcon />} onClick={() => handleExport('xlsx')}>Excel</Button>
          <Button variant="outlined" startIcon={<CsvIcon />} onClick={() => handleExport('csv')}>CSV</Button>
        </Box>
      }
    >
      {/* Tabs & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            {REPORT_TABS.map((t) => (
              <Tab key={t.value} label={<Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>{t.label}</Typography>} sx={{ minHeight: 36 }} />
            ))}
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {(currentTab === 'daily') && (
              <TextField size="small" label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            )}
            {(currentTab === 'weekly' || currentTab === 'employee' || currentTab === 'leave') && (
              <>
                <TextField size="small" label="Dari" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField size="small" label="Sampai" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </>
            )}
            {currentTab === 'monthly' && (
              <>
                <TextField size="small" select label="Bulan" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} sx={{ width: 150 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' })}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField size="small" type="number" label="Tahun" value={year} onChange={(e) => setYear(parseInt(e.target.value))} sx={{ width: 100 }} />
              </>
            )}
            {currentTab === 'employee' && (
              <Autocomplete
                size="small"
                options={employees}
                getOptionLabel={(opt) => opt.nama}
                value={selectedUser}
                onChange={(_, val) => setSelectedUser(val)}
                renderInput={(params) => <TextField {...params} label="Pilih Karyawan" placeholder="Cari..." />}
                sx={{ minWidth: 250 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {dailyData && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Karyawan', value: dailyData.totalEmployees, color: '#6366f1' },
            { label: 'Hadir', value: dailyData.hadir, color: '#22c55e' },
            { label: 'Terlambat', value: dailyData.terlambat, color: '#f59e0b' },
            { label: 'Alpha', value: dailyData.alpha, color: '#ef4444' },
            { label: 'Cuti', value: dailyData.cuti, color: '#3b82f6' },
            { label: 'Izin', value: dailyData.izin, color: '#8b5cf6' },
          ].map((s) => (
            <Card key={s.label} sx={{ flex: 1, minWidth: 120 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: s.color }}>{loading ? '-' : s.value}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Report Data Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {currentTab === 'daily' && (
                  <>
                    <TableCell>Nama</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Clock In</TableCell>
                    <TableCell>Clock Out</TableCell>
                    <TableCell>Keterangan</TableCell>
                  </>
                )}
                {currentTab === 'weekly' && (
                  <>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Hadir</TableCell>
                    <TableCell>Terlambat</TableCell>
                    <TableCell>Alpha</TableCell>
                    <TableCell>Cuti</TableCell>
                    <TableCell>Izin</TableCell>
                  </>
                )}
                {currentTab === 'monthly' && (
                  <>
                    <TableCell>Periode</TableCell>
                    <TableCell>Total Karyawan</TableCell>
                    <TableCell>Hadir</TableCell>
                    <TableCell>Terlambat</TableCell>
                    <TableCell>Alpha</TableCell>
                    <TableCell>Cuti</TableCell>
                    <TableCell>Izin</TableCell>
                  </>
                )}
                {currentTab === 'employee' && reportData && (
                  <>
                    <TableCell>Karyawan</TableCell>
                    <TableCell>Total Hari</TableCell>
                    <TableCell>Hadir</TableCell>
                    <TableCell>Terlambat</TableCell>
                    <TableCell>Alpha</TableCell>
                    <TableCell>Cuti</TableCell>
                    <TableCell>Izin</TableCell>
                  </>
                )}
                {currentTab === 'leave' && (
                  <>
                    <TableCell>Karyawan</TableCell>
                    <TableCell>Tipe Izin</TableCell>
                    <TableCell>Dari</TableCell>
                    <TableCell>Sampai</TableCell>
                    <TableCell>Status</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : currentTab === 'daily' && dailyData ? (
                dailyData.details.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">Tidak ada data</Typography></TableCell></TableRow>
                ) : (
                  dailyData.details.map((d) => (
                    <TableRow key={d.userId} hover>
                      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.nama}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ color: '#64748b' }}>{d.email}</Typography></TableCell>
                      <TableCell><Chip label={d.status} color={STATUS_COLORS[d.status]} size="small" variant="outlined" /></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatTime(d.clockIn)}</Typography></TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{formatTime(d.clockOut)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{d.keterangan || '-'}</Typography></TableCell>
                    </TableRow>
                  ))
                )
              ) : reportData ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {typeof reportData === 'object' ? JSON.stringify(reportData, null, 2).substring(0, 500) : 'Data loaded'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      {currentTab === 'employee' && !selectedUser ? 'Pilih karyawan terlebih dahulu' : 'Pilih filter dan klik muat data'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </HrPageContainer>
  );
}
