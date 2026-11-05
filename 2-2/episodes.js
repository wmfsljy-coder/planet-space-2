/* 행성우주과학 Ⅱ-2 은하와 우주 — 소단원별 이야기 네 편
   ① 하늘 한쪽에 몰린 공들 ② 사라진 빛 ③ 보이지 않는 것의 무게 ④ 막대 인간이 나타났다
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork), ../assets/story.js, ../assets/share.js */
(function () {
"use strict";

window.sthUnit("psp-2-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function lg(x) { return Math.log(x) / Math.LN10; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function segPick(group, btn) {
  Array.prototype.forEach.call(group.querySelectorAll("button"), function (b) { b.classList.toggle("on", b === btn); });
}
function segWire(id, onPick) {
  var g = $(id);
  Array.prototype.forEach.call(g.querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { segPick(g, b); onPick(b); });
  });
}
function axes(ctx, x0, y0, x1, y1) {
  ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
}
/* ---- 무대 그림 공용 (../assets/kit.js) ---- */
var SK = window.sthKit, SC = SK.C;
/* 흑체 온도 → 눈에 보이는 색(근삿값) */
function tRGB(T) {
  var t = clamp(T, 1000, 40000) / 100, r, g, b;
  r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
  g = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755);
  b = t >= 66 ? 255 : (t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04);
  return [Math.round(clamp(r, 0, 255)), Math.round(clamp(g, 0, 255)), Math.round(clamp(b, 0, 255))];
}
function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a == null ? 1 : a) + ")"; }
/* 색지수 B−V → 표면 온도(근삿값, Ballesteros 식) → 색 */
function bvRGB(bv) { var b = clamp(bv, -0.35, 1.9); return tRGB(4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62))); }
function starC(ctx, x, y, r, c, halo) {
  var hr = r * (halo || 4), g = ctx.createRadialGradient(x, y, 0, x, y, hr);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(r / hr, rgba(c, .95)); g.addColorStop(Math.min(.99, r / hr * 2.2), rgba(c, .25)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, hr, 0, 6.2832); ctx.fill();
}
function starT(ctx, x, y, r, T, halo) { starC(ctx, x, y, r, tRGB(T), halo || 4.2); }
function starBV(ctx, x, y, r, bv, halo) { starC(ctx, x, y, r, bvRGB(bv), halo || 3.4); }
function kv(ctx, k, val, x, y, col, size) {
  SK.t(ctx, k, x, y, { s: 11.5, c: SC.mute, w: "700" });
  SK.t(ctx, val, x, y + (size || 18) + 6, { s: size || 18, c: col || SC.ink, w: "900" });
}
function playWire(id, on, label) {
  var b = $(id), st = { on: on };
  function paint() { b.textContent = st.on ? "⏸ " + label[0] : "▶ " + label[1]; }
  b.addEventListener("click", function () { st.on = !st.on; paint(); });
  paint();
  return st;
}

/* ---- 스튜디오 + 블록 모형 공용 (_tools/STUDIO_GUIDE.md) ----
   밝은 스튜디오 바탕 위에 입체 미니어처(공·받침대·진열장)를 놓고, 굵은 큰 글자와 흰 판정 카드로 읽게 한다. */
