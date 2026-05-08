// ── QUIZ STATE ──
var QS = [], QI = 0, SC = 0, DN = false, tmr = null, TL = 600, T0 = null;
var isGenQuiz = false;
var chatCtx = null;

// ── START DAILY QUIZ ──
async function bQz() {
  var b = document.getElementById('bsq'); if (!b) return;
  b.disabled = true; b.textContent = 'Loading...';
  var td = new Date().toISOString().split('T')[0];
  var qz = await api('quizzes', '?scheduled_for=eq.' + td + '&is_published=eq.true&limit=1');
  if (!qz || !qz.length) qz = await api('quizzes', '?is_published=eq.true&order=created_at.desc&limit=1');
  if (!qz || !qz.length) {
    toast('No quiz yet! Check back soon 📚');
    if (b) { b.disabled = false; b.textContent = 'Start Today\'s Quiz →'; }
    return;
  }
  var qq = await api('questions', '?quiz_id=eq.' + qz[0].id + '&limit=10');
  if (!qq || !qq.length) {
    toast('Questions loading soon!');
    if (b) { b.disabled = false; b.textContent = 'Start Today\'s Quiz →'; }
    return;
  }
  QS = qq; QI = 0; SC = 0; TL = 600; T0 = Date.now(); chatCtx = null;
  isGenQuiz = false; renderQZ(); rQ(); sTmr();
}

// ── RENDER QUIZ SHELL ──
function renderQZ() {
  var el = document.getElementById('qz');
  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="if(confirm(\'Quit? Progress lost.\')) {clearInterval(tmr);renderHM()}" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Quit</button>'
    + '<div class="q-ctr" id="qct">Q 1 / ' + QS.length + '</div>'
    + '<div class="q-timer"><div class="tdot"></div><span id="qtm">10:00</span></div>'
    + '</div>'
    + '<div class="qbody">'
    + '<div class="prog-track"><div class="prog-fill" id="qpr" style="width:' + (1/QS.length*100) + '%"></div></div>'
    + '<div class="q-subj" id="qdf">Loading...</div>'
    + '<div class="q-txt"  id="qtx">Loading...</div>'
    + '<div class="opts"   id="qop"></div>'
    + '<div class="exp"    id="qex"><div class="exp-t">Explanation</div><div class="exp-body" id="qxt"></div></div>'
    + '<button class="ask-ai-btn" id="ask-ai-q-btn" style="display:none" onclick="openChatWithContext()">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'
    + 'Ask AI to explain this</button>'
    + '</div>'
    + '<div class="q-foot"><button class="btn btn-p" id="bnx" onclick="nQ()" disabled>Select an answer</button></div>';
  go('qz');
}

// ── RENDER CURRENT QUESTION ──
function rQ() {
  var q   = QS[QI];
  var pEl = document.getElementById('qpr'); if (pEl) pEl.style.width = ((QI+1)/QS.length*100) + '%';
  var cEl = document.getElementById('qct'); if (cEl) cEl.textContent = 'Q ' + (QI+1) + ' / ' + QS.length;
  var dEl = document.getElementById('qdf');
  if (dEl) dEl.textContent = (q.subject || 'GS') + ' · ' + (q.difficulty||'medium')[0].toUpperCase() + (q.difficulty||'medium').slice(1);
  var tEl = document.getElementById('qtx'); if (tEl) tEl.textContent = q.question_text;
  var exEl = document.getElementById('qex');  if (exEl) exEl.style.display = 'none';
  var aBtn = document.getElementById('ask-ai-q-btn'); if (aBtn) aBtn.style.display = 'none';
  var oc = document.getElementById('qop'); if (!oc) return;
  oc.innerHTML = '';
  ['A','B','C','D'].forEach(function (lt, i) {
    var v = [q.option_a, q.option_b, q.option_c, q.option_d];
    var b = document.createElement('button'); b.className = 'opt';
    var lDiv = document.createElement('div'); lDiv.className = 'opt-l'; lDiv.textContent = lt;
    var span = document.createElement('span'); span.textContent = v[i] || '';
    b.appendChild(lDiv); b.appendChild(span);
    b.onclick = function () { pA(lt, q); };
    oc.appendChild(b);
  });
  DN = false;
  var nb = document.getElementById('bnx');
  if (nb) { nb.disabled = true; nb.textContent = 'Select an answer'; }
}

// ── PICK ANSWER ──
function pA(lt, q) {
  if (DN) return; DN = true;
  document.querySelectorAll('.opt').forEach(function (b) {
    var l = b.querySelector('.opt-l').textContent;
    if (l === q.correct_option) b.classList.add('ok');
    else if (l === lt && lt !== q.correct_option) b.classList.add('no');
  });
  if (lt === q.correct_option) { SC++; toast('Correct! +10 XP ⚡', 'ok'); }
  else toast('Wrong ✗', 'err');
  if (q.explanation) {
    var xt = document.getElementById('qxt'); if (xt) xt.textContent = q.explanation;
    var xe = document.getElementById('qex'); if (xe) xe.style.display = 'block';
  }
  var ab = document.getElementById('ask-ai-q-btn'); if (ab) ab.style.display = 'flex';
  chatCtx = { question: q.question_text, answer: q.correct_option, explanation: q.explanation || '', userAnswer: lt };
  var nb = document.getElementById('bnx');
  if (nb) { nb.disabled = false; nb.textContent = QI < QS.length-1 ? 'Next Question →' : 'View Results →'; }
}

