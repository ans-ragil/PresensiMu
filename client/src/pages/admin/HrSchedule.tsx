import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  Grid,
  Autocomplete,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  EventBusy as HolidayIcon,
} from '@mui/icons-material';
import HrPageContainer from '../../components/hr/HrPageContainer';
import { scheduleApi, holidayApi, employeeApi } from '../../services/hrApi';
import type { Schedule, Holiday, User } from '../../types';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const SHIFT_TYPES = ['NORMAL', 'WFH', 'SHIFT'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function HrSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Form states
  const [formUser, setFormUser] = useState('');
  const [formHari, setFormHari] = useState(0);
  const [formJamMulai, setFormJamMulai] = useState('08:00');
  const [formJamSelesai, setFormJamSelesai] = useState('17:00');
  const [formShiftType, setFormShiftType] = useState('NORMAL');
  const [formToleransi, setFormToleransi] = useState(30);
  const [formHolidayNama, setFormHolidayNama] = useState('');
  const [formHolidayTanggal, setFormHolidayTanggal] = useState('');
  const [bulkUsers, setBulkUsers] = useState<string[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const fetchData = useCallback(async () => {
    try {
      const [schRes, holRes, empRes] = await Promise.all([
        scheduleApi.list(),
        holidayApi.list(),
        employeeApi.list({ limit: 200 }),
      ]);
      setSchedules(schRes.data.data);
      setHolidays(holRes.data.data);
      setEmployees(empRes.data.data.employees);
    } catch {
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group schedules by day-of-week
  const schedulesByDay: Record<number, Schedule[]> = {};
  schedules.forEach((s) => {
    if (!schedulesByDay[s.hari]) schedulesByDay[s.hari] = [];
    schedulesByDay[s.hari].push(s);
  });

  // Get holidays for current month
  const monthHolidays = holidays.filter((h) => {
    const d = new Date(h.tanggal);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Get holidays by date string
  const holidaysByDate: Record<string, Holiday> = {};
  monthHolidays.forEach((h) => {
    const key = new Date(h.tanggal).toISOString().split('T')[0];
    holidaysByDate[key] = h;
  });

  const openScheduleDialog = (hari?: number, schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormUser(schedule.userId);
      setFormHari(schedule.hari);
      setFormJamMulai(schedule.jamMulai);
      setFormJamSelesai(schedule.jamSelesai);
      setFormShiftType(schedule.shiftType);
      setFormToleransi(schedule.toleransiMenit);
    } else {
      setEditingSchedule(null);
      setFormUser('');
      setFormHari(hari ?? 0);
      setFormJamMulai('08:00');
      setFormJamSelesai('17:00');
      setFormShiftType('NORMAL');
      setFormToleransi(30);
    }
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        await scheduleApi.update(editingSchedule.id, {
          jamMulai: formJamMulai,
          jamSelesai: formJamSelesai,
          shiftType: formShiftType,
          toleransiMenit: formToleransi,
        });
        showToast('Jadwal berhasil diperbarui', 'success');
      } else {
        await scheduleApi.create({
          userId: formUser,
          hari: formHari,
          jamMulai: formJamMulai,
          jamSelesai: formJamSelesai,
          shiftType: formShiftType,
          toleransiMenit: formToleransi,
        });
        showToast('Jadwal berhasil ditambahkan', 'success');
      }
      setScheduleDialogOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan jadwal', 'error');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await scheduleApi.delete(id);
      showToast('Jadwal berhasil dihapus', 'success');
      fetchData();
    } catch {
      showToast('Gagal menghapus jadwal', 'error');
    }
  };

  const handleSaveHoliday = async () => {
    try {
      await holidayApi.create({ nama: formHolidayNama, tanggal: formHolidayTanggal });
      showToast('Hari libur berhasil ditambahkan', 'success');
      setHolidayDialogOpen(false);
      setFormHolidayNama('');
      setFormHolidayTanggal('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan hari libur', 'error');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Hapus hari libur ini?')) return;
    try {
      await holidayApi.delete(id);
      showToast('Hari libur berhasil dihapus', 'success');
      fetchData();
    } catch {
      showToast('Gagal menghapus hari libur', 'error');
    }
  };

  const handleBulkAssign = async () => {
    try {
      await scheduleApi.bulkAssign({
        userIds: bulkUsers,
        hari: formHari,
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
        shiftType: formShiftType,
        toleransiMenit: formToleransi,
      });
      showToast('Bulk assign berhasil', 'success');
      setBulkDialogOpen(false);
      setBulkUsers([]);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal bulk assign', 'error');
    }
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  const navigateMonth = (dir: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const getScheduleForDate = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return schedulesByDay[dayOfWeek] || [];
  };

  return (
    <HrPageContainer
      title="Jadwal Kerja"
      subtitle="Kelola jadwal kerja, shift, dan hari libur"
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<HolidayIcon />}
            onClick={() => setHolidayDialogOpen(true)}
          >
            Hari Libur
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setBulkDialogOpen(true)}
          >
            Bulk Assign
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openScheduleDialog()}
          >
            Tambah Jadwal
          </Button>
        </>
      }
    >
      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              {/* Calendar Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={() => navigateMonth(-1)}><ChevronLeftIcon /></IconButton>
                  <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center', fontWeight: 700 }}>
                    {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </Typography>
                  <IconButton onClick={() => navigateMonth(1)}><ChevronRightIcon /></IconButton>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hari Ini
                </Button>
              </Box>

              {/* Day Headers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                {HARI_SHORT.map((d) => (
                  <Box key={d} sx={{ textAlign: 'center', py: 1, fontWeight: 600, color: '#64748b', fontSize: 13 }}>
                    {d}
                  </Box>
                ))}
              </Box>

              {/* Calendar Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                {calendarDays.map((day, idx) => {
                  if (day === null) return <Box key={`empty-${idx}`} />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isHoliday = holidaysByDate[dateStr];
                  const daySchedules = getScheduleForDate(day);
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                  const isSelected = selectedDay === day;

                  return (
                    <Box
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      sx={{
                        p: 0.5,
                        minHeight: 80,
                        border: '1px solid',
                        borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: isToday ? '#eff6ff' : isHoliday ? '#fef2f2' : isSelected ? '#f0f0ff' : 'white',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: '#6366f1', bgcolor: '#f8f8ff' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isToday ? 700 : 500,
                            color: isToday ? '#6366f1' : isHoliday ? '#ef4444' : '#475569',
                            fontSize: 13,
                          }}
                        >
                          {day}
                        </Typography>
                        {isToday && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366f1' }} />
                        )}
                      </Box>
                      {isHoliday && (
                        <Chip
                          label={isHoliday.nama}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ mt: 0.5, fontSize: 10, height: 18 }}
                        />
                      )}
                      {daySchedules.slice(0, 2).map((s) => {
                        const emp = employees.find((e) => e.id === s.userId);
                        return (
                          <Tooltip
                            key={s.id}
                            title={`${emp?.nama || '?'} | ${s.jamMulai}-${s.jamSelesai} | ${s.shiftType}`}
                            arrow
                          >
                            <Box
                              sx={{
                                mt: 0.25,
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                bgcolor: s.shiftType === 'WFH' ? '#dbeafe' : s.shiftType === 'SHIFT' ? '#fef3c7' : '#dcfce7',
                                fontSize: 10,
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              onClick={(e) => { e.stopPropagation(); openScheduleDialog(day, s); }}
                            >
                              {emp?.nama?.split(' ')[0] || '?'} ({s.jamMulai})
                            </Box>
                          </Tooltip>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <Typography variant="caption" sx={{ color: '#6366f1', fontSize: 10 }}>
                          +{daySchedules.length - 2} lagi
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Selected Day Detail */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedDay
                  ? `${HARI[new Date(year, month, selectedDay).getDay()]} ${selectedDay} ${currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
                  : 'Pilih hari di kalender'}
              </Typography>
              {selectedDay ? (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => openScheduleDialog(selectedDay)}
                    sx={{ mb: 2 }}
                  >
                    Tambah Jadwal
                  </Button>
                  {getScheduleForDate(selectedDay).length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
                      Belum ada jadwal untuk hari ini
                    </Typography>
                  ) : (
                    <List dense>
                      {getScheduleForDate(selectedDay).map((s) => {
                        const emp = employees.find((e) => e.id === s.userId);
                        return (
                          <ListItem
                            key={s.id}
                            secondaryAction={
                              <Box>
                                <IconButton size="small" onClick={() => openScheduleDialog(selectedDay, s)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(s.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: s.shiftType === 'WFH' ? '#3b82f6' : s.shiftType === 'SHIFT' ? '#f59e0b' : '#22c55e', fontSize: 13 }}>
                                {emp?.nama?.charAt(0) || '?'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{emp?.nama || '?'}</Typography>}
                              secondary={
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{s.jamMulai}-{s.jamSelesai}</Typography>
                                  <Chip label={s.shiftType} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                  <CalendarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">Klik hari di kalender untuk melihat detail</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Holiday List */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Hari Libur</Typography>
              {monthHolidays.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                  Tidak ada hari libur bulan ini
                </Typography>
              ) : (
                <List dense>
                  {monthHolidays.map((h) => (
                    <ListItem
                      key={h.id}
                      secondaryAction={
                        <IconButton size="small" color="error" onClick={() => handleDeleteHoliday(h.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', width: 32, height: 32 }}>
                          <HolidayIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{h.nama}</Typography>}
                        secondary={
                          <Typography variant="caption">
                            {new Date(h.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {!editingSchedule && (
              <TextField
                fullWidth
                select
                label="Karyawan"
                value={formUser}
                onChange={(e) => setFormUser(e.target.value)}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.nama} ({emp.email})</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              fullWidth
              select
              label="Hari"
              value={formHari}
              onChange={(e) => setFormHari(parseInt(e.target.value))}
            >
              {HARI.map((h, i) => (
                <MenuItem key={i} value={i}>{h}</MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Jam Mulai"
                type="time"
                value={formJamMulai}
                onChange={(e) => setFormJamMulai(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Jam Selesai"
                type="time"
                value={formJamSelesai}
                onChange={(e) => setFormJamSelesai(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              fullWidth
              select
              label="Tipe Shift"
              value={formShiftType}
              onChange={(e) => setFormShiftType(e.target.value)}
            >
              {SHIFT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Toleransi (menit)"
              value={formToleransi}
              onChange={(e) => setFormToleransi(parseInt(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveSchedule}>
            {editingSchedule ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Tambah Hari Libur</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              fullWidth
              label="Nama Hari Libur"
              value={formHolidayNama}
              onChange={(e) => setFormHolidayNama(e.target.value)}
            />
            <TextField
              fullWidth
              label="Tanggal"
              type="date"
              value={formHolidayTanggal}
              onChange={(e) => setFormHolidayTanggal(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveHoliday}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Assign Jadwal</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(opt) => `${opt.nama} (${opt.email})`}
              value={employees.filter((e) => bulkUsers.includes(e.id))}
              onChange={(_, val) => setBulkUsers(val.map((v) => v.id))}
              renderInput={(params) => <TextField {...params} label="Pilih Karyawan" placeholder="Cari..." />}
            />
            <TextField
              fullWidth
              select
              label="Hari"
              value={formHari}
              onChange={(e) => setFormHari(parseInt(e.target.value))}
            >
              {HARI.map((h, i) => (
                <MenuItem key={i} value={i}>{h}</MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Jam Mulai" type="time" value={formJamMulai} onChange={(e) => setFormJamMulai(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField fullWidth label="Jam Selesai" type="time" value={formJamSelesai} onChange={(e) => setFormJamSelesai(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField fullWidth select label="Tipe Shift" value={formShiftType} onChange={(e) => setFormShiftType(e.target.value)}>
              {SHIFT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleBulkAssign} disabled={bulkUsers.length === 0}>
            Assign ke {bulkUsers.length} Karyawan
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
