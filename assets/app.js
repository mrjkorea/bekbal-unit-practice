// Bekbal Unit Practice — static shell. HARD rules: pass ≥80%, max 3 attempts, reveal on pass or after attempt 3, book reminder whenever answers shown.
const PASS=0.8, MAX_ATTEMPTS=3;
const $=s=>document.querySelector(s), app=$('#app'), qs=new URLSearchParams(location.search);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const getJSON=u=>fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
const STATUS={'build-next':'Coming soon','coming-soon':'Coming soon','ready':'연습 가능','deferred':'확인 필요'};
const REMIND=`📖 중요! 틀린 문제의 정답과 해설을 반드시 <u>여러분의 종이 교재(책)</u>에도 직접 써 넣으세요.<br>Write every correct answer and explanation into your printed book too.`;
const BOOKNOTE=`종이 교재에도 답을 직접 쓰세요. Write your answers in the printed book too.`;

async function index(){
  const {books}=await getJSON('data/books.json');
  app.innerHTML=`<h1>교재 선택</h1><div class="grid">${books.map(b=>`<a class="card" href="book.html?b=${b.slug}"><h3>${esc(b.title)}</h3>${esc(b.grade)} · ${esc(b.publisher)} · ${esc(b.author)}</a>`).join('')}</div>
  <h2>Demo</h2><a class="card" href="play.html?demo=1"><span class="tag demo">DEMO</span> 플레이어 시험용 샘플 (교재 문제 아님)</a>`;
}
async function book(){
  const {books}=await getJSON('data/books.json'); const b=books.find(x=>x.slug===qs.get('b'));
  if(!b) return app.textContent='Book not found';
  app.innerHTML=`<h1>${esc(b.title)}</h1><div class="grid">${b.units.map(u=>`<a class="card ${u.status==='coming-soon'?'off':''}" href="unit.html?b=${b.slug}&u=${u.unit}">${u.label}<span class="tag ${u.status}">${STATUS[u.status]}</span></a>`).join('')}</div>`;
}
async function unit(){
  const b=qs.get('b'),u=qs.get('u'); if(!/^[a-z0-9-]+$/.test(b)||!/^u0[1-8]$/.test(u)) return app.textContent='Bad link';
  const c=await getJSON(`data/${b}/${u}/catalog.json`);
  app.innerHTML=`<p><a href="book.html?b=${b}">← 단원 목록</a></p><h1>${esc(c.label)} <span class="tag ${c.status}">${STATUS[c.status]||c.status}</span></h1>`+
   (c.note?`<p>${esc(c.note)}</p>`:'')+
   c.sections.map(s=>`<h2>${esc(s.title)}</h2>`+(s.exercises.length?`<div class="grid">${s.exercises.map(e=>{
     if(e.deferred) return `<div class="card off">${esc(e.title)}<span class="tag deferred">확인 필요</span>${e.reason?`<br><small>${esc(e.reason)}</small>`:''}</div>`;
     const n=e.questionCount?` <small>(${e.questionCount})</small>`:'';
     const hold=e.omittedCount?`<br><small>OCR 확인 보류 ${e.omittedCount}문항</small>`:'';
     return `<a class="card" href="play.html?b=${b}&u=${u}&e=${encodeURIComponent(e.id)}">${esc(e.title)}${n}${hold}</a>`;
   }).join('')}</div>`:`<p class="card off">Coming soon</p>`)).join('');
}
function timeFor(ex){ if(ex.timeLimitSec) return ex.timeLimitSec;
  return ex.questions.reduce((t,q)=>t+(q.type==='TMC'?50:105),0); }
