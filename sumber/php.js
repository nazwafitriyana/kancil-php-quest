/* Mini PHP interpreter (subset of PHP 8) — written for a beginner learning site. */
(function (root) {
'use strict';

// ---------- values ----------
class PFloat { constructor(v) { this.v = v; } }
const F = (v) => new PFloat(v);
class PArr {
  constructor() { this.m = new Map(); this.next = 0; }
  static key(k) {
    if (typeof k === 'number') return Math.trunc(k);
    if (k instanceof PFloat) return Math.trunc(k.v);
    if (k === true) return 1; if (k === false) return 0;
    if (k === null || k === undefined) return '';
    if (typeof k === 'string' && /^(0|-?[1-9][0-9]*)$/.test(k) && Math.abs(Number(k)) < 9007199254740991) return Number(k);
    if (typeof k === 'string') return k;
    throw new PhpError('fatal', 'Illegal offset type');
  }
  get(k) { return this.m.get(PArr.key(k)); }
  has(k) { return this.m.has(PArr.key(k)); }
  set(k, v) { k = PArr.key(k); this.m.set(k, v); if (typeof k === 'number' && k >= this.next) this.next = k + 1; }
  push(v) { this.m.set(this.next, v); this.next++; }
  del(k) { this.m.delete(PArr.key(k)); }
  get size() { return this.m.size; }
  clone() { const a = new PArr(); for (const [k, v] of this.m) a.m.set(k, v instanceof PArr ? v.clone() : v); a.next = this.next; return a; }
  values() { return [...this.m.values()]; }
  keys() { return [...this.m.keys()]; }
  static from(list) { const a = new PArr(); for (const v of list) a.push(v); return a; }
  isList() { let i = 0; for (const k of this.m.keys()) { if (k !== i) return false; i++; } return true; }
}
class PObj { constructor(cls) { this.cls = cls; this.props = new Map(); this.id = 0; } }
class PClosure { constructor(params, body, scope, arrow, thisObj, cls, uses) { this.params = params; this.body = body; this.scope = scope; this.arrow = arrow; this.thisObj = thisObj; this.cls = cls; this.uses = uses; } }

class PhpError extends Error { constructor(kind, msg, line) { super(msg); this.kind = kind; this.line = line; } }
class BreakSig { constructor(n) { this.n = n; } }
class ContinueSig { constructor(n) { this.n = n; } }
class ReturnSig { constructor(v) { this.v = v; } }
class ThrowSig { constructor(obj, line) { this.obj = obj; this.line = line; } }

// ---------- lexer ----------
const OPS = ['<=>', '**=', '...', '===', '!==', '<<=', '>>=', '??=', '?->', '==', '!=', '<>', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '.=', '%=', '**', '->', '=>', '::', '??', '<<', '>>', '|=', '&=', '^=',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '.', '(', ')', '[', ']', '{', '}', ',', ';', '?', ':', '&', '|', '^', '~', '@'];

function lex(src) {
  const toks = [];
  let i = 0, line = 1;
  const n = src.length;
  let php = false, echoTag = false;
  const push = (t, v, extra) => { const tok = { t, v, line }; if (extra) Object.assign(tok, extra); toks.push(tok); };
  while (i < n) {
    if (!php) {
      let j = src.indexOf('<?', i);
      let tagLen = 0, isEcho = false;
      while (j !== -1) {
        if (src.substr(j, 5).toLowerCase() === '<?php') { tagLen = 5; break; }
        if (src.substr(j, 3) === '<?=') { tagLen = 3; isEcho = true; break; }
        j = src.indexOf('<?', j + 2);
      }
      const end = j === -1 ? n : j;
      if (end > i) { push('html', src.slice(i, end)); line += (src.slice(i, end).match(/\n/g) || []).length; }
      if (j === -1) break;
      i = j + tagLen; php = true;
      if (isEcho) { push('id', 'echo'); echoTag = true; }
      continue;
    }
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '?' && src[i + 1] === '>') {
      push(';', ';', { implicit: true }); i += 2; php = false; echoTag = false;
      if (src[i] === '\n') { i++; line++; } else if (src[i] === '\r' && src[i + 1] === '\n') { i += 2; line++; }
      continue;
    }
    if (c === '#' && src[i + 1] === '[') { // attribute: skip
      let d = 0; while (i < n) { if (src[i] === '[') d++; else if (src[i] === ']') { d--; if (d === 0) { i++; break; } } else if (src[i] === '\n') line++; i++; }
      continue;
    }
    if (c === '#' || (c === '/' && src[i + 1] === '/')) {
      while (i < n && src[i] !== '\n' && !(src[i] === '?' && src[i + 1] === '>')) i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2);
      const stop = e === -1 ? n : e + 2;
      line += (src.slice(i, stop).match(/\n/g) || []).length; i = stop; continue;
    }
    if (c === '$' && /[a-zA-Z_\x80-￿]/.test(src[i + 1] || '')) {
      let j = i + 1; while (j < n && /[\w\x80-￿]/.test(src[j])) j++;
      push('var', src.slice(i + 1, j)); i = j; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let m = /^0[xX][0-9a-fA-F_]+/.exec(src.slice(i));
      if (m) { push('num', parseInt(m[0].replace(/_/g, ''), 16)); i += m[0].length; continue; }
      m = /^0[bB][01_]+/.exec(src.slice(i));
      if (m) { push('num', parseInt(m[0].slice(2).replace(/_/g, ''), 2)); i += m[0].length; continue; }
      m = /^([0-9][0-9_]*)?(\.[0-9_]*)?([eE][+-]?[0-9]+)?/.exec(src.slice(i));
      const s = m[0].replace(/_/g, '');
      const isF = !!(m[2] || m[3]);
      push('num', isF ? F(parseFloat(s)) : parseInt(s, 10));
      i += m[0].length; continue;
    }
    if (/[a-zA-Z_\\\x80-￿]/.test(c)) {
      let j = i; while (j < n && /[\w\\\x80-￿]/.test(src[j])) j++;
      let w = src.slice(i, j); if (w[0] === '\\') w = w.slice(1);
      push('id', w); i = j; continue;
    }
    if (c === "'") {
      let j = i + 1, s = '';
      while (j < n && src[j] !== "'") {
        if (src[j] === '\\' && (src[j + 1] === "'" || src[j + 1] === '\\')) { s += src[j + 1]; j += 2; continue; }
        if (src[j] === '\n') line++;
        s += src[j++];
      }
      if (j >= n) throw new PhpError('parse', "syntax error, string dengan tanda petik tunggal (') tidak ditutup", line);
      push('str', s); i = j + 1; continue;
    }
    if (c === '"') {
      let j = i + 1; const startLine = line;
      while (j < n && src[j] !== '"') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '\n') line++;
        if (src[j] === '{' && src[j + 1] === '$') {
          let d = 0;
          for (; j < n; j++) {
            const ch = src[j];
            if (ch === '{') d++;
            else if (ch === '}') { d--; if (d === 0) break; }
            else if (ch === '"' || ch === "'") { const q = ch; j++; while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; } }
          }
        }
        j++;
      }
      if (j >= n) throw new PhpError('parse', 'syntax error, string dengan tanda petik ganda (") tidak ditutup', startLine);
      toks.push({ t: 'tpl', v: src.slice(i + 1, j), line: startLine }); i = j + 1; continue;
    }
    if (c === '<' && src.substr(i, 3) === '<<<') { // heredoc / nowdoc
      const m = /^<<<[ \t]*(["']?)([A-Za-z_]\w*)\1\r?\n/.exec(src.slice(i));
      if (m) {
        const label = m[2], now = m[1] === "'";
        let j = i + m[0].length; const startLine = line; line++;
        const re = new RegExp('^([ \\t]*)' + label + '\\b', 'm');
        const rest = src.slice(j); const mm = re.exec(rest);
        if (!mm) throw new PhpError('parse', 'heredoc tidak ditutup', startLine);
        let body = rest.slice(0, mm.index).replace(/\r?\n$/, '');
        const indent = mm[1];
        if (indent) body = body.split('\n').map(l => l.startsWith(indent) ? l.slice(indent.length) : l).join('\n');
        line += (rest.slice(0, mm.index).match(/\n/g) || []).length;
        i = j + mm.index + mm[0].length;
        if (now) toks.push({ t: 'str', v: body, line: startLine }); else toks.push({ t: 'tpl', v: body, line: startLine, heredoc: true });
        continue;
      }
    }
    let op = null;
    for (const o of OPS) if (src.startsWith(o, i)) { op = o; break; }
    if (!op) throw new PhpError('parse', 'syntax error, karakter tidak dikenal "' + c + '"', line);
    push(op, op); i += op.length;
  }
  if (echoTag) push(';', ';', { implicit: true });
  toks.push({ t: 'eof', v: null, line });
  return toks;
}

// ---------- parser ----------
const CASTS = { int: 'int', integer: 'int', float: 'float', double: 'float', string: 'string', bool: 'bool', boolean: 'bool', array: 'array', object: 'object' };
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '.=', '%=', '**=', '??=', '|=', '&=', '^=', '<<=', '>>=']);
const BINARY = {
  'or': [1, 'L'], 'xor': [2, 'L'], 'and': [3, 'L'],
  '?': [5, 'L'], '??': [6, 'R'], '||': [7, 'L'], '&&': [8, 'L'], '|': [9, 'L'], '^': [10, 'L'], '&': [11, 'L'],
  '==': [12, 'N'], '!=': [12, 'N'], '===': [12, 'N'], '!==': [12, 'N'], '<>': [12, 'N'], '<=>': [12, 'N'],
  '<': [13, 'N'], '>': [13, 'N'], '<=': [13, 'N'], '>=': [13, 'N'],
  '.': [14, 'L'], '<<': [15, 'L'], '>>': [15, 'L'], '+': [16, 'L'], '-': [16, 'L'], '*': [17, 'L'], '/': [17, 'L'], '%': [17, 'L'],
  'instanceof': [19, 'N'], '**': [21, 'R']
};

function describeTok(t) {
  if (t.t === 'eof') return 'akhir kode (end of file)';
  if (t.t === 'var') return 'variabel "$' + t.v + '"';
  if (t.t === 'num') return 'angka "' + (t.v instanceof PFloat ? t.v.v : t.v) + '"';
  if (t.t === 'str' || t.t === 'tpl') return 'string';
  if (t.t === 'id') return 'kata "' + t.v + '"';
  if (t.t === 'html') return 'teks di luar tag PHP';
  return 'token "' + t.v + '"';
}

class Parser {
  constructor(toks) { this.toks = toks; this.p = 0; }
  peek(o = 0) { return this.toks[this.p + o]; }
  next() { return this.toks[this.p++]; }
  is(t, o = 0) { const k = this.peek(o); return k.t === t || (k.t === 'id' && t.startsWith && k.v.toLowerCase() === t && /^[a-z_]+$/.test(t)); }
  isOp(v, o = 0) { return this.peek(o).t === v; }
  isKw(w, o = 0) { const k = this.peek(o); return k.t === 'id' && k.v.toLowerCase() === w; }
  err(msg, tok) { tok = tok || this.peek(); throw new PhpError('parse', msg || ('syntax error, tidak terduga ' + describeTok(tok)), tok.line); }
  expect(t, hint) {
    const k = this.peek();
    if (k.t !== t) {
      let msg = 'syntax error, tidak terduga ' + describeTok(k) + ', seharusnya "' + t + '"';
      if (t === ';') {
        const prev = this.toks[this.p - 1];
        throw new PhpError('parse', 'syntax error, tidak terduga ' + describeTok(k) + ', kemungkinan kurang titik koma ";" di akhir baris ' + (prev ? prev.line : k.line), prev ? prev.line : k.line);
      }
      if (hint) msg += ' (' + hint + ')';
      this.err(msg, k);
    }
    return this.next();
  }
  expectKw(w) { if (!this.isKw(w)) this.err('syntax error, tidak terduga ' + describeTok(this.peek()) + ', seharusnya "' + w + '"'); return this.next(); }
  ident() { const k = this.peek(); if (k.t !== 'id') this.err(); this.p++; return k.v; }

  program() {
    const body = [];
    while (this.peek().t !== 'eof') body.push(this.statement());
    return body;
  }
  block() {
    if (this.isOp('{')) {
      this.next(); const body = [];
      while (!this.isOp('}')) { if (this.peek().t === 'eof') this.err('syntax error, tidak terduga akhir kode, kurang kurung kurawal penutup "}"'); body.push(this.statement()); }
      this.next(); return body;
    }
    return [this.statement()];
  }
  altBlock(enders) {
    const body = [];
    while (!enders.some(e => this.isKw(e))) { if (this.peek().t === 'eof') this.err('syntax error, tidak terduga akhir kode, seharusnya "' + enders[enders.length - 1] + '"'); body.push(this.statement()); }
    return body;
  }
  endStmt() { if (this.peek().t === 'eof' || this.peek().t === 'html') { if (this.toks[this.p - 1] && this.toks[this.p - 1].implicit) return; } this.expect(';'); }
  statement() {
    const tok = this.peek(); const line = tok.line;
    if (tok.t === 'html') { this.next(); return { k: 'Html', v: tok.v, line }; }
    if (tok.t === ';') { this.next(); return { k: 'Nop', line }; }
    if (tok.t === '{') return { k: 'Block', body: this.block(), line };
    if (tok.t === 'id') {
      const w = tok.v.toLowerCase();
      const nx = this.peek(1);
      switch (w) {
        case 'echo': {
          this.next(); const args = [this.expr()];
          while (this.isOp(',')) { this.next(); args.push(this.expr()); }
          this.endStmt(); return { k: 'Echo', args, line };
        }
        case 'if': return this.ifStmt();
        case 'while': {
          this.next(); this.expect('('); const c = this.expr(); this.expect(')');
          if (this.isOp(':')) { this.next(); const body = this.altBlock(['endwhile']); this.next(); this.endStmt(); return { k: 'While', c, body, line }; }
          return { k: 'While', c, body: this.block(), line };
        }
        case 'do': {
          this.next(); const body = this.block(); this.expectKw('while'); this.expect('('); const c = this.expr(); this.expect(')'); this.endStmt();
          return { k: 'DoWhile', c, body, line };
        }
        case 'for': {
          this.next(); this.expect('(');
          const list = (end) => { const a = []; if (!this.isOp(end)) { a.push(this.expr()); while (this.isOp(',')) { this.next(); a.push(this.expr()); } } this.expect(end, end === ';' ? 'bagian for dipisah dengan titik koma' : undefined); return a; };
          const init = list(';'), cond = list(';'), step = list(')');
          if (this.isOp(':')) { this.next(); const body = this.altBlock(['endfor']); this.next(); this.endStmt(); return { k: 'For', init, cond, step, body, line }; }
          return { k: 'For', init, cond, step, body: this.block(), line };
        }
        case 'foreach': {
          this.next(); this.expect('('); const e = this.expr(); this.expectKw('as');
          let kk = null, ref = false, v;
          const target = () => { if (this.isOp('&')) { this.next(); ref = true; } return this.expr(22); };
          v = target();
          if (this.isOp('=>')) { this.next(); kk = v; v = target(); }
          this.expect(')');
          if (this.isOp(':')) { this.next(); const body = this.altBlock(['endforeach']); this.next(); this.endStmt(); return { k: 'Foreach', e, kk, v, ref, body, line }; }
          return { k: 'Foreach', e, kk, v, ref, body: this.block(), line };
        }
        case 'switch': {
          this.next(); this.expect('('); const e = this.expr(); this.expect(')'); this.expect('{');
          const cases = [];
          while (!this.isOp('}')) {
            let test = null;
            if (this.isKw('case')) { this.next(); test = this.expr(); }
            else if (this.isKw('default')) { this.next(); }
            else this.err('syntax error, di dalam switch seharusnya "case" atau "default"');
            if (this.isOp(':') || this.isOp(';')) this.next(); else this.expect(':');
            const body = [];
            while (!this.isKw('case') && !this.isKw('default') && !this.isOp('}')) { if (this.peek().t === 'eof') this.err(); body.push(this.statement()); }
            cases.push({ test, body });
          }
          this.next(); return { k: 'Switch', e, cases, line };
        }
        case 'break': case 'continue': {
          this.next(); let lv = 1; if (this.peek().t === 'num') lv = this.next().v; this.endStmt();
          return { k: w === 'break' ? 'Break' : 'Continue', n: lv, line };
        }
        case 'return': {
          this.next(); let e = null; if (!this.isOp(';') && this.peek().t !== 'eof') e = this.expr(); this.endStmt();
          return { k: 'Return', e, line };
        }
        case 'function':
          if (nx.t === 'id' || (nx.t === '&' && this.peek(2).t === 'id')) { this.next(); if (this.isOp('&')) this.next(); const name = this.ident(); const f = this.funcRest(name); f.line = line; return { k: 'FuncDecl', f, line }; }
          break;
        case 'abstract': case 'final': case 'readonly':
          if (this.isKw('class', 1) || this.isKw('class', 2) || this.isKw('final', 1) || this.isKw('readonly', 1) || this.isKw('abstract', 1)) {
            const mods = []; while (!this.isKw('class')) mods.push(this.next().v.toLowerCase()); return this.classDecl(mods);
          }
          break;
        case 'class': if (nx.t === 'id') return this.classDecl([]); break;
        case 'interface': if (nx.t === 'id') return this.interfaceDecl(); break;
        case 'trait': if (nx.t === 'id') return this.classDecl(['trait']); break;
        case 'global': {
          this.next(); const names = [this.expect('var').v];
          while (this.isOp(',')) { this.next(); names.push(this.expect('var').v); }
          this.endStmt(); return { k: 'Global', names, line };
        }
        case 'static':
          if (nx.t === 'var') {
            this.next(); const vars = [];
            do { if (vars.length) this.next(); const name = this.expect('var').v; let init = null; if (this.isOp('=')) { this.next(); init = this.expr(); } vars.push({ name, init }); } while (this.isOp(','));
            this.endStmt(); return { k: 'StaticVar', vars, line };
          }
          break;
        case 'unset':
          if (nx.t === '(') {
            this.next(); this.next(); const args = [];
            while (!this.isOp(')')) { args.push(this.expr()); if (this.isOp(',')) this.next(); }
            this.next(); this.endStmt(); return { k: 'Unset', args, line };
          }
          break;
        case 'try': {
          this.next(); const body = this.block(); const catches = []; let fin = null;
          while (this.isKw('catch')) {
            this.next(); this.expect('('); const types = [this.ident()];
            while (this.isOp('|')) { this.next(); types.push(this.ident()); }
            let v = null; if (this.peek().t === 'var') v = this.next().v;
            this.expect(')'); catches.push({ types, v, body: this.block() });
          }
          if (this.isKw('finally')) { this.next(); fin = this.block(); }
          if (!catches.length && !fin) this.err('syntax error, "try" harus diikuti "catch" atau "finally"');
          return { k: 'Try', body, catches, fin, line };
        }
        case 'throw': {
          this.next(); const e = this.expr(); this.endStmt(); return { k: 'Throw', e, line };
        }
        case 'const': {
          this.next(); const list = [];
          do { if (list.length) this.next(); const name = this.ident(); this.expect('='); list.push({ name, e: this.expr() }); } while (this.isOp(','));
          this.endStmt(); return { k: 'ConstDecl', list, line };
        }
        case 'declare': { this.next(); this.expect('('); while (!this.isOp(')')) this.next(); this.next(); this.endStmt(); return { k: 'Nop', line }; }
        case 'namespace': case 'use': {
          if (w === 'use' || nx.t === 'id') { this.next(); while (!this.isOp(';') && this.peek().t !== 'eof') this.next(); this.endStmt(); return { k: 'Nop', line }; }
          break;
        }
        case 'else': case 'elseif': this.err('syntax error, tidak terduga "' + tok.v + '" — "' + tok.v + '" harus muncul tepat setelah blok if');
      }
    }
    const e = this.expr();
    this.endStmt();
    return { k: 'ExprStmt', e, line };
  }
  ifStmt() {
    const line = this.next().line; this.expect('('); const c = this.expr(); this.expect(')');
    if (this.isOp(':')) {
      this.next(); const then = this.altBlock(['elseif', 'else', 'endif']); const elifs = []; let els = null;
      while (true) {
        if (this.isKw('elseif')) { this.next(); this.expect('('); const c2 = this.expr(); this.expect(')'); this.expect(':'); elifs.push({ c: c2, body: this.altBlock(['elseif', 'else', 'endif']) }); continue; }
        if (this.isKw('else')) { this.next(); this.expect(':'); els = this.altBlock(['endif']); }
        break;
      }
      this.expectKw('endif'); this.endStmt();
      return { k: 'If', c, then, elifs, els, line };
    }
    const then = this.block(); const elifs = []; let els = null;
    while (true) {
      if (this.isKw('elseif') || (this.isKw('else') && this.isKw('if', 1))) {
        if (this.isKw('else')) this.next(); this.next();
        this.expect('('); const c2 = this.expr(); this.expect(')'); elifs.push({ c: c2, body: this.block() }); continue;
      }
      if (this.isKw('else')) { this.next(); els = this.block(); }
      break;
    }
    return { k: 'If', c, then, elifs, els, line };
  }
  skipType() {
    // parse optional type: ?int, int|string, array, Foo, static, etc.
    const isTypeStart = () => { const k = this.peek(); return (k.t === 'id' && !this.isKw('function') && !this.isKw('fn')) || k.t === '?' || (k.t === '(' && false); };
    if (!isTypeStart()) return null;
    let s = '';
    if (this.isOp('?')) { this.next(); s += '?'; }
    s += this.ident();
    while (this.isOp('|') || (this.isOp('&') && this.peek(1).t === 'id')) { this.next(); s += '|' + this.ident(); }
    return s;
  }
  params() {
    this.expect('('); const ps = [];
    while (!this.isOp(')')) {
      const p = { name: null, def: null, byRef: false, variadic: false, promote: null };
      while (this.isKw('public') || this.isKw('private') || this.isKw('protected') || this.isKw('readonly')) { const m = this.next().v.toLowerCase(); if (m !== 'readonly') p.promote = m; else if (!p.promote) p.promote = 'public'; }
      if (this.peek().t !== 'var' && !this.isOp('&') && !this.isOp('...')) p.type = this.skipType();
      if (this.isOp('&')) { this.next(); p.byRef = true; }
      if (this.isOp('...')) { this.next(); p.variadic = true; }
      p.name = this.expect('var', 'nama parameter harus diawali $').v;
      if (this.isOp('=')) { this.next(); p.def = this.expr(); }
      ps.push(p);
      if (this.isOp(',')) this.next(); else if (!this.isOp(')')) this.err();
    }
    this.next(); return ps;
  }
  funcRest(name) {
    const params = this.params();
    let uses = null;
    if (this.isKw('use')) {
      this.next(); this.expect('('); uses = [];
      while (!this.isOp(')')) { let r = false; if (this.isOp('&')) { this.next(); r = true; } uses.push({ name: this.expect('var').v, byRef: r }); if (this.isOp(',')) this.next(); }
      this.next();
    }
    if (this.isOp(':')) { this.next(); this.skipType(); }
    let body = null;
    if (this.isOp(';')) { this.next(); } else { this.expect('{', 'badan fungsi diawali {'); this.p--; body = this.block(); }
    return { name, params, body, uses };
  }
  interfaceDecl() {
    const line = this.next().line; const name = this.ident();
    if (this.isKw('extends')) { this.next(); this.ident(); while (this.isOp(',')) { this.next(); this.ident(); } }
    this.expect('{'); let d = 1; while (d > 0) { const t = this.next(); if (t.t === '{') d++; else if (t.t === '}') d--; else if (t.t === 'eof') this.err(); }
    return { k: 'Interface', name, line };
  }
  classDecl(mods) {
    const line = this.next().line; const name = this.ident();
    let parent = null, ifaces = [];
    if (this.isKw('extends')) { this.next(); parent = this.ident(); }
    if (this.isKw('implements')) { this.next(); ifaces.push(this.ident()); while (this.isOp(',')) { this.next(); ifaces.push(this.ident()); } }
    this.expect('{', 'badan class diawali {');
    const props = [], methods = [], consts = [], traits = [];
    while (!this.isOp('}')) {
      if (this.peek().t === 'eof') this.err('syntax error, tidak terduga akhir kode, kurang "}" untuk menutup class ' + name);
      if (this.isKw('use')) { this.next(); traits.push(this.ident()); while (this.isOp(',')) { this.next(); traits.push(this.ident()); } this.expect(';'); continue; }
      let vis = null, isStatic = false, isAbstract = false;
      while (true) {
        if (this.isKw('public') || this.isKw('private') || this.isKw('protected')) vis = this.next().v.toLowerCase();
        else if (this.isKw('static')) { this.next(); isStatic = true; }
        else if (this.isKw('abstract')) { this.next(); isAbstract = true; }
        else if (this.isKw('final') || this.isKw('readonly') || this.isKw('var')) { const m = this.next().v.toLowerCase(); if (m === 'var') vis = 'public'; }
        else break;
      }
      if (this.isKw('const')) {
        this.next(); if (this.peek(1).t === 'id') this.skipType();
        do { if (consts.length && this.isOp(',')) this.next(); const cn = this.ident(); this.expect('='); consts.push({ name: cn, e: this.expr(), vis: vis || 'public' }); } while (this.isOp(','));
        this.expect(';'); continue;
      }
      if (this.isKw('function')) {
        const ml = this.next().line; if (this.isOp('&')) this.next(); const mname = this.ident(); const f = this.funcRest(mname); f.line = ml;
        methods.push({ name: mname, f, vis: vis || 'public', isStatic, isAbstract }); continue;
      }
      if (this.peek().t !== 'var') this.skipType();
      do {
        if (this.isOp(',')) this.next();
        const pt = this.expect('var', 'deklarasi property harus berupa $nama'); let def = null;
        if (this.isOp('=')) { this.next(); def = this.expr(); }
        props.push({ name: pt.v, def, vis: vis || 'public', isStatic, line: pt.line });
      } while (this.isOp(','));
      this.expect(';');
    }
    this.next();
    return { k: 'ClassDecl', name, parent, ifaces, props, methods, consts, traits, mods, line };
  }

