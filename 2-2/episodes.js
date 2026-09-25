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
      paper(ctx, W, H);
      var t = age(i0), Mto = turnoff(t), to = msAt(Mto);
      var x0 = 90, x1 = 560, y0 = 64, y1 = 330;
      function X(bv) { return x0 + (bv + 0.4) / 2.1 * (x1 - x0); }
      function Y(mv) { return y0 + (mv + 7) / 17 * (y1 - y0); }
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "성단의 C-M도 (색등급도)", x0, 34, { s: 13, w: "900" });
      [[-0.3, "-0.3"], [0.0, "0.0"], [0.5, "0.5"], [1.0, "1.0"], [1.5, "1.5"]].forEach(function (g) {
        text(ctx, g[1], X(g[0]), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "색지수 B−V  (파랗다 ← → 붉다)", (x0 + x1) / 2, y1 + 38, { s: 11, c: v("--mist"), a: "center" });
      [-5, 0, 5].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "절대 등급", x0 - 46, y0 - 14, { s: 11, c: v("--mist") });
      text(ctx, "밝다 ↑", x0 - 46, y0 + 4, { s: 10, c: v("--mist") });

      /* 표준 주계열 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2.5; ctx.beginPath();
      MS.forEach(function (s, k) { if (k === 0) ctx.moveTo(X(s.bv), Y(s.mv)); else ctx.lineTo(X(s.bv), Y(s.mv)); });
      ctx.stroke();

      /* 성단의 별 */
      var jn = 0;
      MS.forEach(function (s) {
        if (s.m > 3.2 * Mto) return;                                    /* 이미 일생을 마친 별 */
        var evolved = s.m > Mto;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 60] * (evolved ? 26 : 13); jn++;
          var dy = JIT[jn % 60] * (evolved ? 22 : 11); jn++;
          var bv = evolved ? 1.28 : s.bv, mv = evolved ? s.mv - 2.4 : s.mv;
          var px = clamp(X(bv) + dx, x0 + 3, x1 - 3), py = clamp(Y(mv) + dy, y0 + 3, y1 - 3);
          ctx.fillStyle = v(evolved ? "--coral" : "--teal");
          ctx.beginPath(); ctx.arc(px, py, evolved ? 4.5 : 3.2, 0, Math.PI * 2); ctx.fill();
        }
      });
      if (Mto < 6) text(ctx, "적색 거성 가지", clamp(X(1.28) + 40, x0, x1 - 60), Y(msAt(Mto).mv - 3.4), { s: 11, w: "800", c: v("--coral-700") });

      /* 이탈점 */
      var tx = clamp(X(to.bv), x0, x1), ty = clamp(Y(to.mv), y0, y1);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(tx, y0); ctx.lineTo(tx, y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "주계열 이탈점", clamp(tx, x0 + 46, x1 - 46), y0 - 10, { s: 11.5, w: "800", a: "center", c: v("--amber-700") });

      /* 오른쪽 값 */
      var rx = 600;
      text(ctx, "나이", rx, 70, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, t >= 1000 ? (t / 1000).toFixed(1) + " 십억 년" : Math.round(t).toLocaleString() + " 백만 년", rx, 98, { s: 19, w: "900" });
      text(ctx, "이탈점의 질량", rx, 138, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, Mto.toFixed(2) + " M☉", rx, 166, { s: 19, w: "900", c: v("--amber-700") });
      text(ctx, "이탈점의 색과 밝기", rx, 206, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, "B−V " + to.bv.toFixed(2) + "  ·  M " + to.mv.toFixed(1), rx, 230, { s: 14, w: "800" });
      text(ctx, "이런 성단", rx, 270, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, label(t), rx, 294, { s: 13.5, w: "800", c: v("--brand-700") });
      text(ctx, "수명(백만 년) ≈ 10,000 × 질량", rx, 340, { s: 11, c: v("--mist") });
      text(ctx, "−2.5", rx + 178, 334, { s: 9, c: v("--mist") });
      text(ctx, "무거운 별일수록 먼저 주계열을 떠납니다", rx, 360, { s: 11, c: v("--mist") });

      var ch = false;
      if (Mto >= 5 && !got.a) { got.a = ch = true; }
      if (Mto >= 1.8 && Mto <= 2.3 && !got.b) { got.b = ch = true; }
      if (Mto <= 1.0 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("aCmd", got); mission(); }
      $("a-cmd-info").innerHTML = "이 성단의 나이가 <b>" + (t >= 1000 ? (t / 1000).toFixed(1) + "십억 년" : Math.round(t).toLocaleString() + "백만 년") +
        "</b> 이면, 태양 질량의 <b>" + Mto.toFixed(2) + "배</b> 보다 무거운 별은 이미 주계열을 떠났습니다. " +
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
      $("a-age-val").textContent = t >= 1000 ? (t / 1000).toFixed(1) + "십억 년" : Math.round(t).toLocaleString() + "백만 년";
      draw();
    });
    (function () { var t = age(i0); $("a-age-val").textContent = Math.round(t).toLocaleString() + "백만 년"; })();
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

    function draw() {
      paper(ctx, W, H);
      var C = CL[s], d = dist(i0), mu = 5 * lg(d / 10), muT = C.mo - REF_M;
      var diff = (REF_M + mu) - C.mo;
      var ok = Math.abs(diff) <= 0.06;
      var x0 = 90, x1 = 520, y0 = 60, y1 = 340;
      function X(bv) { return x0 + (bv + 0.4) / 2.1 * (x1 - x0); }
      function Y(m) { return y0 + m / 24 * (y1 - y0); }
      axes(ctx, x0, y0, x1, y1);
      text(ctx, C.n + " 의 관측 자료", x0, 38, { s: 13, w: "900" });
      [[-0.3, "-0.3"], [0.3, "0.3"], [0.9, "0.9"], [1.5, "1.5"]].forEach(function (g) {
        text(ctx, g[1], X(g[0]), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "색지수 B−V", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      [0, 6, 12, 18, 24].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "겉보기 등급", x0 - 52, y0 - 16, { s: 11, c: v("--mist") });

      /* 관측점 */
      var jn = 0;
      MS.forEach(function (st) {
        if (st.m > C.to) return;
        for (var k = 0; k < 4; k++) {
          var dx = JIT[jn % 80] * 14; jn++;
          var dy = JIT[jn % 80] * 12; jn++;
          var px = clamp(X(st.bv) + dx, x0 + 3, x1 - 3), py = clamp(Y(st.mv + muT) + dy, y0 + 3, y1 - 3);
          ctx.fillStyle = v("--coral");
          ctx.beginPath(); ctx.arc(px, py, 3.4, 0, Math.PI * 2); ctx.fill();
        }
      });
      /* 내가 옮긴 표준 주계열 */
      ctx.strokeStyle = v(ok ? "--teal" : "--brand"); ctx.lineWidth = 3; ctx.beginPath();
      var started = false;
      MS.forEach(function (st) {
        var yy = st.mv + mu;
        if (yy < -1 || yy > 25) { started = false; return; }
        var px = X(st.bv), py = Y(clamp(yy, 0, 24));
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      });
      ctx.stroke();
      text(ctx, "내가 옮긴 표준 주계열", x0 + 8, y0 + 16, { s: 11.5, w: "800", c: v(ok ? "--teal-700" : "--brand-700") });
      text(ctx, "● 관측된 성단의 별", x0 + 8, y0 + 34, { s: 11.5, w: "800", c: v("--coral-700") });

      /* 오른쪽 */
      var rx = 560;
      text(ctx, "기준 별", rx, 66, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, "B−V = +0.35 인 주계열 별", rx, 88, { s: 12.5 });
      text(ctx, "절대 등급 M = +3.00", rx, 110, { s: 12.5 });
      text(ctx, "관측된 겉보기 등급 m = " + C.mo.toFixed(2), rx, 132, { s: 13, w: "800", c: v("--coral-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 150); ctx.lineTo(870, 150); ctx.stroke();
      text(ctx, "내가 놓아 본 거리", rx, 176, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, (d < 1000 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc", rx, 204, { s: 20, w: "900" });
      text(ctx, "거리 지수 m − M = " + mu.toFixed(2), rx, 230, { s: 12.5, c: v("--mist") });
      text(ctx, "→ 기준 별이 " + (REF_M + mu).toFixed(2) + " 등급으로 보인다", rx, 252, { s: 12.5 });
      text(ctx, ok ? "✅ 관측값과 겹칩니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"),
        rx, 288, { s: 16, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, "m − M = 5 log (거리 / 10 pc)", rx, 320, { s: 11.5, c: v("--mist") });
      text(ctx, C.note + " · 나이 " + C.age, rx, 344, { s: 11, c: v("--mist") });

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
    { n: "세페이드 나", P: 10.000, i: 50, m: 10.28, where: "궁수자리 쪽 구상 성단 속" },
    { n: "세페이드 다", P: 31.623, i: 75, m: 10.24, where: "궁수자리 쪽 먼 성단 속" }
  ];
  (function () {
    var canvas = $("a-c-cep"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, i0 = 10, got = window.sthState("aCep") || [false, false, false];
    function per(i) { return Math.pow(10, 0.02 * i); }
    function absMag(P) { return -2.81 * lg(P) - 1.43; }
    function phase(u) { return u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75; }

    function draw() {
      paper(ctx, W, H);
      var C = CEP[s], P = per(i0), ok = Math.abs(lg(P / C.P)) < 0.005;
      var M = absMag(C.P), d = Math.pow(10, (C.m - M + 5) / 5);
      var win = 6 * C.P;
      var x0 = 70, x1 = 460, y0 = 70, y1 = 250;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "광도곡선 — " + win.toFixed(0) + "일 동안", x0, 44, { s: 12.5, w: "900" });
      text(ctx, "시간 →", x1, y1 + 30, { s: 11, c: v("--mist"), a: "right" });
      text(ctx, "밝다", x0 - 44, y0 + 8, { s: 10.5, c: v("--mist") });
      /* 관측점 */
      ctx.fillStyle = v("--coral");
      for (var k = 0; k <= 70; k++) {
        var tt = k / 70 * win;
        var rel = phase((tt / C.P) % 1);
        var px = x0 + k / 70 * (x1 - x0), py = y1 - (0.12 + 0.72 * rel) * (y1 - y0);
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
      /* 내 모형 */
      ctx.strokeStyle = v(ok ? "--teal" : "--brand"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var j = 0; j <= 400; j++) {
        var t2 = j / 400 * win;
        var r2 = phase((t2 / P) % 1);
        var qx = x0 + j / 400 * (x1 - x0), qy = y1 - (0.12 + 0.72 * r2) * (y1 - y0);
        if (j === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
      }
      ctx.stroke();
      text(ctx, "● 관측", x0 + 10, y0 + 18, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "— 내 모형", x0 + 70, y0 + 18, { s: 11.5, w: "800", c: v(ok ? "--teal-700" : "--brand-700") });

      /* 주기-광도 그래프 */
      var a0 = 560, a1 = 870, b0 = 70, b1 = 250;
      axes(ctx, a0, b0, a1, b1);
      function PX(p) { return a0 + lg(p) / 2 * (a1 - a0); }
      function PY(mm) { return b1 - (-mm) / 7 * (b1 - b0); }
      text(ctx, "주기-광도 관계", a0, 44, { s: 12.5, w: "900" });
      [[1, "1"], [10, "10"], [100, "100"]].forEach(function (g) {
        text(ctx, g[1], PX(g[0]), b1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "변광 주기(일)", (a0 + a1) / 2, b1 + 36, { s: 11, c: v("--mist"), a: "center" });
      [0, -2, -4, -6].forEach(function (g) {
        text(ctx, String(g), a0 - 8, PY(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
      });
      text(ctx, "절대 등급", a0 - 40, b0 - 16, { s: 11, c: v("--mist") });
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 3; ctx.beginPath();
      for (var w2 = 0; w2 <= 100; w2++) {
        var pp = Math.pow(10, 2 * w2 / 100);
        if (w2 === 0) ctx.moveTo(PX(pp), PY(absMag(pp))); else ctx.lineTo(PX(pp), PY(absMag(pp)));
      }
      ctx.stroke();
      ctx.fillStyle = v(ok ? "--teal" : "--brand");
      ctx.beginPath(); ctx.arc(PX(P), clamp(PY(absMag(P)), b0, b1), 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "주기가 길수록 더 밝다", a0 + 8, b0 + 18, { s: 11, w: "800", c: v("--violet-700") });

      /* 아래 결과 */
      text(ctx, "내 모형의 주기 " + P.toFixed(2) + "일", 70, 300, { s: 15, w: "900" });
      text(ctx, ok ? "✅ 관측과 딱 겹칩니다" : (P < C.P ? "모형이 너무 자주 뜁니다" : "모형이 너무 느리게 뜁니다"),
        320, 300, { s: 15, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      if (ok) {
        text(ctx, "절대 등급 M = −2.81 log P − 1.43 = " + M.toFixed(2), 70, 332, { s: 13.5, w: "800", c: v("--violet-700") });
        text(ctx, "관측된 겉보기 등급 m = " + C.m.toFixed(2) + "  →  거리 " + Math.round(d).toLocaleString() + " pc",
          70, 358, { s: 15, w: "900", c: v("--teal-700") });
      } else {
        text(ctx, "관측된 겉보기 등급 m = " + C.m.toFixed(2) + "  ·  " + C.where, 70, 332, { s: 13, c: v("--mist") });
        text(ctx, "주기를 맞히면 절대 등급과 거리가 나옵니다", 70, 358, { s: 13, c: v("--mist") });
      }

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
    /* 구상 성단 34개 — (8, 0) kpc 를 중심으로 퍼진 헤일로 */
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

    function draw() {
      paper(ctx, W, H);
      var SUN = { x: 130, y: 230 }, S = 10;
      function PX(x) { return SUN.x + x * S; }
      function PY(y) { return SUN.y - y * S; }
      text(ctx, "위에서 내려다본 우리은하 (1칸 = 5 kpc)", 30, 34, { s: 12.5, w: "900" });

      /* 눈금 */
      ctx.strokeStyle = v("--line"); ctx.globalAlpha = .45; ctx.lineWidth = 1;
      for (var g = -5; g <= 25; g += 5) { ctx.beginPath(); ctx.moveTo(PX(g), 60); ctx.lineTo(PX(g), 400); ctx.stroke(); }
      for (var h = -15; h <= 15; h += 5) { ctx.beginPath(); ctx.moveTo(40, PY(h)); ctx.lineTo(420, PY(h)); ctx.stroke(); }
      ctx.globalAlpha = 1;

      /* 나선팔 — 내가 놓은 중심을 둘레로 */
      var b = Math.tan(pit * Math.PI / 180);
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 7; ctx.globalAlpha = .38;
      for (var arm = 0; arm < 2; arm++) {
        ctx.beginPath(); var st = false;
        for (var th2 = 0; th2 < 5.2; th2 += 0.04) {
          var r = 0.9 * Math.exp(b * th2);
          if (r > 13) break;
          var ang = th2 + arm * Math.PI;
          var px = PX(c0 + r * Math.cos(ang)), py = PY(r * Math.sin(ang));
          if (!st) { ctx.moveTo(px, py); st = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      /* 구상 성단 */
      CLU.forEach(function (o) {
        ctx.fillStyle = v("--coral");
        ctx.beginPath(); ctx.arc(PX(o.x), PY(o.y), 4.5, 0, Math.PI * 2); ctx.fill();
      });
      /* 태양 */
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(SUN.x, SUN.y, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "태양", SUN.x, SUN.y + 24, { s: 11.5, w: "800", a: "center", c: v("--amber-700") });
      /* 내가 놓은 중심 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(PX(c0), PY(0), 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX(c0) - 16, PY(0)); ctx.lineTo(PX(c0) + 16, PY(0)); ctx.stroke();
      text(ctx, "내가 놓은 중심", clamp(PX(c0), 90, 380), PY(0) - 20, { s: 11.5, w: "800", a: "center", c: v("--violet-700") });
      text(ctx, "→ 궁수자리 방향", 300, 400, { s: 11, c: v("--mist") });

      /* 오른쪽 — 치우침 */
      var rx = 470, skew = 8.0 - c0;
      text(ctx, "내가 놓은 중심에서 본 성단들의 치우침", rx, 70, { s: 12.5, w: "900" });
      var bx = rx, bw = 390, by = 100;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(bx, by, bw, 34, 10); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.stroke();
      var mid = bx + bw / 2;
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(mid, by - 6); ctx.lineTo(mid, by + 40); ctx.stroke(); ctx.setLineDash([]);
      var wpx = clamp(skew * 17, -bw / 2 + 4, bw / 2 - 4);
      ctx.fillStyle = v(Math.abs(skew) <= 0.5 ? "--teal" : "--rose");
      ctx.fillRect(wpx < 0 ? mid + wpx : mid, by + 6, Math.abs(wpx), 22);
      text(ctx, "0", mid, by + 54, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, Math.abs(skew).toFixed(1) + " kpc " + (Math.abs(skew) <= 0.5 ? "— 고르게 퍼졌습니다" : (skew > 0 ? "— 성단들이 아직 앞쪽에 쏠려 있습니다" : "— 중심을 너무 멀리 밀었습니다")),
        rx, by + 78, { s: 14, w: "900", c: Math.abs(skew) <= 0.5 ? v("--teal-700") : v("--rose-700") });

      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 200); ctx.lineTo(870, 200); ctx.stroke();
      text(ctx, "구상 성단 " + CLU.length + "개 · 헤일로 반지름 약 " + RMAX.toFixed(0) + " kpc", rx, 226, { s: 13, w: "800" });
      text(ctx, "→ 헤일로 지름 약 " + (RMAX * 2).toFixed(0) + " kpc ≈ " + Math.round(RMAX * 2 * 0.3262) + "만 광년", rx, 250, { s: 13, w: "800", c: v("--brand-700") });
      text(ctx, "나선팔 피치각 " + pit + "°", rx, 282, { s: 13, w: "800" });
      text(ctx, pit < 12 ? "촘촘하게 감긴 나선" : (pit > 20 ? "느슨하게 열린 나선" : "우리은하와 비슷하게 감긴 나선(약 12°)"),
        rx, 304, { s: 12, c: v("--mist") });
      text(ctx, "산개 성단과 성간 물질은 이 얇은 원반에,", rx, 336, { s: 12, c: v("--mist") });
      text(ctx, "구상 성단은 원반을 감싼 공 모양 헤일로에 있습니다.", rx, 356, { s: 12, c: v("--mist") });

      if (Math.abs(skew) <= 0.5 && !got.a) { got.a = true; window.sthState("aCen", got); mission(); }
      $("a-cen-info").innerHTML = "성단들이 <b>어느 한 점을 중심으로 고르게</b> 퍼져 있다면, 그 점이 은하의 중심입니다. 태양을 중심에 두면 성단이 한쪽으로 쏠려 보이지만, 중심을 궁수자리 쪽으로 밀수록 쏠림이 줄어듭니다." +
        (got.a ? " <b>태양은 은하 중심에서 약 8 kpc(2만 6천 광년) 떨어진 변두리에 있습니다.</b>" : "");
    }
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

    function draw() {
      paper(ctx, W, H);
      var ds = [], Ds = [];
      TCL.forEach(function (c) { var d = deRedden(c.dp, a0); ds.push(d); Ds.push(c.th * d / RAD); });
      var mx = Math.max.apply(null, Ds), mn = Math.min.apply(null, Ds), ratio = mx / mn;
      var ok = ratio <= 1.06;

      /* 왼쪽 산점도 */
      var x0 = 80, x1 = 450, y0 = 70, y1 = 290;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "성단의 거리와 계산된 지름", x0, 44, { s: 12.5, w: "900" });
      function X(d) { return x0 + clamp(d / 8500, 0, 1) * (x1 - x0); }
      function Y(D) { return y1 - clamp(D / 12, 0, 1) * (y1 - y0); }
      [0, 2000, 4000, 6000, 8000].forEach(function (g) {
        text(ctx, (g / 1000) + "", X(g), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "거리 (kpc) →", x1, y1 + 36, { s: 11, c: v("--mist"), a: "right" });
      [0, 4, 8, 12].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "계산된 지름 (pc)", x0 - 20, y0 - 16, { s: 11, c: v("--mist") });
      ctx.strokeStyle = v(ok ? "--teal" : "--rose"); ctx.lineWidth = 2.5; ctx.beginPath();
      ds.forEach(function (d, k) { if (k === 0) ctx.moveTo(X(d), Y(Ds[k])); else ctx.lineTo(X(d), Y(Ds[k])); });
      ctx.stroke();
      ds.forEach(function (d, k) {
        ctx.fillStyle = v(ok ? "--teal" : "--rose");
        ctx.beginPath(); ctx.arc(X(d), Y(Ds[k]), 6, 0, Math.PI * 2); ctx.fill();
      });
      text(ctx, ok ? "기울기가 사라졌습니다" : "먼 성단일수록 커집니다", x0 + 10, y0 + 20, { s: 11.5, w: "800", c: v(ok ? "--teal-700" : "--rose-700") });

      /* 오른쪽 막대 */
      var rx = 500;
      text(ctx, "성단별 계산 결과", rx, 44, { s: 12.5, w: "900" });
      text(ctx, "각지름", rx, 68, { s: 10.5, c: v("--mist"), w: "800" });
      text(ctx, "보정한 거리", rx + 75, 68, { s: 10.5, c: v("--mist"), w: "800" });
      text(ctx, "지름", rx + 185, 68, { s: 10.5, c: v("--mist"), w: "800" });
      TCL.forEach(function (c, k) {
        var yy = 96 + k * 44;
        text(ctx, c.th.toFixed(1) + "′", rx, yy, { s: 12.5, w: "800" });
        text(ctx, Math.round(ds[k]).toLocaleString() + " pc", rx + 75, yy, { s: 12.5 });
        var bl = clamp(Ds[k] * 10, 2, 120);
        ctx.fillStyle = v(ok ? "--teal" : "--brand");
        ctx.fillRect(rx + 185, yy - 11, bl, 13);
        text(ctx, Ds[k].toFixed(2) + " pc", rx + 190 + bl, yy, { s: 11.5, w: "800" });
      });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 282); ctx.lineTo(880, 282); ctx.stroke();
      text(ctx, "가장 큰 지름 ÷ 가장 작은 지름 = " + ratio.toFixed(2) + " 배", rx, 308, { s: 14, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, ok ? "✅ 네 성단의 지름이 거의 같아졌습니다" : "아직 어긋납니다 (1.06배 안쪽이면 합격)", rx, 332, { s: 12.5, w: "800", c: ok ? v("--teal-700") : v("--mist") });

      text(ctx, "소광량 " + a0.toFixed(2) + " 등급/kpc", 80, 340, { s: 16, w: "900" });
      text(ctx, "보정 전 거리 = 보정 후 거리 × 10^(소광량 × 거리 ÷ 5)", 80, 366, { s: 11, c: v("--mist") });

      if (ok && !got.a) { got.a = true; window.sthState("bTru", got); mission(); }
      $("b-tru-info").innerHTML = "별빛이 1 kpc 를 지날 때마다 <b>" + a0.toFixed(2) + "등급</b> 씩 깎인다고 보고 거리를 다시 계산했습니다. " +
        (a0 === 0 ? "소광을 넣지 않으면 먼 성단일수록 지름이 걷잡을 수 없이 커집니다."
          : (ok ? "네 성단의 지름이 <b>약 4 pc</b> 로 거의 같아졌습니다. 성단의 크기가 비슷하다는 상식과 맞습니다."
            : "아직 기울기가 남아 있습니다. 너무 적게 넣으면 먼 성단이 크게, 너무 많이 넣으면 먼 성단이 작게 나옵니다."));
    }
    function mission() {
      if (got.a) done("m2-2a"); if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>1 kpc 마다 약 <b>0.7등급</b>. 별빛은 오는 길에 <b>깎이고 있었습니다.</b> 그것을 몰랐기에 모든 거리가 실제보다 멀게 나왔던 것입니다.");
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

    function draw() {
      paper(ctx, W, H);
      var S = RED[s], ok = Math.abs(e0 - S.E) <= 0.005;
      var Av = 3.1 * e0, bvTry = S.bv0 + e0;
      var d0 = Math.pow(10, (S.m - S.M + 5) / 5);
      var dC = Math.pow(10, (S.m - Av - S.M + 5) / 5);

      /* 왼쪽 소광 곡선 */
      var x0 = 80, x1 = 430, y0 = 70, y1 = 240;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "파장에 따라 깎이는 정도", x0, 44, { s: 12.5, w: "900" });
      function LX(l) { return x0 + (lg(l) - lg(330)) / (lg(2500) - lg(330)) * (x1 - x0); }
      function LY(r) { return y1 - r / 1.8 * (y1 - y0); }
      [[365, "U"], [440, "B"], [550, "V"], [700, "R"], [1250, "J"], [2200, "K"]].forEach(function (g) {
        text(ctx, g[1], LX(g[0]), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "짧은 파장(파랑) ← → 긴 파장(빨강)", (x0 + x1) / 2, y1 + 36, { s: 10.5, c: v("--mist"), a: "center" });
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 3; ctx.beginPath();
      EXT.forEach(function (g, k) { if (k === 0) ctx.moveTo(LX(g[0]), LY(g[1])); else ctx.lineTo(LX(g[0]), LY(g[1])); });
      ctx.stroke();
      [[440, 1.32, "--brand"], [550, 1.00, "--green"]].forEach(function (g) {
        ctx.fillStyle = v(g[2]); ctx.beginPath(); ctx.arc(LX(g[0]), LY(g[1]), 6, 0, Math.PI * 2); ctx.fill();
      });
      text(ctx, "파란빛이 훨씬 많이 깎입니다", x0 + 10, y0 + 18, { s: 11.5, w: "800", c: v("--violet-700") });
      text(ctx, "A(B) − A(V) = 색초과 E(B−V)", x0 + 10, y0 + 38, { s: 11, c: v("--mist") });

      /* 오른쪽 색 비교 */
      var rx = 490;
      text(ctx, S.n + " 의 색", rx, 44, { s: 12.5, w: "900" });
      [{ t: "원래 색 (스펙트럼형)", bv: S.bv0, x: rx + 40 },
       { t: "내 모형", bv: bvTry, x: rx + 180 },
       { t: "관측된 색", bv: S.bvo, x: rx + 320 }].forEach(function (o) {
        ctx.fillStyle = bvColor(o.bv);
        ctx.beginPath(); ctx.arc(o.x, 110, 30, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
        text(ctx, o.t, o.x, 158, { s: 11, a: "center", c: v("--mist"), w: "800" });
        text(ctx, "B−V " + (o.bv >= 0 ? "+" : "") + o.bv.toFixed(2), o.x, 178, { s: 12.5, a: "center", w: "800" });
      });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 200); ctx.lineTo(870, 200); ctx.stroke();
      text(ctx, "내가 넣은 색초과 E(B−V) = " + e0.toFixed(2), rx, 228, { s: 14, w: "900" });
      text(ctx, ok ? "✅ 관측된 색과 맞습니다" : (bvTry < S.bvo ? "아직 덜 붉습니다" : "너무 붉게 만들었습니다"),
        rx, 254, { s: 14, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      if (ok) {
        text(ctx, "소광량 A(V) = 3.1 × E(B−V) = " + Av.toFixed(2) + " 등급", rx, 288, { s: 13.5, w: "800", c: v("--violet-700") });
        text(ctx, "보정 전 거리 " + Math.round(d0).toLocaleString() + " pc", rx, 316, { s: 13.5, c: v("--rose-700"), w: "800" });
        text(ctx, "보정 후 거리 " + Math.round(dC).toLocaleString() + " pc", rx, 342, { s: 16, w: "900", c: v("--teal-700") });
        text(ctx, "보정하지 않으면 " + (d0 / dC).toFixed(1) + "배나 멀게 나옵니다", rx, 368, { s: 11.5, c: v("--mist") });
      } else {
        text(ctx, "관측 자료 : 겉보기 등급 m = " + S.m.toFixed(2) + ", 절대 등급 M = " + S.M.toFixed(1), rx, 292, { s: 12, c: v("--mist") });
        text(ctx, "색을 맞히면 소광량과 참거리가 나옵니다", rx, 318, { s: 12, c: v("--mist") });
      }

      if (ok && !got[s]) { got[s] = true; window.sthState("bRed", got); mission(); }
      $("b-red-info").innerHTML = "스펙트럼형을 보면 그 별이 <b>원래 어떤 색</b>이어야 하는지 알 수 있습니다. 관측된 색이 그보다 붉다면, 그 차이가 티끌이 만든 <b>색초과 E(B−V)</b> 입니다. 관측에서 소광량은 색초과의 약 <b>3.1배</b> 로 알려져 있어, 색만 재면 얼마나 어두워졌는지도 알 수 있습니다.";
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

    function draw() {
      paper(ctx, W, H);
      var T = temp(i0), f = ionFrac(T), lam = 2.898e6 / T;
      var emit = T >= 25000, refl = T <= 12000;

      /* 그림판 */
      var px = 40, py = 60, pw = 480, ph = 280;
      ctx.fillStyle = v("--abyss"); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 14); ctx.fill();
      /* 배경별 */
      ctx.fillStyle = v("--on-accent"); ctx.globalAlpha = .75;
      bg.forEach(function (q) { ctx.beginPath(); ctx.arc(px + q[0] * pw, py + q[1] * ph, 1.4, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
      /* 암흑성운 — 앞을 가리는 티끌 구름 */
      ctx.fillStyle = v("--abyss"); ctx.globalAlpha = .96;
      ctx.beginPath(); ctx.ellipse(px + 110, py + 205, 78, 46, -0.25, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--mist"); ctx.globalAlpha = .4; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
      text(ctx, "암흑성운", px + 110, py + 208, { s: 12, a: "center", w: "800", c: v("--mist") });
      text(ctx, "뒤의 별빛을 가린다", px + 110, py + 228, { s: 10, a: "center", c: v("--mist") });
      /* 성운 */
      var gx = px + 320, gy = py + 130;
      ctx.fillStyle = emit ? v("--rose") : (refl ? v("--brand") : v("--mist"));
      ctx.globalAlpha = emit ? .7 : (refl ? .55 : .22);
      ctx.beginPath(); ctx.ellipse(gx, gy, 96, 70, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = emit ? .45 : (refl ? .3 : .12);
      ctx.beginPath(); ctx.ellipse(gx, gy, 130, 96, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      /* 별 */
      var sx = gx - 40, sy = gy - 20;
      ctx.fillStyle = bvColor(T > 20000 ? -0.3 : (T > 9000 ? 0.0 : (T > 6000 ? 0.6 : 1.4)));
      ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill();
      if (emit) {
        ctx.strokeStyle = v("--violet"); ctx.lineWidth = 1.5; ctx.globalAlpha = .8;
        for (var k = 0; k < 10; k++) {
          var ang = k / 10 * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(sx + 18 * Math.cos(ang), sy + 18 * Math.sin(ang));
          ctx.lineTo(sx + 40 * Math.cos(ang), sy + 40 * Math.sin(ang)); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      text(ctx, emit ? "방출성운" : (refl ? "반사성운" : "아직 어느 쪽도 아닙니다"), gx, py + 246,
        { s: 14, a: "center", w: "900", c: emit ? v("--rose-700") : (refl ? v("--brand-700") : v("--mist")) });

      /* 오른쪽 값 */
      var rx = 560;
      text(ctx, "별의 표면 온도", rx, 76, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, Math.round(T).toLocaleString() + " K", rx, 106, { s: 21, w: "900" });
      text(ctx, "가장 세게 내는 빛의 파장", rx, 146, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, Math.round(lam) + " nm", rx, 172, { s: 15, w: "800" });
      text(ctx, "수소를 이온화할 수 있는 자외선의 비율", rx, 210, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, (f * 100).toFixed(2) + " %", rx, 238, { s: 21, w: "900", c: f > 0.1 ? v("--rose-700") : v("--brand-700") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(rx, 252, 300, 16, 8); ctx.fill();
      ctx.fillStyle = f > 0.1 ? v("--rose") : v("--brand");
      ctx.fillRect(rx, 252, clamp(f * 600, 1, 300), 16);
      text(ctx, "파장 91.2 nm 보다 짧은 자외선만 수소를 이온화합니다", rx, 288, { s: 11, c: v("--mist") });
      text(ctx, emit ? "이온화된 수소가 스스로 붉은빛을 냅니다" : (refl ? "이온화는 거의 없고, 티끌이 별빛을 산란시킵니다" : "온도를 더 올리거나 내려 보세요"),
        rx, 320, { s: 12.5, w: "800", c: emit ? v("--rose-700") : (refl ? v("--brand-700") : v("--mist")) });
      text(ctx, "파란빛이 더 잘 산란되므로 반사성운은 푸릅니다", rx, 348, { s: 11, c: v("--mist") });

      var ch = false;
      if (emit && !got.a) { got.a = ch = true; }
      if (refl && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("bNeb", got); mission(); }
      $("b-neb-info").innerHTML = "성운의 얼굴을 정하는 것은 <b>곁에 있는 별의 온도</b>입니다. 온도가 2만 5천 K 가 넘는 O·B형 별은 수소를 이온화할 만큼 짧은 자외선을 많이 내놓아 성운이 <b>스스로 붉게</b> 빛나게 하고(방출성운), 그보다 차가운 별 곁에서는 티끌이 별빛을 <b>산란</b>시켜 파랗게 보입니다(반사성운). 뒤쪽 별빛을 가리기만 하면 <b>암흑성운</b>입니다.";
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
        : "각지름은 단순해서 틀릴 여지가 거의 없었습니다. 어긋난 쪽은 밝기로 잰 거리였지요.");
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

    function draw() {
      paper(ctx, W, H);
      var P = PL[s], tv = target(P), ok = Math.abs(vv - tv) <= 0.15;
      /* 왼쪽 태양계 */
      var cx = 220, cy = 190;
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
      text(ctx, "태양계 — 질량이 거의 전부 한가운데에", 50, 44, { s: 12.5, w: "900" });
      PL.forEach(function (p, k) {
        var rr = 40 + 45 * lg(1 + p.a * 2.2);
        ctx.strokeStyle = v(p.c); ctx.globalAlpha = k === s ? 1 : .35; ctx.lineWidth = k === s ? 2.5 : 1.5;
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.fillStyle = v(p.c); ctx.globalAlpha = k === s ? 1 : .4;
        ctx.beginPath(); ctx.arc(cx + rr, cy, k === s ? 8 : 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, p.n, cx + rr, cy - (k === s ? 18 : 13), { s: 11, a: "center", w: "800", c: v(p.c + "-700") });
      });
      text(ctx, "안쪽일수록 빠르게 돕니다", 50, 340, { s: 11.5, c: v("--mist") });

      /* 오른쪽 그래프 */
      var x0 = 470, x1 = 860, y0 = 70, y1 = 250;
      axes(ctx, x0, y0, x1, y1);
      function X(r) { return x0 + lg(r) / lg(40) * (x1 - x0); }
      function Y(vq) { return y1 - clamp(vq / 40, 0, 1) * (y1 - y0); }
      [[1, "1"], [5, "5"], [30, "30"]].forEach(function (g) {
        text(ctx, g[1], X(g[0]), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "태양에서의 거리 (AU)", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      [0, 10, 20, 30, 40].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
      });
      text(ctx, "공전 속도 (km/s)", x0 - 30, y0 - 16, { s: 11, c: v("--mist") });
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.beginPath();
      for (var k2 = 0; k2 <= 100; k2++) {
        var rr2 = Math.pow(10, lg(40) * k2 / 100);
        if (rr2 < 0.7) continue;
        if (k2 === 0) ctx.moveTo(X(rr2), Y(29.78 / Math.sqrt(rr2))); else ctx.lineTo(X(rr2), Y(29.78 / Math.sqrt(rr2)));
      }
      ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "v = 29.8 / √(거리)", x0 + 12, y0 + 18, { s: 11.5, w: "800", c: v("--mist") });
      /* 내 값 */
      ctx.fillStyle = v(ok ? "--teal" : "--coral");
      ctx.beginPath(); ctx.arc(X(P.a), Y(vv), 8, 0, Math.PI * 2); ctx.fill();

      text(ctx, P.n + " (" + P.a.toFixed(2) + " AU)", 470, 300, { s: 14, w: "900" });
      text(ctx, "내가 계산한 속도 " + vv.toFixed(1) + " km/s", 470, 326, { s: 15, w: "900" });
      text(ctx, ok ? "✅ 맞습니다" : (vv > tv ? "너무 빠릅니다" : "아직 느립니다"), 740, 326, { s: 15, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, "질량이 가운데 몰려 있으면 v 는 거리의 제곱근에 반비례합니다", 470, 356, { s: 11, c: v("--mist") });

      if (ok && !got[s]) { got[s] = true; window.sthState("cKep", got); mission(); }
      $("c-kep-info").innerHTML = "태양계는 질량의 <b>99.8%</b> 가 태양 하나에 몰려 있습니다. 이런 계에서는 바깥으로 갈수록 중력이 약해져 <b>공전 속도가 느려집니다</b>. 은하의 빛도 중심에 몰려 있으니, 루빈도 같은 모양의 그래프를 예상했습니다." +
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
      paper(ctx, W, H);
      var e = rms(Vh), ok = e <= 5.0;
      var x0 = 90, x1 = 620, y0 = 66, y1 = 300;
      axes(ctx, x0, y0, x1, y1);
      function X(r) { return x0 + r / 22 * (x1 - x0); }
      function Y(vq) { return y1 - clamp(vq / 280, 0, 1) * (y1 - y0); }
      text(ctx, "은하의 회전 속도 곡선", x0, 34, { s: 13, w: "900" });
      [0, 5, 10, 15, 20].forEach(function (g) {
        text(ctx, String(g), X(g), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "은하 중심에서의 거리 (kpc) →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      [0, 100, 200].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "회전 속도 (km/s)", x0 - 34, y0 - 14, { s: 11, c: v("--mist") });

      /* 보이는 물질만 */
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.beginPath();
      for (var k = 1; k <= 100; k++) {
        var r = 22 * k / 100;
        if (k === 1) ctx.moveTo(X(r), Y(vvis(r))); else ctx.lineTo(X(r), Y(vvis(r)));
      }
      ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "보이는 물질만 넣은 곡선", X(13), Y(vvis(13)) + 22, { s: 11.5, w: "800", c: v("--mist") });
      /* 헤일로만 */
      if (Vh > 0) {
        ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2; ctx.globalAlpha = .6; ctx.setLineDash([2, 4]); ctx.beginPath();
        for (var k3 = 1; k3 <= 100; k3++) {
          var r3 = 22 * k3 / 100;
          if (k3 === 1) ctx.moveTo(X(r3), Y(vhalo(r3, Vh))); else ctx.lineTo(X(r3), Y(vhalo(r3, Vh)));
        }
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        text(ctx, "암흑 물질 헤일로만", X(18), clamp(Y(vhalo(18, Vh)) + 20, y0, y1), { s: 11, w: "800", c: v("--violet-700") });
      }
      /* 전체 */
      ctx.strokeStyle = v(ok ? "--teal" : "--brand"); ctx.lineWidth = 3.5; ctx.beginPath();
      for (var k2 = 1; k2 <= 100; k2++) {
        var r2 = 22 * k2 / 100;
        if (k2 === 1) ctx.moveTo(X(r2), Y(vtot(r2, Vh))); else ctx.lineTo(X(r2), Y(vtot(r2, Vh)));
      }
      ctx.stroke();
      /* 관측점 */
      RS.forEach(function (r, i) {
        ctx.fillStyle = v("--coral");
        ctx.beginPath(); ctx.arc(X(r), Y(OBS[i]), 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(X(r), Y(OBS[i] - 8)); ctx.lineTo(X(r), Y(OBS[i] + 8)); ctx.stroke();
      });
      text(ctx, "● 루빈의 관측점", x0 + 10, y0 + 18, { s: 11.5, w: "800", c: v("--coral-700") });

      /* 오른쪽 */
      var rx = 650, Mh20 = Math.pow(vhalo(20, Vh) / KV, 2) * 20, Mv20 = Mvis(20);
      text(ctx, "헤일로의 세기", rx, 70, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, Vh + " km/s", rx, 98, { s: 20, w: "900", c: v("--violet-700") });
      text(ctx, "관측점과의 어긋남", rx, 138, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, e.toFixed(1) + " km/s", rx, 164, { s: 18, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, ok ? "✅ 관측과 잘 맞습니다" : (Vh < 185 ? "곡선이 관측점보다 아래입니다" : "곡선이 관측점보다 위입니다"),
        rx, 192, { s: 12.5, w: "800", c: ok ? v("--teal-700") : v("--rose-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 212); ctx.lineTo(880, 212); ctx.stroke();
      text(ctx, "20 kpc 안쪽의 질량 (10¹⁰ M☉)", rx, 238, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, "보이는 물질 " + Mv20.toFixed(1), rx, 264, { s: 13.5, w: "800" });
      text(ctx, "암흑 물질 " + Mh20.toFixed(1), rx, 288, { s: 13.5, w: "800", c: v("--violet-700") });
      text(ctx, "M = v² r / G", rx, 322, { s: 12, c: v("--mist") });
      text(ctx, "속도가 줄지 않는다는 것은", rx, 348, { s: 11.5, c: v("--mist") });
      text(ctx, "질량이 계속 더해진다는 뜻입니다", rx, 368, { s: 11.5, c: v("--mist") });

      if (ok && !got.a) { got.a = true; window.sthState("cRot", got); mission(); }
      $("c-rot-info").innerHTML = "보이는 별과 가스만 넣으면 곡선은 <b>케플러처럼 처집니다</b>. 관측점은 20 kpc 에서도 220 km/s 가까이 유지되지요. 은하를 공처럼 둘러싼 보이지 않는 물질을 더하면 두 곡선이 겹칩니다." +
        (got.a ? " <b>필요한 헤일로의 세기는 약 190 km/s</b> 입니다." : "");
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
      q: "v² = GM(r)/r 에서, 바깥에서도 회전 속도 v 가 거의 일정하다는 것은 무슨 뜻일까요?",
      options: ["반지름이 커지는 만큼 안쪽 질량 M(r) 도 계속 늘어난다", "바깥에는 질량이 거의 없다", "바깥 별들은 중력을 받지 않는다", "은하가 통째로 팽창하고 있다"],
      answer: 0,
      why: [
        "맞습니다. v 가 일정하려면 M(r) 이 r 에 비례해 계속 늘어나야 합니다. 그런데 그 바깥에는 빛을 내는 것이 거의 없습니다.",
        "질량이 없다면 v 는 거리의 제곱근에 반비례해 줄어들어야 합니다. 관측은 그렇지 않았습니다.",
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
      paper(ctx, W, H);
      var mv = Mvis(r0), mo = Mobs(r0), md = mo - mv, ratio = md / mv;
      var okA = ratio >= 0.9 && ratio <= 1.1, okB = r0 >= 19.5;
      var x0 = 90, x1 = 560, y0 = 66, y1 = 300;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "반지름 안쪽에 쌓인 질량", x0, 34, { s: 13, w: "900" });
      function X(r) { return x0 + r / 25 * (x1 - x0); }
      function Y(m) { return y1 - clamp(m / 27, 0, 1) * (y1 - y0); }
      [0, 5, 10, 15, 20, 25].forEach(function (g) {
        text(ctx, String(g), X(g), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "은하 중심에서의 거리 (kpc) →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      [0, 10, 20].forEach(function (g) {
        text(ctx, String(g), x0 - 8, Y(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(x0, Y(g)); ctx.lineTo(x1, Y(g)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "질량 (10¹⁰ M☉)", x0 - 30, y0 - 14, { s: 11, c: v("--mist") });
      [["--coral", Mobs, "관측 속도로 구한 전체 질량"], ["--teal", Mvis, "눈에 보이는 물질"]].forEach(function (cv) {
        ctx.strokeStyle = v(cv[0]); ctx.lineWidth = 3; ctx.beginPath();
        for (var k = 1; k <= 100; k++) {
          var r = 25 * k / 100;
          if (k === 1) ctx.moveTo(X(r), Y(cv[1](r))); else ctx.lineTo(X(r), Y(cv[1](r)));
        }
        ctx.stroke();
      });
      text(ctx, "전체 질량 (관측)", X(21), Y(Mobs(21)) - 12, { s: 11, w: "800", a: "right", c: v("--coral-700") });
      text(ctx, "보이는 물질", X(21), Y(Mvis(21)) + 20, { s: 11, w: "800", a: "right", c: v("--teal-700") });
      ctx.strokeStyle = v("--violet"); ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X(r0), y0); ctx.lineTo(X(r0), y1); ctx.stroke(); ctx.setLineDash([]);

      /* 오른쪽 */
      var rx = 600;
      text(ctx, "중심에서 " + r0.toFixed(1) + " kpc 안쪽", rx, 70, { s: 14, w: "900" });
      text(ctx, "회전 속도 " + vtot(r0, VH_TRUE).toFixed(0) + " km/s", rx, 94, { s: 12, c: v("--mist") });
      var bw = 250;
      [["보이는 물질", mv, "--teal"], ["암흑 물질", md, "--violet"]].forEach(function (o, k) {
        var yy = 130 + k * 62;
        text(ctx, o[0], rx, yy, { s: 12, w: "800", c: v(o[2] + "-700") });
        text(ctx, o[1].toFixed(2) + " ×10¹⁰ M☉", 880, yy, { s: 12, a: "right", w: "800" });
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(rx, yy + 8, bw, 18, 9); ctx.fill();
        ctx.fillStyle = v(o[2]); ctx.fillRect(rx, yy + 8, clamp(o[1] / 21 * bw, 1, bw), 18);
      });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 268); ctx.lineTo(880, 268); ctx.stroke();
      text(ctx, "암흑 물질 ÷ 보이는 물질", rx, 294, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, ratio.toFixed(2) + " 배", rx, 324, { s: 22, w: "900", c: ratio >= 1 ? v("--violet-700") : v("--teal-700") });
      text(ctx, ratio < 0.9 ? "아직 보이는 물질이 더 많습니다" : (ratio <= 1.1 ? "✅ 둘이 같아지는 자리입니다" : "암흑 물질이 더 많습니다"),
        rx, 352, { s: 12.5, w: "800", c: ratio >= 0.9 && ratio <= 1.1 ? v("--teal-700") : v("--mist") });
      text(ctx, "M = v² r / G 로 구한 값입니다", rx, 378, { s: 11, c: v("--mist") });

      var ch = false;
      if (okA && !got.a) { got.a = ch = true; }
      if (okB && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cMass", got); mission(); }
      $("c-mass-info").innerHTML = "보이는 물질은 <b>8 kpc 쯤에서 거의 다 쌓이고</b> 더는 늘지 않습니다. 별빛이 거기서 끝나기 때문입니다. 그런데 회전 속도로 구한 전체 질량은 바깥으로 갈수록 <b>계속 늘어납니다.</b> 그 차이가 암흑 물질입니다.";
    }
    function mission() {
      if (got.a) done("m3-4a"); if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>약 <b>6 kpc</b> 에서 둘이 같아지고, 20 kpc 바깥에서는 암흑 물질이 보이는 물질의 <b>2.7배</b> 가 됩니다. 은하는 보이는 것보다 훨씬 무겁습니다.");
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

    function draw() {
      paper(ctx, W, H);
      var G = GAL[s], ok = Math.abs(lam - G.lam) < 0.05;
      var z = (lam - LAB_K) / LAB_K, vq = CC * z, d = vq / H0;
      var zT = (G.lam - LAB_K) / LAB_K;
      var x0 = 70, x1 = 830;
      function X(l) { return x0 + (l - 385) / 30 * (x1 - x0); }
      function band(y, h) {
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, v("--violet")); g.addColorStop(0.45, v("--green")); g.addColorStop(1, v("--rose"));
        ctx.fillStyle = g; ctx.fillRect(x0, y, x1 - x0, h);
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(x0, y, x1 - x0, h);
      }
      function line(l, y, h, c) {
        if (l < 385 || l > 415) return;
        ctx.fillStyle = c; ctx.fillRect(X(l) - 2.5, y, 5, h);
      }
      text(ctx, "실험실에서 잰 칼슘 선", x0, 54, { s: 12.5, w: "900" });
      band(64, 40);
      line(LAB_K, 64, 40, v("--abyss")); line(LAB_H, 64, 40, v("--abyss"));
      text(ctx, "K 393.4", X(LAB_K), 120, { s: 10.5, a: "center", c: v("--mist"), w: "800" });
      text(ctx, "H 396.8", X(LAB_H) + 26, 120, { s: 10.5, a: "center", c: v("--mist"), w: "800" });

      text(ctx, G.n + " 에서 온 빛", x0, 164, { s: 12.5, w: "900" });
      band(174, 40);
      line(LAB_K * (1 + zT), 174, 40, v("--abyss")); line(LAB_H * (1 + zT), 174, 40, v("--abyss"));
      /* 내 눈금 */
      ctx.strokeStyle = v(ok ? "--teal" : "--coral"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(X(lam), 166); ctx.lineTo(X(lam), 228); ctx.stroke();
      text(ctx, "내 눈금", clamp(X(lam), x0 + 26, x1 - 26), 246, { s: 11, a: "center", w: "800", c: v(ok ? "--teal-700" : "--coral-700") });
      /* 밀린 폭 */
      ctx.strokeStyle = v("--violet"); ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(LAB_K), 146); ctx.lineTo(X(LAB_K * (1 + zT)), 146); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "붉은 쪽으로 밀린 폭", (X(LAB_K) + X(LAB_K * (1 + zT))) / 2 + 60, 142, { s: 10.5, a: "center", c: v("--violet-700"), w: "800" });
      [385, 395, 405, 415].forEach(function (g) {
        if (X(g) > x1) return;
        text(ctx, String(g), X(g), 272, { s: 10.5, a: "center", c: v("--mist") });
      });
      text(ctx, "파장 (nm) →", x0, 292, { s: 11, c: v("--mist") });

      text(ctx, "내가 읽은 파장 " + lam.toFixed(1) + " nm", 70, 330, { s: 15, w: "900" });
      text(ctx, ok ? "✅ 칼슘 K선과 맞았습니다" : (lam < G.lam ? "눈금이 아직 왼쪽입니다" : "눈금이 너무 오른쪽입니다"),
        330, 330, { s: 14, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      if (ok) {
        text(ctx, "z = (관측 − 실험실) / 실험실 = " + z.toFixed(5), 70, 362, { s: 13, w: "800", c: v("--violet-700") });
        text(ctx, "v = c z = " + Math.round(vq).toLocaleString() + " km/s", 420, 362, { s: 13.5, w: "900", c: v("--brand-700") });
        text(ctx, "d = v / H₀ = " + d.toFixed(1) + " Mpc", 660, 362, { s: 13.5, w: "900", c: v("--teal-700") });
      } else {
        text(ctx, "허블 법칙 v = H₀ d  (H₀ = 70 km/s/Mpc)", 70, 362, { s: 12, c: v("--mist") });
      }

      if (ok && !got[s]) { got[s] = true; window.sthState("dSpec", got); mission(); }
      $("d-spec-info").innerHTML = "은하가 멀어지면 스펙트럼선의 파장이 <b>길어진 쪽(붉은 쪽)</b> 으로 밀립니다. 밀린 비율이 <b>적색 편이 z</b> 이고, 여기에 빛의 속도를 곱하면 후퇴 속도, 허블 법칙으로 나누면 거리가 됩니다. <b>사진으로는 결코 알 수 없는 깊이</b>를 분광 관측이 알려 주는 것입니다." +
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
      paper(ctx, W, H);
      var shown = SKY.filter(function (g) { return g.m <= lim; });
      var dmax = Math.pow(10, (lim - 4.5) / 5);
      /* 왼쪽 사진 */
      var px = 40, py = 60, pw = 310, ph = 310;
      ctx.fillStyle = v("--abyss"); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.fill();
      text(ctx, "① 하늘 사진 — 방향만 안다", px, 44, { s: 12.5, w: "900" });
      shown.forEach(function (g) {
        ctx.fillStyle = v("--on-accent"); ctx.globalAlpha = .85;
        ctx.beginPath(); ctx.arc(px + 14 + g.ra * (pw - 28), py + 14 + g.dec * (ph - 28), 2.2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      text(ctx, "고르게 흩어져 보입니다", px + pw / 2, py + ph + 22, { s: 11.5, a: "center", c: v("--mist"), w: "800" });

      /* 오른쪽 쐐기 */
      var vx = 620, vy = 396, RR = 280;
      text(ctx, "② 쐐기 지도 — 적색 편이로 깊이를 넣었다", 390, 44, { s: 12.5, w: "900" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      [0.25, 0.5, 0.75, 1].forEach(function (f) {
        ctx.beginPath(); ctx.arc(vx, vy, RR * f, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
        text(ctx, (Math.round(13500 * f / 100) * 100).toLocaleString(), vx + RR * f * Math.cos(Math.PI * 1.18) + 4, vy + RR * f * Math.sin(Math.PI * 1.18) + 14,
          { s: 9.5, c: v("--mist") });
      });
      [Math.PI * 1.18, Math.PI * 1.82].forEach(function (a) {
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + RR * Math.cos(a), vy + RR * Math.sin(a)); ctx.stroke();
      });
      shown.forEach(function (g) {
        var ang = Math.PI * 1.18 + g.ra * Math.PI * 0.64;
        var rr = g.v / 13500 * RR;
        ctx.fillStyle = v("--teal");
        ctx.beginPath(); ctx.arc(vx + rr * Math.cos(ang), vy + rr * Math.sin(ang), 2.2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
      text(ctx, "우리", vx, vy + 18, { s: 10.5, a: "center", c: v("--amber-700"), w: "800" });
      text(ctx, "바깥쪽 눈금 = 후퇴 속도 (km/s)", 390, 380, { s: 10.5, c: v("--mist") });

      /* 값 */
      text(ctx, "한계 등급 " + lim.toFixed(1), 40, 406, { s: 14, w: "900" });
      text(ctx, "분광 관측한 은하 " + shown.length + "개 · " + Math.round(dmax) + " Mpc 까지", 200, 406, { s: 13, w: "800", c: v("--brand-700") });
      text(ctx, lim <= 13 ? "자료가 너무 적어 구조를 알 수 없습니다" : (lim >= 15.5 ? "벽처럼 늘어선 은하와 텅 빈 곳이 뚜렷합니다" : "무언가 무늬가 보이기 시작합니다"),
        560, 396, { s: 13, w: "900", c: lim >= 15.5 ? v("--teal-700") : v("--mist") });

      var ch = false;
      if (lim <= 13 && !got.a) { got.a = ch = true; }
      if (lim >= 15.5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("dWedge", got); mission(); }
      $("d-wedge-info").innerHTML = "왼쪽과 오른쪽은 <b>똑같은 은하들</b>입니다. 다른 것은 깊이가 있느냐뿐이에요. 사진에서는 고르게 흩어져 보이던 은하들이, 적색 편이를 넣는 순간 <b>벽처럼 늘어선 줄</b>과 <b>은하가 거의 없는 빈 공간</b>으로 갈립니다. " +
        (lim <= 13 ? "지금은 자료가 너무 적습니다. 더 어두운 은하까지 내려가 보세요."
          : (lim >= 15.5 ? "1986년 CfA 탐사가 바로 이 그림을 처음 내놓았습니다." : "조금 더 내려가면 구조가 또렷해집니다."));
    }
    function mission() {
      if (got.a) done("m4-3a"); if (got.b) done("m4-3b");
      if (got.a && got.b) {
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>은하의 공간 분포는 <b>분광 자료의 양</b>이 정합니다. 몇십 개로는 아무것도 보이지 않지만, 천 개가 넘으면 <b>장성과 보이드</b>가 드러납니다.");
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
      { n: "처녀자리 은하단", d: "은하 <b>1,000개가 넘게</b> 중력으로 뭉친 큰 집단입니다. 우리에게서 약 16.5 Mpc 떨어져 있고, 국부 은하군도 이 은하단 쪽으로 끌려가고 있습니다." },
      { n: "라니아케아 초은하단", d: "은하군과 은하단 수십 개가 모인 <b>초은하단</b>입니다. 지름이 약 160 Mpc(5억 광년)에 이르지만 중력으로 단단히 묶여 있지는 않아, 우주 팽창에 따라 흩어질 수 있습니다." },
      { n: "우주의 거대 구조", d: "은하가 실처럼 이어진 <b>필라멘트</b>, 벽처럼 펼쳐진 <b>은하 장성</b>, 은하가 거의 없는 <b>보이드</b>가 그물처럼 얽혀 있습니다. 이보다 더 큰 눈으로 보면 우주는 다시 어디나 비슷해집니다." }
    ];
    function modeOf(L) { return L < 6 ? 0 : (L < 40 ? 1 : (L < 300 ? 2 : 3)); }

    function draw() {
      paper(ctx, W, H);
      var L = boxL(i0), mode = modeOf(L);
      var px = 40, py = 60, pw = 400, ph = 320;
      ctx.fillStyle = v("--abyss"); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.fill();
      text(ctx, "상자 한 변 " + (L < 10 ? L.toFixed(1) : Math.round(L)) + " Mpc", px, 44, { s: 12.5, w: "900" });
      function P(fx, fy) { return [px + 12 + fx * (pw - 24), py + 12 + fy * (ph - 24)]; }

      if (mode === 0) {
        [[0.34, 0.52, 16, "우리은하"], [0.66, 0.40, 18, "안드로메다"], [0.55, 0.72, 10, "삼각형자리"]].forEach(function (g) {
          var q = P(g[0], g[1]);
          ctx.fillStyle = v("--teal"); ctx.globalAlpha = .55;
          ctx.beginPath(); ctx.ellipse(q[0], q[1], g[2], g[2] * 0.5, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
          text(ctx, g[3], q[0], q[1] + g[2] + 16, { s: 11, a: "center", w: "800", c: v("--on-accent") });
        });
        ctx.fillStyle = v("--mist");
        for (k = 0; k < 40; k++) {
          var q2 = P(P1[k][0], P1[k][1]);
          ctx.beginPath(); ctx.arc(q2[0], q2[1], 2, 0, Math.PI * 2); ctx.fill();
        }
        text(ctx, "작은 은하 수십 개가 함께 있습니다", px + pw / 2, py + ph - 14, { s: 11, a: "center", c: v("--mist") });
      } else if (mode === 1) {
        for (k = 0; k < 420; k++) {
          var a = P1[k][0] * Math.PI * 2, rr = Math.pow(P1[k][1], 0.6) * 0.42;
          var q3 = P(0.5 + rr * Math.cos(a), 0.5 + rr * Math.sin(a) * 0.92);
          ctx.fillStyle = v(rr < 0.12 ? "--amber" : "--teal");
          ctx.beginPath(); ctx.arc(q3[0], q3[1], rr < 0.12 ? 3.4 : 2.6, 0, Math.PI * 2); ctx.fill();
        }
        text(ctx, "은하 1,000개 이상이 중력으로 뭉쳐 있습니다", px + pw / 2, py + ph - 14, { s: 11, a: "center", c: v("--mist") });
      } else if (mode === 2) {
        var CEN = [[0.5, 0.5], [0.22, 0.32], [0.74, 0.30], [0.66, 0.74], [0.30, 0.76]];
        CEN.forEach(function (c, ci) {
          ctx.strokeStyle = v("--teal"); ctx.globalAlpha = .35; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(P(0.5, 0.5)[0], P(0.5, 0.5)[1]); ctx.lineTo(P(c[0], c[1])[0], P(c[0], c[1])[1]); ctx.stroke();
          ctx.globalAlpha = 1;
          for (k = 0; k < 90; k++) {
            var idx = ci * 90 + k;
            var a2 = P2[idx][0] * Math.PI * 2, r4 = Math.pow(P2[idx][1], 0.7) * 0.12;
            var q4 = P(c[0] + r4 * Math.cos(a2), c[1] + r4 * Math.sin(a2));
            ctx.fillStyle = v("--teal");
            ctx.beginPath(); ctx.arc(q4[0], q4[1], 2.2, 0, Math.PI * 2); ctx.fill();
          }
        });
        ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(P(0.5, 0.5)[0], P(0.5, 0.5)[1], 6, 0, Math.PI * 2); ctx.fill();
        text(ctx, "은하군·은하단 수십 개가 흐름을 따라 모입니다", px + pw / 2, py + ph - 14, { s: 11, a: "center", c: v("--mist") });
      } else {
        ctx.strokeStyle = v("--teal"); ctx.globalAlpha = .3; ctx.lineWidth = 2;
        for (k = 0; k < NODE.length - 1; k++) {
          var n1 = NODE[k], n2 = NODE[(k * 7 + 3) % NODE.length];
          var dd = Math.sqrt((n1[0] - n2[0]) * (n1[0] - n2[0]) + (n1[1] - n2[1]) * (n1[1] - n2[1]));
          if (dd > 0.42) continue;
          ctx.beginPath(); ctx.moveTo(P(n1[0], n1[1])[0], P(n1[0], n1[1])[1]); ctx.lineTo(P(n2[0], n2[1])[0], P(n2[0], n2[1])[1]); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (k = 0; k < 900; k++) {
          var nd = NODE[Math.floor(P3[k][2] * NODE.length)];
          var t2 = P3[k][0], other = NODE[(Math.floor(P3[k][2] * NODE.length) * 7 + 3) % NODE.length];
          var fx = nd[0] + (other[0] - nd[0]) * t2 + (P3[k][1] - 0.5) * 0.05;
          var fy = nd[1] + (other[1] - nd[1]) * t2 + (P3[k][1] - 0.5) * 0.05;
          if (fx < 0.02 || fx > 0.98 || fy < 0.02 || fy > 0.98) continue;
          var q5 = P(fx, fy);
          ctx.fillStyle = v("--teal");
          ctx.beginPath(); ctx.arc(q5[0], q5[1], 1.8, 0, Math.PI * 2); ctx.fill();
        }
        NODE.forEach(function (n) {
          var q6 = P(n[0], n[1]);
          ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(q6[0], q6[1], 4, 0, Math.PI * 2); ctx.fill();
        });
        text(ctx, "필라멘트(실) · 은하 장성(벽) · 보이드(빈 곳)", px + pw / 2, py + ph - 14, { s: 11, a: "center", c: v("--mist") });
      }

      /* 오른쪽 */
      var rx = 480, I = INFO[mode];
      text(ctx, "이 규모에서 보이는 것", rx, 76, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, I.n, rx, 110, { s: 23, w: "900", c: v("--brand-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(rx, 130); ctx.lineTo(880, 130); ctx.stroke();
      var steps = [["은하군", 3, 0], ["은하단", 16, 1], ["초은하단", 160, 2], ["거대 구조", 600, 3]];
      steps.forEach(function (st, k2) {
        var yy = 166 + k2 * 44, on = mode === st[2];
        ctx.fillStyle = v(on ? "--brand" : "--card-2");
        ctx.beginPath(); ctx.roundRect(rx, yy - 20, 300, 32, 10); ctx.fill();
        text(ctx, st[0], rx + 14, yy, { s: 13.5, w: "900", c: on ? v("--on-accent") : v("--mist") });
        text(ctx, "약 " + st[1] + " Mpc", rx + 286, yy, { s: 12, a: "right", w: "800", c: on ? v("--on-accent") : v("--mist") });
        var flag = ["a", "b", "c", "d"][k2];
        if (got[flag]) text(ctx, "✓", rx + 314, yy, { s: 15, w: "900", c: v("--teal-700") });
      });
      text(ctx, "1 Mpc = 326만 광년", rx, 366, { s: 11, c: v("--mist") });
      text(ctx, "중력이 이 계단을 차례로 쌓아 올렸습니다", rx, 388, { s: 11, c: v("--mist") });

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
    { key: "r4", label: "④ 막대 인간이 나타났다" }
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
    { key: "r4", label: "④ 막대 인간이 나타났다" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
