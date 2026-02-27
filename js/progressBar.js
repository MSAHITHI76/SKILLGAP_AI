/**
 * js/progressBar.js
 * Animated progress bar controller — no dependencies.
 */

window.ProgressBar = (function () {

  function animateTo(fillId, pctId, target, duration = 600) {
    return new Promise(resolve => {
      const fill = document.getElementById(fillId);
      const pct  = document.getElementById(pctId);
      if (!fill) { resolve(); return; }
      const start   = parseFloat(fill.style.width) || 0;
      const t0      = performance.now();
      function tick(now) {
        const p     = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        const val   = start + (target - start) * eased;
        fill.style.width = val.toFixed(1) + '%';
        if (pct) pct.textContent = Math.round(val) + '%';
        if (p < 1) requestAnimationFrame(tick);
        else { fill.style.width = target + '%'; if (pct) pct.textContent = target + '%'; resolve(); }
      }
      requestAnimationFrame(tick);
    });
  }

  function reset(fillId, pctId) {
    const f = document.getElementById(fillId); if (f) f.style.width = '0%';
    const p = document.getElementById(pctId);  if (p) p.textContent = '0%';
  }

  function setStep(id, state) {
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('active', 'done');
    if (state !== 'pending') el.classList.add(state);
  }

  async function runUploadFlow(onDone) {
    const wrap  = document.getElementById('uploadProgress');
    const label = document.getElementById('progressLabel');
    if (!wrap) return;
    wrap.style.display = 'block';
    reset('progressFill', 'progressPct');

    // Stage 1 — Upload
    setStep('step-upload', 'active'); setStep('step-analyze', 'pending'); setStep('step-extract', 'pending');
    if (label) label.textContent = '📤 Uploading file…';
    await animateTo('progressFill', 'progressPct', 30, 700);
    setStep('step-upload', 'done');

    // Stage 2 — Analyze
    if (label) label.textContent = '🔍 Analysing content…';
    setStep('step-analyze', 'active');
    await animateTo('progressFill', 'progressPct', 65, 1000);
    setStep('step-analyze', 'done');

    // Stage 3 — Extract
    if (label) label.textContent = '⚡ Extracting skills…';
    setStep('step-extract', 'active');
    await animateTo('progressFill', 'progressPct', 100, 800);
    setStep('step-extract', 'done');
    if (label) label.textContent = '✅ Analysis complete!';

    await new Promise(r => setTimeout(r, 300));
    if (typeof onDone === 'function') onDone();
  }

  async function runMatchFlow(onDone) {
    const wrap  = document.getElementById('matchProgress');
    const label = document.getElementById('matchLabel');
    if (!wrap) return;
    wrap.style.display = 'block';
    reset('matchFill', 'matchPct');

    if (label) label.textContent = '💼 Matching skills to job roles…';
    await animateTo('matchFill', 'matchPct', 55, 800);
    if (label) label.textContent = '📊 Calculating gap score…';
    await animateTo('matchFill', 'matchPct', 100, 700);
    if (label) label.textContent = '✅ Matching complete!';

    await new Promise(r => setTimeout(r, 350));
    wrap.style.display = 'none';
    if (typeof onDone === 'function') onDone();
  }

  return { animateTo, reset, setStep, runUploadFlow, runMatchFlow };
})();