function norm(s){return String(s??'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s*([,;:/])\s*/g,'$1').replace(/[.!?。]+$/,'').replace(/[()[\]{}]/g,'')}
function tight(s){return norm(s).replace(/\s+/g,'')}
function isRight(q,v){ if(q.type==='TMC') return String(v)===String(q.corAns); if(v==null||String(v).trim()==='')return false; return q.answers.some(a=>norm(a)===norm(v)||tight(a)===tight(v)); }
function correctText(q){ return q.type==='TMC'? `${q.corAns}. ${q.answers[+q.corAns-1]}` : q.answers[0]; }

async function play(){
  let ex, path;
  if(qs.get('demo')) path='data/_demo/exercises/demo-sample.json';
  else { const b=qs.get('b'),u=qs.get('u'),e=qs.get('e');
    if(!/^[a-z0-9-]+$/.test(b)||!/^u0[1-8]$/.test(u)||!/^[A-Za-z0-9_-]+$/.test(e||'')) return app.textContent='Bad link';
    path=`data/${b}/${u}/exercises/${e}.json`; }
  ex=await getJSON(path);
  const key='bekbal:'+path; let attempts=+(sessionStorage.getItem(key)||0), timer;
  const start=()=>{
    const mins=Math.round(timeFor(ex)/60);
    app.innerHTML=`${ex.demo?'<p class="banner">DEMO — 실제 교재 문제가 아닙니다 (사이트 테스트용)</p>':''}<h1>${esc(ex.title)}</h1>
     <p class="remind">${BOOKNOTE}</p>
     <p>시도 ${attempts+1} / ${MAX_ATTEMPTS} · 통과 기준 80% · 제한 약 ${mins}분</p><div class="timer" id="t"></div><form id="f">${ex.questions.map((q,i)=>`<div class="q"><b>${i+1}.</b> ${esc(q.question)}
     ${q.type==='TMC'?q.answers.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j+1}"> ${j+1}. ${esc(a)}</label>`).join(''):`<input type="text" name="q${i}" autocomplete="off" placeholder="답을 입력하세요">`}</div>`).join('')}
     <button>제출 Submit</button></form>`;
    let left=timeFor(ex); const tick=()=>{$('#t').textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`; if(left--<=0){clearInterval(timer);grade();}};
    clearInterval(timer); timer=setInterval(tick,1000); tick();
    $('#f').onsubmit=e=>{e.preventDefault();clearInterval(timer);grade();};
  };
  const grade=()=>{
    const f=$('#f'); const res=ex.questions.map((q,i)=>{const el=q.type==='TMC'?f.querySelector(`input[name=q${i}]:checked`):f.elements['q'+i]; const v=el?el.value:null; return {q,v,ok:isRight(q,v)}});
    attempts++; sessionStorage.setItem(key,attempts);
    const score=res.filter(r=>r.ok).length, pct=score/res.length, passed=pct>=PASS;
    const reveal=passed||attempts>=MAX_ATTEMPTS;
    let h=`<h1>${esc(ex.title)}</h1><h2 class="${passed?'ok':'bad'}">${score} / ${res.length} (${Math.round(pct*100)}%) — ${passed?'통과 PASS ✅':'미통과 ❌'}</h2><p>시도 ${attempts} / ${MAX_ATTEMPTS}</p>`;
    if(!reveal){ h+=`<p>80% 이상이 되어야 통과입니다. 다시 풀어 보세요. (남은 기회 ${MAX_ATTEMPTS-attempts}번)</p><button id="r">다시 풀기 Retry</button>`; }
    else { const wrong=res.filter(r=>!r.ok);
      h+=`<div class="remind">${REMIND}</div>`+(wrong.length?`<h2>틀린 문제 · 정답 · 해설</h2>`+wrong.map(r=>`<div class="q wrong">${esc(r.q.question)}
<b>내 답:</b> <span class="bad">${esc(r.v??'(무응답)')}</span>
<b>정답:</b> <span class="ok">${esc(correctText(r.q))}</span>
<b>해설:</b> ${esc(r.q.explainKo||'')}</div>`).join(''):'<p>틀린 문제가 없습니다! 🎉</p>')+`<div class="remind">${REMIND}</div>`;
      sessionStorage.removeItem(key); }
    app.innerHTML=h; scrollTo(0,0); const r=$('#r'); if(r) r.onclick=start;
  };
  start();
}
({index,book,unit,play})[document.body.dataset.page]().catch(e=>app.textContent='Error: '+e.message);