  // ----- expressions -----
  expr(minBp = 0) {
    let left = this.prefix();
    for (;;) {
      const tok = this.peek(); const line = tok.line;
      let op = tok.t;
      if (tok.t === 'id') { const w = tok.v.toLowerCase(); if (w === 'and' || w === 'or' || w === 'xor' || w === 'instanceof') op = w; else break; }
      // postfix
      if (op === '[' || op === '->' || op === '?->' || op === '::' || op === '(' || op === '++' || op === '--' || op === '{') {
        if (22 < minBp) break;
        if (op === '{') break;
        if (op === '[') {
          this.next();
          if (this.isOp(']')) { this.next(); left = { k: 'Index', base: left, idx: null, line }; continue; }
          const idx = this.expr(); this.expect(']'); left = { k: 'Index', base: left, idx, line }; continue;
        }
        if (op === '->' || op === '?->') {
          this.next(); let name;
          if (this.peek().t === 'id') name = this.next().v;
          else if (this.peek().t === 'var') name = { k: 'Var', name: this.next().v, line };
          else if (this.isOp('{')) { this.next(); name = this.expr(); this.expect('}'); }
          else this.err('syntax error, setelah "->" seharusnya nama property atau method');
          if (this.isOp('(')) { const args = this.args(); left = { k: 'MCall', obj: left, name, args, nullsafe: op === '?->', line }; }
          else left = { k: 'Prop', obj: left, name, nullsafe: op === '?->', line };
          continue;
        }
        if (op === '::') {
          this.next();
          if (this.peek().t === 'var') { const nm = this.next().v; left = { k: 'SProp', cls: left, name: nm, line }; continue; }
          const nm = this.peek().t === 'id' ? this.next().v : this.err();
          if (nm.toLowerCase() === 'class' ) { left = { k: 'ClassName', cls: left, line }; continue; }
          if (this.isOp('(')) { const args = this.args(); left = { k: 'SCall', cls: left, name: nm, args, line }; }
          else left = { k: 'CConst', cls: left, name: nm, line };
          continue;
        }
        if (op === '(') { const args = this.args(); left = left.k === 'Name' ? { k: 'Call', name: left.name, args, line } : { k: 'ECall', fn: left, args, line }; continue; }
        if (op === '++' || op === '--') { this.next(); left = { k: 'Inc', pre: false, op, t: left, line }; continue; }
      }
      if (ASSIGN_OPS.has(op)) {
        if (!isLval(left)) { if (op === '=' ) this.err('syntax error, tidak terduga "=" — sisi kiri tanda = harus berupa variabel. Untuk membandingkan, gunakan =='); else this.err(); }
        if (4 < minBp && !(left.k === 'Var' || left.k === 'Index' || left.k === 'Prop')) break;
        this.next();
        if (op === '=' && this.isOp('&')) { this.next(); }
        const v = this.expr(4); left = { k: 'Assign', op, t: left, v, line }; continue;
      }
      const b = BINARY[op];
      if (!b) break;
      const [bp, assoc] = b;
      if (bp < minBp) break;
      this.next();
      if (op === '?') {
        if (this.isOp(':')) { this.next(); const r = this.expr(bp + 1); left = { k: 'Tern', c: left, a: null, b: r, line }; continue; }
        const a = this.expr(0); this.expect(':', 'operator ternary: kondisi ? nilai1 : nilai2'); const r = this.expr(bp + 1);
        left = { k: 'Tern', c: left, a, b: r, line }; continue;
      }
      if (op === 'instanceof') {
        let cls; if (this.peek().t === 'id') cls = { k: 'Name', name: this.next().v }; else cls = this.expr(22);
        left = { k: 'InstOf', e: left, cls, line }; continue;
      }
      const right = this.expr(assoc === 'R' ? bp : bp + 1);
      if (op === '&&' || op === '||' || op === 'and' || op === 'or' || op === 'xor' || op === '??') left = { k: 'Logic', op, l: left, r: right, line };
      else left = { k: 'Bin', op: op === '<>' ? '!=' : op, l: left, r: right, line };
    }
    return left;
  }
  args() {
    this.expect('('); const a = [];
    while (!this.isOp(')')) {
      if (this.isOp('...')) { this.next(); a.push({ k: 'Spread', e: this.expr(), line: this.peek().line }); }
      else if (this.peek().t === 'id' && this.isOp(':', 1) && !this.isOp('::', 1)) { const nm = this.next().v; this.next(); a.push({ k: 'Named', name: nm, e: this.expr() }); }
      else a.push(this.expr());
      if (this.isOp(',')) this.next(); else if (!this.isOp(')')) this.err('syntax error, tidak terduga ' + describeTok(this.peek()) + ' — argumen dipisah dengan koma dan ditutup dengan ")"');
    }
    this.next(); return a;
  }
  arrayLit(close) {
    const items = []; const line = this.peek().line;
    while (!this.isOp(close)) {
      if (this.isOp(',')) { this.next(); items.push(null); continue; }
      if (this.isOp('...')) { this.next(); items.push({ spread: true, v: this.expr() }); }
      else {
        let byRef = false; if (this.isOp('&')) { this.next(); byRef = true; }
        let v = this.expr(); let key = null;
        if (this.isOp('=>')) { this.next(); key = v; v = this.expr(); }
        items.push({ key, v });
      }
      if (this.isOp(',')) this.next(); else if (!this.isOp(close)) this.err('syntax error, tidak terduga ' + describeTok(this.peek()) + ' — elemen array dipisah dengan koma');
    }
    this.next(); return { k: 'Arr', items, line };
  }
  prefix() {
    const tok = this.next(); const line = tok.line;
    switch (tok.t) {
      case 'num': return { k: 'Lit', v: tok.v, line };
      case 'str': return { k: 'Lit', v: tok.v, line };
      case 'tpl': return parseInterp(tok.v, line, tok.heredoc);
      case 'var': return { k: 'Var', name: tok.v, line };
      case '[': return this.arrayLit(']');
      case '(': {
        if (this.peek().t === 'id' && CASTS[this.peek().v.toLowerCase()] && this.isOp(')', 1)) {
          const ty = CASTS[this.next().v.toLowerCase()]; this.next(); return { k: 'Cast', type: ty, e: this.expr(20), line };
        }
        const e = this.expr(); this.expect(')', 'kurung buka "(" belum ditutup'); return e;
      }
      case '!': return { k: 'Not', e: this.expr(18), line };
      case '-': return { k: 'Neg', e: this.expr(20), line };
      case '+': return { k: 'Pos', e: this.expr(20), line };
      case '~': return { k: 'BitNot', e: this.expr(20), line };
      case '@': return this.expr(20);
      case '&': return this.expr(20);
      case '++': case '--': return { k: 'Inc', pre: true, op: tok.t, t: this.expr(22), line };
      case 'id': {
        const w = tok.v.toLowerCase();
        if (w === 'true') return { k: 'Lit', v: true, line };
        if (w === 'false') return { k: 'Lit', v: false, line };
        if (w === 'null') return { k: 'Lit', v: null, line };
        if (w === 'array' && this.isOp('(')) { this.next(); return this.arrayLit(')'); }
        if (w === 'list' && this.isOp('(')) { this.next(); return this.arrayLit(')'); }
        if (w === 'new') {
          let cls;
          if (this.peek().t === 'id') { const nm = this.next().v; cls = nm.toLowerCase() === 'class' ? null : { k: 'Name', name: nm }; if (!cls) { const args = this.isOp('(') ? this.args() : []; const d = this.classDecl.call(Object.assign(Object.create(this), { next: () => ({ line }), ident: () => 'class@anonymous' }), []); return { k: 'NewAnon', decl: d, args, line }; } }
          else if (this.peek().t === 'var') cls = { k: 'Var', name: this.next().v, line };
          else if (this.isOp('(')) { this.next(); cls = this.expr(); this.expect(')'); }
          else this.err('syntax error, setelah "new" seharusnya nama class');
          const args = this.isOp('(') ? this.args() : [];
          return { k: 'New', cls, args, line };
        }
        if (w === 'function' || (w === 'static' && this.isKw('function'))) { if (w === 'static') this.next(); if (this.isOp('&')) this.next(); const f = this.funcRest('{closure}'); return { k: 'Closure', f, arrow: false, line }; }
        if (w === 'fn' || (w === 'static' && this.isKw('fn'))) {
          if (w === 'static') this.next(); if (this.isOp('&')) this.next();
          const params = this.params(); if (this.isOp(':')) { this.next(); this.skipType(); }
          this.expect('=>', 'arrow function: fn($x) => ekspresi'); const e = this.expr(4);
          return { k: 'Closure', f: { name: '{closure}', params, body: [{ k: 'Return', e, line }] }, arrow: true, line };
        }
        if (w === 'match' && this.isOp('(')) {
          this.next(); const subj = this.expr(); this.expect(')'); this.expect('{'); const arms = [];
          while (!this.isOp('}')) {
            let conds = null;
            if (this.isKw('default')) { this.next(); }
            else { conds = [this.expr()]; while (this.isOp(',') && !this.isOp('=>', 1)) { this.next(); conds.push(this.expr()); } if (this.isOp(',')) this.next(); }
            this.expect('=>', 'arm match: nilai => hasil'); const res = this.expr(); arms.push({ conds, res });
            if (this.isOp(',')) this.next(); else if (!this.isOp('}')) this.err();
          }
          this.next(); return { k: 'Match', subj, arms, line };
        }
        if (w === 'isset' && this.isOp('(')) { const args = this.args(); return { k: 'Isset', args, line }; }
        if (w === 'empty' && this.isOp('(')) { const args = this.args(); return { k: 'Empty', e: args[0], line }; }
        if (w === 'print') return { k: 'Print', e: this.expr(4), line };
        if (w === 'throw') return { k: 'ThrowExpr', e: this.expr(4), line };
        if (w === 'exit' || w === 'die') { let e = null; if (this.isOp('(')) { const a = this.args(); e = a[0] || null; } return { k: 'Exit', e, line }; }
        if (w === 'clone') return { k: 'Clone', e: this.expr(22), line };
        if (w === 'include' || w === 'require' || w === 'include_once' || w === 'require_once') { this.expr(); return { k: 'Lit', v: true, line }; }
        return { k: 'Name', name: tok.v, line };
      }
    }
    this.p--;
    if (tok.t === 'eof') this.err('syntax error, tidak terduga akhir kode — ada ekspresi yang belum selesai', tok);
    this.err(null, tok);
  }
}
function isLval(e) { return e.k === 'Var' || e.k === 'Index' || e.k === 'Prop' || e.k === 'SProp' || e.k === 'Arr'; }

function parseInterp(raw, line, heredoc) {
  const parts = []; let buf = ''; let i = 0; const n = raw.length;
  const flush = () => { if (buf) { parts.push(buf); buf = ''; } };
  while (i < n) {
    const c = raw[i];
    if (c === '\\' && i + 1 < n) {
      const d = raw[i + 1];
      const map = { n: '\n', t: '\t', r: '\r', v: '\v', e: '\x1b', f: '\f', '\\': '\\', '$': '$', '"': '"', '0': '\0' };
      if (d === 'u' && raw[i + 2] === '{') { const e = raw.indexOf('}', i); buf += String.fromCodePoint(parseInt(raw.slice(i + 3, e), 16)); i = e + 1; continue; }
      if (d === 'x' && /[0-9a-fA-F]/.test(raw[i + 2] || '')) { const m = /^[0-9a-fA-F]{1,2}/.exec(raw.slice(i + 2)); buf += String.fromCharCode(parseInt(m[0], 16)); i += 2 + m[0].length; continue; }
      if (d === '"' && heredoc) { buf += '\\"'; i += 2; continue; }
      if (map[d] !== undefined) { buf += map[d]; i += 2; continue; }
      buf += c; i++; continue;
    }
    if (c === '{' && raw[i + 1] === '$') {
      let d = 0, j = i;
      for (; j < n; j++) { if (raw[j] === '{') d++; else if (raw[j] === '}') { d--; if (d === 0) break; } else if (raw[j] === "'" || raw[j] === '"') { const q = raw[j]; j++; while (j < n && raw[j] !== q) { if (raw[j] === '\\') j++; j++; } } }
      const inner = raw.slice(i + 1, j);
      flush();
      const toks = lex('<?php ' + inner + ';');
      toks.forEach(t => t.line = line);
      const p = new Parser(toks); const e = p.expr();
      parts.push(e); i = j + 1; continue;
    }
    if (c === '$' && /[a-zA-Z_\x80-￿]/.test(raw[i + 1] || '')) {
      let j = i + 1; while (j < n && /[\w\x80-￿]/.test(raw[j])) j++;
      let e = { k: 'Var', name: raw.slice(i + 1, j), line };
      if (raw[j] === '[') {
        const close = raw.indexOf(']', j);
        if (close !== -1) {
          let key = raw.slice(j + 1, close); let ke;
          if (/^-?\d+$/.test(key)) ke = { k: 'Lit', v: parseInt(key, 10) };
          else if (key[0] === '$') ke = { k: 'Var', name: key.slice(1), line };
          else if (key[0] === "'") ke = { k: 'Lit', v: key.slice(1, -1) , badQuote: true };
          else ke = { k: 'Lit', v: key };
          e = { k: 'Index', base: e, idx: ke, line }; j = close + 1;
        }
      } else if (raw[j] === '-' && raw[j + 1] === '>' && /[a-zA-Z_]/.test(raw[j + 2] || '')) {
        let q = j + 2; while (q < n && /\w/.test(raw[q])) q++;
        e = { k: 'Prop', obj: e, name: raw.slice(j + 2, q), line }; j = q;
      }
      flush(); parts.push(e); i = j; continue;
    }
    buf += c; i++;
  }
  flush();
  if (parts.length === 0) return { k: 'Lit', v: '', line };
  if (parts.length === 1 && typeof parts[0] === 'string') return { k: 'Lit', v: parts[0], line };
  return { k: 'Interp', parts, line };
}

// ---------- runtime helpers ----------
const isNum = (v) => typeof v === 'number' || v instanceof PFloat;
const numVal = (v) => v instanceof PFloat ? v.v : v;
function isNumericStr(s) { return typeof s === 'string' && /^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/.test(s); }
function fmtFloat(x, prec = 14) {
  if (Number.isNaN(x)) return 'NAN';
  if (!Number.isFinite(x)) return x > 0 ? 'INF' : '-INF';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  let s = prec === 17 ? String(x) : String(Number(x.toPrecision(prec)));
  const ax = Math.abs(Number(s));
  if (/e/.test(s) || ax >= 1e15 || (ax < 1e-4 && ax > 0)) {
    let [m, e] = Number(s).toExponential().split('e');
    if (prec !== 17) m = String(Number(Number(m).toPrecision(prec)));
    if (!m.includes('.')) m += '.0';
    const en = parseInt(e, 10);
    s = m + 'E' + (en < 0 ? '-' : '+') + Math.abs(en);
  }
  return s;
}
function reprFloat(x) {
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return String(x);
  return fmtFloat(x, 17);
}

