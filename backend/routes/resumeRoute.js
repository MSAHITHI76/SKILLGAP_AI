/**
 * backend/routes/resumeRoute.js
 * POST /api/resume/upload — validates and echoes file metadata.
 */
const express = require('express');
const router  = express.Router();
const { validate } = require('../utils/fileValidation');

router.post('/upload', (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) return res.status(400).json({ error: 'Missing fields' });
  const v = validate({ filename, base64 });
  if (!v.valid) return res.status(422).json({ error: v.reason });
  res.json({ success: true, message: 'File validated', filename });
});

module.exports = router;
