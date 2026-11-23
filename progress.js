/* =========================================================
   نظام القفل والتاسكات: كل درس مقفول لحد ما تحل تاسك الدرس اللي قبله
   كل صفحة بتعرّف window.LESSON_TASKS = { page, mode, tasks }
   mode: "dom" (HTML/CSS) | "js" | "py"
   ========================================================= */
(function () {
  var CFG = window.LESSON_TASKS;
  if (!CFG) return;
  var MODE = CFG.mode, TASKS = CFG.tasks, KEY = 'mero-progress-' + CFG.page;
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  state.solved = state.solved || {};
  state.code = state.code || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- الشكل ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.task{margin-top:24px;border:3px dashed var(--brand);border-radius:16px;padding:14px 16px;background:#fffbeb}' +
    '.task.done{border-style:solid;border-color:#10b981;background:#f0fdf4}' +
    '.task-h{font-weight:800;color:var(--brand);font-size:1.2rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.task.done .task-h{color:#047857}' +
    '.task-q{margin:6px 0 10px;font-size:1.05rem}' +
    '.task-q code{direction:ltr;unicode-bidi:embed;font-family:Consolas,monospace;background:#fff;border:1px solid #e5e7eb;padding:0 6px;border-radius:6px}' +
    '.task-code{display:block;width:100%;min-height:150px;background:#111827;color:#fde68a;border:0;border-radius:10px;padding:12px;font-family:Consolas,"Courier New",monospace;font-size:15px;line-height:1.7;direction:ltr;text-align:left;resize:vertical;outline:none;tab-size:4}' +
    '.task-btns button{font-family:inherit;border:0;border-radius:10px;padding:7px 16px;cursor:pointer;color:#fff;font-size:.95rem;margin:8px 0 0 6px}' +
    '.tk-check{background:#16a34a}.tk-hint{background:#64748b}.tk-sol{background:#ca8a04}.tk-next{background:var(--brand)}' +
    '.task-msg{font-weight:700;margin-top:10px;line-height:1.8}' +
    '.task-msg .ok{color:#047857}.task-msg .no{color:#dc2626}.task-msg .hint{color:#475569;font-weight:600}' +
    '.task-lbl{font-weight:700;font-size:.9rem;color:#64748b;margin-top:10px}' +
    '.task-prev{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px;min-height:44px;margin-top:4px;overflow:auto}' +
    '.task-out{background:#0b1020;color:#e5e7eb;font-family:Consolas,monospace;direction:ltr;text-align:left;white-space:pre-wrap;border-radius:10px;padding:8px 12px;margin-top:4px;min-height:38px;font-size:15px}' +
    '.task-out .er{color:#fca5a5}' +
    '.lock-card{text-align:center;padding:26px 10px;font-size:1.15rem;color:#475569}' +
    '.lock-card .big{font-size:3rem;display:block}' +
    '.lock-card button{font-family:inherit;border:0;border-radius:10px;padding:8px 18px;cursor:pointer;background:var(--brand);color:#fff;font-size:1rem;margin-top:10px}' +
    'section.lesson .lock-card{display:none}' +
    'section.lesson.locked .lock-card{display:block}' +
    'section.lesson.locked>*:not(.lock-card){display:none!important}' +
    'section.lesson.locked{opacity:.85;background:repeating-linear-gradient(45deg,#fff,#fff 14px,#f8fafc 14px,#f8fafc 28px)}' +
    'section.lesson.far{display:none}' +
    'nav.toc a.lk{opacity:.45;cursor:not-allowed}' +
    '.prog{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:8px 10px;margin:4px 0 10px;font-size:.9rem;font-weight:700}' +
    '.prog .pb{height:8px;background:#e5e7eb;border-radius:9px;overflow:hidden;margin:6px 0}' +
    '.prog .pb i{display:block;height:100%;background:linear-gradient(90deg,#10b981,var(--brand));transition:width .4s}' +
    '.prog button{font-family:inherit;font-size:.8rem;border:0;background:none;color:#64748b;cursor:pointer;text-decoration:underline;padding:0}' +
    '@keyframes tkShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}' +
    '.tk-shake{animation:tkShake .4s}' +
    '#pageLock{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '#pageLock .pl-card{background:#fff;border-radius:20px;padding:26px 24px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35);line-height:1.9}' +
    '#pageLock h2{margin:4px 0 8px}' +
    '.pl-btn{display:inline-block;margin-top:10px;background:var(--brand);color:#fff;text-decoration:none;border-radius:12px;padding:10px 22px;font-weight:800;font-size:1.05rem}' +
    '.pl-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 18px;border-radius:12px;z-index:10000;font-weight:700;transition:opacity .5s;max-width:90vw;text-align:center}' +
    '.exam-box{border:3px solid var(--brand);border-radius:18px;padding:18px;background:#fff}' +
    '.exam-q{font-weight:800;font-size:1.15rem;margin:8px 0 12px}' +
    '.exam-q code,.exam-opt code{direction:ltr;unicode-bidi:embed;font-family:Consolas,monospace;background:#f1f5f9;padding:0 6px;border-radius:6px}' +
    '.exam-opt{display:block;width:100%;text-align:right;margin:8px 0;padding:11px 14px;border:2px solid #e5e7eb;border-radius:12px;background:#fff;cursor:pointer;font-family:inherit;font-size:1rem}' +
    '.exam-opt:hover{border-color:var(--brand);background:#f8fafc}' +
    '.exam-opt.pick{border-color:var(--brand);background:#eef2ff}' +
    '.exam-big{font-size:1.5rem;font-weight:800;margin:6px 0}' +
    '.exam-review{background:#fef2f2;border-radius:12px;padding:8px 14px;margin:6px 0;font-size:.95rem}' +
    '.exam-cert{text-align:center;background:linear-gradient(135deg,#fef9c3,#dcfce7);border:3px double #ca8a04;border-radius:18px;padding:20px}';
  document.head.appendChild(css);

  /* ---------- أدوات ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lines(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  var PHOTO = window.__PHOTO || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="#bae6fd"/><circle cx="230" cy="50" r="30" fill="#fde047"/><path d="M0 200 L90 90 L160 170 L210 120 L300 200 Z" fill="#16a34a"/></svg>');
  function toRGB(c) {
    var d = document.createElement('span'); d.style.color = c; document.body.appendChild(d);
    var r = getComputedStyle(d).color; d.remove(); return r;
  }

  /* ---------- تشغيل الكود حسب النوع ---------- */
  // HTML / CSS: بنرسم الكود جوه Shadow DOM عشان مايأثرش على الصفحة
  function domRender(host, code) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    if (!host.__guard) {
      host.__guard = true;
      root.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) e.preventDefault(); });
      root.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    root.innerHTML = '<style>:host{display:block;font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#222;direction:rtl;text-align:right}img{max-width:100%}</style>' +
      code.replace(/photo\.jpg/g, PHOTO);
    return root;
  }
  function domCtx(host, code) {
    var root = domRender(host, code);
    return {
      code: code, root: root,
      q: function (s) { try { return root.querySelector(s); } catch (e) { return null; } },
      qa: function (s) { try { return [].slice.call(root.querySelectorAll(s)); } catch (e) { return []; } },
      cs: function (el, p) { return el ? getComputedStyle(el)[p] : ''; },
      is: function (el, p, color) { return !!el && getComputedStyle(el)[p] === toRGB(color); },
      text: function (el) { return el ? el.textContent.trim() : ''; },
      has: function (re) { return re.test(code); }
    };
  }

  // JavaScript: بنشغّله في iframe مقفول وناخد اللي اتطبع في الكونسول
  var JN = 0;
  function jsRun(code, stage, clicks) {
    return new Promise(function (res) {
      var id = 'tk' + (++JN), f = document.createElement('iframe'), done = false;
      f.setAttribute('sandbox', 'allow-scripts'); f.style.display = 'none';
      function fin(r) { if (done) return; done = true; window.removeEventListener('message', on); f.remove(); res(r); }
      function on(e) { if (e.data && e.data.__task === id) fin(e.data); }
      window.addEventListener('message', on);
      setTimeout(function () { fin({ logs: [], err: 'الكود خد وقت طويل أوي (يمكن فيه لوب مبيخلصش؟)', dom: '' }); }, 3500);
      var boot = 'var __L=[],__E=null;function __f(v){if(typeof v==="string")return v;if(v===undefined)return "undefined";try{return JSON.stringify(v);}catch(e){return String(v);}}' +
        'console.log=console.info=console.warn=console.error=function(){__L.push([].slice.call(arguments).map(__f).join(" "));};' +
        'window.onerror=function(m){if(!__E)__E=String(m).replace(/^Uncaught /,"");return true;};window.alert=function(m){__L.push(String(m));};window.prompt=function(){return "5";};';
      var fin2 = 'setTimeout(function(){' + JSON.stringify(clicks || []) + '.forEach(function(i){var el=document.getElementById(i);if(el)el.click();});' +
        'setTimeout(function(){parent.postMessage({__task:' + JSON.stringify(id) + ',logs:__L,err:__E,dom:document.body.innerHTML},"*");},40);},40);';
      var safe = JSON.stringify(code).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
      f.srcdoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' + (stage || '') +
        '<scr' + 'ipt>' + boot + '<\/scr' + 'ipt><scr' + 'ipt>try{(0,eval)(' + safe + ');}catch(e){__E=e.name+": "+e.message;}<\/scr' + 'ipt>' +
        '<scr' + 'ipt>' + fin2 + '<\/scr' + 'ipt></body></html>';
      document.body.appendChild(f);
    });
  }
  function jsCtx(t, code) {
    return jsRun(code, t.stage, t.click).then(function (r) {
      var doc = new DOMParser().parseFromString('<body>' + (r.dom || '') + '</body>', 'text/html');
      return {
        code: code, logs: r.logs || [], out: (r.logs || []).join('\n'), lines: lines((r.logs || []).join('\n')), err: r.err,
        doc: doc, byId: function (i) { var e = doc.getElementById(i); return e ? e.textContent.trim() : null; },
        has: function (re) { return re.test(code); },
        run: function (c2) { return jsCtx(t, c2); }
      };
    });
  }

  // Python: بنستخدم بايثون الحقيقية (Pyodide) اللي في الصفحة
  function pyCtx(t, code) {
    if (!window.pyCapture) return Promise.resolve({ offline: true, code: code, has: function (re) { return re.test(code); } });
    return window.pyCapture(code).then(function (r) {
      return {
        code: code, out: r.out || '', lines: lines(r.out), err: r.err, offline: !!r.offline,
        has: function (re) { return re.test(code); },
        run: function (c2) { return pyCtx(t, c2); }
      };
    });
  }

  /* ---------- ترتيب الكورس: HTML ← CSS ← JS ← Python ---------- */
  var ORDER = [
    { k: 'html', u: 'index.html', n: 'HTML' }, { k: 'css', u: 'css.html', n: 'CSS' },
    { k: 'js', u: 'js.html', n: 'JavaScript' }, { k: 'python', u: 'python.html', n: 'Python' }
  ];
  function passed(k) { try { return localStorage.getItem('mero-passed-' + k) === '1'; } catch (e) { return false; } }
  function pageIdx(k) { for (var i = 0; i < ORDER.length; i++) if (ORDER[i].k === k) return i; return -1; }
  function pageLocked(i) { return i > 0 && !passed(ORDER[i - 1].k); }
  var ME = pageIdx(CFG.page), PREV = ORDER[ME - 1], NEXT = ORDER[ME + 1];

  // لو الصفحة دي مقفولة: نغطيها برسالة
  if (ME > 0 && pageLocked(ME)) {
    var solvedPrev = 0;
    try { var sp = JSON.parse(localStorage.getItem('mero-progress-' + PREV.k)) || {}; solvedPrev = Object.keys(sp.solved || {}).length; } catch (e) {}
    var ov = document.createElement('div'); ov.id = 'pageLock';
    ov.innerHTML = '<div class="pl-card"><div style="font-size:4rem">🔒</div><h2>صفحة ' + ORDER[ME].n + ' لسه مقفولة</h2>' +
      '<p>عشان تفتحها لازم الأول:</p><ol style="text-align:right;display:inline-block;margin:0"><li>تخلّص كل تاسكات دروس <b>' + PREV.n + '</b>' + (solvedPrev ? ' (إنت حليت ' + solvedPrev + ' لحد دلوقتي 👏)' : '') + '</li><li>تنجح في <b>🎓 الامتحان النهائي</b> بتاع ' + PREV.n + '</li></ol>' +
      '<p style="color:#64748b">خطوة خطوة، وإنت هتوصل 💪</p><a class="pl-btn" href="' + PREV.u + '">⬅️ يلا على ' + PREV.n + '</a></div>';
    document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
  }
  // اللينكات للصفحات المقفولة
  function markLinks() {
    [].forEach.call(document.querySelectorAll('.pages a'), function (a) {
      var i = -1; ORDER.forEach(function (o, j) { if ((a.getAttribute('href') || '') === o.u) i = j; });
      if (i < 0) return;
      var base = a.textContent.replace(/^🔒 /, ''), lk = pageLocked(i);
      a.textContent = (lk ? '🔒 ' : '') + base; a.style.opacity = lk ? '.7' : '';
    });
  }
  markLinks();
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href') || '', i = -1; ORDER.forEach(function (o, j) { if (h === o.u) i = j; });
    if (i > -1 && pageLocked(i)) { e.preventDefault(); toast('🔒 ' + ORDER[i].n + ' لسه مقفولة. لازم تخلّص ' + ORDER[i - 1].n + ' وتنجح في امتحانها الأول.'); }
  }, true);
  function toast(t) {
    var d = document.createElement('div'); d.className = 'pl-toast'; d.textContent = t; document.body.appendChild(d);
    setTimeout(function () { d.style.opacity = '0'; }, 2600); setTimeout(function () { d.remove(); }, 3200);
  }

  /* ---------- قسم الامتحان النهائي ---------- */
  var main = document.querySelector('main');
  if (CFG.exam && main) {
    var ex = document.createElement('section'); ex.className = 'lesson'; ex.id = 'exam'; ex.dataset.title = '🎓 الامتحان النهائي';
    main.appendChild(ex);
    var tocEl = document.getElementById('toc');
    if (tocEl) { var ta0 = document.createElement('a'); ta0.href = '#exam'; ta0.textContent = document.querySelectorAll('section.lesson').length + '. 🎓 الامتحان النهائي'; tocEl.appendChild(ta0); }
  }

  /* ---------- بناء التاسكات ---------- */
  var secs = [].slice.call(document.querySelectorAll('section.lesson'));
  var UI = {};
  secs.forEach(function (sec, i) {
    var lc = document.createElement('div'); lc.className = 'lock-card';
    var prev = secs[i - 1];
    lc.innerHTML = '<span class="big">🔒</span><b>الدرس ده مقفول</b><br>عشان يتفتح لازم تحل تاسك درس «' + esc(prev ? prev.dataset.title : '') + '» صح الأول.<br><button>⬆️ وديني للتاسك</button>';
    lc.querySelector('button').onclick = goCurrent;
    sec.insertBefore(lc, sec.firstChild);
    var t = TASKS[sec.id]; if (!t) return;
    var isLast = i === secs.length - 1;
    var box = document.createElement('div'); box.className = 'task'; box.id = 'task-' + sec.id;
    box.innerHTML =
      '<div class="task-h">📝 تاسك الدرس <span class="tk-state"></span></div>' +
      '<div class="task-q">' + t.q + '</div>' +
      '<textarea class="task-code" spellcheck="false"></textarea>' +
      '<div class="task-btns"><button class="tk-check">✅ اتأكد من الحل</button><button class="tk-hint">💡 تلميح</button><button class="tk-sol" style="display:none">👀 وريني الحل</button>' +
      (isLast ? '' : '<button class="tk-next" style="display:none">➡️ روح للدرس اللي بعده</button>') + '</div>' +
      '<div class="task-msg"></div>' +
      (MODE === 'dom' ? '<div class="task-lbl">👀 شكل اللي كتبته:</div><div class="task-prev"></div>' :
        '<div class="task-lbl">🖥️ اللي اتطبع:</div><div class="task-out"></div>');
    sec.appendChild(box);
    var ta = box.querySelector('textarea'), msg = box.querySelector('.task-msg'), fails = 0;
    ta.value = state.code[sec.id] != null ? state.code[sec.id] : (t.start || '');
    ta.style.height = Math.max(150, (ta.value.split('\n').length + 2) * 26) + 'px';
    var prevHost = box.querySelector('.task-prev'), outBox = box.querySelector('.task-out');
    var timer;
    function live() { if (prevHost) domRender(prevHost, ta.value); }
    ta.addEventListener('input', function () {
      state.code[sec.id] = ta.value; save();
      clearTimeout(timer); timer = setTimeout(live, 250);
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault(); var sp = MODE === 'py' ? '    ' : '  ', a = ta.selectionStart;
        ta.value = ta.value.slice(0, a) + sp + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = a + sp.length;
        state.code[sec.id] = ta.value; save(); live();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); check(); }
    });
    live();
    function showOut(c) {
      if (!outBox) return;
      var txt = MODE === 'js' ? c.out : c.out;
      outBox.innerHTML = (txt ? esc(txt) : '<span style="color:#64748b">(مفيش حاجة اتطبعت)</span>') + (c.err ? '\n<span class="er">❌ ' + esc(c.err) + '</span>' : '');
    }
    function check() {
      var btn = box.querySelector('.tk-check'); btn.disabled = true; btn.textContent = '⏳ بنتأكد...';
      var code = ta.value, p;
      if (MODE === 'dom') p = Promise.resolve(domCtx(prevHost, code));
      else if (MODE === 'js') p = jsCtx(t, code);
      else p = t.noRun ? Promise.resolve({ code: code, has: function (re) { return re.test(code); } }) : pyCtx(t, code);
      p.then(function (c) {
        showOut(c);
        if (c.offline && !t.noRun) return '__offline';
        if (c.err && !t.allowErr) return 'الكود فيه غلطة وموقف: «' + c.err + '». صلّحها الأول.';
        if (!code.trim()) return 'إنت لسه مكتبتش حاجة! 😅';
        try { return t.check(c); } catch (e) { return false; }
      }).then(function (r) {
        btn.disabled = false; btn.textContent = '✅ اتأكد من الحل';
        if (r === '__offline') { msg.innerHTML = '<span class="no">📡 بايثون لسه محمّلتش (محتاجة نت). اتوصل بالنت واعمل Refresh، أو استنى لحد ما يظهر فوق «✅ بايثون جاهزة».</span>'; return; }
        if (r === true) {
          state.solved[sec.id] = true; save();
          msg.innerHTML = '<span class="ok">🎉 برافو عليك! الحل صح. ' + (isLast ? '🏆 كده خلّصت كل الدروس!' : 'الدرس اللي بعده اتفتح ⬇️') + '</span>';
          refresh();
        } else {
          fails++;
          box.classList.remove('tk-shake'); void box.offsetWidth; box.classList.add('tk-shake');
          msg.innerHTML = '<span class="no">❌ لسه مش صح. ' + (typeof r === 'string' ? r : 'اقرا المطلوب تاني بالراحة.') + '</span>' +
            (fails >= 2 ? '<br><span class="hint">متزعلش 💪 لو اتزنقت دوس «👀 وريني الحل» وافهمه، وبعدين دوس «اتأكد».</span>' : '<br><span class="hint">جرّب تاني، ولو اتزنقت دوس 💡 تلميح.</span>');
          if (fails >= 2 && t.sol) box.querySelector('.tk-sol').style.display = 'inline-block';
        }
      });
    }
    box.querySelector('.tk-check').onclick = check;
    box.querySelector('.tk-hint').onclick = function () { msg.innerHTML = '<span class="hint">💡 ' + (t.hint || 'ارجع للأمثلة اللي فوق في الدرس.') + '</span>'; };
    box.querySelector('.tk-sol').onclick = function () {
      if (!t.sol) return; ta.value = t.sol; state.code[sec.id] = ta.value; save(); live();
      ta.style.height = Math.max(150, (ta.value.split('\n').length + 2) * 26) + 'px';
      msg.innerHTML = '<span class="hint">👀 ده الحل. اقراه سطر سطر وافهمه، وبعدين دوس «✅ اتأكد من الحل».</span>';
    };
    var nx = box.querySelector('.tk-next');
    if (nx) nx.onclick = function () { var n = secs[i + 1]; if (n) n.scrollIntoView({ behavior: 'smooth' }); };
    UI[sec.id] = { box: box, msg: msg };
  });

  /* ---------- الامتحان ---------- */
  var exSec = document.getElementById('exam');
  if (exSec && CFG.exam) {
    var Q = CFG.exam, NEED = Math.ceil(Q.length * 0.8), BKEY = 'mero-exam-best-' + CFG.page;
    var wrap = document.createElement('div'); exSec.appendChild(wrap);
    var head = '<h2><span class="num">' + secs.length + '</span> 🎓 الامتحان النهائي بتاع ' + ORDER[ME].n + '</h2>';
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function best() { try { return +localStorage.getItem(BKEY) || 0; } catch (e) { return 0; } }
    function nextBtn() {
      return NEXT ? '<a class="pl-btn" href="' + NEXT.u + '">➡️ يلا على ' + NEXT.n + '</a>' : '';
    }
    function intro() {
      var ok = passed(CFG.page);
      wrap.innerHTML = head + '<div class="exam-box">' +
        (ok ? '<div class="exam-cert"><div style="font-size:3rem">🎓</div><div class="exam-big">إنت نجحت في امتحان ' + ORDER[ME].n + '!</div>' +
          '<p>أحسن نتيجة ليك: <b>' + best() + ' من ' + Q.length + '</b></p>' +
          (NEXT ? '<p>صفحة <b>' + NEXT.n + '</b> اتفتحت ليك 🔓</p>' + nextBtn() : '<p>🏆 مبروك! كده إنت خلّصت الكورس كله: HTML و CSS و JavaScript و Python. إنت دلوقتي مبرمج مبتدئ بجد 👏</p>') + '</div><p style="text-align:center"><button class="btn exam-start" style="font-family:inherit;border:0;border-radius:10px;padding:7px 16px;background:#64748b;color:#fff;cursor:pointer">🔁 امتحن تاني للتمرين</button></p>'
          : '<p class="exam-big">📋 الامتحان: ' + Q.length + ' سؤال</p><ul><li>لازم تجاوب صح على <b>' + NEED + '</b> على الأقل عشان تنجح.</li><li>مش هنقولك صح ولا غلط غير في الآخر.</li><li>لو منجحتش، متقلقش: هنوريك غلطت في إيه، وتقدر تمتحن تاني على طول.</li>' +
          (NEXT ? '<li>لما تنجح، صفحة <b>' + NEXT.n + '</b> هتتفتح ليك 🔓</li>' : '<li>ده آخر امتحان في الكورس كله 🏁</li>') + '</ul>' +
          (best() ? '<p>أحسن نتيجة ليك لحد دلوقتي: <b>' + best() + ' من ' + Q.length + '</b></p>' : '') +
          '<button class="exam-start" style="font-family:inherit;border:0;border-radius:12px;padding:10px 24px;background:var(--brand);color:#fff;cursor:pointer;font-size:1.1rem;font-weight:800">🚀 ابدأ الامتحان</button>') + '</div>';
      wrap.querySelector('.exam-start').onclick = start;
    }
    function start() {
      var qs = shuffle(Q).map(function (q) { var idx = shuffle(q.o.map(function (_, i) { return i; })); return { q: q.q, o: idx.map(function (i) { return q.o[i]; }), a: idx.indexOf(q.a), right: q.o[q.a] }; });
      var i = 0, answers = [];
      function show() {
        if (i >= qs.length) return finish(qs, answers);
        var q = qs[i];
        wrap.innerHTML = head + '<div class="exam-box"><div style="display:flex;justify-content:space-between;font-weight:700;color:#64748b"><span>سؤال ' + (i + 1) + ' من ' + qs.length + '</span><span>🎓 امتحان ' + ORDER[ME].n + '</span></div>' +
          '<div class="prog" style="border:0;padding:0;background:none"><div class="pb"><i style="width:' + (i / qs.length * 100) + '%"></i></div></div>' +
          '<div class="exam-q">' + q.q + '</div>' + q.o.map(function (o, k) { return '<button class="exam-opt" data-k="' + k + '">' + o + '</button>'; }).join('') + '</div>';
        var lock = false;
        [].forEach.call(wrap.querySelectorAll('.exam-opt'), function (b) {
          b.onclick = function () { if (lock) return; lock = true; b.classList.add('pick'); answers.push(+b.dataset.k); i++; setTimeout(show, 350); };
        });
        exSec.scrollIntoView({ block: 'start' });
      }
      show();
    }
    function finish(qs, answers) {
      var score = 0, wrongs = [];
      qs.forEach(function (q, k) { if (answers[k] === q.a) score++; else wrongs.push(q); });
      try { if (score > best()) localStorage.setItem(BKEY, score); } catch (e) {}
      var ok = score >= NEED;
      if (ok) { try { localStorage.setItem('mero-passed-' + CFG.page, '1'); } catch (e) {} }
      wrap.innerHTML = head + '<div class="exam-box">' +
        (ok ? '<div class="exam-cert"><div style="font-size:3.5rem">🎉🎓🎉</div><div class="exam-big">مبروك! نجحت بـ ' + score + ' من ' + qs.length + '</div>' +
          (NEXT ? '<p>صفحة <b>' + NEXT.n + '</b> اتفتحت ليك دلوقتي 🔓</p>' + nextBtn() : '<p>🏆 كده إنت خلّصت الكورس كله! برافو عليك جدًا 👏👏</p>') + '</div>'
          : '<div class="exam-big" style="color:#dc2626">😕 جبت ' + score + ' من ' + qs.length + '</div><p>محتاج <b>' + NEED + '</b> على الأقل عشان تنجح. ناقصك <b>' + (NEED - score) + '</b> بس! 💪</p>') +
        (wrongs.length ? '<p style="font-weight:800;margin-top:14px">📌 الأسئلة اللي غلطت فيها والإجابة الصح:</p>' + wrongs.map(function (q) { return '<div class="exam-review"><div>❓ ' + q.q + '</div><div style="color:#047857;font-weight:700">✅ ' + q.right + '</div></div>'; }).join('') : '') +
        '<p style="text-align:center;margin-top:14px"><button class="exam-again" style="font-family:inherit;border:0;border-radius:12px;padding:10px 22px;background:' + (ok ? '#64748b' : 'var(--brand)') + ';color:#fff;cursor:pointer;font-size:1.05rem;font-weight:700">🔁 ' + (ok ? 'امتحن تاني للتمرين' : 'امتحن تاني') + '</button></p></div>';
      wrap.querySelector('.exam-again').onclick = start;
      if (ok) markLinks();
      exSec.scrollIntoView({ block: 'start' });
    }
    intro();
  }

  /* ---------- القفل ---------- */
  function firstOpenTask() {
    for (var i = 0; i < secs.length; i++) if (TASKS[secs[i].id] && !state.solved[secs[i].id]) return secs[i];
    return null;
  }
  function goCurrent() {
    var s = firstOpenTask(); if (!s) return;
    var b = document.getElementById('task-' + s.id);
    (b || s).scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (b) { b.classList.remove('tk-shake'); void b.offsetWidth; b.classList.add('tk-shake'); }
  }
  var toc = document.getElementById('toc'), prog;
  if (toc) {
    prog = document.createElement('div'); prog.className = 'prog';
    var h = toc.querySelector('h3'); toc.insertBefore(prog, h ? h.nextSibling : toc.firstChild);
    toc.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a || !a.classList.contains('lk')) return;
      e.preventDefault(); goCurrent();
    });
  }
  function refresh() {
    var open = true, firstLocked = true, done = 0, total = 0;
    secs.forEach(function (sec) {
      var t = TASKS[sec.id];
      sec.classList.toggle('locked', !open);
      sec.classList.toggle('far', !open && !firstLocked);
      if (!open) firstLocked = false;
      if (t) {
        total++;
        var ok = !!state.solved[sec.id]; if (ok) done++;
        var u = UI[sec.id];
        if (u) {
          u.box.classList.toggle('done', ok);
          u.box.querySelector('.tk-state').textContent = ok ? '✅ اتحل' : '— حلّه عشان تفتح الدرس اللي بعده';
          var nx = u.box.querySelector('.tk-next'); if (nx) nx.style.display = ok ? 'inline-block' : 'none';
          if (ok && !u.msg.innerHTML) u.msg.innerHTML = '<span class="ok">✅ إنت حليت التاسك ده قبل كده.</span>';
        }
        if (!ok) open = false;
      }
    });
    if (toc) {
      [].forEach.call(toc.querySelectorAll('a'), function (a) {
        var id = (a.getAttribute('href') || '').slice(1), s = document.getElementById(id);
        if (!a.dataset.t) a.dataset.t = a.textContent;
        var lk = s && s.classList.contains('locked');
        a.classList.toggle('lk', !!lk);
        a.textContent = (lk ? '🔒 ' : (TASKS[id] && state.solved[id] ? '✅ ' : '')) + a.dataset.t;
      });
      prog.innerHTML = '🏅 خلّصت ' + done + ' من ' + total + ' تاسك<div class="pb"><i style="width:' + (total ? done / total * 100 : 0) + '%"></i></div><button>🔄 ابدأ من الأول</button>';
      prog.querySelector('button').onclick = function () {
        if (!confirm('متأكد؟ كل التاسكات اللي حليتها هتتمسح وهتبدأ من أول درس.')) return;
        state = { solved: {}, code: {} }; save(); location.reload();
      };
    }
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
  }
  refresh();
})();
