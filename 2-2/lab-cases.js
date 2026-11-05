/* 행성우주과학 Ⅱ-2 은하와 우주 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
/* 스튜디오 말투 그림 도구(../assets/kit.js) — 큰 글자 · 흰 판정 카드 · 입체 모형 */
var K = window.sthKit, LT = K.LT;
function bigT(ctx, a, b) { K.bigText(ctx, a, 22, 42, 24, "#ffffff"); if (b) K.bigText(ctx, b, 22, 70, 15, "#ffd35a"); }
function jcard(ctx, x, y, w, h, title, rows, tip) {
  K.card(ctx, x, y, w, h, title);
  var yy = y + 62;
  rows.forEach(function (r) {
    if (r[3]) { K.t(ctx, r[0], x + 18, yy, { s: 12, w: "700", c: LT.mute }); K.t(ctx, r[1], x + 18, yy + 28, { s: 24, w: "900", c: r[2] || LT.ink }); yy += 50; }
    else { K.row(ctx, r[0], r[1], x + 18, x + w - 18, yy, r[2]); yy += 28; }
  });
  if (tip) K.tip(ctx, tip, x + 12, y + h - 46, w - 24, null);
}
function ball(ctx, x, y, r, c) {
  var g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .06, x, y, r); g.addColorStop(0, "#ffffff"); g.addColorStop(.32, c); g.addColorStop(1, "rgba(20,25,40,.85)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 주계열 맞추기와 전향점 */
  {
    id: "c1", about: "01", tag: "성단 · 색등급도", title: "산개 성단의 거리와 나이", short: "주계열 맞추기",
    who: "✨", name: "성단 관측반",
    say: "“새로 관측한 산개 성단의 색등급도예요. 가로는 색지수(B−V), 세로는 <b>겉보기</b> 등급입니다. 표준 주계열(절대 등급)과 겹쳐 거리를 구하고, 주계열에서 벗어나는 <b>전향점</b>으로 나이도 어림해 주세요.”",
    predict: {
      q: "성단이 나이를 먹을수록 주계열의 윗부분(밝고 파란 별)은 어떻게 될까요?",
      options: ["㉠ 무거운 별부터 주계열을 떠나 전향점이 점점 아래(어둡고 붉은 쪽)로 내려간다", "㉡ 새로운 파란 별이 계속 생긴다", "㉢ 변하지 않는다"],
      answer: 0
    },
    task: "표준 주계열을 위아래로 옮겨 <b>거리 지수</b>를 맞추고(± 0.2), 전향점의 색으로 <b>나이</b>를 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(380), ctx = cv.ctx, W = cv.W;
      var MU = 8.5, mu = 5, age = "1e8";
      var ZAMS = [[-0.3, -2.0], [-0.2, -1.0], [0.0, 0.6], [0.3, 2.6], [0.6, 4.4], [0.9, 5.9], [1.2, 7.3], [1.5, 8.8]];
      function zm(c) { for (var i = 1; i < ZAMS.length; i++) if (c <= ZAMS[i][0]) { var a = ZAMS[i - 1], b = ZAMS[i], k = (c - a[0]) / (b[0] - a[0]); return a[1] + k * (b[1] - a[1]); } return ZAMS[ZAMS.length - 1][1]; }
      var STARS = [];
      (function () { for (var i = 0; i < 70; i++) { var c = 0.1 + (i * 0.37 % 1.3), r = ((i * 7919) % 100) / 100 - 0.5; STARS.push([c, zm(c) + MU + r * 0.35]); }
        [[0.9, 1.4 + MU], [1.0, 0.8 + MU], [1.1, 0.9 + MU], [0.95, 1.2 + MU]].forEach(function (g) { STARS.push(g); }); })();
      var AGE = { "1e8": "1억 년 (전향점 B−V ≈ −0.1)", "1e9": "10억 년 (전향점 B−V ≈ 0.1)", "1e10": "100억 년 (전향점 B−V ≈ 0.6)" };
      function draw() {
        H.paper(ctx, W, cv.H);
        var dpc = Math.round(Math.pow(10, mu / 5 + 1));
        bigT(ctx, "거리 지수 " + mu.toFixed(1) + " → " + dpc.toLocaleString() + " pc", "고른 나이 " + AGE[age]);
        var g = K.chart(ctx, { x: 8, y: 88, w: 540, h: cv.H - 96, x0: -0.4, x1: 1.6, y0: 20, y1: 4, xt: 5, yt: 4, light: true,
          xf: function (c) { return c.toFixed(1); }, xl: "B − V", yl: "겉보기 등급 (위가 밝음)" });
        STARS.forEach(function (s) { ball(ctx, g.X(s[0]), g.Y(s[1]), 3.4, "rgb(232,160,40)"); });
        var pts = []; ZAMS.forEach(function (z) { pts.push([z[0], z[1] + mu]); });
        ctx.save(); ctx.beginPath(); ctx.rect(g.L, g.T, g.R - g.L, g.B - g.T); ctx.clip();
        K.plot(ctx, g, pts, LT.teal, { w: 3, light: true });
        ctx.restore();
        K.pill(ctx, "표준 주계열 + " + mu.toFixed(1), g.X(-0.3) + 8, Math.max(g.T + 18, g.Y(-2 + mu) - 8), { s: 11, c: K.C.green, box: [g.L, g.R] });
        K.pill(ctx, "● 성단의 별", g.R - 4, g.T + 18, { s: 11, a: "right", c: K.C.orange, box: [g.L, g.R] });
        jcard(ctx, 560, 14, 326, cv.H - 28, "판정 · 주계열 맞추기", [
          ["거리 지수 m − M", mu.toFixed(1)],
          ["거리", dpc.toLocaleString() + " pc", Math.abs(mu - MU) <= 0.2 ? LT.green : LT.blue, true],
          ["고른 나이", AGE[age].split(" (")[0]],
          ["전향점", AGE[age].split("(")[1].replace(")", "")]
        ], "주계열이 끊기는 색 = 전향점 → 나이");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "표준 주계열을 내리기 (거리 지수)", min: 0, max: 15, step: 0.1, value: 5, fmt: function (x) { return x.toFixed(1); }, onInput: function (x) { mu = x; draw(); } });
      api.seg({ label: "성단의 나이", value: "1e8", options: [{ v: "1e8", t: "약 1억 년" }, { v: "1e9", t: "약 10억 년" }, { v: "1e10", t: "약 100억 년" }], onPick: function (x) { age = x; draw(); } });
      api.info("성단의 별들은 모두 같은 거리에 있으므로, 주계열을 통째로 위아래로 옮기면 겹칩니다. 주계열이 끊기고 오른쪽 위(거성)로 꺾이는 곳이 전향점입니다.");
      draw();
      return {
        judge: function () {
          if (Math.abs(mu - MU) > 0.2) return { ok: false, msg: "거리 지수 " + mu.toFixed(1) + " — 표준 주계열이 성단의 주계열과 겹치지 않습니다." };
          if (age !== "1e9") return { ok: false, msg: "거리는 맞았습니다. 성단의 주계열이 어느 색(B−V)에서 끊기는지 보고 나이를 다시 고르세요." };
          return { ok: true, msg: "거리 지수 " + mu.toFixed(1) + " → 약 " + Math.round(Math.pow(10, mu / 5 + 1)) + " pc, 전향점 B−V ≈ 0.1 → 약 10억 년 된 성단입니다." };
        }
      };
    },
    hints: [
      "청록 선을 내려 성단의 별들이 늘어선 띠(아래쪽 대부분)에 겹치게 하세요.",
      "성단의 주계열은 B−V ≈ 0.1보다 파란 쪽에는 별이 없습니다. 그 색의 별이 막 주계열을 떠나는 나이는?"
    ],
    solution: "거리 지수 <b>8.5</b>(약 500 pc), 나이 <b>약 10억 년</b>.",
    why: "성단의 별들은 거의 같은 거리·같은 나이라서, 색등급도의 주계열을 표준 주계열과 겹치면 <b>거리 지수</b>를 얻습니다(주계열 맞추기). 또 무거운 별일수록 빨리 주계열을 떠나므로, 주계열이 끊기는 <b>전향점</b>이 낮을수록 늙은 성단이에요.<br>" +
      "산개 성단은 대개 젊고(파란 별이 많음) 우리은하 원반에, 구상 성단은 100억 년 넘게 늙어 헤일로에 퍼져 있습니다. 구상 성단 분포의 중심을 찾아 태양이 은하 변두리에 있음을 알아낸 것이 섀플리였습니다. ※ 가상 자료입니다."
  },

  /* ------------------------------------------------------------------ 2. 성간 소광과 적색화 */
  {
    id: "c2", about: "02", tag: "성간 소광 · 색초과", title: "티끌 너머 별의 진짜 거리", short: "소광 보정",
    who: "🌫️", name: "우리은하 원반 탐사팀",
    say: "“은하 원반 쪽의 뜨거운 <b>B0형 주계열성</b>을 찾았어요. 이 분광형이면 절대 등급 <b>−4.0</b>, 원래 색지수 <b>B−V = −0.30</b> 이어야 하는데, 관측값은 겉보기 등급 <b>12.0</b>, 색지수 <b>+0.35</b>로 훨씬 붉어요. 성간 티끌 때문입니다. 소광을 보정해 진짜 거리를 구해 주세요(A<sub>V</sub> ≈ 3.1 × 색초과).”",
    predict: {
      q: "성간 티끌을 지난 별빛이 원래보다 붉게 보이는 까닭은?",
      options: ["㉠ 티끌이 붉은빛을 더 많이 흡수·산란하기 때문이다", "㉡ 티끌이 파란빛을 더 많이 흡수·산란하기 때문이다", "㉢ 별이 멀어지며 적색 편이되기 때문이다"],
      answer: 1
    },
    task: "소광량 A<sub>V</sub>를 정하고(± 0.1), 소광을 보정한 <b>거리</b>를 구하세요(± 5%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var V = 12.0, M = -4.0, BV = 0.35, BV0 = -0.30, A = 0, d = 10;
      var TA = 3.1 * (BV - BV0), TD = Math.pow(10, (V - M - TA) / 5 + 1) / 1000;
      var I = K.iso({ ox: 250, oy: 172, s: .6, L: 70, D: 170 });
      function draw() {
        H.paper(ctx, W, cv.H);
        var dNo = Math.pow(10, (V - M) / 5 + 1) / 1000, dA = Math.pow(10, (V - M - A) / 5 + 1) / 1000, dust = Math.min(1, A / 3);
        bigT(ctx, "소광량 A_V " + A.toFixed(1) + " 등급 → 거리 " + dA.toFixed(2) + " kpc", "m − M = 5 log d − 5 + A");
        /* 별 → 티끌 구름(블록) → 망원경 */
        var sy = 210;
        ctx.fillStyle = "rgba(160,200,255,.55)"; ctx.beginPath(); ctx.moveTo(92, sy - 7); ctx.lineTo(206, sy - 9); ctx.lineTo(206, sy + 9); ctx.lineTo(92, sy + 7); ctx.closePath(); ctx.fill();
        I.box(ctx, 0, 0, 0, I.L, I.D, 130, "rgba(150,110,80," + (.15 + .5 * dust).toFixed(2) + ")", "rgba(120,85,60," + (.2 + .55 * dust).toFixed(2) + ")", "rgba(90,62,44," + (.24 + .55 * dust).toFixed(2) + ")");
        I.face(ctx, "front", function (Lw) { var Rd = K.rng(41); for (var i = 0; i < 50 + 200 * dust; i++) { ctx.fillStyle = "rgba(60,40,25,.55)"; ctx.fillRect(Rd() * Lw, Rd() * 128, 1.6, 1.6); } });
        I.face(ctx, "right", function (Lw) { var Rd = K.rng(43); for (var i = 0; i < 70 + 240 * dust; i++) { ctx.fillStyle = "rgba(50,32,20,.55)"; ctx.fillRect(Rd() * Lw, Rd() * 128, 1.6, 1.6); } });
        var dim = Math.max(.2, 1 - A / 5);
        ctx.fillStyle = "rgba(255," + Math.round(200 - 60 * dust) + "," + Math.round(160 - 100 * dust) + "," + (.7 * dim).toFixed(2) + ")";
        ctx.beginPath(); ctx.moveTo(300, sy - 6); ctx.lineTo(430, sy - 5); ctx.lineTo(430, sy + 5); ctx.lineTo(300, sy + 6); ctx.closePath(); ctx.fill();
        ball(ctx, 74, sy, 20, "rgb(170,200,255)");
        var tg = ctx.createLinearGradient(0, sy - 10, 0, sy + 10); tg.addColorStop(0, "#f2f5fa"); tg.addColorStop(.5, "#9aa5bd"); tg.addColorStop(1, "#4a5370");
        ctx.strokeStyle = "#4a5370"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(450, sy + 8); ctx.lineTo(436, sy + 62); ctx.moveTo(450, sy + 8); ctx.lineTo(464, sy + 62); ctx.stroke();
        ctx.save(); ctx.translate(452, sy); ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(-20, -9, 40, 18, 4); ctx.fill(); ctx.fillStyle = "#2a3150"; ctx.beginPath(); ctx.roundRect(-26, -12, 9, 24, 3); ctx.fill(); ctx.restore();
        K.pill(ctx, "별 (원래 B−V −0.30)", 74, 262, { s: 11, a: "center", c: K.C.ink, box: [0, 490] });
        I.label(ctx, I.L * .5, 0, 126, "성간 티끌", 44, -14, "#f0d9b8", [0, 490]);
        K.pill(ctx, "관측자", 452, 300, { s: 11, a: "center", c: K.C.ink, box: [0, 490] });
        K.t(ctx, "티끌은 별빛을 어둡게(소광) 하고 붉게(적색화) 만듭니다", 22, cv.H - 14, { s: 11, w: "800", c: LT.mute });
        jcard(ctx, 500, 14, 386, cv.H - 28, "판정 · 색초과 E(B−V) = 관측 − 원래", [
          ["색초과 E(B−V)", (BV - BV0).toFixed(2)],
          ["내가 정한 소광량 A_V", A.toFixed(1) + " 등급", Math.abs(A - TA) <= 0.1 ? LT.green : null],
          ["소광을 무시한 거리", dNo.toFixed(1) + " kpc"],
          ["이 A_V로 보정한 거리", dA.toFixed(2) + " kpc"],
          ["내가 정한 거리", d.toFixed(1) + " kpc", LT.blue, true]
        ], "");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "소광량 A_V", min: 0, max: 4, step: 0.1, value: 0, fmt: function (x) { return x.toFixed(1) + " 등급"; }, onInput: function (x) { A = x; draw(); } });
      api.slider({ label: "별까지의 거리", min: 1, max: 20, step: 0.2, value: 10, fmt: function (x) { return x.toFixed(1) + " kpc"; }, onInput: function (x) { d = x; draw(); } });
      api.info("티끌은 별빛을 어둡게(소광) 하고 붉게(적색화) 만듭니다. 붉어진 정도(색초과)로 어두워진 정도를 어림할 수 있습니다.");
      draw();
      return {
        judge: function () {
          if (Math.abs(A - TA) > 0.1) return { ok: false, msg: "A_V " + A.toFixed(1) + " — 색초과 " + (BV - BV0).toFixed(2) + " 에 3.1을 곱해 보세요." };
          if (Math.abs(d - TD) / TD > 0.05) return { ok: false, msg: "소광량은 맞았습니다. 보정한 거리 지수 m − M − A로 거리를 다시 계산하세요." };
          return { ok: true, msg: "A_V ≈ " + TA.toFixed(1) + " → 거리 약 " + TD.toFixed(1) + " kpc. 무시했다면 약 " + (Math.pow(10, (V - M) / 5 + 1) / 1000).toFixed(0) + " kpc로 2.5배나 멀게 잘못 잴 뻔했어요." };
        }
      };
    },
    hints: [
      "색초과 = 0.35 − (−0.30) = 0.65. A_V = 3.1 × 0.65 ≈ ?",
      "보정한 거리 지수 = 12.0 − (−4.0) − 2.0 = 14 → d = 10^(14 ÷ 5 + 1) pc."
    ],
    solution: "A<sub>V</sub> ≈ <b>2.0</b>, 거리 <b>약 6.3 kpc</b>(6.0~6.6 kpc).",
    why: "성간 티끌은 파장이 짧은 파란빛을 더 많이 흡수·산란해 별빛을 <b>어둡고 붉게</b> 만듭니다(성간 소광·적색화). 노을이 붉은 것과 비슷한 원리입니다. 소광을 무시하면 별이 실제보다 어두워 보여 거리를 너무 멀게 잽니다.<br>" +
      "먼 성단일수록 겉보기 크기에 비해 어둡다는 관측(트럼플러, 1930)이 성간 티끌의 존재를 알린 증거였습니다. 우주는 비어 있지 않았습니다."
  },

  /* ------------------------------------------------------------------ 3. 회전 속도로 은하의 질량 */
  {
    id: "c3", about: "03", tag: "회전 속도 곡선 · 암흑 물질", title: "우리은하의 무게", short: "은하 질량",
    who: "🌀", name: "은하 역학 연구실",
    say: "“태양은 우리은하 중심에서 <b>8.2 kpc</b> 떨어져 <b>230 km/s</b>로 돌고 있어요. 태양 궤도 안쪽에 있는 질량을 구하고, 은하 바깥쪽의 회전 속도와 비교해 주세요. (1 kpc = 3.086 × 10¹⁹ m, G = 6.67 × 10⁻¹¹, 태양 질량 = 2.0 × 10³⁰ kg)”",
    predict: {
      q: "은하의 질량이 대부분 빛나는 중심부에 모여 있다면, 중심에서 멀리 있는 별의 회전 속도는?",
      options: ["㉠ 멀수록 느려진다 (케플러 회전)", "㉡ 멀수록 빨라진다", "㉢ 거리와 상관없이 같다"],
      answer: 0
    },
    task: "태양 궤도 안쪽의 질량을 조절해 <b>8.2 kpc 에서의 회전 속도가 230 km/s</b>(± 5 km/s)가 되게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(360), ctx = cv.ctx, W = cv.W;
      var lm = 10.5, G = 6.67e-11, KPC = 3.086e19, MS = 2e30;
      function v(mass, r) { return Math.sqrt(G * mass * MS / (r * KPC)) / 1000; }
      function M() { return Math.pow(10, lm); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var v82 = v(M(), 8.2);
        bigT(ctx, "안쪽 질량 " + (M() / 1e11).toFixed(2) + " × 10¹¹ M☉ → " + v82.toFixed(0) + " km/s", "v² = G M ÷ r · 태양 자리의 실제 회전 속도 약 230 km/s");
        var g = K.chart(ctx, { x: 8, y: 88, w: 552, h: cv.H - 96, x0: 0, x1: 30, y0: 0, y1: 350, xt: 3, yt: 7, light: true,
          xf: function (r) { return Math.round(r) + " kpc"; }, yl: "회전 속도 (km/s)" });
        var obs = []; for (var r = 1; r <= 30; r += 0.5) obs.push([r, r < 3 ? 230 * r / 3 : 225 + 5 * Math.sin(r)]);
        K.plot(ctx, g, obs, LT.violet, { w: 3, light: true });
        K.pill(ctx, "관측", g.X(28), g.Y(240) - 6, { s: 11, a: "right", c: K.C.violet, box: [g.L, g.R] });
        var kep = []; for (var r2 = 8.2; r2 <= 30; r2 += 0.5) kep.push([r2, v(M(), r2)]);
        K.plot(ctx, g, kep, LT.orange, { w: 2.6, light: true });
        K.pill(ctx, "질량이 모두 안쪽에 있다면", g.X(29), Math.min(g.B - 6, g.Y(v(M(), 29)) + 22), { s: 11, a: "right", c: K.C.orange, box: [g.L, g.R] });
        ball(ctx, g.X(8.2), g.Y(Math.min(350, v82)), 6, "rgb(232,89,12)");
        ball(ctx, g.X(8.2), g.Y(230) - 14, 7, "rgb(255,196,70)");
        K.pill(ctx, "태양", g.X(8.2) + 12, g.Y(230) - 22, { s: 10.5, c: K.C.yellow, box: [g.L, g.R] });
        jcard(ctx, 572, 14, 314, cv.H - 28, "판정 · 회전 속도로 잰 질량", [
          ["태양 궤도 안쪽 질량", (M() / 1e11).toFixed(2) + " × 10¹¹ M☉"],
          ["8.2 kpc의 회전 속도", v82.toFixed(0) + " km/s", Math.abs(v82 - 230) <= 5 ? LT.green : LT.red, true],
          ["25 kpc에서 (예측 vs 관측)", v(M(), 25).toFixed(0) + " vs 약 225 km/s"]
        ], "바깥까지 평평 = 보이지 않는 질량");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "태양 궤도 안쪽의 질량 (눈금 한 칸 = 10배)", min: 10, max: 12, step: 0.02, value: 10.5, fmt: function (x) { return (Math.pow(10, x) / 1e11).toFixed(2) + " × 10¹¹ M☉"; }, onInput: function (x) { lm = x; draw(); } });
      api.info("원 궤도를 도는 별은 중력이 구심력이 됩니다: v² = G M ÷ r. 궤도 안쪽 질량이 클수록 빨리 돌아요.");
      draw();
      return {
        judge: function () {
          var s = v(M(), 8.2);
          if (Math.abs(s - 230) <= 5) return { ok: true, msg: "약 " + (M() / 1e11).toFixed(1) + " × 10¹¹ M☉. 그런데 이 질량만으로는 25 kpc에서 " + v(M(), 25).toFixed(0) + " km/s로 느려져야 하는데, 실제로는 약 225 km/s — 바깥에 보이지 않는 질량이 있습니다." };
          return { ok: false, msg: "8.2 kpc의 회전 속도 " + s.toFixed(0) + " km/s — 230 km/s와 다릅니다." };
        }
      };
    },
    hints: [
      "M = v² r ÷ G. v = 2.3 × 10⁵ m/s, r = 8.2 × 3.086 × 10¹⁹ m.",
      "계산하면 약 2 × 10⁴¹ kg — 태양 질량으로 나누면?"
    ],
    solution: "약 <b>1.0 × 10¹¹ M☉</b>(0.96~1.05 × 10¹¹).",
    why: "별의 회전 속도와 궤도 반지름으로 그 궤도 안쪽의 질량을 잴 수 있습니다(v² = GM/r). 질량이 빛나는 중심부에만 있다면 바깥 별은 태양계 행성처럼 <b>멀수록 느려져야</b> 하지요.<br>" +
      "그런데 실제 회전 속도 곡선은 바깥까지 거의 <b>평평</b>합니다. 빛을 내지 않는 질량이 헤일로에 넓게 퍼져 있다는 뜻 — <b>암흑 물질</b>입니다. 은하 질량의 대부분은 보이지 않습니다. ※ 관측 곡선은 어림한 모양입니다."
  }
  ]
});
})();
