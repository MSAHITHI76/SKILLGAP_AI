/**
 * config/frontend-config.js
 * Central configuration — no API key required.
 * The app runs entirely in the browser using built-in AI logic.
 */

window.APP_CONFIG = {
  // App info
  APP_NAME:    'SkillGap AI',
  VERSION:     '2.0.0',
  NO_API_MODE: true,   // ← runs 100% without any API key

  // File upload limits
  MAX_FILE_SIZE_MB:    10,
  ALLOWED_EXTENSIONS:  ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'],

  // Analysis settings
  MAX_SKILLS_DISPLAY:  40,
  MAX_MISSING_DISPLAY: 15,
  MAX_JOB_ROLES:       6,
  MAX_RECOMMENDATIONS: 12,

  // UI
  PROGRESS_SPEED_MS:  600,   // duration per progress stage
  TOAST_MS:           3500,
};
