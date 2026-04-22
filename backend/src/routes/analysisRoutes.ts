import { Router } from 'express';
import { AnalysisController } from '../controllers/AnalysisController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
console.log('✅ Analysis Routes Loaded');

// IMPORTANT: Specific routes must come before parameterized routes
router.get('/recent', authenticateToken, AnalysisController.getRecentAnalyses);
router.get('/:id', authenticateToken, AnalysisController.getAnalysisDetail);

router.use((req, res) => {
  console.log('❌ [AnalysisRoutes] NO MATCH:', req.method, req.url);
  res.status(404).json({ error: 'Route not found in AnalysisRoutes', url: req.url, method: req.method });
});

export default router;
