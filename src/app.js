import { scoreTopics, nextTopic } from './model.js';
import { renderExplanation, renderSources } from './explain.js';

const state = { data: [], topicStats: {}, latestYear: 2025, topicOrder: [
  'Polity','Economy','Geography','CurrentAffairs','History','ScienceAndTech','Environment','CultureMisc'
], lastTopic: null };

async function load(){
  const [pyq, stats] = await Promise.all([
    fetch('data/pyq.sample.json').then(r=>r.json()),
    fetch('artifacts/topic_stats.json').then(r=>r.json()).catch(()=>({}))
  ]);
  state.data = pyq; state.topicStats = stats; mountPredict(); bindNav(); bindKeys();
}

function bindNav(){
  document.querySelectorAll('nav [data-nav]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v = btn.getAttribute('data-nav');
      if(v==='predict') mountPredict();
      if(v==='practice') mountPractice();
      if(v==='trends') mountTrends();
    })
  })
}

function bindKeys(){
  window.addEventListener('keydown', (e)=>{
    if(e.key==='1') mountPredict();
    if(e.key==='2') mountPractice();
    if(e.key==='3') mountTrends();
    if(e.key.toLowerCase()==='n') {
      const nextBtn = document.getElementById('next');
      if (nextBtn) nextBtn.click();
    }
    if(e.key==='Enter') {
      const checkBtn = document.getElementById('check');
      if (checkBtn) checkBtn.click();
    }
  });
}

function mountPredict(){
  const app = document.getElementById('app');
  const scores = scoreTopics(state.topicStats, state.latestYear, 0.8, 0.25, []);
  const rows = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,20)
    .map(([t,s])=>`<div class="card"><strong>${t}</strong><div>Likelihood: ${(s*100).toFixed(1)}%</div></div>`).join('');
  app.innerHTML = `<h2>Predicted Topics</h2>${rows || '<p class="card">No artifacts yet. Upload CSV and run the workflow.</p>'}`;
}

function mountPractice(){
  const app = document.getElementById('app');
  const scores = scoreTopics(state.topicStats, state.latestYear, 0.8, 0.25, []);
  const t = nextTopic(state.topicOrder, scores, state.lastTopic); state.lastTopic = t;
  const candidates = state.data.filter(q=> (q.topic||q.subject) && (q.topic===t || q.subject===t));
  const q = candidates[Math.floor(Math.random()*candidates.length)] || state.data[0];
  if(!q){ app.innerHTML = '<p class="card">No questions loaded.</p>'; return; }
  const options = q.options.map((opt,i)=>`<label class="choice"><input type="radio" name="opt" value="${i}"> ${opt}</label>`).join('');
  app.innerHTML = `
    <div class="card">
      <div><small>${q.year} • ${q.subject} • ${q.topic||''}</small></div>
      <p>${q.question}</p>
      <form id="quiz">${options}</form>
      <div class="actions">
        <button id="check">Check</button>
        <button id="next">Next (N)</button>
        <button id="dispute">Mark disputed</button>
        <button id="edit">Edit answer</button>
      </div>
      <div id="explain"></div>
    </div>`;
  document.getElementById('check').onclick = (ev)=>{
    ev.preventDefault();
    const sel = [...document.querySelectorAll('input[name=opt]')].find(x=>x.checked);
    if(!sel) return;
    const idx = +sel.value;
    document.querySelectorAll('.choice').forEach((el,i)=>{
      el.classList.toggle('correct', i===q.answer);
      el.classList.toggle('wrong', i===idx && i!==q.answer);
    });
    document.getElementById('explain').innerHTML = renderExplanation(q.explanation) + renderSources(q.sources);
  };
  document.getElementById('next').onclick = (ev)=>{ ev.preventDefault(); mountPractice(); };
  document.getElementById('dispute').onclick = (ev)=>{ ev.preventDefault(); alert('Flagged as disputed (local only). Export coming soon.'); };
  document.getElementById('edit').onclick = (ev)=>{ ev.preventDefault(); alert('Inline edit coming soon (local only).'); };
}

function mountTrends(){
  const app = document.getElementById('app');
  const ts = state.topicStats; const years = [...new Set(Object.values(ts).flatMap(o=>Object.keys(o)))].map(Number).sort();
  const body = Object.entries(ts).map(([t,yearMap])=>{
    const row = years.map(y=> yearMap[y]||0).join('</td><td>');
    return `<tr><th>${t}</th><td>${row}</td></tr>`;
  }).join('');
  app.innerHTML = `<h2>Trends</h2><table class="card"><thead><tr><th>Topic</th>${years.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

load();
