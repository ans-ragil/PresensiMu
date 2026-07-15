import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

// Employee CRUD
router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);
router.put('/:id/restore', employeeController.restore);
router.put('/:id/change-password', employeeController.changePassword);

// Division
router.get('/divisions/list', employeeController.getDivisions);
router.post('/divisions', employeeController.createDivision);
router.put('/divisions/:id', employeeController.updateDivision);
router.delete('/divisions/:id', employeeController.deleteDivision);

// Position
router.get('/positions/list', employeeController.getPositions);
router.post('/positions', employeeController.createPosition);
router.put('/positions/:id', employeeController.updatePosition);
router.delete('/positions/:id', employeeController.deletePosition);

// Shift
router.get('/shifts/list', employeeController.getShifts);
router.post('/shifts', employeeController.createShift);
router.put('/shifts/:id', employeeController.updateShift);
router.delete('/shifts/:id', employeeController.deleteShift);

export default router;
