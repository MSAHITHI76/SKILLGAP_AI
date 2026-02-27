/**
 * js/skillAnalysis.js
 * ─────────────────────────────────────────────────────────────
 * Keyword-based NLP skill extractor — runs 100% in the browser.
 * Uses the SKILL_TAXONOMY from skillDatabase.js to detect skills
 * by scanning resume text for known keywords.
 * ─────────────────────────────────────────────────────────────
 */

window.SkillAnalysis = (function () {

  const db = window.SkillDB;

  /**
   * Analyse resume text and return a structured skill profile.
   * @param {string} text      - Extracted resume text
   * @param {string} jobGoal   - Optional target role
   * @returns {Object}         - skillProfile object
   */
  function analyse(text, jobGoal = '') {
    const lower = text.toLowerCase();

    // ── Detect skills ──────────────────────────
    const detected = [];
    const seen     = new Set();

    db.SKILL_TAXONOMY.forEach(skill => {
      if (seen.has(skill.name)) return;
      const found = skill.keywords.some(kw => lower.includes(kw.toLowerCase()));
      if (found) {
        seen.add(skill.name);
        detected.push({
          name:        skill.name,
          category:    skill.cat,
          proficiency: guessProficiency(lower, skill),
          weight:      skill.weight,
        });
      }
    });

    // Sort by weight (most important first)
    detected.sort((a, b) => b.weight - a.weight);

    // ── Infer career level ──────────────────────
    const yearsExp   = extractYearsExp(lower);
    const careerLvl  = inferCareerLevel(yearsExp, detected.length);

    // ── Infer candidate name ────────────────────
    const candidateName = extractName(text);

    // ── Top strengths (top 5 by weight) ─────────
    const topStrengths = detected.slice(0, 5).map(s => s.name);

    // ── Infer industries ─────────────────────────
    const industries = inferIndustries(lower);

    // ── Summary ─────────────────────────────────
    const summary = buildSummary(candidateName, detected, careerLvl, yearsExp, jobGoal);

    return {
      candidateName,
      summary,
      totalYearsExp:  yearsExp,
      skills:         detected,
      careerLevel:    careerLvl,
      topStrengths,
      industries,
      targetRole:     jobGoal,
    };
  }

  /* ── Proficiency guessing ──────────────────── */
  function guessProficiency(lower, skill) {
    // Expert indicators
    const expertWords   = ['expert', 'advanced', 'lead', 'architect', 'senior', 'principal', 'deep expertise', 'extensive experience'];
    const midWords      = ['proficient', 'experienced', 'intermediate', 'solid', 'worked with', 'developed'];
    const beginnerWords = ['familiar', 'basic', 'beginner', 'learning', 'exposure', 'knowledge of'];

    // Check if any context near the skill keyword suggests level
    skill.keywords.forEach(kw => {
      const idx = lower.indexOf(kw.toLowerCase());
      if (idx === -1) return;
      const ctx = lower.slice(Math.max(0, idx - 60), idx + 60);
      if (expertWords.some(w  => ctx.includes(w))) return 'Expert';
      if (midWords.some(w     => ctx.includes(w)))  return 'Intermediate';
      if (beginnerWords.some(w => ctx.includes(w))) return 'Beginner';
    });

    // Fallback: higher-weight skills in a profile tend to be stronger
    if (skill.weight >= 9) return 'Intermediate';
    if (skill.weight >= 7) return 'Intermediate';
    return 'Beginner';
  }

  /* ── Extract approximate years of experience ── */
  function extractYearsExp(lower) {
    // Patterns: "5 years", "5+ years", "five years of experience"
    const patterns = [
      /(\d+)\+?\s*years? of experience/i,
      /(\d+)\+?\s*years? experience/i,
      /experience[:\s]+(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*yrs/i,
    ];
    for (const p of patterns) {
      const m = lower.match(p);
      if (m) return parseInt(m[1]);
    }
    // Try word numbers
    const wordNums = { 'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10 };
    for (const [word, num] of Object.entries(wordNums)) {
      if (lower.includes(word + ' year')) return num;
    }
    return null;
  }

  /* ── Infer career level ─────────────────────── */
  function inferCareerLevel(yearsExp, skillCount) {
    if (yearsExp === null) {
      // Guess from skill count
      if (skillCount >= 20) return 'Senior';
      if (skillCount >= 12) return 'Mid';
      return 'Entry';
    }
    if (yearsExp >= 10) return 'Senior';
    if (yearsExp >= 5)  return 'Mid';
    if (yearsExp >= 2)  return 'Mid';
    return 'Entry';
  }

  /* ── Extract candidate name heuristic ─────────── */
  function extractName(text) {
    // Take first non-empty line and check if it looks like a name
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      // A name is typically 2–4 words, each capitalised, no special chars
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const looks = words.every(w => /^[A-Z][a-z]{1,20}$/.test(w));
        if (looks) return words.join(' ');
      }
    }
    return 'Candidate';
  }

  /* ── Infer industries ──────────────────────── */
  function inferIndustries(lower) {
    const map = [
      { name: 'FinTech',        kws: ['fintech', 'banking', 'finance', 'payment', 'blockchain', 'crypto'] },
      { name: 'Healthcare',     kws: ['healthcare', 'medical', 'hospital', 'clinical', 'patient', 'pharma'] },
      { name: 'E-Commerce',     kws: ['ecommerce', 'e-commerce', 'retail', 'shopify', 'marketplace'] },
      { name: 'SaaS',           kws: ['saas', 'software as a service', 'b2b', 'platform', 'subscription'] },
      { name: 'AI/ML',          kws: ['artificial intelligence', 'machine learning', 'ai startup'] },
      { name: 'Gaming',         kws: ['game', 'gaming', 'unity', 'unreal', 'mobile game'] },
      { name: 'Education',      kws: ['edtech', 'education', 'learning platform', 'lms', 'university'] },
      { name: 'Media',          kws: ['media', 'publishing', 'news', 'content', 'streaming'] },
      { name: 'Consulting',     kws: ['consulting', 'advisory', 'client delivery', 'professional services'] },
    ];
    return map.filter(i => i.kws.some(k => lower.includes(k))).map(i => i.name);
  }

  /* ── Build summary sentence ─────────────────── */
  function buildSummary(name, skills, level, years, goal) {
    const topCats  = [...new Set(skills.slice(0, 8).map(s => s.category))].slice(0, 3);
    const expStr   = years ? `${years} years of experience` : 'experience';
    const goalStr  = goal ? ` targeting ${goal} roles` : '';
    return `${level}-level professional with ${expStr} in ${topCats.join(', ')}${goalStr}. Demonstrates proficiency in ${skills.slice(0, 4).map(s => s.name).join(', ')} and related technologies.`;
  }

  /* ── DOM Rendering ─────────────────────────── */
  function renderDetectedSkills(skills) {
    const container = document.getElementById('detectedSkills');
    const countEl   = document.getElementById('skillCount');
    if (!container) return;
    container.innerHTML = '';
    if (countEl) countEl.textContent = skills.length;

    skills.slice(0, APP_CONFIG.MAX_SKILLS_DISPLAY).forEach(s => {
      const tag  = document.createElement('span');
      tag.className = 'skill-tag';
      const dot  = s.proficiency === 'Expert' ? 'pd-expert' : s.proficiency === 'Intermediate' ? 'pd-mid' : 'pd-low';
      tag.title  = `${s.name} · ${s.proficiency} · ${s.category}`;
      tag.innerHTML = `${esc(s.name)}<span class="prof-dot ${dot}"></span>`;
      container.appendChild(tag);
    });
  }

  function esc(s) { return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  return { analyse, renderDetectedSkills };
})();