var LT = SK.LT;
function studio(ctx, x, y, w, h, fl) { SK.studio(ctx, x, y, w, h, fl); }
/* 큰 글자 두 줄(썸네일 말투) */
function big2(ctx, a, b, x, y, ca, cb) {
  if (a) SK.bigText(ctx, a, x, y, 26, ca || "#ffffff");
  if (b) SK.bigText(ctx, b, x, y + 33, 17, cb || "#ffd35a");
}
/* 카드 안 큰 값 · 작은 설명 */
function cval(ctx, s, x, y, col, size, a) { SK.t(ctx, s, x, y, { s: size || 22, w: "900", c: col || LT.ink, a: a }); }
function cnote(ctx, s, x, y, col, a) { SK.t(ctx, s, x, y, { s: 11, w: "700", c: col || LT.mute, a: a }); }
function dark(c, f) { return [Math.round(c[0] * f), Math.round(c[1] * f), Math.round(c[2] * f)]; }
/* 스튜디오 위 입체 공(별·기체 공): 바닥 그림자(o.floor = 바닥 y) + 빛 번짐(o.glow) + 공 */
function orb(ctx, x, y, r, c3, o) {
  o = o || {};
  if (o.floor) {
    var fy = o.floor, sg = ctx.createRadialGradient(x, fy, 1, x, fy, r * 1.5);
    sg.addColorStop(0, "rgba(20,30,50,.30)"); sg.addColorStop(1, "rgba(20,30,50,0)");
    ctx.save(); ctx.translate(x, fy); ctx.scale(1, .26); ctx.translate(-x, -fy);
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, fy, r * 1.5, 0, 6.2832); ctx.fill(); ctx.restore();
  }
  if (o.glow) {
    var hg = ctx.createRadialGradient(x, y, r * .7, x, y, r * (1 + o.glow));
    hg.addColorStop(0, rgba(c3, .5)); hg.addColorStop(1, rgba(c3, 0));
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r * (1 + o.glow), 0, 6.2832); ctx.fill();
  }
  var g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .06, x, y, r);
  g.addColorStop(0, "#ffffff"); g.addColorStop(.32, rgba(c3)); g.addColorStop(1, rgba(dark(c3, o.shade || .55)));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
}
/* 원기둥 받침대: 윗면 가운데 (x, y), 반지름 rw, 높이 h */
function stand(ctx, x, y, rw, h) {
  var g = ctx.createLinearGradient(x - rw, 0, x + rw, 0); g.addColorStop(0, "#3a4150"); g.addColorStop(.45, "#7a8394"); g.addColorStop(1, "#272c36");
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - rw, y); ctx.lineTo(x - rw, y + h); ctx.ellipse(x, y + h, rw, rw * .3, 0, Math.PI, 0, true); ctx.lineTo(x + rw, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#a9b2c2"; ctx.beginPath(); ctx.ellipse(x, y, rw, rw * .3, 0, 0, 6.2832); ctx.fill();
}
function polyP(ctx, pts, fill, stroke, lw) {
  ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function segP(ctx, a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
/* 우주 진열장(아이소메트릭 유리 상자) — 받침대 + 어두운 뒷벽(먼 별) + 바닥 눈금판. 앞 유리는 caseGlass 로 나중에 덮는다 */
function spaceCase(ctx, I, ZT, seed, o) {
  o = o || {};
  var L = I.L, D = I.D, P = I.P, R = SK.rng(seed || 5), k;
  I.box(ctx, -8, -8, -14, L + 8, D + 8, 0, "#2b303c", "#1b1f28", "#12151c");
  var g1 = ctx.createLinearGradient(0, P(0, 0, ZT).y, 0, P(0, D, 0).y); g1.addColorStop(0, "#070a1c"); g1.addColorStop(1, "#141a3a");
  polyP(ctx, [P(0, 0, 0), P(0, D, 0), P(0, D, ZT), P(0, 0, ZT)], g1);
  polyP(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, 0, ZT), P(0, 0, ZT)], g1);
  for (k = 0; k < (o.stars || 60); k++) {
    var a = R(), b = R(), c = R(), p = k % 2 ? P(0, a * D, b * ZT) : P(a * L, 0, b * ZT), z = c > .8 ? 2 : 1.2;
    ctx.fillStyle = "rgba(230,236,255," + (.35 + c * .55).toFixed(2) + ")"; ctx.fillRect(p.x, p.y, z, z);
  }
  polyP(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, D, 0), P(0, D, 0)], o.floor || "#0d1230");
  if (o.grid !== false) {
    var st = o.grid || 25; ctx.strokeStyle = "rgba(140,160,255,.13)"; ctx.lineWidth = 1;
    for (k = st; k < L; k += st) segP(ctx, P(k, 0, 0), P(k, D, 0));
    for (k = st; k < D; k += st) segP(ctx, P(0, k, 0), P(L, k, 0));
  }
}
function caseGlass(ctx, I, ZT) {
  var L = I.L, D = I.D, P = I.P;
  polyP(ctx, [P(0, D, 0), P(L, D, 0), P(L, D, ZT), P(0, D, ZT)], "rgba(200,225,255,.07)");
  polyP(ctx, [P(L, 0, 0), P(L, D, 0), P(L, D, ZT), P(L, 0, ZT)], "rgba(190,215,255,.11)");
  polyP(ctx, [P(0, 0, ZT), P(L, 0, ZT), P(L, D, ZT), P(0, D, ZT)], "rgba(225,238,255,.06)");
  ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; segP(ctx, P(0, 0, 0), P(0, 0, ZT));
  ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.3;
  [[P(0, D, 0), P(0, D, ZT)], [P(L, D, 0), P(L, D, ZT)], [P(L, 0, 0), P(L, 0, ZT)],
   [P(0, 0, ZT), P(L, 0, ZT)], [P(L, 0, ZT), P(L, D, ZT)], [P(L, D, ZT), P(0, D, ZT)], [P(0, D, ZT), P(0, 0, ZT)],
   [P(0, D, 0), P(L, D, 0)], [P(L, D, 0), P(L, 0, 0)]].forEach(function (e) { segP(ctx, e[0], e[1]); });
}
/* 진열장 그림자까지 함께: 스튜디오 판 + 바닥 그림자 */
function caseFloor(I) { var p = I.P(I.L, I.D, -14); return { x: p.x - (I.L + I.D) * I.s * .25, y: p.y - 4, rx: (I.L + I.D) * I.s * .62, ry: 30 }; }
/* 숨은 캔버스: 조작할 때만 바뀌는 부분을 한 번 그려 두고 붙인다 */
function cacheLayer(canvas) {
  var off = null, key = null;
  return function (ctx, k, paintFn) {
    if (!off || key !== k || off.width !== canvas.width) {
      if (!off) off = document.createElement("canvas");
      off.width = canvas.width; off.height = canvas.height;
      var c2 = off.getContext("2d"); c2.setTransform(canvas.width / canvas._w, 0, 0, canvas.height / canvas._h, 0, 0);
      c2.clearRect(0, 0, canvas._w, canvas._h); paintFn(c2); key = k;
    }
    ctx.drawImage(off, 0, 0, canvas._w, canvas._h);
  };
}
/* 카드 안 진행 띠: 찾은 개수 */
function progTip(ctx, n, total, x, y, w, okText, todo) {
  SK.tip(ctx, n >= total ? okText : todo + "  (" + n + " / " + total + ")", x, y, w, n >= total ? true : null);
}
/* 색지수 띠 (파랑 → 빨강) */
function bvStrip(ctx, g, x0, x1, y, h) {
  var gr = ctx.createLinearGradient(g.X(x0), 0, g.X(x1), 0);
  for (var k = 0; k <= 8; k++) gr.addColorStop(k / 8, rgba(bvRGB(x0 + (x1 - x0) * k / 8), .9));
  ctx.fillStyle = gr; ctx.fillRect(g.X(x0), y, g.X(x1) - g.X(x0), h);
}
function lcg(seed) {
  var s = seed;
  return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

/* 표준 주계열 — 질량(태양=1), 색지수 B−V, 절대 등급 M(V) */
var MS = [
  { m: 40, bv: -0.33, mv: -5.7 }, { m: 17, bv: -0.30, mv: -4.0 }, { m: 5.9, bv: -0.17, mv: -1.2 },
  { m: 2.9, bv: 0.00, mv: 0.6 }, { m: 2.0, bv: 0.16, mv: 1.9 }, { m: 1.6, bv: 0.30, mv: 2.7 },
  { m: 1.3, bv: 0.45, mv: 3.5 }, { m: 1.05, bv: 0.57, mv: 4.4 }, { m: 0.92, bv: 0.65, mv: 5.1 },
  { m: 0.79, bv: 0.81, mv: 5.9 }, { m: 0.67, bv: 1.15, mv: 7.35 }, { m: 0.51, bv: 1.40, mv: 8.8 }
];
/* 질량으로 주계열 위의 자리를 찾는다(로그 질량 보간) */
function msAt(mass) {
  var mm = clamp(mass, MS[MS.length - 1].m, MS[0].m);
  for (var i = 0; i < MS.length - 1; i++) {
    if (mm <= MS[i].m && mm >= MS[i + 1].m) {
      var t = (lg(MS[i].m) - lg(mm)) / (lg(MS[i].m) - lg(MS[i + 1].m));
      return { bv: lerp(MS[i].bv, MS[i + 1].bv, t), mv: lerp(MS[i].mv, MS[i + 1].mv, t) };
    }
  }
  return { bv: MS[0].bv, mv: MS[0].mv };
}

/* =========================================================================
   이야기 ① 하늘 한쪽에 몰린 공들
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epA", key: "epA", name: "사건 파일 ①", onDone: finish });

  window.sthGate({
    gate: "a-gate", key: "a-pred", title: "관측 조수의 첫 추리",
    question: "구상 성단이 궁수자리 쪽 하늘에만 몰려 보이는 까닭은 무엇일까요?",
    options: ["㉠ 하늘의 그쪽에서만 구상 성단이 만들어졌다", "㉡ 성단들이 둘러싼 중심이 태양이 아닌 다른 곳에 있다", "㉢ 반대쪽 하늘은 무언가에 가려 보이지 않는다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 C-M도와 주계열 이탈점 ---- */
  (function () {
    var canvas = $("a-c-cmd"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 65, got = window.sthState("aCmd") || { a: false, b: false, c: false };
    function age(i) { return Math.pow(10, 0.042 * i); }                 /* 백만 년 */
    function ageTxt(t) { var y = Math.round(t), e = Math.floor(y / 100), m = (y % 100) * 100; return (e ? e.toLocaleString() + "억 " : "") + (m ? m.toLocaleString() + "만 " : "") + "년"; }
    function turnoff(t) { return Math.pow(10000 / t, 0.4); }            /* 태양질량 */
    var jr = lcg(7788);
    var JIT = [];
    for (var q = 0; q < 60; q++) JIT.push(jr() - 0.5);

    function label(t) {
      if (t < 60) return "아주 젊은 산개 성단";
      if (t < 300) return "플레이아데스 같은 젊은 산개 성단";
      if (t < 2000) return "히아데스 같은 산개 성단";
      if (t < 8000) return "M67 같은 늙은 산개 성단";
      return "M13 같은 구상 성단";
    }
    function dot(c2, x, y, r, bv) {
      c2.fillStyle = rgba(bvRGB(bv)); c2.beginPath(); c2.arc(x, y, r, 0, 6.2832); c2.fill();
      c2.strokeStyle = "rgba(20,30,60,.45)"; c2.lineWidth = 1; c2.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = age(i0), Mto = turnoff(t), to = msAt(Mto);
      var LW = 584;
      var ch = false;
      if (Mto >= 5 && !got.a) { got.a = ch = true; }
      if (Mto >= 1.8 && Mto <= 2.3 && !got.b) { got.b = ch = true; }
      if (Mto <= 1.0 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("aCmd", got); mission(); }
      studio(ctx, 0, 0, LW, H);
      big2(ctx, "나이 " + ageTxt(t), "이탈점 " + Mto.toFixed(2) + " M☉ · " + label(t), 18, 44);
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: -0.4, x1: 1.7, y0: 10, y1: -8, xt: 7, yt: 6, light: true,
        xl: "색지수 B−V  (파랗다 ← → 붉다)", yl: "절대 등급 (위가 밝다)" });
      bvStrip(ctx, g, -0.4, 1.7, g.B - 5, 5);
      SK.plot(ctx, g, MS.map(function (s0) { return [s0.bv, s0.mv]; }), "rgba(20,40,90,.45)", { w: 2, dash: [5, 5], glow: false });
      var jn = 0;
      MS.forEach(function (s0) {
        if (s0.m > 3.2 * Mto) return;                                    /* 이미 일생을 마친 별 */
        var evolved = s0.m > Mto;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 60] * (evolved ? 26 : 13); jn++;
          var dy = JIT[jn % 60] * (evolved ? 22 : 11); jn++;
          var bv = evolved ? 1.28 : s0.bv, mv = evolved ? s0.mv - 2.4 : s0.mv;
          var px = clamp(g.X(bv) + dx, g.L + 3, g.R - 3), py = clamp(g.Y(mv) + dy, g.T + 3, g.B - 8);
          dot(ctx, px, py, evolved ? 4.2 : 3.2, bv);
        }
      });
      if (Mto < 6) SK.pill(ctx, "적색 거성 가지", clamp(g.X(1.28) + 40, g.L, g.R - 60), clamp(g.Y(msAt(Mto).mv - 3.4), g.T + 40, g.B - 20), { s: 11, c: SC.orange, box: [g.L, g.R] });
      var tx = clamp(g.X(to.bv), g.L, g.R), ty = clamp(g.Y(to.mv), g.T, g.B);
      SK.line(ctx, { x: tx, y: g.T }, { x: tx, y: g.B }, LT.yellow, 2.2, [5, 5]);
      ctx.strokeStyle = LT.yellow; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "주계열 이탈점", tx, g.T + 16, { s: 11.5, a: "center", c: SC.yellow, box: [g.L, g.R] });
      SK.pill(ctx, "- - 표준 주계열", g.R - 4, g.B - 16, { s: 10.5, a: "right", c: SC.mute, box: [g.L, g.R] });
      /* 판정 카드 */
      var CX = LW + 10, x0 = CX + 18, CW = W - CX;
      SK.card(ctx, CX, 0, CW, H, "성단의 나이 판정");
      stand(ctx, W - 52, 96, 16, 12);
      orb(ctx, W - 52, 96 - 15, 13, bvRGB(to.bv), { glow: .8 });
      cnote(ctx, "이탈점 별의 색", W - 52, 130, LT.mute, "center");
      cval(ctx, ageTxt(t), x0, 70, LT.ink, 20);
      SK.row(ctx, "이탈점의 질량", Mto.toFixed(2) + " M☉", x0, W - 96, 106, LT.yellow);
      SK.row(ctx, "이탈점 B−V · M", to.bv.toFixed(2) + " · " + to.mv.toFixed(1), x0, W - 96, 130);
      cnote(ctx, "이런 성단", x0, 166);
      cval(ctx, label(t), x0, 188, LT.blue, 14);
      SK.line(ctx, { x: x0, y: 206 }, { x: W - 18, y: 206 }, "rgba(20,40,90,.15)", 1);
      SK.t(ctx, "수명(백만 년) ≈ 10,000 × 질량⁻²·⁵", x0, 232, { s: 12, c: LT.ink, w: "800" });
      cnote(ctx, "무거운 별일수록 먼저 주계열을 떠나므로", x0, 252); cnote(ctx, "이탈점이 내려올수록 늙은 성단", x0, 270);
      [[got.a, "젊은 성단 (이탈점 5 M☉ 이상)"], [got.b, "히아데스 무렵 (약 2 M☉)"], [got.c, "아주 늙은 성단 (1 M☉ 이하)"]].forEach(function (q2, i) {
        SK.t(ctx, (q2[0] ? "✓ " : "○ ") + q2[1], x0, 304 + i * 21, { s: 12, w: "800", c: q2[0] ? LT.green : LT.dim });
      });
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0), 3, x0 - 6, H - 50, CW - 24, "이탈점의 자리 = 성단의 나이", "세 나이의 성단 만들기");
      $("a-cmd-info").innerHTML = "이 성단의 나이가 <b>" + ageTxt(t) +
        "</b>이면, 태양 질량의 <b>" + Mto.toFixed(2) + "배</b>보다 무거운 별은 이미 주계열을 떠났습니다. " +
        (Mto >= 5 ? "이탈점이 아직 파란 쪽 높은 곳에 있습니다 — <b>젊은 성단</b>입니다."
          : (Mto <= 1.0 ? "이탈점이 태양보다 아래까지 내려왔습니다 — <b>아주 늙은 성단</b>이고, 구상 성단이 이렇습니다."
            : "이탈점이 주계열 중간쯤에 있습니다. 이탈점의 자리가 곧 <b>나이</b>입니다."));
    }
    function mission() {
      if (got.a) done("m1-2a"); if (got.b) done("m1-2b"); if (got.c) done("m1-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>이탈점이 <b>위(파란 쪽)</b>에 있을수록 젊은 성단, <b>아래(붉은 쪽)</b>로 내려올수록 늙은 성단입니다. 산개 성단은 대개 수천만~수십억 년, 구상 성단은 <b>100억 년이 넘습니다.</b>");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("a-age").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var t = age(i0);
      $("a-age-val").textContent = ageTxt(t);
      draw();
    });
    (function () { var t = age(i0); $("a-age-val").textContent = ageTxt(t); })();
    draw(); mission();
  })();

  /* ---- 장면3 주계열 맞추기 ---- */
  var CL = [
    { n: "히아데스", mo: 6.40, to: 3.02, note: "가장 가까운 산개 성단", age: "약 6억 년" },
    { n: "플레이아데스", mo: 8.60, to: 6.31, note: "좀생이별이라 불리는 산개 성단", age: "약 1억 년" },
    { n: "M13", mo: 17.20, to: 0.93, note: "헤르쿨레스자리의 구상 성단", age: "약 120억 년" }
  ];
  (function () {
    var canvas = $("a-c-fit"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, i0 = 0, got = window.sthState("aFit") || [false, false, false];
    var REF_BV = 0.35, REF_M = 3.00;
    function dist(i) { return Math.pow(10, 0.04 * i + 1); }
    var jr = lcg(31337), JIT = [];
    for (var q = 0; q < 80; q++) JIT.push(jr() - 0.5);

    var PORT = (function () {
      var out = [], R0, k, a, r;
      R0 = lcg(611); var hy = [];
      for (k = 0; k < 46; k++) { a = R0() * 6.2832; r = Math.pow(R0(), .7) * 100; hy.push([r * Math.cos(a), r * Math.sin(a) * .8, 1 + R0() * 2.2, R0() < .25 ? 1.0 : 0.3 + R0() * .4]); }
      out.push(hy);
      R0 = lcg(733); var pl = [[-30, -22, 4.2], [8, -34, 3.6], [34, -6, 3.8], [-6, 6, 4.6], [22, 26, 3.2], [-44, 18, 3.0], [52, 30, 2.8]].map(function (q) { return [q[0], q[1], q[2], -0.1]; });
      for (k = 0; k < 40; k++) { a = R0() * 6.2832; r = Math.pow(R0(), .6) * 95; pl.push([r * Math.cos(a), r * Math.sin(a) * .85, .8 + R0() * 1.2, 0.0 + R0() * .6]); }
      out.push(pl);
      R0 = lcg(855); var gc = [];
      for (k = 0; k < 420; k++) { a = R0() * 6.2832; r = Math.pow(R0(), 2.2) * 100; gc.push([r * Math.cos(a), r * Math.sin(a), .5 + R0() * .9, R0() < .15 ? 1.3 : 0.6 + R0() * .3]); }
      out.push(gc);
      return out;
    })();
    function dot2(c2, x, y, r, bv) {
      c2.fillStyle = rgba(bvRGB(bv)); c2.beginPath(); c2.arc(x, y, r, 0, 6.2832); c2.fill();
      c2.strokeStyle = "rgba(20,30,60,.45)"; c2.lineWidth = 1; c2.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var C = CL[s], d = dist(i0), mu = 5 * lg(d / 10), muT = C.mo - REF_M;
      var diff = (REF_M + mu) - C.mo;
      var ok = Math.abs(diff) <= 0.06, dTxt = (d < 1000 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc";
      var LW = 540;
      if (ok && !got[s]) { got[s] = true; window.sthState("aFit", got); mission(); }
      studio(ctx, 0, 0, W, H);
      big2(ctx, ok ? C.n + "까지 약 " + (d < 1000 ? Math.round(d) : Math.round(d).toLocaleString()) + " pc" : "표준 주계열을 내려 겹쳐라", "거리 지수 m − M = " + mu.toFixed(2) + " · 놓아 본 거리 " + dTxt, 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: -0.4, x1: 1.7, y0: 24, y1: 0, xt: 7, yt: 4, light: true,
        xl: "색지수 B−V", yl: "겉보기 등급 (위가 밝다)" });
      bvStrip(ctx, g, -0.4, 1.7, g.B - 5, 5);
      var jn = 0;
      MS.forEach(function (st) {
        if (st.m > C.to) return;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 80] * 14; jn++;
          var dy = JIT[jn % 80] * 12; jn++;
          var px = clamp(g.X(st.bv) + dx, g.L + 3, g.R - 3), py = clamp(g.Y(st.mv + muT) + dy, g.T + 3, g.B - 8);
          dot2(ctx, px, py, 3.2, st.bv);
        }
      });
      SK.plot(ctx, g, MS.filter(function (st) { return st.mv >= 0; }).map(function (st) { return [st.bv, st.mv]; }), "rgba(20,40,90,.35)", { w: 1.6, dash: [4, 5], glow: false });
      var seg = [], col = ok ? LT.green : LT.blue;
      MS.forEach(function (st) {
        var yy = st.mv + mu;
        if (yy < -1 || yy > 25) { if (seg.length > 1) SK.plot(ctx, g, seg, col, { w: 3, light: true }); seg = []; return; }
        seg.push([st.bv, clamp(yy, 0, 24)]);
      });
      if (seg.length > 1) SK.plot(ctx, g, seg, col, { w: 3, light: true });
      var ax = g.X(REF_BV), ya = g.Y(REF_M), yb = g.Y(clamp(REF_M + mu, 0, 24));
      if (Math.abs(yb - ya) > 14) {
        SK.arrow(ctx, { x: ax, y: ya }, { x: ax, y: yb }, LT.yellow, 2.4, 9);
        SK.pill(ctx, "거리 지수만큼 내림", ax + 10, (ya + yb) / 2 + 4, { s: 11, c: SC.yellow, box: [g.L, g.R] });
      }
      SK.pill(ctx, "━ 내가 옮긴 표준 주계열", g.R - 4, g.T + 18, { s: 11, a: "right", c: ok ? SC.green : SC.blue, box: [g.L, g.R] });
      SK.pill(ctx, "● 관측된 성단의 별", g.R - 4, g.T + 44, { s: 11, a: "right", c: SC.orange, box: [g.L, g.R] });
      SK.pill(ctx, "┅ 10 pc에 둔 표준 주계열", g.R - 4, g.T + 70, { s: 11, a: "right", c: SC.mute, box: [g.L, g.R] });
      /* 오른쪽 위: 성단 사진(인화지 미니어처) */
      var RX = LW + 12, pcx = RX + (W - RX) / 2 - 6, pcy = 112;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = "#fbfbf7";
      ctx.beginPath(); ctx.roundRect(RX, 12, W - RX - 12, 222, 8); ctx.fill(); ctx.restore();
      SK.stage(ctx, RX + 10, 22, W - RX - 32, 180, "space", { seed: 25 + s, r: 4 });
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 10, 22, W - RX - 32, 180); ctx.clip();
      if (s === 1) { var hz = ctx.createRadialGradient(pcx, pcy, 10, pcx, pcy, 110); hz.addColorStop(0, "rgba(120,170,255,.28)"); hz.addColorStop(1, "rgba(120,170,255,0)"); ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(pcx, pcy, 110, 0, 6.2832); ctx.fill(); }
      if (s === 2) { var cg = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, 66); cg.addColorStop(0, "rgba(255,240,200,.75)"); cg.addColorStop(1, "rgba(255,230,180,0)"); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(pcx, pcy, 66, 0, 6.2832); ctx.fill(); }
      PORT[s].forEach(function (q) { starBV(ctx, pcx + q[0] * .9, pcy + q[1] * .9, q[2], q[3], 3); });
      ctx.restore();
      SK.t(ctx, C.n + " · " + C.note + " · 나이 " + C.age, pcx, 222, { s: 11, a: "center", c: LT.mute, w: "800" });
      /* 판정 카드 */
      var CY = 246, x0 = RX + 16;
      SK.card(ctx, RX, CY, W - RX - 12, H - CY - 8, "판정");
      cval(ctx, ok ? "✓ 관측과 겹칩니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"), x0, CY + 58, ok ? LT.green : LT.red, 17);
      SK.row(ctx, "기준 별(M = +3.00)이 보일 m", (REF_M + mu).toFixed(2), x0, W - 28, CY + 86, LT.blue);
      SK.row(ctx, "관측된 기준 별의 m", C.mo.toFixed(2), x0, W - 28, CY + 108, LT.orange);
      progTip(ctx, (got[0] ? 1 : 0) + (got[1] ? 1 : 0) + (got[2] ? 1 : 0), 3, x0 - 6, CY + 128, W - RX - 40, "세 성단 거리를 모두 쟀습니다", "세 성단 거리 재기");
      $("a-fit-read").innerHTML =
        "<span class='k'>놓아 본 거리</span><span class='v y'>d = " + (d < 1000 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc</span>" +
        "<span class='k'>거리 지수</span><span class='v b'>m − M = " + mu.toFixed(2) + "</span>" +
        "<span class='sub'>= 5 log(d / 10 pc)</span>" +
        "<span class='k'>기준 별이 보일 등급</span><span class='v'>m = " + (REF_M + mu).toFixed(2) + "</span>" +
        "<span class='sub'>관측값 m = " + C.mo.toFixed(2) + "</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "관측값과 겹칩니다 · 이 거리가 답" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다")) + "</span>";
      $("a-fit-info").innerHTML = "성단의 별은 모두 같은 거리에 있으므로, 관측된 주계열은 표준 주계열을 <b>통째로 아래로 내린 모습</b>입니다. 얼마나 내려야 겹치는지가 바로 <b>거리 지수</b>입니다." +
        (ok ? " — <b>" + C.n + " 까지는 약 " + (d < 1000 ? Math.round(d) : Math.round(d).toLocaleString()) + " pc</b>" : "");
    }
    function mission() {
      ["m1-3a", "m1-3b", "m1-3c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>히아데스 약 <b>48 pc</b>, 플레이아데스 약 <b>132 pc</b>, M13 약 <b>6,900 pc</b>. 구상 성단은 산개 성단보다 <b>수십~수백 배 멀리</b> 있습니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    segWire("a-cl", function (b) { s = +b.getAttribute("data-s"); $("a-cl-val").textContent = CL[s].n; draw(); });
    $("a-d").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var d = dist(i0);
      $("a-d-val").textContent = (d < 1000 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc";
      draw();
    });
    draw(); mission();
  })();

  /* ---- 장면4 세페이드 주기-광도 ---- */
  var CEP = [
    { n: "세페이드 가", P: 3.162, i: 25, m: 8.67, where: "가까운 산개 성단 속" },
    { n: "세페이드 나", P: 10.000, i: 50, m: 10.28, where: "궁수자리 쪽 원반 속" },
    { n: "세페이드 다", P: 31.623, i: 75, m: 10.24, where: "궁수자리 쪽 먼 원반 속" }
  ];
  (function () {
    var canvas = $("a-c-cep"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, i0 = 10, got = window.sthState("aCep") || [false, false, false];
    function per(i) { return Math.pow(10, 0.02 * i); }
    function absMag(P) { return -2.81 * lg(P) - 1.43; }
    function phase(u) { return u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75; }

    var cu = 0, cplay = playWire("a-play", !SK.REDUCE, ["맥동 멈추기", "맥동 보기"]);
    function paint() {
      var C = CEP[s], P = per(i0), ok = Math.abs(lg(P / C.P)) < 0.005;
      var M = absMag(C.P), d = Math.pow(10, (C.m - M + 5) / 5);
      var win = 6 * C.P, col = ok ? LT.green : LT.blue, tm = cu * win;
      ctx.clearRect(0, 0, W, H);
      studio(ctx, 0, 0, W, H, { x: 800, y: H - 26, rx: 60, ry: 10 });
      big2(ctx, ok ? C.n + "까지 약 " + Math.round(d).toLocaleString() + " pc" : "내 모형 주기 " + P.toFixed(2) + "일",
        ok ? "M = −2.81 log P − 1.43 = " + M.toFixed(2) : (P < C.P ? "모형이 너무 자주 뜁니다" : "모형이 너무 느리게 뜁니다"), 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      /* 광도곡선 */
      var g = SK.chart(ctx, { x: 8, y: 96, w: 462, h: 226, x0: 0, x1: win, y0: 0, y1: 1, xt: 6, yt: 2, light: true,
        yf: function () { return ""; }, xf: function (q) { return q < 10 ? q.toFixed(1) : String(Math.round(q)); }, xl: "시간(일) →" });
      SK.t(ctx, "밝다", g.L - 6, g.T + 12, { s: 10.5, a: "right", c: LT.mute, w: "800" });
      for (var k = 0; k <= 70; k++) {
        var tt = k / 70 * win, rel = phase((tt / C.P) % 1);
        ctx.fillStyle = "rgba(232,89,12,.85)"; ctx.beginPath(); ctx.arc(g.X(tt), g.Y(0.12 + 0.72 * rel), 2.6, 0, 6.2832); ctx.fill();
      }
      var pts = [];
      for (var j = 0; j <= 400; j++) { var t2 = j / 400 * win; pts.push([t2, 0.12 + 0.72 * phase((t2 / P) % 1)]); }
      SK.plot(ctx, g, pts, col, { w: 2.5, light: true });
      SK.line(ctx, { x: g.X(tm), y: g.T }, { x: g.X(tm), y: g.B }, "rgba(20,40,90,.3)", 1.2, [3, 4]);
      orb(ctx, g.X(tm), g.Y(0.12 + 0.72 * phase((tm / P) % 1)), 5, [255, 214, 140], { glow: .7 });
      var l1 = SK.pill(ctx, "● 관측", g.L + 8, g.T + 18, { s: 11, c: SC.orange });
      SK.pill(ctx, "━ 내 모형", l1.x + l1.w + 8, g.T + 18, { s: 11, c: ok ? SC.green : SC.blue });
      SK.pill(ctx, "광도곡선 — " + win.toFixed(0) + "일 동안", g.R - 4, g.T + 18, { s: 11, a: "right", c: SC.mute, box: [g.L, g.R] });
      /* 주기-광도 관계 */
      var PX0 = 480;
      var h = SK.chart(ctx, { x: PX0, y: 12, w: W - PX0 - 8, h: 310, x0: 0, x1: 2, y0: 0, y1: -7, xt: 2, yt: 7, light: true,
        xf: function (q) { return ["1", "10", "100"][Math.round(q)] || ""; }, xl: "변광 주기(일) →", yl: "절대 등급" });
      var lp = [];
      for (var w2 = 0; w2 <= 100; w2++) { var lq = 2 * w2 / 100; lp.push([lq, absMag(Math.pow(10, lq))]); }
      SK.plot(ctx, h, lp, LT.violet, { w: 3, light: true });
      var qx = h.X(lg(P)), qy = clamp(h.Y(absMag(P)), h.T, h.B);
      if (ok) { SK.line(ctx, { x: qx, y: qy }, { x: h.L, y: qy }, "rgba(15,159,118,.7)", 1.4, [4, 4]); SK.pill(ctx, "M = " + M.toFixed(2), h.L + 8, qy - 10, { s: 11.5, c: SC.green }); }
      orb(ctx, qx, qy, 6, [255, 214, 140], { glow: .8 });
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(qx, qy, 11, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "주기-광도 관계 · 주기가 길수록 더 밝다", h.R - 4, h.B - 14, { s: 11, a: "right", c: SC.violet, box: [h.L, h.R] });
      /* 아래 판정 카드 */
      var CY = 334;
      SK.card(ctx, 8, CY, 700, H - CY - 8, "판정 · " + C.n + " (" + C.where + ")");
      [["관측 겉보기 등급 m", C.m.toFixed(2), LT.orange], ["주기로 구한 절대 등급 M", ok ? M.toFixed(2) : "?", LT.violet], ["거리", ok ? Math.round(d).toLocaleString() + " pc" : "?", LT.green]].forEach(function (q, i) {
        var xx = 26 + i * 150; cnote(ctx, q[0], xx, CY + 54); cval(ctx, q[1], xx, CY + 82, q[2], 18);
      });
      progTip(ctx, (got[0] ? 1 : 0) + (got[1] ? 1 : 0) + (got[2] ? 1 : 0), 3, 478, CY + 46, 216, "세 세페이드의 거리를 모두 앎", "주기 맞히기");
      /* 내 모형 별: 받침대 위에서 뛰는 공 */
      var sx = 800, ph = (tm / P) % 1, rl = phase(ph);
      var rr = 17 * (1 - .12 * Math.cos(2 * Math.PI * ph)), c3 = tRGB(6000 * (1 + .12 * (rl - .5)));
      stand(ctx, sx, H - 44, 18, 14);
      orb(ctx, sx, H - 46 - 22, rr, c3, { glow: .6 + .9 * rl });
      SK.pill(ctx, "내 모형 별", sx, H - 10, { s: 10.5, a: "center", c: SC.mute, box: [716, W] });
    }
    function draw() {
      var C = CEP[s], P = per(i0), ok = Math.abs(lg(P / C.P)) < 0.005;
      var M = absMag(C.P), d = Math.pow(10, (C.m - M + 5) / 5);
      if (ok && !got[s]) { got[s] = true; window.sthState("aCep", got); mission(); }
      paint();
      $("a-cep-info").innerHTML = "세페이드는 스스로 부풀었다 줄어드는 <b>맥동변광성</b>입니다. <b>주기만 재면 절대 등급을 알 수 있으니</b>, 겉보기 등급과 견주어 곧바로 거리가 나옵니다. 성단 하나하나에 자를 대지 않고도 <b>우리은하의 규모</b>를 잴 수 있게 된 것입니다." +
        (ok ? " — <b>" + C.n + " 까지 약 " + Math.round(d).toLocaleString() + " pc</b>" : "");
    }
    function mission() {
      ["m1-4a", "m1-4b", "m1-4c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>약 <b>2,000 pc · 8,000 pc · 15,000 pc</b>. 궁수자리 쪽 성단들은 하나같이 멀었습니다. 주기-광도 관계 하나로 <b>은하의 규모</b>를 재게 된 것입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    SK.animate(canvas, function (dt) { if (cplay.on) { cu = (cu + dt / 6000) % 1; paint(); } });
    segWire("a-cep", function (b) { s = +b.getAttribute("data-s"); $("a-cep-val").textContent = CEP[s].n; draw(); });
    $("a-per").addEventListener("input", function (e) {
      i0 = +e.target.value; $("a-per-val").textContent = per(i0).toFixed(2) + "일"; draw();
    });
    $("a-per-val").textContent = per(i0).toFixed(2) + "일";
    draw(); mission();
  })();

  /* ---- 장면5 구상 성단 분포의 중심 ---- */
  (function () {
    var canvas = $("a-c-cen"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var c0 = 0, pit = 20, got = window.sthState("aCen") || { a: false, b: false };
    var TRUE_C = 8.0;
    /* 구상 성단 34개 — (8, 0) kpc를 중심으로 퍼진 헤일로 */
    var CLU = (function () {
      var rnd = lcg(20180501), out = [], sx = 0, sy = 0;
      for (var k = 0; k < 34; k++) {
        var rr = 15 * Math.pow(rnd(), 0.75), th = rnd() * Math.PI * 2;
        var o = { x: TRUE_C + rr * Math.cos(th), y: rr * Math.sin(th) };
        out.push(o); sx += o.x; sy += o.y;
      }
      var mx = sx / out.length - TRUE_C, my = sy / out.length;
      out.forEach(function (o) { o.x -= mx; o.y -= my; });
      return out;
    })();
    var RMAX = (function () {
      var m = 0;
      CLU.forEach(function (o) { var dx = o.x - TRUE_C, dy = o.y; m = Math.max(m, Math.sqrt(dx * dx + dy * dy)); });
      return m;
    })();

    /* ---- 우주 진열장(아이소메트릭 유리 상자) — 은하 원반은 상자 가운데 높이(z = 0)에 눕힌다 ---- */
    /* 구상 성단의 높이(원반 위·아래)는 그림에만 쓰는 값이다. 헤일로 반지름 안에서 공 모양이 되게 정한다. */
    var CZ = (function () {
      var rnd = lcg(7301), out = [];
      CLU.forEach(function (o) {
        var dx = o.x - TRUE_C, dy = o.y, rr = Math.sqrt(dx * dx + dy * dy), zz = Math.sqrt(Math.max(0, 15.5 * 15.5 - rr * rr));
        out.push((rnd() < 0.5 ? -1 : 1) * Math.max(1.2, zz * (0.2 + 0.75 * rnd())));
      });
      return out;
    })();
    var phase = 0, gplay = playWire("a-cen-play", !SK.REDUCE, ["은하 회전 멈추기", "은하 돌려 보기"]);
    var CS = 0.866, IS = 0.42, OX = 470, OY = 125, BL = 640, ZT = 160, MH = 478;
    var I = SK.iso({ ox: OX, oy: OY, s: IS, L: BL, D: BL });
    function WX(kx) { return (kx + 8) * 20; }            /* 1 kpc = 20 그림 단위(가로) */
    function WY(ky) { return (ky + 16) * 20; }
    function P(kx, ky, kz) { return I.P(WX(kx), WY(ky), kz * 10); }   /* 높이는 1 kpc = 10 (반으로 줄임) */
    function plane(z) { ctx.transform(CS * IS, .5 * IS, -CS * IS, .5 * IS, OX, OY - z * IS); }
    function quad(a, b, c, d) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }
    var BGS = (function () { var r = lcg(99), a = []; for (var i = 0; i < 170; i++) a.push([230 + r() * 480, 50 + r() * 420, r()]); return a; })();
    var ORD = CLU.map(function (o, k) { return k; }).sort(function (a, b) { return (CLU[a].x + CLU[a].y) - (CLU[b].x + CLU[b].y); });

    function paint() {
      ctx.clearRect(0, 0, W, H);
      var skew = TRUE_C - c0, okc = Math.abs(skew) <= 0.5;
      var A = I.P(0, 0, -ZT), B = I.P(BL, 0, -ZT), Cc = I.P(BL, BL, -ZT), Dd = I.P(0, BL, -ZT);
      var A2 = I.P(0, 0, ZT), B2 = I.P(BL, 0, ZT), C2 = I.P(BL, BL, ZT), D2 = I.P(0, BL, ZT);
      SK.studio(ctx, 0, 0, W, MH, { x: Cc.x, y: Cc.y - 34, rx: 300, ry: 54 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, MH, 14); ctx.clip();
      /* 진열장 안쪽: 뒤쪽 세 면을 어두운 우주로 */
      var bg = ctx.createLinearGradient(0, A2.y, 0, Cc.y); bg.addColorStop(0, "#0d1236"); bg.addColorStop(1, "#04061a");
      ctx.fillStyle = bg; quad(A, B, B2, A2); ctx.fill(); quad(A, Dd, D2, A2); ctx.fill(); quad(A, B, Cc, Dd); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.moveTo(A2.x, A2.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(B.x, B.y); ctx.lineTo(Cc.x, Cc.y); ctx.lineTo(Dd.x, Dd.y); ctx.lineTo(D2.x, D2.y); ctx.closePath(); ctx.clip();
      BGS.forEach(function (s) { ctx.fillStyle = "rgba(220,230,255," + (0.18 + 0.5 * s[2]).toFixed(2) + ")"; ctx.fillRect(s[0], s[1], s[2] > .85 ? 1.8 : 1.1, s[2] > .85 ? 1.8 : 1.1); });
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.moveTo(A.x, A.y); ctx.lineTo(Dd.x, Dd.y); ctx.moveTo(A.x, A.y); ctx.lineTo(A2.x, A2.y); ctx.stroke();
      /* 구상 성단 하나: 원반까지 내린 점선 기둥과 빛나는 공 */
      function cluster(k) {
        var o = CLU[k], z = CZ[k], p = P(o.x, o.y, z), q = P(o.x, o.y, 0), up = z > 0;
        ctx.strokeStyle = up ? "rgba(255,226,170,.42)" : "rgba(255,226,170,.22)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
        SK.glow(ctx, p.x, p.y, up ? 2.8 : 2.2, up ? "rgba(255,226,170,.95)" : "rgba(230,200,150,.7)", 3);
      }
      /* 원반 아래의 구상 성단(원반 너머로 비쳐 보임) */
      ORD.forEach(function (k) { if (CZ[k] < 0) cluster(k); });
      /* 은하 원반(z = 0): 내가 놓은 중심을 둘레로 그린다 */
      var cx = WX(c0), cy = WY(0);
      ctx.save(); plane(0);
      ctx.beginPath(); ctx.rect(0, 0, BL, BL); ctx.clip();
      ctx.fillStyle = "rgba(120,140,255,.06)"; ctx.fillRect(0, 0, BL, BL);
      ctx.strokeStyle = "rgba(170,190,255,.18)"; ctx.lineWidth = 2.6;
      for (var g = 0; g <= BL + 1; g += 80) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, BL); ctx.moveTo(0, g); ctx.lineTo(BL, g); ctx.stroke(); }
      var dg = ctx.createRadialGradient(cx, cy, 6, cx, cy, 290);
      dg.addColorStop(0, "rgba(255,225,170,.6)"); dg.addColorStop(.2, "rgba(200,190,255,.22)"); dg.addColorStop(1, "rgba(150,150,255,0)");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, cy, 290, 0, 6.2832); ctx.fill();
      var b = Math.tan(pit * Math.PI / 180);
      for (var arm = 0; arm < 2; arm++) {
        for (var th2 = 0, r = 0.9; th2 < 30 && r <= 12.5; th2 += Math.min(0.1, 0.55 / r)) {            /* 원반 끝(약 12 kpc)까지 */
          r = 0.9 * Math.exp(b * th2);
          var ang = th2 + arm * Math.PI + phase, ax = cx + r * 20 * Math.cos(ang), ay = cy + r * 20 * Math.sin(ang);
          var ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, 24);
          ag.addColorStop(0, "rgba(150,210,255,.34)"); ag.addColorStop(1, "rgba(150,210,255,0)");
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(ax, ay, 24, 0, 6.2832); ctx.fill();
        }
      }
      CLU.forEach(function (o) { ctx.fillStyle = "rgba(255,226,170,.30)"; ctx.beginPath(); ctx.arc(WX(o.x), WY(o.y), 5, 0, 6.2832); ctx.fill(); });
      ctx.strokeStyle = SC.violet; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 6.2832); ctx.stroke();
      /* 궁수자리 방향 화살표 */
      ctx.strokeStyle = "rgba(200,210,255,.7)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(BL - 110, WY(0)); ctx.lineTo(BL - 14, WY(0)); ctx.stroke();
      ctx.fillStyle = "rgba(200,210,255,.85)"; ctx.beginPath(); ctx.moveTo(BL - 2, WY(0)); ctx.lineTo(BL - 26, WY(0) - 13); ctx.lineTo(BL - 26, WY(0) + 13); ctx.closePath(); ctx.fill();
      /* 쏠림 화살표: 내가 놓은 중심 → 성단들이 몰린 쪽 */
      if (!okc) {
        var tx = WX(TRUE_C), dir = skew > 0 ? 1 : -1;
        ctx.strokeStyle = SC.yellow; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx + dir * 26, cy); ctx.lineTo(tx - dir * 24, cy); ctx.stroke();
        ctx.fillStyle = SC.yellow; ctx.beginPath(); ctx.moveTo(tx - dir * 4, cy); ctx.lineTo(tx - dir * 30, cy - 15); ctx.lineTo(tx - dir * 30, cy + 15); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      /* 원반 한가운데 불룩한 부분(팽대부)과 태양 */
      var cp = P(c0, 0, 0); SK.glow(ctx, cp.x, cp.y, 5, "rgba(255,230,190,.9)", 3.6);
      var sp = P(0, 0, 0); SK.sun(ctx, sp.x, sp.y, 4.5);
      /* 원반 위의 구상 성단 */
      ORD.forEach(function (k) { if (CZ[k] >= 0) cluster(k); });
      /* 내가 놓은 중심: 상자를 세로로 꿰뚫는 기둥 */
      var cb = P(c0, 0, -16), ct = P(c0, 0, 16);
      ctx.strokeStyle = SC.violet; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(cb.x, cb.y); ctx.lineTo(ct.x, ct.y); ctx.stroke(); ctx.setLineDash([]);
      /* 앞쪽 유리 면과 모서리 */
      ctx.fillStyle = "rgba(210,230,255,.07)"; quad(Dd, Cc, C2, D2); ctx.fill();
      ctx.fillStyle = "rgba(210,230,255,.04)"; quad(B, Cc, C2, B2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.035)"; quad(A2, B2, C2, D2); ctx.fill();
      var gl = ctx.createLinearGradient(D2.x, D2.y, C2.x, Cc.y); gl.addColorStop(0, "rgba(255,255,255,.10)"); gl.addColorStop(.35, "rgba(255,255,255,0)");
      ctx.fillStyle = gl; quad(Dd, Cc, C2, D2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(A2.x, A2.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(C2.x, C2.y); ctx.lineTo(D2.x, D2.y); ctx.closePath();
      ctx.moveTo(D2.x, D2.y); ctx.lineTo(Dd.x, Dd.y); ctx.lineTo(Cc.x, Cc.y); ctx.lineTo(B.x, B.y); ctx.lineTo(B2.x, B2.y);
      ctx.moveTo(C2.x, C2.y); ctx.lineTo(Cc.x, Cc.y);
      ctx.stroke();
      ctx.restore();
      /* 이름표 */
      var box = [0, W];
      I.label(ctx, WX(0), WY(0), 0, "태양", -54, 40, "#ffd36b", box);
      I.label(ctx, WX(c0), WY(0), 160, "내가 놓은 중심 " + c0.toFixed(1) + " kpc", 36, -24, "#d9c8ff", box);
      var dk = Math.min(c0 + 9, 22);
      I.label(ctx, WX(dk), WY(9), 0, "원반의 나선팔", -60, 42, "#bfe2ff", box);
      I.label(ctx, WX(24), WY(0), 0, "궁수자리 방향", 46, 34, "#e8ecff", box);
      var rk = 0, rx0 = -1;
      CLU.forEach(function (o, k) { var p = P(o.x, o.y, CZ[k]); if (CZ[k] > 0 && p.x > rx0) { rx0 = p.x; rk = k; } });
      var rp = P(CLU[rk].x, CLU[rk].y, CZ[rk]);
      I.label(ctx, WX(CLU[rk].x), WY(CLU[rk].y), CZ[rk] * 10, "구상 성단 (헤일로)", 744 - rp.x, 262 - rp.y, "#ffe2aa", box);
      if (!okc) { var mp = P((c0 + TRUE_C) / 2, 0, 0); SK.pill(ctx, "성단들이 몰린 쪽", mp.x, mp.y + 26, { s: 11, a: "center", c: SC.yellow, box: box }); }
      /* 큰 제목 */
      if (c0 < 0.25) { SK.bigText(ctx, "태양을 중심에 두면", 22, 52, 28, "#ffffff"); SK.bigText(ctx, "공들이 한쪽으로 몰려 있다", 22, 86, 19, "#ffd35a"); }
      else if (okc) { SK.bigText(ctx, "공들이 고르게 둘러쌌다", 22, 52, 28, "#ffd35a"); SK.bigText(ctx, "은하 중심은 태양에서 약 " + c0.toFixed(1) + " kpc", 22, 86, 19, "#ffffff"); }
      else if (skew > 0) { SK.bigText(ctx, "아직 한쪽으로 쏠려 있다", 22, 52, 28, "#ffffff"); SK.bigText(ctx, "중심 후보 " + c0.toFixed(1) + " kpc · 쏠림 " + skew.toFixed(1) + " kpc", 22, 86, 19, "#ffd35a"); }
      else { SK.bigText(ctx, "중심을 너무 멀리 밀었다", 22, 52, 28, "#ffffff"); SK.bigText(ctx, "중심 후보 " + c0.toFixed(1) + " kpc · 반대로 " + (-skew).toFixed(1) + " kpc", 22, 86, 19, "#ff9aac"); }
      SK.warn(ctx, W - 14, 30, "⚠ 별·성단 크기 과장 · 위아래 두께는 반으로 줄임", "right");
      SK.pill(ctx, "● 구상 성단 (원반 위·아래)", 16, MH - 58, { s: 11, c: "#ffe2aa" });
      SK.pill(ctx, "▦ 은하 원반 · 1칸 = 4 kpc", 16, MH - 30, { s: 11, c: "#bfe2ff" });

      /* 아래 — 치우침 읽음판 */
      var y0 = MH + 8, rx = 18;
      SK.stage(ctx, 0, y0, W, H - y0, "night", { seed: 49, title: "내가 놓은 중심에서 본 성단들의 치우침" });
      var bx = rx, bw = 420, by = y0 + 60, mid = bx + bw / 2;
      ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.beginPath(); ctx.roundRect(bx, by, bw, 30, 10); ctx.fill();
      SK.line(ctx, { x: mid, y: by - 6 }, { x: mid, y: by + 36 }, SC.mute, 1.2, [3, 3]);
      var wpx = clamp(skew * 17, -bw / 2 + 4, bw / 2 - 4), bc = okc ? SC.green : SC.red;
      ctx.save(); ctx.shadowColor = bc; ctx.shadowBlur = 10; ctx.fillStyle = bc;
      ctx.beginPath(); ctx.roundRect(wpx < 0 ? mid + wpx : mid, by + 6, Math.max(Math.abs(wpx), 2), 18, 6); ctx.fill(); ctx.restore();
      SK.t(ctx, "0", mid, by + 50, { s: 10.5, c: SC.mute, a: "center", w: "600" });
      SK.t(ctx, Math.abs(skew).toFixed(1) + " kpc " + (okc ? "— 고르게 퍼졌습니다" : (skew > 0 ? "— 성단들이 아직 앞쪽에 쏠려 있습니다" : "— 중심을 너무 멀리 밀었습니다")),
        rx, by + 80, { s: 14, w: "900", c: bc });
      var qx = 470;
      SK.t(ctx, "구상 성단 " + CLU.length + "개 · 헤일로 반지름 약 " + RMAX.toFixed(0) + " kpc", qx, y0 + 62, { s: 13, w: "800" });
      SK.t(ctx, "→ 헤일로 지름 약 " + (RMAX * 2).toFixed(0) + " kpc ≈ " + Math.round(RMAX * 2 * 0.3262) + "만 광년", qx, y0 + 86, { s: 13, w: "800", c: SC.blue });
      SK.t(ctx, "나선팔 피치각 " + pit + "° · " + (pit < 12 ? "촘촘하게 감긴 나선" : (pit > 20 ? "느슨하게 열린 나선" : "우리은하와 비슷하게 감긴 나선(약 12°)")), qx, y0 + 116, { s: 12.5, w: "800", c: SC.ink });
      SK.t(ctx, "산개 성단과 성간 물질은 이 얇은 원반에,", qx, y0 + 148, { s: 12, c: SC.mute, w: "600" });
      SK.t(ctx, "구상 성단은 원반을 감싼 공 모양 헤일로에 있습니다.", qx, y0 + 170, { s: 12, c: SC.mute, w: "600" });
    }

    function draw() {
      paint();
      var skew = TRUE_C - c0;
      if (Math.abs(skew) <= 0.5 && !got.a) { got.a = true; window.sthState("aCen", got); mission(); }
      $("a-cen-info").innerHTML = "성단들이 <b>어느 한 점을 중심으로 고르게</b> 퍼져 있다면, 그 점이 은하의 중심입니다. 태양을 중심에 두면 성단이 한쪽으로 쏠려 보이지만, 중심을 궁수자리 쪽으로 밀수록 쏠림이 줄어듭니다." +
        (got.a ? " <b>태양은 은하 중심에서 약 8 kpc(2만 6천 광년) 떨어진 변두리에 있습니다.</b>" : "");
    }
    SK.animate(canvas, function (dt) { if (gplay.on) { phase -= dt / 1000 * 0.16; paint(); } }, 24);
    function mission() {
      if (got.a) done("m1-5a"); if (got.b) done("m1-5b");
      if (got.a && got.b) {
        window.sthMission("m1-5", true, "<span class='m-tag'>미션 완료</span>중심은 태양이 아니라 <b>궁수자리 방향 약 8 kpc</b> 떨어진 곳이었습니다. 우리은하는 지름 약 10만 광년의 원반과 그것을 감싼 헤일로로 이루어져 있고, <b>태양계는 변두리</b>에 있습니다.");
        ep.clear(4); ep.clear(5);
      }
    }
    canvas._redraw = draw;
    $("a-cen").addEventListener("input", function (e) { c0 = +e.target.value; $("a-cen-val").textContent = c0.toFixed(1) + " kpc"; draw(); });
    $("a-pit").addEventListener("input", function (e) { pit = +e.target.value; $("a-pit-val").textContent = pit + "°"; draw(); });
    draw();

    window.sthSort({
      mount: "a-sort",
      buckets: [
        { id: "bu", label: "팽대부", sub: "중심의 불룩한 부분" },
        { id: "di", label: "원반 (나선팔)", sub: "얇고 넓적한 부분" },
        { id: "ha", label: "헤일로", sub: "원반을 감싼 공 모양" }
      ],
      items: [
        { t: "구상 성단", a: "ha", why: "늙은 별들의 공 모양 무리로, 헤일로에 널리 퍼져 있습니다." },
        { t: "산개 성단", a: "di", why: "젊은 별들의 무리라 별이 태어나는 원반의 나선팔에 있습니다." },
        { t: "성간 가스와 티끌", a: "di", why: "별의 재료는 얇은 원반에 모여 있습니다.", hint: "은하수 띠가 왜 좁고 긴 띠로 보일까요?" },
        { t: "푸르고 젊은 별", a: "di", why: "갓 태어난 별이라 별이 만들어지는 원반에 있습니다." },
        { t: "태양계 (중심에서 약 8 kpc)", a: "di", why: "태양계는 원반 속 나선팔 가까이에 있습니다." },
        { t: "거문고자리 RR형 변광성", a: "ha", why: "늙은 별이라 구상 성단과 헤일로에서 많이 발견됩니다.", hint: "늙은 별들이 있는 곳은 어디일까요?" },
        { t: "늙고 붉은 별이 빽빽이 모인 중심부", a: "bu", why: "은하 중심의 불룩한 부분입니다." },
        { t: "은하 중심을 가로지르는 막대 구조", a: "bu", why: "우리은하는 중심에 막대가 있는 막대 나선 은하입니다." }
      ],
      onDone: function () { got.b = true; window.sthState("aCen", got); mission(); }
    });
    mission();
  })();

  function finish() { window.sthState("r1", "해결 · 은하 중심은 궁수자리 방향 약 8 kpc, 태양은 변두리"); }
  function vsA() {
    var p = window.sthState("a-pred") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 쏠려 보인 것은 우리가 중심에 있지 않았기 때문입니다."
        : "재어 보니 성단들은 어느 한 점을 둘러싸고 고르게 퍼져 있었습니다. 그 점이 태양이 아니었을 뿐입니다.");
  }
  vsA();
  ep.onShow(vsA);
  window.sthWork({
    mount: "wkA", unitLabel: "[행성우주과학 Ⅱ-2] 이야기 ① 하늘 한쪽에 몰린 공들",
    items: [
      { id: "a1", label: "C-M도가 알려 주는 두 가지", hint: "같은 C-M도 한 장에서 성단의 <b>나이</b>와 <b>거리</b>를 각각 어떻게 읽어 내는지 나누어 쓰세요." },
      { id: "a2", label: "섀플리의 추리 되짚기", hint: "‘구상 성단이 한쪽에 몰려 보인다’는 관측 하나에서 ‘태양은 은하 중심이 아니다’라는 결론까지 가는 과정을 순서대로 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 사라진 빛
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epB", key: "epB", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "b-gate", key: "b-pred", title: "관측 조수의 첫 추리",
    question: "밝기로 구한 거리를 쓰면 먼 성단일수록 지름이 커집니다. 무엇이 잘못된 걸까요?",
    options: ["㉠ 먼 곳에는 실제로 큰 성단만 있다", "㉡ 별빛이 오는 길에 어두워져, 거리를 실제보다 멀게 계산했다", "㉢ 각지름을 잘못 쟀다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 트럼플러의 두 자 ---- */
  var RAD = 3437.75, A_TRUE = 0.7, D_TRUE = 4.0;
  var TCL = (function () {
    var out = [];
    [500, 1000, 2000, 3000].forEach(function (d) {
      out.push({ d: d, th: D_TRUE / d * RAD, dp: d * Math.pow(10, A_TRUE * (d / 1000) / 5) });
    });
    return out;
  })();
  function deRedden(dp, a) {
    if (a <= 0) return dp;
    var lo = 0.5, hi = dp;
    for (var k = 0; k < 50; k++) {
      var mid = (lo + hi) / 2;
      if (mid - dp * Math.pow(10, -a * mid / 5000) < 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  (function () {
    var canvas = $("b-c-tru"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var a0 = 0, got = window.sthState("bTru") || { a: false, b: false };

    var CLD = (function () { var R0 = lcg(4321), o = []; for (var k = 0; k < 26; k++) { var a = R0() * 6.2832, r = Math.pow(R0(), .8); o.push([r * Math.cos(a), r * Math.sin(a), R0()]); } return o; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var ds = [], Ds = [];
      TCL.forEach(function (c) { var d = deRedden(c.dp, a0); ds.push(d); Ds.push(c.th * d / RAD); });
      var mx = Math.max.apply(null, Ds), mn = Math.min.apply(null, Ds), ratio = mx / mn;
      var ok = ratio <= 1.06, col = ok ? LT.green : LT.red;
      if (ok && !got.a) { got.a = true; window.sthState("bTru", got); mission(); }
      var LW = 470;
      studio(ctx, 0, 0, LW, H);
      big2(ctx, "소광량 " + a0.toFixed(2) + " 등급/kpc", ok ? "네 성단의 지름이 거의 같아졌습니다" : (a0 === 0 ? "먼 성단일수록 지름이 커집니다" : "아직 기울기가 남아 있습니다"), 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 128, x0: 0, x1: 8, y0: 0, y1: 12, xt: 4, yt: 3, light: true, xl: "거리 (kpc) →", yl: "계산된 지름 (pc)" });
      var pts = ds.map(function (d, k) { return [clamp(d / 1000, 0, 8), clamp(Ds[k], 0, 12)]; });
      SK.plot(ctx, g, pts, col, { w: 2.8, light: true });
      pts.forEach(function (p) { orb(ctx, g.X(p[0]), g.Y(p[1]), 6, ok ? [15, 159, 118] : [224, 49, 49]); });
      SK.pill(ctx, ok ? "기울기가 사라졌습니다" : "먼 성단일수록 커집니다", g.L + 10, g.T + 18, { s: 11.5, c: ok ? SC.green : SC.red });
      SK.t(ctx, "보정 전 거리 = 보정 후 거리 × 10^(소광량 × 거리 ÷ 5)", 18, H - 10, { s: 11, c: LT.mute, w: "700" });
      /* 오른쪽 흰 카드: 성단별 결과 */
      var CX = LW + 10, rx = CX + 16;
      SK.card(ctx, CX, 0, W - CX, H, "성단별 계산 결과");
      cnote(ctx, "하늘에서 본 크기", rx, 60); cnote(ctx, "보정한 거리", rx + 124, 60); cnote(ctx, "지름", rx + 214, 60);
      TCL.forEach(function (c, k) {
        var yy = 104 + k * 52, ix = rx + 22, rad = Math.max(6, c.th * .8);
        /* 망원경 사진 한 조각(어두운 원판) 속의 성단 */
        ctx.save(); ctx.fillStyle = "#0d1230"; ctx.beginPath(); ctx.arc(ix, yy - 5, 21, 0, 6.2832); ctx.fill(); ctx.clip();
        var hz = ctx.createRadialGradient(ix, yy - 5, 0, ix, yy - 5, rad + 4); hz.addColorStop(0, "rgba(200,215,255,.4)"); hz.addColorStop(1, "rgba(200,215,255,0)");
        ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(ix, yy - 5, rad + 4, 0, 6.2832); ctx.fill();
        CLD.forEach(function (q) { SK.glow(ctx, ix + q[0] * rad * .8, yy - 5 + q[1] * rad * .8, .6 + q[2] * .5, "rgba(225,232,255,.95)", 2.4); });
        ctx.restore();
        SK.t(ctx, c.th.toFixed(1) + "′", rx + 54, yy, { s: 12.5, w: "900", c: LT.ink });
        SK.t(ctx, Math.round(ds[k]).toLocaleString() + " pc", rx + 124, yy, { s: 12.5, w: "800", c: LT.ink });
        var bl = clamp(Ds[k] * 9, 2, 100), bx = rx + 214;
        ctx.fillStyle = ok ? LT.green : LT.blue; ctx.beginPath(); ctx.roundRect(bx, yy - 12, bl, 13, 6); ctx.fill();
        SK.t(ctx, Ds[k].toFixed(2) + " pc", bx + bl + 6, yy, { s: 11.5, w: "900", c: LT.ink });
      });
      SK.line(ctx, { x: rx, y: 318 }, { x: W - 16, y: 318 }, "rgba(20,40,90,.15)", 1);
      cval(ctx, "가장 큰 ÷ 가장 작은 지름 = " + ratio.toFixed(2) + " 배", rx, 346, col, 15);
      SK.tip(ctx, ok ? "✓ 네 성단의 지름이 거의 같아졌습니다" : "아직 어긋납니다 (1.06배 안쪽이면 합격)", rx - 4, 360, W - rx - 14, ok ? true : null);
      cnote(ctx, "멀수록 하늘에서 작게 보입니다", rx, H - 14);
      $("b-tru-info").innerHTML = "별빛이 1 kpc를 지날 때마다 <b>" + a0.toFixed(2) + "등급</b>씩 깎인다고 보고 거리를 다시 계산했습니다. " +
        (a0 === 0 ? "소광을 넣지 않으면 먼 성단일수록 지름이 걷잡을 수 없이 커집니다."
          : (ok ? "네 성단의 지름이 <b>약 4 pc</b>로 거의 같아졌습니다. 성단의 크기가 비슷하다는 상식과 맞습니다."
            : "아직 기울기가 남아 있습니다. 너무 적게 넣으면 먼 성단이 크게, 너무 많이 넣으면 먼 성단이 작게 나옵니다."));
    }
    function mission() {
      if (got.a) done("m2-2a"); if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>1 kpc마다 약 <b>0.7등급</b>. 별빛은 오는 길에 <b>깎이고 있었습니다.</b> 그것을 몰랐기에 모든 거리가 실제보다 멀게 나왔던 것입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-ext").addEventListener("input", function (e) {
      a0 = +e.target.value; $("b-ext-val").textContent = a0.toFixed(2) + " 등급/kpc"; draw();
    });
    draw();

    window.sthPick({
      mount: "b-q1",
      q: "섀플리는 1918년에 우리은하의 지름을 약 30만 광년으로 내놓았습니다. 오늘날 값(약 10만 광년)보다 세 배나 큽니다. 무엇이 그를 헤매게 했을까요?",
      options: ["성간 소광을 몰라, 성단들이 실제보다 멀리 있다고 계산했다", "망원경이 작아 성단을 많이 놓쳤다", "변광성의 주기를 잘못 쟀다", "구상 성단이 사실은 은하 바깥에 있었다"],
      answer: 0,
      why: [
        "맞습니다. 성단의 별빛이 티끌에 깎여 어둡게 보였는데 그만큼을 보정하지 않았으니, 거리가 과대평가되고 은하도 커졌습니다.",
        "성단을 놓치면 은하가 작게 보이지 크게 보이지는 않습니다.",
        "주기 측정은 비교적 정확했습니다. 문제는 겉보기 등급 쪽이었습니다.",
        "구상 성단은 우리은하의 헤일로에 속합니다. 섀플리 자신이 그것을 보인 사람입니다."
      ],
      onDone: function () { got.b = true; window.sthState("bTru", got); mission(); }
    });
    mission();
  })();

  /* ---- 장면3 성간 적색화와 색초과 ---- */
  var RED = [
    { n: "별 가 (B0형)", bv0: -0.30, bvo: 0.40, E: 0.70, M: -4.0, m: 11.50 },
    { n: "별 나 (A0형)", bv0: 0.00, bvo: 0.35, E: 0.35, M: 0.6, m: 10.00 }
  ];
  /* 소광 곡선 A(λ)/A(V) — 관측에 바탕을 둔 값 */
  var EXT = [[365, 1.53], [440, 1.32], [550, 1.00], [700, 0.75], [900, 0.59], [1250, 0.29], [2200, 0.11]];
  function bvColor(bv) {
    var t = clamp((bv + 0.4) / 2.0, 0, 1), r, g, b;
    if (t < 0.5) { var u = t / 0.5; r = lerp(150, 255, u); g = lerp(185, 248, u); b = lerp(255, 240, u); }
    else { var w = (t - 0.5) / 0.5; r = lerp(255, 255, w); g = lerp(248, 160, w); b = lerp(240, 100, w); }
    return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
  }
  (function () {
    var canvas = $("b-c-red"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, e0 = 0, got = window.sthState("bRed") || [false, false];

    var DUST = (function () { var R0 = lcg(2468), o = []; for (var k = 0; k < 22; k++) o.push([(R0() - .5) * 60, (R0() - .5) * 70, 12 + R0() * 16]); return o; })();
    var ID = SK.iso({ ox: 690, oy: 116, s: .55, L: 56, D: 170 });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var S = RED[s], ok = Math.abs(e0 - S.E) <= 0.005;
      var Av = 3.1 * e0, bvTry = S.bv0 + e0;
      var d0 = Math.pow(10, (S.m - S.M + 5) / 5);
      var dC = Math.pow(10, (S.m - Av - S.M + 5) / 5);
      if (ok && !got[s]) { got[s] = true; window.sthState("bRed", got); mission(); }
      var LW = 440;
      studio(ctx, 0, 0, W, H, { x: 660, y: 214, rx: 210, ry: 22 });
      big2(ctx, "색초과 E(B−V) = " + e0.toFixed(2), ok ? "참거리 " + Math.round(dC).toLocaleString() + " pc (보정 전 " + Math.round(d0).toLocaleString() + ")" : (bvTry < S.bvo ? "아직 덜 붉습니다" : "너무 붉게 만들었습니다"), 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      /* 왼쪽 소광 곡선 */
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 128, x0: lg(330), x1: lg(2500), y0: 0, y1: 1.8, xt: 4, yt: 3, light: true,
        xf: function () { return ""; }, yf: function (q) { return q.toFixed(1); }, yl: "깎이는 정도 (V = 1)" });
      var wb = ctx.createLinearGradient(g.L, 0, g.R, 0);
      [[330, "#5a2bb0"], [440, "#2f6bff"], [550, "#3fe07a"], [650, "#ff4a3a"], [900, "#6a1a20"], [2500, "#2a0c14"]].forEach(function (q) { wb.addColorStop((lg(q[0]) - lg(330)) / (lg(2500) - lg(330)), q[1]); });
      ctx.globalAlpha = .85; ctx.fillStyle = wb; ctx.fillRect(g.L, g.B + 2, g.R - g.L, 6); ctx.globalAlpha = 1;
      [[365, "U"], [440, "B"], [550, "V"], [700, "R"], [1250, "J"], [2200, "K"]].forEach(function (q) { SK.t(ctx, q[1], g.X(lg(q[0])), g.B + 22, { s: 11, a: "center", c: LT.mute, w: "900" }); });
      SK.t(ctx, "짧은 파장(파랑) ← → 긴 파장(빨강)", (g.L + g.R) / 2, H - 10, { s: 11, a: "center", c: LT.mute, w: "700" });
      SK.plot(ctx, g, EXT.map(function (q) { return [lg(q[0]), q[1]]; }), LT.violet, { w: 3, light: true });
      var pB = { x: g.X(lg(440)), y: g.Y(1.32) }, pV = { x: g.X(lg(550)), y: g.Y(1.00) };
      SK.line(ctx, { x: pB.x, y: pV.y }, pB, LT.yellow, 2.4);
      SK.line(ctx, { x: pB.x - 5, y: pV.y }, { x: pV.x, y: pV.y }, "rgba(245,159,0,.6)", 1.2, [3, 3]);
      orb(ctx, pB.x, pB.y, 6, [60, 120, 240]); orb(ctx, pV.x, pV.y, 6, [40, 190, 100]);
      SK.pill(ctx, "색초과", pB.x + 10, (pB.y + pV.y) / 2 + 2, { s: 11, c: SC.yellow, box: [g.L, g.R] });
      SK.pill(ctx, "파란빛이 훨씬 많이 깎입니다", g.R - 4, g.T + 18, { s: 11.5, a: "right", c: SC.violet, box: [g.L, g.R] });
      SK.t(ctx, "A(B) − A(V) = 색초과 E(B−V)", g.R - 4, g.T + 46, { s: 11, a: "right", c: LT.mute, w: "800" });
      /* 오른쪽 위: 별빛이 티끌 구름(블록)을 지나간다 */
      var I = ID, P = I.P, c0 = bvRGB(S.bv0), c1 = bvRGB(bvTry), dust = clamp(e0 / 1.0, 0, 1);
      var sx = 492, sy = 128, ex = 862, ey = 128;
      var beam1 = ctx.createLinearGradient(sx, 0, 640, 0); beam1.addColorStop(0, rgba(c0, .75)); beam1.addColorStop(1, rgba(c0, .45));
      ctx.fillStyle = beam1; ctx.beginPath(); ctx.moveTo(sx, sy - 7); ctx.lineTo(650, sy - 9); ctx.lineTo(650, sy + 9); ctx.lineTo(sx, sy + 7); ctx.closePath(); ctx.fill();
      I.box(ctx, 0, 0, 0, I.L, I.D, 120, "rgba(150,110,80," + (.18 + .5 * dust).toFixed(2) + ")", "rgba(120,85,60," + (.22 + .55 * dust).toFixed(2) + ")", "rgba(90,62,44," + (.26 + .55 * dust).toFixed(2) + ")");
      I.face(ctx, "front", function (Lw) { var Rd = SK.rng(29); for (var i = 0; i < 60 + 160 * dust; i++) { ctx.fillStyle = "rgba(60,40,25,.55)"; ctx.fillRect(Rd() * Lw, Rd() * 118, 1.6, 1.6); } });
      I.face(ctx, "right", function (Lw) { var Rd = SK.rng(31); for (var i = 0; i < 80 + 200 * dust; i++) { ctx.fillStyle = "rgba(50,32,20,.55)"; ctx.fillRect(Rd() * Lw, Rd() * 118, 1.6, 1.6); } });
      var dim = clamp(1 - Av / 5, .25, 1);
      var beam2 = ctx.createLinearGradient(700, 0, ex, 0); beam2.addColorStop(0, rgba(c1, .55 * dim)); beam2.addColorStop(1, rgba(c1, .8 * dim));
      ctx.fillStyle = beam2; ctx.beginPath(); ctx.moveTo(712, sy - 6); ctx.lineTo(ex - 18, sy - 5); ctx.lineTo(ex - 18, sy + 5); ctx.lineTo(712, sy + 6); ctx.closePath(); ctx.fill();
      orb(ctx, sx, sy, 20, c0, { glow: 1.2, floor: 210 });
      /* 관측자 망원경 미니어처 */
      var tg = ctx.createLinearGradient(0, ey - 10, 0, ey + 10); tg.addColorStop(0, "#f2f5fa"); tg.addColorStop(.5, "#9aa5bd"); tg.addColorStop(1, "#4a5370");
      ctx.strokeStyle = "#4a5370"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(872, ey + 8); ctx.lineTo(858, ey + 62); ctx.moveTo(872, ey + 8); ctx.lineTo(886, ey + 62); ctx.stroke();
      ctx.save(); ctx.translate(872, ey); ctx.rotate(0.08); ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(-20, -9, 40, 18, 4); ctx.fill();
      ctx.fillStyle = "#2a3150"; ctx.beginPath(); ctx.roundRect(-26, -12, 9, 24, 3); ctx.fill(); ctx.restore();
      SK.pill(ctx, "별 (원래 색)", sx, 182, { s: 11, a: "center", c: SC.ink, box: [448, W] });
      I.label(ctx, I.L * .5, 0, 116, "티끌 구름", 44, -18, "#f0d9b8", [448, W]);
      SK.pill(ctx, "관측자", 872, 206, { s: 11, a: "center", c: SC.ink, box: [448, W] });
      /* 아래 판정 카드 */
      var CX = LW + 8, CY = 236, x0 = CX + 18;
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, S.n + " 의 색 견주기");
      [{ t: "원래 색 (스펙트럼형)", bv: S.bv0 }, { t: "티끌을 지난 내 모형", bv: bvTry }, { t: "관측된 색", bv: S.bvo }].forEach(function (o, k) {
        var x = CX + 74 + k * 148;
        orb(ctx, x, CY + 52, 14, bvRGB(o.bv));
        SK.t(ctx, o.t, x, CY + 84, { s: 11, a: "center", c: LT.mute, w: "800" });
        SK.t(ctx, "B−V " + (o.bv >= 0 ? "+" : "") + o.bv.toFixed(2), x, CY + 101, { s: 12.5, a: "center", w: "900", c: LT.ink });
      });
      SK.line(ctx, { x: x0, y: CY + 112 }, { x: W - 26, y: CY + 112 }, "rgba(20,40,90,.15)", 1);
      if (ok) {
        SK.row(ctx, "소광량 A(V) = 3.1 × E(B−V)", Av.toFixed(2) + " 등급", x0, W - 26, CY + 134, LT.violet);
        SK.row(ctx, "보정 전 → 보정 후 거리", Math.round(d0).toLocaleString() + " → " + Math.round(dC).toLocaleString() + " pc", x0, W - 26, CY + 154, LT.green);
      } else {
        cnote(ctx, "관측 자료 : 겉보기 등급 m = " + S.m.toFixed(2) + ", 절대 등급 M = " + S.M.toFixed(1), x0, CY + 134);
        cnote(ctx, "색을 맞히면 소광량과 참거리가 나옵니다", x0, CY + 152);
      }
      SK.tip(ctx, ok ? "✓ 관측된 색과 맞습니다 · 보정 안 하면 " + (d0 / dC).toFixed(1) + "배 멀게" : (bvTry < S.bvo ? "아직 덜 붉습니다" : "너무 붉게 만들었습니다") + "  (" + ((got[0] ? 1 : 0) + (got[1] ? 1 : 0)) + " / 2)", x0 - 6, CY + 162, W - CX - 32, ok ? true : false);
      $("b-red-info").innerHTML = "스펙트럼형을 보면 그 별이 <b>원래 어떤 색</b>이어야 하는지 알 수 있습니다. 관측된 색이 그보다 붉다면, 그 차이가 티끌이 만든 <b>색초과 E(B−V)</b>입니다. 관측에서 소광량은 색초과의 약 <b>3.1배</b>로 알려져 있어, 색만 재면 얼마나 어두워졌는지도 알 수 있습니다.";
    }
    function mission() {
      ["m2-3a", "m2-3b"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1]) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>티끌은 별빛을 <b>어둡게</b> 하면서 동시에 <b>붉게</b> 만듭니다. 색초과를 재면 소광량을 알 수 있고, 그래야 참거리가 나옵니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    segWire("b-star", function (b) { s = +b.getAttribute("data-s"); $("b-star-val").textContent = RED[s].n; draw(); });
    $("b-e").addEventListener("input", function (e) { e0 = +e.target.value; $("b-e-val").textContent = e0.toFixed(2); draw(); });
    draw(); mission();
  })();

  /* ---- 장면4 성운의 세 얼굴 ---- */
  (function () {
    var canvas = $("b-c-neb"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 62, got = window.sthState("bNeb") || { a: false, b: false, c: false };
    function temp(i) { return 2500 * Math.pow(10, 0.012553 * i); }
    function ionFrac(T) {
      var x0 = 1.4388e7 / (91.2 * T);
      if (x0 > 60) return 0;
      var n = 240, hi = x0 + 45, h = (hi - x0) / n, s = 0;
      for (var k = 0; k <= n; k++) {
        var x = x0 + k * h, f = x * x * x / (Math.exp(x) - 1);
        s += (k === 0 || k === n) ? f / 2 : f;
      }
      return s * h / (Math.pow(Math.PI, 4) / 15);
    }
    var bg = (function () { var r = lcg(909), o = []; for (var k = 0; k < 70; k++) o.push([r(), r()]); return o; })();

    var NB = (function () { var r = lcg(5150), o = []; for (var k = 0; k < 30; k++) o.push([(r() - .5) * 200, (r() - .5) * 150, 20 + r() * 40, r()]); return o; })();
    var DK = (function () { var r = lcg(6161), o = []; for (var k = 0; k < 16; k++) o.push([(r() - .5) * 120, (r() - .5) * 60, 22 + r() * 22]); return o; })();
    var IN = SK.iso({ ox: 330, oy: 196, s: .6, L: 300, D: 210 }), NZ = 190;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var T = temp(i0), f = ionFrac(T), lam = 2.898e6 / T;
      var emit = T >= 25000, refl = T <= 12000;
      var ch = false;
      if (emit && !got.a) { got.a = ch = true; }
      if (refl && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("bNeb", got); mission(); }
      var LW = 560, I = IN, P = I.P, Ln = I.L, Dn = I.D;
      var kindTxt = emit ? "방출성운" : (refl ? "반사성운" : "아직 어느 쪽도 아닙니다");
      studio(ctx, 0, 0, LW, H, caseFloor(I));
      big2(ctx, kindTxt, "곁에 있는 별 " + Math.round(T).toLocaleString() + " K", 18, 44, emit ? "#ffd0d8" : (refl ? "#d6e6ff" : "#ffffff"), "#ffd35a");
      /* 우주 진열장 속 성운 */
      spaceCase(ctx, I, NZ, 63, { grid: 30 });
      var sil = [P(0, Dn, 0), P(Ln, Dn, 0), P(Ln, 0, 0), P(Ln, 0, NZ), P(0, 0, NZ), P(0, Dn, NZ)];
      ctx.save(); polyP(ctx, sil); ctx.clip();
      bg.forEach(function (q, k) { var p = P(q[0] * Ln, q[1] * Dn, ((k * 0.618) % 1) * NZ); SK.glow(ctx, p.x, p.y, 1.2, "rgba(225,232,255,.9)", 3); });
      var NC = P(150, 100, 100), gx = NC.x, gy = NC.y, nc = emit ? [255, 80, 120] : (refl ? [110, 160, 255] : [150, 150, 170]), na = emit ? .34 : (refl ? .26 : .09);
      NB.forEach(function (q) {
        var x = gx + q[0] * .62, y = gy + q[1] * .55, rr = q[2] * .7, ng = ctx.createRadialGradient(x, y, 0, x, y, rr);
        ng.addColorStop(0, rgba(nc, na * (.6 + q[3] * .6))); ng.addColorStop(1, rgba(nc, 0));
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      });
      var core = ctx.createRadialGradient(gx - 18, gy - 8, 0, gx - 18, gy - 8, 74);
      core.addColorStop(0, rgba(nc, na * 1.6)); core.addColorStop(1, rgba(nc, 0));
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(gx - 18, gy - 8, 74, 0, 6.2832); ctx.fill();
      var SP = P(130, 92, 108), sx = SP.x, sy = SP.y;
      if (emit) {
        ctx.strokeStyle = "rgba(190,150,255,.75)"; ctx.lineWidth = 1.5;
        for (var k = 0; k < 12; k++) { var ang = k / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(sx + 16 * Math.cos(ang), sy + 16 * Math.sin(ang)); ctx.lineTo(sx + 34 * Math.cos(ang), sy + 34 * Math.sin(ang)); ctx.stroke(); }
      }
      starT(ctx, sx, sy, 6, T, 4.5); SK.spikes(ctx, sx, sy, 18, .5);
      /* 앞쪽(유리 가까이)의 암흑성운 — 뒤의 별빛을 가린다 */
      var DP = P(60, 186, 56);
      DK.forEach(function (q) {
        var x = DP.x + q[0] * .6, y = DP.y + q[1] * .55, rr = q[2] * .62, dg = ctx.createRadialGradient(x, y, 0, x, y, rr);
        dg.addColorStop(0, "rgba(4,4,12,1)"); dg.addColorStop(.7, "rgba(6,6,16,.92)"); dg.addColorStop(1, "rgba(8,8,20,0)");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      });
      ctx.restore();
      caseGlass(ctx, I, NZ);
      SK.pill(ctx, "별", sx + 14, sy - 12, { s: 11, c: "#fff4d6", box: [0, LW] });
      I.label(ctx, 40, 200, 40, "암흑성운 · 앞에서 별빛을 가린다", -28, 70, "#c9d2f0", [0, LW]);
      SK.pill(ctx, kindTxt, P(Ln, Dn * .3, 0).x + 30, H - 24, { s: 14, a: "center", c: emit ? SC.red : (refl ? SC.blue : SC.mute), box: [0, LW] });
      SK.warn(ctx, LW - 14, 30, "⚠ 성운의 색·크기는 그림으로 꾸밈", "right");
      /* 오른쪽 판정 카드 */
      var CX = LW + 10, x0 = CX + 18, CW = W - CX, fc = f > 0.1 ? LT.red : LT.blue;
      SK.card(ctx, CX, 0, CW, H, "판정");
      cval(ctx, kindTxt, x0, 70, emit ? LT.red : (refl ? LT.blue : LT.dim), kindTxt.length > 5 ? 17 : 24);
      SK.row(ctx, "별의 표면 온도", Math.round(T).toLocaleString() + " K", x0, W - 18, 106);
      SK.row(ctx, "가장 세게 내는 빛의 파장", Math.round(lam) + " nm", x0, W - 18, 132);
      cnote(ctx, "수소를 이온화할 수 있는 자외선의 비율", x0, 166);
      cval(ctx, (f * 100).toFixed(2) + " %", x0, 194, fc, 22);
      SK.bar(ctx, x0, 206, CW - 36, clamp(f * 2, 0, 1), fc);
      cnote(ctx, "파장 91.2 nm보다 짧은 자외선만 수소를 이온화합니다", x0, 238);
      SK.tip(ctx, emit ? "이온화된 수소가 스스로 붉은빛을 냅니다" : (refl ? "티끌이 별빛을 산란시켜 푸르게" : "온도를 더 올리거나 내려 보세요"), x0 - 6, 252, CW - 24, emit || refl ? true : null);
      cnote(ctx, "파란빛이 더 잘 산란되므로 반사성운은 푸릅니다", x0, 304);
      [[got.a, "방출성운 만들기"], [got.b, "반사성운 만들기"], [got.c, "세 성운 나눠 담기"]].forEach(function (q2, i) {
        SK.t(ctx, (q2[0] ? "✓ " : "○ ") + q2[1], x0, 336 + i * 21, { s: 12, w: "800", c: q2[0] ? LT.green : LT.dim });
      });
      $("b-neb-info").innerHTML = "성운의 얼굴을 정하는 것은 <b>곁에 있는 별의 온도</b>입니다. 온도가 2만 5천 K가 넘는 O·B형 별은 수소를 이온화할 만큼 짧은 자외선을 많이 내놓아 성운이 <b>스스로 붉게</b> 빛나게 하고(방출성운), 그보다 차가운 별 곁에서는 티끌이 별빛을 <b>산란</b>시켜 파랗게 보입니다(반사성운). 뒤쪽 별빛을 가리기만 하면 <b>암흑성운</b>입니다.";
    }
    function mission() {
      if (got.a) done("m2-4a"); if (got.b) done("m2-4b"); if (got.c) done("m2-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>같은 성간 물질이라도 <b>곁에 있는 별</b>과 <b>보는 방향</b>에 따라 방출·반사·암흑성운으로 달리 보입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-t").addEventListener("input", function (e) {
      i0 = +e.target.value; $("b-t-val").textContent = Math.round(temp(i0)).toLocaleString() + " K"; draw();
    });
    draw();

    window.sthSort({
      mount: "b-sort",
      buckets: [
        { id: "em", label: "방출성운", sub: "스스로 붉게 빛난다" },
        { id: "re", label: "반사성운", sub: "별빛을 산란시켜 푸르다" },
        { id: "da", label: "암흑성운", sub: "뒤의 별빛을 가린다" }
      ],
      items: [
        { t: "오리온 대성운처럼 붉게 빛난다", a: "em", why: "이온화된 수소가 내는 붉은 방출선 때문입니다." },
        { t: "곁에 있는 O형 별의 자외선이 수소를 이온화했다", a: "em", why: "방출성운이 만들어지는 과정입니다." },
        { t: "성운의 스펙트럼에 밝은 방출선이 줄지어 보인다", a: "em", why: "스스로 빛을 내는 기체의 표시입니다.", hint: "스스로 빛을 내는 기체의 스펙트럼은 어떤 모습일까요?" },
        { t: "플레이아데스 둘레에서 푸르스름하게 비친다", a: "re", why: "티끌이 별빛을 산란시킨 것으로, 하늘이 파란 것과 같은 원리입니다." },
        { t: "성운의 스펙트럼이 곁에 있는 별의 스펙트럼과 똑같다", a: "re", why: "스스로 내는 빛이 아니라 별빛을 되비춘 것이기 때문입니다." },
        { t: "말머리성운처럼 검은 실루엣으로 보인다", a: "da", why: "빽빽한 티끌이 뒤쪽 별빛을 가려 검게 보입니다." }
      ],
      onDone: function () { got.c = true; window.sthState("bNeb", got); mission(); }
    });
    mission();
  })();

  function finish() { window.sthState("r2", "해결 · 성간 소광 0.7등급/kpc, 색초과로 참거리 보정"); }
  function vsB() {
    var p = window.sthState("b-pred") || "";
    $("b-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 틀린 것은 자가 아니라 ‘우주는 비어 있다’는 믿음이었습니다."
        : "각지름은 단순해서 틀릴 여지가 거의 없었습니다. 어긋난 쪽은 밝기로 잰 거리였습니다.");
  }
  vsB();
  ep.onShow(vsB);
  window.sthWork({
    mount: "wkB", unitLabel: "[행성우주과학 Ⅱ-2] 이야기 ② 사라진 빛",
    items: [
      { id: "w2", label: "성간 물질이 있다는 증거", hint: "성간 소광과 적색화를 근거로 쓰세요." },
      { id: "b2", label: "보정하지 않으면 무엇이 틀어지는가", hint: "성간 소광을 넣지 않고 밝기로 거리를 재면 결과가 어느 쪽으로 틀어지는지, 섀플리의 예를 들어 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 보이지 않는 것의 무게
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epC", key: "epC", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "c-gate", key: "c-pred", title: "관측 조수의 첫 추리",
    question: "은하 바깥쪽 별들의 회전 속도는 어떻게 나올까요?",
    options: ["㉠ 바깥 행성처럼 점점 느려진다", "㉡ 바깥에서도 거의 줄지 않고 일정하다", "㉢ 바깥으로 갈수록 오히려 빨라진다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 회전 곡선 모형 (장면3·4 공용) ---- */
  var KV = 207.4, RC = 4, VH_TRUE = 190;
  function Mvis(r) { return 6.0 * (1 - Math.exp(-r / 3) * (1 + r / 3)); }     /* 10^10 M☉ */
  function vvis(r) { return KV * Math.sqrt(Mvis(r) / r); }
  function vhalo(r, Vh) { return Vh * r / Math.sqrt(r * r + RC * RC); }
  function vtot(r, Vh) { var a = vvis(r), b = vhalo(r, Vh); return Math.sqrt(a * a + b * b); }
  var RS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  var JIT = [-2.1, 2.6, -1.4, 2.2, -2.7, 1.5, 2.8, -1.9, 1.2, -2.4];
  var OBS = RS.map(function (r, i) { return vtot(r, VH_TRUE) + JIT[i]; });

  /* ---- 장면2 케플러 회전 ---- */
  var PL = [
    { n: "지구", a: 1.00, c: "--brand" },
    { n: "목성", a: 5.20, c: "--amber" },
    { n: "해왕성", a: 30.07, c: "--violet" }
  ];
  (function () {
    var canvas = $("c-c-kep"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, vv = 0, got = window.sthState("cKep") || [false, false, false];
    function target(P) { return 29.78 / Math.sqrt(P.a); }

    var ANG = [0.4, 2.2, 4.1], kplay = playWire("c-kplay", !SK.REDUCE, ["공전 멈추기", "공전 돌리기"]);
    var PCOL = [null, ["#e9c9a0", "#6b4a2a"], ["#9fc6ff", "#1f3f8f"]], PUI = [SC.blue, SC.orange, SC.violet];
    var LTP = [LT.blue, LT.orange, LT.violet];
    function paint() {
      var P = PL[s], tv = target(P), ok = Math.abs(vv - tv) <= 0.15, n = (got[0] ? 1 : 0) + (got[1] ? 1 : 0) + (got[2] ? 1 : 0);
      ctx.clearRect(0, 0, W, H);
      var LW = 440, cx = 222, cy = 268, prx = 200, pry = 92;
      studio(ctx, 0, 0, LW, H, { x: cx, y: cy + 108, rx: 205, ry: 22 });
      big2(ctx, P.n + " · 태양에서 " + P.a.toFixed(2) + " AU", ok ? "공전 속도 " + tv.toFixed(1) + " km/s ✓" : "질량이 가운데 몰리면 바깥은 느리다", 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      SK.warn(ctx, LW - 14, 116, "⚠ 궤도 크기는 실제 비율이 아님", "right");
      /* 태양계 미니어처 판(오러리) */
      ctx.fillStyle = "#0a0e22"; ctx.beginPath(); ctx.ellipse(cx, cy + 12, prx, pry, 0, 0, Math.PI); ctx.lineTo(cx - prx, cy); ctx.ellipse(cx, cy, prx, pry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      var pg = ctx.createRadialGradient(cx - 40, cy - 30, 10, cx, cy, prx); pg.addColorStop(0, "#232c5e"); pg.addColorStop(1, "#0d1230");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(cx, cy, prx, pry, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.2; ctx.stroke();
      var Rp = SK.rng(69); for (var q = 0; q < 70; q++) { var qa = Rp() * 6.2832, qr = Math.sqrt(Rp()); ctx.fillStyle = "rgba(230,236,255," + (.2 + Rp() * .5).toFixed(2) + ")"; ctx.fillRect(cx + Math.cos(qa) * qr * prx * .96, cy + Math.sin(qa) * qr * pry * .96, 1.3, 1.3); }
      function orbR(p) { return (40 + 45 * lg(1 + p.a * 2.2)) * 1.4; }
      PL.forEach(function (p, k) {
        var rr = orbR(p), ry = rr * 0.45, on = k === s;
        ctx.strokeStyle = on ? PUI[k] : "rgba(200,210,255,.3)"; ctx.lineWidth = on ? 2 : 1.2; ctx.setLineDash(on ? [] : [4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, ry, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      });
      orb(ctx, cx, cy - 14, 13, [255, 196, 70], { glow: 1.3 });
      PL.forEach(function (p, k) {
        var rr = orbR(p), ry = rr * 0.45, a = ANG[k], on = k === s;
        var x = cx + rr * Math.cos(a), y = cy + ry * Math.sin(a), pr = on ? 8 : 6;
        var vlen = 29.78 / Math.sqrt(p.a) * 1.7, tx = -rr * Math.sin(a), ty = ry * Math.cos(a), tn = Math.sqrt(tx * tx + ty * ty);
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x + 2, y + 1, pr, pr * .35, 0, 0, 6.2832); ctx.fill();
        SK.arrow(ctx, { x: x, y: y - pr }, { x: x + tx / tn * (vlen + pr), y: y - pr + ty / tn * (vlen + pr) }, PUI[k], on ? 2.6 : 1.8, 8);
        if (k === 0) SK.earth(ctx, x, y - pr, pr); else SK.planet(ctx, x, y - pr, pr, PCOL[k][0], PCOL[k][1]);
        if (on) { ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - pr, pr + 5, 0, 6.2832); ctx.stroke(); }
      });
      var lx = 16;
      PL.forEach(function (p, k) { var b = SK.pill(ctx, "● " + p.n + " " + p.a.toFixed(1) + " AU", lx, H - 12, { s: 11, c: PUI[k] }); lx = b.x + b.w + 8; });
      /* 오른쪽 흰 카드: 거리-속도 그래프 */
      var CX = LW + 10;
      SK.card(ctx, CX, 0, W - CX, H, "거리와 공전 속도");
      var g = SK.chart(ctx, { x: CX + 6, y: 40, w: W - CX - 18, h: 252, x0: 0, x1: lg(40), y0: 0, y1: 40, xt: 4, yt: 4, light: true,
        xf: function () { return ""; }, xl: "태양에서의 거리 (AU) →", yl: "공전 속도 (km/s)" });
      [1, 2, 5, 10, 20, 40].forEach(function (q2) { SK.t(ctx, String(q2), g.X(lg(q2)), g.B + 16, { s: 10.5, a: "center", c: LT.mute, w: "700" }); });
      var cv = [];
      for (var k2 = 0; k2 <= 100; k2++) { var lq = lg(40) * k2 / 100; cv.push([lq, 29.78 / Math.sqrt(Math.pow(10, lq))]); }
      SK.plot(ctx, g, cv, "rgba(20,40,90,.5)", { w: 2.2, dash: [5, 4], glow: false });
      SK.pill(ctx, "v = 29.8 / √(거리)", g.R - 4, g.T + 18, { s: 11.5, a: "right", c: SC.mute, box: [g.L, g.R] });
      PL.forEach(function (p, k) { SK.line(ctx, { x: g.X(lg(p.a)), y: g.B - 7 }, { x: g.X(lg(p.a)), y: g.B }, LTP[k], 3.5); });
      var mx = g.X(lg(P.a)), my = g.Y(clamp(vv, 0, 40));
      orb(ctx, mx, my, 6, ok ? [15, 159, 118] : [232, 89, 12], { glow: .6 });
      ctx.strokeStyle = ok ? LT.green : LT.orange; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(mx, my, 11, 0, 6.2832); ctx.stroke();
      SK.row(ctx, "행성", P.n + " · " + P.a.toFixed(2) + " AU", CX + 18, W - 18, 318, LTP[s]);
      SK.row(ctx, "내가 계산한 속도", vv.toFixed(1) + " km/s", CX + 18, W - 18, 344, ok ? LT.green : LT.ink);
      cnote(ctx, "판 위 화살표 길이 = 공전 속도 · 안쪽일수록 빠르게 돕니다", CX + 18, 366);
      SK.tip(ctx, (ok ? "✓ 맞습니다 — 케플러 회전" : (vv > tv ? "너무 빠릅니다" : "아직 느립니다")) + "  (" + n + " / 3)", CX + 12, 378, W - CX - 30, ok ? true : false);
    }
    function draw() {
      var P = PL[s], tv = target(P), ok = Math.abs(vv - tv) <= 0.15;
      if (ok && !got[s]) { got[s] = true; window.sthState("cKep", got); mission(); }
      paint();
      $("c-kep-info").innerHTML = "태양계는 질량의 <b>99.8%</b>가 태양 하나에 몰려 있습니다. 이런 계에서는 바깥으로 갈수록 중력이 약해져 <b>공전 속도가 느려집니다</b>. 은하의 빛도 중심에 몰려 있으니, 루빈도 같은 모양의 그래프를 예상했습니다." +
        (ok ? " — <b>" + P.n + " : " + tv.toFixed(1) + " km/s</b>" : "");
    }
    function mission() {
      ["m3-2a", "m3-2b", "m3-2c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>지구 <b>29.8</b>, 목성 <b>13.1</b>, 해왕성 <b>5.4 km/s</b>. 질량이 가운데 몰려 있으면 바깥은 이렇게 느려집니다. 이것이 <b>케플러 회전</b>입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    SK.animate(canvas, function (dt) { if (kplay.on) { PL.forEach(function (p, k) { ANG[k] += dt * 2 * Math.PI / 6000 / Math.pow(p.a, 1.5); }); paint(); } });
    segWire("c-pl", function (b) { s = +b.getAttribute("data-s"); $("c-pl-val").textContent = PL[s].n; draw(); });
    $("c-v").addEventListener("input", function (e) { vv = +e.target.value; $("c-v-val").textContent = vv.toFixed(1) + " km/s"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면3 회전 곡선 맞추기 ---- */
  (function () {
    var canvas = $("c-c-rot"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var Vh = 0, got = window.sthState("cRot") || { a: false, b: false };

    function rms(vh) {
      var s = 0;
      RS.forEach(function (r, i) { var d = vtot(r, vh) - OBS[i]; s += d * d; });
      return Math.sqrt(s / RS.length);
    }
    var IG = SK.iso({ ox: 752, oy: 98, s: .48, L: 200, D: 200 }), GZ = 150;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var e = rms(Vh), ok = e <= 5.0, k;
      if (ok && !got.a) { got.a = true; window.sthState("cRot", got); mission(); }
      var LW = 600;
      studio(ctx, 0, 0, W, H, caseFloor(IG));
      big2(ctx, "헤일로의 세기 " + Vh + " km/s", ok ? "관측과 잘 맞습니다 (어긋남 " + e.toFixed(1) + " km/s)" : (Vh < 185 ? "곡선이 관측점보다 아래입니다" : "곡선이 관측점보다 위입니다"), 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: 0, x1: 22, y0: 0, y1: 280, xt: 11, yt: 7, light: true,
        xl: "은하 중심에서의 거리 (kpc) →", yl: "회전 속도 (km/s)" });
      var pv = [], ph = [], pt = [];
      for (k = 1; k <= 100; k++) { var r = 22 * k / 100; pv.push([r, vvis(r)]); ph.push([r, vhalo(r, Vh)]); pt.push([r, clamp(vtot(r, Vh), 0, 280)]); }
      SK.plot(ctx, g, pv, "rgba(20,40,90,.55)", { w: 2.2, dash: [6, 4], glow: false });
      SK.pill(ctx, "보이는 물질만 넣은 곡선", g.X(13), g.Y(vvis(13)) + 26, { s: 11, a: "center", c: SC.mute });
      if (Vh > 0) {
        SK.plot(ctx, g, ph, LT.violet, { w: 2, dash: [2, 4], light: true });
        SK.pill(ctx, "암흑 물질 헤일로만", g.X(18.5), clamp(g.Y(vhalo(18.5, Vh)) + 24, g.T + 30, g.B - 10), { s: 11, a: "center", c: SC.violet });
      }
      SK.plot(ctx, g, pt, ok ? LT.green : LT.blue, { w: 3.5, light: true });
      RS.forEach(function (r2, i) {
        SK.line(ctx, { x: g.X(r2), y: g.Y(OBS[i] - 8) }, { x: g.X(r2), y: g.Y(OBS[i] + 8) }, LT.orange, 2);
        orb(ctx, g.X(r2), g.Y(OBS[i]), 4.6, [232, 89, 12]);
      });
      SK.pill(ctx, "● 루빈의 관측점", g.L + 10, g.T + 18, { s: 11.5, c: SC.orange });
      SK.pill(ctx, "━ 보이는 물질 + 헤일로", g.L + 10, g.T + 44, { s: 11.5, c: ok ? SC.green : SC.blue });
      /* 오른쪽 위: 우주 진열장 속 은하와 헤일로 */
      var I = IG, Pg = function (x, y) { return I.P(100 + x, 100 + y, 75); }, cc = Pg(0, 0);
      spaceCase(ctx, I, GZ, 75, { grid: 40 });
      var hr = 64, hg = ctx.createRadialGradient(cc.x, cc.y, 6, cc.x, cc.y, hr);
      hg.addColorStop(0, "rgba(182,156,255," + (0.5 * Vh / 250).toFixed(3) + ")"); hg.addColorStop(1, "rgba(182,156,255,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cc.x, cc.y, hr, 0, 6.2832); ctx.fill();
      for (var arm = 0; arm < 2; arm++) for (var th = 0; th < 4.6; th += 0.1) {
        var rr = 14 * Math.exp(0.36 * th), aa = th + arm * Math.PI, pp = Pg(rr * Math.cos(aa), rr * Math.sin(aa));
        SK.glow(ctx, pp.x, pp.y, 1.2, "rgba(190,215,255,.85)", 3);
      }
      SK.glow(ctx, cc.x, cc.y, 6, "rgba(255,236,200,.95)", 3);
      caseGlass(ctx, I, GZ);
      if (Vh > 0) I.label(ctx, 100, 100, 75 + 52, "암흑 물질 헤일로", 46, -16, "#d9ccff", [604, W]);
      /* 판정 카드 */
      var CX = 610, CY = 212, x0 = CX + 18, bw = W - CX - 44;
      var Mh20 = Math.pow(vhalo(20, Vh) / KV, 2) * 20, Mv20 = Mvis(20);
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, "판정 · 20 kpc 안쪽 질량 (10¹⁰ M☉)");
      cval(ctx, ok ? "✓ 관측과 맞습니다" : "어긋남 " + e.toFixed(1) + " km/s", x0, CY + 58, ok ? LT.green : LT.red, 18);
      cnote(ctx, "보이는 물질", x0, CY + 86); SK.t(ctx, Mv20.toFixed(1), W - 26, CY + 86, { s: 12.5, a: "right", w: "900", c: LT.green });
      SK.bar(ctx, x0, CY + 94, bw, Mv20 / 30, LT.green);
      cnote(ctx, "암흑 물질", x0, CY + 124); SK.t(ctx, Mh20.toFixed(1), W - 26, CY + 124, { s: 12.5, a: "right", w: "900", c: LT.violet });
      SK.bar(ctx, x0, CY + 132, bw, Mh20 / 30, LT.violet);
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0), 2, x0 - 6, CY + 154, W - CX - 32, "보이지 않는 질량을 찾았습니다", "곡선 맞추기 · 뜻 고르기");
      cnote(ctx, "M = v² r / G · 속도가 줄지 않으면 질량이 더해진다", x0, H - 16);
      $("c-rot-info").innerHTML = "보이는 별과 가스만 넣으면 곡선은 <b>케플러처럼 처집니다</b>. 관측점은 20 kpc 에서도 220 km/s 가까이 유지됩니다. 은하를 공처럼 둘러싼 보이지 않는 물질을 더하면 두 곡선이 겹칩니다." +
        (got.a ? " <b>필요한 헤일로의 세기는 약 190 km/s</b>입니다." : "");
    }
    function mission() {
      if (got.a) done("m3-3a"); if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>관측 곡선을 맞추려면 <b>보이지 않는 물질</b>을 넣어야 합니다. 20 kpc 안쪽에서 그 양은 보이는 물질의 <b>두세 배</b>나 됩니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-h").addEventListener("input", function (e) { Vh = +e.target.value; $("c-h-val").textContent = Vh + " km/s"; draw(); });
    draw();

    window.sthPick({
      mount: "c-q1",
      q: "v² = GM(r)/r에서, 바깥에서도 회전 속도 v가 거의 일정하다는 것은 무슨 뜻일까요?",
      options: ["반지름이 커지는 만큼 안쪽 질량 M(r)도 계속 늘어난다", "바깥에는 질량이 거의 없다", "바깥 별들은 중력을 받지 않는다", "은하가 통째로 팽창하고 있다"],
      answer: 0,
      why: [
        "맞습니다. v가 일정하려면 M(r)이 r에 비례해 계속 늘어나야 합니다. 그런데 그 바깥에는 빛을 내는 것이 거의 없습니다.",
        "질량이 없다면 v는 거리의 제곱근에 반비례해 줄어들어야 합니다. 관측은 그렇지 않았습니다.",
        "중력은 어디서나 작용합니다. 문제는 그 중력을 만드는 질량이 보이지 않는다는 것입니다.",
        "회전 속도는 은하 안에서 도는 운동이지 팽창과는 다릅니다."
      ],
      onDone: function () { got.b = true; window.sthState("cRot", got); mission(); }
    });
    mission();
  })();

  /* ---- 장면4 질량 분포 ---- */
  (function () {
    var canvas = $("c-c-mass"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var r0 = 3, got = window.sthState("cMass") || { a: false, b: false };
    function Mobs(r) { var vq = vtot(r, VH_TRUE); return (vq / KV) * (vq / KV) * r; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var mv = Mvis(r0), mo = Mobs(r0), md = mo - mv, ratio = md / mv;
      var okA = ratio >= 0.9 && ratio <= 1.1, okB = r0 >= 19.5, k;
      var ch = false;
      if (okA && !got.a) { got.a = ch = true; }
      if (okB && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cMass", got); mission(); }
      var LW = 580;
      studio(ctx, 0, 0, LW, H);
      big2(ctx, "중심에서 " + r0.toFixed(1) + " kpc 안쪽", "암흑 물질 ÷ 보이는 물질 = " + ratio.toFixed(2) + " 배", 18, 44, "#ffffff", okA ? "#7dffc4" : "#ffd35a");
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: 0, x1: 25, y0: 0, y1: 30, xt: 5, yt: 3, light: true,
        xl: "은하 중심에서의 거리 (kpc) →", yl: "질량 (10¹⁰ M☉)" });
      var po = [], pv = [];
      for (k = 1; k <= 100; k++) { var r = 25 * k / 100; po.push([r, Mobs(r)]); pv.push([r, Mvis(r)]); }
      ctx.beginPath(); po.forEach(function (p, i) { if (i) ctx.lineTo(g.X(p[0]), g.Y(p[1])); else ctx.moveTo(g.X(p[0]), g.Y(p[1])); });
      for (k = pv.length - 1; k >= 0; k--) ctx.lineTo(g.X(pv[k][0]), g.Y(pv[k][1]));
      ctx.closePath(); ctx.fillStyle = "rgba(112,72,232,.14)"; ctx.fill();
      SK.plot(ctx, g, po, LT.orange, { w: 3, light: true });
      SK.plot(ctx, g, pv, LT.green, { w: 3, light: true });
      SK.pill(ctx, "전체 질량 (관측)", g.X(21), g.Y(Mobs(21)) - 14, { s: 11, a: "right", c: SC.orange });
      SK.pill(ctx, "보이는 물질", g.X(21), g.Y(Mvis(21)) + 24, { s: 11, a: "right", c: SC.green });
      SK.pill(ctx, "그 차이 = 암흑 물질", g.X(15), g.Y((Mobs(15) + Mvis(15)) / 2) + 5, { s: 11, a: "center", c: SC.violet });
      var lx = g.X(r0);
      SK.line(ctx, { x: lx, y: g.T }, { x: lx, y: g.B }, LT.violet, 2.2, [5, 4]);
      orb(ctx, lx, g.Y(mo), 5, [232, 89, 12]); orb(ctx, lx, g.Y(mv), 5, [15, 159, 118]);
      SK.pill(ctx, "r = " + r0.toFixed(1) + " kpc", lx, g.T + 18, { s: 11.5, a: "center", c: SC.violet, box: [g.L, g.R] });
      /* 오른쪽 카드: 질량 블록 두 기둥 */
      var CX = LW + 10, x0 = CX + 18, CW = W - CX;
      SK.card(ctx, CX, 0, CW, H, "질량 블록 (10¹⁰ M☉)");
      var IM = SK.iso({ ox: CX + 112, oy: 214, s: .62, L: 124, D: 44 });
      var hv = clamp(mv / 21 * 150, 2, 160), hd = clamp(md / 21 * 150, 1, 160);
      IM.box(ctx, -12, -12, -6, 136, 56, 0, "#e3e9f1", "#c9d2de", "#aeb9c8");
      IM.box(ctx, 0, 0, 0, 44, 44, hv, "#7fe0c0", "#0f9f76", "#0b7a5b");
      IM.box(ctx, 80, 0, 0, 124, 44, hd, "#c6b6ff", "#7048e8", "#5634c4");
      var tv1 = IM.P(22, 22, hv), tv2 = IM.P(102, 22, hd);
      SK.pill(ctx, mv.toFixed(1), tv1.x, tv1.y - 10, { s: 12, a: "center", c: SC.green, box: [CX, W] });
      SK.pill(ctx, md.toFixed(1), tv2.x, tv2.y - 10, { s: 12, a: "center", c: SC.violet, box: [CX, W] });
      var b1 = IM.P(22, 44, 0), b2 = IM.P(102, 44, 0);
      SK.t(ctx, "보이는 물질", b1.x - 6, b1.y + 26, { s: 11.5, a: "center", w: "900", c: LT.green });
      SK.t(ctx, "암흑 물질", b2.x + 6, b2.y + 26, { s: 11.5, a: "center", w: "900", c: LT.violet });
      SK.row(ctx, "회전 속도", vtot(r0, VH_TRUE).toFixed(0) + " km/s", x0, W - 18, 318);
      SK.row(ctx, "보이는 물질", mv.toFixed(2) + " ×10¹⁰ M☉", x0, W - 18, 342, LT.green);
      SK.row(ctx, "암흑 물질", md.toFixed(2) + " ×10¹⁰ M☉", x0, W - 18, 366, LT.violet);
      SK.tip(ctx, (ratio < 0.9 ? "아직 보이는 물질이 더 많습니다" : (ratio <= 1.1 ? "✓ 둘이 같아지는 자리입니다" : "암흑 물질이 더 많습니다")) + "  (" + ((got.a ? 1 : 0) + (got.b ? 1 : 0)) + " / 2)", x0 - 6, 378, CW - 24, okA ? true : null);
      cnote(ctx, "M = v² r / G로 구한 값입니다", x0, H - 14);
      $("c-mass-info").innerHTML = "보이는 물질은 <b>8 kpc 쯤에서 거의 다 쌓이고</b> 더는 늘지 않습니다. 별빛이 거기서 끝나기 때문입니다. 그런데 회전 속도로 구한 전체 질량은 바깥으로 갈수록 <b>계속 늘어납니다.</b> 그 차이가 암흑 물질입니다.";
    }
    function mission() {
      if (got.a) done("m3-4a"); if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>약 <b>6 kpc</b>에서 둘이 같아지고, 20 kpc 바깥에서는 암흑 물질이 보이는 물질의 <b>2.7배</b>가 됩니다. 은하는 보이는 것보다 훨씬 무겁습니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("c-rr").addEventListener("input", function (e) { r0 = +e.target.value; $("c-rr-val").textContent = r0.toFixed(1) + " kpc"; draw(); });
    draw(); mission();
  })();

  function finish() { window.sthState("r3", "해결 · 헤일로 190 km/s, 20 kpc 안 암흑 물질은 보이는 물질의 2.7배"); }
  function vsC() {
    var p = window.sthState("c-pred") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "관측과 같았습니다. 그리고 그것이 곧 보이지 않는 질량의 증거였습니다."
        : "루빈도 ㉠ 을 예상했습니다. 그런데 관측 곡선은 끝까지 처지지 않았습니다.");
  }
  vsC();
  ep.onShow(vsC);
  window.sthWork({
    mount: "wkC", unitLabel: "[행성우주과학 Ⅱ-2] 이야기 ③ 보이지 않는 것의 무게",
    items: [
      { id: "w1", label: "회전 속도 곡선이 이상한 이유", hint: "바깥쪽 별의 회전 속도가 예상보다 느려지지 않는다는 관측이, 왜 보이지 않는 질량의 증거가 되는지 쓰세요." },
      { id: "c2", label: "태양계와 은하의 차이", hint: "태양계의 회전 곡선과 은하의 회전 곡선이 왜 다른 모양인지, ‘질량이 어디에 있는가’로 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ④ 막대 인간이 나타났다
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epD", key: "epD", name: "사건 파일 ④", onDone: finish });

  window.sthGate({
    gate: "d-gate", key: "d-pred", title: "관측 조수의 첫 추리",
    question: "은하가 우주에 어떻게 놓여 있는지 알아내려면 무엇이 더 필요할까요?",
    options: ["㉠ 더 크고 밝은 망원경", "㉡ 은하 하나하나의 스펙트럼 — 적색 편이로 거리를 알아야 한다", "㉢ 더 오래 노출한 사진"],
    onPick: function () { ep.clear(0); }
  });

  var LAB_K = 393.4, LAB_H = 396.8, CC = 3.0e5, H0 = 70;

  /* ---- 장면2 적색 편이 ---- */
  var GAL = [
    { n: "은하 가", lam: 396.0 }, { n: "은하 나", lam: 400.0 }, { n: "은하 다", lam: 405.0 }
  ];
  (function () {
    var canvas = $("d-c-spec"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, lam = 393.4, got = window.sthState("dSpec") || [false, false, false];

    /* 파장(nm) → 눈에 보이는 색(근삿값) */
    function wlRGB(l) {
      var r = 0, gg = 0, b = 0, f;
      if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { gg = (l - 440) / 50; b = 1; } else if (l < 510) { gg = 1; b = -(l - 510) / 20; }
      else if (l < 580) { r = (l - 510) / 70; gg = 1; } else if (l < 645) { r = 1; gg = -(l - 645) / 65; } else { r = 1; }
      f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : (l > 700 ? 0.3 + 0.7 * (780 - l) / 80 : 1);
      return [Math.round(255 * Math.pow(r * f, .8)), Math.round(255 * Math.pow(gg * f, .8)), Math.round(255 * Math.pow(b * f, .8))];
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var G = GAL[s], ok = Math.abs(lam - G.lam) < 0.05;
      var z = (lam - LAB_K) / LAB_K, vq = CC * z, d = vq / H0;
      var zT = (G.lam - LAB_K) / LAB_K;
      if (ok && !got[s]) { got[s] = true; window.sthState("dSpec", got); mission(); }
      studio(ctx, 0, 0, W, H);
      big2(ctx, ok ? G.n + "까지 약 " + d.toFixed(1) + " Mpc" : "내가 읽은 파장 " + lam.toFixed(1) + " nm", "적색 편이 z = " + z.toFixed(4) + " · 후퇴 속도 " + Math.round(vq).toLocaleString() + " km/s", 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      var x0 = 160, x1 = 870;
      function X(l) { return x0 + (l - 385) / 30 * (x1 - x0); }
      /* 유리 슬라이드처럼 두께와 그림자가 있는 스펙트럼 띠 */
      function band(y, h) {
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.28)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; ctx.fillStyle = "#1a1f2e"; ctx.fillRect(x0 - 5, y - 5, x1 - x0 + 10, h + 10); ctx.restore();
        for (var px = x0; px < x1; px += 2) { ctx.fillStyle = rgba(wlRGB(385 + (px - x0) / (x1 - x0) * 30)); ctx.fillRect(px, y, 2.5, h); }
        var sh = ctx.createLinearGradient(0, y, 0, y + h); sh.addColorStop(0, "rgba(255,255,255,.22)"); sh.addColorStop(.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.25)");
        ctx.fillStyle = sh; ctx.fillRect(x0, y, x1 - x0, h);
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(x0 - 5, y - 5, x1 - x0 + 10, 2);
      }
      function line(l, y, h) {
        if (l < 385 || l > 415) return;
        var gl = ctx.createLinearGradient(X(l) - 5, 0, X(l) + 5, 0);
        gl.addColorStop(0, "rgba(0,0,0,0)"); gl.addColorStop(.5, "rgba(0,0,0,.92)"); gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl; ctx.fillRect(X(l) - 5, y, 10, h);
      }
      /* 실험실 칼슘 등(받침대 위 빛나는 공) */
      stand(ctx, 78, 150, 16, 12);
      orb(ctx, 78, 130, 14, [170, 120, 255], { glow: 1.4 });
      SK.pill(ctx, "실험실 칼슘", 78, 190, { s: 11, a: "center", c: SC.violet, box: [0, 156] });
      band(108, 40); line(LAB_K, 108, 40); line(LAB_H, 108, 40);
      SK.t(ctx, "K 393.4", X(LAB_K), 166, { s: 10.5, a: "center", c: LT.mute, w: "900" });
      SK.t(ctx, "H 396.8", X(LAB_H), 166, { s: 10.5, a: "center", c: LT.mute, w: "900" });
      /* 은하 사진 조각 */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; ctx.fillStyle = "#fbfbf7";
      ctx.beginPath(); ctx.roundRect(26, 206, 104, 82, 6); ctx.fill(); ctx.restore();
      SK.stage(ctx, 32, 212, 92, 70, "space", { seed: 81 + s, r: 3 });
      var gs = [1, .7, .48][s];
      ctx.save(); ctx.translate(78, 247); ctx.rotate(-.4); ctx.scale(1, .45);
      var gg2 = ctx.createRadialGradient(0, 0, 2, 0, 0, 34 * gs); gg2.addColorStop(0, "rgba(255,240,215,.95)"); gg2.addColorStop(.3, "rgba(220,205,255,.5)"); gg2.addColorStop(1, "rgba(160,160,255,0)");
      ctx.fillStyle = gg2; ctx.beginPath(); ctx.arc(0, 0, 34 * gs, 0, 6.2832); ctx.fill(); ctx.restore();
      SK.pill(ctx, G.n + "의 빛", 78, 308, { s: 11, a: "center", c: SC.blue, box: [0, 156] });
      band(222, 40); line(LAB_K * (1 + zT), 222, 40); line(LAB_H * (1 + zT), 222, 40);
      var ax0 = X(LAB_K), ax1 = X(LAB_K * (1 + zT));
      SK.line(ctx, { x: ax0, y: 150 }, { x: ax0, y: 222 }, "rgba(20,40,90,.4)", 1.2, [3, 3]);
      SK.arrow(ctx, { x: ax0, y: 196 }, { x: ax1, y: 196 }, LT.red, 2.4, 9);
      SK.pill(ctx, "붉은 쪽으로 밀린 폭", Math.max(ax1, ax0 + 60) + 10, 201, { s: 10.5, c: SC.red });
      var mx = X(lam), col = ok ? LT.green : LT.orange;
      SK.line(ctx, { x: mx, y: 212 }, { x: mx, y: 272 }, col, 3.2);
      SK.pill(ctx, "내 눈금", clamp(mx, x0 + 26, x1 - 26), 292, { s: 11, a: "center", c: ok ? SC.green : SC.orange });
      [385, 390, 395, 400, 405, 410, 415].forEach(function (q) { SK.t(ctx, String(q), X(q), 312, { s: 10.5, a: "center", c: LT.mute, w: "700" }); });
      SK.t(ctx, "파장 (nm) →", x1, 330, { s: 11, a: "right", c: LT.mute, w: "800" });
      SK.t(ctx, "이 파장대(385~415 nm)는 보라색 빛입니다", x0, 330, { s: 10.5, c: LT.dim, w: "700" });
      /* 아래 판정 카드 */
      var CY = 340;
      SK.card(ctx, 16, CY, W - 32, H - CY - 8, "판정 · 허블 법칙 v = H₀ d (H₀ = 70 km/s/Mpc)");
      [["적색 편이 z", z.toFixed(5), LT.red], ["후퇴 속도 v = c z", Math.round(vq).toLocaleString() + " km/s", LT.blue], ["거리 d = v ÷ H₀", d.toFixed(1) + " Mpc", LT.yellow]].forEach(function (q, i) {
        var xx = 34 + i * 170; cnote(ctx, q[0], xx, CY + 50); cval(ctx, q[1], xx, CY + 76, q[2], 18);
      });
      SK.tip(ctx, (ok ? "✓ 칼슘 K선과 맞았습니다" : (lam < G.lam ? "눈금이 아직 왼쪽입니다" : "눈금이 너무 오른쪽입니다")) + "  (" + ((got[0] ? 1 : 0) + (got[1] ? 1 : 0) + (got[2] ? 1 : 0)) + " / 3)", 560, CY + 40, 304, ok ? true : false);
      $("d-spec-read").innerHTML =
        "<span class='k'>적색 편이</span><span class='v r'>z = " + z.toFixed(5) + "</span>" +
        "<span class='sub'>(읽은 파장 − 393.4) ÷ 393.4</span>" +
        "<span class='k'>후퇴 속도</span><span class='v b'>v = " + Math.round(vq).toLocaleString() + " km/s</span>" +
        "<span class='sub'>v = c z (c = 30만 km/s)</span>" +
        "<span class='k'>거리</span><span class='v y'>d = " + d.toFixed(1) + " Mpc</span>" +
        "<span class='sub'>d = v ÷ H₀</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "K선을 바로 읽었습니다 · 이 거리가 답" : "아직 K선 자리가 아닙니다 · 눈금을 맞춰 보세요") + "</span>";
      $("d-spec-info").innerHTML = "은하가 멀어지면 스펙트럼선의 파장이 <b>길어진 쪽(붉은 쪽)</b>으로 밀립니다. 밀린 비율이 <b>적색 편이 z</b>이고, 여기에 빛의 속도를 곱하면 후퇴 속도, 허블 법칙으로 나누면 거리가 됩니다. <b>사진으로는 결코 알 수 없는 깊이</b>를 분광 관측이 알려 주는 것입니다." +
        (ok ? " — <b>" + G.n + " 까지 약 " + d.toFixed(1) + " Mpc</b>" : "");
    }
    function mission() {
      ["m4-2a", "m4-2b", "m4-2c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>약 <b>28 Mpc · 72 Mpc · 126 Mpc</b>. 사진에서는 똑같은 점 세 개였지만, 스펙트럼을 찍자 <b>깊이가 생겼습니다.</b>");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    segWire("d-gal", function (b) { s = +b.getAttribute("data-s"); $("d-gal-val").textContent = GAL[s].n; draw(); });
    $("d-lam").addEventListener("input", function (e) { lam = +e.target.value; $("d-lam-val").textContent = lam.toFixed(1) + " nm"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면3 쐐기 지도 ---- */
  (function () {
    var canvas = $("d-c-wedge"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var lim = 14, got = window.sthState("dWedge") || { a: false, b: false };
    var SKY = (function () {
      var rnd = lcg(19860101), out = [];
      function push(ra, vq) {
        if (vq < 500 || vq > 13500) return;
        var d = vq / H0, m = 4.5 + 5 * lg(d);
        out.push({ ra: ra, dec: rnd(), v: vq, m: m });
      }
      var k;
      for (k = 0; k < 190; k++) { var r1 = rnd(); push(r1, 3200 + 1500 * Math.sin(r1 * Math.PI) + (rnd() - 0.5) * 900); }
      for (k = 0; k < 240; k++) { var r2 = rnd(); push(r2, 7000 + 1100 * Math.sin(r2 * 6.2 + 0.6) + (rnd() - 0.5) * 800); }
      for (k = 0; k < 150; k++) { var r3 = rnd(); push(r3, 10600 + 700 * Math.cos(r3 * 4.0) + (rnd() - 0.5) * 700); }
      for (k = 0; k < 90; k++) { push(0.48 + (rnd() - 0.5) * 0.06, 5200 + rnd() * 4200); }
      for (k = 0; k < 120; k++) { push(rnd(), 500 + rnd() * 13000); }
      return out;
    })();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var shown = SKY.filter(function (g) { return g.m <= lim; });
      var dmax = Math.pow(10, (lim - 4.5) / 5);
      var ch = false;
      if (lim <= 13 && !got.a) { got.a = ch = true; }
      if (lim >= 15.5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("dWedge", got); mission(); }
      studio(ctx, 0, 0, W, H, { x: 620, y: 334, rx: 250, ry: 24 });
      big2(ctx, "분광 관측한 은하 " + shown.length + "개", lim <= 13 ? "자료가 너무 적어 구조가 안 보입니다" : (lim >= 15.5 ? "벽처럼 늘어선 은하와 텅 빈 곳" : "무언가 무늬가 보이기 시작합니다"), 18, 44, "#ffffff", lim >= 15.5 ? "#7dffc4" : "#ffd35a");
      /* 왼쪽: 하늘 사진(인화지 미니어처) */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = "#fbfbf7";
      ctx.beginPath(); ctx.roundRect(18, 98, 310, 334, 8); ctx.fill(); ctx.restore();
      var px = 30, py = 110, pw = 286, ph = 274;
      SK.stage(ctx, px, py, pw, ph, "space", { seed: 83, r: 4 });
      shown.forEach(function (g) {
        var b = clamp(1.6 - (g.m - 12) * .25, .7, 1.8);
        SK.glow(ctx, px + 10 + g.ra * (pw - 20), py + 10 + g.dec * (ph - 20), b, "rgba(230,225,255,.9)", 2.6);
      });
      SK.t(ctx, "① 하늘 사진 — 방향만 안다", 173, 404, { s: 11.5, a: "center", c: LT.ink, w: "900" });
      SK.t(ctx, "고르게 흩어져 보입니다 · 한계 등급 " + lim.toFixed(1), 173, 422, { s: 11, a: "center", c: LT.mute, w: "700" });
      /* 오른쪽: 쐐기 판(입체 미니어처) — 적색 편이로 깊이를 넣었다 */
      var vx = 620, vy = 318, RR = 280, a0 = Math.PI * 1.18, a1 = Math.PI * 1.82, TS = 0.78;
      function WP(rr, ang) { return { x: vx + rr * Math.cos(ang), y: vy + rr * Math.sin(ang) * TS }; }
      function fan(dy, fill, stroke) {
        ctx.beginPath(); ctx.moveTo(vx, vy + dy);
        for (var i = 0; i <= 48; i++) { var p = WP(RR, a0 + (a1 - a0) * i / 48); ctx.lineTo(p.x, p.y + dy); }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.3; ctx.stroke(); }
      }
      fan(12, "#080b1c");
      var tg = ctx.createLinearGradient(0, vy - RR * TS, 0, vy); tg.addColorStop(0, "#0d1230"); tg.addColorStop(1, "#1f2858");
      fan(0, tg, "rgba(255,255,255,.55)");
      ctx.strokeStyle = "rgba(200,210,255,.25)"; ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(function (f) {
        ctx.beginPath(); for (var i = 0; i <= 40; i++) { var p = WP(RR * f, a0 + (a1 - a0) * i / 40); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } ctx.stroke();
        var lp = WP(RR * f, a0);
        SK.t(ctx, (Math.round(13500 * f / 100) * 100).toLocaleString(), lp.x + 6, lp.y + 15, { s: 9.5, c: SC.mute, w: "700" });
      });
      [a0, a1].forEach(function (a) { var p = WP(RR, a); ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(p.x, p.y); ctx.stroke(); });
      shown.forEach(function (g) {
        var p = WP(g.v / 13500 * RR, a0 + g.ra * Math.PI * 0.64);
        SK.glow(ctx, p.x, p.y, 1.3, "rgba(127,230,255,.95)", 2.6);
      });
      SK.earth(ctx, vx, vy, 6);
      SK.pill(ctx, "우리 (지구)", vx + 14, vy + 5, { s: 11, c: SC.yellow });
      SK.pill(ctx, "② 쐐기 지도 — 적색 편이로 깊이를 넣었다", W - 16, 30, { s: 12, a: "right", c: SC.blue });
      SK.t(ctx, "판 위 눈금 = 후퇴 속도 (km/s)", W - 16, 58, { s: 10.5, a: "right", c: LT.mute, w: "800" });
      /* 아래 판정 카드 */
      var CX = 344, CY = 348;
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, "판정");
      [["한계 등급", lim.toFixed(1) + " 등급", LT.yellow], ["분광 관측한 은하", shown.length + "개", LT.blue], ["깊이", Math.round(dmax) + " Mpc까지", LT.ink]].forEach(function (q, i) {
        var xx = CX + 18 + i * 124; cnote(ctx, q[0], xx, CY + 50); cval(ctx, q[1], xx, CY + 74, q[2], 16);
      });
      SK.tip(ctx, (lim <= 13 ? "자료가 너무 적습니다" : (lim >= 15.5 ? "✓ 장성과 보이드가 뚜렷" : "조금 더 어두운 은하까지")) + " (" + ((got.a ? 1 : 0) + (got.b ? 1 : 0)) + "/2)", 716, CY + 34, 168, lim >= 15.5 ? true : null);
      $("d-wedge-info").innerHTML = "왼쪽과 오른쪽은 <b>똑같은 은하들</b>입니다. 다른 것은 깊이가 있느냐뿐입니다. 사진에서는 고르게 흩어져 보이던 은하들이, 적색 편이를 넣는 순간 <b>벽처럼 늘어선 줄</b>과 <b>은하가 거의 없는 빈 공간</b>으로 갈립니다. " +
        (lim <= 13 ? "지금은 자료가 너무 적습니다. 더 어두운 은하까지 내려가 보세요."
          : (lim >= 15.5 ? "1986년 CfA 탐사가 바로 이 그림을 처음 내놓았습니다." : "조금 더 내려가면 구조가 또렷해집니다."));
    }
    function mission() {
      if (got.a) done("m4-3a"); if (got.b) done("m4-3b");
      if (got.a && got.b) {
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>은하의 공간 분포는 <b>분광 자료의 양</b>이 정합니다. 몇십 개로는 아무것도 보이지 않지만, 수백 개를 넘으면 <b>장성과 보이드</b>가 드러납니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("d-lim").addEventListener("input", function (e) { lim = +e.target.value; $("d-lim-val").textContent = lim.toFixed(1) + " 등급"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면4 규모의 사다리 ---- */
  (function () {
    var canvas = $("d-c-scale"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 27, got = window.sthState("dScale") || { a: false, b: false, c: false, d: false };
    function boxL(i) { return Math.pow(10, 0.03 * i); }
    var R1 = lcg(4242), P1 = [], R2 = lcg(777), P2 = [], R3 = lcg(1357), P3 = [], NODE = [];
    var k;
    for (k = 0; k < 420; k++) P1.push([R1(), R1()]);
    for (k = 0; k < 520; k++) P2.push([R2(), R2()]);
    for (k = 0; k < 26; k++) NODE.push([0.08 + R3() * 0.84, 0.08 + R3() * 0.84]);
    for (k = 0; k < 900; k++) P3.push([R3(), R3(), R3()]);

    var INFO = [
      { n: "국부 은하군", d: "우리은하와 안드로메다은하를 비롯한 <b>수십 개</b>의 은하가 중력으로 묶인 작은 집단입니다. 지름은 약 3 Mpc(1천만 광년)입니다." },
      { n: "처녀자리 은하단", d: "은하 <b>1,000개가 넘게</b> 중력으로 뭉친 큰 집단입니다. 지름은 약 3 Mpc이고 우리에게서 약 16.5 Mpc 떨어져 있으며, 국부 은하군도 이 은하단 쪽으로 끌려가고 있습니다." },
      { n: "라니아케아 초은하단", d: "은하군과 은하단 수백 개가 모인 <b>초은하단</b>입니다. 지름이 약 160 Mpc(5억 광년)에 이르지만 중력으로 단단히 묶여 있지는 않아, 우주 팽창에 따라 흩어질 수 있습니다." },
      { n: "우주의 거대 구조", d: "은하가 실처럼 이어진 <b>필라멘트</b>, 벽처럼 펼쳐진 <b>은하 장성</b>, 은하가 거의 없는 <b>보이드</b>가 그물처럼 얽혀 있습니다. 이보다 더 큰 눈으로 보면 우주는 다시 어디나 비슷해집니다." }
    ];
    function modeOf(L) { return L < 6 ? 0 : (L < 40 ? 1 : (L < 300 ? 2 : 3)); }

    function spiral(x, y, s, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, .5);
      var dg = ctx.createRadialGradient(0, 0, 1, 0, 0, 40 * s);
      dg.addColorStop(0, "rgba(255,240,215,.95)"); dg.addColorStop(.25, "rgba(220,210,255,.5)"); dg.addColorStop(1, "rgba(160,170,255,0)");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, 40 * s, 0, 6.2832); ctx.fill();
      for (var arm = 0; arm < 2; arm++) for (var th = 0; th < 5; th += .12) {
        var r = 5 * s * Math.exp(.4 * th), a = th + arm * Math.PI, ag = ctx.createRadialGradient(r * Math.cos(a), r * Math.sin(a), 0, r * Math.cos(a), r * Math.sin(a), 4 * s);
        ag.addColorStop(0, "rgba(190,210,255," + (.45 * (1 - th / 5.5)) + ")"); ag.addColorStop(1, "rgba(190,210,255,0)");
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(r * Math.cos(a), r * Math.sin(a), 4 * s, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    }
    var IS = SK.iso({ ox: 262, oy: 198, s: .58, L: 270, D: 270 }), SZ = 170;
    function Q(fx, fy, fz) { return IS.P(fx * IS.L, fy * IS.D, 8 + fz * (SZ - 16)); }
    function hz(k) { return (k * 0.618034 + 0.13) % 1; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L = boxL(i0), mode = modeOf(L), I = INFO[mode];
      var ch = false;
      if (L <= 5 && !got.a) { got.a = ch = true; }
      if (L >= 8 && L <= 30 && !got.b) { got.b = ch = true; }
      if (L >= 60 && L <= 250 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("dScale", got); mission(); }
      var LW = 520, Ltxt = (L < 10 ? L.toFixed(1) : Math.round(L)) + " Mpc", P = IS.P, Ls = IS.L, Ds = IS.D;
      studio(ctx, 0, 0, LW, H, caseFloor(IS));
      big2(ctx, I.n, "진열장 한 변 " + Ltxt, 18, 44);
      spaceCase(ctx, IS, SZ, 87, { grid: 27 });
      var sil = [P(0, Ds, 0), P(Ls, Ds, 0), P(Ls, 0, 0), P(Ls, 0, SZ), P(0, 0, SZ), P(0, Ds, SZ)];
      ctx.save(); polyP(ctx, sil); ctx.clip();
      var cap, q;
      if (mode === 0) {
        for (k = 0; k < 40; k++) { q = Q(P1[k][0], P1[k][1], hz(k)); SK.glow(ctx, q.x, q.y, 1.2, "rgba(210,215,240,.75)", 2.6); }
        [[0.34, 0.52, .5, 0.9, -0.4], [0.66, 0.40, .45, 1.0, 0.5], [0.55, 0.72, .58, 0.5, -1.0]].forEach(function (g) { var p = Q(g[0], g[1], g[2]); spiral(p.x, p.y, g[3], g[4]); });
        cap = "작은 은하 수십 개가 함께 있습니다";
      } else if (mode === 1) {
        var cc = Q(0.5, 0.5, 0.5), hg = ctx.createRadialGradient(cc.x, cc.y, 4, cc.x, cc.y, 120);
        hg.addColorStop(0, "rgba(160,140,255,.35)"); hg.addColorStop(1, "rgba(160,140,255,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cc.x, cc.y, 120, 0, 6.2832); ctx.fill();
        for (k = 0; k < 420; k++) {
          var a = P1[k][0] * Math.PI * 2, rr = Math.pow(P1[k][1], 0.6) * 0.42, el = (hz(k) - .5) * 2 * rr;
          q = Q(0.5 + rr * Math.cos(a), 0.5 + rr * Math.sin(a), 0.5 + el);
          if (rr < 0.12) SK.glow(ctx, q.x, q.y, 2.2, "rgba(255,214,150,.95)", 2.8);
          else SK.glow(ctx, q.x, q.y, 1.4, "rgba(215,225,255,.9)", 2.6);
        }
        cap = "은하 1,000개 이상이 중력으로 뭉쳐 있습니다 · 보랏빛 = 뜨거운 기체";
      } else if (mode === 2) {
        var CEN = [[0.5, 0.5, 0.5], [0.22, 0.32, 0.62], [0.74, 0.30, 0.36], [0.66, 0.74, 0.62], [0.30, 0.76, 0.4]], c0 = Q(0.5, 0.5, 0.5);
        CEN.forEach(function (c, ci) {
          var cq = Q(c[0], c[1], c[2]);
          if (ci) { ctx.save(); ctx.shadowColor = "rgba(127,211,255,.8)"; ctx.shadowBlur = 10; SK.arrow(ctx, cq, { x: lerp(cq.x, c0.x, .7), y: lerp(cq.y, c0.y, .7) }, "rgba(127,211,255,.6)", 2.5, 10); ctx.restore(); }
          for (var kk = 0; kk < 90; kk++) {
            var idx = ci * 90 + kk, a2 = P2[idx][0] * Math.PI * 2, r4 = Math.pow(P2[idx][1], 0.7) * 0.12;
            var q4 = Q(c[0] + r4 * Math.cos(a2), c[1] + r4 * Math.sin(a2), c[2] + (hz(idx) - .5) * r4 * 1.6);
            SK.glow(ctx, q4.x, q4.y, 1.2, "rgba(215,225,255,.9)", 2.6);
          }
        });
        SK.glow(ctx, c0.x, c0.y, 5, "rgba(255,214,150,.95)", 3.4);
        cap = "은하군·은하단 수십 개가 흐름을 따라 모입니다";
      } else {
        var NZ3 = NODE.map(function (n, i) { return 0.12 + hz(i * 3 + 1) * 0.76; });
        ctx.save(); ctx.shadowColor = "rgba(127,211,255,.9)"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(127,211,255,.3)"; ctx.lineWidth = 3;
        for (k = 0; k < NODE.length - 1; k++) {
          var j1 = (k * 7 + 3) % NODE.length, n1 = NODE[k], n2 = NODE[j1];
          var dd = Math.sqrt((n1[0] - n2[0]) * (n1[0] - n2[0]) + (n1[1] - n2[1]) * (n1[1] - n2[1]));
          if (dd > 0.42) continue;
          var e1 = Q(n1[0], n1[1], NZ3[k]), e2 = Q(n2[0], n2[1], NZ3[j1]);
          ctx.beginPath(); ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.stroke();
        }
        ctx.restore();
        for (k = 0; k < 900; k++) {
          var ni = Math.floor(P3[k][2] * NODE.length), nj = (ni * 7 + 3) % NODE.length, nd = NODE[ni], other = NODE[nj], t2 = P3[k][0];
          var fx = nd[0] + (other[0] - nd[0]) * t2 + (P3[k][1] - 0.5) * 0.05;
          var fy = nd[1] + (other[1] - nd[1]) * t2 + (P3[k][1] - 0.5) * 0.05;
          var fz = NZ3[ni] + (NZ3[nj] - NZ3[ni]) * t2 + (hz(k) - 0.5) * 0.05;
          if (fx < 0.02 || fx > 0.98 || fy < 0.02 || fy > 0.98) continue;
          var q5 = Q(fx, fy, fz);
          ctx.fillStyle = "rgba(200,230,255,.8)"; ctx.beginPath(); ctx.arc(q5.x, q5.y, 1.3, 0, 6.2832); ctx.fill();
        }
        NODE.forEach(function (n, i) { var q6 = Q(n[0], n[1], NZ3[i]); SK.glow(ctx, q6.x, q6.y, 3, "rgba(255,190,130,.95)", 3); });
        cap = "필라멘트(실) · 은하 장성(벽) · 보이드(빈 곳)";
      }
      ctx.restore();
      caseGlass(ctx, IS, SZ);
      if (mode === 0) {
        [[0.34, 0.52, .5, 18, "우리은하"], [0.66, 0.40, .45, 20, "안드로메다"], [0.55, 0.72, .58, 12, "삼각형자리"]].forEach(function (g) {
          var p = Q(g[0], g[1], g[2]); SK.pill(ctx, g[4], p.x, p.y + g[3] + 14, { s: 11, a: "center", c: SC.ink, box: [0, LW] });
        });
      }
      SK.pill(ctx, cap, LW / 2, H - 14, { s: 11, a: "center", c: SC.mute, box: [0, LW] });
      /* 오른쪽 카드: 규모의 계단 */
      var CX = LW + 10, rx = CX + 18;
      SK.card(ctx, CX, 0, W - CX, H, "이 규모에서 보이는 것");
      cval(ctx, I.n, rx, 72, LT.blue, I.n.length > 8 ? 18 : 22);
      SK.line(ctx, { x: rx, y: 92 }, { x: W - 20, y: 92 }, "rgba(20,40,90,.15)", 1);
      var steps = [["은하군", "1~3", 0], ["은하단", "2~10", 1], ["초은하단", "50~160", 2], ["거대 구조", "수백", 3]];
      steps.forEach(function (st, k2) {
        var yy = 136 + k2 * 50, on = mode === st[2], sw = 290;
        ctx.save(); if (on) { ctx.shadowColor = "rgba(28,126,214,.45)"; ctx.shadowBlur = 12; }
        var gr = ctx.createLinearGradient(rx, 0, rx + sw, 0); gr.addColorStop(0, on ? "#1c7ed6" : "#eef1f5"); gr.addColorStop(1, on ? "#4dabf7" : "#e6eaf0");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(rx + k2 * 10, yy - 22, sw - k2 * 10, 34, 10); ctx.fill(); ctx.restore();
        SK.t(ctx, st[0], rx + k2 * 10 + 14, yy, { s: 13.5, w: "900", c: on ? "#ffffff" : LT.mute });
        SK.t(ctx, "약 " + st[1] + " Mpc", rx + sw - 14, yy, { s: 12, a: "right", w: "800", c: on ? "#ffffff" : LT.mute });
        if (got[["a", "b", "c", "d"][k2]]) SK.t(ctx, "✓", rx + sw + 14, yy, { s: 15, w: "900", c: LT.green });
      });
      cnote(ctx, "1 Mpc = 326만 광년", rx, 352);
      cnote(ctx, "중력이 이 계단을 차례로 쌓아 올렸습니다", rx, 372);
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0) + (got.d ? 1 : 0), 4, rx - 6, 390, W - CX - 30, "네 규모를 모두 확인했습니다", "네 규모 찾기");
      $("d-scale-info").innerHTML = "<b>" + I.n + "</b> — " + I.d;
    }
    function mission() {
      if (got.a) done("m4-4a"); if (got.b) done("m4-4b"); if (got.c) done("m4-4c"); if (got.d) done("m4-4d");
      if (got.a && got.b && got.c && got.d) {
        window.sthMission("m4-4", true, "<span class='m-tag'>미션 완료</span>은하군 → 은하단 → 초은하단 → 필라멘트와 보이드. 규모를 키울수록 다른 구조가 나타나고, <b>수억 광년보다 큰 눈</b>으로 보면 우주는 다시 고르게 보입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("d-sc").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var L = boxL(i0);
      $("d-sc-val").textContent = (L < 10 ? L.toFixed(1) : Math.round(L).toLocaleString()) + " Mpc";
      draw();
    });
    draw();

    window.sthSort({
      mount: "d-sort",
      buckets: [
        { id: "gr", label: "은하군", sub: "은하 수십 개" },
        { id: "cl", label: "은하단", sub: "은하 수백~수천 개" },
        { id: "fi", label: "필라멘트·은하 장성", sub: "실처럼·벽처럼" },
        { id: "vo", label: "보이드(거대 공동)", sub: "거의 비어 있다" }
      ],
      items: [
        { t: "우리은하가 속한 작은 집단, 지름 약 3 Mpc", a: "gr", why: "국부 은하군입니다." },
        { t: "은하 수십 개가 중력으로 느슨하게 묶여 있다", a: "gr", why: "은하군의 규모입니다." },
        { t: "은하 수백~수천 개가 중력으로 강하게 뭉쳐 있다", a: "cl", why: "은하단입니다. 우주가 팽창해도 이 안의 은하들은 서로 멀어지지 않습니다." },
        { t: "뜨거운 기체가 가득 차 X선을 내놓는다", a: "cl", why: "은하단 속 고온 기체입니다. 이 기체의 온도도 암흑 물질의 증거가 됩니다.", hint: "은하 수천 개가 모인 곳은 중력이 아주 강합니다." },
        { t: "은하와 은하단이 수억 광년에 걸쳐 실처럼 이어진다", a: "fi", why: "필라멘트입니다." },
        { t: "벽처럼 넓게 펼쳐진 구조 — 1989년에 확인되었다", a: "fi", why: "CfA 탐사가 찾아낸 은하 장성(Great Wall)입니다." },
        { t: "지름 수억 광년에 이르도록 은하가 거의 없다", a: "vo", why: "보이드입니다." },
        { t: "쐐기 지도에서 크게 뚫린 검은 구멍처럼 보인다", a: "vo", why: "적색 편이 탐사가 처음 드러낸 모습입니다.", hint: "은하가 ‘없는’ 곳은 지도에서 어떻게 보일까요?" }
      ],
      onDone: function () { got.d = true; window.sthState("dScale", got); mission(); }
    });
    mission();
  })();

  function finish() { window.sthState("r4", "해결 · 적색 편이로 3차원 지도, 장성·보이드의 그물 구조 확인"); }
  function vsD() {
    var p = window.sthState("d-pred") || "";
    $("d-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 더 큰 망원경이 아니라 <b>분광 자료</b>가 필요했습니다."
        : "망원경을 키우거나 오래 노출해도 사진은 여전히 납작합니다. 깊이를 준 것은 스펙트럼이었습니다.");
  }
  vsD();
  ep.onShow(vsD);
  window.sthWork({
    mount: "wkD", unitLabel: "[행성우주과학 Ⅱ-2] 이야기 ④ 막대 인간이 나타났다",
    items: [
      { id: "d1", label: "분광 관측이 왜 필요한가", hint: "은하의 공간 분포를 알아내는 데 사진만으로는 왜 안 되는지, 적색 편이가 무엇을 더해 주는지 쓰세요." },
      { id: "d2", label: "우주의 거대 구조 설명하기", hint: "은하군·은하단·초은하단과 필라멘트·은하 장성·보이드를 규모 순으로 정리하고, 이 그물 구조가 어떻게 만들어졌다고 설명하는지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 05 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[행성우주과학 Ⅱ-2] 은하와 우주 — 정리",
  recap: [
    { key: "r1", label: "① 하늘 한쪽에 몰린 공들" },
    { key: "r2", label: "② 사라진 빛" },
    { key: "r3", label: "③ 보이지 않는 것의 무게" },
    { key: "r4", label: "④ 막대 인간이 나타났다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "네 사건을 꿰는 한 문장", hint: "성단에서 우주 거대 구조까지, 우리는 모두 <b>빛</b> 하나로 알아냈습니다. 빛에서 나이·거리·질량·깊이를 어떻게 끌어냈는지 네 이야기를 아우르는 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 06 우리 반 */
window.sthShare({
  mount: "share", unit: "psp-2-2", unitLabel: "[행성우주과학 Ⅱ-2] 은하와 우주",
  rows: [
    { key: "r1", label: "① 하늘 한쪽에 몰린 공들" },
    { key: "r2", label: "② 사라진 빛" },
    { key: "r3", label: "③ 보이지 않는 것의 무게" },
    { key: "r4", label: "④ 막대 인간이 나타났다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