class Interp {
  constructor(opts = {}) {
    this.out = []; this.outLen = 0; this.diags = [];
    this.funcs = new Map(); this.classes = new Map(); this.consts = new Map();
    this.globals = new Map();
    this.steps = 0; this.maxSteps = opts.maxSteps || 3000000; this.maxOut = opts.maxOut || 200000;
    this.objId = 0; this.callDepth = 0;
    this.staticVars = new Map();
    this.start = Date.now();
    this.consts.set('PHP_EOL', '\n'); this.consts.set('PHP_INT_MAX', 9007199254740991); this.consts.set('PHP_INT_MIN', -9007199254740991);
    this.consts.set('PHP_VERSION', '8.3.0'); this.consts.set('M_PI', F(Math.PI)); this.consts.set('M_E', F(Math.E));
    this.consts.set('PHP_FLOAT_EPSILON', F(Number.EPSILON)); this.consts.set('NAN', F(NaN)); this.consts.set('INF', F(Infinity));
    this.consts.set('STR_PAD_RIGHT', 1); this.consts.set('STR_PAD_LEFT', 0); this.consts.set('STR_PAD_BOTH', 2);
    this.consts.set('SORT_REGULAR', 0); this.consts.set('SORT_NUMERIC', 1); this.consts.set('SORT_STRING', 2);
    this.consts.set('COUNT_RECURSIVE', 1); this.consts.set('ARRAY_FILTER_USE_KEY', 2); this.consts.set('ARRAY_FILTER_USE_BOTH', 1);
    this.consts.set('JSON_PRETTY_PRINT', 128); this.consts.set('JSON_UNESCAPED_UNICODE', 256); this.consts.set('JSON_UNESCAPED_SLASHES', 64);
    this.consts.set('PHP_ROUND_HALF_UP', 1); this.consts.set('E_ALL', 32767); this.consts.set('PHP_OS', 'Linux');
    this.line = 0;
  }
  echo(s) {
    this.outLen += s.length;
    if (this.outLen > this.maxOut) { this.out.push(s.slice(0, Math.max(0, s.length - (this.outLen - this.maxOut)))); throw new PhpError('fatal', 'Output terlalu panjang (lebih dari ' + this.maxOut + ' karakter). Cek apakah ada perulangan yang tidak berhenti.'); }
    this.out.push(s);
  }
  warn(msg, kind = 'warning') { if (this.diags.length < 50) this.diags.push({ kind, msg, line: this.line }); }
  tick() { if (++this.steps > this.maxSteps) throw new PhpError('fatal', 'Program berjalan terlalu lama (lebih dari ' + this.maxSteps.toLocaleString('id-ID') + ' langkah). Kemungkinan ada perulangan tak berhenti (infinite loop) — cek kondisi berhenti di while/for.'); }

  // conversions
  toStr(v) {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (v instanceof PFloat) return fmtFloat(v.v);
    if (v === true) return '1';
    if (v === false || v === null || v === undefined) return '';
    if (v instanceof PArr) { this.warn('Array to string conversion — array tidak bisa langsung di-echo. Gunakan print_r($array) atau implode().'); return 'Array'; }
    if (v instanceof PObj) {
      const m = this.findMethod(v.cls, '__tostring');
      if (m) return this.toStr(this.callMethod(v, m, []));
      throw new PhpError('fatal', 'Uncaught Error: Object of class ' + v.cls.name + ' could not be converted to string');
    }
    if (v instanceof PClosure) throw new PhpError('fatal', 'Uncaught Error: Object of class Closure could not be converted to string');
    return String(v);
  }
  toNum(v, warnCtx) {
    if (typeof v === 'number') return v;
    if (v instanceof PFloat) return v;
    if (v === true) return 1;
    if (v === false || v === null || v === undefined) return 0;
    if (typeof v === 'string') {
      const m = /^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?/.exec(v);
      if (!m) {
        if (warnCtx) throw new PhpError('fatal', 'Uncaught TypeError: Unsupported operand types: string ' + warnCtx + ' — "' + v + '" bukan angka');
        return 0;
      }
      if (m[0].length !== v.length && !/^\s*$/.test(v.slice(m[0].length))) this.warn('A non-numeric value encountered — "' + v + '" bukan angka penuh');
      const s = m[0].trim();
      if (/[.eE]/.test(s)) return F(parseFloat(s));
      const iv = parseInt(s, 10); return Number.isSafeInteger(iv) ? iv : F(iv);
    }
    if (v instanceof PArr) throw new PhpError('fatal', 'Uncaught TypeError: Unsupported operand types: array');
    if (v instanceof PObj) throw new PhpError('fatal', 'Uncaught TypeError: Unsupported operand types: ' + v.cls.name);
    return 0;
  }
  toInt(v) { const n = this.toNum(v); const x = numVal(n); return Number.isFinite(x) ? Math.trunc(x) : 0; }
  toFloat(v) { return numVal(this.toNum(v)); }
  toBool(v) {
    if (v === null || v === undefined || v === false) return false;
    if (v === true) return true;
    if (typeof v === 'number') return v !== 0;
    if (v instanceof PFloat) return v.v !== 0;
    if (typeof v === 'string') return v !== '' && v !== '0';
    if (v instanceof PArr) return v.size > 0;
    return true;
  }
  typeName(v) {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number') return 'integer';
    if (v instanceof PFloat) return 'double';
    if (typeof v === 'string') return 'string';
    if (v instanceof PArr) return 'array';
    return 'object';
  }
  shortType(v) { const t = this.typeName(v); return { NULL: 'null', boolean: 'bool', integer: 'int', double: 'float', string: 'string', array: 'array', object: v instanceof PObj ? v.cls.name : 'Closure' }[t]; }
  mkNum(x) { return Number.isInteger(x) && Number.isSafeInteger(x) ? x : F(x); }
  arith(op, a, b) {
    const ctx = op;
    if (a instanceof PArr && b instanceof PArr && op === '+') { const r = a.clone(); for (const [k, v] of b.m) if (!r.m.has(k)) r.set(k, v); return r; }
    const x = this.toNum(a, ctx), y = this.toNum(b, ctx);
    const bothInt = typeof x === 'number' && typeof y === 'number';
    const xv = numVal(x), yv = numVal(y);
    switch (op) {
      case '+': { const r = xv + yv; return bothInt && Number.isSafeInteger(r) ? r : F(r); }
      case '-': { const r = xv - yv; return bothInt && Number.isSafeInteger(r) ? r : F(r); }
      case '*': { const r = xv * yv; return bothInt && Number.isSafeInteger(r) ? r : F(r); }
      case '/': {
        if (yv === 0) this.throwErr('DivisionByZeroError', 'Division by zero — tidak bisa membagi dengan 0');
        const r = xv / yv; return bothInt && Number.isInteger(r) ? r : F(r);
      }
      case '%': {
        const xi = Math.trunc(xv), yi = Math.trunc(yv);
        if (yi === 0) this.throwErr('DivisionByZeroError', 'Modulo by zero — sisa bagi dengan 0 tidak bisa dihitung');
        const r = xi % yi; return r === 0 ? 0 : r;
      }
      case '**': { const r = Math.pow(xv, yv); return bothInt && yv >= 0 && Number.isSafeInteger(r) ? r : F(r); }
      case '<<': return Math.trunc(xv) << Math.trunc(yv);
      case '>>': return Math.trunc(xv) >> Math.trunc(yv);
      case '&': return Math.trunc(xv) & Math.trunc(yv);
      case '|': return Math.trunc(xv) | Math.trunc(yv);
      case '^': return Math.trunc(xv) ^ Math.trunc(yv);
    }
  }
  compare(a, b) {
    // returns -1, 0, 1 (PHP 8 loose comparison)
    const cmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;
    if (a === undefined) a = null; if (b === undefined) b = null;
    if (typeof a === 'string' && typeof b === 'string') {
      if (isNumericStr(a) && isNumericStr(b)) return cmp(parseFloat(a), parseFloat(b));
      return cmp(a, b);
    }
    if (typeof a === 'boolean' || typeof b === 'boolean' || a === null || b === null) {
      if (a === null && typeof b === 'string') return cmp('', b);
      if (b === null && typeof a === 'string') return cmp(a, '');
      return cmp(this.toBool(a) ? 1 : 0, this.toBool(b) ? 1 : 0);
    }
    if (isNum(a) && isNum(b)) return cmp(numVal(a), numVal(b));
    if (isNum(a) && typeof b === 'string') { if (isNumericStr(b)) return cmp(numVal(a), parseFloat(b)); return cmp(this.toStr(a), b); }
    if (typeof a === 'string' && isNum(b)) { if (isNumericStr(a)) return cmp(parseFloat(a), numVal(b)); return cmp(a, this.toStr(b)); }
    if (a instanceof PArr && b instanceof PArr) {
      if (a.size !== b.size) return cmp(a.size, b.size);
      for (const [k, v] of a.m) { if (!b.m.has(k)) return 1; const c = this.compare(v, b.m.get(k)); if (c) return c; }
      return 0;
    }
    if (a instanceof PArr) return 1; if (b instanceof PArr) return -1;
    if (a instanceof PObj && b instanceof PObj) { if (a === b) return 0; if (a.cls !== b.cls) return 1; for (const [k, v] of a.props) { const c = this.compare(v, b.props.get(k)); if (c) return c; } return 0; }
    return 0;
  }
  looseEq(a, b) { return this.compare(a, b) === 0; }
  strictEq(a, b) {
    if (a === undefined) a = null; if (b === undefined) b = null;
    if (a instanceof PFloat && b instanceof PFloat) return a.v === b.v;
    if (a instanceof PFloat || b instanceof PFloat) return false;
    if (a instanceof PArr && b instanceof PArr) {
      if (a.size !== b.size) return false;
      const ka = [...a.m.keys()], kb = [...b.m.keys()];
      for (let i = 0; i < ka.length; i++) { if (ka[i] !== kb[i]) return false; if (!this.strictEq(a.m.get(ka[i]), b.m.get(kb[i]))) return false; }
      return true;
    }
    return a === b;
  }
  copy(v) { return v instanceof PArr ? v.clone() : v; }

  throwErr(clsName, msg) {
    const cls = this.classes.get(clsName.toLowerCase());
    const obj = this.instantiate(cls, [msg]);
    throw new ThrowSig(obj, this.line);
  }

  // ---------- program ----------
  run(src) {
    let ast;
    try {
      ast = new Parser(lex(src)).program();
    } catch (e) {
      if (e instanceof PhpError) { this.diags.push({ kind: 'parse', msg: e.message, line: e.line }); return this.result(); }
      throw e;
    }
    const scope = { vars: this.globals, fn: null, cls: null, thisObj: null };
    try {
      this.hoist(ast, scope);
      this.execBlock(ast, scope);
    } catch (e) {
      if (e instanceof PhpError) this.diags.push({ kind: e.kind === 'parse' ? 'parse' : 'fatal', msg: e.message, line: e.line || this.line });
      else if (e instanceof ThrowSig) {
        const o = e.obj; const msg = this.toStr(o.props.get('message'));
        this.diags.push({ kind: 'fatal', msg: 'Uncaught ' + o.cls.name + ': ' + msg, line: e.line });
      } else if (e instanceof ExitSig) { /* normal */ }
      else if (e instanceof ReturnSig) { /* top-level return */ }
      else if (e instanceof BreakSig || e instanceof ContinueSig) this.diags.push({ kind: 'fatal', msg: "'break' / 'continue' hanya boleh dipakai di dalam perulangan atau switch", line: this.line });
      else if (e instanceof RangeError) this.diags.push({ kind: 'fatal', msg: 'Maximum function nesting level reached — fungsi rekursif tidak pernah berhenti (cek base case).', line: this.line });
      else { this.diags.push({ kind: 'fatal', msg: 'Kesalahan internal: ' + e.message, line: this.line }); }
    }
    return this.result();
  }
  result() { return { output: this.out.join(''), diags: this.diags, ms: Date.now() - this.start }; }

  hoist(stmts, scope) {
    for (const s of stmts) {
      if (s.k === 'FuncDecl') this.declareFunc(s);
      if (s.k === 'Interface') this.classes.set(s.name.toLowerCase(), { name: s.name, iface: true, parent: null, props: [], methods: new Map(), consts: new Map(), statics: new Map(), ifaces: [] });
    }
    const pending = stmts.filter(s => s.k === 'ClassDecl');
    let progress = true;
    while (pending.length && progress) {
      progress = false;
      for (let i = 0; i < pending.length; i++) {
        const c = pending[i];
        if (!c.parent || this.classes.has(c.parent.toLowerCase())) { this.declareClass(c, scope); pending.splice(i, 1); i--; progress = true; }
      }
    }
    for (const c of pending) c.hoistFailed = true;
  }
  declareFunc(s) {
    const key = s.f.name.toLowerCase();
    if (this.funcs.has(key)) { this.line = s.line; throw new PhpError('fatal', 'Cannot redeclare function ' + s.f.name + '() — fungsi dengan nama ini sudah ada'); }
    if (BUILTINS[key]) { this.line = s.line; throw new PhpError('fatal', 'Cannot redeclare ' + s.f.name + '() — nama ini sudah dipakai fungsi bawaan PHP. Pakai nama lain.'); }
    this.funcs.set(key, s.f);
  }
  declareClass(d, scope) {
    const key = d.name.toLowerCase();
    if (this.classes.has(key) && !d.anon) { this.line = d.line; throw new PhpError('fatal', 'Cannot declare class ' + d.name + ', because the name is already in use'); }
    let parent = null;
    if (d.parent) { parent = this.classes.get(d.parent.toLowerCase()); if (!parent) { this.line = d.line; throw new PhpError('fatal', 'Class "' + d.parent + '" not found — class induk harus dibuat dulu'); } }
    const cls = { name: d.name, parent, props: [], methods: new Map(), consts: new Map(), statics: new Map(), abstract: d.mods.includes('abstract'), ifaces: d.ifaces.map(x => x.toLowerCase()), decl: d };
    for (const t of d.traits || []) {
      const tr = this.classes.get(t.toLowerCase()); if (!tr) throw new PhpError('fatal', 'Trait "' + t + '" not found');
      for (const p of tr.props) cls.props.push(p);
      for (const [k, m] of tr.methods) cls.methods.set(k, Object.assign({}, m, { cls }));
      for (const [k, v] of tr.statics) cls.statics.set(k, this.copy(v));
    }
    for (const p of d.props) {
      if (p.isStatic) cls.statics.set(p.name, p.def ? this.eval(p.def, scope) : null);
      else cls.props.push(Object.assign({ cls }, p));
    }
    for (const m of d.methods) cls.methods.set(m.name.toLowerCase(), Object.assign({ cls }, m));
    this.classes.set(key, cls);
    const cscope = { vars: new Map(), fn: null, cls, thisObj: null };
    for (const c of d.consts) cls.consts.set(c.name, this.eval(c.e, cscope));
    return cls;
  }
  findMethod(cls, name) { name = name.toLowerCase(); for (let c = cls; c; c = c.parent) if (c.methods.has(name)) return c.methods.get(name); return null; }
  findConst(cls, name) { for (let c = cls; c; c = c.parent) if (c.consts.has(name)) return c.consts.get(name); return undefined; }
  findStaticOwner(cls, name) { for (let c = cls; c; c = c.parent) if (c.statics.has(name)) return c; return null; }
  isSubclass(cls, target) {
    if (target === 'throwable' && (this.isSubclass(cls, 'exception') || this.isSubclass(cls, 'error'))) return true;
    for (let c = cls; c; c = c.parent) { if (c.name.toLowerCase() === target) return true; if (c.ifaces && c.ifaces.includes(target)) return true; }
    return false;
  }
  propInfo(cls, name) { for (let c = cls; c; c = c.parent) for (const p of c.props) if (p.name === name) return p; return null; }
  instantiate(cls, args, scope) {
    if (cls.abstract) throw new PhpError('fatal', 'Uncaught Error: Cannot instantiate abstract class ' + cls.name);
    if (cls.iface) throw new PhpError('fatal', 'Uncaught Error: Cannot instantiate interface ' + cls.name);
    const obj = new PObj(cls); obj.id = ++this.objId;
    const chain = []; for (let c = cls; c; c = c.parent) chain.unshift(c);
    for (const c of chain) for (const p of c.props) obj.props.set(p.name, p.def ? this.eval(p.def, { vars: new Map(), cls: c, thisObj: null }) : (p.typed ? undefined : null));
    const ctor = this.findMethod(cls, '__construct');
    if (ctor) this.callMethod(obj, ctor, args);
    else if (args.length && cls.native) cls.native(obj, args);
    return obj;
  }
  resolveClass(e, scope) {
    if (e.k === 'Name') {
      const n = e.name.toLowerCase();
      if (n === 'self' || n === 'static') { if (!scope.cls) throw new PhpError('fatal', 'Cannot use "' + e.name + '" when no class scope is active'); return n === 'static' && scope.thisObj ? scope.thisObj.cls : (n === 'static' && scope.staticCls ? scope.staticCls : scope.cls); }
      if (n === 'parent') { if (!scope.cls || !scope.cls.parent) throw new PhpError('fatal', 'Cannot use "parent" when current class scope has no parent'); return scope.cls.parent; }
      const c = this.classes.get(n);
      if (!c) throw new PhpError('fatal', 'Uncaught Error: Class "' + e.name + '" not found — pastikan nama class benar dan sudah dibuat');
      return c;
    }
    const v = this.eval(e, scope);
    if (v instanceof PObj) return v.cls;
    const c = this.classes.get(this.toStr(v).toLowerCase());
    if (!c) throw new PhpError('fatal', 'Uncaught Error: Class "' + this.toStr(v) + '" not found');
    return c;
  }

