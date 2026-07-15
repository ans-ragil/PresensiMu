import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

// Company profile
router.get('/company-profile', settingsController.getCompanyProfile);
router.put('/company-profile', settingsController.setCompanyProfile);

// Work time
router.get('/work-time', settingsController.getWorkTime);
router.put('/work-time', settingsController.setWorkTime);

// SMTP
router.get('/smtp', settingsController.getSmtpSettings);
router.put('/smtp', settingsController.setSmtpSettings);

// Logo
router.get('/logo', settingsController.getLogo);
router.put('/logo', settingsController.setLogo);

// All settings
router.get('/', settingsController.getAll);

export default router;
