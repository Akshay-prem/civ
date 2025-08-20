import { buildBM25 } from './utils.js';

export function expWeight(y, Y, alpha=0.8){ return Math.pow(alpha, (Y - y)); }

export function scoreTopics(topicStats, latestYear, alpha=0.8, bm25Boost=0.25, recentTextDocs=[]){
  if (!topicStats || !Object.keys(topicStats).length) return {};
  const topics = Object.keys(topicStats);
  const scorer = buildBM25(recentTextDocs); // [{id, text}]
  const bm25Pairs = scorer("polity economy geography environment history science technology");
  const bm25 = new Map(bm25Pairs);

  const scores = {};
  let maxv = 1e-9;
  for(const t of topics){
    let s = 0;
    for(const [yStr,c] of Object.entries(topicStats[t])){
      const y = +yStr; s += c * expWeight(y, latestYear, alpha);
    }
    if (bm25.size && bm25.has(t)) s += bm25Boost * bm25.get(t);
    scores[t] = s; if(s>maxv) maxv = s;
  }
  for(const t of Object.keys(scores)) scores[t] = scores[t]/maxv;
  return scores;
}

export function nextTopic(topicsOrdered, scores, lastTopic){
  const ranked = topicsOrdered
    .map(t=>({t, s: scores[t]??0}))
    .sort((a,b)=> b.s - a.s);
  const pool = ranked.slice(0, Math.min(5, ranked.length)).filter(x=>x.t!==lastTopic);
  const sum = pool.reduce((a,x)=>a+x.s,0) || pool.length;
  let r = Math.random()*sum; for(const x of pool){ r -= x.s || (sum/pool.length); if(r<=0) return x.t; }
  return pool[0]?.t || topicsOrdered[0];
}
