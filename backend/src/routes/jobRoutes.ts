import express from 'express';
import { JobController } from '../controllers/JobController';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/public', JobController.getPublicJobs);
router.get('/:id/public', JobController.getPublicJobById);

// Protected routes (Owner/Admin)
router.post('/', authenticateToken, requireOwner, JobController.createJob);
router.get('/', authenticateToken, requireOwner, JobController.getJobs);
router.get('/:id', authenticateToken, JobController.getJobById);
router.patch('/:id', authenticateToken, requireOwner, JobController.updateJob);
router.delete('/:id', authenticateToken, requireOwner, JobController.deleteJob);

export default router;