// ── NEXT QUESTION ──
function nQ() { if (!DN) return; QI++; if (QI >= QS.length) { eQz(); return; } rQ(); }

// ── END QUIZ ──
async function eQz() {
  clearInterval(tmr);
  var sec      = Math.round((Date.now() - T0) / 1000);
  var acc      = Math.round(SC / QS.length * 100);
  var xpGained = SC * 10 + (QS.length - SC) * 2;

  await ins('user_attempts', {
    user_id: U.id,
    quiz_id: isGenQuiz ? null : QS[0].quiz_id,
    score: SC, total_questions: QS.length,
    accuracy_pct: acc, time_taken_sec: sec,
    is_generated: isGenQuiz,
    subject: QS[0] ? (QS[0].subject || null) : null
  });

  await fetch(SB + '/rest/v1/rpc/increment_xp', {
    method: 'POST', headers: getH(),
    body: JSON.stringify({ user_uuid: U.id, xp_to_add: xpGained })
  });
  if (P) P.xp = (parseInt(P.xp) || 0) + xpGained;

  // ── Update streak ──
  var todayDate  = new Date().toISOString().split('T')[0];
  var prevDate   = P ? P.last_quiz_date : null;
  var prevStreak = P ? (parseInt(P.current_streak) || 0) : 0;
  var yest = new Date(); yest.setDate(yest.getDate()-1);
  var yestDate = yest.toISOString().split('T')[0];
  var newStreak = (!prevDate || prevDate < yestDate) ? 1
    : (prevDate === yestDate) ? prevStreak + 1
    : prevStreak || 1;
  await patch('users', '?id=eq.' + U.id, { current_streak: newStreak, last_quiz_date: todayDate });
  if (P) { P.current_streak = newStreak; P.last_quiz_date = todayDate; }

  var beatTxt = isGenQuiz ? 'Custom quiz complete! 🌟' : 'First attempt today! 🌟';
  if (!isGenQuiz) {
    var all = await api('user_attempts', '?quiz_id=eq.' + QS[0].quiz_id);
    if (all && all.length > 1) {
      var beat = all.filter(function (a) { return parseFloat(a.score) < SC; }).length;
      beatTxt = 'Beat ' + Math.round(beat / (all.length-1) * 100) + '% today';
    }
  }
  var wasGen = isGenQuiz; isGenQuiz = false;
  renderRS(SC, acc, sec, xpGained, beatTxt, wasGen);
  if (SC >= Math.ceil(QS.length * 0.7)) confetti();
  chatCtx = null; go('rs');
}

// ── TIMER ──
function sTmr() {
  clearInterval(tmr);
  tmr = setInterval(function () {
    TL--;
    var m  = Math.floor(TL/60).toString().padStart(2,'0');
    var s  = (TL%60).toString().padStart(2,'0');
    var te = document.getElementById('qtm'); if (te) te.textContent = m + ':' + s;
    if (TL <= 0) { clearInterval(tmr); eQz(); }
    if (TL <= 60 && te) {
      te.style.color = '#F43F5E';
      try { navigator.vibrate(200); } catch(e) {}
    }
  }, 1000);
}

// ── PYQ QUIZ ──
var pyqExam = 'UPSC';
var PYQ_EXAMS = [
  { id: 'UPSC',    label: 'UPSC Prelims',  icon: '🏛' },
  { id: 'SSC',     label: 'SSC CGL/CHSL',  icon: '📋' },
  { id: 'Banking', label: 'IBPS PO/Clerk', icon: '🏦' },
  { id: 'RBI',     label: 'RBI Grade B',   icon: '💰' }
];

async function startPYQQuiz(exam, year) {
  toast('Loading ' + exam + ' ' + year + ' questions...');
  var questions = await api('questions', '?source_tag=eq.pyq&pyq_exam=eq.' + exam + '&year=eq.' + year + '&limit=25');
  if (!questions || !questions.length) { toast('No questions found', 'err'); return; }
  QS = questions; QI = 0; SC = 0;
  TL = questions.length * 72; T0 = Date.now(); chatCtx = null; isGenQuiz = true;
  renderPYQQuiz(exam, year); rQ(); sTmr();
}

