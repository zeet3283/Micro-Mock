// ── AI CHATBOT WITH ROLLOVER BANK ──

var chatMsgs = [];
var sending  = false;

// ── RESET BANK IF NEW DAY ──
async function refreshAiBank() {
  if (!P) return;
  var todayStr = new Date().toISOString().split('T')[0];
  var lastReset = P.ai_bank_last_reset;
  if (lastReset === todayStr) return; // already fresh today

  // Rollover: add 3 to bank, cap at 10
  var currentBank = parseInt(P.ai_questions_bank) || 0;
  var newBank = Math.min(currentBank + 3, 10);
  await patch('users', '?id=eq.' + U.id, {
    ai_questions_bank: newBank,
    ai_bank_last_reset: todayStr
  });
  P.ai_questions_bank  = newBank;
  P.ai_bank_last_reset = todayStr;
}

function getAiLeft() {
  if (P && P.plan === 'pro') return 999;
  return parseInt(P && P.ai_questions_bank) || 0;
}

function updateAiCount() {
  var cnt   = document.getElementById('ai-count');
  var badge = document.getElementById('chat-limit-badge');
  if (P && P.plan === 'pro') {
    if (cnt) cnt.style.display = 'none';
    if (badge) badge.textContent = 'Unlimited';
    return;
  }
  var left = getAiLeft();
  if (cnt) {
    if (left < 3) { cnt.style.display = 'flex'; cnt.textContent = left; }
    else cnt.style.display = 'none';
  }
  if (badge) badge.textContent = left + ' questions left (resets daily + rolls over)';
}

// ── OPEN / CLOSE ──
function openChat() { document.getElementById('chat-drawer').classList.add('open'); }
function closeChat() { document.getElementById('chat-drawer').classList.remove('open'); }

function openChatWithContext() {
  if (chatCtx) {
    var cb = document.getElementById('ctx-banner'); if (cb) cb.style.display = 'flex';
    var ct = document.getElementById('ctx-text');
    if (ct) ct.textContent = 'Asking about: "' + chatCtx.question.slice(0,50) + '..."';
  }
  openChat();
}

function sendQuick(msg) {
  var inp = document.getElementById('chat-inp'); if (inp) inp.value = msg;
  sendMsg();
}

// ── SEND MESSAGE ──
async function sendMsg() {
  if (sending) return;
  var inp = document.getElementById('chat-inp');
  var msg = inp ? inp.value.trim() : ''; if (!msg) return;

  var left = getAiLeft();
  if (left <= 0 && P && P.plan !== 'pro') {
    var midnight = new Date(); midnight.setHours(24,0,0,0);
    var hoursLeft = Math.ceil((midnight - new Date()) / 3600000);
    toast('No questions left. Resets in ' + hoursLeft + 'h — or upgrade for unlimited!', 'err');
    setTimeout(function () { window.open('https://rzp.io/rzp/zJ6jF8B', '_blank'); }, 1800);
    return;
  }

  if (inp) { inp.value = ''; inp.style.height = '44px'; }
  addMsg('user', msg);
  var qc = document.getElementById('quick-chips'); if (qc) qc.style.display = 'none';
  var cb = document.getElementById('ctx-banner');  if (cb) cb.style.display = 'none';
  var typId = 'typ-' + Date.now();
  addTyping(typId); sending = true;
  var sendBtn = document.getElementById('chat-send'); if (sendBtn) sendBtn.disabled = true;

  var sys = 'You are a helpful AI tutor for Indian government exam prep (UPSC, SSC, Banking, RBI). Be concise, accurate, and encouraging. Keep answers under 150 words. Use simple language. Always end with a quick memory tip if relevant.';
  if (chatCtx) sys += '\n\nContext — Current question: ' + chatCtx.question + '\nCorrect answer: ' + chatCtx.answer + '\nExplanation: ' + chatCtx.explanation + '\nStudent selected: ' + chatCtx.userAnswer;

  var msgs = chatMsgs.slice(-6).concat([{ role: 'user', content: msg }]);

  try {
    var r = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+(localStorage.getItem('mm_tk')||KEY), 'apikey': KEY },
      body: JSON.stringify({ messages: msgs, system: sys })
    });
    removeTyping(typId);
    if (!r.ok) {
      addMsg('ai', 'Could not connect to AI. Check your internet and try again.');
    } else {
      var d = await r.json();
      var reply = d.reply || 'Sorry, could not answer right now.';
      addMsg('ai', reply);
      chatMsgs.push({ role:'user', content: msg }, { role:'assistant', content: reply });

      // Deduct from bank
      if (P && P.plan !== 'pro') {
        var newBank = Math.max(0, getAiLeft() - 1);
        await patch('users', '?id=eq.' + U.id, { ai_questions_bank: newBank });
        P.ai_questions_bank = newBank;
        updateAiCount();
        if (newBank === 0) {
          setTimeout(function () {
            addMsg('ai', '💡 You\'ve used all your questions for today. They roll over tomorrow (max 10 banked). Upgrade to Pro for unlimited conversations!');
          }, 500);
        }
      }
    }
  } catch (e) {
    removeTyping(typId);
    addMsg('ai', 'Something went wrong. Please try again.');
  } finally {
    sending = false;
    var sb2 = document.getElementById('chat-send'); if (sb2) sb2.disabled = false;
  }
}

// ── DOM HELPERS ──
function addMsg(role, txt) {
  var msgs = document.getElementById('chat-msgs'); if (!msgs) return;
  var div  = document.createElement('div'); div.className = 'msg ' + role;
  var avDiv = document.createElement('div'); avDiv.className = 'msg-av ' + role;
  if (role === 'ai') {
    avDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>';
  } else {
    var img = document.createElement('img'); img.src = avUrl(U ? U.id : 'user'); img.alt = '';
    avDiv.appendChild(img);
  }
  var bubble = document.createElement('div'); bubble.className = 'msg-bubble';
  txt.split('\n').forEach(function (line, i, arr) {
    bubble.appendChild(document.createTextNode(line));
    if (i < arr.length-1) bubble.appendChild(document.createElement('br'));
  });
  div.appendChild(avDiv); div.appendChild(bubble); msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping(id) {
  var msgs = document.getElementById('chat-msgs'); if (!msgs) return;
  var div  = document.createElement('div'); div.className = 'msg ai'; div.id = id;
  div.innerHTML = '<div class="msg-av ai"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg></div>'
    + '<div class="msg-bubble" style="padding:0"><div class="msg-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping(id) { var el = document.getElementById(id); if (el) el.remove(); }
