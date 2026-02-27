/**
 * backend/routes/skillRoute.js
 * POST /api/skills/extract — server-side skill extraction (mirrors client logic).
 */
const express  = require('express');
const router   = express.Router();
const { extractSkills } = require('../utils/aiProcessing');

router.post('/extract', async (req, res, next) => {
  try {
    const { text, jobGoal } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const result = extractSkills(text, jobGoal);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
