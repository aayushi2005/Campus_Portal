import express from 'express';
import { getProfile, updateProfile, submitDoubt, getMyDoubts, applyForJob, getMyApplications, submitNoDues, getNoDuesStatus, syncUser } from '../controllers/studentController.js';
import { requireStudentAuth } from '../middlewares/clerkAuth.js';

const router = express.Router();

router.use(requireStudentAuth);

router.post('/sync', syncUser);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/doubts', submitDoubt);
router.get('/doubts', getMyDoubts);
router.post('/apply', applyForJob);
router.get('/applications', getMyApplications);
router.post('/no-dues', submitNoDues);
router.get('/no-dues/status', getNoDuesStatus);

export default router;
