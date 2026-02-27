/**
 * js/jobMatching.js
 * ─────────────────────────────────────────────────────────────
 * Pure JavaScript job matching engine.
 * Calculates match scores between skill profiles and job roles,
 * identifies missing skills, and ranks best-fit jobs.
 * ─────────────────────────────────────────────────────────────
 */

window.JobMatching = (function () {

  const db  = window.SkillDB;
  const cfg = window.APP_CONFIG;

  /**
   * Run complete job matching analysis.
   * @param {Object} profile   - Skill profile from SkillAnalysis
   * @param {string} targetRole - Optional desired role string
   * @returns {Object}          - Full match analysis result
   */
  function analyse(profile, targetRole = '') {
    const skillNames = new Set(profile.skills.map(s => s.name.toLowerCase()));

    // ── Find best-fit roles ──────────────────────
    const allRoles = db.JOB_ROLES.map(role => ({
      ...role,
      matchScore: calcMatchScore(skillNames, role),
    })).sort((a, b) => b.matchScore - a.matchScore);

    // ── Determine target role ────────────────────
    let targetRoleData;
    if (targetRole) {
      // Find closest matching role in our database
      const t = targetRole.toLowerCase();
      targetRoleData = allRoles.find(r => r.title.toLowerCase().includes(t) || t.includes(r.title.toLowerCase().split(' ')[0]));
    }
    if (!targetRoleData) {
      targetRoleData = allRoles[0]; // best match
    }

    // ── Gap analysis for target role ─────────────
    const missingSkills     = getMissingSkills(skillNames, targetRoleData);
    const improvementAreas  = getImprovementAreas(profile.skills, targetRoleData);
    const strongSkills      = getStrongSkills(skillNames, targetRoleData);

    const matchTier = targetRoleData.matchScore >= 80 ? 'Excellent'
                    : targetRoleData.matchScore >= 60 ? 'Good'
                    : targetRoleData.matchScore >= 40 ? 'Fair'
                    : 'Poor';

    // ── Insights ─────────────────────────────────
    const insightKey = targetRoleData.matchScore >= 80 ? 'high'
                     : targetRoleData.matchScore >= 60 ? 'good'
                     : targetRoleData.matchScore >= 40 ? 'fair'
                     : 'poor';
    const insights = db.INSIGHTS[insightKey];
    const insightText = insights[Math.floor(Math.random() * insights.length)];

    return {
      suggestedRoles:    allRoles.slice(0, cfg.MAX_JOB_ROLES),
      targetRoleAnalysis: {
        role:             targetRoleData.title,
        matchScore:       targetRoleData.matchScore,
        matchTier,
        strongSkills,
        missingSkills,
        improvementAreas,
      },
      overallInsights: insightText,
    };
  }

  /* ── Match Score Calculation ─────────────────── */
  function calcMatchScore(skillNames, role) {
    const req = role.required  || [];
    const prf = role.preferred || [];

    // Required skills are worth 70% of the score
    const reqMatch = req.filter(s => skillNames.has(s.toLowerCase())).length;
    const reqScore = req.length > 0 ? (reqMatch / req.length) * 70 : 70;

    // Preferred skills are worth 30%
    const prfMatch = prf.filter(s => skillNames.has(s.toLowerCase())).length;
    const prfScore = prf.length > 0 ? (prfMatch / prf.length) * 30 : 15;

    // Small bonus for having many skills overall
    const breadthBonus = Math.min(5, skillNames.size / 10);

    const raw = Math.round(reqScore + prfScore + breadthBonus);
    return Math.min(98, Math.max(10, raw)); // clamp to 10–98
  }

  /* ── Missing Skills ──────────────────────────── */
  function getMissingSkills(skillNames, role) {
    const missing = [];

    (role.required || []).forEach(skill => {
      if (!skillNames.has(skill.toLowerCase())) {
        missing.push({ name: skill, importance: 'Critical', reason: `Required for all ${role.title} positions` });
      }
    });

    (role.preferred || []).forEach(skill => {
      if (!skillNames.has(skill.toLowerCase())) {
        missing.push({ name: skill, importance: 'High', reason: `Preferred by most ${role.title} job listings` });
      }
    });

    // Limit
    return missing.slice(0, cfg.MAX_MISSING_DISPLAY);
  }

  /* ── Improvement Areas ───────────────────────── */
  function getImprovementAreas(skills, role) {
    const areas = [];
    const allRoleSkills = [...(role.required || []), ...(role.preferred || [])];

    skills.forEach(s => {
      if (allRoleSkills.some(rs => rs.toLowerCase() === s.name.toLowerCase())) {
        if (s.proficiency === 'Beginner') {
          areas.push({ name: s.name, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High' });
        } else if (s.proficiency === 'Intermediate') {
          areas.push({ name: s.name, currentLevel: 'Intermediate', targetLevel: 'Expert', priority: 'Medium' });
        }
      }
    });

    return areas.slice(0, 6);
  }

  /* ── Strong Skills ───────────────────────────── */
  function getStrongSkills(skillNames, role) {
    return [...(role.required || []), ...(role.preferred || [])]
      .filter(s => skillNames.has(s.toLowerCase()))
      .slice(0, 8);
  }

  /* ── DOM Rendering ─────────────────────────── */
  function renderMatchScore(score) {
    const numEl = document.getElementById('scoreNum');
    const arc   = document.getElementById('scoreArc');
    const label = document.getElementById('scoreLabel');

    if (!numEl) return;

    let current = 0;
    const step  = () => {
      current = Math.min(current + 1.5, score);
      numEl.textContent = Math.round(current);
      if (arc) {
        const offset = 314 - (314 * current) / 100;
        arc.style.strokeDashoffset = offset;
        arc.style.transition = 'stroke-dashoffset 0.02s linear';
      }
      if (current < score) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    if (label) {
      if      (score >= 80) label.textContent = '🔥 Excellent match!';
      else if (score >= 60) label.textContent = '✅ Good match';
      else if (score >= 40) label.textContent = '📚 Fair match — some gaps';
      else                   label.textContent = '⚠️ Significant gaps detected';
    }
  }

  function renderMissingSkills(missing) {
    const container = document.getElementById('missingSkills');
    const countEl   = document.getElementById('gapCount');
    if (!container) return;
    container.innerHTML = '';
    if (countEl) countEl.textContent = missing.length;

    if (missing.length === 0) {
      container.innerHTML = '<span style="color:var(--accent2);font-size:.9rem">🎉 No critical gaps!</span>';
      return;
    }

    missing.forEach(s => {
      const tag    = document.createElement('span');
      tag.className = 'skill-tag' + (s.importance === 'Critical' ? ' critical' : '');
      tag.title     = `${s.name}: ${s.reason}`;
      const imp     = s.importance === 'Critical' ? '🔴' : '🟡';
      tag.textContent = `${imp} ${s.name}`;
      container.appendChild(tag);
    });
  }

  function renderJobCards(roles, onSelect) {
    const container = document.getElementById('jobCards');
    if (!container) return;
    container.innerHTML = '';

    roles.forEach((role, i) => {
      const card = document.createElement('div');
      card.className = 'job-card' + (i === 0 ? ' selected' : '');
      card.innerHTML = `
        <div class="jc-title">${esc(role.icon)} ${esc(role.title)}</div>
        <div class="jc-match">⚡ ${role.matchScore}% match</div>
        ${role.salary ? `<div class="jc-salary">💰 ${esc(role.salary)}</div>` : ''}
      `;
      card.title = role.description || '';
      card.addEventListener('click', () => {
        container.querySelectorAll('.job-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (onSelect) onSelect(role);
      });
      container.appendChild(card);
    });
  }

  function renderInsights(text) {
    const el = document.getElementById('insightText');
    if (!el) return;
    el.innerHTML = text.split('\n').filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
  }

  function esc(s) { return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  return { analyse, renderMatchScore, renderMissingSkills, renderJobCards, renderInsights };
})();
