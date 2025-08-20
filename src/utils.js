export const tokenize = (s)=> (s || "")
  .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

// Minimal BM25 (k1=1.2, b=0.75)
export function buildBM25(docs){
  if (!docs || !docs.length) return function(){ return []; };
  const N = docs.length; const lengths = docs.map(d=>tokenize(d.text).length);
  const avgdl = lengths.reduce((a,d)=>a+d,0)/N;
  const df = new Map(); const td = [];
  docs.forEach((d,i)=>{ const counts = new Map();
    tokenize(d.text).forEach(t=> counts.set(t, (counts.get(t)||0)+1));
    td[i] = counts; counts.forEach((_,t)=> df.set(t, (df.get(t)||0)+1));
  });
  return function score(q){
    const k1=1.2, b=0.75; const qterms = tokenize(q); const scores = new Map();
    docs.forEach((d,i)=>{
      const dl = lengths[i]; let s=0;
      qterms.forEach(t=>{
        const f = td[i].get(t)||0; if(!f) return; const n = df.get(t)||0;
        const idf = Math.log(1 + (N - n + 0.5)/(n + 0.5));
        s += idf * (f*(k1+1)) / (f + k1*(1 - b + b*(dl/avgdl)));
      });
      if(s>0) scores.set(d.id ?? i, s);
    });
    return [...scores.entries()].sort((a,b)=>b[1]-a[1]);
  }
}
