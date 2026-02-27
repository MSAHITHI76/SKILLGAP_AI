/**
 * js/recommendations.js
 * Matches missing/weak skills to curated courses from skillDatabase.js.
 * 100% offline — no API calls.
 */

window.Recommendations = (function () {

  const db  = window.SkillDB;
  const cfg = window.APP_CONFIG;

  /**
   * Build recommendations for a list of skill gaps.
   * @param {Array} missingSkills
   * @param {Array} improvementSkills
   * @returns {Array} recs — array of {skill, type, resources[]}
   */
  function build(missingSkills, improvementSkills) {
    const allSkills = [
      ...missingSkills.map(s => ({ name: s.name, type: 'missing', importance: s.importance })),
      ...improvementSkills.map(s => ({ name: s.name, type: 'improve', priority: s.priority })),
    ];

    const recs = [];

    allSkills.forEach(s => {
      const courses = db.COURSES[s.name];
      if (courses && courses.length > 0) {
        recs.push({ skill: s.name, type: s.type, importance: s.importance || s.priority, resources: courses });
      } else {
        // Generate generic search-based resources for unlisted skills
        recs.push({
          skill: s.name, type: s.type, importance: s.importance || s.priority,
          resources: buildGenericResources(s.name),
        });
      }
    });

    // Sort: Critical missing first, then High, then improvement areas
    recs.sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3, undefined: 4 };
      return (order[a.importance] ?? 4) - (order[b.importance] ?? 4);
    });

    return recs.slice(0, cfg.MAX_RECOMMENDATIONS);
  }

  /** Generate generic YouTube/Coursera search links for any skill */
  function buildGenericResources(skillName) {
    const q = encodeURIComponent(skillName + ' tutorial');
    return [
      {
        platform: 'YouTube', icon: '▶️',
        title:    `${skillName} Tutorial for Beginners`,
        desc:     `Curated YouTube tutorials to get started with ${skillName}.`,
        url:      `https://www.youtube.com/results?search_query=${q}`,
        free:     true, hrs: null, level: 'Beginner',
      },
      {
        platform: 'Coursera', icon: '🎓',
        title:    `${skillName} Courses on Coursera`,
        desc:     `Browse structured ${skillName} courses from top universities.`,
        url:      `https://www.coursera.org/search?query=${q}`,
        free:     false, hrs: null, level: 'All levels',
      },
    ];
  }

  /* ── Render ────────────────────────────────── */
  function render(recs) {
    const container = document.getElementById('recommendationsGrid');
    const filterDiv = document.getElementById('recFilter');
    if (!container) return;
    container.innerHTML = '';

    if (recs.length === 0) {
      container.innerHTML = '<p style="color:var(--text-dim)">Great news — no major gaps to address!</p>';
      return;
    }

    // Build filter buttons
    if (filterDiv) {
      const allSkills = [...new Set(recs.map(r => r.skill))];
      filterDiv.innerHTML = '<button class="rec-filter-btn active" data-filter="all">All</button>' +
        allSkills.slice(0, 8).map(s => `<button class="rec-filter-btn" data-filter="${esc(s)}">${esc(s)}</button>`).join('');
      filterDiv.querySelectorAll('.rec-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterDiv.querySelectorAll('.rec-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const f = btn.dataset.filter;
          container.querySelectorAll('.rec-card').forEach(card => {
            card.style.display = (f === 'all' || card.dataset.skill === f) ? '' : 'none';
          });
        });
      });
    }

    // Platform colors
    const pColors = {
      'YouTube': '#ff4444', 'freeCodeCamp': '#006400', 'Coursera': '#0056D2',
      'Udemy': '#a435f0', 'Kaggle': '#20beff', 'LinkedIn': '#0a66c2',
      'Google': '#4285f4', 'AWS': '#ff9900', 'Apple': '#555', 'Linux Foundation': '#222',
      'Pluralsight': '#f15b2a', 'edX': '#02262b', 'Microsoft': '#00a4ef',
    };

    recs.forEach(rec => {
      (rec.resources || []).slice(0, 2).forEach(r => {
        const color = pColors[r.platform] || '#6b7080';
        const card  = document.createElement('div');
        card.className    = 'rec-card';
        card.dataset.skill = rec.skill;

        const impBadge = rec.importance === 'Critical' ? '🔴 Critical'
                       : rec.importance === 'High'     ? '🟡 High'
                       : rec.type === 'improve'        ? '🔵 Improve'
                       : '';

        card.innerHTML = `
          <div class="rec-top">
            <span class="rec-platform" style="color:${color}">${esc(r.icon || '🌐')} ${esc(r.platform)}</span>
            ${r.free ? '<span class="rec-free-badge">FREE</span>' : ''}
          </div>
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
            <span class="rec-skill-badge">${esc(rec.skill)}</span>
            ${impBadge ? `<span style="font-size:.73rem;color:var(--text-muted)">${esc(impBadge)}</span>` : ''}
          </div>
          <div class="rec-title">${esc(r.title)}</div>
          <div class="rec-desc">${esc(r.desc || r.description || '')}</div>
          <div class="rec-meta">
            ${r.level ? `<span>📶 ${esc(r.level)}</span>` : ''}
            ${r.hrs   ? `<span>⏱ ~${r.hrs}h</span>` : ''}
          </div>
          <a class="rec-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">
            Start Learning
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        `;
        container.appendChild(card);
      });
    });
  }

  function esc(s) { return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  return { build, render };
})();