  // ---------- statements ----------
  execBlock(stmts, scope) { for (const s of stmts) this.exec(s, scope); }
  exec(s, scope) {
    this.tick(); this.line = s.line;
    switch (s.k) {
      case 'Html': this.echo(s.v); return;
      case 'Nop': case 'Interface': return;
      case 'Echo': for (const a of s.args) this.echo(this.toStr(this.eval(a, scope))); return;
      case 'ExprStmt': this.eval(s.e, scope); return;
      case 'Block': this.execBlock(s.body, scope); return;
      case 'If': {
        if (this.toBool(this.eval(s.c, scope))) { this.execBlock(s.then, scope); return; }
        for (const ei of s.elifs) { this.line = s.line; if (this.toBool(this.eval(ei.c, scope))) { this.execBlock(ei.body, scope); return; } }
        if (s.els) this.execBlock(s.els, scope);
        return;
      }
      case 'While':
        while (this.toBool(this.eval(s.c, scope))) {
          this.tick();
          const r = this.loopBody(s.body, scope); if (r === 'break') break; if (r && r.up) throw r.up;
        }
        return;
      case 'DoWhile':
        do {
          this.tick();
          const r = this.loopBody(s.body, scope); if (r === 'break') break; if (r && r.up) throw r.up;
          this.line = s.line;
        } while (this.toBool(this.eval(s.c, scope)));
        return;
      case 'For': {
        for (const e of s.init) this.eval(e, scope);
        for (;;) {
          this.tick(); this.line = s.line;
          let ok = true; for (const e of s.cond) ok = this.toBool(this.eval(e, scope));
          if (!ok) break;
          const r = this.loopBody(s.body, scope); if (r === 'break') break; if (r && r.up) throw r.up;
          for (const e of s.step) this.eval(e, scope);
        }
        return;
      }
      case 'Foreach': {
        const subj = this.eval(s.e, scope);
        if (subj instanceof PObj) {
          for (const [k, v] of [...subj.props]) { const p = this.propInfo(subj.cls, k); if (p && p.vis !== 'public' && !(scope.cls && this.isSubclass(scope.cls, p.cls.name.toLowerCase()))) continue; if (s.kk) this.assign(s.kk, k, scope); this.assign(s.v, this.copy(v), scope); const r = this.loopBody(s.body, scope); if (r === 'break') break; if (r && r.up) throw r.up; }
          return;
        }
        if (!(subj instanceof PArr)) { this.warn('foreach() argument must be of type array, ' + this.shortType(subj) + ' given — foreach hanya bisa untuk array'); return; }
        if (s.ref) {
          const arr = this.ref(s.e, scope);
          for (const k of arr.keys()) {
            this.tick();
            if (s.kk) this.assign(s.kk, k, scope);
            this.assign(s.v, arr.m.get(k), scope);
            const r = this.loopBody(s.body, scope);
            const nv = this.eval(s.v, scope); if (arr.m.has(k)) arr.m.set(k, nv);
            if (r === 'break') break; if (r && r.up) throw r.up;
          }
          return;
        }
        const entries = [...subj.m];
        for (const [k, v] of entries) {
          this.tick();
          if (s.kk) this.assign(s.kk, k, scope);
          if (s.v.k === 'Arr') this.destructure(s.v, v, scope); else this.assign(s.v, this.copy(v), scope);
          const r = this.loopBody(s.body, scope); if (r === 'break') break; if (r && r.up) throw r.up;
        }
        return;
      }
      case 'Switch': {
        const v = this.eval(s.e, scope);
        let idx = -1;
        for (let i = 0; i < s.cases.length; i++) { const c = s.cases[i]; if (c.test && this.looseEq(v, this.eval(c.test, scope))) { idx = i; break; } }
        if (idx === -1) idx = s.cases.findIndex(c => !c.test);
        if (idx === -1) return;
        try { for (let i = idx; i < s.cases.length; i++) this.execBlock(s.cases[i].body, scope); }
        catch (e) {
          if (e instanceof BreakSig) { if (e.n > 1) throw new BreakSig(e.n - 1); return; }
          if (e instanceof ContinueSig) { if (e.n > 1) throw new ContinueSig(e.n - 1); return; }
          throw e;
        }
        return;
      }
      case 'Break': throw new BreakSig(s.n);
      case 'Continue': throw new ContinueSig(s.n);
      case 'Return': throw new ReturnSig(s.e ? this.copy(this.eval(s.e, scope)) : null);
      case 'FuncDecl': if (scope.fn || !this.funcs.has(s.f.name.toLowerCase()) || this.funcs.get(s.f.name.toLowerCase()) !== s.f) { if (this.funcs.get(s.f.name.toLowerCase()) !== s.f) this.declareFunc(s); } return;
      case 'ClassDecl': if (!this.classes.has(s.name.toLowerCase()) || s.hoistFailed) { if (s.hoistFailed) s.hoistFailed = false; this.declareClass(s, scope); } else if (this.classes.get(s.name.toLowerCase()).decl !== s) this.declareClass(s, scope); return;
      case 'Global': for (const n of s.names) { if (!this.globals.has(n)) this.globals.set(n, null); scope.globalRefs = scope.globalRefs || new Set(); scope.globalRefs.add(n); scope.vars.delete(n); } return;
      case 'StaticVar': {
        const key = scope.fnKey || 'global';
        if (!this.staticVars.has(key)) this.staticVars.set(key, new Map());
        const store = this.staticVars.get(key);
        for (const v of s.vars) { if (!store.has(v.name)) store.set(v.name, v.init ? this.eval(v.init, scope) : null); scope.staticRefs = scope.staticRefs || new Map(); scope.staticRefs.set(v.name, store); scope.vars.delete(v.name); }
        return;
      }
      case 'Unset': for (const a of s.args) this.unset(a, scope); return;
      case 'Try': {
        try { this.execBlock(s.body, scope); }
        catch (e) {
          if (!(e instanceof ThrowSig)) throw e;
          const c = s.catches.find(c => c.types.some(t => this.isSubclass(e.obj.cls, t.toLowerCase())));
          if (!c) { if (s.fin) this.execBlock(s.fin, scope); throw e; }
          if (c.v) this.setVar(scope, c.v, e.obj);
          try { this.execBlock(c.body, scope); } finally { if (s.fin) { this.execBlock(s.fin, scope); } }
          return;
        }
        if (s.fin) this.execBlock(s.fin, scope);
        return;
      }
      case 'Throw': this.doThrow(this.eval(s.e, scope)); return;
      case 'ConstDecl': for (const c of s.list) { if (this.consts.has(c.name)) this.warn('Constant ' + c.name + ' already defined'); else this.consts.set(c.name, this.eval(c.e, scope)); } return;
    }
    throw new PhpError('fatal', 'Pernyataan tidak didukung: ' + s.k);
  }
  doThrow(v) {
    if (!(v instanceof PObj) || !(this.isSubclass(v.cls, 'throwable'))) throw new PhpError('fatal', 'Uncaught Error: Can only throw objects (gunakan throw new Exception("pesan"))');
    throw new ThrowSig(v, this.line);
  }
  loopBody(body, scope) {
    try { this.execBlock(body, scope); return null; }
    catch (e) {
      if (e instanceof BreakSig) { if (e.n > 1) return { up: new BreakSig(e.n - 1) }; return 'break'; }
      if (e instanceof ContinueSig) { if (e.n > 1) return { up: new ContinueSig(e.n - 1) }; return null; }
      throw e;
    }
  }

  // ---------- variables ----------
  varStore(scope, name) {
    if (scope.globalRefs && scope.globalRefs.has(name)) return this.globals;
    if (scope.staticRefs && scope.staticRefs.has(name)) return scope.staticRefs.get(name);
    if (scope.refs && scope.refs.has(name)) return scope.refs.get(name);
    return scope.vars;
  }
  getVar(scope, name, quiet) {
    if (name === 'this') { if (!scope.thisObj) throw new PhpError('fatal', 'Uncaught Error: Using $this when not in object context — $this hanya bisa dipakai di dalam method class'); return scope.thisObj; }
    if (name === 'GLOBALS') { const a = new PArr(); for (const [k, v] of this.globals) a.set(k, v); return a; }
    const st = this.varStore(scope, name);
    if (st instanceof RefBox) return st.get();
    if (!st.has(name)) { if (!quiet) this.warn('Undefined variable $' + name + ' — variabel belum diberi nilai. Cek ejaan atau beri nilai dulu.'); return null; }
    const v = st.get(name);
    return v === undefined ? null : v;
  }
  setVar(scope, name, v) {
    if (name === 'this') throw new PhpError('fatal', 'Cannot re-assign $this');
    const st = this.varStore(scope, name);
    if (st instanceof RefBox) { st.set(v); return; }
    st.set(name, v);
  }
  // returns PArr living at lvalue (auto-create), or object for props
  ref(e, scope, forProp) {
    if (e.k === 'Var') {
      let v = this.getVar(scope, e.name, true);
      if (v === null || v === undefined || (v === '' && !forProp)) { if (forProp) throw new PhpError('fatal', 'Uncaught Error: Attempt to assign property on null'); v = new PArr(); this.setVar(scope, e.name, v); }
      return v;
    }
    if (e.k === 'Index') {
      const c = this.ref(e.base, scope);
      if (!(c instanceof PArr)) { if (c instanceof PObj) throw new PhpError('fatal', 'Uncaught Error: Cannot use object of type ' + c.cls.name + ' as array'); throw new PhpError('fatal', 'Uncaught Error: Cannot use a scalar value as an array'); }
      if (e.idx === null) { if (forProp) throw new PhpError('fatal', 'Uncaught Error: Attempt to assign property on null'); const a = new PArr(); c.push(a); return a; }
      const k = this.eval(e.idx, scope);
      let v = c.get(k);
      if (v === null || v === undefined) { if (forProp) throw new PhpError('fatal', 'Uncaught Error: Attempt to assign property on null'); v = new PArr(); c.set(k, v); }
      return v;
    }
    if (e.k === 'Prop') {
      const o = this.eval(e.obj, scope);
      if (!(o instanceof PObj)) throw new PhpError('fatal', 'Uncaught Error: Attempt to modify property "' + this.propName(e, scope) + '" on ' + this.shortType(o));
      const name = this.propName(e, scope);
      this.checkPropAccess(o, name, scope);
      let v = o.props.get(name);
      if (v === null || v === undefined) { v = new PArr(); o.props.set(name, v); }
      return v;
    }
    if (e.k === 'SProp') {
      const cls = this.resolveClass(e.cls, scope); const owner = this.findStaticOwner(cls, e.name);
      if (!owner) throw new PhpError('fatal', 'Uncaught Error: Access to undeclared static property ' + cls.name + '::$' + e.name);
      let v = owner.statics.get(e.name); if (v === null) { v = new PArr(); owner.statics.set(e.name, v); } return v;
    }
    return this.eval(e, scope);
  }
  propName(e, scope) { return typeof e.name === 'string' ? e.name : this.toStr(this.eval(e.name, scope)); }
  checkPropAccess(o, name, scope) {
    const p = this.propInfo(o.cls, name);
    if (!p || p.vis === 'public') return;
    const ctx = scope.cls;
    if (p.vis === 'private' && ctx !== p.cls) throw new PhpError('fatal', 'Uncaught Error: Cannot access private property ' + o.cls.name + '::$' + name + ' — property private hanya bisa diakses dari dalam class-nya. Gunakan method getter.');
    if (p.vis === 'protected' && !(ctx && (this.isSubclass(ctx, p.cls.name.toLowerCase()) || this.isSubclass(p.cls, ctx.name.toLowerCase())))) throw new PhpError('fatal', 'Uncaught Error: Cannot access protected property ' + o.cls.name + '::$' + name + ' — property protected hanya bisa diakses dari class itu dan turunannya');
  }
  assign(t, v, scope) {
    switch (t.k) {
      case 'Var': this.setVar(scope, t.name, v); return v;
      case 'Index': {
        if (t.base.k === 'Var' || t.base.k === 'Index' || t.base.k === 'Prop' || t.base.k === 'SProp') {
          if (t.base.k === 'Var') {
            const cur = this.getVar(scope, t.base.name, true);
            if (typeof cur === 'string' && cur !== '' && t.idx) {
              let i = this.toInt(this.eval(t.idx, scope)); let s = cur; if (i < 0) i += s.length; while (s.length < i) s += ' ';
              const ch = this.toStr(v)[0] || ' '; s = s.slice(0, i) + ch + s.slice(i + 1); this.setVar(scope, t.base.name, s); return v;
            }
            if (cur !== null && cur !== undefined && cur !== '' && !(cur instanceof PArr)) {
              if (cur === false) this.warn('Automatic conversion of false to array is deprecated');
              else if (cur instanceof PObj) {
                const off = this.findMethod(cur.cls, 'offsetset'); if (off) { this.callMethod(cur, off, [t.idx ? this.eval(t.idx, scope) : null, v]); return v; }
                throw new PhpError('fatal', 'Uncaught Error: Cannot use object of type ' + cur.cls.name + ' as array');
              }
              else throw new PhpError('fatal', 'Uncaught Error: Cannot use a scalar value as an array — $' + t.base.name + ' berisi ' + this.shortType(cur) + ', bukan array');
            }
          }
        }
        const c = this.ref(t.base, scope);
        if (!(c instanceof PArr)) throw new PhpError('fatal', 'Uncaught Error: Cannot use a scalar value as an array');
        if (t.idx === null) c.push(v); else c.set(this.eval(t.idx, scope), v);
        return v;
      }
      case 'Prop': {
        const o = this.eval(t.obj, scope);
        if (!(o instanceof PObj)) throw new PhpError('fatal', 'Uncaught Error: Attempt to assign property "' + this.propName(t, scope) + '" on ' + this.shortType(o) + ' — variabel ini bukan objek');
        const name = this.propName(t, scope);
        this.checkPropAccess(o, name, scope);
        if (!o.props.has(name)) { const setter = this.findMethod(o.cls, '__set'); if (setter && !(scope.thisObj === o)) { this.callMethod(o, setter, [name, v]); return v; } }
        o.props.set(name, v); return v;
      }
      case 'SProp': {
        const cls = this.resolveClass(t.cls, scope); const owner = this.findStaticOwner(cls, t.name);
        if (!owner) throw new PhpError('fatal', 'Uncaught Error: Access to undeclared static property ' + cls.name + '::$' + t.name);
        owner.statics.set(t.name, v); return v;
      }
      case 'Arr': this.destructure(t, v, scope); return v;
    }
    throw new PhpError('fatal', 'Tidak bisa memberi nilai ke ekspresi ini');
  }
  destructure(pat, v, scope) {
    if (!(v instanceof PArr)) { for (const it of pat.items) if (it) this.assign(it.v, null, scope); return; }
    let i = 0;
    for (const it of pat.items) {
      if (!it) { i++; continue; }
      const key = it.key ? this.eval(it.key, scope) : i++;
      const val = v.has(key) ? v.get(key) : (this.warn('Undefined array key ' + this.fmtKey(key)), null);
      if (it.v.k === 'Arr') this.destructure(it.v, val, scope); else this.assign(it.v, this.copy(val), scope);
    }
  }
  fmtKey(k) { return typeof k === 'string' ? '"' + k + '"' : String(k); }
  unset(a, scope) {
    if (a.k === 'Var') { const st = this.varStore(scope, a.name); if (st instanceof RefBox) { if (scope.refs) scope.refs.delete(a.name); return; } st.delete(a.name); if (scope.globalRefs) scope.globalRefs.delete(a.name); return; }
    if (a.k === 'Index') { const c = this.eval(a.base, scope); if (c instanceof PArr) { const real = this.ref(a.base, scope); real.del(this.eval(a.idx, scope)); } return; }
    if (a.k === 'Prop') { const o = this.eval(a.obj, scope); if (o instanceof PObj) o.props.delete(this.propName(a, scope)); }
  }

