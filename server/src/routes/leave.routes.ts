import { Router } from 'express';
import { leaveController } from '../controllers/leave.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Leave request routes
router.post('/', leaveController.createLeave);
router.get('/history', leaveController.getLeaveHistory);
router.get('/balance', leaveController.getLeaveBalance);
router.get('/:id', leaveController.getLeaveById);

export default router;
