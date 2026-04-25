import express from 'express';
import multer from 'multer';
import { ApplicationController } from '../controllers/ApplicationController';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = express.Router();
console.log('✅ Application Routes Loaded');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public submission
router.post('/', upload.single('resume'), ApplicationController.submitApplication);

// Application management (Owner)
router.get('/', authenticateToken, requireOwner, ApplicationController.getApplications);

// Screening routes
router.post('/custom-screen', authenticateToken, requireOwner, upload.fields([{ name: 'resumes', maxCount: 50 }, { name: 'jdFile', maxCount: 1 }]), ApplicationController.customBulkScreen);
router.post('/jobs/:jobId/bulk-upload', authenticateToken, requireOwner, upload.array('resumes', 50), ApplicationController.bulkScreen);
router.post('/jobs/:jobId/screen-all', authenticateToken, requireOwner, ApplicationController.screenAllExistingApplications);

// Single application screening
router.post('/:id/screen', authenticateToken, requireOwner, ApplicationController.screenApplication);

// Catch-all for /api/applications to debug mismatches
router.use((req, res) => {
  console.log('❌ [ApplicationRoutes] NO MATCH:', req.method, req.url);
  res.status(404).json({ error: 'Route not found in ApplicationRoutes', url: req.url, method: req.method });
});

export default router;
