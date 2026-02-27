/**
 * backend/utils/fileValidation.js
 */
const ALLOWED = ['pdf','doc','docx','png','jpg','jpeg','txt'];
const MAX_MB  = 10;

function validate({ filename, base64 }) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  if (!ALLOWED.includes(ext)) return { valid: false, reason: `File type ".${ext}" not supported.` };
  if (base64) {
    const mb = (base64.length * 0.75) / 1024 / 1024;
    if (mb > MAX_MB) return { valid: false, reason: `File too large (${mb.toFixed(1)} MB). Max: ${MAX_MB} MB.` };
  }
  return { valid: true };
}

module.exports = { validate };
