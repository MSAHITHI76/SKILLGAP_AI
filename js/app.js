/**
 * js/app.js
 * Main application controller — orchestrates all modules.
 * No API calls required anywhere in this flow.
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────
  const state = {
    skillProfile:   null,
    matchData:      null,
    recs:           null,
    targetRole:     '',
  };

  // ── Boot ───────────────────────────────────────
  function init() {
    ResumeUpload.init();
    Chatbot.init();

    document.getElementById('analyzeBtn').addEventListener('click', startAnalysis);
    document.getElementById('jobGoalInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') startAnalysis();
    });
  }

  // ── Full Pipeline ──────────────────────────────
  async function startAnalysis() {
    const file   = ResumeUpload.getFile();
    const base64 = ResumeUpload.getBase64();
    const text_  = ResumeUpload.getText();

    if (!file || !base64) {
      ResumeUpload.showError('⚠️ Please upload a resume file first!');
      return;
    }

    // Disable button during analysis
    const btn = document.getElementById('analyzeBtn');
    const lbl = document.getElementById('analyzeBtnText');
    btn.disabled = true;
    if (lbl) lbl.textContent = 'Analysing…';

    state.targetRole = (document.getElementById('jobGoalInput').value || '').trim();

    // ── Phase 1: Upload + Parse Progress ─────────
    await ProgressBar.runUploadFlow(async () => {

      // Extract text from the resume file
      let resumeText = '';
      try {
        resumeText = await ResumeParser.extractText(file, base64, text_);
      } catch (e) {
        console.warn('Parser error:', e);
        resumeText = file.name; // fallback to filename
      }

      // ── Phase 2: Skill Analysis ───────────────
      state.skillProfile = SkillAnalysis.analyse(resumeText, state.targetRole);

      // Render candidate summary
      renderCandidateSummary(state.skillProfile);
      SkillAnalysis.renderDetectedSkills(state.skillProfile.skills);

      // Show analysis section
      showSection('analysis-section');

      // ── Phase 3: Job Matching Progress ───────
      await ProgressBar.runMatchFlow(async () => {

        state.matchData = JobMatching.analyse(state.skillProfile, state.targetRole);

        // Show results
        showEl('resultsGrid', 'grid');

        JobMatching.renderMatchScore(state.matchData.targetRoleAnalysis.matchScore);
        document.getElementById('scoreRole').textContent = state.matchData.targetRoleAnalysis.role;
        JobMatching.renderMissingSkills(state.matchData.targetRoleAnalysis.missingSkills);
        JobMatching.renderJobCards(state.matchData.suggestedRoles, onJobSelect);
        JobMatching.renderInsights(state.matchData.overallInsights);

        // Scroll
        document.getElementById('analysis-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

        // ── Phase 4: Recommendations ──────────
        const missing = state.matchData.targetRoleAnalysis.missingSkills;
        const improve = state.matchData.targetRoleAnalysis.improvementAreas;
        state.recs    = Recommendations.build(missing, improve);
        Recommendations.render(state.recs);
        showSection('recommendations-section');

        // ── Phase 5: Roadmap ──────────────────
        renderRoadmap(state.skillProfile, state.matchData);
        showSection('roadmap-section');
        document.getElementById('roadmapSubtitle').textContent =
          `Personalised ${state.matchData.targetRoleAnalysis.role} career roadmap — ${state.matchData.targetRoleAnalysis.matchTier} starting position`;

        // ── Update chatbot context ─────────────
        Chatbot.setContext({
          role:    state.matchData.targetRoleAnalysis.role,
          score:   state.matchData.targetRoleAnalysis.matchScore,
          missing: missing,
          improve: improve,
        });

        // Re-enable button
        btn.disabled = false;
        if (lbl) lbl.textContent = 'Re-analyse';
      });
    });
  }

  // ── Job Card Selection ─────────────────────────
  function onJobSelect(role) {
    JobMatching.renderMatchScore(role.matchScore);
    document.getElementById('scoreRole').textContent = role.title;
    document.getElementById('scoreLabel').textContent =
      role.matchScore >= 80 ? '🔥 Excellent match!'
      : role.matchScore >= 60 ? '✅ Good match'
      : role.matchScore >= 40 ? '📚 Fair match — some gaps'
      : '⚠️ Significant gaps detected';
  }

  // ── Candidate Summary ──────────────────────────
  function renderCandidateSummary(profile) {
    const sumEl = document.getElementById('candidateSummary');
    if (!sumEl) return;

    // Avatar initial
    const initial = profile.candidateName
      ? profile.candidateName.charAt(0).toUpperCase()
      : '?';
    document.getElementById('csAvatar').textContent = initial;
    document.getElementById('csName').textContent   = profile.candidateName || 'Candidate';

    const meta = [];
    if (profile.careerLevel)  meta.push(profile.careerLevel + ' level');
    if (profile.totalYearsExp) meta.push(profile.totalYearsExp + ' yrs exp');
    if (profile.industries && profile.industries.length) meta.push(profile.industries[0]);
    document.getElementById('csMeta').textContent = meta.join(' · ');

    // Tags: top categories
    const cats = [...new Set(profile.skills.slice(0, 8).map(s => s.category))].slice(0, 4);
    const tags = document.getElementById('csTags');
    if (tags) tags.innerHTML = cats.map(c => `<span class="cs-tag">${esc(c)}</span>`).join('');

    sumEl.style.display = 'flex';
  }

  // ── Career Roadmap ─────────────────────────────
  function renderRoadmap(profile, matchData) {
    const container = document.getElementById('roadmapContainer');
    if (!container) return;
    container.innerHTML = '';

    const role    = matchData.targetRoleAnalysis.role;
    const missing = matchData.targetRoleAnalysis.missingSkills;
    const improve = matchData.targetRoleAnalysis.improvementAreas;

    const phases = [
      {
        title: 'Foundation Building',
        time:  '0–3 months',
        items: [
          ...missing.filter(s => s.importance === 'Critical').slice(0, 3).map(s => s.name),
          'Set up development environment', 'Build first practice project',
        ],
      },
      {
        title: 'Core Skills Development',
        time:  '3–6 months',
        items: [
          ...missing.filter(s => s.importance === 'High').slice(0, 3).map(s => s.name),
          ...improve.filter(s => s.priority === 'High').slice(0, 2).map(s => s.name + ' (↑ ' + s.targetLevel + ')'),
          'Build portfolio project #2',
        ],
      },
      {
        title: 'Specialisation & Portfolio',
        time:  '6–9 months',
        items: [
          ...improve.filter(s => s.priority === 'Medium').slice(0, 2).map(s => s.name),
          ...missing.filter(s => s.importance === 'Medium').slice(0, 2).map(s => s.name),
          'Contribute to open source', 'Build capstone project',
        ],
      },
      {
        title: `Land ${role} Role`,
        time:  '9–12 months',
        items: [
          'Polish LinkedIn & GitHub',
          'Apply to 5–10 companies/week',
          'Prepare for technical interviews',
          'Practice system design',
          'Negotiate your offer 🎉',
        ],
      },
    ];

    phases.forEach((phase, i) => {
      const items = phase.items.filter(Boolean).slice(0, 6);
      const div   = document.createElement('div');
      div.className = 'roadmap-phase';
      div.innerHTML = `
        <div class="phase-label">
          <div class="phase-circle">${i + 1}</div>
          <div class="phase-time">${esc(phase.time)}</div>
        </div>
        <div class="phase-body">
          <div class="phase-title">${esc(phase.title)}</div>
          <div class="phase-items">
            ${items.map(item => `<span class="phase-item">${esc(item)}</span>`).join('')}
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // ── Helpers ────────────────────────────────────
  function showSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  }
  function showEl(id, display = '') {
    const el = document.getElementById(id);
    if (el) el.style.display = display;
  }
  function esc(s) {
    return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // ── Init on DOM ready ──────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
