// ── MCQ GENERATOR ──

var genResults = [];
var mgMode     = 'photo';
var mgCount    = 5;
var mgPhotoB64 = null;
var pdfText    = null;

function renderMG() {
  go('mg');
  var el       = document.getElementById('mg');
  var genCount = (P && P.mcq_gen_count) ? parseInt(P.mcq_gen_count) : 0;
  var remaining= Math.max(0, 15 - genCount);
  var createdAt= P && P.created_at ? new Date(P.created_at) : new Date();
  var daysSince= (Date.now() - createdAt.getTime()) / (1000*60*60*24);
  var locked   = daysSince > 3 || remaining <= 0;

  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="renderHM()" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back</button>'
    + '<div style="font-size:15px;font-weight:800">MCQ Generator</div>'
    + '<div class="gen-badge">' + esc(String(remaining)) + ' left</div>'
    + '</div>'
    + '<div class="mg-body">'
    + (locked ? renderMGLocked() : renderMGForm(remaining))
    + '<div id="mg-results"></div>'
    + '</div>'
    + bnav('mg');
}

function renderMGLocked() {
  return '<div class="mg-locked">'
    + '<div style="font-size:48px;margin-bottom:12px">🔒</div>'
    + '<div style="font-size:18px;font-weight:900;margin-bottom:8px">Free Trial Ended</div>'
    + '<div style="font-size:13px;color:var(--t2);line-height:1.7;margin-bottom:20px;max-width:260px;margin-left:auto;margin-right:auto">'
    + 'MCQ generation was free for your first 3 days or 15 uses. Upgrade to Pro for unlimited access.</div>'
    + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Upgrade to Pro — ₹149/month →</button>'
    + '</div>';
}

function renderMGForm(remaining) {
  return '<div class="mg-hero">'
    + '<div class="mg-hero-t">Turn anything into MCQs ⚡</div>'
    + '<div class="mg-hero-s">Photo · PDF · Text → instant practice questions</div>'
    + '<div class="mg-trial-chip">✨ ' + esc(String(remaining)) + ' free generations remaining</div>'
    + '</div>'
    + '<div class="mg-tabs">'
    + '<button class="mg-tab on" id="mgt-photo" onclick="mgTab(\'photo\')">📷 Photo</button>'
    + '<button class="mg-tab"    id="mgt-pdf"   onclick="mgTab(\'pdf\')">📄 PDF</button>'
    + '<button class="mg-tab"    id="mgt-text"  onclick="mgTab(\'text\')">✏️ Text</button>'
    + '</div>'
    + '<div id="mg-input-wrap">' + renderMGPhotoInput() + '</div>'
    + '<div class="mg-count-row">'
    + '<div style="font-size:13px;font-weight:700;color:var(--t2)">Number of questions</div>'
    + '<div class="mg-count-btns">'
    + '<button class="mg-cnt on" onclick="setMgCount(5,this)">5</button>'
    + '<button class="mg-cnt"    onclick="setMgCount(10,this)">10</button>'
    + '<button class="mg-cnt"    onclick="setMgCount(15,this)">15</button>'
    + '<button class="mg-cnt"    onclick="setMgCount(20,this)">20</button>'
    + '<button class="mg-cnt"    onclick="setMgCount(25,this)">25</button>'
    + '</div></div>'
    + '<button class="btn btn-p" id="mg-gen-btn" onclick="generateMCQs()" style="margin-bottom:16px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
    + 'Generate MCQs</button>';
}

function renderMGPhotoInput() {
  return '<div class="mg-input-box" id="mg-photo-box">'
    + '<input type="file" id="mg-photo-inp" accept="image/*" style="display:none" onchange="onPhotoSelected(this)"/>'
    + '<div id="mg-photo-preview" style="display:none">'
    + '<img id="mg-photo-img" style="max-width:100%;border-radius:12px;max-height:200px;object-fit:contain" alt="Selected photo"/>'
    + '<button class="mg-clear-btn" onclick="clearPhoto()">✕ Clear</button></div>'
    + '<div id="mg-photo-prompt" onclick="document.getElementById(\'mg-photo-inp\').click()" style="cursor:pointer">'
    + '<div style="font-size:40px;margin-bottom:10px">📷</div>'
    + '<div style="font-size:14px;font-weight:700;margin-bottom:4px">Tap to take photo or upload</div>'
    + '<div style="font-size:12px;color:var(--t3)">Notes, textbook pages, handwritten content</div>'
    + '</div></div>';
}

