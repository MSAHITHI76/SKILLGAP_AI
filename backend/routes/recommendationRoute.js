/**
 * backend/routes/recommendationRoute.js
 * POST /api/recommendations — returns curated learning resources.
 */
const express  = require('express');
const router   = express.Router();
const { getRecommendations } = require('../utils/aiProcessing');

router.post('/', (req, res, next) => {
  try {
    const { missingSkills = [], improvementSkills = [] } = req.body;
    const result = getRecommendations(missingSkills, improvementSkills);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

module.exports = router;
