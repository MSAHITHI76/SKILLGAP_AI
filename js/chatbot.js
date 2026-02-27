/**
 * js/chatbot.js
 * AI Career Guide chatbot — powered entirely by a local knowledge base.
 * No API key, no external calls. Smart keyword matching with contextual replies.
 */

window.Chatbot = (function () {

  const db = window.SkillDB;
  let _analysisContext = null;

  /* ── Typing indicator ─────────────────────── */
  let _counter = 0;
  function appendMsg(text, role, isTyping) {
    const id  = 'cm-' + (++_counter);
    const div = document.createElement('div');
    div.id        = id;
    div.className = `chat-msg ${role}` + (isTyping ? ' typing' : '');
    div.textContent = text;
    const msgs = document.getElementById('chatMessages');
    msgs.appendChild(div);
    msgs.scrollTop = 99999;
    return id;
  }

  function removeMsg(id) { const el = document.getElementById(id); if (el) el.remove(); }

  function formatBotReply(text) {
    // Convert plain text to simple HTML for readability
    return text.replace(/\n/g, '<br>');
  }

  /* ── Reply logic ──────────────────────────── */
  function getReply(userMsg) {
    const lower = userMsg.toLowerCase().trim();

    // Context-aware: if we have analysis data, use it
    if (_analysisContext) {
      if (/my.*gap|missing skill|what.*learn|what.*need/i.test(lower)) {
        const missing = _analysisContext.missing.slice(0, 4).map(s => s.name).join(', ');
        const role    = _analysisContext.role;
        return `Based on your resume analysis, your key skill gaps for **${role}** are: **${missing || 'none detected'}**. I've generated personalised course recommendations in the Recommendations section below. Focus on the 🔴 Critical ones first!`;
      }
      if (/score|match|percent|how good/i.test(lower)) {
        const score = _analysisContext.score;
        const tier  = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'developing';
        return `Your match score is **${score}%** — ${tier} alignment with the ${_analysisContext.role} role. ${score >= 70 ? 'You\'re in a strong position!' : 'Keep building those skills and you\'ll get there. Check your roadmap for a structured plan.'}`;
      }
      if (/roadmap|plan|steps|how long/i.test(lower)) {
        return `Your personalised roadmap is in Step 04 below. It\'s broken into 4 phases over 12 months. Phase 1 focuses on critical missing skills, Phase 2 on deepening existing ones, Phase 3 on specialisation, and Phase 4 on job applications. Most of the gaps are achievable in 3–6 months with focused effort!`;
      }
    }

    // Greetings
    if (/^(hi|hello|hey|hiya|howdy|good morning|good afternoon|good evening)/.test(lower)) {
      const greets = [
        "Hi there! I'm your AI career guide. Upload your resume to get a full analysis, or ask me anything about career paths, skills, or learning resources!",
        "Hello! Great to meet you. I can help with skill gap analysis, learning recommendations, interview prep, and career advice. What would you like to know?",
        "Hey! I'm ready to help with your career journey. What's on your mind?",
      ];
      return greets[Math.floor(Math.random() * greets.length)];
    }

    // Thanks
    if (/thank|thanks|great|awesome|helpful|perfect|nice/i.test(lower)) {
      return "Happy to help! Feel free to ask anything else — I'm here whenever you need career guidance. 😊";
    }

    // Check knowledge base
    for (const entry of db.CHAT_KB) {
      const hit = entry.q.some(kw => lower.includes(kw));
      if (hit) return entry.a;
    }

    // Check if asking about a specific skill
    for (const skill of db.SKILL_TAXONOMY) {
      if (lower.includes(skill.name.toLowerCase())) {
        const courses = db.COURSES[skill.name];
        if (courses && courses.length > 0) {
          const top = courses[0];
          return `Great question about **${skill.name}**! It falls under the **${skill.cat}** category and is considered ${skill.weight >= 9 ? 'very high demand' : 'high demand'} in the job market.\n\nBest resource to start: **${top.title}** on ${top.platform} ${top.free ? '(FREE)' : '(Paid)'}.\nLink: ${top.url}\n\nWant tips on how ${skill.name} fits into specific career paths?`;
        }
      }
    }

    // Check if asking about a job role
    for (const role of db.JOB_ROLES) {
      if (lower.includes(role.title.toLowerCase()) || lower.includes(role.title.split(' ')[0].toLowerCase())) {
        const req = role.required.slice(0, 4).join(', ');
        return `**${role.title}** is a ${role.description}\n\nTypical salary range: ${role.salary}\nCore skills needed: ${req}, and more.\n\nWant me to check how well your profile matches this role? Upload your resume in Step 1 above!`;
      }
    }

    // Default smart responses
    const defaults = [
      "That's a great question! For the most personalised answer, upload your resume and I can give you tailored advice based on your specific skill profile. In the meantime, check out the Roadmap section once your analysis is complete.",
      "I'd love to give you a specific answer! Your resume analysis above will give me the context to do that. If you haven't uploaded yet, try it — it only takes a moment and is completely free.",
      "Interesting question! Generally speaking, the best approach in tech careers is to master fundamentals deeply, build projects, and show your work publicly (GitHub, portfolio). Is there a specific skill or role you'd like me to dig into?",
      "Good thinking! Career development is most effective when you focus on one role at a time and deliberately fill the gaps. Use the analysis above to see exactly where you stand, then follow the roadmap. Anything specific you'd like to explore?",
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  /* ── Public API ───────────────────────────── */
  function setContext(ctx) { _analysisContext = ctx; }

  function send(msg) {
    if (!msg || !msg.trim()) return;
    appendMsg(msg, 'user');

    // Simulate slight thinking delay
    const typingId = appendMsg('', 'bot', true);
    const delay    = 400 + Math.random() * 600;

    setTimeout(() => {
      removeMsg(typingId);
      const reply = getReply(msg);
      const div   = document.createElement('div');
      div.className    = 'chat-msg bot';
      div.innerHTML    = reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      const msgs = document.getElementById('chatMessages');
      msgs.appendChild(div);
      msgs.scrollTop = 99999;
    }, delay);
  }

  function init() {
    const input = document.getElementById('chatInput');
    const send_ = document.getElementById('chatSend');
    const tog   = document.getElementById('chatbotToggle');
    const fab   = document.getElementById('chatFab');
    const close = document.getElementById('chatClose');
    const panel = document.getElementById('chatbotPanel');

    const toggle = () => panel.classList.toggle('open');
    if (tog)   tog.addEventListener('click', toggle);
    if (fab)   fab.addEventListener('click', toggle);
    if (close) close.addEventListener('click', () => panel.classList.remove('open'));
    if (send_) send_.addEventListener('click', () => { const v = input.value.trim(); if (v) { input.value = ''; send(v); } });
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = input.value.trim(); if (v) { input.value = ''; send(v); } } });
  }

  return { init, send, setContext };
})();

// Global helper for inline onclick chips
function askChat(q) {
  document.getElementById('chatbotPanel').classList.add('open');
  window.Chatbot.send(q);
}