function mgTab(t) {
  mgMode = t; mgPhotoB64 = null;
  document.querySelectorAll('.mg-tab').forEach(function (b) { b.classList.remove('on'); });
  var tb = document.getElementById('mgt-' + t); if (tb) tb.classList.add('on');
  var wrap = document.getElementById('mg-input-wrap'); if (!wrap) return;
  if (t === 'photo') {
    wrap.innerHTML = renderMGPhotoInput();
  } else if (t === 'pdf') {
    wrap.innerHTML = '<div class="mg-input-box">'
      + '<input type="file" id="mg-pdf-inp" accept=".pdf" style="display:none" onchange="onPDFSelected(this)"/>'
      + '<div id="mg-pdf-preview" style="display:none;padding:14px;text-align:center">'
      + '<div style="font-size:32px">📄</div>'
      + '<div id="mg-pdf-name" style="font-size:13px;font-weight:700;margin-top:6px;color:var(--t2)"></div>'
      + '<button class="mg-clear-btn" onclick="clearPDF()">✕ Clear</button></div>'
      + '<div id="mg-pdf-prompt" onclick="document.getElementById(\'mg-pdf-inp\').click()" style="cursor:pointer">'
      + '<div style="font-size:40px;margin-bottom:10px">📄</div>'
      + '<div style="font-size:14px;font-weight:700;margin-bottom:4px">Tap to upload a PDF</div>'
      + '<div style="font-size:12px;color:var(--t3)">Study material, notes, question banks</div>'
      + '</div></div>';
  } else {
    wrap.innerHTML = '<textarea id="mg-text-inp" class="mg-textarea" placeholder="Paste or type your study content here..."></textarea>';
  }
}

function setMgCount(n, btn) {
  mgCount = n;
  document.querySelectorAll('.mg-cnt').forEach(function (b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
}

function onPhotoSelected(inp) {
  var file = inp.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    mgPhotoB64 = e.target.result;
    var preview = document.getElementById('mg-photo-preview');
    var prompt  = document.getElementById('mg-photo-prompt');
    var img     = document.getElementById('mg-photo-img');
    if (preview) preview.style.display = 'block';
    if (prompt)  prompt.style.display  = 'none';
    if (img)     img.src = mgPhotoB64;
  };
  reader.readAsDataURL(file);
}
function clearPhoto() {
  mgPhotoB64 = null;
  var preview = document.getElementById('mg-photo-preview');
  var prompt  = document.getElementById('mg-photo-prompt');
  if (preview) preview.style.display = 'none';
  if (prompt)  prompt.style.display  = 'block';
  var inp = document.getElementById('mg-photo-inp'); if (inp) inp.value = '';
}

function onPDFSelected(inp) {
  var file = inp.files[0]; if (!file) return;
  var preview = document.getElementById('mg-pdf-preview');
  var prompt  = document.getElementById('mg-pdf-prompt');
  var nm      = document.getElementById('mg-pdf-name');
  if (nm) nm.textContent = file.name;
  if (preview) preview.style.display = 'block';
  if (prompt)  prompt.style.display  = 'none';
  toast('Reading PDF...');
  if (!window.pdfjsLib) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      extractPDFText(file);
    };
    document.head.appendChild(s);
  } else { extractPDFText(file); }
}
function extractPDFText(file) {
  var reader = new FileReader();
  reader.onload = async function (e) {
    try {
      var typedArray = new Uint8Array(e.target.result);
      var pdf  = await window.pdfjsLib.getDocument(typedArray).promise;
      var text = '';
      for (var i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        var page    = await pdf.getPage(i);
        var content = await page.getTextContent();
        text += content.items.map(function (x) { return x.str; }).join(' ') + '\n';
      }
      pdfText = text.trim().slice(0, 15000);
      toast(pdf.numPages + ' pages read ✓', 'ok');
    } catch (err) { toast('Could not read PDF. Try a text-based PDF.', 'err'); clearPDF(); }
  };
  reader.readAsArrayBuffer(file);
}
function clearPDF() {
  pdfText = null;
  var preview = document.getElementById('mg-pdf-preview');
  var prompt  = document.getElementById('mg-pdf-prompt');
  if (preview) preview.style.display = 'none';
  if (prompt)  prompt.style.display  = 'block';
  var inp = document.getElementById('mg-pdf-inp'); if (inp) inp.value = '';
}

