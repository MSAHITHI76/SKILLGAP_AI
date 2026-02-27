/**
 * js/skillDatabase.js
 * ─────────────────────────────────────────────────────────────
 * The complete knowledge base powering SkillGap AI without any API.
 * Contains: skill taxonomy, job role definitions, skill gap rules,
 * course recommendations, career insights, and chatbot knowledge.
 * ─────────────────────────────────────────────────────────────
 */

window.SkillDB = (function () {

  /* ══════════════════════════════════════════
     1. SKILL TAXONOMY
     Organised by category with keywords to detect from resume text
  ══════════════════════════════════════════ */
  const SKILL_TAXONOMY = [
    // ── Programming Languages ──
    { name: 'Python',        cat: 'Programming',  keywords: ['python', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scipy'], weight: 10 },
    { name: 'JavaScript',    cat: 'Programming',  keywords: ['javascript', 'js', 'es6', 'es2015', 'node.js', 'nodejs', 'npm', 'yarn'], weight: 10 },
    { name: 'TypeScript',    cat: 'Programming',  keywords: ['typescript', 'ts', '.tsx', '.ts'], weight: 8 },
    { name: 'Java',          cat: 'Programming',  keywords: ['java', 'spring boot', 'spring', 'maven', 'gradle', 'hibernate', 'jvm'], weight: 9 },
    { name: 'C++',           cat: 'Programming',  keywords: ['c++', 'cpp', 'stl', 'boost', 'cmake'], weight: 8 },
    { name: 'C#',            cat: 'Programming',  keywords: ['c#', 'csharp', '.net', 'dotnet', 'asp.net', 'unity'], weight: 8 },
    { name: 'Go',            cat: 'Programming',  keywords: ['golang', 'go lang', ' go ', 'goroutine'], weight: 7 },
    { name: 'Rust',          cat: 'Programming',  keywords: ['rust', 'cargo', 'rustlang'], weight: 6 },
    { name: 'Ruby',          cat: 'Programming',  keywords: ['ruby', 'rails', 'ruby on rails', 'ror', 'gem'], weight: 7 },
    { name: 'PHP',           cat: 'Programming',  keywords: ['php', 'laravel', 'symfony', 'wordpress', 'composer'], weight: 7 },
    { name: 'Swift',         cat: 'Programming',  keywords: ['swift', 'swiftui', 'xcode', 'ios', 'objective-c'], weight: 7 },
    { name: 'Kotlin',        cat: 'Programming',  keywords: ['kotlin', 'android', 'jetpack compose'], weight: 7 },
    { name: 'R',             cat: 'Programming',  keywords: [' r ', 'rstudio', 'tidyverse', 'ggplot', 'dplyr', 'shiny'], weight: 7 },
    { name: 'Scala',         cat: 'Programming',  keywords: ['scala', 'akka', 'spark', 'play framework'], weight: 6 },
    { name: 'MATLAB',        cat: 'Programming',  keywords: ['matlab', 'simulink'], weight: 5 },
    { name: 'Dart',          cat: 'Programming',  keywords: ['dart', 'flutter'], weight: 6 },
    { name: 'Shell / Bash',  cat: 'Programming',  keywords: ['bash', 'shell script', 'zsh', 'powershell', 'sh'], weight: 6 },

    // ── Frontend ──
    { name: 'React',         cat: 'Frontend',     keywords: ['react', 'reactjs', 'react.js', 'hooks', 'redux', 'next.js', 'nextjs'], weight: 9 },
    { name: 'Vue.js',        cat: 'Frontend',     keywords: ['vue', 'vuejs', 'vue.js', 'nuxt', 'vuex', 'pinia'], weight: 8 },
    { name: 'Angular',       cat: 'Frontend',     keywords: ['angular', 'angularjs', 'rxjs', 'ngrx', 'ionic'], weight: 8 },
    { name: 'HTML/CSS',      cat: 'Frontend',     keywords: ['html', 'css', 'html5', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap'], weight: 7 },
    { name: 'Svelte',        cat: 'Frontend',     keywords: ['svelte', 'sveltekit'], weight: 5 },
    { name: 'jQuery',        cat: 'Frontend',     keywords: ['jquery'], weight: 5 },
    { name: 'WebPack',       cat: 'Frontend',     keywords: ['webpack', 'vite', 'rollup', 'parcel', 'babel'], weight: 5 },
    { name: 'GraphQL',       cat: 'Frontend',     keywords: ['graphql', 'apollo', 'relay'], weight: 6 },

    // ── Backend / APIs ──
    { name: 'REST APIs',     cat: 'Backend',      keywords: ['rest', 'restful', 'api', 'http', 'json', 'xml', 'swagger', 'openapi'], weight: 8 },
    { name: 'Microservices', cat: 'Backend',      keywords: ['microservice', 'microservices', 'service mesh', 'grpc'], weight: 7 },
    { name: 'Express.js',    cat: 'Backend',      keywords: ['express', 'expressjs', 'express.js'], weight: 7 },
    { name: 'FastAPI',       cat: 'Backend',      keywords: ['fastapi', 'fast api'], weight: 6 },
    { name: 'Django',        cat: 'Backend',      keywords: ['django', 'drf', 'django rest'], weight: 7 },
    { name: 'Spring Boot',   cat: 'Backend',      keywords: ['spring boot', 'spring framework'], weight: 7 },

    // ── Databases ──
    { name: 'SQL',           cat: 'Database',     keywords: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'mssql', 'database query'], weight: 9 },
    { name: 'PostgreSQL',    cat: 'Database',     keywords: ['postgresql', 'postgres', 'psql'], weight: 7 },
    { name: 'MongoDB',       cat: 'Database',     keywords: ['mongodb', 'mongo', 'nosql', 'mongoose'], weight: 7 },
    { name: 'Redis',         cat: 'Database',     keywords: ['redis', 'cache', 'caching', 'memcached'], weight: 6 },
    { name: 'Elasticsearch', cat: 'Database',     keywords: ['elasticsearch', 'kibana', 'logstash', 'elk', 'opensearch'], weight: 6 },
    { name: 'Cassandra',     cat: 'Database',     keywords: ['cassandra', 'dynamodb', 'hbase', 'wide column'], weight: 5 },
    { name: 'Firebase',      cat: 'Database',     keywords: ['firebase', 'firestore', 'realtime database'], weight: 6 },

    // ── Cloud & DevOps ──
    { name: 'AWS',           cat: 'Cloud',        keywords: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'ecs', 'eks', 'rds', 'cloudformation'], weight: 9 },
    { name: 'Azure',         cat: 'Cloud',        keywords: ['azure', 'microsoft azure', 'azure devops', 'aks'], weight: 8 },
    { name: 'GCP',           cat: 'Cloud',        keywords: ['gcp', 'google cloud', 'bigquery', 'gke', 'cloud run'], weight: 8 },
    { name: 'Docker',        cat: 'DevOps',       keywords: ['docker', 'dockerfile', 'container', 'compose', 'docker-compose'], weight: 8 },
    { name: 'Kubernetes',    cat: 'DevOps',       keywords: ['kubernetes', 'k8s', 'helm', 'kubectl', 'pod', 'cluster'], weight: 8 },
    { name: 'CI/CD',         cat: 'DevOps',       keywords: ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis', 'pipeline'], weight: 7 },
    { name: 'Terraform',     cat: 'DevOps',       keywords: ['terraform', 'iac', 'infrastructure as code', 'pulumi', 'ansible'], weight: 7 },
    { name: 'Linux',         cat: 'DevOps',       keywords: ['linux', 'ubuntu', 'centos', 'debian', 'unix', 'bash'], weight: 7 },
    { name: 'Git',           cat: 'DevOps',       keywords: ['git', 'github', 'gitlab', 'bitbucket', 'version control'], weight: 8 },

    // ── Data Science & ML ──
    { name: 'Machine Learning', cat: 'AI/ML',    keywords: ['machine learning', 'ml', 'supervised', 'unsupervised', 'classification', 'regression', 'clustering'], weight: 9 },
    { name: 'Deep Learning',    cat: 'AI/ML',    keywords: ['deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'attention'], weight: 8 },
    { name: 'TensorFlow',       cat: 'AI/ML',    keywords: ['tensorflow', 'tf', 'keras'], weight: 7 },
    { name: 'PyTorch',          cat: 'AI/ML',    keywords: ['pytorch', 'torch'], weight: 7 },
    { name: 'Scikit-learn',     cat: 'AI/ML',    keywords: ['scikit', 'sklearn', 'scikit-learn'], weight: 7 },
    { name: 'NLP',              cat: 'AI/ML',    keywords: ['nlp', 'natural language', 'bert', 'gpt', 'llm', 'hugging face', 'spacy', 'nltk'], weight: 8 },
    { name: 'Computer Vision',  cat: 'AI/ML',    keywords: ['computer vision', 'opencv', 'image recognition', 'object detection', 'yolo'], weight: 7 },
    { name: 'Data Analysis',    cat: 'Data',     keywords: ['data analysis', 'pandas', 'numpy', 'data cleaning', 'eda', 'exploratory'], weight: 8 },
    { name: 'Data Visualization', cat: 'Data',  keywords: ['visualization', 'tableau', 'power bi', 'matplotlib', 'seaborn', 'plotly', 'd3'], weight: 7 },
    { name: 'Big Data',         cat: 'Data',     keywords: ['big data', 'hadoop', 'spark', 'kafka', 'flink', 'hdfs', 'hive'], weight: 7 },
    { name: 'Statistics',       cat: 'Data',     keywords: ['statistics', 'statistical', 'hypothesis', 'regression', 'probability', 'bayesian'], weight: 7 },
    { name: 'Data Engineering', cat: 'Data',     keywords: ['data pipeline', 'etl', 'data warehouse', 'dbt', 'airflow', 'prefect'], weight: 7 },

    // ── Security ──
    { name: 'Cybersecurity',    cat: 'Security',  keywords: ['security', 'cybersecurity', 'pentest', 'penetration', 'soc', 'siem', 'owasp'], weight: 8 },
    { name: 'Network Security', cat: 'Security',  keywords: ['firewall', 'vpn', 'ids', 'ips', 'network security', 'zero trust'], weight: 7 },
    { name: 'Cryptography',     cat: 'Security',  keywords: ['cryptography', 'encryption', 'ssl', 'tls', 'pki', 'hash'], weight: 6 },

    // ── Design / UX ──
    { name: 'UI/UX Design',    cat: 'Design',    keywords: ['ui/ux', 'ux design', 'user experience', 'user interface', 'figma', 'sketch', 'adobe xd', 'wireframe', 'prototype'], weight: 8 },
    { name: 'Figma',           cat: 'Design',    keywords: ['figma'], weight: 7 },
    { name: 'Graphic Design',  cat: 'Design',    keywords: ['graphic design', 'photoshop', 'illustrator', 'indesign', 'canva', 'adobe'], weight: 6 },

    // ── Product / Management ──
    { name: 'Product Management', cat: 'Management', keywords: ['product management', 'product manager', 'roadmap', 'user story', 'backlog', 'sprint', 'kpi', 'okr'], weight: 8 },
    { name: 'Project Management', cat: 'Management', keywords: ['project management', 'pmp', 'prince2', 'waterfall', 'gantt', 'stakeholder'], weight: 7 },
    { name: 'Agile/Scrum',    cat: 'Management', keywords: ['agile', 'scrum', 'kanban', 'sprint', 'standup', 'retrospective', 'jira'], weight: 8 },
    { name: 'Business Analysis', cat: 'Management', keywords: ['business analysis', 'requirements', 'brd', 'use case', 'process mapping'], weight: 7 },

    // ── Marketing / Growth ──
    { name: 'Digital Marketing', cat: 'Marketing', keywords: ['digital marketing', 'seo', 'sem', 'ppc', 'google ads', 'facebook ads', 'social media marketing'], weight: 8 },
    { name: 'SEO',               cat: 'Marketing', keywords: ['seo', 'search engine optimization', 'keyword research', 'link building', 'serp'], weight: 7 },
    { name: 'Content Marketing', cat: 'Marketing', keywords: ['content marketing', 'content strategy', 'copywriting', 'blog', 'editorial'], weight: 6 },
    { name: 'Analytics',         cat: 'Marketing', keywords: ['google analytics', 'ga4', 'mixpanel', 'amplitude', 'segment', 'a/b test'], weight: 7 },
    { name: 'Email Marketing',   cat: 'Marketing', keywords: ['email marketing', 'mailchimp', 'sendgrid', 'klaviyo', 'drip campaign'], weight: 6 },

    // ── Soft Skills ──
    { name: 'Leadership',        cat: 'Soft Skills', keywords: ['leadership', 'led team', 'managed team', 'mentoring', 'mentored', 'coached'], weight: 7 },
    { name: 'Communication',     cat: 'Soft Skills', keywords: ['communication', 'presentation', 'public speaking', 'written communication'], weight: 6 },
    { name: 'Problem Solving',   cat: 'Soft Skills', keywords: ['problem solving', 'analytical', 'critical thinking', 'troubleshooting'], weight: 6 },
    { name: 'Collaboration',     cat: 'Soft Skills', keywords: ['collaboration', 'teamwork', 'cross-functional', 'stakeholder management'], weight: 6 },
  ];

  /* ══════════════════════════════════════════
     2. JOB ROLE DEFINITIONS
     Each role lists required/preferred skills and salary ranges
  ══════════════════════════════════════════ */
  const JOB_ROLES = [
    {
      title:      'Full Stack Developer',
      icon:       '💻',
      salary:     '$75k–$140k',
      required:   ['JavaScript', 'HTML/CSS', 'React', 'REST APIs', 'SQL', 'Git'],
      preferred:  ['TypeScript', 'Node.js', 'Docker', 'AWS', 'GraphQL', 'MongoDB'],
      description:'Builds complete web applications across frontend and backend.',
    },
    {
      title:      'Frontend Developer',
      icon:       '🎨',
      salary:     '$65k–$130k',
      required:   ['JavaScript', 'HTML/CSS', 'React', 'Git'],
      preferred:  ['TypeScript', 'Vue.js', 'WebPack', 'GraphQL', 'UI/UX Design'],
      description:'Specialises in creating user interfaces and web experiences.',
    },
    {
      title:      'Backend Developer',
      icon:       '⚙️',
      salary:     '$75k–$145k',
      required:   ['Python', 'SQL', 'REST APIs', 'Git', 'Linux'],
      preferred:  ['Docker', 'AWS', 'Microservices', 'Redis', 'CI/CD'],
      description:'Builds server-side logic, APIs, and database architecture.',
    },
    {
      title:      'Data Scientist',
      icon:       '🔬',
      salary:     '$90k–$160k',
      required:   ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis'],
      preferred:  ['TensorFlow', 'PyTorch', 'Deep Learning', 'Big Data', 'Data Visualization'],
      description:'Derives insights from data using statistical and ML methods.',
    },
    {
      title:      'Machine Learning Engineer',
      icon:       '🤖',
      salary:     '$110k–$190k',
      required:   ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'SQL'],
      preferred:  ['PyTorch', 'MLOps', 'Docker', 'Kubernetes', 'NLP', 'Big Data'],
      description:'Deploys and scales ML models in production environments.',
    },
    {
      title:      'Data Analyst',
      icon:       '📊',
      salary:     '$55k–$100k',
      required:   ['SQL', 'Data Analysis', 'Data Visualization', 'Excel', 'Statistics'],
      preferred:  ['Python', 'Tableau', 'R', 'Power BI'],
      description:'Interprets data to support business decision-making.',
    },
    {
      title:      'Data Engineer',
      icon:       '🔧',
      salary:     '$90k–$160k',
      required:   ['Python', 'SQL', 'Big Data', 'Data Engineering', 'Linux'],
      preferred:  ['Spark', 'Kafka', 'Airflow', 'AWS', 'Docker'],
      description:'Builds and maintains data pipelines and infrastructure.',
    },
    {
      title:      'DevOps Engineer',
      icon:       '🚀',
      salary:     '$90k–$160k',
      required:   ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Git', 'Shell / Bash'],
      preferred:  ['AWS', 'Terraform', 'Ansible', 'Monitoring', 'Python'],
      description:'Manages infrastructure, deployment pipelines, and reliability.',
    },
    {
      title:      'Cloud Architect',
      icon:       '☁️',
      salary:     '$120k–$200k',
      required:   ['AWS', 'Docker', 'Kubernetes', 'Microservices', 'Terraform'],
      preferred:  ['Azure', 'GCP', 'CI/CD', 'Security', 'Networking'],
      description:'Designs and oversees cloud infrastructure strategy.',
    },
    {
      title:      'Product Manager',
      icon:       '📱',
      salary:     '$90k–$160k',
      required:   ['Product Management', 'Agile/Scrum', 'Analytics', 'Communication', 'Leadership'],
      preferred:  ['SQL', 'UI/UX Design', 'Business Analysis', 'Roadmap', 'A/B Testing'],
      description:'Owns product vision, roadmap, and cross-functional delivery.',
    },
    {
      title:      'UX Designer',
      icon:       '✏️',
      salary:     '$70k–$130k',
      required:   ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Communication'],
      preferred:  ['HTML/CSS', 'Graphic Design', 'Analytics', 'Usability Testing'],
      description:'Researches user needs and designs intuitive digital experiences.',
    },
    {
      title:      'Cybersecurity Analyst',
      icon:       '🔐',
      salary:     '$80k–$150k',
      required:   ['Cybersecurity', 'Network Security', 'Linux', 'Shell / Bash'],
      preferred:  ['Python', 'Cryptography', 'Cloud Security', 'Incident Response'],
      description:'Protects systems and networks from threats and vulnerabilities.',
    },
    {
      title:      'Digital Marketing Manager',
      icon:       '📣',
      salary:     '$55k–$110k',
      required:   ['Digital Marketing', 'SEO', 'Analytics', 'Content Marketing'],
      preferred:  ['Email Marketing', 'Social Media', 'PPC', 'Communication', 'Leadership'],
      description:'Drives brand growth through multi-channel digital strategies.',
    },
    {
      title:      'iOS Developer',
      icon:       '🍎',
      salary:     '$90k–$160k',
      required:   ['Swift', 'iOS', 'Xcode', 'REST APIs', 'Git'],
      preferred:  ['SwiftUI', 'Kotlin', 'Firebase', 'CI/CD'],
      description:'Builds native iOS applications for Apple devices.',
    },
    {
      title:      'Android Developer',
      icon:       '🤖',
      salary:     '$85k–$155k',
      required:   ['Kotlin', 'Android', 'REST APIs', 'Git', 'SQL'],
      preferred:  ['Java', 'Firebase', 'CI/CD', 'Jetpack Compose'],
      description:'Develops native Android applications and mobile experiences.',
    },
    {
      title:      'Java Developer',
      icon:       '☕',
      salary:     '$80k–$150k',
      required:   ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'Git'],
      preferred:  ['Microservices', 'Docker', 'Kafka', 'AWS'],
      description:'Builds enterprise applications using Java and its ecosystem.',
    },
    {
      title:      'React Developer',
      icon:       '⚛️',
      salary:     '$70k–$135k',
      required:   ['React', 'JavaScript', 'HTML/CSS', 'REST APIs', 'Git'],
      preferred:  ['TypeScript', 'Next.js', 'GraphQL', 'Testing', 'Redux'],
      description:'Builds dynamic web UIs with the React ecosystem.',
    },
    {
      title:      'Python Developer',
      icon:       '🐍',
      salary:     '$75k–$140k',
      required:   ['Python', 'REST APIs', 'SQL', 'Git', 'Linux'],
      preferred:  ['Django', 'FastAPI', 'Docker', 'AWS', 'Testing'],
      description:'Develops backends, scripts, and automation in Python.',
    },
    {
      title:      'Scrum Master',
      icon:       '🏃',
      salary:     '$80k–$130k',
      required:   ['Agile/Scrum', 'Project Management', 'Communication', 'Leadership', 'Collaboration'],
      preferred:  ['Jira', 'Product Management', 'Business Analysis'],
      description:'Facilitates Agile processes and removes blockers for dev teams.',
    },
    {
      title:      'Solutions Architect',
      icon:       '🏛️',
      salary:     '$130k–$200k',
      required:   ['AWS', 'Microservices', 'SQL', 'REST APIs', 'Communication'],
      preferred:  ['Azure', 'GCP', 'Docker', 'Kubernetes', 'Security'],
      description:'Designs scalable technical solutions aligned with business goals.',
    },
  ];

  /* ══════════════════════════════════════════
     3. COURSE RECOMMENDATIONS DATABASE
     Real courses with accurate URLs per skill
  ══════════════════════════════════════════ */
  const COURSES = {
    'Python': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Python for Beginners - Full Course', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', free: true, hrs: 4.5, level: 'Beginner', desc: 'Complete Python tutorial covering basics to OOP concepts.' },
      { platform: 'Coursera',     icon: '🎓', title: 'Python for Everybody Specialization', url: 'https://www.coursera.org/specializations/python', free: false, hrs: 120, level: 'Beginner', desc: 'University of Michigan\'s popular Python specialization.' },
      { platform: 'Udemy',        icon: '🟣', title: 'The Complete Python Bootcamp', url: 'https://www.udemy.com/course/complete-python-bootcamp/', free: false, hrs: 22, level: 'Beginner', desc: 'From zero to hero — comprehensive Python course.' },
    ],
    'Machine Learning': [
      { platform: 'Coursera',     icon: '🎓', title: 'Machine Learning Specialization (Andrew Ng)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', free: false, hrs: 90, level: 'Intermediate', desc: 'The gold standard ML course by Stanford Professor Andrew Ng.' },
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Machine Learning with Python - Full Course', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', free: true, hrs: 4, level: 'Intermediate', desc: 'Practical ML techniques using Python and scikit-learn.' },
      { platform: 'Kaggle',       icon: '📊', title: 'Intro to Machine Learning', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', free: true, hrs: 3, level: 'Beginner', desc: 'Hands-on ML learning through real Kaggle datasets.' },
    ],
    'Deep Learning': [
      { platform: 'Coursera',     icon: '🎓', title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning', free: false, hrs: 160, level: 'Advanced', desc: 'Andrew Ng\'s deep learning specialization — industry standard.' },
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Deep Learning with PyTorch', url: 'https://www.youtube.com/watch?v=GIsg-ZUy0MY', free: true, hrs: 10, level: 'Intermediate', desc: 'Complete deep learning course using PyTorch framework.' },
    ],
    'JavaScript': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', free: true, hrs: 300, level: 'Beginner', desc: 'Comprehensive JS curriculum with hands-on projects and certification.' },
      { platform: 'Udemy',        icon: '🟣', title: 'The Complete JavaScript Course 2024', url: 'https://www.udemy.com/course/the-complete-javascript-course/', free: false, hrs: 68, level: 'Beginner', desc: 'Modern JavaScript from fundamentals to advanced concepts.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'JavaScript Full Course for Beginners', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', free: true, hrs: 3.5, level: 'Beginner', desc: 'Concise introduction to JavaScript basics and DOM manipulation.' },
    ],
    'React': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'React JS Full Course', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8', free: true, hrs: 12, level: 'Intermediate', desc: 'Complete React course with hooks, context, and real projects.' },
      { platform: 'Udemy',        icon: '🟣', title: 'React - The Complete Guide', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', free: false, hrs: 48, level: 'Intermediate', desc: 'Dive deep into React, Redux, React Router, and Next.js.' },
      { platform: 'Coursera',     icon: '🎓', title: 'Meta Frontend Developer Certificate', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', free: false, hrs: 240, level: 'Beginner', desc: 'Official Meta certificate covering HTML, CSS, JS, and React.' },
    ],
    'TypeScript': [
      { platform: 'Udemy',        icon: '🟣', title: 'Understanding TypeScript', url: 'https://www.udemy.com/course/understanding-typescript/', free: false, hrs: 22, level: 'Intermediate', desc: 'Master TypeScript with hands-on projects and real-world examples.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'TypeScript Full Course for Beginners', url: 'https://www.youtube.com/watch?v=30LWjhZzg50', free: true, hrs: 3, level: 'Beginner', desc: 'Learn TypeScript from scratch with clear explanations.' },
    ],
    'SQL': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'SQL Tutorial - Full Database Course', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', free: true, hrs: 4.5, level: 'Beginner', desc: 'Complete SQL database course covering queries, joins, and optimization.' },
      { platform: 'Kaggle',       icon: '📊', title: 'Intro to SQL', url: 'https://www.kaggle.com/learn/intro-to-sql', free: true, hrs: 3, level: 'Beginner', desc: 'Learn SQL with BigQuery through hands-on exercises.' },
      { platform: 'Coursera',     icon: '🎓', title: 'SQL for Data Science (UC Davis)', url: 'https://www.coursera.org/learn/sql-for-data-science', free: false, hrs: 16, level: 'Beginner', desc: 'SQL fundamentals for data analysis use cases.' },
    ],
    'AWS': [
      { platform: 'AWS',          icon: '🔵', title: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', free: true, hrs: 6, level: 'Beginner', desc: 'Official AWS free training for cloud fundamentals and certification prep.' },
      { platform: 'Udemy',        icon: '🟣', title: 'AWS Certified Solutions Architect', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/', free: false, hrs: 26, level: 'Intermediate', desc: 'Comprehensive prep for the AWS Solutions Architect exam.' },
    ],
    'Docker': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Docker Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', free: true, hrs: 2, level: 'Beginner', desc: 'Learn Docker containers from scratch with practical exercises.' },
      { platform: 'Udemy',        icon: '🟣', title: 'Docker & Kubernetes: The Practical Guide', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', free: false, hrs: 24, level: 'Intermediate', desc: 'Master Docker and Kubernetes for real-world deployments.' },
    ],
    'Kubernetes': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Kubernetes Course for Beginners', url: 'https://www.youtube.com/watch?v=d6WC5n9G_sM', free: true, hrs: 4, level: 'Intermediate', desc: 'Full Kubernetes course with hands-on cluster management.' },
      { platform: 'Linux Foundation', icon: '🐧', title: 'Kubernetes and Cloud Native Essentials (LFS250)', url: 'https://training.linuxfoundation.org/training/kubernetes-and-cloud-native-essentials-lfs250/', free: false, hrs: 14, level: 'Beginner', desc: 'Official Linux Foundation course for Kubernetes fundamentals.' },
    ],
    'UI/UX Design': [
      { platform: 'Coursera',     icon: '🎓', title: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design', free: false, hrs: 200, level: 'Beginner', desc: 'Beginner-friendly Google certificate to launch a UX career.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'UX Design Crash Course', url: 'https://www.youtube.com/watch?v=_lyzy-vChh4', free: true, hrs: 1.5, level: 'Beginner', desc: 'Quick introduction to UX principles, wireframing, and user research.' },
    ],
    'Figma': [
      { platform: 'YouTube',      icon: '▶️',  title: 'Figma UI Design Tutorial: Get Started in 24 Minutes', url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8', free: true, hrs: 0.5, level: 'Beginner', desc: 'Fast-track intro to Figma\'s core tools and design workflow.' },
      { platform: 'Coursera',     icon: '🎓', title: 'UI/UX Design with Figma', url: 'https://www.coursera.org/learn/ui-ux-design', free: false, hrs: 20, level: 'Intermediate', desc: 'Design complete UI systems and prototypes in Figma.' },
    ],
    'Data Analysis': [
      { platform: 'Kaggle',       icon: '📊', title: 'Pandas for Data Analysis', url: 'https://www.kaggle.com/learn/pandas', free: true, hrs: 4, level: 'Beginner', desc: 'Hands-on pandas course using real datasets.' },
      { platform: 'Coursera',     icon: '🎓', title: 'Google Data Analytics Certificate', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', free: false, hrs: 240, level: 'Beginner', desc: 'Comprehensive data analytics training by Google.' },
    ],
    'Data Visualization': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Data Visualization with D3.js', url: 'https://www.youtube.com/watch?v=_8V5o2UHG0E', free: true, hrs: 13, level: 'Intermediate', desc: 'Build powerful interactive charts with D3.js.' },
      { platform: 'Coursera',     icon: '🎓', title: 'Data Visualization with Tableau', url: 'https://www.coursera.org/specializations/data-visualization', free: false, hrs: 80, level: 'Beginner', desc: 'Learn Tableau to create compelling visual stories from data.' },
    ],
    'TensorFlow': [
      { platform: 'Coursera',     icon: '🎓', title: 'TensorFlow Developer Certificate', url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice', free: false, hrs: 100, level: 'Intermediate', desc: 'Official TensorFlow certification program by deeplearning.ai.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'TensorFlow 2.0 Complete Course', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk', free: true, hrs: 7, level: 'Intermediate', desc: 'Full TensorFlow 2.0 crash course with neural network projects.' },
    ],
    'PyTorch': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'PyTorch for Deep Learning - Full Course', url: 'https://www.youtube.com/watch?v=V_xro1bcAuA', free: true, hrs: 26, level: 'Intermediate', desc: 'Comprehensive PyTorch tutorial covering tensors to transformers.' },
    ],
    'NLP': [
      { platform: 'Coursera',     icon: '🎓', title: 'Natural Language Processing Specialization', url: 'https://www.coursera.org/specializations/natural-language-processing', free: false, hrs: 160, level: 'Advanced', desc: 'Deep NLP specialization from deeplearning.ai with Hugging Face.' },
      { platform: 'Kaggle',       icon: '📊', title: 'Natural Language Processing', url: 'https://www.kaggle.com/learn/natural-language-processing', free: true, hrs: 3, level: 'Intermediate', desc: 'Practical NLP using spaCy and real text datasets.' },
    ],
    'Big Data': [
      { platform: 'Coursera',     icon: '🎓', title: 'IBM Data Engineering Professional Certificate', url: 'https://www.coursera.org/professional-certificates/ibm-data-engineer', free: false, hrs: 480, level: 'Intermediate', desc: 'Full data engineering curriculum including Spark and Kafka.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'Apache Spark Tutorial for Beginners', url: 'https://www.youtube.com/watch?v=S2MUhGA3lEw', free: true, hrs: 2, level: 'Intermediate', desc: 'Learn Apache Spark for large-scale data processing.' },
    ],
    'Git': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Git and GitHub for Beginners', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', free: true, hrs: 1.5, level: 'Beginner', desc: 'Friendly intro to Git version control and GitHub collaboration.' },
    ],
    'CI/CD': [
      { platform: 'YouTube',      icon: '▶️',  title: 'CI/CD Pipeline with GitHub Actions', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI', free: true, hrs: 2, level: 'Intermediate', desc: 'Build real CI/CD pipelines using GitHub Actions from scratch.' },
    ],
    'Cybersecurity': [
      { platform: 'Coursera',     icon: '🎓', title: 'Google Cybersecurity Certificate', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', free: false, hrs: 182, level: 'Beginner', desc: 'Google\'s official cybersecurity certificate for career starters.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'Ethical Hacking Full Course', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE', free: true, hrs: 9, level: 'Intermediate', desc: 'Learn ethical hacking, penetration testing, and security tools.' },
    ],
    'Digital Marketing': [
      { platform: 'Google',       icon: '🔵', title: 'Google Digital Marketing & E-commerce Certificate', url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce', free: false, hrs: 180, level: 'Beginner', desc: 'Google\'s professional certificate covering all digital marketing channels.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'Digital Marketing Full Course', url: 'https://www.youtube.com/watch?v=nU-IIXBWlS4', free: true, hrs: 5, level: 'Beginner', desc: 'Complete digital marketing overview from SEO to social media.' },
    ],
    'SEO': [
      { platform: 'YouTube',      icon: '▶️',  title: 'SEO Tutorial For Beginners', url: 'https://www.youtube.com/watch?v=xsVTqzratPs', free: true, hrs: 2, level: 'Beginner', desc: 'Learn SEO from scratch with proven techniques.' },
      { platform: 'Coursera',     icon: '🎓', title: 'SEO Specialization (UC Davis)', url: 'https://www.coursera.org/specializations/seo', free: false, hrs: 120, level: 'Intermediate', desc: 'Deep SEO specialization covering technical, content, and analytics.' },
    ],
    'Agile/Scrum': [
      { platform: 'Coursera',     icon: '🎓', title: 'Agile with Atlassian Jira', url: 'https://www.coursera.org/learn/agile-atlassian-jira', free: false, hrs: 14, level: 'Beginner', desc: 'Learn Agile methodology and Scrum using Jira.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'Scrum Explained in 10 Minutes', url: 'https://www.youtube.com/watch?v=9TycLR0TqFA', free: true, hrs: 0.2, level: 'Beginner', desc: 'Quick and clear explanation of Scrum framework and ceremonies.' },
    ],
    'Product Management': [
      { platform: 'Coursera',     icon: '🎓', title: 'Google Project Management Certificate', url: 'https://www.coursera.org/professional-certificates/google-project-management', free: false, hrs: 180, level: 'Beginner', desc: 'Google\'s industry-recognized project management professional certificate.' },
      { platform: 'LinkedIn',     icon: '💼', title: 'Product Management Foundations', url: 'https://www.linkedin.com/learning/product-management-foundations', free: false, hrs: 5, level: 'Beginner', desc: 'Core concepts for aspiring and early-stage product managers.' },
    ],
    'Statistics': [
      { platform: 'Coursera',     icon: '🎓', title: 'Statistics with Python Specialization', url: 'https://www.coursera.org/specializations/statistics-with-python', free: false, hrs: 80, level: 'Intermediate', desc: 'University of Michigan statistics course using Python.' },
      { platform: 'YouTube',      icon: '▶️',  title: 'Statistics for Data Science Full Course', url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', free: true, hrs: 4, level: 'Beginner', desc: 'Statistics fundamentals every data scientist needs to know.' },
    ],
    'Linux': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Linux Command Line Full Course', url: 'https://www.youtube.com/watch?v=sWbUDq4S6Y8', free: true, hrs: 5, level: 'Beginner', desc: 'Master the Linux command line from basics to scripting.' },
    ],
    'Java': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Java Full Course for Beginners', url: 'https://www.youtube.com/watch?v=GoXwIVyNvX0', free: true, hrs: 12, level: 'Beginner', desc: 'Comprehensive Java programming course with OOP and projects.' },
      { platform: 'Coursera',     icon: '🎓', title: 'Java Programming Masterclass (Tim Buchalka)', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', free: false, hrs: 80, level: 'Beginner', desc: 'Most comprehensive Java course on Udemy with 900k+ students.' },
    ],
    'Terraform': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Terraform Course for Beginners', url: 'https://www.youtube.com/watch?v=SLB_c_ayRMo', free: true, hrs: 2, level: 'Beginner', desc: 'Learn Infrastructure as Code with Terraform step by step.' },
    ],
    'Kotlin': [
      { platform: 'Coursera',     icon: '🎓', title: 'Android App Development with Kotlin', url: 'https://www.coursera.org/specializations/meta-android-developer', free: false, hrs: 240, level: 'Beginner', desc: 'Meta\'s official Android development certificate using Kotlin.' },
    ],
    'Swift': [
      { platform: 'Apple',        icon: '🍎', title: 'Swift Playgrounds & Develop in Swift', url: 'https://developer.apple.com/swift/resources/', free: true, hrs: 40, level: 'Beginner', desc: 'Official Apple curriculum for learning Swift and iOS development.' },
    ],
    'GraphQL': [
      { platform: 'YouTube',      icon: '▶️',  title: 'GraphQL Full Course for Beginners', url: 'https://www.youtube.com/watch?v=ed8SzALpx1Q', free: true, hrs: 4, level: 'Intermediate', desc: 'Complete GraphQL tutorial with Apollo Server and React.' },
    ],
    'REST APIs': [
      { platform: 'YouTube',      icon: '▶️',  title: 'REST API Design Best Practices', url: 'https://www.youtube.com/watch?v=7nm1pYuKAhY', free: true, hrs: 1, level: 'Intermediate', desc: 'Best practices for designing clean, scalable REST APIs.' },
    ],
    'HTML/CSS': [
      { platform: 'freeCodeCamp', icon: '🔥', title: 'Responsive Web Design Certification', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', free: true, hrs: 300, level: 'Beginner', desc: 'Free certification covering HTML, CSS, Flexbox, Grid, and responsive design.' },
    ],
    'Leadership': [
      { platform: 'Coursera',     icon: '🎓', title: 'Leadership and Management Specialization', url: 'https://www.coursera.org/specializations/leadership-management-wharton', free: false, hrs: 100, level: 'Intermediate', desc: 'Wharton School\'s leadership and organizational management curriculum.' },
    ],
  };

  // Generic fallback for skills without specific courses
  const GENERIC_COURSES = {
    'Udemy':    { icon: '🟣', url: 'https://www.udemy.com/courses/search/?q=' },
    'YouTube':  { icon: '▶️',  url: 'https://www.youtube.com/results?search_query=' },
    'Coursera': { icon: '🎓', url: 'https://www.coursera.org/search?query=' },
  };

  /* ══════════════════════════════════════════
     4. CAREER INSIGHTS (by career level)
  ══════════════════════════════════════════ */
  const INSIGHTS = {
    high: [
      "Your profile shows strong alignment with the target role. You've built a solid foundation of in-demand skills. Focus on deepening expertise in the critical gap areas rather than spreading yourself thin. Consider contributing to open source or building a portfolio project that showcases your most advanced capabilities.",
      "With a match score in the excellent range, you're well-positioned for this career path. The remaining gaps represent opportunities for rapid advancement. Prioritise obtaining a relevant certification — it can make a significant difference in competitive hiring processes.",
    ],
    good: [
      "You have a solid foundation to build on. Your existing skills are highly relevant, and the gap areas are addressable within 3–6 months of focused learning. Many successful professionals in this field started with a similar profile to yours.",
      "Your background shows genuine aptitude for this role. Focus on the critical missing skills first — these tend to be the dealbreakers in technical screenings. Once those are in place, the good-to-have skills will follow naturally through on-the-job experience.",
    ],
    fair: [
      "There's a real opportunity here, but it will require dedicated upskilling. The good news: most of the critical skills can be learned through structured online courses in under 6 months. Start with the free resources listed below to test your interest before committing to paid programmes.",
      "This role may require a 6–12 month learning investment, but it's absolutely achievable. Many career changers successfully make this transition each year. Focus on building a small portfolio of projects to demonstrate practical ability — this matters more than certificates to many employers.",
    ],
    poor: [
      "This is an ambitious target role given your current skill set — but ambition is good! You'll likely need 12–18 months of focused upskilling. Consider whether a bridging role (something closer to your current skills) might be a stepping stone that lets you earn while you learn.",
      "The skills gap here is significant but not insurmountable. Break the journey into phases: start with one or two foundational skills from the Critical list, build a small project, then progressively add more. The structured roadmap below maps a realistic path forward.",
    ],
  };

  /* ══════════════════════════════════════════
     5. CHATBOT KNOWLEDGE BASE
  ══════════════════════════════════════════ */
  const CHAT_KB = [
    { q: ['how long', 'learn python', 'python time'], a: "Learning Python basics takes 4–8 weeks with consistent daily practice (1–2 hrs). To become job-ready, expect 4–6 months. The freeCodeCamp Python course and Automate the Boring Stuff (free book) are excellent starting points." },
    { q: ['switch', 'career change', 'transition'], a: "Career switching is very common in tech! Key steps: 1) Identify transferable skills from your current role. 2) Pick ONE target role to focus on. 3) Learn 2–3 critical missing skills. 4) Build 2–3 portfolio projects. 5) Network on LinkedIn. Most successful career changers take 6–12 months of part-time learning." },
    { q: ['salary', 'pay', 'earn', 'income'], a: "Salaries vary by location, company, and experience. Generally: Junior roles $55k–$85k, Mid-level $80k–$130k, Senior $120k–$180k+. Tech hubs like San Francisco, New York, Seattle pay 30–50% more. Negotiate — most first offers have room to increase by 10–20%." },
    { q: ['skills', 'demand', '2025', 'trending', 'in demand'], a: "The most in-demand skills in 2025 are: AI/ML Engineering, Cloud Architecture (AWS/Azure), Cybersecurity, Data Engineering, React/TypeScript, DevOps/Platform Engineering, and Product Management. Soft skills — communication, leadership, and problem-solving — remain as valuable as ever." },
    { q: ['resume', 'cv', 'write', 'improve resume'], a: "Strong resume tips: 1) Lead with impact metrics (e.g. 'reduced API latency by 40%'). 2) Use the job description's exact keywords. 3) Keep it to 1–2 pages max. 4) Put skills near the top. 5) Include a GitHub link with active projects. Tools: Resume.io, Zety, or Enhancv for templates." },
    { q: ['interview', 'prepare', 'technical interview', 'coding interview'], a: "For technical interviews: practice LeetCode (start with Easy/Medium), master system design basics (YouTube: Gaurav Sen, ByteByteGo), do mock interviews on Pramp or Interviewing.io. For behavioral rounds, use the STAR method (Situation, Task, Action, Result)." },
    { q: ['certificate', 'certification', 'course'], a: "Top respected certifications by field: Cloud → AWS SAA, GCP ACE, Azure AZ-900. Data → Google Data Analytics, IBM Data Science. ML → TensorFlow Developer, AWS ML Specialty. Security → CompTIA Security+, CEH. Project Mgmt → PMP, PMI-ACP. Scrum → PSM, CSM." },
    { q: ['freelance', 'remote', 'work from home'], a: "Best platforms for tech freelancers: Upwork, Toptal (high-paying), Fiverr, Gun.io, Contra, and Arc.dev. Build a strong portfolio, collect testimonials, and start with competitive pricing. Remote-first companies worth targeting: GitLab, Automattic, Basecamp, InVision, Zapier." },
    { q: ['linkedin', 'network', 'networking'], a: "LinkedIn tips: 1) Add a professional photo and banner. 2) Write a headline with your value proposition. 3) Use the About section to tell your story. 4) Post weekly about your learning journey. 5) Connect with 5 people in your target field per week. 6) Engage thoughtfully on others' posts." },
    { q: ['portfolio', 'projects', 'github'], a: "For a standout portfolio: build 2–3 substantial projects (not just tutorials), deploy them live (Vercel, Railway, Render are free), write clear READMEs, and pin them on GitHub. For data roles: a Kaggle notebook + blog post is very effective. For frontend: clone a real app with improvements." },
    { q: ['bootcamp', 'coding bootcamp'], a: "Bootcamps work — but research carefully. Top-rated: App Academy, Flatiron School, Hack Reactor, Le Wagon. Cost: $10k–$20k for in-person, $3k–$10k online. Self-teaching is viable and cheaper if you're disciplined. A bootcamp's real value is structure, accountability, and job placement support." },
    { q: ['best', 'resource', 'free', 'learn'], a: "Best free resources: freeCodeCamp.org (web dev), CS50 Harvard (programming fundamentals), Kaggle Learn (data/ML), Google Digital Garage (digital marketing), MIT OpenCourseWare (advanced topics), The Odin Project (full-stack), and Exercism.io (language practice)." },
  ];

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */
  return { SKILL_TAXONOMY, JOB_ROLES, COURSES, GENERIC_COURSES, INSIGHTS, CHAT_KB };

})();
