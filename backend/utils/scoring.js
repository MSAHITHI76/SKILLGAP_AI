/**
 * backend/utils/scoring.js
 * Score normalisation utilities.
 */
function normalise(raw, skillCount) {
  let s = Math.max(0, Math.min(100, Number(raw) || 0));
  if (skillCount > 15) s = Math.min(100, s + 3);
  if (skillCount > 25) s = Math.min(100, s + 2);
  return Math.round(s);
}
function scoreTier(s) {
  return s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor';
}
module.exports = { normalise, scoreTier };
