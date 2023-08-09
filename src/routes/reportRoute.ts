import express from 'express';
import { downloadReport } from '../controllers/reportController';

const router = express.Router();

// download report route
router.get('/download', downloadReport);

export default router;