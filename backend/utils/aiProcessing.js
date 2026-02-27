/**
 * backend/utils/aiProcessing.js
 * Server-side skill analysis engine (mirrors client-side logic).
 * No external API calls required.
 */

// Inline the core skill taxonomy (subset for server use)
const SKILL_KEYWORDS = {
  'Python':        ['python','django','flask','fastapi','pandas','numpy'],
  'JavaScript':    ['javascript','js','node.js','nodejs','npm'],
  'TypeScript':    ['typescript','tsx'],
  'Java':          ['java','spring','maven','gradle'],
  'React':         ['react','reactjs','hooks','redux','next.js'],
  'SQL':           ['sql','mysql','postgresql','postgres','database'],
  'AWS':           ['aws','amazon web','ec2','s3','lambda'],
  'Docker':        ['docker','container','compose'],
  'Kubernetes':    ['kubernetes','k8s','helm'],
  'Machine Learning': ['machine learning','ml','scikit','sklearn'],
  'Deep Learning': ['deep learning','neural network','cnn','rnn'],
  'Git':           ['git','github','gitlab','version control'],
  'Linux':         ['linux','ubuntu','centos','bash','shell'],
  'CI/CD':         ['ci/cd','jenkins','github actions','pipeline'],
  'Agile/Scrum':   ['agile','scrum','kanban','sprint','jira'],
};

function extractSkills(text, jobGoal = '') {
  const lower = text.toLowerCase();
  const skills = [];
  for (const [name, kws] of Object.entries(SKILL_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) {
      skills.push({ name, proficiency: 'Intermediate', category: 'Technical' });
    }
  }
  return { skills, candidateName: 'Candidate', careerLevel: 'Mid', summary: 'Detected from resume text.' };
}

function matchJobs(profile, targetRole = '') {
  // Simple matching: return a placeholder score
  const skillCount = (profile.skills || []).length;
  const score = Math.min(95, 40 + skillCount * 2);
  return {
    suggestedRoles: [{ title: targetRole || 'Software Developer', matchScore: score, salary: '$80k–$140k' }],
    targetRoleAnalysis: { role: targetRole || 'Software Developer', matchScore: score, matchTier: 'Good', missingSkills: [], improvementAreas: [] },
    overallInsights: 'Good profile detected. Focus on gap skills to improve your match score.',
  };
}

function getRecommendations(missingSkills, improvementSkills) {
  return { recommendations: [] }; // Frontend handles full recommendations
}

function normalise(score, skillCount) {
  return Math.min(98, Math.max(10, Math.round(score + Math.min(5, skillCount / 8))));
}

module.exports = { extractSkills, matchJobs, getRecommendations, normalise };
