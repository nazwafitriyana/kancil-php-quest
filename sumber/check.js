// shared grading logic
function applyVary(code, v) {
  for (const k in v) {
    const re = new RegExp('\\$' + k + '\\s*=\\s*[\\s\\S]*?;');
    code = code.replace(re, () => '$' + k + ' = ' + v[k] + ';');
  }
  return code;
}
function normOut(s) { return s.replace(/\r/g, '').split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, ''); }
function stripComments(code) { return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/[^\n]*/g, '$1').replace(/#[^\n\[]*/g, ''); }
function grade(run, ex, code) {
  const r = run(code);
  const res = { run: r, ok: false, reason: null, detail: null };
  const bad = r.diags.find(d => d.kind === 'parse' || d.kind === 'fatal');
  if (bad) { res.reason = bad.kind; res.detail = bad; return res; }
  const exp = normOut(run(ex.a).output);
  const got = normOut(r.output);
  if (got !== exp) { res.reason = 'output'; res.expected = exp; res.got = got; return res; }
  for (const [re, msg] of ex.needRaw || []) {
    if (!new RegExp(re, 'i').test(code)) { res.reason = 'need'; res.detail = msg; return res; }
  }
  const clean = stripComments(code);
  for (const [re, msg] of ex.need || []) {
    if (!new RegExp(re, 'i').test(clean)) { res.reason = 'need'; res.detail = msg; return res; }
  }
  for (const v of ex.vary || []) {
    const ue = applyVary(code, v), se = applyVary(ex.a, v);
    const ur = run(ue), sr = run(se);
    const ubad = ur.diags.find(d => d.kind === 'parse' || d.kind === 'fatal');
    if (ubad || normOut(ur.output) !== normOut(sr.output)) {
      res.reason = 'vary'; res.vary = v; res.expected = normOut(sr.output); res.got = ubad ? '(error: ' + ubad.msg + ')' : normOut(ur.output); return res;
    }
  }
  if (r.diags.length) res.warnings = r.diags;
  res.ok = true; return res;
}
if (typeof module !== 'undefined') module.exports = { grade, applyVary, normOut };
