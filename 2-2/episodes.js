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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = age(i0), Mto = turnoff(t), to = msAt(Mto);
      var LW = 584;
      SK.stage(ctx, 0, 0, LW, H, "lab", { seed: 3, title: "성단의 C-M도 (색등급도)" });
      var g = SK.chart(ctx, { x: 6, y: 40, w: LW - 12, h: 344, x0: -0.4, x1: 1.7, y0: 10, y1: -8, xt: 7, yt: 6,
        xl: "색지수 B−V  (파랗다 ← → 붉다)", yl: "절대 등급 (위가 밝다)" });
      bvStrip(ctx, g, -0.4, 1.7, g.B - 5, 5);
      SK.plot(ctx, g, MS.map(function (s) { return [s.bv, s.mv]; }), "rgba(200,210,255,.55)", { w: 2, dash: [5, 5], glow: false });
      /* 성단의 별 */
      var jn = 0, gy = 0;
      MS.forEach(function (s) {
        if (s.m > 3.2 * Mto) return;                                    /* 이미 일생을 마친 별 */
        var evolved = s.m > Mto;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 60] * (evolved ? 26 : 13); jn++;
          var dy = JIT[jn % 60] * (evolved ? 22 : 11); jn++;
          var bv = evolved ? 1.28 : s.bv, mv = evolved ? s.mv - 2.4 : s.mv;
          var px = clamp(g.X(bv) + dx, g.L + 3, g.R - 3), py = clamp(g.Y(mv) + dy, g.T + 3, g.B - 8);
          starBV(ctx, px, py, evolved ? 3.2 : 2.3, bv, 2.8);
        }
      });
      if (Mto < 6) SK.pill(ctx, "적색 거성 가지", clamp(g.X(1.28) + 40, g.L, g.R - 60), clamp(g.Y(msAt(Mto).mv - 3.4), g.T + 40, g.B - 20), { s: 11, c: SC.orange, box: [g.L, g.R] });
      /* 이탈점 */
      var tx = clamp(g.X(to.bv), g.L, g.R), ty = clamp(g.Y(to.mv), g.T, g.B);
      ctx.save(); ctx.shadowColor = SC.yellow; ctx.shadowBlur = 8;
      SK.line(ctx, { x: tx, y: g.T }, { x: tx, y: g.B }, SC.yellow, 2, [5, 5]); ctx.restore();
      ctx.strokeStyle = SC.yellow; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "주계열 이탈점", tx, g.T + 16, { s: 11.5, a: "center", c: SC.yellow, box: [g.L, g.R] });
      SK.pill(ctx, "- - 표준 주계열", g.R - 4, g.B - 16, { s: 10.5, a: "right", c: SC.mute, box: [g.L, g.R] });

      /* 오른쪽 값 */
      var RX = LW + 8, rx = RX + 20;
      SK.stage(ctx, RX, 0, W - RX, H, "night", { seed: 6 });
      kv(ctx, "나이", ageTxt(t), rx, 40, SC.ink, 19);
      kv(ctx, "이탈점의 질량", Mto.toFixed(2) + " M☉", rx, 100, SC.yellow, 19);
      kv(ctx, "이탈점의 색과 밝기", "B−V " + to.bv.toFixed(2) + "  ·  M " + to.mv.toFixed(1), rx, 160, SC.ink, 15);
      starBV(ctx, W - 40, 176, 6, to.bv, 3.2);
      kv(ctx, "이런 성단", label(t), rx, 218, SC.blue, 14);
      SK.line(ctx, { x: rx, y: 268 }, { x: W - 18, y: 268 }, SC.line, 1);
      SK.t(ctx, "수명(백만 년) ≈ 10,000 × 질량⁻²·⁵", rx, 296, { s: 12, c: SC.ink, w: "700" });
      SK.t(ctx, "무거운 별일수록 먼저 주계열을 떠납니다", rx, 320, { s: 11, c: SC.mute, w: "600" });
      SK.t(ctx, "그래서 이탈점이 내려올수록 늙은 성단", rx, 342, { s: 11, c: SC.mute, w: "600" });

      var ch = false;
      if (Mto >= 5 && !got.a) { got.a = ch = true; }
      if (Mto >= 1.8 && Mto <= 2.3 && !got.b) { got.b = ch = true; }
      if (Mto <= 1.0 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("aCmd", got); mission(); }
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var C = CL[s], d = dist(i0), mu = 5 * lg(d / 10), muT = C.mo - REF_M;
      var diff = (REF_M + mu) - C.mo;
      var ok = Math.abs(diff) <= 0.06;
      var LW = 540;
      SK.stage(ctx, 0, 0, LW, H, "lab", { seed: 15, title: C.n + " 의 관측 자료" });
      var g = SK.chart(ctx, { x: 6, y: 40, w: LW - 12, h: 344, x0: -0.4, x1: 1.7, y0: 24, y1: 0, xt: 7, yt: 4,
        xl: "색지수 B−V", yl: "겉보기 등급 (위가 밝다)" });
      bvStrip(ctx, g, -0.4, 1.7, g.B - 5, 5);
      /* 관측점 */
      var jn = 0;
      MS.forEach(function (st) {
        if (st.m > C.to) return;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 80] * 14; jn++;
          var dy = JIT[jn % 80] * 12; jn++;
          var px = clamp(g.X(st.bv) + dx, g.L + 3, g.R - 3), py = clamp(g.Y(st.mv + muT) + dy, g.T + 3, g.B - 8);
          starBV(ctx, px, py, 2.4, st.bv, 2.8);
        }
      });
      /* 10 pc에 둔 표준 주계열(자리)과 내가 옮긴 표준 주계열 */
      SK.plot(ctx, g, MS.filter(function (st) { return st.mv >= 0; }).map(function (st) { return [st.bv, st.mv]; }), "rgba(200,210,255,.35)", { w: 1.6, dash: [4, 5], glow: false });
      var seg = [], col = ok ? SC.green : SC.blue;
      MS.forEach(function (st) {
        var yy = st.mv + mu;
        if (yy < -1 || yy > 25) { if (seg.length > 1) SK.plot(ctx, g, seg, col, { w: 3 }); seg = []; return; }
        seg.push([st.bv, clamp(yy, 0, 24)]);
      });
      if (seg.length > 1) SK.plot(ctx, g, seg, col, { w: 3 });
      var ax = g.X(REF_BV), ya = g.Y(REF_M), yb = g.Y(clamp(REF_M + mu, 0, 24));
      if (Math.abs(yb - ya) > 14) {
        SK.arrow(ctx, { x: ax, y: ya }, { x: ax, y: yb }, SC.yellow, 2, 9);
        SK.pill(ctx, "거리 지수만큼 내림", ax + 10, (ya + yb) / 2 + 4, { s: 11, c: SC.yellow, box: [g.L, g.R] });
      }
      var lg1 = SK.pill(ctx, "━ 내가 옮긴 표준 주계열", g.R - 4, g.T + 18, { s: 11, a: "right", c: col, box: [g.L, g.R] });
      SK.pill(ctx, "● 관측된 성단의 별", g.R - 4, g.T + 44, { s: 11, a: "right", c: SC.orange, box: [g.L, g.R] });
      SK.pill(ctx, "┅ 10 pc에 둔 표준 주계열", g.R - 4, g.T + 70, { s: 11, a: "right", c: SC.mute, box: [g.L, g.R] });

      /* 오른쪽: 성단의 모습 */
      var RX = LW + 8, RW = W - RX, pcx = RX + RW / 2, pcy = 150;
      SK.stage(ctx, RX, 0, RW, H, "space", { seed: 25 + s, title: C.n + " 의 모습" });
      if (s === 1) { var hz = ctx.createRadialGradient(pcx, pcy, 10, pcx, pcy, 120); hz.addColorStop(0, "rgba(120,170,255,.28)"); hz.addColorStop(1, "rgba(120,170,255,0)"); ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(pcx, pcy, 120, 0, 6.2832); ctx.fill(); }
      if (s === 2) { var cg = ctx.createRadialGradient(pcx, pcy, 2, pcx, pcy, 70); cg.addColorStop(0, "rgba(255,240,200,.75)"); cg.addColorStop(1, "rgba(255,230,180,0)"); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(pcx, pcy, 70, 0, 6.2832); ctx.fill(); }
      PORT[s].forEach(function (q) { starBV(ctx, pcx + q[0], pcy + q[1], q[2], q[3], 3); });
      SK.pill(ctx, ok ? "✅ 관측값과 겹칩니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"), pcx, 296, { s: 13, a: "center", c: ok ? SC.green : SC.red, box: [RX, W] });
      SK.t(ctx, "기준 별: B−V = +0.35 인 주계열 별, M = +3.00", RX + 18, 330, { s: 11, c: SC.mute, w: "700" });
      SK.t(ctx, C.note + " · 나이 " + C.age, RX + 18, 352, { s: 11, c: SC.mute, w: "700" });
      SK.t(ctx, "사진은 그림으로 꾸민 모습", RX + 18, H - 12, { s: 10, c: SC.dim, w: "600" });
      $("a-fit-read").innerHTML =
        "<span class='k'>놓아 본 거리</span><span class='v y'>d = " + (d < 1000 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc</span>" +
        "<span class='k'>거리 지수</span><span class='v b'>m − M = " + mu.toFixed(2) + "</span>" +
        "<span class='sub'>= 5 log(d / 10 pc)</span>" +
        "<span class='k'>기준 별이 보일 등급</span><span class='v'>m = " + (REF_M + mu).toFixed(2) + "</span>" +
        "<span class='sub'>관측값 m = " + C.mo.toFixed(2) + "</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "관측값과 겹칩니다 · 이 거리가 답" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다")) + "</span>";

      if (ok && !got[s]) { got[s] = true; window.sthState("aFit", got); mission(); }
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
      var win = 6 * C.P, col = ok ? SC.green : SC.blue, tm = cu * win;
      ctx.clearRect(0, 0, W, H);
      /* 광도곡선 */
      SK.stage(ctx, 0, 0, 470, 292, "lab", { seed: 33, title: "광도곡선 — " + win.toFixed(0) + "일 동안" });
      var g = SK.chart(ctx, { x: 6, y: 36, w: 458, h: 254, x0: 0, x1: win, y0: 0, y1: 1, xt: 6, yt: 2,
        yf: function () { return ""; }, xf: function (q) { return q < 10 ? q.toFixed(1) : String(Math.round(q)); }, xl: "시간(일) →" });
      SK.t(ctx, "밝다", g.L - 6, g.T + 12, { s: 10.5, a: "right", c: SC.mute, w: "700" });
      for (var k = 0; k <= 70; k++) {
        var tt = k / 70 * win, rel = phase((tt / C.P) % 1);
        SK.glow(ctx, g.X(tt), g.Y(0.12 + 0.72 * rel), 2.4, "rgba(255,179,92,.95)", 2.6);
      }
      var pts = [];
      for (var j = 0; j <= 400; j++) { var t2 = j / 400 * win; pts.push([t2, 0.12 + 0.72 * phase((t2 / P) % 1)]); }
      SK.plot(ctx, g, pts, col, { w: 2.5 });
      SK.line(ctx, { x: g.X(tm), y: g.T }, { x: g.X(tm), y: g.B }, "rgba(255,255,255,.35)", 1.2, [3, 4]);
      SK.glow(ctx, g.X(tm), g.Y(0.12 + 0.72 * phase((tm / P) % 1)), 4, "rgba(255,255,255,.95)", 3.2);
      var l1 = SK.pill(ctx, "● 관측", g.L + 8, g.T + 18, { s: 11, c: SC.orange });
      SK.pill(ctx, "━ 내 모형", l1.x + l1.w + 8, g.T + 18, { s: 11, c: col });
      /* 주기-광도 관계 */
      var PX0 = 478;
      SK.stage(ctx, PX0, 0, W - PX0, 292, "lab", { seed: 37, title: "주기-광도 관계" });
      var h = SK.chart(ctx, { x: PX0 + 6, y: 36, w: W - PX0 - 12, h: 254, x0: 0, x1: 2, y0: 0, y1: -7, xt: 2, yt: 7,
        xf: function (q) { return ["1", "10", "100"][Math.round(q)] || ""; }, xl: "변광 주기(일) →", yl: "절대 등급" });
      var lp = [];
      for (var w2 = 0; w2 <= 100; w2++) { var lq = 2 * w2 / 100; lp.push([lq, absMag(Math.pow(10, lq))]); }
      SK.plot(ctx, h, lp, SC.violet, { w: 3 });
      var qx = h.X(lg(P)), qy = clamp(h.Y(absMag(P)), h.T, h.B);
      if (ok) { SK.line(ctx, { x: qx, y: qy }, { x: h.L, y: qy }, "rgba(63,211,163,.7)", 1.4, [4, 4]); SK.pill(ctx, "M = " + M.toFixed(2), h.L + 8, qy - 10, { s: 11.5, c: SC.green }); }
      starT(ctx, qx, qy, 5.5, 6000, 3.6);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(qx, qy, 10, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "주기가 길수록 더 밝다", h.R - 4, h.B - 14, { s: 11, a: "right", c: SC.violet });
      /* 결과 */
      SK.stage(ctx, 0, 300, 752, H - 300, "night", { seed: 39 });
      var r1 = SK.pill(ctx, "내 모형의 주기 " + P.toFixed(2) + "일", 16, 330, { s: 14, c: SC.ink });
      SK.t(ctx, ok ? "✅ 관측과 딱 겹칩니다" : (P < C.P ? "모형이 너무 자주 뜁니다" : "모형이 너무 느리게 뜁니다"), r1.x + r1.w + 12, 328, { s: 14, w: "900", c: ok ? SC.green : SC.red });
      if (ok) {
        SK.t(ctx, "절대 등급 M = −2.81 log P − 1.43 = " + M.toFixed(2), 20, 358, { s: 13, w: "800", c: SC.violet });
        SK.t(ctx, "관측된 겉보기 등급 m = " + C.m.toFixed(2) + "  →  거리 " + Math.round(d).toLocaleString() + " pc", 20, 386, { s: 14, w: "900", c: SC.green });
      } else {
        SK.t(ctx, "관측된 겉보기 등급 m = " + C.m.toFixed(2) + "  ·  " + C.where, 20, 358, { s: 12.5, c: SC.mute, w: "700" });
        SK.t(ctx, "주기를 맞히면 절대 등급과 거리가 나옵니다", 20, 386, { s: 12.5, c: SC.mute, w: "700" });
      }
      /* 내 모형 별 */
      var DX0 = 760, sx = DX0 + (W - DX0) / 2, sy = 342, ph = (tm / P) % 1, rl = phase(ph);
      SK.stage(ctx, DX0, 300, W - DX0, H - 300, "space", { seed: 41 });
      var rr = 15 * (1 - .12 * Math.cos(2 * Math.PI * ph)), c3 = tRGB(6000 * (1 + .12 * (rl - .5)));
      var hg = ctx.createRadialGradient(sx, sy, rr * .6, sx, sy, rr * (1.6 + 1.2 * rl));
      hg.addColorStop(0, rgba(c3, .3 + .35 * rl)); hg.addColorStop(1, rgba(c3, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx, sy, rr * (1.6 + 1.2 * rl), 0, 6.2832); ctx.fill();
      var bg = ctx.createRadialGradient(sx - rr * .3, sy - rr * .3, rr * .1, sx, sy, rr);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(.4, rgba(c3, 1)); bg.addColorStop(1, rgba([c3[0] * .6, c3[1] * .5, c3[2] * .4].map(Math.round), 1));
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, 6.2832); ctx.fill();
      SK.pill(ctx, "내 모형 별", sx, H - 10, { s: 10.5, a: "center", c: SC.mute, box: [DX0, W] });
    }
    function draw() {
      paint();
      var C = CEP[s], P = per(i0), ok = Math.abs(lg(P / C.P)) < 0.005;
      var M = absMag(C.P), d = Math.pow(10, (C.m - M + 5) / 5);

      if (ok && !got[s]) { got[s] = true; window.sthState("aCep", got); mission(); }
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
      var ok = ratio <= 1.06, col = ok ? SC.green : SC.red;
      var LW = 472;
      SK.stage(ctx, 0, 0, LW, 318, "lab", { seed: 51, title: "성단의 거리와 계산된 지름" });
      var g = SK.chart(ctx, { x: 6, y: 36, w: LW - 12, h: 280, x0: 0, x1: 8, y0: 0, y1: 12, xt: 4, yt: 3, xl: "거리 (kpc) →", yl: "계산된 지름 (pc)" });
      var pts = ds.map(function (d, k) { return [clamp(d / 1000, 0, 8), clamp(Ds[k], 0, 12)]; });
      SK.plot(ctx, g, pts, col, { w: 2.5 });
      pts.forEach(function (p) { SK.glow(ctx, g.X(p[0]), g.Y(p[1]), 4.5, ok ? "rgba(63,211,163,.95)" : "rgba(255,107,129,.95)", 3.2); });
      SK.pill(ctx, ok ? "기울기가 사라졌습니다" : "먼 성단일수록 커집니다", g.L + 10, g.T + 18, { s: 11.5, c: col });
      /* 아래: 소광량 */
      SK.stage(ctx, 0, 326, LW, H - 326, "night", { seed: 52 });
      SK.t(ctx, "소광량 " + a0.toFixed(2) + " 등급/kpc", 18, 358, { s: 17, w: "900", c: SC.yellow });
      SK.t(ctx, "보정 전 거리 = 보정 후 거리 × 10^(소광량 × 거리 ÷ 5)", 18, 384, { s: 11, c: SC.mute, w: "600" });
      /* 오른쪽: 성단별 결과 */
      var RX = LW + 8, rx = RX + 16;
      SK.stage(ctx, RX, 0, W - RX, H, "space", { seed: 53, title: "성단별 계산 결과" });
      SK.t(ctx, "하늘에서 본 크기", rx, 66, { s: 10.5, c: SC.mute, w: "800" });
      SK.t(ctx, "보정한 거리", rx + 132, 66, { s: 10.5, c: SC.mute, w: "800" });
      SK.t(ctx, "지름", rx + 222, 66, { s: 10.5, c: SC.mute, w: "800" });
      TCL.forEach(function (c, k) {
        var yy = 104 + k * 50, ix = rx + 26, rad = c.th * .8;
        var hz = ctx.createRadialGradient(ix, yy - 4, 0, ix, yy - 4, rad + 4); hz.addColorStop(0, "rgba(200,215,255,.35)"); hz.addColorStop(1, "rgba(200,215,255,0)");
        ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(ix, yy - 4, rad + 4, 0, 6.2832); ctx.fill();
        CLD.forEach(function (q) { SK.glow(ctx, ix + q[0] * rad, yy - 4 + q[1] * rad, .7 + q[2] * .6, "rgba(225,232,255,.95)", 2.4); });
        SK.t(ctx, c.th.toFixed(1) + "′", rx + 62, yy, { s: 12.5, w: "800" });
        SK.t(ctx, Math.round(ds[k]).toLocaleString() + " pc", rx + 132, yy, { s: 12.5, w: "700", c: SC.ink });
        var bl = clamp(Ds[k] * 10, 2, 120), bx = rx + 222;
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.fillStyle = ok ? SC.green : SC.blue;
        ctx.beginPath(); ctx.roundRect(bx, yy - 12, bl, 13, 6); ctx.fill(); ctx.restore();
        SK.t(ctx, Ds[k].toFixed(2) + " pc", bx + bl + 6, yy, { s: 11.5, w: "800" });
      });
      SK.line(ctx, { x: rx, y: 300 }, { x: W - 16, y: 300 }, SC.line, 1);
      SK.t(ctx, "가장 큰 지름 ÷ 가장 작은 지름 = " + ratio.toFixed(2) + " 배", rx, 330, { s: 14, w: "900", c: col });
      SK.t(ctx, ok ? "✅ 네 성단의 지름이 거의 같아졌습니다" : "아직 어긋납니다 (1.06배 안쪽이면 합격)", rx, 356, { s: 12.5, w: "800", c: ok ? SC.green : SC.mute });
      SK.t(ctx, "멀수록 하늘에서 작게 보입니다", rx, H - 12, { s: 10.5, c: SC.dim, w: "600" });

      if (ok && !got.a) { got.a = true; window.sthState("bTru", got); mission(); }
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var S = RED[s], ok = Math.abs(e0 - S.E) <= 0.005;
      var Av = 3.1 * e0, bvTry = S.bv0 + e0;
      var d0 = Math.pow(10, (S.m - S.M + 5) / 5);
      var dC = Math.pow(10, (S.m - Av - S.M + 5) / 5);
      var LW = 452;
      /* 왼쪽 소광 곡선 */
      SK.stage(ctx, 0, 0, LW, H, "lab", { seed: 55, title: "파장에 따라 깎이는 정도" });
      var g = SK.chart(ctx, { x: 6, y: 40, w: LW - 12, h: 300, x0: lg(330), x1: lg(2500), y0: 0, y1: 1.8, xt: 4, yt: 3,
        xf: function () { return ""; }, yf: function (q) { return q.toFixed(1); }, yl: "깎이는 정도 (V = 1)" });
      var wb = ctx.createLinearGradient(g.L, 0, g.R, 0);
      [[330, "#5a2bb0"], [440, "#2f6bff"], [550, "#3fe07a"], [650, "#ff4a3a"], [900, "#6a1a20"], [2500, "#2a0c14"]].forEach(function (q) { wb.addColorStop((lg(q[0]) - lg(330)) / (lg(2500) - lg(330)), q[1]); });
      ctx.globalAlpha = .8; ctx.fillStyle = wb; ctx.fillRect(g.L, g.B + 2, g.R - g.L, 6); ctx.globalAlpha = 1;
      [[365, "U"], [440, "B"], [550, "V"], [700, "R"], [1250, "J"], [2200, "K"]].forEach(function (q) { SK.t(ctx, q[1], g.X(lg(q[0])), g.B + 22, { s: 11, a: "center", c: SC.mute, w: "800" }); });
      SK.t(ctx, "짧은 파장(파랑) ← → 긴 파장(빨강)", (g.L + g.R) / 2, H - 14, { s: 11, a: "center", c: SC.mute, w: "600" });
      SK.plot(ctx, g, EXT.map(function (q) { return [lg(q[0]), q[1]]; }), SC.violet, { w: 3 });
      var pB = { x: g.X(lg(440)), y: g.Y(1.32) }, pV = { x: g.X(lg(550)), y: g.Y(1.00) };
      SK.line(ctx, { x: pB.x, y: pV.y }, pB, SC.yellow, 2);
      SK.line(ctx, { x: pB.x - 5, y: pV.y }, { x: pV.x, y: pV.y }, "rgba(255,211,107,.5)", 1, [3, 3]);
      SK.glow(ctx, pB.x, pB.y, 5, "rgba(80,140,255,.95)", 3.2);
      SK.glow(ctx, pV.x, pV.y, 5, "rgba(63,224,122,.95)", 3.2);
      SK.pill(ctx, "색초과", pB.x + 10, (pB.y + pV.y) / 2 + 2, { s: 11, c: SC.yellow, box: [g.L, g.R] });
      SK.pill(ctx, "파란빛이 훨씬 많이 깎입니다", g.R - 4, g.T + 18, { s: 11.5, a: "right", c: SC.violet });
      SK.t(ctx, "A(B) − A(V) = 색초과 E(B−V)", g.R - 4, g.T + 46, { s: 11, a: "right", c: SC.mute, w: "700" });

      /* 오른쪽: 별빛이 티끌을 지나면 */
      var RX = LW + 8, rx = RX + 18;
      SK.stage(ctx, RX, 0, W - RX, H, "space", { seed: 57, title: S.n + " 의 색" });
      var xs = [RX + 52, RX + 210, RX + 368], yc = 108;
      DUST.forEach(function (q) {
        var dg = ctx.createRadialGradient(RX + 131 + q[0], yc + q[1], 0, RX + 131 + q[0], yc + q[1], q[2]);
        dg.addColorStop(0, "rgba(70,45,30," + clamp(e0 / 0.8, 0, 1) * .55 + ")"); dg.addColorStop(1, "rgba(70,45,30,0)");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(RX + 131 + q[0], yc + q[1], q[2], 0, 6.2832); ctx.fill();
      });
      SK.arrow(ctx, { x: xs[0] + 30, y: yc }, { x: xs[1] - 34, y: yc }, "rgba(255,255,255,.55)", 1.6, 8);
      SK.line(ctx, { x: RX + 289, y: 60 }, { x: RX + 289, y: 180 }, "rgba(200,210,255,.25)", 1, [3, 4]);
      [{ t: "원래 색 (스펙트럼형)", bv: S.bv0 }, { t: "티끌을 지난 내 모형", bv: bvTry }, { t: "관측된 색", bv: S.bvo }].forEach(function (o, k) {
        var c3 = bvRGB(o.bv), x = xs[k];
        var hg = ctx.createRadialGradient(x, yc, 8, x, yc, 46); hg.addColorStop(0, rgba(c3, .45)); hg.addColorStop(1, rgba(c3, 0));
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, yc, 46, 0, 6.2832); ctx.fill();
        var bg = ctx.createRadialGradient(x - 8, yc - 8, 2, x, yc, 24); bg.addColorStop(0, "#ffffff"); bg.addColorStop(.45, rgba(c3, 1)); bg.addColorStop(1, rgba(c3, .85));
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, yc, 24, 0, 6.2832); ctx.fill();
        SK.t(ctx, o.t, x, 166, { s: 11, a: "center", c: SC.mute, w: "800" });
        SK.t(ctx, "B−V " + (o.bv >= 0 ? "+" : "") + o.bv.toFixed(2), x, 186, { s: 12.5, a: "center", w: "800" });
      });
      SK.pill(ctx, "티끌", RX + 131, 60, { s: 10.5, a: "center", c: "#d8b48a" });
      SK.line(ctx, { x: rx, y: 204 }, { x: W - 18, y: 204 }, SC.line, 1);
      SK.t(ctx, "내가 넣은 색초과 E(B−V) = " + e0.toFixed(2), rx, 232, { s: 14, w: "900" });
      SK.t(ctx, ok ? "✅ 관측된 색과 맞습니다" : (bvTry < S.bvo ? "아직 덜 붉습니다" : "너무 붉게 만들었습니다"), rx, 258, { s: 14, w: "900", c: ok ? SC.green : SC.red });
      if (ok) {
        SK.t(ctx, "소광량 A(V) = 3.1 × E(B−V) = " + Av.toFixed(2) + " 등급", rx, 290, { s: 13.5, w: "800", c: SC.violet });
        SK.t(ctx, "보정 전 거리 " + Math.round(d0).toLocaleString() + " pc", rx, 318, { s: 13.5, c: SC.red, w: "800" });
        SK.t(ctx, "보정 후 거리 " + Math.round(dC).toLocaleString() + " pc", rx, 344, { s: 16, w: "900", c: SC.green });
        SK.t(ctx, "보정하지 않으면 " + (d0 / dC).toFixed(1) + "배나 멀게 나옵니다", rx, 370, { s: 11.5, c: SC.mute, w: "600" });
      } else {
        SK.t(ctx, "관측 자료 : 겉보기 등급 m = " + S.m.toFixed(2) + ", 절대 등급 M = " + S.M.toFixed(1), rx, 294, { s: 12, c: SC.mute, w: "700" });
        SK.t(ctx, "색을 맞히면 소광량과 참거리가 나옵니다", rx, 320, { s: 12, c: SC.mute, w: "700" });
      }

      if (ok && !got[s]) { got[s] = true; window.sthState("bRed", got); mission(); }
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var T = temp(i0), f = ionFrac(T), lam = 2.898e6 / T;
      var emit = T >= 25000, refl = T <= 12000;
      var LW = 532;
      SK.stage(ctx, 0, 0, LW, H, "space", { seed: 63, title: "망원경으로 본 성운" });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      bg.forEach(function (q) { SK.glow(ctx, 10 + q[0] * (LW - 20), 40 + q[1] * (H - 60), 1.3, "rgba(225,232,255,.9)", 3); });
      /* 성운 */
      var gx = 350, gy = 190, nc = emit ? [255, 80, 120] : (refl ? [110, 160, 255] : [150, 150, 170]), na = emit ? .32 : (refl ? .24 : .08);
      NB.forEach(function (q) {
        var x = gx + q[0], y = gy + q[1], ng = ctx.createRadialGradient(x, y, 0, x, y, q[2]);
        ng.addColorStop(0, rgba(nc, na * (.6 + q[3] * .6))); ng.addColorStop(1, rgba(nc, 0));
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(x, y, q[2], 0, 6.2832); ctx.fill();
      });
      var core = ctx.createRadialGradient(gx - 30, gy - 15, 0, gx - 30, gy - 15, 110);
      core.addColorStop(0, rgba(nc, na * 1.6)); core.addColorStop(1, rgba(nc, 0));
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(gx - 30, gy - 15, 110, 0, 6.2832); ctx.fill();
      /* 별 */
      var sx = gx - 40, sy = gy - 20;
      if (emit) {
        ctx.strokeStyle = "rgba(190,150,255,.75)"; ctx.lineWidth = 1.5;
        for (var k = 0; k < 12; k++) { var ang = k / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(sx + 20 * Math.cos(ang), sy + 20 * Math.sin(ang)); ctx.lineTo(sx + 44 * Math.cos(ang), sy + 44 * Math.sin(ang)); ctx.stroke(); }
      }
      starT(ctx, sx, sy, 7, T, 4.5); SK.spikes(ctx, sx, sy, 22, .5);
      /* 암흑성운 — 앞을 가리는 티끌 구름 */
      var dx0 = 120, dy0 = 290;
      DK.forEach(function (q) {
        var dg = ctx.createRadialGradient(dx0 + q[0], dy0 + q[1], 0, dx0 + q[0], dy0 + q[1], q[2]);
        dg.addColorStop(0, "rgba(4,4,12,1)"); dg.addColorStop(.7, "rgba(6,6,16,.92)"); dg.addColorStop(1, "rgba(8,8,20,0)");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dx0 + q[0], dy0 + q[1], q[2], 0, 6.2832); ctx.fill();
      });
      ctx.restore();
      SK.pill(ctx, "암흑성운 · 뒤의 별빛을 가린다", dx0, dy0 + 72, { s: 11, a: "center", c: SC.mute, box: [0, LW] });
      SK.pill(ctx, emit ? "방출성운" : (refl ? "반사성운" : "아직 어느 쪽도 아닙니다"), gx + 40, 336, { s: 14, a: "center", c: emit ? SC.red : (refl ? SC.blue : SC.mute), box: [0, LW] });
      SK.pill(ctx, "별", sx + 16, sy - 14, { s: 11, c: "#fff4d6" });

      /* 오른쪽 값 */
      var RX = LW + 8, rx = RX + 20;
      SK.stage(ctx, RX, 0, W - RX, H, "night", { seed: 65 });
      kv(ctx, "별의 표면 온도", Math.round(T).toLocaleString() + " K", rx, 44, SC.ink, 21);
      kv(ctx, "가장 세게 내는 빛의 파장", Math.round(lam) + " nm", rx, 110, SC.ink, 16);
      kv(ctx, "수소를 이온화할 수 있는 자외선의 비율", (f * 100).toFixed(2) + " %", rx, 168, f > 0.1 ? SC.red : SC.blue, 21);
      var bw = W - 20 - rx;
      ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(rx, 214, bw, 14, 7); ctx.fill();
      ctx.save(); ctx.shadowColor = f > 0.1 ? SC.red : SC.blue; ctx.shadowBlur = 10; ctx.fillStyle = f > 0.1 ? SC.red : SC.blue;
      ctx.beginPath(); ctx.roundRect(rx, 214, clamp(f * 2 * bw, 3, bw), 14, 7); ctx.fill(); ctx.restore();
      SK.t(ctx, "파장 91.2 nm보다 짧은 자외선만 수소를 이온화합니다", rx, 252, { s: 11, c: SC.mute, w: "600" });
      SK.t(ctx, emit ? "이온화된 수소가 스스로 붉은빛을 냅니다" : (refl ? "이온화는 거의 없고, 티끌이 별빛을 산란시킵니다" : "온도를 더 올리거나 내려 보세요"),
        rx, 290, { s: 12.5, w: "800", c: emit ? SC.red : (refl ? SC.blue : SC.mute) });
      SK.t(ctx, "파란빛이 더 잘 산란되므로 반사성운은 푸릅니다", rx, 318, { s: 11, c: SC.mute, w: "600" });
      SK.t(ctx, "성운의 색은 그림으로 꾸민 것입니다", rx, H - 14, { s: 10.5, c: SC.dim, w: "600" });

      var ch = false;
      if (emit && !got.a) { got.a = ch = true; }
      if (refl && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("bNeb", got); mission(); }
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
    function paint() {
      var P = PL[s], tv = target(P), ok = Math.abs(vv - tv) <= 0.15;
      ctx.clearRect(0, 0, W, H);
      var LW = 452, cx = 226, cy = 186;
      SK.stage(ctx, 0, 0, LW, H, "space", { seed: 69, title: "태양계 — 질량이 거의 전부 한가운데에" });
      SK.warn(ctx, LW - 14, 56, "⚠ 궤도 크기는 실제 비율이 아님", "right");
      PL.forEach(function (p, k) {
        var rr = 40 + 45 * lg(1 + p.a * 2.2), ry = rr * 0.55, on = k === s;
        ctx.strokeStyle = on ? PUI[k] : "rgba(200,210,255,.28)"; ctx.lineWidth = on ? 2 : 1.2; ctx.setLineDash(on ? [] : [4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, ry, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      });
      SK.sun(ctx, cx, cy, 9);
      PL.forEach(function (p, k) {
        var rr = 40 + 45 * lg(1 + p.a * 2.2), ry = rr * 0.55, a = ANG[k], on = k === s;
        var x = cx + rr * Math.cos(a), y = cy + ry * Math.sin(a), pr = on ? 7 : 5;
        var vlen = 29.78 / Math.sqrt(p.a) * 1.7, tx = -rr * Math.sin(a), ty = ry * Math.cos(a), tn = Math.sqrt(tx * tx + ty * ty);
        SK.arrow(ctx, { x: x, y: y }, { x: x + tx / tn * (vlen + pr), y: y + ty / tn * (vlen + pr) }, PUI[k], on ? 2.4 : 1.6, 8);
        if (k === 0) SK.earth(ctx, x, y, pr); else SK.planet(ctx, x, y, pr, PCOL[k][0], PCOL[k][1]);
        if (on) { ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, pr + 5, 0, 6.2832); ctx.stroke(); }
      });
      var lx = 16;
      PL.forEach(function (p, k) { var b = SK.pill(ctx, "● " + p.n + " " + (p.a < 10 ? p.a.toFixed(1) : p.a.toFixed(1)) + " AU", lx, H - 40, { s: 11, c: PUI[k] }); lx = b.x + b.w + 8; });
      SK.t(ctx, "화살표 길이 = 공전 속도 · 안쪽일수록 빠르게 돕니다", 16, H - 12, { s: 11, c: SC.mute, w: "600" });
      /* 오른쪽 그래프 */
      var RX = LW + 8;
      SK.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 71, title: "거리와 공전 속도" });
      var g = SK.chart(ctx, { x: RX + 6, y: 36, w: W - RX - 12, h: 258, x0: 0, x1: lg(40), y0: 0, y1: 40, xt: 4, yt: 4,
        xf: function () { return ""; }, xl: "태양에서의 거리 (AU) →", yl: "공전 속도 (km/s)" });
      [1, 2, 5, 10, 20, 40].forEach(function (q) { SK.t(ctx, String(q), g.X(lg(q)), g.B + 16, { s: 10.5, a: "center", c: SC.mute, w: "600" }); });
      var cv = [];
      for (var k2 = 0; k2 <= 100; k2++) { var lq = lg(40) * k2 / 100; cv.push([lq, 29.78 / Math.sqrt(Math.pow(10, lq))]); }
      SK.plot(ctx, g, cv, "rgba(200,210,255,.7)", { w: 2.2, dash: [5, 4], glow: false });
      SK.pill(ctx, "v = 29.8 / √(거리)", g.R - 4, g.T + 18, { s: 11.5, a: "right", c: SC.mute });
      PL.forEach(function (p, k) { SK.line(ctx, { x: g.X(lg(p.a)), y: g.B - 6 }, { x: g.X(lg(p.a)), y: g.B }, PUI[k], 3); });
      var mx = g.X(lg(P.a)), my = g.Y(clamp(vv, 0, 40));
      SK.glow(ctx, mx, my, 5.5, ok ? "rgba(63,211,163,.95)" : "rgba(255,179,92,.95)", 3.4);
      ctx.strokeStyle = ok ? SC.green : SC.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 10, 0, 6.2832); ctx.stroke();
      SK.t(ctx, P.n + " (" + P.a.toFixed(2) + " AU)", RX + 18, 322, { s: 14, w: "900", c: PUI[s] });
      SK.t(ctx, "내가 계산한 속도 " + vv.toFixed(1) + " km/s", RX + 18, 348, { s: 14, w: "900" });
      SK.t(ctx, ok ? "✅ 맞습니다" : (vv > tv ? "너무 빠릅니다" : "아직 느립니다"), W - 18, 348, { s: 14, w: "900", a: "right", c: ok ? SC.green : SC.red });
      SK.t(ctx, "질량이 가운데 몰려 있으면 v는 거리의 제곱근에 반비례", RX + 18, H - 10, { s: 10.5, c: SC.mute, w: "600" });
    }
    function draw() {
      paint();
      var P = PL[s], tv = target(P), ok = Math.abs(vv - tv) <= 0.15;

      if (ok && !got[s]) { got[s] = true; window.sthState("cKep", got); mission(); }
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var e = rms(Vh), ok = e <= 5.0, k;
      var LW = 632;
      SK.stage(ctx, 0, 0, LW, H, "lab", { seed: 73, title: "은하의 회전 속도 곡선" });
      var g = SK.chart(ctx, { x: 6, y: 36, w: LW - 12, h: H - 40, x0: 0, x1: 22, y0: 0, y1: 280, xt: 11, yt: 7,
        xl: "은하 중심에서의 거리 (kpc) →", yl: "회전 속도 (km/s)" });
      var pv = [], ph = [], pt = [];
      for (k = 1; k <= 100; k++) { var r = 22 * k / 100; pv.push([r, vvis(r)]); ph.push([r, vhalo(r, Vh)]); pt.push([r, clamp(vtot(r, Vh), 0, 280)]); }
      SK.plot(ctx, g, pv, "rgba(200,210,255,.75)", { w: 2.2, dash: [6, 4], glow: false });
      SK.pill(ctx, "보이는 물질만 넣은 곡선", g.X(13), g.Y(vvis(13)) + 26, { s: 11, a: "center", c: SC.mute });
      if (Vh > 0) {
        SK.plot(ctx, g, ph, "rgba(182,156,255,.8)", { w: 2, dash: [2, 4] });
        SK.pill(ctx, "암흑 물질 헤일로만", g.X(18.5), clamp(g.Y(vhalo(18.5, Vh)) + 24, g.T + 30, g.B - 10), { s: 11, a: "center", c: SC.violet });
      }
      SK.plot(ctx, g, pt, ok ? SC.green : SC.blue, { w: 3.5 });
      RS.forEach(function (r, i) {
        SK.line(ctx, { x: g.X(r), y: g.Y(OBS[i] - 8) }, { x: g.X(r), y: g.Y(OBS[i] + 8) }, SC.orange, 2);
        SK.glow(ctx, g.X(r), g.Y(OBS[i]), 4.2, "rgba(255,179,92,.98)", 3);
      });
      SK.pill(ctx, "● 루빈의 관측점", g.L + 10, g.T + 18, { s: 11.5, c: SC.orange });
      SK.pill(ctx, "━ 보이는 물질 + 헤일로", g.L + 10, g.T + 44, { s: 11.5, c: ok ? SC.green : SC.blue });

      /* 오른쪽 */
      var RX = LW + 8, rx = RX + 18, gcx = RX + (W - RX) / 2, gcy = 92;
      SK.stage(ctx, RX, 0, W - RX, H, "space", { seed: 75, title: "위에서 본 은하" });
      var hr = 70, hg = ctx.createRadialGradient(gcx, gcy, 10, gcx, gcy, hr);
      hg.addColorStop(0, "rgba(182,156,255," + (0.42 * Vh / 300) + ")"); hg.addColorStop(1, "rgba(182,156,255,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(gcx, gcy, hr, 0, 6.2832); ctx.fill();
      for (var arm = 0; arm < 2; arm++) for (var th = 0; th < 4.6; th += 0.12) {
        var rr = 6 * Math.exp(0.36 * th), aa = th + arm * Math.PI;
        SK.glow(ctx, gcx + rr * Math.cos(aa), gcy + rr * Math.sin(aa) * .8, 1.3, "rgba(190,215,255,.8)", 3);
      }
      SK.glow(ctx, gcx, gcy, 6, "rgba(255,236,200,.95)", 3);
      kv(ctx, "헤일로의 세기", Vh + " km/s", rx, 172, SC.violet, 19);
      kv(ctx, "관측점과의 어긋남", e.toFixed(1) + " km/s", rx, 222, ok ? SC.green : SC.red, 17);
      SK.t(ctx, ok ? "✅ 관측과 잘 맞습니다" : (Vh < 185 ? "곡선이 관측점보다 아래입니다" : "곡선이 관측점보다 위입니다"), rx, 268, { s: 12, w: "800", c: ok ? SC.green : SC.red });
      SK.line(ctx, { x: rx, y: 280 }, { x: W - 18, y: 280 }, SC.line, 1);
      var Mh20 = Math.pow(vhalo(20, Vh) / KV, 2) * 20, Mv20 = Mvis(20);
      SK.t(ctx, "20 kpc 안쪽의 질량 (10¹⁰ M☉)", rx, 302, { s: 11.5, c: SC.mute, w: "800" });
      SK.t(ctx, "보이는 물질 " + Mv20.toFixed(1), rx, 326, { s: 13.5, w: "800", c: SC.ink });
      SK.t(ctx, "암흑 물질 " + Mh20.toFixed(1), rx, 350, { s: 13.5, w: "800", c: SC.violet });
      SK.t(ctx, "M = v² r / G · 속도가 줄지 않으면 질량이 더해진다", rx, H - 12, { s: 10, c: SC.mute, w: "600" });

      if (ok && !got.a) { got.a = true; window.sthState("cRot", got); mission(); }
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
      var LW = 580;
      SK.stage(ctx, 0, 0, LW, H, "lab", { seed: 77, title: "반지름 안쪽에 쌓인 질량" });
      var g = SK.chart(ctx, { x: 6, y: 36, w: LW - 12, h: H - 40, x0: 0, x1: 25, y0: 0, y1: 30, xt: 5, yt: 3,
        xl: "은하 중심에서의 거리 (kpc) →", yl: "질량 (10¹⁰ M☉)" });
      var po = [], pv = [];
      for (k = 1; k <= 100; k++) { var r = 25 * k / 100; po.push([r, Mobs(r)]); pv.push([r, Mvis(r)]); }
      ctx.beginPath(); po.forEach(function (p, i) { if (i) ctx.lineTo(g.X(p[0]), g.Y(p[1])); else ctx.moveTo(g.X(p[0]), g.Y(p[1])); });
      for (k = pv.length - 1; k >= 0; k--) ctx.lineTo(g.X(pv[k][0]), g.Y(pv[k][1]));
      ctx.closePath(); ctx.fillStyle = "rgba(182,156,255,.20)"; ctx.fill();
      SK.plot(ctx, g, po, SC.orange, { w: 3 });
      SK.plot(ctx, g, pv, SC.green, { w: 3 });
      SK.pill(ctx, "전체 질량 (관측)", g.X(21), g.Y(Mobs(21)) - 14, { s: 11, a: "right", c: SC.orange });
      SK.pill(ctx, "보이는 물질", g.X(21), g.Y(Mvis(21)) + 24, { s: 11, a: "right", c: SC.green });
      SK.pill(ctx, "그 차이 = 암흑 물질", g.X(15), g.Y((Mobs(15) + Mvis(15)) / 2) + 5, { s: 11, a: "center", c: SC.violet });
      var lx = g.X(r0);
      ctx.save(); ctx.shadowColor = SC.violet; ctx.shadowBlur = 8;
      SK.line(ctx, { x: lx, y: g.T }, { x: lx, y: g.B }, SC.violet, 2, [5, 4]); ctx.restore();
      SK.glow(ctx, lx, g.Y(mo), 4, "rgba(255,179,92,.95)", 3); SK.glow(ctx, lx, g.Y(mv), 4, "rgba(63,211,163,.95)", 3);
      SK.pill(ctx, "r = " + r0.toFixed(1) + " kpc", lx, g.T + 18, { s: 11.5, a: "center", c: SC.violet, box: [g.L, g.R] });

      /* 오른쪽 */
      var RX = LW + 8, rx = RX + 18, bw = W - 18 - rx;
      SK.stage(ctx, RX, 0, W - RX, H, "night", { seed: 79 });
      SK.t(ctx, "중심에서 " + r0.toFixed(1) + " kpc 안쪽", rx, 44, { s: 15, w: "900" });
      SK.t(ctx, "회전 속도 " + vtot(r0, VH_TRUE).toFixed(0) + " km/s", rx, 68, { s: 12, c: SC.mute, w: "700" });
      [["보이는 물질", mv, SC.green], ["암흑 물질", md, SC.violet]].forEach(function (o, k2) {
        var yy = 108 + k2 * 62;
        SK.t(ctx, o[0], rx, yy, { s: 12, w: "800", c: o[2] });
        SK.t(ctx, o[1].toFixed(2) + " ×10¹⁰ M☉", W - 18, yy, { s: 12, a: "right", w: "800" });
        ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(rx, yy + 9, bw, 16, 8); ctx.fill();
        ctx.save(); ctx.shadowColor = o[2]; ctx.shadowBlur = 10; ctx.fillStyle = o[2];
        ctx.beginPath(); ctx.roundRect(rx, yy + 9, clamp(o[1] / 21 * bw, 3, bw), 16, 8); ctx.fill(); ctx.restore();
      });
      SK.line(ctx, { x: rx, y: 240 }, { x: W - 18, y: 240 }, SC.line, 1);
      kv(ctx, "암흑 물질 ÷ 보이는 물질", ratio.toFixed(2) + " 배", rx, 268, ratio >= 1 ? SC.violet : SC.green, 24);
      SK.t(ctx, ratio < 0.9 ? "아직 보이는 물질이 더 많습니다" : (ratio <= 1.1 ? "✅ 둘이 같아지는 자리입니다" : "암흑 물질이 더 많습니다"),
        rx, 336, { s: 12.5, w: "800", c: okA ? SC.green : SC.mute });
      SK.t(ctx, "M = v² r / G로 구한 값입니다", rx, H - 14, { s: 11, c: SC.mute, w: "600" });

      var ch = false;
      if (okA && !got.a) { got.a = ch = true; }
      if (okB && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cMass", got); mission(); }
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
      SK.stage(ctx, 0, 0, W, H, "space", { seed: 81, title: "칼슘 H·K 흡수선 견주기" });
      var x0 = 160, x1 = 870;
      function X(l) { return x0 + (l - 385) / 30 * (x1 - x0); }
      function band(y, h) {
        for (var px = x0; px < x1; px += 2) { ctx.fillStyle = rgba(wlRGB(385 + (px - x0) / (x1 - x0) * 30)); ctx.fillRect(px, y, 2.5, h); }
        var sh = ctx.createLinearGradient(0, y, 0, y + h); sh.addColorStop(0, "rgba(255,255,255,.18)"); sh.addColorStop(.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.25)");
        ctx.fillStyle = sh; ctx.fillRect(x0, y, x1 - x0, h);
        ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1; ctx.strokeRect(x0, y, x1 - x0, h);
      }
      function line(l, y, h) {
        if (l < 385 || l > 415) return;
        var gl = ctx.createLinearGradient(X(l) - 5, 0, X(l) + 5, 0);
        gl.addColorStop(0, "rgba(0,0,0,0)"); gl.addColorStop(.5, "rgba(0,0,0,.92)"); gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl; ctx.fillRect(X(l) - 5, y, 10, h);
      }
      /* 실험실 */
      SK.glow(ctx, 76, 84, 7, "rgba(170,130,255,.95)", 3.4);
      SK.pill(ctx, "실험실 칼슘", 76, 126, { s: 11, a: "center", c: SC.violet, box: [0, 156] });
      band(64, 40); line(LAB_K, 64, 40); line(LAB_H, 64, 40);
      SK.t(ctx, "K 393.4", X(LAB_K), 122, { s: 10.5, a: "center", c: SC.mute, w: "800" });
      SK.t(ctx, "H 396.8", X(LAB_H), 122, { s: 10.5, a: "center", c: SC.mute, w: "800" });
      /* 은하 */
      var gs = [1, .7, .48][s];
      ctx.save(); ctx.translate(76, 194); ctx.rotate(-.4); ctx.scale(1, .45);
      var gg2 = ctx.createRadialGradient(0, 0, 2, 0, 0, 36 * gs); gg2.addColorStop(0, "rgba(255,240,215,.95)"); gg2.addColorStop(.3, "rgba(220,205,255,.5)"); gg2.addColorStop(1, "rgba(160,160,255,0)");
      ctx.fillStyle = gg2; ctx.beginPath(); ctx.arc(0, 0, 36 * gs, 0, 6.2832); ctx.fill(); ctx.restore();
      SK.pill(ctx, G.n + "의 빛", 76, 236, { s: 11, a: "center", c: SC.blue, box: [0, 156] });
      band(174, 40); line(LAB_K * (1 + zT), 174, 40); line(LAB_H * (1 + zT), 174, 40);
      /* 밀린 폭 */
      var ax0 = X(LAB_K), ax1 = X(LAB_K * (1 + zT));
      SK.line(ctx, { x: ax0, y: 104 }, { x: ax0, y: 174 }, "rgba(255,255,255,.35)", 1, [3, 3]);
      SK.arrow(ctx, { x: ax0, y: 148 }, { x: ax1, y: 148 }, SC.red, 2, 8);
      SK.pill(ctx, "붉은 쪽으로 밀린 폭", Math.max(ax1, ax0 + 60) + 10, 153, { s: 10.5, c: SC.red });
      /* 내 눈금 */
      var mx = X(lam), col = ok ? SC.green : SC.orange;
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
      SK.line(ctx, { x: mx, y: 166 }, { x: mx, y: 222 }, col, 3); ctx.restore();
      SK.pill(ctx, "내 눈금", clamp(mx, x0 + 26, x1 - 26), 244, { s: 11, a: "center", c: col });
      [385, 390, 395, 400, 405, 410, 415].forEach(function (q) { SK.t(ctx, String(q), X(q), 272, { s: 10.5, a: "center", c: SC.mute, w: "600" }); });
      SK.t(ctx, "파장 (nm) →", x1, 292, { s: 11, a: "right", c: SC.mute, w: "600" });
      SK.t(ctx, "이 파장대(385~415 nm)는 보라색 빛입니다", x0, 292, { s: 10.5, c: SC.dim, w: "600" });
      var r1 = SK.pill(ctx, "내가 읽은 파장 " + lam.toFixed(1) + " nm", 16, 334, { s: 15, c: SC.ink });
      SK.pill(ctx, ok ? "✅ 칼슘 K선과 맞았습니다" : (lam < G.lam ? "눈금이 아직 왼쪽입니다" : "눈금이 너무 오른쪽입니다"), r1.x + r1.w + 12, 334, { s: 14, c: ok ? SC.green : SC.red });
      SK.t(ctx, "허블 법칙 v = H₀ d  (H₀ = 70 km/s/Mpc)", 18, 372, { s: 12, c: SC.mute, w: "700" });
      $("d-spec-read").innerHTML =
        "<span class='k'>적색 편이</span><span class='v r'>z = " + z.toFixed(5) + "</span>" +
        "<span class='sub'>(읽은 파장 − 393.4) ÷ 393.4</span>" +
        "<span class='k'>후퇴 속도</span><span class='v b'>v = " + Math.round(vq).toLocaleString() + " km/s</span>" +
        "<span class='sub'>v = c z (c = 30만 km/s)</span>" +
        "<span class='k'>거리</span><span class='v y'>d = " + d.toFixed(1) + " Mpc</span>" +
        "<span class='sub'>d = v ÷ H₀</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "K선을 바로 읽었습니다 · 이 거리가 답" : "아직 K선 자리가 아닙니다 · 눈금을 맞춰 보세요") + "</span>";

      if (ok && !got[s]) { got[s] = true; window.sthState("dSpec", got); mission(); }
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
      /* 왼쪽 사진 */
      var LW = 360, px = 16, py = 48, pw = LW - 32, ph = 312;
      SK.stage(ctx, 0, 0, LW, H, "space", { seed: 83, title: "① 하늘 사진 — 방향만 안다" });
      ctx.fillStyle = "rgba(2,3,12,.55)"; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 10); ctx.fill();
      shown.forEach(function (g) {
        var b = clamp(1.6 - (g.m - 12) * .25, .7, 1.8);
        SK.glow(ctx, px + 10 + g.ra * (pw - 20), py + 10 + g.dec * (ph - 20), b, "rgba(230,225,255,.9)", 2.6);
      });
      SK.t(ctx, "고르게 흩어져 보입니다", LW / 2, py + ph + 24, { s: 11.5, a: "center", c: SC.mute, w: "800" });
      SK.pill(ctx, "한계 등급 " + lim.toFixed(1), LW / 2, H - 12, { s: 12.5, a: "center", c: SC.yellow });
      /* 오른쪽 쐐기 */
      var RX = LW + 8, vx = RX + (W - RX) / 2, vy = 350, RR = 278, a0 = Math.PI * 1.18, a1 = Math.PI * 1.82;
      SK.stage(ctx, RX, 0, W - RX, H, "space", { seed: 85, title: "② 쐐기 지도 — 적색 편이로 깊이를 넣었다" });
      var cone = ctx.createRadialGradient(vx, vy, 10, vx, vy, RR);
      cone.addColorStop(0, "rgba(127,211,255,.10)"); cone.addColorStop(1, "rgba(127,211,255,.02)");
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.arc(vx, vy, RR, a0, a1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(200,210,255,.25)"; ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(function (f) {
        ctx.beginPath(); ctx.arc(vx, vy, RR * f, a0, a1); ctx.stroke();
        SK.t(ctx, (Math.round(13500 * f / 100) * 100).toLocaleString(), vx + RR * f * Math.cos(a0) + 6, vy + RR * f * Math.sin(a0) + 15, { s: 9.5, c: SC.mute, w: "600" });
      });
      [a0, a1].forEach(function (a) { ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + RR * Math.cos(a), vy + RR * Math.sin(a)); ctx.stroke(); });
      shown.forEach(function (g) {
        var ang = a0 + g.ra * Math.PI * 0.64, rr = g.v / 13500 * RR;
        SK.glow(ctx, vx + rr * Math.cos(ang), vy + rr * Math.sin(ang), 1.3, "rgba(127,230,255,.95)", 2.6);
      });
      SK.earth(ctx, vx, vy, 6);
      SK.pill(ctx, "우리", vx, vy + 26, { s: 11, a: "center", c: SC.yellow });
      SK.t(ctx, "눈금 = 후퇴 속도 (km/s)", W - 16, 56, { s: 10.5, a: "right", c: SC.mute, w: "600" });
      SK.pill(ctx, "분광 관측한 은하 " + shown.length + "개 · " + Math.round(dmax) + " Mpc까지", RX + 14, H - 12, { s: 12, c: SC.blue });
      SK.pill(ctx, lim <= 13 ? "자료가 너무 적어 구조를 알 수 없습니다" : (lim >= 15.5 ? "벽처럼 늘어선 은하와 텅 빈 곳이 뚜렷합니다" : "무언가 무늬가 보이기 시작합니다"),
        W - 14, H - 12, { s: 12, a: "right", c: lim >= 15.5 ? SC.green : SC.mute });

      var ch = false;
      if (lim <= 13 && !got.a) { got.a = ch = true; }
      if (lim >= 15.5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("dWedge", got); mission(); }
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L = boxL(i0), mode = modeOf(L);
      var LW = 452, px = 16, py = 46, pw = LW - 32, ph = 334;
      SK.stage(ctx, 0, 0, LW, H, "space", { seed: 87, title: "상자 한 변 " + (L < 10 ? L.toFixed(1) : Math.round(L)) + " Mpc" });
      ctx.save(); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 10); ctx.clip();
      ctx.fillStyle = "rgba(2,3,12,.6)"; ctx.fillRect(px, py, pw, ph);
      function P(fx, fy) { return [px + 12 + fx * (pw - 24), py + 12 + fy * (ph - 24)]; }
      var cap;
      if (mode === 0) {
        for (k = 0; k < 40; k++) { var q2 = P(P1[k][0], P1[k][1]); SK.glow(ctx, q2[0], q2[1], 1.2, "rgba(210,215,240,.75)", 2.6); }
        [[0.34, 0.52, 1.0, -0.4], [0.66, 0.40, 1.15, 0.5], [0.55, 0.72, 0.55, -1.0]].forEach(function (g) { var q = P(g[0], g[1]); spiral(q[0], q[1], g[2], g[3]); });
        cap = "작은 은하 수십 개가 함께 있습니다";
      } else if (mode === 1) {
        var cc = P(0.5, 0.5), hg = ctx.createRadialGradient(cc[0], cc[1], 4, cc[0], cc[1], 150);
        hg.addColorStop(0, "rgba(160,140,255,.35)"); hg.addColorStop(1, "rgba(160,140,255,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cc[0], cc[1], 150, 0, 6.2832); ctx.fill();
        for (k = 0; k < 420; k++) {
          var a = P1[k][0] * Math.PI * 2, rr = Math.pow(P1[k][1], 0.6) * 0.42;
          var q3 = P(0.5 + rr * Math.cos(a), 0.5 + rr * Math.sin(a) * 0.92);
          if (rr < 0.12) SK.glow(ctx, q3[0], q3[1], 2.2, "rgba(255,214,150,.95)", 2.8);
          else SK.glow(ctx, q3[0], q3[1], 1.4, "rgba(215,225,255,.9)", 2.6);
        }
        cap = "은하 1,000개 이상이 중력으로 뭉쳐 있습니다 · 보랏빛 = 뜨거운 기체";
      } else if (mode === 2) {
        var CEN = [[0.5, 0.5], [0.22, 0.32], [0.74, 0.30], [0.66, 0.74], [0.30, 0.76]], c0 = P(0.5, 0.5);
        CEN.forEach(function (c, ci) {
          var cq = P(c[0], c[1]);
          if (ci) { ctx.save(); ctx.shadowColor = "rgba(127,211,255,.8)"; ctx.shadowBlur = 10; SK.arrow(ctx, { x: cq[0], y: cq[1] }, { x: lerp(cq[0], c0[0], .7), y: lerp(cq[1], c0[1], .7) }, "rgba(127,211,255,.6)", 2.5, 10); ctx.restore(); }
          for (k = 0; k < 90; k++) {
            var idx = ci * 90 + k, a2 = P2[idx][0] * Math.PI * 2, r4 = Math.pow(P2[idx][1], 0.7) * 0.12;
            var q4 = P(c[0] + r4 * Math.cos(a2), c[1] + r4 * Math.sin(a2));
            SK.glow(ctx, q4[0], q4[1], 1.2, "rgba(215,225,255,.9)", 2.6);
          }
        });
        SK.glow(ctx, c0[0], c0[1], 5, "rgba(255,214,150,.95)", 3.4);
        cap = "은하군·은하단 수십 개가 흐름을 따라 모입니다";
      } else {
        ctx.save(); ctx.shadowColor = "rgba(127,211,255,.9)"; ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(127,211,255,.28)"; ctx.lineWidth = 3;
        for (k = 0; k < NODE.length - 1; k++) {
          var n1 = NODE[k], n2 = NODE[(k * 7 + 3) % NODE.length];
          var dd = Math.sqrt((n1[0] - n2[0]) * (n1[0] - n2[0]) + (n1[1] - n2[1]) * (n1[1] - n2[1]));
          if (dd > 0.42) continue;
          ctx.beginPath(); ctx.moveTo(P(n1[0], n1[1])[0], P(n1[0], n1[1])[1]); ctx.lineTo(P(n2[0], n2[1])[0], P(n2[0], n2[1])[1]); ctx.stroke();
        }
        ctx.restore();
        for (k = 0; k < 900; k++) {
          var nd = NODE[Math.floor(P3[k][2] * NODE.length)];
          var t2 = P3[k][0], other = NODE[(Math.floor(P3[k][2] * NODE.length) * 7 + 3) % NODE.length];
          var fx = nd[0] + (other[0] - nd[0]) * t2 + (P3[k][1] - 0.5) * 0.05;
          var fy = nd[1] + (other[1] - nd[1]) * t2 + (P3[k][1] - 0.5) * 0.05;
          if (fx < 0.02 || fx > 0.98 || fy < 0.02 || fy > 0.98) continue;
          var q5 = P(fx, fy);
          ctx.fillStyle = "rgba(200,230,255,.8)"; ctx.beginPath(); ctx.arc(q5[0], q5[1], 1.3, 0, 6.2832); ctx.fill();
        }
        NODE.forEach(function (n) { var q6 = P(n[0], n[1]); SK.glow(ctx, q6[0], q6[1], 3, "rgba(255,190,130,.95)", 3); });
        cap = "필라멘트(실) · 은하 장성(벽) · 보이드(빈 곳)";
      }
      ctx.restore();
      if (mode === 0) {
        [[0.34, 0.52, 22, "우리은하"], [0.66, 0.40, 24, "안드로메다"], [0.55, 0.72, 14, "삼각형자리"]].forEach(function (g) {
          var q = P(g[0], g[1]); SK.pill(ctx, g[3], q[0], q[1] + g[2] + 16, { s: 11, a: "center", c: SC.ink, box: [px, px + pw] });
        });
      }
      SK.pill(ctx, cap, LW / 2, py + ph - 12, { s: 11, a: "center", c: SC.mute, box: [px, px + pw] });

      /* 오른쪽 */
      var RX = LW + 8, rx = RX + 20, I = INFO[mode];
      SK.stage(ctx, RX, 0, W - RX, H, "night", { seed: 89 });
      SK.t(ctx, "이 규모에서 보이는 것", rx, 44, { s: 11.5, c: SC.mute, w: "800" });
      SK.t(ctx, I.n, rx, 80, { s: 23, w: "900", c: SC.blue });
      SK.line(ctx, { x: rx, y: 100 }, { x: W - 20, y: 100 }, SC.line, 1);
      var steps = [["은하군", "1~3", 0], ["은하단", "2~10", 1], ["초은하단", "50~160", 2], ["거대 구조", "수백", 3]];
      steps.forEach(function (st, k2) {
        var yy = 140 + k2 * 48, on = mode === st[2], sw = 300;
        var gr = ctx.createLinearGradient(rx, 0, rx + sw, 0);
        gr.addColorStop(0, on ? "rgba(127,211,255,.95)" : "rgba(255,255,255,.07)"); gr.addColorStop(1, on ? "rgba(127,150,255,.6)" : "rgba(255,255,255,.03)");
        ctx.save(); if (on) { ctx.shadowColor = SC.blue; ctx.shadowBlur = 14; }
        ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(rx + k2 * 10, yy - 22, sw - k2 * 10, 34, 10); ctx.fill(); ctx.restore();
        SK.t(ctx, st[0], rx + k2 * 10 + 14, yy, { s: 13.5, w: "900", c: on ? "#0b1030" : SC.mute });
        SK.t(ctx, "약 " + st[1] + " Mpc", rx + sw - 14, yy, { s: 12, a: "right", w: "800", c: on ? "#0b1030" : SC.mute });
        var flag = ["a", "b", "c", "d"][k2];
        if (got[flag]) SK.t(ctx, "✓", rx + sw + 14, yy, { s: 15, w: "900", c: SC.green });
      });
      SK.t(ctx, "1 Mpc = 326만 광년", rx, 366, { s: 11, c: SC.mute, w: "600" });
      SK.t(ctx, "중력이 이 계단을 차례로 쌓아 올렸습니다", rx, 390, { s: 11, c: SC.mute, w: "600" });

      var ch = false;
      if (L <= 5 && !got.a) { got.a = ch = true; }
      if (L >= 8 && L <= 30 && !got.b) { got.b = ch = true; }
      if (L >= 60 && L <= 250 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("dScale", got); mission(); }
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
