/**
 * backend/server.js
 * Optional Node.js backend — only needed for production deployments.
 * The app works fully without this (open index.html directly).
 *
 * Setup: npm install && node backend/server.js
 */
const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, '..')));  // serve frontend

const resumeRoute         = require('./routes/resumeRoute');
const skillRoute          = require('./routes/skillRoute');
const jobRoute            = require('./routes/jobRoute');
const recommendationRoute = require('./routes/recommendationRoute');

app.use('/api/resume',          resumeRoute);
app.use('/api/skills',          skillRoute);
app.use('/api/jobs',            jobRoute);
app.use('/api/recommendations', recommendationRoute);

app.get('/api/health', (_, res) => res.json({ status: 'ok', noApiKey: true }));

app.listen(PORT, () => console.log(`✅ SkillGap AI running at http://localhost:${PORT}`));
module.exports = app;
