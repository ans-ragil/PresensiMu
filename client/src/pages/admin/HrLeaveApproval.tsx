import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Grid,
  Skeleton,
  Snackbar,
  Alert,
  Badge,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import HrPageContainer from '../../components/hr/HrPageContainer';
import { leaveApi } from '../../services/hrApi';
import type { LeaveRequest } from '../../types';

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CUTI_TAHUNAN: 'Cuti Tahunan',
  IZIN_SAKIT: 'Izin Sakit',
  IZIN_PRIBADI: 'Izin Pribadi',
  LIBUR_LOKAL: 'Libur Lokal',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
  return diff;
}

export default function HrLeaveApproval() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveApi.list();
      setLeaves(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const statusFilter = tab === 0 ? 'PENDING' : tab === 1 ? 'APPROVED' : tab === 2 ? 'REJECTED' : undefined;

  const filtered = leaves
    .filter((l) => statusFilter ? l.status === statusFilter : true)
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.user?.nama?.toLowerCase().includes(q) || l.user?.email?.toLowerCase().includes(q);
    });

  const counts = {
    PENDING: leaves.filter((l) => l.status === 'PENDING').length,
    APPROVED: leaves.filter((l) => l.status === 'APPROVED').length,
    REJECTED: leaves.filter((l) => l.status === 'REJECTED').length,
  };

  const handleAction = async () => {
    if (!selected || !actionDialog) return;
    setActionLoading(true);
    try {
      if (actionDialog === 'approve') {
        await leaveApi.approve(selected.id, catatan);
        showToast('Pengajuan cuti disetujui', 'success');
      } else {
        await leaveApi.reject(selected.id, catatan);
        showToast('Pengajuan cuti ditolak', 'success');
      }
      setActionDialog(null);
      setDetailOpen(false);
      setCatatan('');
      fetchLeaves();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memproses', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  return (
    <HrPageContainer title="Persetujuan Cuti" subtitle="Kelola pengajuan cuti dan izin karyawan">
      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ minHeight: 40 }}
            >
              <Tab
                label={
                  <Badge badgeContent={counts.PENDING} color="warning" max={99}>
                    <Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>Menunggu</Typography>
                  </Badge>
                }
                sx={{ minHeight: 40, py: 0 }}
              />
              <Tab
                label={<Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>Disetujui ({counts.APPROVED})</Typography>}
                sx={{ minHeight: 40, py: 0 }}
              />
              <Tab
                label={<Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>Ditolak ({counts.REJECTED})</Typography>}
                sx={{ minHeight: 40, py: 0 }}
              />
              <Tab
                label={<Typography variant="body2" sx={{ textTransform: 'none', fontWeight: 600 }}>Semua ({leaves.length})</Typography>}
                sx={{ minHeight: 40, py: 0 }}
              />
            </Tabs>
            <TextField
              size="small"
              placeholder="Cari karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                },
              }}
              sx={{ width: 250 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Karyawan</TableCell>
                <TableCell>Tipe Izin</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Durasi</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Catatan</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Tidak ada data pengajuan cuti</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 13 }}>
                          {leave.user?.nama?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{leave.user?.nama || '-'}</Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>{leave.user?.divisi || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={LEAVE_TYPE_LABELS[leave.tipeIzin] || leave.tipeIzin} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(leave.tanggalMulai)}</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>s/d {formatDate(leave.tanggalSelesai)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{calcDays(leave.tanggalMulai, leave.tanggalSelesai)} hari</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[leave.status]}
                        color={STATUS_COLORS[leave.status]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.catatanAdmin || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Lihat Detail">
                        <IconButton size="small" onClick={() => { setSelected(leave); setDetailOpen(true); }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {leave.status === 'PENDING' && (
                        <>
                          <Tooltip title="Setujui">
                            <IconButton size="small" color="success" onClick={() => { setSelected(leave); setActionDialog('approve'); setCatatan(''); }}>
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tolak">
                            <IconButton size="small" color="error" onClick={() => { setSelected(leave); setActionDialog('reject'); setCatatan(''); }}>
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Detail Pengajuan Cuti</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#6366f1', fontSize: 22 }}>
                  {selected.user?.nama?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selected.user?.nama}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{selected.user?.email}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{selected.user?.divisi || ''} &middot; {selected.user?.jabatan || ''}</Typography>
                </Box>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tipe Izin</Typography>
                  <Chip label={LEAVE_TYPE_LABELS[selected.tipeIzin] || selected.tipeIzin} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Status</Typography>
                  <Chip
                    label={STATUS_LABELS[selected.status]}
                    color={STATUS_COLORS[selected.status]}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tanggal Mulai</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{formatDate(selected.tanggalMulai)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tanggal Selesai</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{formatDate(selected.tanggalSelesai)}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Durasi</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{calcDays(selected.tanggalMulai, selected.tanggalSelesai)} hari</Typography>
                </Grid>
                {selected.keterangan && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Keterangan</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selected.keterangan}</Typography>
                  </Grid>
                )}
                {selected.approver && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Disetujui Oleh</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selected.approver.nama}</Typography>
                  </Grid>
                )}
                {selected.catatanAdmin && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Catatan Admin</Typography>
                    <Card sx={{ mt: 0.5, bgcolor: '#f8fafc' }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="body2">{selected.catatanAdmin}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
          {selected?.status === 'PENDING' && (
            <>
              <Button color="error" onClick={() => { setActionDialog('reject'); setCatatan(''); }}>
                Tolak
              </Button>
              <Button variant="contained" color="success" onClick={() => { setActionDialog('approve'); setCatatan(''); }}>
                Setujui
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionDialog === 'approve' ? 'Setujui Pengajuan Cuti' : 'Tolak Pengajuan Cuti'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2">
              {actionDialog === 'approve'
                ? `Menyetujui pengajuan cuti ${selected?.user?.nama}?`
                : `Menolak pengajuan cuti ${selected?.user?.nama}?`}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Catatan (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk karyawan..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>Batal</Button>
          <Button
            variant="contained"
            color={actionDialog === 'approve' ? 'success' : 'error'}
            onClick={handleAction}
            disabled={actionLoading}
          >
            {actionLoading ? 'Memproses...' : actionDialog === 'approve' ? 'Setujui' : 'Tolak'}
          </Button>
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
