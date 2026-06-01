import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController';
import { createJob, getJobs, getJobDetails, cancelJob, retryJob, deleteJob } from '../controllers/jobController';
import { getDashboardData, getTelemetryMetrics } from '../controllers/analyticsController';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController';
import { getApiKeys, createApiKey, revokeApiKey } from '../controllers/apiKeyController';
import { getAuditLogs } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// ==========================================
// AUTHENTICATION ROUTES (REMOVED - NO LOGIN/ACCOUNT SYSTEMS REQUIRED/LOCAL ONLY)
// ==========================================
router.get('/auth/me', (req, res) => {
  res.json({ id: 'local-session-owner', email: 'singharyan5011@gmail.com', role: 'Admin' });
});

// ==========================================
// WEBSOCKET-SIMULATED SPIDER JOB QUEUES
// ==========================================
router.post('/jobs', authenticate, createJob);
router.get('/jobs', authenticate, getJobs);
router.get('/jobs/:id', authenticate, getJobDetails);
router.post('/jobs/:id/cancel', authenticate, cancelJob);
router.post('/jobs/:id/retry', authenticate, retryJob);
router.delete('/jobs/:id', authenticate, deleteJob);

// ==========================================
// TELEMETRY & SYSTEM ANALYTICS
// ==========================================
router.get('/analytics/dashboard', authenticate, getDashboardData);
router.get('/analytics/telemetry', authenticate, getTelemetryMetrics);

// ==========================================
// USER NOTIFICATION ALERTS
// ==========================================
router.get('/notifications', authenticate, getNotifications);
router.post('/notifications/:id/read', authenticate, markAsRead);
router.delete('/notifications/:id', authenticate, deleteNotification);

// ==========================================
// DEVELOPER API CREDENTIAL HASHES
// ==========================================
router.get('/apikeys', authenticate, getApiKeys);
router.post('/apikeys', authenticate, createApiKey);
router.delete('/apikeys/:id', authenticate, revokeApiKey);

// ==========================================
// SECURITY AUDIT LOG TRAIL (ADMIN ONLY)
// ==========================================
router.get('/admin/audit', authenticate, authorize(['Admin']), getAuditLogs);

export default router;
