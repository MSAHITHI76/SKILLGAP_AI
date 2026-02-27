/**
 * js/resumeUpload.js
 * Drag-and-drop file upload, validation, and file reading.
 *
 * TWO-STAGE VALIDATION:
 *   Stage 1 — Format check: extension + file size (instant)
 *   Stage 2 — Content check: reads the file and verifies it looks like
 *             a resume/CV, not an invoice, recipe, photo album, etc.
 */

window.ResumeUpload = (function () {
  const cfg = window.APP_CONFIG;
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
      return `❌ ".${ext}" files are not supported. Please upload your resume as PDF, DOC, DOCX, PNG, or JPG.`;
    const mb = file.size / 1024 / 1024;
    if (mb > cfg.MAX_FILE_SIZE_MB)
      return `❌ File too large (${mb.toFixed(1)} MB). Maximum allowed size is ${cfg.MAX_FILE_SIZE_MB} MB.`;
    // Suspiciously tiny files (< 3 KB) are almost certainly not resumes
    if (file.size < 3 * 1024)
      return `❌ This file is too small (${(file.size/1024).toFixed(1)} KB) to be a resume. Please upload your actual CV/resume document.`;
    return null;
  }

  /* ════════════════════════════════════════════
     STAGE 2 — CONTENT VALIDATION (after reading)
     Scans extracted text for resume signals.
  ════════════════════════════════════════════ */

  /**
   * Resume SIGNAL keywords — strong indicators the document is a CV/resume.
   * Even a minimal resume will hit several of these.
   */
  const RESUME_SIGNALS = [
    // Section headings
    'experience', 'work experience', 'professional experience', 'employment',
    'education', 'skills', 'summary', 'objective', 'profile',
    'projects', 'certifications', 'achievements', 'accomplishments',
    'references', 'contact', 'languages', 'publications', 'awards',
    'volunteer', 'internship', 'curriculum vitae', 'resume', 'cv',
    // Career vocabulary
    'bachelor', 'master', 'degree', 'university', 'college', 'institute',
    'graduated', 'gpa', 'major', 'minor',
    'worked at', 'employed at', 'position', 'role', 'responsibilities',
    'managed', 'developed', 'designed', 'implemented', 'led', 'built',
    'linkedin', 'github', 'portfolio',
    // Contact patterns handled separately via regex
  ];

  /**
   * NON-RESUME SIGNALS — strong indicators the document is something else.
   * If too many of these appear with no resume signals, reject.
   */
  const NON_RESUME_SIGNALS = [
    // Invoices / receipts
    'invoice', 'receipt', 'tax invoice', 'bill to', 'ship to',
    'subtotal', 'total amount due', 'payment due', 'order number',
    'purchase order', 'quantity', 'unit price', 'vat', 'gst',
    // Legal / contracts
    'whereas', 'hereinafter', 'pursuant to', 'indemnify', 'jurisdiction',
    'termination clause', 'governing law', 'arbitration',
    // Medical
    'diagnosis', 'prescription', 'dosage', 'patient name', 'physician',
    'medical record', 'blood pressure', 'symptoms',
    // Academic papers / reports
    'abstract', 'methodology', 'hypothesis', 'literature review',
    'references cited', 'bibliography', 'doi:', 'issn', 'peer reviewed',
    // Food / recipes
    'ingredients', 'tablespoon', 'teaspoon', 'preheat oven', 'bake at',
    'cup of flour', 'recipe', 'serves', 'prep time', 'cook time',
    // Financial reports
    'balance sheet', 'profit and loss', 'cash flow', 'fiscal year',
    'earnings per share', 'quarterly report', 'annual report',
    // Random documents
    'dear sir', 'dear madam', 'to whom it may concern',
    'sincerely yours', 'yours faithfully',
  ];

  /**
   * Analyse extracted text to decide if it's a resume.
   * Returns { valid: true } or { valid: false, reason: string }
   */
  function validateContent(text) {
    if (!text || text.trim().length < 50) {
      return { valid: false, reason: '❌ Could not read enough content from this file. Please make sure your resume is a readable PDF, DOCX, or TXT file — not a scanned image with no selectable text.' };
    }

    const lower = text.toLowerCase();

    // Count resume signals
    const resumeHits = RESUME_SIGNALS.filter(sig => lower.includes(sig));

    // Count non-resume signals
    const nonResumeHits = NON_RESUME_SIGNALS.filter(sig => lower.includes(sig));

    // Check for contact info patterns (email, phone) — strong resume indicator
    const hasEmail   = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    const hasPhone   = /(\+?\d[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}|\+\d{1,3}[\s\-]\d[\d\s\-]{7,14})/.test(text);
    const hasYear    = /\b(19|20)\d{2}\b/.test(text);    // years like 2019, 2023
    const hasBullets = (text.match(/[•·▪▸\-–—]\s+\w/g) || []).length >= 2; // bullet points

    const contactScore = (hasEmail ? 2 : 0) + (hasPhone ? 1 : 0);
    const resumeScore  = resumeHits.length + contactScore + (hasYear ? 1 : 0) + (hasBullets ? 1 : 0);
    const nonResScore  = nonResumeHits.length;

    // Decision logic
    if (resumeScore >= 3 && nonResScore <= 2) {
      return { valid: true }; // Clearly a resume
    }

    if (nonResScore >= 3 && resumeScore <= 1) {
      // Identify what type of document it seems to be
      const docType = guessDocumentType(lower, nonResumeHits);
      return {
        valid: false,
        reason: `❌ This looks like a ${docType}, not a resume. Please upload your CV or resume document.`
      };
    }

    if (resumeScore <= 1 && nonResScore <= 1) {
      // Ambiguous document with very few signals — probably not a resume
      return {
        valid: false,
        reason: `❌ This doesn't appear to be a resume. We couldn't find typical resume sections (Experience, Education, Skills, etc.). Please upload your CV or resume.`
      };
    }

    // Mixed signals but some resume content — allow with warning
    if (resumeScore >= 2) {
      return { valid: true };
    }

    return {
      valid: false,
      reason: `❌ This file doesn't appear to be a resume. Please upload a document containing your work experience, education, and skills.`
    };
  }

  /** Guess the type of non-resume document for a helpful error message */
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

  /* ── File reading ──────────────────────────── */
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

  /* ── Display helpers ───────────────────────── */
  function fmtBytes(b) {
    if (b < 1024)        return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  }
  function extIcon(ext) {
    return { pdf: '📋', doc: '📝', docx: '📝', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', txt: '📄' }[ext] || '📄';
  }
  function showError(msg) {
    const el      = r('uploadError');
    const textEl  = r('uploadErrorText');
    if (!el) return;
    if (textEl) textEl.textContent = msg;
    else el.textContent = msg;
    el.style.display = 'flex';
    // Shake animation
    el.style.animation = 'none';
    el.offsetHeight; // force reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.display = 'none'; }, 9000);
  }
  function clearError() {
    const el = r('uploadError');
    if (el) { el.style.display = 'none'; }
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
    r('jobGoalBox').style.display  = 'none';
  }

  /* ════════════════════════════════════════════
     FILE READING HELPERS
  ════════════════════════════════════════════ */
  function readBase64(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload  = e => res(e.target.result.split(',')[1]);
      fr.onerror = () => rej(new Error('Read failed'));
      fr.readAsDataURL(file);
    });
  }
  function readText(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload  = e => res(e.target.result);
      fr.onerror = () => rej(new Error('Read failed'));
      fr.readAsText(file);
    });
  }

  /** Quick text extraction for validation — same logic as ResumeParser but lighter */
  async function quickExtractText(file, base64) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') {
      return await readText(file);
    }

    if (ext === 'pdf') {
      try {
        // Load PDF.js if not already loaded (same version as resumeParser)
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
            s.onload = () => {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
              res();
            };
            s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const raw   = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const pdf   = await window.pdfjsLib.getDocument({ data: bytes }).promise;
        const parts = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          parts.push(content.items.map(item => item.str).join(' '));
        }
        return parts.join('\n');
      } catch (e) {
        return ''; // Let it fall through to content check — will show image warning
      }
    }

    if (['doc', 'docx'].includes(ext)) {
      // Extract readable ASCII tokens from the binary
      const raw   = atob(base64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      let text = '';
      for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        if (c >= 32 && c < 127) text += String.fromCharCode(c);
        else if (c === 10 || c === 13) text += ' ';
      }
      const tokens = text.match(/[a-zA-Z][a-zA-Z0-9+#./\-]{2,30}/g) || [];
      return tokens.join(' ');
    }

    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      // Images: we can't read text from them without OCR.
      // Return filename — the content check will be lenient for images
      // and flag them if the filename is clearly not a resume.
      return `image resume ${file.name.replace(/\.[^.]+$/, '').replace(/[_\-]/g, ' ')}`;
    }

    return '';
  }

  /* ── Show/hide helpers ─────────────────────── */
  function showValidating() {
    const dz = r('dropZone');
    if (dz) dz.classList.add('validating');
    const btn = r('analyzeBtn');
    if (btn) btn.disabled = true;
  }
  function hideValidating() {
    const dz  = r('dropZone');
    const btn = r('analyzeBtn');
    if (dz)  dz.classList.remove('validating');
    if (btn) btn.disabled = false;
  }

  /* ════════════════════════════════════════════
     MAIN FILE HANDLER — two-stage validation
  ════════════════════════════════════════════ */
  async function handleFile(file) {
    clearError();
    hidePreview();

    // ── Stage 1: Format check (instant) ──────
    const formatErr = validateFormat(file);
    if (formatErr) {
      showError(formatErr);
      return;
    }

    // Show "validating" state while we read the file
    showValidating();

    try {
      // Read the file
      _base64 = await readBase64(file);
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt') _text = await readText(file);

      // ── Stage 2: Content check ─────────────
      const extractedText = await quickExtractText(file, _base64);
      const contentResult = validateContent(extractedText);

      if (!contentResult.valid) {
        // Reset state and show error — prompt user to try again
        _file = _base64 = _text = null;
        hideValidating();
        showError(contentResult.reason);
        return;
      }

      // ✅ Passes both checks
      _file = file;
      // Cache the extracted text on the file object for later use
      _file._extractedText = extractedText;
      hideValidating();
      showPreview(file);

    } catch (e) {
      _file = _base64 = _text = null;
      hideValidating();
      showError('❌ Could not read this file. Please check it isn\'t corrupted and try again.');
    }
  }

  /* ── Public ────────────────────────────────── */
  function init() {
    const dz    = r('dropZone');
    const input = r('fileInput');

    input.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; });
    r('removeFile').addEventListener('click', () => {
      _file = _base64 = _text = null;
      hidePreview();
      clearError();
    });

    dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    dz.addEventListener('click', e => {
      if (!['LABEL', 'INPUT'].includes(e.target.tagName)) input.click();
    });
  }

  return {
    init,
    getFile:   () => _file,
    getBase64: () => _base64,
    getText:   () => _text,
    showError,
    clearError,
  };
})();
