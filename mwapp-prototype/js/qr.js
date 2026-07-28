// ============================================================
// Минимальный кодировщик QR — байтовый режим, уровень коррекции M,
// версии 1–3 (до 42 байт). MWA-ID укладывается в версию 1.
// Написан на месте, чтобы не отправлять номер моряка на чужой сервер
// и чтобы код рисовался без интернета.
// ============================================================

// --- арифметика GF(256) для Рида — Соломона -------------------
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

function rsGenerator(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= g[j];                        // умножение на x
      ng[j + 1] ^= mul(g[j], EXP[i]);       // умножение на альфа^i
    }
    g = ng;
  }
  return g;
}

function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const d of data) {
    const factor = d ^ res[0];
    res.shift(); res.push(0);
    for (let i = 0; i < ecLen; i++) res[i] ^= mul(gen[i + 1], factor);
  }
  return res;
}

// --- параметры версий (уровень M, один блок) -------------------
const VER = {
  1: { size: 21, total: 26, ec: 10, align: [] },
  2: { size: 25, total: 44, ec: 16, align: [6, 18] },
  3: { size: 29, total: 70, ec: 26, align: [6, 22] },
};

function pickVersion(len) {
  for (const v of [1, 2, 3]) {
    const cap = VER[v].total - VER[v].ec;
    if (len + 2 <= cap) return v;   // +2 = индикатор режима и длины
  }
  throw new Error('строка слишком длинная для версий 1-3');
}

// --- поток данных ---------------------------------------------
function buildData(text, ver) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const dataCap = VER[ver].total - VER[ver].ec;
  const bits = [];
  const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };

  push(0b0100, 4);          // байтовый режим
  push(bytes.length, 8);    // длина (8 бит для версий 1-9)
  for (const b of bytes) push(b, 8);

  const capBits = dataCap * 8;
  for (let i = 0; i < 4 && bits.length < capBits; i++) bits.push(0);  // терминатор
  while (bits.length % 8) bits.push(0);

  const cw = [];
  for (let i = 0; i < bits.length; i += 8) {
    cw.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  }
  const PAD = [0xEC, 0x11];
  let k = 0;
  while (cw.length < dataCap) cw.push(PAD[k++ % 2]);

  return cw.concat(rsEncode(cw, VER[ver].ec));
}

// --- построение матрицы ---------------------------------------
function buildMatrix(codewords, ver) {
  const n = VER[ver].size;
  const m = Array.from({ length: n }, () => new Array(n).fill(null));   // null = свободно
  const reserve = (r, c) => { if (r >= 0 && r < n && c >= 0 && c < n && m[r][c] === null) m[r][c] = 0; };

  // поисковые узоры + отступы
  const finder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
      const inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6));
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      m[rr][cc] = (inRing || inCore) ? 1 : 0;
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);

  // синхрополосы
  for (let i = 8; i < n - 8; i++) { m[6][i] = (i % 2 === 0) ? 1 : 0; m[i][6] = (i % 2 === 0) ? 1 : 0; }

  // выравнивающие узоры
  const al = VER[ver].align;
  for (const r0 of al) for (const c0 of al) {
    if ((r0 <= 8 && c0 <= 8) || (r0 <= 8 && c0 >= n - 9) || (r0 >= n - 9 && c0 <= 8)) continue;
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
      m[r0 + r][c0 + c] = (Math.max(Math.abs(r), Math.abs(c)) !== 1) ? 1 : 0;
    }
  }

  m[n - 8][8] = 1;   // всегда тёмный модуль

  // резерв под сведения о формате
  for (let i = 0; i <= 8; i++) { reserve(8, i); reserve(i, 8); }
  for (let i = 0; i < 8; i++) { reserve(8, n - 1 - i); reserve(n - 1 - i, 8); }

  // укладка данных змейкой снизу вверх
  const bits = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
  let bi = 0, up = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;                       // пропускаем синхрополосу
    for (let i = 0; i < n; i++) {
      const row = up ? n - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (m[row][c] === null) m[row][c] = bi < bits.length ? bits[bi++] : 0;
      }
    }
    up = !up;
  }
  return m;
}

