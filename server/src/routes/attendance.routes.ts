import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Clock in/out
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);

// Get status
router.get('/today', attendanceController.getTodayStatus);
router.get('/history', attendanceController.getHistory);
router.get('/history/stats', attendanceController.getHistoryStats);

// Company location
router.get('/company-location', attendanceController.getCompanyLocation);

// Schedule
router.get('/schedule', attendanceController.getSchedule);

export default router;
