const {runPHP}=require('./php.js'); const W=require('./lessons.js'); global.WORLDS=W; global.c=String.raw; const STEPS=require('./steps.js'); const {grade,applyVary}=require('./check.js');
let n=0, bad=0;
for(const w of W) for(const l of w.lessons){
  if(!STEPS[l.id]) console.log('NO STEPS',l.id);
  for(const s of l.steps) if(s.code){ const r=runPHP(s.code); if(r.diags.length && !/Lupa titik|lupa \$x|private \$isi = 50000/.test(s.code)){bad++;console.log('EXAMPLE',l.id,JSON.stringify(r.diags), s.code.slice(0,60));} }
  l.ex.forEach((e,i)=>{ n++;
    const g=grade(runPHP,e,e.a); if(!g.ok){bad++;console.log('SOL FAIL',l.id,i,g.reason,JSON.stringify(g.detail||g.vary),g.got);}
    const r=runPHP(e.a); console.log(`== ${l.id}#${i+1}\n${r.output}`);
    for(const v of e.vary||[]){ console.log('  vary',JSON.stringify(v),'->',JSON.stringify(runPHP(applyVary(e.a,v)).output)); }
    const st=grade(runPHP,e,e.s); if(st.ok){console.log('STARTER PASSES',l.id,i);bad++;}
  });
}
console.log('exercises',n,'problems',bad);
