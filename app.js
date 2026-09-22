
const L = window.AI_LESSONS;
const KEY = 'ai-study-pwa-v1';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let state = load();
let mode = state.mode || 5;
let answered = false;

function baseState(){return {current:0,done:[],xp:0,streak:0,lastDay:null,mode:5,reviewMisses:{}}}
function load(){try{return {...baseState(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return baseState()}}
function save(){state.mode=mode;localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function dayKey(date=new Date()){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function today(){return dayKey()}
function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)}
function touchStreak(){const t=today();if(state.lastDay===t)return;if(state.lastDay===yesterday())state.streak++;else state.streak=1;state.lastDay=t}
function pct(){return Math.round(state.done.length/L.length*100)}
function current(){return L[Math.min(state.current,L.length-1)]}
function levelNames(){return [...new Set(L.map(x=>x.level))]}

function renderAll(){
  $('#xp').textContent=state.xp;
  $('#streak').textContent=state.streak;
  $('#progress').textContent=pct()+'%';
  const heroProgress=$('#heroProgress');
  if(heroProgress)heroProgress.style.width=pct()+'%';
  $('#resumeTitle').textContent=state.done.length===0?'Start with one tiny win':`Continue Lesson ${state.current+1}`;
  $('#resumeSub').textContent=current().title;
  renderLevels();
}
function renderLevels(){
  $('#levels').innerHTML=levelNames().map(name=>{
    const ids=L.map((x,i)=>x.level===name?i:null).filter(x=>x!==null);
    const done=ids.filter(i=>state.done.includes(i)).length;
    return `<div class="levelRow"><div><b>${name}</b><div class="track" style="margin-top:7px"><div style="width:${done/ids.length*100}%"></div></div></div><span>${done}/${ids.length}</span></div>`
  }).join('');
}
function renderLesson(){
  const l=current();
  $('#lessonNo').textContent=`Lesson ${state.current+1} of ${L.length} · ${l.level}`;
  $('#lessonTitle').textContent=l.title;
  $('#concept').textContent=l.concept;
  $('#example').textContent=l.example;
  $('#exampleWrap').classList.toggle('hidden',mode===2);
  $('#modeLabel').textContent=mode===2?'2-min rescue':`${mode}-min sprint`;
  $('#studyProgress').style.width=((state.current+1)/L.length*100)+'%';
  $('#learn').classList.remove('hidden');$('#quiz').classList.add('hidden');$('#done').classList.add('hidden');
  answered=false;
}
function showQuiz(){
  const l=current(); $('#learn').classList.add('hidden');$('#quiz').classList.remove('hidden');
  $('#question').textContent=l.question; $('#answers').innerHTML='';
  l.options.forEach((opt,i)=>{
    const b=document.createElement('button');b.className='answerBtn';b.textContent=opt;
    b.addEventListener('click',()=>answer(i,b));$('#answers').appendChild(b)
  });
  $('#feedback').classList.add('hidden');$('#finish').classList.add('hidden');$('#retry').classList.add('hidden');answered=false
}
function answer(i,b){
  if(answered)return;answered=true;const l=current();const buttons=$$('#answers .answerBtn');
  buttons.forEach((x,j)=>{x.disabled=true;if(j===l.answer)x.classList.add('correct')});
  $('#feedback').classList.remove('hidden');
  if(i===l.answer){state.xp+=10;$('#feedback').textContent='Nice. You understood the core idea.';$('#finish').classList.remove('hidden')}
  else{b.classList.add('wrong');$('#feedback').textContent=`Close — the best answer is: ${l.options[l.answer]}`;state.reviewMisses[state.current]=(state.reviewMisses[state.current]||0)+1;$('#retry').classList.remove('hidden')}
  save()
}
function finish(){
  if(!state.done.includes(state.current)){state.done.push(state.current);state.done.sort((a,b)=>a-b);state.xp+=15}
  touchStreak();save();$('#quiz').classList.add('hidden');$('#done').classList.remove('hidden')
}
function next(){if(state.current<L.length-1)state.current++;save();renderLesson();window.scrollTo({top:0,behavior:'smooth'})}
function setMode(m){mode=m;$$('.modeBtn').forEach(x=>x.classList.toggle('active',Number(x.dataset.mode)===m));save();renderLesson()}
function switchView(v){$$('.view').forEach(x=>x.classList.toggle('active',x.id===v));$$('.navBtn').forEach(x=>x.classList.toggle('active',x.dataset.view===v));if(v==='review')renderReview()}
function renderReview(){
  const area=$('#reviewArea');
  if(!state.done.length){area.innerHTML='<div class="reviewEmpty">Finish one micro-lesson and your review deck will appear here.</div>';return}
  const weighted=[...state.done].sort((a,b)=>(state.reviewMisses[b]||0)-(state.reviewMisses[a]||0)).slice(0,5);
  area.innerHTML=weighted.map((i,n)=>`<div class="levelRow"><div><b>${L[i].title}</b><div style="font-size:12px;color:var(--muted);margin-top:3px">${L[i].level}</div></div><button class="iconBtn reviewOne" data-i="${i}">Quiz</button></div>`).join('');
  $$('.reviewOne').forEach(b=>b.addEventListener('click',()=>{state.current=Number(b.dataset.i);save();renderLesson();switchView('study');showQuiz()}))
}

$('#resume').addEventListener('click',()=>{switchView('study');renderLesson();$('#lessonCard').scrollIntoView({behavior:'smooth',block:'start'})});
$('#quizMe').addEventListener('click',showQuiz);$('#skip').addEventListener('click',showQuiz);$('#retry').addEventListener('click',showQuiz);$('#finish').addEventListener('click',finish);$('#next').addEventListener('click',next);$('#stop').addEventListener('click',()=>{$('#doneMsg').textContent='Saved. Come back whenever you want — no catching up.';setTimeout(()=>switchView('home'),650)});
$$('.modeBtn').forEach(b=>b.addEventListener('click',()=>setMode(Number(b.dataset.mode))));
$$('.navBtn').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));

if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});
setMode(mode);renderAll();