  // ---------- expressions ----------
  eval(e, scope) {
    switch (e.k) {
      case 'Lit': return e.v;
      case 'Interp': { let s = ''; for (const p of e.parts) s += typeof p === 'string' ? p : this.toStr(this.eval(p, scope)); return s; }
      case 'Var': this.line = e.line || this.line; return this.getVar(scope, e.name);
      case 'Arr': {
        const a = new PArr();
        for (const it of e.items) {
          if (!it) continue;
          if (it.spread) { const s = this.eval(it.v, scope); if (s instanceof PArr) for (const [k, v] of s.m) { if (typeof k === 'number') a.push(this.copy(v)); else a.set(k, this.copy(v)); } continue; }
          const v = this.copy(this.eval(it.v, scope));
          if (it.key) a.set(this.eval(it.key, scope), v); else a.push(v);
        }
        return a;
      }
      case 'Index': {
        if (e.idx === null) throw new PhpError('fatal', 'Cannot use [] for reading — [] kosong hanya untuk menambah elemen: $arr[] = nilai;');
        const base = this.eval(e.base, scope);
        const k = this.eval(e.idx, scope);
        if (base instanceof PArr) {
          if (!base.has(k)) {
            this.line = e.line;
            this.warn('Undefined array key ' + this.fmtKey(PArr.key(k)) + ' — indeks/key ini tidak ada di array' + (typeof PArr.key(k) === 'number' && base.isList() ? ' (indeks array mulai dari 0, jumlah elemen ' + base.size + ' → indeks terakhir ' + (base.size - 1) + ')' : ''));
            return null;
          }
          return base.get(k);
        }
        if (typeof base === 'string') {
          let i = this.toInt(k); if (i < 0) i += base.length;
          if (i >= base.length || i < 0) { this.warn('Uninitialized string offset ' + this.toInt(k)); return ''; }
          return base[i];
        }
        if (base === null || base === undefined) { return null; }
        if (base instanceof PObj) { const m = this.findMethod(base.cls, 'offsetget'); if (m) return this.callMethod(base, m, [k]); throw new PhpError('fatal', 'Uncaught Error: Cannot use object of type ' + base.cls.name + ' as array'); }
        this.warn('Trying to access array offset on value of type ' + this.shortType(base));
        return null;
      }
      case 'Prop': {
        const o = this.eval(e.obj, scope);
        const name = this.propName(e, scope);
        if (!(o instanceof PObj)) {
          if (e.nullsafe && o === null) return null;
          this.warn('Attempt to read property "' + name + '" on ' + this.shortType(o) + ' — variabel ini bukan objek'); return null;
        }
        if (!o.props.has(name)) {
          const g = this.findMethod(o.cls, '__get'); if (g) return this.callMethod(o, g, [name]);
          this.warn('Undefined property: ' + o.cls.name + '::$' + name); return null;
        }
        this.checkPropAccess(o, name, scope);
        const v = o.props.get(name);
        if (v === undefined) throw new PhpError('fatal', 'Uncaught Error: Typed property ' + o.cls.name + '::$' + name + ' must not be accessed before initialization');
        return v;
      }
      case 'SProp': {
        const cls = this.resolveClass(e.cls, scope); const owner = this.findStaticOwner(cls, e.name);
        if (!owner) throw new PhpError('fatal', 'Uncaught Error: Access to undeclared static property ' + cls.name + '::$' + e.name);
        return owner.statics.get(e.name);
      }
      case 'CConst': {
        const cls = this.resolveClass(e.cls, scope); const v = this.findConst(cls, e.name);
        if (v === undefined) throw new PhpError('fatal', 'Uncaught Error: Undefined constant ' + cls.name + '::' + e.name);
        return v;
      }
      case 'ClassName': return this.resolveClass(e.cls, scope).name;
      case 'Name': {
        const n = e.name;
        if (this.consts.has(n)) return this.consts.get(n);
        const up = n.toUpperCase(); if (this.consts.has(up) && /^(PHP_|M_|E_|STR_|SORT_|JSON_)/.test(up)) return this.consts.get(up);
        if (n === '__LINE__') return e.line; if (n === '__FILE__') return '/latihan/index.php'; if (n === '__DIR__') return '/latihan';
        if (n === '__CLASS__') return scope.cls ? scope.cls.name : ''; if (n === '__FUNCTION__') return scope.fnName || ''; if (n === '__METHOD__') return (scope.cls ? scope.cls.name + '::' : '') + (scope.fnName || '');
        this.line = e.line;
        throw new PhpError('fatal', 'Uncaught Error: Undefined constant "' + n + '"' + (/^[a-z_]\w*$/i.test(n) ? ' — kalau maksudnya variabel, tambahkan tanda $ di depan ($' + n + '). Kalau maksudnya teks, beri tanda kutip ("' + n + '").' : ''));
      }
      case 'Bin': {
        const a = this.eval(e.l, scope), b = this.eval(e.r, scope);
        this.line = e.line;
        switch (e.op) {
          case '.': return this.toStr(a) + this.toStr(b);
          case '==': return this.looseEq(a, b);
          case '!=': return !this.looseEq(a, b);
          case '===': return this.strictEq(a, b);
          case '!==': return !this.strictEq(a, b);
          case '<': return this.compare(a, b) < 0;
          case '>': return this.compare(a, b) > 0;
          case '<=': return this.compare(a, b) <= 0;
          case '>=': return this.compare(a, b) >= 0;
          case '<=>': return this.compare(a, b);
          default: return this.arith(e.op, a, b);
        }
      }
      case 'Logic': {
        switch (e.op) {
          case '&&': case 'and': return this.toBool(this.eval(e.l, scope)) && this.toBool(this.eval(e.r, scope));
          case '||': case 'or': return this.toBool(this.eval(e.l, scope)) || this.toBool(this.eval(e.r, scope));
          case 'xor': return this.toBool(this.eval(e.l, scope)) !== this.toBool(this.eval(e.r, scope));
          case '??': { const l = this.quietEval(e.l, scope); return l === null || l === undefined ? this.eval(e.r, scope) : l; }
        }
        break;
      }
      case 'Not': return !this.toBool(this.eval(e.e, scope));
      case 'Neg': { const v = this.toNum(this.eval(e.e, scope), '(minus)'); return v instanceof PFloat ? F(-v.v) : (v === 0 ? 0 : -v); }
      case 'Pos': return this.toNum(this.eval(e.e, scope));
      case 'BitNot': return ~this.toInt(this.eval(e.e, scope));
      case 'Assign': {
        this.line = e.line;
        if (e.op === '=') {
          if (e.t.k === 'Arr') { const v = this.eval(e.v, scope); this.destructure(e.t, v, scope); return v; }
          const v = this.copy(this.eval(e.v, scope)); return this.assign(e.t, v, scope);
        }
        if (e.op === '??=') { const cur = this.quietEval(e.t, scope); if (cur !== null && cur !== undefined) return cur; return this.assign(e.t, this.copy(this.eval(e.v, scope)), scope); }
        const cur = this.eval(e.t, scope); const rhs = this.eval(e.v, scope);
        const op = e.op.slice(0, -1);
        const nv = op === '.' ? this.toStr(cur) + this.toStr(rhs) : this.arith(op, cur, rhs);
        return this.assign(e.t, nv, scope);
      }
      case 'Inc': {
        this.line = e.line;
        const cur = e.t.k === 'Var' ? this.getVar(scope, e.t.name, e.op === '++') : this.quietEval(e.t, scope);
        let nv;
        if (cur === null || cur === undefined) nv = e.op === '++' ? 1 : null;
        else if (typeof cur === 'string' && !isNumericStr(cur)) nv = e.op === '++' ? strInc(cur) : cur;
        else nv = this.arith(e.op === '++' ? '+' : '-', cur, 1);
        this.assign(e.t, nv, scope);
        return e.pre ? nv : (cur === undefined ? null : cur);
      }
      case 'Tern': {
        const c = this.eval(e.c, scope);
        if (e.a === null) return this.toBool(c) ? c : this.eval(e.b, scope);
        return this.toBool(c) ? this.eval(e.a, scope) : this.eval(e.b, scope);
      }
      case 'Cast': {
        const v = this.eval(e.e, scope);
        switch (e.type) {
          case 'int': return this.toInt(v);
          case 'float': return F(this.toFloat(v));
          case 'string': return this.toStr(v);
          case 'bool': return this.toBool(v);
          case 'array': { if (v instanceof PArr) return v; const a = new PArr(); if (v instanceof PObj) { for (const [k, x] of v.props) a.set(k, x); return a; } if (v !== null) a.push(v); return a; }
          case 'object': { if (v instanceof PObj) return v; const o = new PObj(this.classes.get('stdclass')); o.id = ++this.objId; if (v instanceof PArr) for (const [k, x] of v.m) o.props.set(String(k), x); return o; }
        }
        break;
      }
      case 'Isset': for (const a of e.args) { const v = this.quietEval(a, scope); if (v === null || v === undefined) return false; } return true;
      case 'Empty': return !this.toBool(this.quietEval(e.e, scope));
      case 'Print': this.echo(this.toStr(this.eval(e.e, scope))); return 1;
      case 'ThrowExpr': this.doThrow(this.eval(e.e, scope)); return null;
      case 'Exit': { if (e.e) { const v = this.eval(e.e, scope); if (typeof v === 'string') this.echo(v); } throw new ExitSig(); }
      case 'Clone': { const o = this.eval(e.e, scope); if (!(o instanceof PObj)) throw new PhpError('fatal', '__clone method called on non-object'); const c = new PObj(o.cls); c.id = ++this.objId; for (const [k, v] of o.props) c.props.set(k, this.copy(v)); const m = this.findMethod(c.cls, '__clone'); if (m) this.callMethod(c, m, []); return c; }
      case 'InstOf': {
        const v = this.eval(e.e, scope); if (!(v instanceof PObj)) return false;
        let target;
        if (e.cls.k === 'Name') { const n = e.cls.name.toLowerCase(); if (n === 'self' || n === 'static' || n === 'parent') target = this.resolveClass(e.cls, scope).name.toLowerCase(); else target = n; }
        else { const t = this.eval(e.cls, scope); target = (t instanceof PObj ? t.cls.name : this.toStr(t)).toLowerCase(); }
        if (target === 'closure') return false;
        return this.isSubclass(v.cls, target);
      }
      case 'Closure': {
        const captured = new Map();
        if (e.arrow) { for (const [k, v] of scope.vars) captured.set(k, v); if (scope.refs) for (const [k, r] of scope.refs) captured.set(k, r.get()); if (scope.globalRefs) for (const k of scope.globalRefs) captured.set(k, this.globals.get(k)); }
        const uses = [];
        if (e.f.uses) for (const u of e.f.uses) {
          if (u.byRef) { const box = this.makeRef({ k: 'Var', name: u.name }, scope); uses.push({ name: u.name, box }); }
          else captured.set(u.name, this.copy(this.getVar(scope, u.name)));
        }
        return new PClosure(e.f.params, e.f.body, captured, e.arrow, scope.thisObj, scope.cls, uses);
      }
      case 'Match': {
        const v = this.eval(e.subj, scope);
        for (const arm of e.arms) {
          if (!arm.conds) continue;
          for (const c of arm.conds) if (this.strictEq(v, this.eval(c, scope))) return this.eval(arm.res, scope);
        }
        const def = e.arms.find(a => !a.conds);
        if (def) return this.eval(def.res, scope);
        this.line = e.line;
        this.throwErr('UnhandledMatchError', 'Unhandled match case ' + this.exportVal(v) + ' — tidak ada nilai yang cocok, tambahkan default =>');
        break;
      }
      case 'Call': return this.callFunc(e, scope);
      case 'ECall': {
        const f = this.eval(e.fn, scope);
        return this.callCallable(f, this.evalArgs(e.args, scope), scope, e);
      }
      case 'MCall': {
        const o = this.eval(e.obj, scope);
        const name = typeof e.name === 'string' ? e.name : this.toStr(this.eval(e.name, scope));
        this.line = e.line;
        if (o instanceof PClosure) { const lname = name.toLowerCase(); if (lname === 'call' || lname === '__invoke') return this.callClosure(o, this.evalArgs(e.args, scope)); }
        if (!(o instanceof PObj)) {
          if (e.nullsafe && o === null) return null;
          throw new PhpError('fatal', 'Uncaught Error: Call to a member function ' + name + '() on ' + this.shortType(o) + ' — variabel ini bukan objek (sudah dibuat dengan new?)');
        }
        const m = this.findMethod(o.cls, name);
        if (!m) {
          const pv = o.props.get(name);
          const magic = this.findMethod(o.cls, '__call');
          if (magic) return this.callMethod(o, magic, [name, PArr.from(this.evalArgs(e.args, scope))]);
          throw new PhpError('fatal', 'Uncaught Error: Call to undefined method ' + o.cls.name + '::' + name + '()' + (pv instanceof PClosure ? ' — untuk memanggil closure di property gunakan ($obj->' + name + ')()' : ''));
        }
        this.checkMethodAccess(m, o.cls, scope);
        if (m.isStatic) return this.callMethod(null, m, this.evalArgsFor(m.f.params, e.args, scope), o.cls);
        return this.callMethod(o, m, this.evalArgsFor(m.f.params, e.args, scope));
      }
      case 'SCall': {
        this.line = e.line;
        const cls = this.resolveClass(e.cls, scope);
        const m = this.findMethod(cls, e.name);
        if (!m) { const ms = this.findMethod(cls, '__callstatic'); if (ms) return this.callMethod(null, ms, [e.name, PArr.from(this.evalArgs(e.args, scope))], cls); throw new PhpError('fatal', 'Uncaught Error: Call to undefined method ' + cls.name + '::' + e.name + '()'); }
        this.checkMethodAccess(m, cls, scope);
        const args = this.evalArgsFor(m.f.params, e.args, scope);
        const nm = e.cls.k === 'Name' ? e.cls.name.toLowerCase() : '';
        if (!m.isStatic && scope.thisObj && (nm === 'parent' || nm === 'self' || nm === 'static' || this.isSubclass(scope.thisObj.cls, cls.name.toLowerCase()))) return this.callMethod(scope.thisObj, m, args);
        if (!m.isStatic) throw new PhpError('fatal', 'Uncaught Error: Non-static method ' + cls.name + '::' + m.name + '() cannot be called statically — buat objek dulu dengan new, atau tandai method sebagai static');
        return this.callMethod(null, m, args, nm === 'parent' || nm === 'self' ? (scope.staticCls || cls) : cls);
      }
      case 'New': {
        this.line = e.line;
        const cls = this.resolveClass(e.cls, scope);
        const ctor = this.findMethod(cls, '__construct');
        if (ctor) this.checkMethodAccess(ctor, cls, scope);
        const args = ctor ? this.evalArgsFor(ctor.f.params, e.args, scope) : this.evalArgs(e.args, scope);
        return this.instantiate(cls, args, scope);
      }
      case 'NewAnon': {
        e.decl.anon = true; e.decl.name = 'class@anonymous';
        const cls = e.cls || (e.cls = this.declareClass(e.decl, scope));
        return this.instantiate(cls, this.evalArgs(e.args, scope), scope);
      }
    }
    throw new PhpError('fatal', 'Ekspresi tidak didukung: ' + e.k);
  }
  checkMethodAccess(m, cls, scope) {
    if (m.vis === 'public') return;
    const ctx = scope.cls;
    if (m.vis === 'private' && ctx !== m.cls) throw new PhpError('fatal', 'Uncaught Error: Call to private method ' + cls.name + '::' + m.name + '() from ' + (ctx ? 'scope ' + ctx.name : 'global scope') + ' — method private hanya bisa dipanggil dari dalam class-nya');
    if (m.vis === 'protected' && !(ctx && (this.isSubclass(ctx, m.cls.name.toLowerCase()) || this.isSubclass(m.cls, ctx.name.toLowerCase())))) throw new PhpError('fatal', 'Uncaught Error: Call to protected method ' + cls.name + '::' + m.name + '() from ' + (ctx ? 'scope ' + ctx.name : 'global scope'));
  }
  quietEval(e, scope) {
    // for isset / ?? / empty: no warnings on missing
    switch (e.k) {
      case 'Var': if (e.name === 'this') return scope.thisObj; { const st = this.varStore(scope, e.name); if (st instanceof RefBox) return st.get(); return st.has(e.name) ? st.get(e.name) : null; }
      case 'Index': { const b = this.quietEval(e.base, scope); if (b instanceof PArr) { const k = this.eval(e.idx, scope); return b.has(k) ? b.get(k) : null; } if (typeof b === 'string') { const i = this.toInt(this.eval(e.idx, scope)); return i < b.length && i >= -b.length ? b.at(i) : null; } if (b instanceof PObj) { const m = this.findMethod(b.cls, 'offsetexists'); if (m && !this.toBool(this.callMethod(b, m, [this.eval(e.idx, scope)]))) return null; const g = this.findMethod(b.cls, 'offsetget'); if (g) return this.callMethod(b, g, [this.eval(e.idx, scope)]); } return null; }
      case 'Prop': { const o = this.quietEval(e.obj, scope); if (!(o instanceof PObj)) return null; const n = this.propName(e, scope); const p = this.propInfo(o.cls, n); if (p && p.vis !== 'public') { try { this.checkPropAccess(o, n, scope); } catch (_) { return null; } } if (!o.props.has(n)) { const is = this.findMethod(o.cls, '__isset'); if (is && this.toBool(this.callMethod(o, is, [n]))) { const g = this.findMethod(o.cls, '__get'); return g ? this.callMethod(o, g, [n]) : null; } return null; } return o.props.get(n); }
      case 'SProp': { try { return this.eval(e, scope); } catch (_) { return null; } }
    }
    return this.eval(e, scope);
  }
  evalArgs(args, scope) {
    const out = [];
    for (const a of args) {
      if (a.k === 'Spread') { const v = this.eval(a.e, scope); if (v instanceof PArr) for (const x of v.values()) out.push(this.copy(x)); continue; }
      if (a.k === 'Named') { out.named = out.named || {}; out.named[a.name] = this.copy(this.eval(a.e, scope)); continue; }
      out.push(this.copy(this.eval(a, scope)));
    }
    return out;
  }
  evalArgsFor(params, args, scope) {
    // handles by-reference params
    const out = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.k === 'Spread') { const v = this.eval(a.e, scope); if (v instanceof PArr) for (const x of v.values()) out.push(this.copy(x)); continue; }
      if (a.k === 'Named') { out.named = out.named || {}; out.named[a.name] = this.copy(this.eval(a.e, scope)); continue; }
      const p = params[i] || (params.length && params[params.length - 1].variadic ? params[params.length - 1] : null);
      if (p && p.byRef && isLval(a)) out.push(this.makeRef(a, scope));
      else out.push(this.copy(this.eval(a, scope)));
    }
    return out;
  }
  makeRef(a, scope) {
    if (a.k === 'Var') {
      const st = this.varStore(scope, a.name);
      if (st instanceof RefBox) return st;
      if (!st.has(a.name)) st.set(a.name, null);
      return new RefBox(() => st.get(a.name), (v) => st.set(a.name, v));
    }
    if (a.k === 'Index') {
      const c = this.ref(a.base, scope);
      let k = a.idx ? this.eval(a.idx, scope) : null;
      if (k === null && !a.idx) { k = c.next; c.push(null); }
      if (!c.has(k)) c.set(k, null);
      return new RefBox(() => c.get(k), (v) => c.set(k, v));
    }
    if (a.k === 'Prop') {
      const o = this.eval(a.obj, scope); const n = this.propName(a, scope);
      return new RefBox(() => o.props.get(n), (v) => o.props.set(n, v));
    }
    const v = this.eval(a, scope); let x = v;
    return new RefBox(() => x, (nv) => { x = nv; });
  }
  callFunc(e, scope) {
    const name = e.name; const key = name.toLowerCase();
    this.line = e.line;
    const uf = this.funcs.get(key);
    if (uf) return this.callUser(uf, this.evalArgsFor(uf.params, e.args, scope), null, null, null, name);
    const bf = BUILTINS[key];
    if (bf) {
      let args;
      if (bf.ref) {
        args = e.args.map((a, i) => (bf.ref.includes(i) && isLval(a)) ? this.makeRef(a, scope) : (a.k === 'Spread' ? null : this.copy(this.eval(a, scope))));
        args = args.filter(x => x !== null || true);
      } else args = this.evalArgs(e.args, scope);
      this.line = e.line;
      return bf.fn.call(this, args, scope, e);
    }
    const sugg = suggest(key, [...Object.keys(BUILTINS), ...this.funcs.keys()]);
    throw new PhpError('fatal', 'Uncaught Error: Call to undefined function ' + name + '()' + (sugg ? ' — mungkin maksudnya ' + sugg + '()?' : ' — fungsi ini belum dibuat'));
  }
  callCallable(f, args, scope, e) {
    if (f instanceof PClosure) return this.callClosure(f, args);
    if (typeof f === 'string') {
      if (f.includes('::')) { const [c, m] = f.split('::'); return this.callCallable(PArr.from([c, m]), args, scope, e); }
      const key = f.toLowerCase();
      const uf = this.funcs.get(key);
      if (uf) return this.callUser(uf, args, null, null, null, f);
      const bf = BUILTINS[key];
      if (bf) return bf.fn.call(this, args.map(a => a instanceof RefBox ? a.get() : a), scope || { vars: new Map() }, e || {});
      throw new PhpError('fatal', 'Uncaught Error: Call to undefined function ' + f + '()');
    }
    if (f instanceof PArr && f.size === 2) {
      const [t, m] = f.values();
      if (t instanceof PObj) { const meth = this.findMethod(t.cls, this.toStr(m)); if (!meth) throw new PhpError('fatal', 'Uncaught Error: Call to undefined method ' + t.cls.name + '::' + m + '()'); return this.callMethod(t, meth, args); }
      const cls = this.classes.get(this.toStr(t).toLowerCase()); if (!cls) throw new PhpError('fatal', 'Uncaught Error: Class "' + t + '" not found');
      const meth = this.findMethod(cls, this.toStr(m)); if (!meth) throw new PhpError('fatal', 'Uncaught Error: Call to undefined method ' + cls.name + '::' + m + '()');
      return this.callMethod(null, meth, args, cls);
    }
    if (f instanceof PObj) { const inv = this.findMethod(f.cls, '__invoke'); if (inv) return this.callMethod(f, inv, args); }
    throw new PhpError('fatal', 'Uncaught Error: Value not callable — nilai ini bukan fungsi');
  }
  callClosure(c, args) {
    const vars = new Map(c.scope);
    const refs = new Map(); for (const u of c.uses) refs.set(u.name, u.box);
    return this.callUser({ params: c.params, body: c.body, name: '{closure}' }, args, c.thisObj, c.cls, { vars, refs });
  }
  callMethod(obj, m, args, staticCls) {
    return this.callUser(m.f, args, obj, m.cls, null, m.name, staticCls, m);
  }
  callUser(f, args, thisObj, cls, pre, name, staticCls, meth) {
    if (++this.callDepth > 2000) { this.callDepth = 0; throw new PhpError('fatal', 'Maximum function nesting level of 2000 reached — fungsi memanggil dirinya sendiri tanpa henti. Pastikan rekursi punya kondisi berhenti (base case).'); }
    if (!f.body) throw new PhpError('fatal', 'Cannot call abstract method ' + (cls ? cls.name + '::' : '') + name + '()');
    const scope = { vars: pre ? pre.vars : new Map(), refs: pre && pre.refs && pre.refs.size ? pre.refs : null, fn: f, cls, thisObj, fnName: name, staticCls, fnKey: (cls ? cls.name + '::' : '') + (f.name || name) + '#' + (f.line || 0) };
    const params = f.params; const named = args.named || {};
    let required = 0; params.forEach((p, i) => { if (!p.def && !p.variadic) required = i + 1; });
    const posCount = args.length;
    for (let i = 0; i < params.length; i++) {
      const p = params[i];
      if (p.variadic) { const rest = new PArr(); for (let j = i; j < args.length; j++) rest.push(args[j] instanceof RefBox ? args[j].get() : args[j]); for (const k in named) rest.set(k, named[k]); scope.vars.set(p.name, rest); break; }
      let v;
      if (i < posCount) v = args[i];
      else if (p.name in named) v = named[p.name];
      else if (p.def) v = this.eval(p.def, scope);
      else {
        this.callDepth--;
        throw new PhpError('fatal', 'Uncaught ArgumentCountError: Too few arguments to function ' + (cls ? cls.name + '::' : '') + name + '(), ' + posCount + ' passed and ' + (required === params.length ? 'exactly' : 'at least') + ' ' + required + ' expected — jumlah argumen kurang');
      }
      if (v instanceof RefBox) { scope.refs = scope.refs || new Map(); scope.refs.set(p.name, v); }
      else {
        if (p.type && v !== null) v = this.coerceParam(p, v, name, cls, i);
        scope.vars.set(p.name, v);
      }
      if (p.promote && thisObj) thisObj.props.set(p.name, v instanceof RefBox ? v.get() : v);
    }
    if (meth && thisObj && params.some(p => p.promote)) {
      for (const p of params) if (p.promote && !this.propInfo(thisObj.cls, p.name)) cls.props.push({ name: p.name, vis: p.promote, cls, def: null });
    }
    try {
      this.execBlock(f.body, scope);
      return null;
    } catch (e) {
      if (e instanceof ReturnSig) return e.v;
      if (e instanceof BreakSig || e instanceof ContinueSig) throw new PhpError('fatal', "'break' / 'continue' tidak boleh dipakai di luar perulangan");
      throw e;
    } finally { this.callDepth--; }
  }
  coerceParam(p, v, name, cls, i) {
    const t = p.type.replace('?', '').toLowerCase();
    if (t.includes('|') || t === 'mixed') return v;
    const fail = () => { throw new PhpError('fatal', 'Uncaught TypeError: ' + (cls ? cls.name + '::' : '') + name + '(): Argument #' + (i + 1) + ' ($' + p.name + ') must be of type ' + p.type + ', ' + this.shortType(v) + ' given'); };
    switch (t) {
      case 'int': if (typeof v === 'number') return v; if (v instanceof PFloat && Number.isInteger(v.v)) return v.v; if (typeof v === 'string' && /^\s*[+-]?\d+\s*$/.test(v)) return parseInt(v, 10); if (typeof v === 'boolean') return v ? 1 : 0; fail(); break;
      case 'float': if (typeof v === 'number') return F(v); if (v instanceof PFloat) return v; if (isNumericStr(v)) return F(parseFloat(v)); if (typeof v === 'boolean') return F(v ? 1 : 0); fail(); break;
      case 'string': if (typeof v === 'string') return v; if (isNum(v) || typeof v === 'boolean') return this.toStr(v); if (v instanceof PObj && this.findMethod(v.cls, '__tostring')) return this.toStr(v); fail(); break;
      case 'bool': if (typeof v === 'boolean') return v; if (isNum(v) || typeof v === 'string') return this.toBool(v); fail(); break;
      case 'array': if (!(v instanceof PArr)) fail(); return v;
      case 'callable': case 'iterable': case 'object': case 'self': case 'static': return v;
      default: {
        const c = this.classes.get(t);
        if (c && v instanceof PObj && !this.isSubclass(v.cls, t)) fail();
        if (c && !(v instanceof PObj)) fail();
        return v;
      }
    }
  }

  // ---------- printing ----------
  printR(v, ind = 0) {
    if (v instanceof PArr || v instanceof PObj) {
      const pad = ' '.repeat(ind);
      let s = (v instanceof PArr ? 'Array' : v.cls.name + ' Object') + '\n' + pad + '(\n';
      const entries = v instanceof PArr ? [...v.m] : [...v.props];
      for (const [k, x] of entries) {
        let label = k;
        if (v instanceof PObj) { const p = this.propInfo(v.cls, k); if (p && p.vis === 'protected') label += ':protected'; if (p && p.vis === 'private') label += ':' + p.cls.name + ':private'; }
        s += pad + '    [' + label + '] => ' + this.printR(x, ind + 8) + '\n';
      }
      s += pad + ')\n';
      return s;
    }
    if (v instanceof PClosure) return 'Closure Object\n' + ' '.repeat(ind) + '(\n' + ' '.repeat(ind) + ')\n';
    return this.toStr(v);
  }
  varDump(v, ind = 0) {
    const pad = ' '.repeat(ind);
    if (v === null || v === undefined) return pad + 'NULL\n';
    if (typeof v === 'boolean') return pad + 'bool(' + v + ')\n';
    if (typeof v === 'number') return pad + 'int(' + v + ')\n';
    if (v instanceof PFloat) return pad + 'float(' + reprFloat(v.v) + ')\n';
    if (typeof v === 'string') return pad + 'string(' + utf8len(v) + ') "' + v + '"\n';
    if (v instanceof PArr) {
      let s = pad + 'array(' + v.size + ') {\n';
      for (const [k, x] of v.m) s += pad + '  [' + (typeof k === 'string' ? '"' + k + '"' : k) + ']=>\n' + this.varDump(x, ind + 2);
      return s + pad + '}\n';
    }
    if (v instanceof PObj) {
      let s = pad + 'object(' + v.cls.name + ')#' + v.id + ' (' + v.props.size + ') {\n';
      for (const [k, x] of v.props) {
        const p = this.propInfo(v.cls, k); let label = '"' + k + '"';
        if (p && p.vis === 'protected') label += ':protected'; if (p && p.vis === 'private') label += ':"' + p.cls.name + '":private';
        s += pad + '  [' + label + ']=>\n' + (x === undefined ? pad + '  uninitialized(' + (p && p.type || 'mixed') + ')\n' : this.varDump(x, ind + 2));
      }
      return s + pad + '}\n';
    }
    if (v instanceof PClosure) return pad + 'object(Closure)#1 (0) {\n' + pad + '}\n';
    return pad + 'NULL\n';
  }
  exportVal(v, ind = 0) {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    if (v instanceof PFloat) { const s = reprFloat(v.v); return /[.EN]/.test(s) ? s : s + '.0'; }
    if (typeof v === 'string') return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    if (v instanceof PArr) {
      const pad = ' '.repeat(ind);
      let s = 'array (\n';
      for (const [k, x] of v.m) s += pad + '  ' + (typeof k === 'string' ? "'" + k + "'" : k) + ' => ' + (x instanceof PArr ? '\n' + pad + '  ' : '') + this.exportVal(x, ind + 2) + ',\n';
      return s + pad + ')';
    }
    if (v instanceof PObj) { let s = '\\' + v.cls.name + '::__set_state(array(\n'; for (const [k, x] of v.props) s += "   '" + k + "' => " + this.exportVal(x, ind + 2) + ',\n'; return s + '))'; }
    return 'NULL';
  }
}
class RefBox { constructor(g, s) { this.get = g; this.set = s; } has() { return true; } }
class ExitSig {}
function utf8len(s) { return new TextEncoder().encode(s).length; }
function strInc(s) {
  if (s === '') return '1';
  const chars = s.split(''); let i = chars.length - 1;
  while (i >= 0) {
    const c = chars[i];
    if (c === 'z') { chars[i] = 'a'; i--; } else if (c === 'Z') { chars[i] = 'A'; i--; } else if (c === '9') { chars[i] = '0'; i--; }
    else if (/[a-yA-Y0-8]/.test(c)) { chars[i] = String.fromCharCode(c.charCodeAt(0) + 1); return chars.join(''); }
    else return chars.join('');
  }
  const f = s[0]; return (f === 'z' || (f >= 'a' && f <= 'z') ? 'a' : f >= 'A' && f <= 'Z' ? 'A' : '1') + chars.join('');
}
function suggest(name, list) {
  let best = null, bd = 3;
  for (const c of list) {
    const d = lev(name, c.toLowerCase()); if (d < bd) { bd = d; best = c; }
  }
  return best;
}
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

