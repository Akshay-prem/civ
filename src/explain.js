export function renderSources(sources){
  if(!sources || !sources.length) return '';
  const items = sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${s.title||s.url}</a></li>`).join('');
  return `<details><summary>Sources</summary><ul>${items}</ul></details>`;
}

export function renderExplanation(expl){
  return `<div class="card"><strong>Explanation</strong><p>${expl||'No explanation yet.'}</p></div>`;
}
