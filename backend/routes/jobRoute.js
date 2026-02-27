/**
 * backend/routes/jobRoute.js
 * POST /api/jobs/match — job matching analysis.
 */
const express  = require('express');
const router   = express.Router();
const { matchJobs } = require('../utils/aiProcessing');

router.post('/match', async (req, res, next) => {
  try {
    const { skillProfile, targetRole } = req.body;
    if (!skillProfile) return res.status(400).json({ error: 'skillProfile required' });
    const result = matchJobs(skillProfile, targetRole);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