// ---------- builtins ----------
const val = (a) => a instanceof RefBox ? a.get() : a;
function needArr(I, v, fn, pos = 1) { v = val(v); if (!(v instanceof PArr)) throw new PhpError('fatal', 'Uncaught TypeError: ' + fn + '(): Argument #' + pos + ' must be of type array, ' + I.shortType(v) + ' given'); return v; }
function argc(fn, args, min) { if (args.length < min) throw new PhpError('fatal', 'Uncaught ArgumentCountError: ' + fn + '() expects at least ' + min + ' argument' + (min > 1 ? 's' : '') + ', ' + args.length + ' given'); }
function sprintf(I, fmt, args) {
  let ai = 0;
  return fmt.replace(/%(?:(\d+)\$)?([-+ 0]|'.)*(\d+)?(?:\.(\d+))?([bcdeEfFgGosuxX%])/g, (m, argn, _f, width, prec, conv) => {
    if (conv === '%') return '%';
    const flags = (m.match(/^%(?:\d+\$)?((?:[-+ 0]|'.)*)/) || [])[1] || '';
    const left = flags.includes('-'); const plus = flags.includes('+');
    let padc = ' '; const pm = /'(.)/.exec(flags); if (pm) padc = pm[1]; else if (flags.includes('0')) padc = '0';
    const a = argn ? args[parseInt(argn, 10) - 1] : args[ai++];
    if (a === undefined) throw new PhpError('fatal', 'Uncaught ArgumentCountError: jumlah argumen sprintf/printf kurang dari jumlah %');
    let s;
    switch (conv) {
      case 'd': case 'u': { const n = I.toInt(a); s = (plus && n >= 0 ? '+' : '') + n; break; }
      case 'f': case 'F': { const n = I.toFloat(a); s = (plus && n >= 0 ? '+' : '') + n.toFixed(prec === undefined ? 6 : +prec); break; }
      case 'e': case 'E': { const n = I.toFloat(a); s = n.toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, 'e$1$2'); if (conv === 'E') s = s.toUpperCase(); break; }
      case 'g': case 'G': s = fmtFloat(I.toFloat(a)); break;
      case 's': { s = I.toStr(a); if (prec !== undefined) s = s.slice(0, +prec); break; }
      case 'x': s = (I.toInt(a) >>> 0).toString(16); break;
      case 'X': s = (I.toInt(a) >>> 0).toString(16).toUpperCase(); break;
      case 'o': s = (I.toInt(a) >>> 0).toString(8); break;
      case 'b': s = (I.toInt(a) >>> 0).toString(2); break;
      case 'c': s = String.fromCharCode(I.toInt(a)); break;
    }
    if (width && s.length < +width) {
      if (left) s = s + (padc === '0' ? ' ' : padc).repeat(width - s.length);
      else if (padc === '0' && /^[+-]/.test(s) && /[dfFeE]/.test(conv)) s = s[0] + '0'.repeat(width - s.length) + s.slice(1);
      else s = padc.repeat(width - s.length) + s;
    }
    return s;
  });
}
function phpRound(x, p = 0) {
  const m = Math.pow(10, p);
  const y = Math.abs(x) * m;
  let r = Math.round(Number((y).toPrecision(15)));
  return Math.sign(x) * r / m;
}
function numberFormat(I, n, dec = 0, dp = '.', ts = ',') {
  const x = phpRound(I.toFloat(n), dec);
  const neg = x < 0; let [ip, fp] = Math.abs(x).toFixed(dec).split('.');
  ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ts);
  return (neg && Number(Math.abs(x).toFixed(dec)) !== 0 ? '-' : '') + ip + (dec > 0 ? dp + fp : '');
}
function sortArr(I, ref, cmp, keep, byKey) {
  const arr = val(ref);
  if (!(arr instanceof PArr)) throw new PhpError('fatal', 'Uncaught TypeError: sort(): Argument #1 ($array) must be of type array');
  const entries = [...arr.m];
  entries.sort((a, b) => cmp(byKey ? a[0] : a[1], byKey ? b[0] : b[1]));
  const out = new PArr();
  for (const [k, v] of entries) { if (keep) out.set(k, v); else out.push(v); }
  if (ref instanceof RefBox) ref.set(out);
  return true;
}
function jsonEnc(I, v, flags, ind) {
  const pretty = flags & 128; const nl = pretty ? '\n' : ''; const pad = pretty ? '    '.repeat(ind + 1) : ''; const padE = pretty ? '    '.repeat(ind) : '';
  const str = (s) => { let r = JSON.stringify(s); if (!(flags & 64)) r = r.replace(/\//g, '\\/'); if (!(flags & 256)) r = r.replace(/[\u0080-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')); return r; };
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (v instanceof PFloat) { const s = reprFloat(v.v); return s; }
  if (typeof v === 'string') return str(v);
  if (v instanceof PArr) {
    if (v.isList()) { if (!v.size) return '[]'; return '[' + nl + v.values().map(x => pad + jsonEnc(I, x, flags, ind + 1)).join(',' + nl) + nl + padE + ']'; }
    return '{' + nl + [...v.m].map(([k, x]) => pad + str(String(k)) + (pretty ? ': ' : ':') + jsonEnc(I, x, flags, ind + 1)).join(',' + nl) + nl + padE + '}';
  }
  if (v instanceof PObj) {
    const ent = [...v.props].filter(([k]) => { const p = I.propInfo(v.cls, k); return !p || p.vis === 'public'; });
    if (!ent.length) return '{}';
    return '{' + nl + ent.map(([k, x]) => pad + str(k) + (pretty ? ': ' : ':') + jsonEnc(I, x, flags, ind + 1)).join(',' + nl) + nl + padE + '}';
  }
  return 'null';
}
function jsonDec(I, s, assoc) {
  let o; try { o = JSON.parse(s); } catch (_) { return null; }
  const conv = (x) => {
    if (x === null || typeof x === 'boolean' || typeof x === 'string') return x;
    if (typeof x === 'number') return Number.isInteger(x) ? x : F(x);
    if (Array.isArray(x)) return PArr.from(x.map(conv));
    if (assoc) { const a = new PArr(); for (const k in x) a.set(k, conv(x[k])); return a; }
    const ob = new PObj(I.classes.get('stdclass')); ob.id = ++I.objId; for (const k in x) ob.props.set(k, conv(x[k])); return ob;
  };
  return conv(o);
}
function dateFmt(fmt, d) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const p2 = (n) => String(n).padStart(2, '0');
  let out = '';
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c === '\\') { out += fmt[++i] || ''; continue; }
    switch (c) {
      case 'd': out += p2(d.getDate()); break; case 'j': out += d.getDate(); break;
      case 'D': out += days[d.getDay()].slice(0, 3); break; case 'l': out += days[d.getDay()]; break;
      case 'N': out += d.getDay() || 7; break; case 'w': out += d.getDay(); break;
      case 'm': out += p2(d.getMonth() + 1); break; case 'n': out += d.getMonth() + 1; break;
      case 'M': out += months[d.getMonth()].slice(0, 3); break; case 'F': out += months[d.getMonth()]; break;
      case 'Y': out += d.getFullYear(); break; case 'y': out += String(d.getFullYear()).slice(2); break;
      case 'H': out += p2(d.getHours()); break; case 'G': out += d.getHours(); break;
      case 'h': out += p2(d.getHours() % 12 || 12); break; case 'g': out += d.getHours() % 12 || 12; break;
      case 'i': out += p2(d.getMinutes()); break; case 's': out += p2(d.getSeconds()); break;
      case 'A': out += d.getHours() < 12 ? 'AM' : 'PM'; break; case 'a': out += d.getHours() < 12 ? 'am' : 'pm'; break;
      case 't': out += new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); break;
      case 'L': { const y = d.getFullYear(); out += (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 1 : 0; break; }
      case 'U': out += Math.floor(d.getTime() / 1000); break;
      default: out += c;
    }
  }
  return out;
}
let seed = 12345;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

const B = {};
const def = (names, fn, ref) => { for (const n of names.split(',')) B[n] = { fn, ref }; };
// output
def('var_dump', function (a) { for (const v of a) this.echo(this.varDump(v)); return null; });
def('print_r', function (a) { const s = this.printR(a[0]); if (a[1]) return s; this.echo(s); return true; });
def('var_export', function (a) { const s = this.exportVal(a[0]); if (a[1]) return s; this.echo(s); return null; });
def('printf', function (a) { argc('printf', a, 1); const s = sprintf(this, this.toStr(a[0]), a.slice(1)); this.echo(s); return s.length; });
def('sprintf', function (a) { argc('sprintf', a, 1); return sprintf(this, this.toStr(a[0]), a.slice(1)); });
def('vsprintf', function (a) { return sprintf(this, this.toStr(a[0]), needArr(this, a[1], 'vsprintf', 2).values()); });
def('number_format', function (a) { return numberFormat(this, a[0], a[1] === undefined ? 0 : this.toInt(a[1]), a[2] === undefined ? '.' : this.toStr(a[2]), a[3] === undefined ? ',' : this.toStr(a[3])); });
// strings
def('strlen', function (a) { argc('strlen', a, 1); if (a[0] instanceof PArr) throw new PhpError('fatal', 'Uncaught TypeError: strlen(): Argument #1 ($string) must be of type string, array given — untuk menghitung isi array gunakan count()'); return utf8len(this.toStr(a[0])); });
def('mb_strlen', function (a) { return [...this.toStr(a[0])].length; });
def('strtoupper,mb_strtoupper', function (a) { return this.toStr(a[0]).toUpperCase(); });
def('strtolower,mb_strtolower', function (a) { return this.toStr(a[0]).toLowerCase(); });
def('ucfirst', function (a) { const s = this.toStr(a[0]); return s.charAt(0).toUpperCase() + s.slice(1); });
def('lcfirst', function (a) { const s = this.toStr(a[0]); return s.charAt(0).toLowerCase() + s.slice(1); });
def('ucwords', function (a) { const delims = a[1] === undefined ? ' \t\r\n\f\v' : this.toStr(a[1]); let s = this.toStr(a[0]); let out = ''; let up = true; for (const c of s) { out += up ? c.toUpperCase() : c; up = delims.includes(c); } return out; });
def('str_repeat', function (a) { const n = this.toInt(a[1]); if (n < 0) throw new PhpError('fatal', 'Uncaught ValueError: str_repeat(): Argument #2 ($times) must be greater than or equal to 0'); return this.toStr(a[0]).repeat(n); });
def('strrev', function (a) { return this.toStr(a[0]).split('').reverse().join(''); });
def('trim', function (a) { const ch = a[1] === undefined ? ' \t\n\r\0\x0B' : this.toStr(a[1]); let s = this.toStr(a[0]); while (s && ch.includes(s[0])) s = s.slice(1); while (s && ch.includes(s[s.length - 1])) s = s.slice(0, -1); return s; });
def('ltrim', function (a) { const ch = a[1] === undefined ? ' \t\n\r\0\x0B' : this.toStr(a[1]); let s = this.toStr(a[0]); while (s && ch.includes(s[0])) s = s.slice(1); return s; });
def('rtrim,chop', function (a) { const ch = a[1] === undefined ? ' \t\n\r\0\x0B' : this.toStr(a[1]); let s = this.toStr(a[0]); while (s && ch.includes(s[s.length - 1])) s = s.slice(0, -1); return s; });
def('str_replace,str_ireplace', function (a, sc, e) {
  const ci = e && e.name && e.name.toLowerCase() === 'str_ireplace';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rep1 = (subj, s, r) => { if (s === '') return subj; return subj.replace(new RegExp(esc(s), ci ? 'gi' : 'g'), () => r); };
  const doOne = (subj) => {
    subj = this.toStr(subj);
    if (a[0] instanceof PArr) { const ss = a[0].values(); const rs = a[1] instanceof PArr ? a[1].values() : null; ss.forEach((s, i) => { subj = rep1(subj, this.toStr(s), rs ? (rs[i] === undefined ? '' : this.toStr(rs[i])) : this.toStr(a[1])); }); return subj; }
    return rep1(subj, this.toStr(a[0]), this.toStr(a[1]));
  };
  if (a[2] instanceof PArr) { const o = new PArr(); for (const [k, v] of a[2].m) o.set(k, doOne(v)); return o; }
  return doOne(a[2]);
});
def('substr,mb_substr', function (a) { const s = this.toStr(a[0]); let st = this.toInt(a[1]); const L = s.length; if (st < 0) st = Math.max(0, L + st); if (st > L) return ''; let len = a[2] === undefined || a[2] === null ? L - st : this.toInt(a[2]); if (len < 0) len = Math.max(0, L - st + len); return s.substr(st, len); });
def('strpos,mb_strpos', function (a) { const h = this.toStr(a[0]), n = this.toStr(a[1]); let off = a[2] === undefined ? 0 : this.toInt(a[2]); if (off < 0) off += h.length; const r = h.indexOf(n, off); return r === -1 ? false : r; });
def('stripos', function (a) { const r = this.toStr(a[0]).toLowerCase().indexOf(this.toStr(a[1]).toLowerCase(), a[2] === undefined ? 0 : this.toInt(a[2])); return r === -1 ? false : r; });
def('strrpos', function (a) { const r = this.toStr(a[0]).lastIndexOf(this.toStr(a[1])); return r === -1 ? false : r; });
def('strstr', function (a) { const h = this.toStr(a[0]); const i = h.indexOf(this.toStr(a[1])); if (i === -1) return false; return a[2] ? h.slice(0, i) : h.slice(i); });
def('strrchr', function (a) { const h = this.toStr(a[0]); const i = h.lastIndexOf(this.toStr(a[1])[0]); return i === -1 ? false : h.slice(i); });
def('str_contains', function (a) { return this.toStr(a[0]).includes(this.toStr(a[1])); });
def('str_starts_with', function (a) { return this.toStr(a[0]).startsWith(this.toStr(a[1])); });
def('str_ends_with', function (a) { return this.toStr(a[0]).endsWith(this.toStr(a[1])); });
def('substr_count', function (a) { const h = this.toStr(a[0]), n = this.toStr(a[1]); if (!n) throw new PhpError('fatal', 'Uncaught ValueError: substr_count(): Argument #2 ($needle) cannot be empty'); return h.split(n).length - 1; });
def('str_word_count', function (a) { const w = this.toStr(a[0]).match(/[A-Za-z'-]+/g) || []; if (a[1]) return PArr.from(w); return w.length; });
def('str_pad', function (a) {
  const s = this.toStr(a[0]); const len = this.toInt(a[1]); const p = a[2] === undefined ? ' ' : this.toStr(a[2]); const type = a[3] === undefined ? 1 : this.toInt(a[3]);
  const need = len - s.length; if (need <= 0 || !p) return s;
  const mk = (n) => p.repeat(Math.ceil(n / p.length)).slice(0, n);
  if (type === 0) return mk(need) + s; if (type === 2) { const l = Math.floor(need / 2); return mk(l) + s + mk(need - l); } return s + mk(need);
});
def('str_split,mb_str_split', function (a) { const s = this.toStr(a[0]); const n = a[1] === undefined ? 1 : this.toInt(a[1]); if (n < 1) throw new PhpError('fatal', 'Uncaught ValueError: str_split(): Argument #2 ($length) must be greater than 0'); const o = new PArr(); if (s === '') { o.push(''); return o; } for (let i = 0; i < s.length; i += n) o.push(s.slice(i, i + n)); return o; });
def('explode', function (a) {
  const d = this.toStr(a[0]); if (d === '') throw new PhpError('fatal', 'Uncaught ValueError: explode(): Argument #1 ($separator) cannot be empty');
  let parts = this.toStr(a[1]).split(d); const lim = a[2] === undefined ? null : this.toInt(a[2]);
  if (lim !== null && lim > 0 && parts.length > lim) parts = [...parts.slice(0, lim - 1), parts.slice(lim - 1).join(d)];
  if (lim !== null && lim < 0) parts = parts.slice(0, lim);
  return PArr.from(parts);
});
def('implode,join', function (a) {
  let sep = a[0], arr = a[1];
  if (sep instanceof PArr) { const t = sep; sep = arr === undefined ? '' : arr; arr = t; }
  if (!(arr instanceof PArr)) throw new PhpError('fatal', 'Uncaught TypeError: implode(): Argument #2 ($array) must be of type ?array, ' + this.shortType(arr) + ' given');
  return arr.values().map(v => this.toStr(v)).join(this.toStr(sep));
});
def('nl2br', function (a) { return this.toStr(a[0]).replace(/(\r\n|\n|\r)/g, '<br />$1'); });
def('htmlspecialchars,htmlentities', function (a) { return this.toStr(a[0]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); });
def('strip_tags', function (a) { return this.toStr(a[0]).replace(/<[^>]*>/g, ''); });
def('addslashes', function (a) { return this.toStr(a[0]).replace(/([\\'"])/g, '\\$1'); });
def('strcmp', function (a) { const x = this.toStr(a[0]), y = this.toStr(a[1]); return x < y ? -1 : x > y ? 1 : 0; });
def('strcasecmp', function (a) { const x = this.toStr(a[0]).toLowerCase(), y = this.toStr(a[1]).toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; });
def('strncmp', function (a) { const n = this.toInt(a[2]); const x = this.toStr(a[0]).slice(0, n), y = this.toStr(a[1]).slice(0, n); return x < y ? -1 : x > y ? 1 : 0; });
def('strnatcmp,strnatcasecmp', function (a) { return this.toStr(a[0]).localeCompare(this.toStr(a[1]), undefined, { numeric: true }); });
def('ord', function (a) { const s = this.toStr(a[0]); return s ? new TextEncoder().encode(s)[0] : 0; });
def('chr', function (a) { return String.fromCharCode(((this.toInt(a[0]) % 256) + 256) % 256); });
def('wordwrap', function (a) {
  const s = this.toStr(a[0]); const w = a[1] === undefined ? 75 : this.toInt(a[1]); const br = a[2] === undefined ? '\n' : this.toStr(a[2]); const cut = !!a[3];
  const words = s.split(' '); const lines = []; let cur = '';
  for (let wd of words) {
    while (cut && wd.length > w) { if (cur) { lines.push(cur); cur = ''; } lines.push(wd.slice(0, w)); wd = wd.slice(w); }
    if (cur === '') cur = wd; else if ((cur + ' ' + wd).length <= w) cur += ' ' + wd; else { lines.push(cur); cur = wd; }
  }
  lines.push(cur); return lines.join(br);
});
def('md5', function (a) { return md5(this.toStr(a[0])); });
def('str_shuffle', function (a) { const c = this.toStr(a[0]).split(''); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c.join(''); });
def('similar_text', function (a) { const x = this.toStr(a[0]), y = this.toStr(a[1]); const sim = (s1, s2) => { if (!s1.length || !s2.length) return 0; let max = 0, p1 = 0, p2 = 0; for (let i = 0; i < s1.length; i++) for (let j = 0; j < s2.length; j++) { let k = 0; while (i + k < s1.length && j + k < s2.length && s1[i + k] === s2[j + k]) k++; if (k > max) { max = k; p1 = i; p2 = j; } } if (!max) return 0; return max + sim(s1.slice(0, p1), s2.slice(0, p2)) + sim(s1.slice(p1 + max), s2.slice(p2 + max)); }; return sim(x, y); });
def('levenshtein', function (a) { const x = this.toStr(a[0]), y = this.toStr(a[1]); const dp = Array.from({ length: x.length + 1 }, (_, i) => [i]); for (let j = 1; j <= y.length; j++) dp[0][j] = j; for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)); return dp[x.length][y.length]; });
def('preg_match', function (a, sc, e) {
  const re = toRegex(this.toStr(a[0])); const s = this.toStr(a[1]); const m = re.exec(s);
  if (e.args && e.args[2] && isLval(e.args[2])) { const arr = new PArr(); if (m) { m.forEach((x, i) => arr.set(i, x === undefined ? '' : x)); if (m.groups) for (const k in m.groups) arr.set(k, m.groups[k]); } this.assign(e.args[2], arr, sc); }
  return m ? 1 : 0;
});
def('preg_match_all', function (a, sc, e) {
  const re0 = toRegex(this.toStr(a[0])); const re = new RegExp(re0.source, re0.flags.includes('g') ? re0.flags : re0.flags + 'g'); const s = this.toStr(a[1]);
  const all = [...s.matchAll(re)];
  if (e.args && e.args[2] && isLval(e.args[2])) { const out = new PArr(); const ng = all.length ? all[0].length : (new RegExp(re.source + '|')).exec('').length; for (let g = 0; g < ng; g++) out.set(g, PArr.from(all.map(m => m[g] === undefined ? '' : m[g]))); this.assign(e.args[2], out, sc); }
  return all.length;
});
def('preg_replace', function (a) { const re0 = toRegex(this.toStr(a[0])); const re = new RegExp(re0.source, re0.flags + 'g'); return this.toStr(a[2]).replace(re, this.toStr(a[1]).replace(/\$(\d)|\\(\d)/g, '$$$1$2')); });
def('preg_split', function (a) { const re0 = toRegex(this.toStr(a[0])); let parts = this.toStr(a[1]).split(re0); if (a[3] && (this.toInt(a[3]) & 1)) parts = parts.filter(x => x !== ''); return PArr.from(parts.filter(x => x !== undefined)); });
def('preg_quote', function (a) { return this.toStr(a[0]).replace(/[.\\+*?[^\]$(){}=!<>|:\-#\/]/g, '\\$&'); });
// math
def('abs', function (a) { const v = this.toNum(a[0]); return v instanceof PFloat ? F(Math.abs(v.v)) : Math.abs(v); });
def('round', function (a) { return F(phpRound(this.toFloat(a[0]), a[1] === undefined ? 0 : this.toInt(a[1]))); });
def('floor', function (a) { return F(Math.floor(this.toFloat(a[0]))); });
def('ceil', function (a) { return F(Math.ceil(this.toFloat(a[0]))); });
def('sqrt', function (a) { return F(Math.sqrt(this.toFloat(a[0]))); });
def('pow', function (a) { return this.arith('**', a[0], a[1]); });
def('exp', function (a) { return F(Math.exp(this.toFloat(a[0]))); });
def('log', function (a) { const x = this.toFloat(a[0]); return F(a[1] === undefined ? Math.log(x) : Math.log(x) / Math.log(this.toFloat(a[1]))); });
def('log10', function (a) { return F(Math.log10(this.toFloat(a[0]))); });
def('log2', function (a) { return F(Math.log2(this.toFloat(a[0]))); });
def('sin', function (a) { return F(Math.sin(this.toFloat(a[0]))); });
def('cos', function (a) { return F(Math.cos(this.toFloat(a[0]))); });
def('tan', function (a) { return F(Math.tan(this.toFloat(a[0]))); });
def('deg2rad', function (a) { return F(this.toFloat(a[0]) * Math.PI / 180); });
def('pi', function () { return F(Math.PI); });
def('fmod', function (a) { return F(this.toFloat(a[0]) % this.toFloat(a[1])); });
def('intdiv', function (a) { const y = this.toInt(a[1]); if (y === 0) this.throwErr('DivisionByZeroError', 'Division by zero'); return Math.trunc(this.toInt(a[0]) / y); });
def('max', function (a) { const list = a.length === 1 && a[0] instanceof PArr ? a[0].values() : a; if (!list.length) throw new PhpError('fatal', 'Uncaught ValueError: max(): Argument #1 ($value) must contain at least one element'); return list.reduce((m, v) => this.compare(v, m) > 0 ? v : m); });
def('min', function (a) { const list = a.length === 1 && a[0] instanceof PArr ? a[0].values() : a; if (!list.length) throw new PhpError('fatal', 'Uncaught ValueError: min(): Argument #1 ($value) must contain at least one element'); return list.reduce((m, v) => this.compare(v, m) < 0 ? v : m); });
def('rand,mt_rand,random_int', function (a) { if (a.length < 2) return Math.floor(Math.random() * 2147483647); const lo = this.toInt(a[0]), hi = this.toInt(a[1]); return lo + Math.floor(Math.random() * (hi - lo + 1)); });
def('mt_srand,srand', function (a) { seed = this.toInt(a[0]); return null; });
def('mt_getrandmax,getrandmax', function () { return 2147483647; });
def('is_nan', function (a) { return Number.isNaN(this.toFloat(a[0])); });
def('is_infinite', function (a) { const x = this.toFloat(a[0]); return !Number.isFinite(x) && !Number.isNaN(x); });
def('is_finite', function (a) { return Number.isFinite(this.toFloat(a[0])); });
def('base_convert', function (a) { return parseInt(this.toStr(a[0]), this.toInt(a[1])).toString(this.toInt(a[2])); });
def('bindec', function (a) { return parseInt(this.toStr(a[0]), 2) || 0; });
def('decbin', function (a) { return (this.toInt(a[0]) >>> 0).toString(2); });
def('dechex', function (a) { return (this.toInt(a[0]) >>> 0).toString(16); });
def('hexdec', function (a) { return parseInt(this.toStr(a[0]), 16) || 0; });
def('decoct', function (a) { return (this.toInt(a[0]) >>> 0).toString(8); });
def('array_sum', function (a) { const arr = needArr(this, a[0], 'array_sum'); return arr.values().reduce((s, v) => this.arith('+', s, v), 0); });
def('array_product', function (a) { const arr = needArr(this, a[0], 'array_product'); return arr.values().reduce((s, v) => this.arith('*', s, v), 1); });
// types
def('gettype', function (a) { return this.typeName(a[0]); });
def('get_debug_type', function (a) { return this.shortType(a[0]); });
def('is_int,is_integer,is_long', function (a) { return typeof a[0] === 'number'; });
def('is_float,is_double', function (a) { return a[0] instanceof PFloat; });
def('is_string', function (a) { return typeof a[0] === 'string'; });
def('is_bool', function (a) { return typeof a[0] === 'boolean'; });
def('is_array', function (a) { return a[0] instanceof PArr; });
def('is_null', function (a) { return a[0] === null || a[0] === undefined; });
def('is_numeric', function (a) { return isNum(a[0]) || (typeof a[0] === 'string' && isNumericStr(a[0]) && !/\s$/.test(a[0]) || (typeof a[0] === 'string' && /^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/.test(a[0]))); });
def('is_object', function (a) { return a[0] instanceof PObj || a[0] instanceof PClosure; });
def('is_callable', function (a) { const v = a[0]; return v instanceof PClosure || (typeof v === 'string' && (this.funcs.has(v.toLowerCase()) || !!B[v.toLowerCase()])); });
def('is_scalar', function (a) { const v = a[0]; return typeof v === 'string' || typeof v === 'boolean' || isNum(v); });
def('is_iterable', function (a) { return a[0] instanceof PArr; });
def('intval', function (a) { if (a[1] !== undefined && typeof a[0] === 'string') return parseInt(a[0], this.toInt(a[1])) || 0; return this.toInt(a[0]); });
def('floatval,doubleval', function (a) { return F(this.toFloat(a[0])); });
def('strval', function (a) { return this.toStr(a[0]); });
def('boolval', function (a) { return this.toBool(a[0]); });
def('settype', function (a) { const t = this.toStr(a[1]).toLowerCase(); const v = val(a[0]); let nv = v; if (t === 'int' || t === 'integer') nv = this.toInt(v); else if (t === 'float' || t === 'double') nv = F(this.toFloat(v)); else if (t === 'string') nv = this.toStr(v); else if (t === 'bool' || t === 'boolean') nv = this.toBool(v); else if (t === 'array') nv = v instanceof PArr ? v : PArr.from(v === null ? [] : [v]); if (a[0] instanceof RefBox) a[0].set(nv); return true; }, [0]);
def('get_class', function (a) { return a[0] instanceof PObj ? a[0].cls.name : false; });
def('get_parent_class', function (a) { const c = a[0] instanceof PObj ? a[0].cls : this.classes.get(this.toStr(a[0]).toLowerCase()); return c && c.parent ? c.parent.name : false; });
def('get_object_vars', function (a, sc) { const o = a[0]; const r = new PArr(); if (o instanceof PObj) for (const [k, v] of o.props) { const p = this.propInfo(o.cls, k); if (!p || p.vis === 'public' || sc.cls) r.set(k, v); } return r; });
def('get_class_methods', function (a) { const c = a[0] instanceof PObj ? a[0].cls : this.classes.get(this.toStr(a[0]).toLowerCase()); const r = new PArr(); const seen = new Set(); for (let x = c; x; x = x.parent) for (const m of x.methods.values()) if (!seen.has(m.name.toLowerCase())) { seen.add(m.name.toLowerCase()); r.push(m.name); } return r; });
def('method_exists', function (a) { const c = a[0] instanceof PObj ? a[0].cls : this.classes.get(this.toStr(a[0]).toLowerCase()); return !!(c && this.findMethod(c, this.toStr(a[1]))); });
def('property_exists', function (a) { const n = this.toStr(a[1]); if (a[0] instanceof PObj) return a[0].props.has(n) || !!this.propInfo(a[0].cls, n); const c = this.classes.get(this.toStr(a[0]).toLowerCase()); return !!(c && this.propInfo(c, n)); });
def('class_exists', function (a) { return this.classes.has(this.toStr(a[0]).toLowerCase()); });
def('function_exists', function (a) { const n = this.toStr(a[0]).toLowerCase(); return this.funcs.has(n) || !!B[n]; });
def('is_a', function (a) { return a[0] instanceof PObj && this.isSubclass(a[0].cls, this.toStr(a[1]).toLowerCase()); });
def('is_subclass_of', function (a) { return a[0] instanceof PObj && a[0].cls.name.toLowerCase() !== this.toStr(a[1]).toLowerCase() && this.isSubclass(a[0].cls, this.toStr(a[1]).toLowerCase()); });
def('spl_object_id', function (a) { return a[0] instanceof PObj ? a[0].id : 0; });
def('define', function (a) { const n = this.toStr(a[0]); if (this.consts.has(n)) { this.warn('Constant ' + n + ' already defined'); return false; } this.consts.set(n, a[1]); return true; });
def('defined', function (a) { return this.consts.has(this.toStr(a[0])); });
def('constant', function (a) { const n = this.toStr(a[0]); if (n.includes('::')) { const [c, k] = n.split('::'); const cls = this.classes.get(c.toLowerCase()); return cls ? this.findConst(cls, k) : null; } if (!this.consts.has(n)) throw new PhpError('fatal', 'Uncaught Error: Undefined constant "' + n + '"'); return this.consts.get(n); });
// arrays
def('count,sizeof', function (a) {
  const v = a[0];
  if (v instanceof PArr) { if (a[1] && this.toInt(a[1]) === 1) { const rc = (x) => { let n = 0; for (const y of x.values()) { n++; if (y instanceof PArr) n += rc(y); } return n; }; return rc(v); } return v.size; }
  if (v instanceof PObj && this.findMethod(v.cls, 'count')) return this.callMethod(v, this.findMethod(v.cls, 'count'), []);
  throw new PhpError('fatal', 'Uncaught TypeError: count(): Argument #1 ($value) must be of type Countable|array, ' + this.shortType(v) + ' given' + (typeof v === 'string' ? ' — untuk panjang string gunakan strlen()' : ''));
});
def('array_push', function (a) { const arr = needArr(this, a[0], 'array_push'); for (let i = 1; i < a.length; i++) arr.push(this.copy(a[i])); return arr.size; }, [0]);
def('array_pop', function (a) { const arr = needArr(this, a[0], 'array_pop'); if (!arr.size) return null; const keys = arr.keys(); const k = keys[keys.length - 1]; const v = arr.m.get(k); arr.m.delete(k); let mx = -1; for (const kk of arr.m.keys()) if (typeof kk === 'number' && kk > mx) mx = kk; arr.next = mx + 1; return v; }, [0]);
def('array_shift', function (a) { const arr = needArr(this, a[0], 'array_shift'); if (!arr.size) return null; const [k0, v0] = arr.m.entries().next().value; arr.m.delete(k0); const out = new PArr(); for (const [k, v] of arr.m) { if (typeof k === 'number') out.push(v); else out.set(k, v); } arr.m = out.m; arr.next = out.next; return v0; }, [0]);
def('array_unshift', function (a) { const arr = needArr(this, a[0], 'array_unshift'); const out = new PArr(); for (let i = 1; i < a.length; i++) out.push(this.copy(a[i])); for (const [k, v] of arr.m) { if (typeof k === 'number') out.push(v); else out.set(k, v); } arr.m = out.m; arr.next = out.next; return arr.size; }, [0]);
def('array_splice', function (a) {
  const arr = needArr(this, a[0], 'array_splice'); const ent = [...arr.m]; let off = this.toInt(a[1]); if (off < 0) off = Math.max(0, ent.length + off); off = Math.min(off, ent.length);
  let len = a[2] === undefined || a[2] === null ? ent.length - off : this.toInt(a[2]); if (len < 0) len = Math.max(0, ent.length - off + len);
  const repl = a[3] === undefined ? [] : (a[3] instanceof PArr ? a[3].values() : [a[3]]);
  const removed = ent.splice(off, len, ...repl.map(v => [0, v]));
  const out = new PArr(); for (const [k, v] of ent) { if (typeof k === 'number') out.push(v); else out.set(k, v); }
  arr.m = out.m; arr.next = out.next;
  return PArr.from(removed.map(x => x[1]));
}, [0]);
def('in_array', function (a) { const arr = needArr(this, a[1], 'in_array', 2); const strict = !!a[2]; return arr.values().some(v => strict ? this.strictEq(v, a[0]) : this.looseEq(v, a[0])); });
def('array_search', function (a) { const arr = needArr(this, a[1], 'array_search', 2); const strict = !!a[2]; for (const [k, v] of arr.m) if (strict ? this.strictEq(v, a[0]) : this.looseEq(v, a[0])) return k; return false; });
def('array_keys', function (a) { const arr = needArr(this, a[0], 'array_keys'); if (a.length > 1) return PArr.from([...arr.m].filter(([, v]) => this.looseEq(v, a[1])).map(([k]) => k)); return PArr.from(arr.keys()); });
def('array_values', function (a) { return PArr.from(needArr(this, a[0], 'array_values').values()); });
def('array_merge', function (a) { const out = new PArr(); a.forEach((x, i) => { const arr = needArr(this, x, 'array_merge', i + 1); for (const [k, v] of arr.m) { if (typeof k === 'number') out.push(this.copy(v)); else out.set(k, this.copy(v)); } }); return out; });
def('array_merge_recursive', function (a) { const out = new PArr(); for (const x of a) for (const [k, v] of x.m) { if (typeof k === 'number') out.push(v); else if (out.has(k) && out.get(k) instanceof PArr && v instanceof PArr) { const m = out.get(k); for (const y of v.values()) m.push(y); } else if (out.has(k)) { const m = out.get(k) instanceof PArr ? out.get(k) : PArr.from([out.get(k)]); m.push(v); out.set(k, m); } else out.set(k, this.copy(v)); } return out; });
def('array_combine', function (a) { const k = needArr(this, a[0], 'array_combine').values(), v = needArr(this, a[1], 'array_combine', 2).values(); if (k.length !== v.length) throw new PhpError('fatal', 'Uncaught ValueError: array_combine(): Argument #1 ($keys) and argument #2 ($values) must have the same number of elements'); const o = new PArr(); k.forEach((kk, i) => o.set(kk, v[i])); return o; });
def('array_flip', function (a) { const o = new PArr(); for (const [k, v] of needArr(this, a[0], 'array_flip').m) o.set(v, k); return o; });
def('array_reverse', function (a) { const arr = needArr(this, a[0], 'array_reverse'); const o = new PArr(); for (const [k, v] of [...arr.m].reverse()) { if (typeof k === 'number' && !a[1]) o.push(v); else o.set(k, v); } return o; });
def('array_slice', function (a) {
  const arr = needArr(this, a[0], 'array_slice'); const ent = [...arr.m]; let off = this.toInt(a[1]); if (off < 0) off = Math.max(0, ent.length + off);
  let len = a[2] === undefined || a[2] === null ? ent.length : this.toInt(a[2]); let end = len < 0 ? ent.length + len : off + len;
  const o = new PArr(); for (const [k, v] of ent.slice(off, end)) { if (typeof k === 'number' && !a[3]) o.push(v); else o.set(k, v); } return o;
});
def('array_unique', function (a) { const arr = needArr(this, a[0], 'array_unique'); const o = new PArr(); const seen = []; for (const [k, v] of arr.m) { if (!seen.some(s => this.looseEq(s, v) && this.toStr(s) === this.toStr(v))) { seen.push(v); o.set(k, v); } } return o; });
def('array_key_exists,key_exists', function (a) { const arr = a[1]; if (arr instanceof PObj) return arr.props.has(this.toStr(a[0])); return needArr(this, arr, 'array_key_exists', 2).has(a[0]); });
def('array_key_first', function (a) { const k = needArr(this, a[0], 'array_key_first').keys(); return k.length ? k[0] : null; });
def('array_key_last', function (a) { const k = needArr(this, a[0], 'array_key_last').keys(); return k.length ? k[k.length - 1] : null; });
def('array_fill', function (a) { const o = new PArr(); const s = this.toInt(a[0]); for (let i = 0; i < this.toInt(a[1]); i++) o.set(s + i, this.copy(a[2])); return o; });
def('array_fill_keys', function (a) { const o = new PArr(); for (const k of needArr(this, a[0], 'array_fill_keys').values()) o.set(k, this.copy(a[1])); return o; });
def('array_pad', function (a) { const arr = needArr(this, a[0], 'array_pad'); const n = this.toInt(a[1]); const vals = arr.values(); const pad = Array(Math.max(0, Math.abs(n) - vals.length)).fill(a[2]); return PArr.from(n > 0 ? [...vals, ...pad] : [...pad, ...vals]); });
def('array_column', function (a) { const o = new PArr(); for (const row of needArr(this, a[0], 'array_column').values()) { const get = (r, c) => r instanceof PArr ? (r.has(c) ? r.get(c) : undefined) : r instanceof PObj ? r.props.get(this.toStr(c)) : undefined; const v = a[1] === null ? row : get(row, a[1]); if (v === undefined) continue; if (a[2] !== undefined && a[2] !== null) o.set(get(row, a[2]), v); else o.push(v); } return o; });
def('array_count_values', function (a) { const o = new PArr(); for (const v of needArr(this, a[0], 'array_count_values').values()) o.set(v, (o.get(v) || 0) + 1); return o; });
def('array_chunk', function (a) { const arr = needArr(this, a[0], 'array_chunk'); const n = this.toInt(a[1]); const o = new PArr(); let cur = null; let i = 0; for (const [k, v] of arr.m) { if (i % n === 0) { cur = new PArr(); o.push(cur); } if (a[2]) cur.set(k, v); else cur.push(v); i++; } return o; });
def('array_diff', function (a) { const arr = needArr(this, a[0], 'array_diff'); const others = a.slice(1).flatMap(x => x.values().map(v => this.toStr(v))); const o = new PArr(); for (const [k, v] of arr.m) if (!others.includes(this.toStr(v))) o.set(k, v); return o; });
def('array_diff_key', function (a) { const arr = needArr(this, a[0], 'array_diff_key'); const o = new PArr(); for (const [k, v] of arr.m) if (!a.slice(1).some(x => x.has(k))) o.set(k, v); return o; });
def('array_intersect', function (a) { const arr = needArr(this, a[0], 'array_intersect'); const o = new PArr(); for (const [k, v] of arr.m) if (a.slice(1).every(x => x.values().some(y => this.toStr(y) === this.toStr(v)))) o.set(k, v); return o; });
def('array_intersect_key', function (a) { const arr = needArr(this, a[0], 'array_intersect_key'); const o = new PArr(); for (const [k, v] of arr.m) if (a.slice(1).every(x => x.has(k))) o.set(k, v); return o; });
def('range', function (a) {
  const s = a[0], e = a[1];
  if (typeof s === 'string' && typeof e === 'string' && s.length === 1 && e.length === 1 && !/\d/.test(s)) { const x = s.charCodeAt(0), y = e.charCodeAt(0); const st = Math.abs(this.toInt(a[2] === undefined ? 1 : a[2])) || 1; const o = []; if (x <= y) for (let i = x; i <= y; i += st) o.push(String.fromCharCode(i)); else for (let i = x; i >= y; i -= st) o.push(String.fromCharCode(i)); return PArr.from(o); }
  const x = this.toNum(s), y = this.toNum(e); const stp = a[2] === undefined ? 1 : this.toNum(a[2]);
  const isF = x instanceof PFloat || y instanceof PFloat || stp instanceof PFloat;
  const xv = numVal(x), yv = numVal(y); let st = Math.abs(numVal(stp)) || 1;
  const o = []; const cnt = Math.floor(Math.abs(yv - xv) / st + 1e-9);
  if (cnt > 1000000) throw new PhpError('fatal', 'range() terlalu besar');
  for (let i = 0; i <= cnt; i++) { const v = xv <= yv ? xv + i * st : xv - i * st; o.push(isF ? F(Number(v.toPrecision(15))) : v); }
  return PArr.from(o);
});
def('array_map', function (a, sc) {
  const f = a[0]; const arrs = a.slice(1).map((x, i) => needArr(this, x, 'array_map', i + 2));
  if (arrs.length === 1) { const o = new PArr(); const keepKeys = !arrs[0].isList() || true; for (const [k, v] of arrs[0].m) { const r = f === null ? v : this.callCallable(f, [v], sc); if (keepKeys) o.set(k, r); } return o; }
  const n = Math.max(...arrs.map(x => x.size)); const lists = arrs.map(x => x.values()); const o = new PArr();
  for (let i = 0; i < n; i++) { const args = lists.map(l => l[i] === undefined ? null : l[i]); o.push(f === null ? PArr.from(args) : this.callCallable(f, args, sc)); }
  return o;
});
def('array_filter', function (a, sc) {
  const arr = needArr(this, a[0], 'array_filter'); const f = a[1]; const mode = a[2] === undefined ? 0 : this.toInt(a[2]); const o = new PArr();
  for (const [k, v] of arr.m) { let keep; if (f === undefined || f === null) keep = this.toBool(v); else keep = this.toBool(this.callCallable(f, mode === 2 ? [k] : mode === 1 ? [v, k] : [v], sc)); if (keep) o.set(k, v); }
  return o;
});
def('array_reduce', function (a, sc) { const arr = needArr(this, a[0], 'array_reduce'); let acc = a[2] === undefined ? null : a[2]; for (const v of arr.values()) acc = this.callCallable(a[1], [acc, v], sc); return acc; });
def('array_walk', function (a, sc) { const arr = needArr(this, a[0], 'array_walk'); for (const k of arr.keys()) { const box = new RefBox(() => arr.m.get(k), (v) => arr.m.set(k, v)); this.callCallable(a[1], [box, k], sc); } return true; }, [0]);
def('array_rand', function (a) { const k = needArr(this, a[0], 'array_rand').keys(); return k[Math.floor(Math.random() * k.length)]; });
def('shuffle', function (a) { const arr = needArr(this, a[0], 'shuffle'); const v = arr.values(); for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; } const o = PArr.from(v); if (a[0] instanceof RefBox) a[0].set(o); return true; }, [0]);
def('sort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(x, y), false); }, [0]);
def('rsort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(y, x), false); }, [0]);
def('asort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(x, y), true); }, [0]);
def('arsort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(y, x), true); }, [0]);
def('ksort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(x, y), true, true); }, [0]);
def('krsort', function (a) { return sortArr(this, a[0], (x, y) => this.compare(y, x), true, true); }, [0]);
def('usort', function (a, sc) { return sortArr(this, a[0], (x, y) => this.toInt(this.callCallable(a[1], [x, y], sc)), false); }, [0]);
def('uasort', function (a, sc) { return sortArr(this, a[0], (x, y) => this.toInt(this.callCallable(a[1], [x, y], sc)), true); }, [0]);
def('uksort', function (a, sc) { return sortArr(this, a[0], (x, y) => this.toInt(this.callCallable(a[1], [x, y], sc)), true, true); }, [0]);
def('natsort,natcasesort', function (a) { return sortArr(this, a[0], (x, y) => this.toStr(x).localeCompare(this.toStr(y), undefined, { numeric: true }), true); }, [0]);
def('array_is_list', function (a) { return needArr(this, a[0], 'array_is_list').isList(); });
def('compact', function (a, sc) { const o = new PArr(); for (const n of a) { const names = n instanceof PArr ? n.values() : [n]; for (const nm of names) { const s = this.toStr(nm); const v = this.quietEval({ k: 'Var', name: s }, sc); if (v !== null) o.set(s, v); } } return o; });
def('extract', function (a, sc) { const arr = needArr(this, a[0], 'extract'); for (const [k, v] of arr.m) this.setVar(sc, String(k), v); return arr.size; });
def('current,reset,pos', function (a) { const arr = val(a[0]); if (!(arr instanceof PArr) || !arr.size) return false; return arr.values()[0]; }, [0]);
def('end', function (a) { const arr = val(a[0]); if (!(arr instanceof PArr) || !arr.size) return false; const v = arr.values(); return v[v.length - 1]; }, [0]);
def('key', function (a) { const arr = val(a[0]); if (!(arr instanceof PArr) || !arr.size) return null; return arr.keys()[0]; }, [0]);
def('func_get_args', function (a, sc) { const o = new PArr(); if (sc.fn) for (const p of sc.fn.params) o.push(sc.vars.get(p.name)); return o; });
def('call_user_func', function (a, sc) { return this.callCallable(a[0], a.slice(1), sc); });
def('call_user_func_array', function (a, sc) { return this.callCallable(a[0], needArr(this, a[1], 'call_user_func_array', 2).values(), sc); });
def('iterator_to_array', function (a) { return a[0] instanceof PArr ? a[0] : new PArr(); });
// json & misc
def('json_encode', function (a) { return jsonEnc(this, a[0], a[1] === undefined ? 0 : this.toInt(a[1]), 0); });
def('json_decode', function (a) { return jsonDec(this, this.toStr(a[0]), !!a[1]); });
def('serialize', function (a) { return jsonEnc(this, a[0], 0, 0); });
def('date', function (a) { const d = a[1] === undefined ? new Date() : new Date(this.toInt(a[1]) * 1000); return dateFmt(this.toStr(a[0]), d); });
def('time', function () { return Math.floor(Date.now() / 1000); });
def('mktime', function (a) { const d = new Date(); const g = (i, dflt) => a[i] === undefined ? dflt : this.toInt(a[i]); return Math.floor(new Date(g(5, d.getFullYear()), g(3, d.getMonth() + 1) - 1, g(4, d.getDate()), g(0, d.getHours()), g(1, d.getMinutes()), g(2, d.getSeconds())).getTime() / 1000); });
def('strtotime', function (a) { const t = Date.parse(this.toStr(a[0])); return Number.isNaN(t) ? false : Math.floor(t / 1000); });
def('checkdate', function (a) { const m = this.toInt(a[0]), d = this.toInt(a[1]), y = this.toInt(a[2]); if (m < 1 || m > 12 || d < 1) return false; return d <= new Date(y, m, 0).getDate(); });
def('microtime', function (a) { return a[0] ? F(Date.now() / 1000) : '0.0 ' + Math.floor(Date.now() / 1000); });
def('hrtime', function () { return PArr.from([Math.floor(Date.now() / 1000), 0]); });
def('usleep,sleep,error_reporting,ini_set,set_error_handler,ob_start,flush,header,session_start,setlocale,date_default_timezone_set', function () { return null; });
def('uniqid', function () { return Date.now().toString(16); });
def('phpversion', function () { return '8.3.0'; });
def('memory_get_usage', function () { return 2097152; });
def('ob_get_clean', function () { return ''; });
def('array_key_exists_safe', function () { return false; });
def('mb_str_pad', function (a) { return B.str_pad.fn.call(this, a); });
def('array_walk_recursive', function (a, sc) { const walk = (arr) => { for (const k of arr.keys()) { const v = arr.m.get(k); if (v instanceof PArr) walk(v); else this.callCallable(a[1], [new RefBox(() => arr.m.get(k), (x) => arr.m.set(k, x)), k], sc); } }; walk(needArr(this, a[0], 'array_walk_recursive')); return true; }, [0]);
def('array_find', function (a, sc) { for (const [k, v] of needArr(this, a[0], 'array_find').m) if (this.toBool(this.callCallable(a[1], [v, k], sc))) return v; return null; });
def('array_any', function (a, sc) { for (const [k, v] of needArr(this, a[0], 'array_any').m) if (this.toBool(this.callCallable(a[1], [v, k], sc))) return true; return false; });
def('array_all', function (a, sc) { for (const [k, v] of needArr(this, a[0], 'array_all').m) if (!this.toBool(this.callCallable(a[1], [v, k], sc))) return false; return true; });
def('ctype_digit', function (a) { return typeof a[0] === 'string' && /^\d+$/.test(a[0]); });
def('ctype_alpha', function (a) { return typeof a[0] === 'string' && /^[A-Za-z]+$/.test(a[0]); });
def('ctype_upper', function (a) { return typeof a[0] === 'string' && /^[A-Z]+$/.test(a[0]); });
def('ctype_lower', function (a) { return typeof a[0] === 'string' && /^[a-z]+$/.test(a[0]); });
def('ctype_space', function (a) { return typeof a[0] === 'string' && /^\s+$/.test(a[0]); });
def('ctype_alnum', function (a) { return typeof a[0] === 'string' && /^[A-Za-z0-9]+$/.test(a[0]); });
def('filter_var', function (a) { const v = this.toStr(a[0]); const f = a[1] === undefined ? 516 : this.toInt(a[1]); if (f === 274) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : false; if (f === 257) return /^[+-]?\d+$/.test(v.trim()) ? parseInt(v, 10) : false; if (f === 259) return isNumericStr(v) ? F(parseFloat(v)) : false; return v; });
def('password_hash', function (a) { return '$2y$10$' + md5(this.toStr(a[0])).padEnd(53, 'x'); });
def('password_verify', function (a) { return this.toStr(a[1]) === '$2y$10$' + md5(this.toStr(a[0])).padEnd(53, 'x'); });
def('bin2hex', function (a) { return [...new TextEncoder().encode(this.toStr(a[0]))].map(b => b.toString(16).padStart(2, '0')).join(''); });
def('base64_encode', function (a) { return btoa(unescape(encodeURIComponent(this.toStr(a[0])))); });
def('base64_decode', function (a) { try { return decodeURIComponent(escape(atob(this.toStr(a[0])))); } catch (_) { return false; } });
def('urlencode,rawurlencode', function (a) { return encodeURIComponent(this.toStr(a[0])); });
def('array_flip_safe', function () { return null; });
const BUILTINS = B;
function toRegex(p) {
  const d = p[0]; const endD = d === '(' ? ')' : d === '{' ? '}' : d === '[' ? ']' : d;
  const last = p.lastIndexOf(endD); const body = p.slice(1, last); let flags = p.slice(last + 1).replace(/[^imsu]/g, '');
  try { return new RegExp(body.replace(/\(\?P</g, '(?<'), flags); } catch (e) { throw new PhpError('fatal', 'preg: pola regex tidak valid: ' + e.message); }
}
// small md5
function md5(str) {
  const s = unescape(encodeURIComponent(str));
  function cmn(q, a, b, x, s2, t) { a = (a + q + x + t) | 0; return (((a << s2) | (a >>> (32 - s2))) + b) | 0; }
  const ff = (a, b, c, d, x, s2, t) => cmn((b & c) | (~b & d), a, b, x, s2, t), gg = (a, b, c, d, x, s2, t) => cmn((b & d) | (c & ~d), a, b, x, s2, t), hh = (a, b, c, d, x, s2, t) => cmn(b ^ c ^ d, a, b, x, s2, t), ii = (a, b, c, d, x, s2, t) => cmn(c ^ (b | ~d), a, b, x, s2, t);
  const n = s.length; const words = new Array(((n + 8) >> 6) + 1 << 4).fill(0);
  for (let i = 0; i < n; i++) words[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  words[n >> 2] |= 0x80 << ((n % 4) << 3); words[words.length - 2] = n * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d, x = words.slice(i, i + 16);
    a = ff(a, b, c, d, x[0], 7, -680876936); d = ff(d, a, b, c, x[1], 12, -389564586); c = ff(c, d, a, b, x[2], 17, 606105819); b = ff(b, c, d, a, x[3], 22, -1044525330);
    a = ff(a, b, c, d, x[4], 7, -176418897); d = ff(d, a, b, c, x[5], 12, 1200080426); c = ff(c, d, a, b, x[6], 17, -1473231341); b = ff(b, c, d, a, x[7], 22, -45705983);
    a = ff(a, b, c, d, x[8], 7, 1770035416); d = ff(d, a, b, c, x[9], 12, -1958414417); c = ff(c, d, a, b, x[10], 17, -42063); b = ff(b, c, d, a, x[11], 22, -1990404162);
    a = ff(a, b, c, d, x[12], 7, 1804603682); d = ff(d, a, b, c, x[13], 12, -40341101); c = ff(c, d, a, b, x[14], 17, -1502002290); b = ff(b, c, d, a, x[15], 22, 1236535329);
    a = gg(a, b, c, d, x[1], 5, -165796510); d = gg(d, a, b, c, x[6], 9, -1069501632); c = gg(c, d, a, b, x[11], 14, 643717713); b = gg(b, c, d, a, x[0], 20, -373897302);
    a = gg(a, b, c, d, x[5], 5, -701558691); d = gg(d, a, b, c, x[10], 9, 38016083); c = gg(c, d, a, b, x[15], 14, -660478335); b = gg(b, c, d, a, x[4], 20, -405537848);
    a = gg(a, b, c, d, x[9], 5, 568446438); d = gg(d, a, b, c, x[14], 9, -1019803690); c = gg(c, d, a, b, x[3], 14, -187363961); b = gg(b, c, d, a, x[8], 20, 1163531501);
    a = gg(a, b, c, d, x[13], 5, -1444681467); d = gg(d, a, b, c, x[2], 9, -51403784); c = gg(c, d, a, b, x[7], 14, 1735328473); b = gg(b, c, d, a, x[12], 20, -1926607734);
    a = hh(a, b, c, d, x[5], 4, -378558); d = hh(d, a, b, c, x[8], 11, -2022574463); c = hh(c, d, a, b, x[11], 16, 1839030562); b = hh(b, c, d, a, x[14], 23, -35309556);
    a = hh(a, b, c, d, x[1], 4, -1530992060); d = hh(d, a, b, c, x[4], 11, 1272893353); c = hh(c, d, a, b, x[7], 16, -155497632); b = hh(b, c, d, a, x[10], 23, -1094730640);
    a = hh(a, b, c, d, x[13], 4, 681279174); d = hh(d, a, b, c, x[0], 11, -358537222); c = hh(c, d, a, b, x[3], 16, -722521979); b = hh(b, c, d, a, x[6], 23, 76029189);
    a = hh(a, b, c, d, x[9], 4, -640364487); d = hh(d, a, b, c, x[12], 11, -421815835); c = hh(c, d, a, b, x[15], 16, 530742520); b = hh(b, c, d, a, x[2], 23, -995338651);
    a = ii(a, b, c, d, x[0], 6, -198630844); d = ii(d, a, b, c, x[7], 10, 1126891415); c = ii(c, d, a, b, x[14], 15, -1416354905); b = ii(b, c, d, a, x[5], 21, -57434055);
    a = ii(a, b, c, d, x[12], 6, 1700485571); d = ii(d, a, b, c, x[3], 10, -1894986606); c = ii(c, d, a, b, x[10], 15, -1051523); b = ii(b, c, d, a, x[1], 21, -2054922799);
    a = ii(a, b, c, d, x[8], 6, 1873313359); d = ii(d, a, b, c, x[15], 10, -30611744); c = ii(c, d, a, b, x[6], 15, -1560198380); b = ii(b, c, d, a, x[13], 21, 1309151649);
    a = ii(a, b, c, d, x[4], 6, -145523070); d = ii(d, a, b, c, x[11], 10, -1120210379); c = ii(c, d, a, b, x[2], 15, 718787259); b = ii(b, c, d, a, x[9], 21, -343485551);
    a = (a + oa) | 0; b = (b + ob) | 0; c = (c + oc) | 0; d = (d + od) | 0;
  }
  return [a, b, c, d].map(v => { let h = ''; for (let i = 0; i < 4; i++) h += ((v >> (i * 8)) & 255).toString(16).padStart(2, '0'); return h; }).join('');
}

const PRELUDE = `<?php
interface Throwable {}
interface Countable {}
interface ArrayAccess {}
interface Stringable {}
interface JsonSerializable {}
interface IteratorAggregate {}
class stdClass {}
class Exception implements Throwable {
  protected $message = ''; protected $code = 0; protected $previous = null;
  public function __construct($message = '', $code = 0, $previous = null) { $this->message = $message; $this->code = $code; $this->previous = $previous; }
  public function getMessage() { return $this->message; }
  public function getCode() { return $this->code; }
  public function getPrevious() { return $this->previous; }
  public function getLine() { return 0; }
  public function getFile() { return '/latihan/index.php'; }
  public function getTraceAsString() { return '#0 {main}'; }
  public function __toString() { return get_class($this) . ': ' . $this->message; }
}
class Error implements Throwable {
  protected $message = ''; protected $code = 0;
  public function __construct($message = '', $code = 0) { $this->message = $message; $this->code = $code; }
  public function getMessage() { return $this->message; }
  public function getCode() { return $this->code; }
  public function getLine() { return 0; }
}
class ErrorException extends Exception {}
class InvalidArgumentException extends Exception {}
class RuntimeException extends Exception {}
class LogicException extends Exception {}
class DomainException extends LogicException {}
class LengthException extends LogicException {}
class OutOfRangeException extends LogicException {}
class OutOfBoundsException extends RuntimeException {}
class RangeException extends RuntimeException {}
class OverflowException extends RuntimeException {}
class UnderflowException extends RuntimeException {}
class UnexpectedValueException extends RuntimeException {}
class BadFunctionCallException extends LogicException {}
class BadMethodCallException extends BadFunctionCallException {}
class TypeError extends Error {}
class ValueError extends Error {}
class ArithmeticError extends Error {}
class DivisionByZeroError extends ArithmeticError {}
class ArgumentCountError extends TypeError {}
class UnhandledMatchError extends Error {}
`;
let preludeAst = null;
function runPHP(code, opts) {
  const I = new Interp(opts);
  if (!preludeAst) preludeAst = new Parser(lex(PRELUDE)).program();
  I.hoist(preludeAst, { vars: new Map() });
  for (const c of I.classes.values()) c.builtin = true;
  const t0 = Date.now();
  const r = I.run(code);
  r.ms = Date.now() - t0;
  return r;
}

const api = { runPHP, lex };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MiniPHP = api;
})(typeof window !== 'undefined' ? window : globalThis);