// --- маски и штрафы --------------------------------------------
const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r, c) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
];

function isFunction(r, c, n, ver) {
  if (r === 6 || c === 6) return true;
  if (r <= 8 && c <= 8) return true;
  if (r <= 8 && c >= n - 8) return true;
  if (r >= n - 8 && c <= 8) return true;
  const al = VER[ver].align;
  for (const r0 of al) for (const c0 of al) {
    if ((r0 <= 8 && c0 <= 8) || (r0 <= 8 && c0 >= n - 9) || (r0 >= n - 9 && c0 <= 8)) continue;
    if (Math.abs(r - r0) <= 2 && Math.abs(c - c0) <= 2) return true;
  }
  return false;
}

function penalty(m) {
  const n = m.length; let p = 0;
  const run = (get) => {
    for (let a = 0; a < n; a++) {
      let cnt = 1;
      for (let b = 1; b < n; b++) {
        if (get(a, b) === get(a, b - 1)) { cnt++; }
        else { if (cnt >= 5) p += 3 + (cnt - 5); cnt = 1; }
      }
      if (cnt >= 5) p += 3 + (cnt - 5);
    }
  };
  run((a, b) => m[a][b]); run((a, b) => m[b][a]);
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3;
  }
  const PAT = [1,0,1,1,1,0,1,0,0,0,0];
  const chk = (get) => {
    for (let a = 0; a < n; a++) for (let b = 0; b + 11 <= n; b++) {
      let ok = true;
      for (let i = 0; i < 11; i++) if (get(a, b + i) !== PAT[i]) { ok = false; break; }
      if (ok) p += 40;
    }
  };
  chk((a, b) => m[a][b]); chk((a, b) => m[b][a]);
  let dark = 0;
  for (const row of m) for (const v of row) dark += v;
  p += Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
  return p;
}

function formatBits(mask) {
  const data = (0b00 << 3) | mask;          // 00 = уровень коррекции M
  let v = data << 10;
  for (let i = 4; i >= 0; i--) if ((v >> (i + 10)) & 1) v ^= 0b10100110111 << i;
  return ((data << 10) | v) ^ 0b101010000010010;
}

function placeFormat(m, mask) {
  const n = m.length, f = formatBits(mask);
  const bit = (i) => (f >> i) & 1;          // bit(14) — старший

  // Порядок проверен по эталонному коду: ячейка (8,0) держит СТАРШИЙ бит.
  // Копия 1: строка 8 слева направо, затем столбец 8 снизу вверх.
  for (let i = 0; i <= 5; i++) m[8][i] = bit(14 - i);
  m[8][7] = bit(8);
  m[8][8] = bit(7);
  m[7][8] = bit(6);
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);

  // Копия 2: столбец 8 снизу вверх, затем строка 8 слева направо.
  for (let i = 0; i <= 6; i++) m[n - 1 - i][8] = bit(14 - i);
  for (let i = 0; i <= 7; i++) m[8][n - 8 + i] = bit(7 - i);

  m[n - 8][8] = 1;                          // всегда тёмный модуль
}

function qrMatrix(text) {
  const ver = pickVersion(new TextEncoder().encode(text).length);
  const base = buildMatrix(buildData(text, ver), ver);
  const n = base.length;
  let best = null, bestScore = Infinity;
  for (let k = 0; k < 8; k++) {
    const m = base.map(r => r.slice());
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!isFunction(r, c, n, ver) && MASKS[k](r, c)) m[r][c] ^= 1;
    }
    placeFormat(m, k);
    const s = penalty(m);
    if (s < bestScore) { bestScore = s; best = m; }
  }
  return best;
}

// --- вывод в SVG ------------------------------------------------
function qrSvg(text, px = 180) {
  const m = qrMatrix(text), n = m.length, q = 4, total = n + q * 2;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (m[r][c]) d += `M${c + q} ${r + q}h1v1h-1z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code">` +
         `<rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