function renderPYQQuiz(exam, year) {
  var el = document.getElementById('qz');
  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="if(confirm(\'Quit? Progress lost.\')) {clearInterval(tmr);renderPYQ()}" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Quit</button>'
    + '<div class="q-ctr" id="qct">Q 1 / ' + QS.length + '</div>'
    + '<div class="q-timer"><div class="tdot"></div><span id="qtm">--:--</span></div>'
    + '</div>'
    + '<div class="pyq-quiz-banner"><span class="pyq-quiz-tag">📋 ' + esc(exam) + ' ' + esc(String(year)) + '</span></div>'
    + '<div class="qbody">'
    + '<div class="prog-track"><div class="prog-fill" id="qpr" style="width:' + (1/QS.length*100) + '%"></div></div>'
    + '<div class="q-subj" id="qdf">Loading...</div>'
    + '<div class="q-txt"  id="qtx">Loading...</div>'
    + '<div class="opts"   id="qop"></div>'
    + '<div class="exp"    id="qex"><div class="exp-t">Explanation</div><div class="exp-body" id="qxt"></div></div>'
    + '<button class="ask-ai-btn" id="ask-ai-q-btn" style="display:none" onclick="openChatWithContext()">'
    + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'
    + 'Ask AI to explain this</button>'
    + '</div>'
    + '<div class="q-foot"><button class="btn btn-p" id="bnx" onclick="nQ()" disabled>Select an answer</button></div>';
  go('qz');
}

// ── RESULTS ──
function renderRS(score, acc, sec, xpGained, beatTxt, wasGen) {
  var seed  = U ? U.id : 'user';
  var total = QS.length;
  var title = score >= Math.ceil(total*0.8) ? 'Outstanding!' : score >= Math.ceil(total*0.6) ? 'Great Job!' : score >= Math.ceil(total*0.4) ? 'Keep Going!' : 'Keep Practicing!';
  var el = document.getElementById('rs');
  el.innerHTML =
    '<div id="conf-wrap"></div>'
    + '<div class="res-wrap">'
    + '<div class="res-main"><div class="res-glow"></div>'
    + '<div class="res-av"><img src="' + avUrl(seed) + '" alt=""/></div>'
    + '<div class="res-score">' + score + '<span>/' + total + '</span></div>'
    + '<div class="res-title">' + esc(title) + '</div>'
    + '<div class="res-sub">Here\'s how you did today</div>'
    + '<div class="xp-earned">+' + esc(String(xpGained)) + ' XP ⚡</div>'
    + '<div class="beat-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' + esc(beatTxt) + '</div>'
    + '</div>'
    + '<div class="res-stats">'
    + '<div class="rs-box"><div class="rs-val">' + esc(String(acc)) + '%</div><div class="rs-lbl">Accuracy</div></div>'
    + '<div class="rs-box"><div class="rs-val">' + score + '/' + total + '</div><div class="rs-lbl">Correct</div></div>'
    + '<div class="rs-box"><div class="rs-val">' + sec + 's</div><div class="rs-lbl">Time</div></div>'
    + '</div>'
    + '<div class="diagnosis-teaser" onclick="renderDiagnosis()">'
    + '<div class="dt-left"><div class="dt-icon">📊</div>'
    + '<div><div class="dt-t">See Your Weak Subjects</div>'
    + '<div class="dt-s">Find out exactly where you\'re losing marks</div></div></div>'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
    + '</div>'
    + '<button class="btn btn-g" onclick="shareScore(' + score + ',' + acc + ')" style="margin-bottom:10px;gap:8px">'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
    + 'Share My Score</button>'
    + '<button class="btn btn-g" onclick="' + (wasGen ? 'renderMG()' : 'renderHM()') + '" style="color:var(--t3)">'
    + (wasGen ? '← Back to Generator' : 'Back to Home') + '</button>'
    + '</div>';
}

// ── SHARE ──
function shareScore(score, acc) {
  var txt = '⚡ Micro Mock\n\nScored ' + score + '/' + QS.length + ' (' + acc + '%) today!\n\nPreparing daily for govt exam 💪\n\nhttps://zeet3283.github.io/Micro-Mock/';
  if (navigator.share) navigator.share({ title: 'My Score', text: txt });
  else { navigator.clipboard.writeText(txt).catch(function(){}); toast('Score copied! Share anywhere 📤', 'ok'); }
}

// ── CONFETTI ──
function confetti() {
  var cw = document.getElementById('conf-wrap'); if (!cw) return;
  cw.innerHTML = '';
  var cs = ['#6366F1','#10B981','#F59E0B','#EC4899','#22D3EE','#A78BFA'];
  for (var i = 0; i < 90; i++) {
    var c = document.createElement('div'); c.className = 'conf-p';
    c.style.cssText = 'left:' + Math.random()*100 + '%;top:-10px;background:' + cs[Math.floor(Math.random()*cs.length)]
      + ';animation-duration:' + (Math.random()*2+2) + 's;animation-delay:' + (Math.random()*1.5)
      + 's;width:' + (Math.random()*9+4) + 'px;height:' + (Math.random()*9+4) + 'px;transform:rotate(' + Math.random()*360 + 'deg)';
    cw.appendChild(c);
  }
  setTimeout(function () { if (cw) cw.innerHTML = ''; }, 6000);
}
