/**
 * js/resumeParser.js
 * Extracts readable text from uploaded files directly in the browser.
 * Supports: TXT (direct), PDF (via PDF.js CDN), images (via OCR simulation),
 * DOC/DOCX (filename + metadata heuristics).
 */

window.ResumeParser = (function () {

  /**
   * Main entry point — returns a plain text string from the uploaded file.
   * @param {File}   file   - The File object
   * @param {string} base64 - Base64-encoded file content
   * @param {string} text   - Pre-read text (if TXT file)
   * @returns {Promise<string>}
   */
  async function extractText(file, base64, text) {
    const ext = file.name.split('.').pop().toLowerCase();

    // Plain text — already available
    if (ext === 'txt' && text) {
      return text;
    }

    // PDF — use PDF.js from CDN
    if (ext === 'pdf') {
      try {
        return await extractFromPDF(base64);
      } catch (e) {
        console.warn('[ResumeParser] PDF.js failed, using filename heuristics:', e.message);
        return buildFallbackText(file.name);
      }
    }

    // Images (PNG/JPG) — simulate reading by using filename / metadata
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return buildFallbackText(file.name) + '\n[Image resume — skill detection uses filename metadata]';
    }

    // DOC/DOCX — use ArrayBuffer approach
    if (['doc', 'docx'].includes(ext)) {
      try {
        return await extractFromDocx(base64);
      } catch (e) {
        return buildFallbackText(file.name);
      }
    }

    return buildFallbackText(file.name);
  }

  /* ── PDF Extraction via PDF.js ─────────────── */
  async function extractFromPDF(base64) {
    // Lazy-load PDF.js from CDN
    if (!window.pdfjsLib) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const raw     = atob(base64);
    const uint8   = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

    const pdf    = await window.pdfjsLib.getDocument({ data: uint8 }).promise;
    const parts  = [];

    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map(item => item.str).join(' '));
    }

    return parts.join('\n');
  }

  /* ── DOCX Basic Extraction ──────────────────── */
  async function extractFromDocx(base64) {
    // Convert base64 to ArrayBuffer, then search for XML text nodes
    const raw   = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    // DOCX is a ZIP — we look for readable ASCII sequences
    let text = '';
    for (let i = 0; i < bytes.length - 1; i++) {
      const c = bytes[i];
      if (c >= 32 && c < 127) text += String.fromCharCode(c);
      else if (c === 10 || c === 13) text += ' ';
    }

    // Filter out binary noise — keep only word-like tokens
    const tokens = text.match(/[a-zA-Z][a-zA-Z0-9+#./\-]{1,30}/g) || [];
    return tokens.join(' ');
  }

  /* ── Lazy script loader ─────────────────────── */
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  /* ── Fallback text (from filename) ─────────── */
  function buildFallbackText(filename) {
    // Strip extension and split by underscores/dashes/dots/spaces
    const base   = filename.replace(/\.[^.]+$/, '').replace(/[_\-\.]/g, ' ');
    return `Resume file: ${filename}\n${base}`;
  }

  return { extractText };
})();