async function generateMCQs() {
  var btn = document.getElementById('mg-gen-btn');
  var tk  = localStorage.getItem('mm_tk');
  var content = null, type = 'text';
  if (mgMode === 'photo') {
    if (!mgPhotoB64) { toast('Please select a photo first', 'err'); return; }
    content = mgPhotoB64; type = 'image';
  } else if (mgMode === 'pdf') {
    if (!pdfText) { toast('Please upload a PDF first', 'err'); return; }
    content = pdfText; type = 'text';
  } else {
    var ta = document.getElementById('mg-text-inp');
    if (!ta || !ta.value.trim()) { toast('Please enter some content', 'err'); return; }
    content = ta.value.trim().slice(0, 15000); type = 'text';
  }
  if (btn) { btn.disabled = true; btn.textContent = '✨ Generating...'; }
  var resultsEl = document.getElementById('mg-results');
  if (resultsEl) resultsEl.innerHTML = '<div class="mg-loading"><div class="mg-loading-t">Generating your MCQs...</div><div class="mg-loading-s">This takes about 5–10 seconds ⏳</div></div>';
  try {
    var r = await fetch(GEN_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+(tk||KEY), 'apikey': KEY },
      body: JSON.stringify({ type: type, content: content, count: mgCount })
    });
    var d = await r.json();
    if (!r.ok) {
      if (d.error === 'trial_expired' || d.error === 'limit_reached') {
        if (resultsEl) resultsEl.innerHTML = '<div class="mg-locked" style="margin-top:0">'
          + '<div style="font-size:36px;margin-bottom:10px">⏰</div>'
          + '<div style="font-size:16px;font-weight:900;margin-bottom:8px">' + (d.error==='trial_expired'?'Free Trial Ended':'Generation Limit Reached') + '</div>'
          + '<div style="font-size:13px;color:var(--t2);margin-bottom:16px">' + esc(d.message||'') + '</div>'
          + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Upgrade to Pro →</button>'
          + '</div>';
      } else {
        toast(esc(d.error) || 'Generation failed. Try again.', 'err');
        if (resultsEl) resultsEl.innerHTML = '';
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Generate MCQs'; }
      return;
    }
    genResults = d.mcqs || [];
    if (!genResults.length) {
      toast('Could not generate questions. Try with more content.', 'err');
      if (resultsEl) resultsEl.innerHTML = '';
      if (btn) { btn.disabled = false; btn.textContent = 'Generate MCQs'; }
      return;
    }
    if (P) P.mcq_gen_count = (P.mcq_gen_count || 0) + 1;
    showMGReady(genResults, d.remaining);
    toast(genResults.length + ' MCQs ready! ⚡', 'ok');
  } catch (e) {
    toast('Something went wrong. Try again.', 'err');
    if (resultsEl) resultsEl.innerHTML = '';
  }
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>Generate MCQs';
  }
}

function showMGReady(mcqs, remaining) {
  var el = document.getElementById('mg-results'); if (!el) return;
  var subjects = [...new Set(mcqs.map(function (q) { return q.subject || 'General'; }))].slice(0,3);
  el.innerHTML = '<div class="mg-ready">'
    + '<div style="font-size:48px;margin-bottom:12px">🎯</div>'
    + '<div class="mg-ready-t">Your quiz is ready!</div>'
    + '<div class="mg-ready-s">' + esc(String(mcqs.length)) + ' questions generated from your content</div>'
    + '<div class="mg-ready-pills">'
    + subjects.map(function (s) { return '<div class="mg-ready-pill">📚 ' + esc(s) + '</div>'; }).join('')
    + '<div class="mg-ready-pill">⏱ ~' + Math.ceil(mcqs.length*1.2) + ' min</div>'
    + '</div>'
    + '<button class="btn btn-p" onclick="startGenQuiz()" style="margin-bottom:10px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    + 'Start Quiz Now</button>'
    + '<div style="font-size:12px;color:var(--t3);margin-top:4px">' + (remaining!==undefined ? esc(String(remaining)) + ' generations remaining' : '') + '</div>'
    + '</div>';
  el.scrollIntoView({ behavior: 'smooth' });
}

function startGenQuiz() {
  if (!genResults.length) return;
  QS = genResults.map(function (q, i) {
    return { id:'gen_'+Date.now()+'_'+i, quiz_id:'generated', question_text:q.question,
      option_a:q.option_a, option_b:q.option_b, option_c:q.option_c, option_d:q.option_d,
      correct_option:q.correct_option, explanation:q.explanation||'',
      subject:q.subject||'General', difficulty:q.difficulty||'medium', is_generated:true };
  });
  QI=0; SC=0; TL=QS.length*60; T0=Date.now(); chatCtx=null;
  isGenQuiz=true; renderQZ(); rQ(); sTmr();
}
