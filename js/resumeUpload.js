/**
 * js/resumeUpload.js
 * Drag-and-drop file upload, validation, and file reading.
 *
 * TWO-STAGE VALIDATION:
 * Stage 1 — Format check: extension + file size (instant)
 * Stage 2 — Content check: reads the file and strictly verifies it 
 * contains Experience/Education, Contact Info, and Resume Keywords.
 */

window.ResumeUpload = (function () {
  const cfg = window.APP_CONFIG || {
    ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'txt'], // Stripped images as they can't be text-verified without OCR
    MAX_FILE_SIZE_MB: 5
  };
  let _file   = null;
  let _base64 = null;
  let _text   = null;

  function r(id) { return document.getElementById(id); }

  /* ════════════════════════════════════════════
     STAGE 1 — FORMAT VALIDATION (instant)
  ════════════════════════════════════════════ */
  function validateFormat(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!cfg.ALLOWED_EXTENSIONS.includes(ext))
      return `❌ ".${ext}" files are not supported. Please upload a readable PDF, DOC, DOCX, or TXT file.`;
    
    const mb = file.size / 1024 / 1024;
    if (mb > cfg.MAX_FILE_SIZE_MB)
      return `❌ File too large (${mb.toFixed(1)} MB). Maximum allowed size is ${cfg.MAX_FILE_SIZE_MB} MB.`;
    
    if (file.size < 3 * 1024)
      return `❌ This file is too small (${(file.size/1024).toFixed(1)} KB). Please upload your actual CV/resume document.`;
    
    return null;
  }

  /* ════════════════════════════════════════════
     STAGE 2 — CONTENT VALIDATION (after reading)
  ════════════════════════════════════════════ */
  const RESUME_SIGNALS = [
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'skills', 'summary', 'objective', 'profile',
    'projects', 'certifications', 'achievements', 'accomplishments',
    'references', 'contact', 'languages', 'publications', 'awards',
    'volunteer', 'internship', 'curriculum vitae', 'resume', 'cv',
    'bachelor', 'master', 'degree', 'university', 'college', 'institute',
    'graduated', 'gpa', 'major', 'minor',
    'worked at', 'employed at', 'position', 'role', 'responsibilities',
    'managed', 'developed', 'designed', 'implemented', 'led', 'built',
    'linkedin', 'github', 'portfolio'
  ];

  const NON_RESUME_SIGNALS = [
    'invoice', 'receipt', 'tax invoice', 'bill to', 'ship to',
    'subtotal', 'total amount due', 'payment due', 'order number',
    'purchase order', 'quantity', 'unit price', 'vat', 'gst',
    'whereas', 'hereinafter', 'pursuant to', 'indemnify', 'jurisdiction',
    'termination clause', 'governing law', 'arbitration',
    'diagnosis', 'prescription', 'dosage', 'patient name', 'physician',
    'medical record', 'blood pressure', 'symptoms',
    'abstract', 'methodology', 'hypothesis', 'literature review',
    'references cited', 'bibliography', 'doi:', 'issn', 'peer reviewed',
    'ingredients', 'tablespoon', 'teaspoon', 'preheat oven', 'bake at',
    'cup of flour', 'recipe', 'serves', 'prep time', 'cook time',
    'balance sheet', 'profit and loss', 'cash flow', 'fiscal year',
    'earnings per share', 'quarterly report', 'annual report',
    'dear sir', 'dear madam', 'to whom it may concern',
    'sincerely yours', 'yours faithfully'
  ];

  function validateContent(text) {
    if (!text || text.trim().length < 50) {
      return { valid: false, reason: '❌ Could not read enough text from this file. Please make sure your resume is a readable text-based document, not a scanned image.' };
    }

    const lower = text.toLowerCase();
    const resumeHits = RESUME_SIGNALS.filter(sig => lower.includes(sig));
    const nonResumeHits = NON_RESUME_SIGNALS.filter(sig => lower.includes(sig));

    const hasEmail   = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    const hasPhone   = /(\+?\d[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}|\+\d{1,3}[\s\-]\d[\d\s\-]{7,14})/.test(text);
    
    // ─── STRICT HARD ENFORCEMENT ───
    const requiredSections = ['experience', 'work experience', 'professional experience', 'employment', 'education'];
    const hasRequiredSection = requiredSections.some(sec => lower.includes(sec));

    // 1. Check if it's blatantly something else (like an invoice)
    if (nonResumeHits.length >= 3 && resumeHits.length <= 2) {
      const docType = guessDocumentType(lower, nonResumeHits);
      return { valid: false, reason: `❌ This looks like a ${docType}, not a resume. Please upload your actual CV.` };
    }

    // 2. The Ultimate Test: Must have Sections + Contact Info + General Keywords
    if (resumeHits.length >= 3 && hasRequiredSection && (hasEmail || hasPhone)) {
      return { valid: true }; // ✅ Only verifiable resumes pass
    }

    // 3. Reject everything else
    return {
      valid: false,
      reason: `❌ This file is not recognized as a valid resume. Only documents containing explicit experience/education sections and contact information are accepted.`
    };
  }

  function guessDocumentType(lower, hits) {
    if (hits.some(h => ['invoice','receipt','bill to','subtotal','unit price','vat','gst'].includes(h))) return 'financial document or invoice';
    if (hits.some(h => ['ingredients','tablespoon','recipe','bake at','preheat'].includes(h))) return 'recipe or food document';
    if (hits.some(h => ['diagnosis','prescription','patient name','physician','medical record'].includes(h))) return 'medical document';
    if (hits.some(h => ['abstract','methodology','bibliography','doi:','literature review'].includes(h))) return 'research paper or academic report';
    if (hits.some(h => ['whereas','hereinafter','pursuant to','arbitration','governing law'].includes(h))) return 'legal document or contract';
    if (hits.some(h => ['balance sheet','fiscal year','quarterly report','annual report'].includes(h))) return 'financial report';
    if (hits.some(h => ['dear sir','dear madam','sincerely yours','to whom it may concern'].includes(h))) return 'letter or email';
    return 'non-resume document';
  }

  /* ════════════════════════════════════════════
     FILE READING HELPERS
  ════════════════════════════════════════════ */
  function readBase64(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = e => res(e.target.result.split(',')[1]);
      fr.onerror = () => rej(new Error('Read failed'));
      fr.readAsDataURL(file);
    });
  }

  function readText(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = e => res(e.target.result);
      fr.onerror = () => rej(new Error('Read failed'));
      fr.readAsText(file);
    });
  }

  async function quickExtractText(file, base64) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') return await readText(file);

    if (ext === 'pdf') {
      try {
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const raw = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
        const parts = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          parts.push(content.items.map(item => item.str).join(' '));
        }
        return parts.join('\n');
      } catch (e) {
        return ''; 
      }
    }

    if (['doc', 'docx'].includes(ext)) {
      const raw = atob(base64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      let text = '';
      for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        if (c >= 32 && c < 127) text += String.fromCharCode(c);
        else if (c === 10 || c === 13) text += ' ';
      }
      return (text.match(/[a-zA-Z][a-zA-Z0-9+#./\-]{2,30}/g) || []).join(' ');
    }

    return ''; // Fails safely for images, causing content check to reject them.
  }

  /* ════════════════════════════════════════════
     DOM HELPERS
  ════════════════════════════════════════════ */
  function fmtBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  }

  function extIcon(ext) {
    return { pdf: '📋', doc: '📝', docx: '📝', txt: '📄' }[ext] || '📄';
  }

  function showError(msg) {
    const el = r('uploadError');
    const textEl = r('uploadErrorText');
    if (!el) return;
    if (textEl) textEl.textContent = msg;
    else el.textContent = msg;
    el.style.display = 'flex';
    el.style.animation = 'none';
    el.offsetHeight; 
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.display = 'none'; }, 9000);
  }

  function clearError() {
    const el = r('uploadError');
    if (el) el.style.display = 'none';
  }

  function showPreview(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    r('fileIcon').textContent = extIcon(ext);
    r('fileName').textContent = file.name;
    r('fileSize').textContent = fmtBytes(file.size);
    r('filePreview').style.display = 'flex';
    r('jobGoalBox').style.display = 'block';
  }

  function hidePreview() {
    r('filePreview').style.display = 'none';
    r('jobGoalBox').style.display = 'none';
  }

  function showValidating() {
    const dz = r('dropZone');
    if (dz) dz.classList.add('validating');
    const btn = r('analyzeBtn');
    if (btn) btn.disabled = true;
  }

  function hideValidating() {
    const dz = r('dropZone');
    if (dz) dz.classList.remove('validating');
  }

  /* ════════════════════════════════════════════
     MAIN FILE HANDLER
  ════════════════════════════════════════════ */
  async function handleFile(file) {
    clearError();
    hidePreview();

    const formatErr = validateFormat(file);
    if (formatErr) {
      showError(formatErr);
      return;
    }

    showValidating();

    try {
      _base64 = await readBase64(file);
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt') _text = await readText(file);

      const extractedText = await quickExtractText(file, _base64);
      const contentResult = validateContent(extractedText);

      if (!contentResult.valid) {
        _file = _base64 = _text = null;
        hideValidating();
        showError(contentResult.reason);
        return;
      }

      _file = file;
      _file._extractedText = extractedText;
      hideValidating();
      showPreview(file);

    } catch (e) {
      _file = _base64 = _text = null;
      hideValidating();
      showError('❌ Could not read this file. Please check it isn\'t corrupted and try again.');
    }
  }

  /* ════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════ */
  function init() {
    const dz = r('dropZone');
    const input = r('fileInput');

    input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; });
    r('removeFile').addEventListener('click', () => {
      _file = _base64 = _text = null;
      hidePreview();
      clearError();
    });

    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    dz.addEventListener('click', e => {
      if (!['LABEL', 'INPUT'].includes(e.target.tagName)) input.click();
    });
  }

  return { init, getFile: () => _file, getBase64: () => _base64, getText: () => _text, showError, clearError };
})();