import express from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All candidate routes are protected
router.use(authenticateToken);

router.get('/job/:jobId', CandidateController.getCandidatesByJob);
router.get('/recent-analyses', CandidateController.getRecentAnalyses);
router.get('/analysis/:id', CandidateController.getAnalysisDetails);
router.get('/:id', CandidateController.getCandidateById);

export default router;
