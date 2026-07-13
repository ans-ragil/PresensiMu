import { Router } from 'express';
import multer from 'multer';
import { adminController } from '../controllers/admin.controller';
import { scheduleController } from '../controllers/schedule.controller';
import { trackingController } from '../controllers/tracking.controller';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware, ADMIN_ROLES } from '../middleware/rbac';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication and ADMIN/HR/SUPER_ADMIN role
router.use(authMiddleware);
router.use(rbacMiddleware(ADMIN_ROLES));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Leave management
router.get('/leave-requests', adminController.getAllLeaveRequests);
router.put('/leave-request/:id/approve', adminController.approveLeave);
router.put('/leave-request/:id/reject', adminController.rejectLeave);

// Attendance
router.get('/attendance', adminController.getAllAttendance);

// Employees
router.get('/employees', adminController.getAllEmployees);

// Schedule management
router.post('/schedule', scheduleController.createSchedule);
router.put('/schedule/:id', scheduleController.updateSchedule);
router.delete('/schedule/:id', scheduleController.deleteSchedule);
router.get('/schedules', scheduleController.getSchedules);
router.post('/schedule/bulk', scheduleController.bulkAssign);
router.post('/schedule/import/preview', upload.single('file'), scheduleController.previewImport);
router.post('/schedule/import', upload.single('file'), scheduleController.importFromExcel);

// Holiday management
router.post('/holiday', scheduleController.createHoliday);
router.get('/holidays', scheduleController.getHolidays);
router.delete('/holiday/:id', scheduleController.deleteHoliday);

// Company location
router.post('/company-location', trackingController.setCompanyLocation);
router.get('/company-location', trackingController.getCompanyLocation);

// Live tracking
router.get('/tracking/live', trackingController.getLiveTracking);
router.get('/tracking/history', trackingController.getTrackingHistory);
router.get('/tracking/alerts', trackingController.getAlerts);

// Reports
router.get('/reports/daily', reportController.getDailyReport);
router.get('/reports/weekly', reportController.getWeeklyReport);
router.get('/reports/monthly', reportController.getMonthlyReport);
router.get('/reports/employee', reportController.getEmployeeReport);
router.get('/reports/leave', reportController.getLeaveReport);
router.get('/reports/export', reportController.exportReport);

// Email settings
router.post('/email-settings', reportController.setEmailSettings);
router.get('/email-settings', reportController.getEmailSettings);
router.delete('/email-settings/:id', reportController.deleteEmailSetting);

export default router;
