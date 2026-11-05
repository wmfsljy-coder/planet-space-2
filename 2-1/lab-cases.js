/* 행성우주과학 Ⅱ-1 태양과 별의 관측 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
/* 스튜디오 말투 그림 도구(../assets/kit.js) — 큰 글자 · 흰 판정 카드 · 인화지 사진 · 입체 공 */
var K = window.sthKit, LT = K.LT;
function bigT(ctx, a, b) { K.bigText(ctx, a, 22, 42, 24, "#ffffff"); if (b) K.bigText(ctx, b, 22, 70, 15, "#ffd35a"); }
function photo(ctx, x, y, w, h, seed) {
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.28)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = "#fbfbf7";
  ctx.beginPath(); ctx.roundRect(x - 10, y - 10, w + 20, h + 34, 8); ctx.fill(); ctx.restore();
  K.stage(ctx, x, y, w, h, "space", { seed: seed || 5, r: 4 });
}
function jcard(ctx, x, y, w, h, title, rows, tip) {
  K.card(ctx, x, y, w, h, title);
  var yy = y + 62;
  rows.forEach(function (r) {
    if (r[3]) { K.t(ctx, r[0], x + 18, yy, { s: 12, w: "700", c: LT.mute }); K.t(ctx, r[1], x + 18, yy + 28, { s: 24, w: "900", c: r[2] || LT.ink }); yy += 50; }
    else { K.row(ctx, r[0], r[1], x + 18, x + w - 18, yy, r[2]); yy += 28; }
  });
  if (tip) K.tip(ctx, tip, x + 12, y + h - 46, w - 24, null);
}
function ball(ctx, x, y, r, c, glow) {
  if (glow) { var hg = ctx.createRadialGradient(x, y, r * .7, x, y, r * (1 + glow)); hg.addColorStop(0, c.replace("rgb(", "rgba(").replace(")", ",.5)")); hg.addColorStop(1, c.replace("rgb(", "rgba(").replace(")", ",0)")); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r * (1 + glow), 0, 6.2832); ctx.fill(); }
  var g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .06, x, y, r); g.addColorStop(0, "#ffffff"); g.addColorStop(.32, c); g.addColorStop(1, "rgba(20,25,40,.85)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 연주 시차 */
  {
    id: "c1", about: "02", tag: "연주 시차 · 파섹", title: "반년 사이에 움직인 별", short: "연주 시차",
    who: "📷", name: "학교 천문대 사진반",
    say: "“같은 별 무리를 <b>1월과 7월</b>에 찍어 겹쳐 보니, 멀리 있는 배경별들은 그대로인데 한 별만 조금 옮겨져 있었어요. 사진의 눈금 한 칸은 <b>0.1″</b>(각초)입니다. 이 별까지의 거리를 구해 주세요.”",
    predict: {
      q: "반년 간격으로 찍은 사진에서 별이 옮겨 간 각은 연주 시차의 몇 배일까요?",
      options: ["㉠ 같다", "㉡ 2배 — 지구가 태양 반대편까지 지름만큼 움직였으므로", "㉢ 절반"],
      answer: 1
    },
    task: "사진에서 <b>연주 시차</b>를 읽고(± 0.01″), 그 별까지의 <b>거리</b>를 정하세요(± 0.25 pc).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var P = 0.25, p = 0.1, d = 10;
      function draw() {
        H.paper(ctx, W, cv.H);
        bigT(ctx, "내가 읽은 연주 시차 " + p.toFixed(2) + "″", "1월 사진(파랑)과 7월 사진(주황)을 겹친 모습");
        var x0 = 46, y0 = 98, g = 34;
        photo(ctx, x0, y0, g * 12, g * 6, 31);
        ctx.strokeStyle = "rgba(255,255,255,.13)"; ctx.lineWidth = 1;
        for (var i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * g, y0); ctx.lineTo(x0 + i * g, y0 + g * 6); ctx.stroke(); }
        for (var j = 1; j < 6; j++) { ctx.beginPath(); ctx.moveTo(x0, y0 + j * g); ctx.lineTo(x0 + g * 12, y0 + j * g); ctx.stroke(); }
        [[1.5, 1.2], [9.7, 0.8], [4.2, 4.6], [10.8, 5.1], [7.3, 2.4]].forEach(function (s) { K.glow(ctx, x0 + s[0] * g, y0 + s[1] * g, 2.2, "rgba(255,255,255,.95)", 3.5); });
        var cx = x0 + 6 * g, cy = y0 + 3 * g, sh = 2 * P / 0.1 * g / 2;
        K.glow(ctx, cx - sh, cy, 4.5, "rgba(95,180,255,.98)", 3.6); K.glow(ctx, cx + sh, cy, 4.5, "rgba(255,174,74,.98)", 3.6);
        K.pill(ctx, "1월", cx - sh, cy - 16, { s: 11, a: "center", c: K.C.blue }); K.pill(ctx, "7월", cx + sh, cy - 16, { s: 11, a: "center", c: K.C.orange });
        K.t(ctx, "눈금 한 칸 = 0.1″ (각초) · 배경별은 그대로", x0, y0 + g * 6 + 18, { s: 11, w: "800", c: LT.mute });
        jcard(ctx, 500, 14, 386, cv.H - 28, "판정 · 거리(pc) = 1 ÷ 연주 시차(″)", [
          ["내가 읽은 연주 시차", p.toFixed(2) + " ″", Math.abs(p - P) <= 0.01 ? LT.green : null],
          ["거리 = 1 ÷ 연주 시차", (1 / p).toFixed(2) + " pc (계산)"],
          ["내가 정한 거리", d.toFixed(1) + " pc", LT.blue, true]
        ], "두 점 사이 = 반년 동안 옮겨 간 각 = 시차의 2배");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "연주 시차 (사진에서 읽기)", min: 0.01, max: 0.6, step: 0.01, value: 0.1, fmt: function (x) { return x.toFixed(2) + " ″"; }, onInput: function (x) { p = x; draw(); } });
      api.slider({ label: "별까지의 거리", min: 0.5, max: 20, step: 0.5, value: 10, fmt: function (x) { return x.toFixed(1) + " pc"; }, onInput: function (x) { d = x; draw(); } });
      api.info("두 점 사이는 반년 동안 옮겨 간 각(= 연주 시차의 2배)입니다. 1 pc는 연주 시차가 1″ 인 거리입니다.");
      draw();
      return {
        judge: function () {
          if (Math.abs(p - P) > 0.01) return { ok: false, msg: "연주 시차 " + p.toFixed(2) + "″ — 사진의 두 점 사이 각의 절반을 다시 읽어 보세요." };
          if (Math.abs(d - 1 / P) > 0.25) return { ok: false, msg: "연주 시차는 맞았습니다. 거리 = 1 ÷ 연주 시차(pc)." };
          return { ok: true, msg: "연주 시차 0.25″ → 4 pc(약 13광년). 가장 가까운 별도 1″ 가 안 되는 아주 작은 각입니다." };
        }
      };
    },
    hints: [
      "두 점 사이는 눈금 5칸 = 0.5″. 이것은 연주 시차의 몇 배일까요?",
      "연주 시차 0.25″ → 거리 = 1 ÷ 0.25 pc."
    ],
    solution: "연주 시차 <b>0.25″</b>, 거리 <b>4 pc</b>.",
    why: "지구가 태양을 돌며 위치가 바뀌면, 가까운 별은 먼 배경별에 대해 조금씩 흔들려 보입니다. 이 각의 절반이 <b>연주 시차</b>이고, 거리(pc) = 1 ÷ 연주 시차(″)입니다. 1838년 베셀이 처음 쟀을 때 그 크기는 0.3″ 밖에 되지 않았습니다.<br>" +
      "연주 시차는 거리를 <b>직접</b> 재는 첫 번째 자이지만, 멀면 각이 너무 작아 한계가 있습니다. 그 너머는 밝기(겉보기 등급과 절대 등급)나 세페이드 변광성 같은 두 번째 자로 이어 붙입니다."
  },

  /* ------------------------------------------------------------------ 2. 쌍성으로 질량 재기 */
  {
    id: "c2", about: "03", tag: "쌍성 · 별의 질량", title: "보이지 않던 짝의 무게", short: "쌍성 질량",
    who: "⚖️", name: "쌍성 관측 연구실",
    say: "“거리 <b>10 pc</b> 인 안시 쌍성의 궤도를 50년 동안 추적했어요. 두 별 사이의 각거리(궤도 긴반지름)는 <b>2.0″</b>, 공전 주기는 <b>50년</b>입니다. 두 별의 질량을 합하면 태양의 몇 배일까요?”",
    predict: {
      q: "쌍성의 궤도 크기가 같다면, 공전 주기가 짧은 쌍성의 질량 합은?",
      options: ["㉠ 더 크다 — 더 강한 중력이 빨리 돌게 하므로", "㉡ 더 작다", "㉢ 같다"],
      answer: 0
    },
    task: "각거리와 거리로 <b>궤도 긴반지름(AU)</b>을 구하고, 케플러 제3법칙으로 <b>질량 합</b>을 정하세요(± 0.2 M☉).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var a = 10, M = 1, TA = 20, TP = 50, ang = 0;
      var run = api.ticker();
      var TM = TA * TA * TA / (TP * TP);
      function draw() {
        H.paper(ctx, W, cv.H);
        var Pc = Math.sqrt(a * a * a / M);
        bigT(ctx, "a = " + a + " AU · 질량 합 " + M.toFixed(1) + " M☉", "이 값으로 계산한 주기 " + Pc.toFixed(1) + "년 (관측 50년)");
        /* 쌍성 궤도판(미니어처): 어두운 원판 위의 상대 궤도 */
        var cx = 232, cy = 218, prx = 196, pry = 84;
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
        ctx.fillStyle = "#0a0e22"; ctx.beginPath(); ctx.ellipse(cx, cy + 12, prx, pry, 0, 0, 6.2832); ctx.fill(); ctx.restore();
        ctx.fillStyle = "#0a0e22"; ctx.fillRect(cx - prx, cy, prx * 2, 12);
        var pg = ctx.createRadialGradient(cx - 40, cy - 30, 10, cx, cy, prx); pg.addColorStop(0, "#232c5e"); pg.addColorStop(1, "#0d1230");
        ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(cx, cy, prx, pry, 0, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1.2; ctx.stroke();
        var Rr = K.rng(23); for (var q = 0; q < 60; q++) { var qa = Rr() * 6.2832, qr = Math.sqrt(Rr()); ctx.fillStyle = "rgba(230,236,255," + (.2 + Rr() * .5).toFixed(2) + ")"; ctx.fillRect(cx + Math.cos(qa) * qr * prx * .95, cy + Math.sin(qa) * qr * pry * .95, 1.3, 1.3); }
        var r = 120, ry = 54, rot = 0.12;
        ctx.strokeStyle = "rgba(200,210,255,.55)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, rot, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        var th = ang * 2 * Math.PI;
        var x = cx + r * Math.cos(th) * Math.cos(rot) - ry * Math.sin(th) * Math.sin(rot), y = cy + r * Math.cos(th) * Math.sin(rot) + ry * Math.sin(th) * Math.cos(rot);
        K.glow(ctx, cx, cy - 6, 9, "rgba(255,214,106,.98)", 3.4);
        K.glow(ctx, x, y - 4, 5, "rgba(255,154,106,.98)", 3.4);
        K.pill(ctx, "각거리 2.0″ · 주기 50년 · 거리 10 pc", cx, cv.H - 12, { s: 11.5, a: "center", c: K.C.ink });
        K.warn(ctx, 460, 104, "⚠ 궤도 크기는 그림으로 꾸밈", "right");
        jcard(ctx, 500, 14, 386, cv.H - 28, "판정 · M₁ + M₂ = a³ ÷ P²", [
          ["궤도 긴반지름 a", a + " AU", a === TA ? LT.green : null],
          ["질량 합 M₁ + M₂", M.toFixed(1) + " M☉"],
          ["이 값으로 계산한 주기", Pc.toFixed(1) + " 년", Math.abs(Pc - TP) / TP < 0.04 ? LT.green : LT.red, true],
          ["관측한 주기", "50 년"]
        ], "a(AU) = 각거리(″) × 거리(pc)");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "궤도 긴반지름 a", min: 0, max: 50, step: 2, value: 10, fmt: function (x) { return x + " AU"; }, onInput: function (x) { a = x; draw(); } });
      api.slider({ label: "두 별의 질량 합", min: 0.5, max: 10, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " M☉"; }, onInput: function (x) { M = x; draw(); } });
      api.button("▶ 공전해 보기", function () { run(60, 40, function (k) { ang = k; draw(); }); });
      api.info("각거리(″) × 거리(pc) = 실제 거리(AU). 태양 질량 단위·AU·년을 쓰면 M₁ + M₂ = a³ ÷ P²입니다.");
      draw();
      return {
        judge: function () {
          if (a !== TA) return { ok: false, msg: "궤도 긴반지름 " + a + " AU — 각거리와 거리로 다시 계산하세요." };
          if (Math.abs(M - TM) > 0.2) return { ok: false, msg: "a는 맞았습니다. 질량 합 " + M.toFixed(1) + " M☉ 로는 주기가 50년이 되지 않아요." };
          return { ok: true, msg: "a = 2.0 × 10 = 20 AU, M = 20³ ÷ 50² = 3.2 M☉. 쌍성은 별의 질량을 직접 잴 수 있는 거의 유일한 방법입니다." };
        }
      };
    },
    hints: [
      "a(AU) = 각거리(″) × 거리(pc) = 2.0 × 10.",
      "M = a³ ÷ P² = 8000 ÷ 2500."
    ],
    solution: "a = <b>20 AU</b>, 질량 합 = <b>3.2 M☉</b>(3.0~3.4).",
    why: "케플러 제3법칙은 쌍성에도 그대로 쓰입니다. 궤도 크기와 주기만 알면 두 별의 <b>질량 합</b>이, 두 별이 공통 질량 중심에서 떨어진 거리의 비까지 알면 <b>각각의 질량</b>이 나옵니다.<br>" +
      "이렇게 잰 주계열성들의 질량과 광도 사이에서 <b>질량–광도 관계</b>(L ∝ M³·⁵)가 발견되었고, 덕분에 쌍성이 아닌 별도 밝기로 질량을 어림할 수 있게 되었습니다."
  },

  /* ------------------------------------------------------------------ 3. 세페이드 변광성과 거리 */
  {
    id: "c3", about: "04", tag: "맥동 변광성 · 주기–광도 관계", title: "안드로메다까지의 자", short: "세페이드 거리",
    who: "💓", name: "은하 거리 측정팀",
    say: "“안드로메다은하에서 세페이드 변광성 하나의 밝기 변화를 몇 달 동안 기록했어요. 평균 겉보기 등급은 <b>18.9</b>입니다. 주기–광도 관계(<b>M = −2.81 log P − 1.43</b>, P는 일)로 이 은하까지의 거리를 구해 주세요.”",
    predict: {
      q: "두 세페이드 변광성 가운데 변광 주기가 긴 쪽은?",
      options: ["㉠ 실제로 더 밝다(절대 등급이 작다)", "㉡ 실제로 더 어둡다", "㉢ 주기와 밝기는 관계없다"],
      answer: 0
    },
    task: "광도 곡선에서 <b>주기</b>를 읽고(± 1일), 은하까지의 <b>거리</b>를 정하세요(± 5%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var TP = 30, m = 18.9, P = 10, d = 400;
      function Mabs(p) { return -2.81 * H.log10(p) - 1.43; }
      function dist(p) { return Math.pow(10, (m - Mabs(p)) / 5 + 1) / 1000; }
      function curve(t) { var f = (t % TP) / TP; return f < 0.2 ? 19.4 - f / 0.2 * 1.0 : 18.4 + (f - 0.2) / 0.8 * 1.0; }
      function draw() {
        H.paper(ctx, W, cv.H);
        bigT(ctx, "주기 " + P + "일 → 절대 등급 " + Mabs(P).toFixed(2), "빨간 점선이 밝아지는 봉우리마다 겹치면 주기가 맞습니다");
        var g = K.chart(ctx, { x: 8, y: 88, w: 552, h: cv.H - 96, x0: 0, x1: 100, y0: 19.5, y1: 18.3, xt: 5, yt: 2, light: true,
          xf: function (t) { return Math.round(t) + "일"; }, yf: function (mm) { return mm.toFixed(1); }, xl: "관측한 날 →", yl: "겉보기 등급 (위가 밝음)" });
        for (var k = 0; k * P <= 100; k++) K.line(ctx, { x: g.X(k * P), y: g.T }, { x: g.X(k * P), y: g.B }, "rgba(224,49,49,.6)", 1.4, [5, 4]);
        for (var t = 0; t <= 100; t += 2) ball(ctx, g.X(t), g.Y(curve(t)), 3.4, "rgb(112,72,232)");
        jcard(ctx, 572, 14, 314, cv.H - 28, "판정 · 거리(pc) = 10^((m − M + 5) ÷ 5)", [
          ["주기 " + P + "일의 절대 등급", Mabs(P).toFixed(2)],
          ["거리 지수 m − M", (m - Mabs(P)).toFixed(2)],
          ["내가 정한 거리", d + " kpc", LT.blue, true]
        ], "평균 겉보기 등급 m = 18.9");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "변광 주기", min: 1, max: 60, step: 1, value: 10, fmt: function (x) { return x + " 일"; }, onInput: function (x) { P = x; draw(); } });
      api.slider({ label: "은하까지의 거리", min: 100, max: 1500, step: 10, value: 400, fmt: function (x) { return x + " kpc"; }, onInput: function (x) { d = x; draw(); } });
      api.info("빨간 점선이 밝기 최대(갑자기 밝아지는 곳)마다 겹치면 주기가 맞은 것입니다. 거리(pc) = 10^((m − M + 5) ÷ 5).");
      draw();
      return {
        judge: function () {
          if (Math.abs(P - TP) > 1) return { ok: false, msg: "주기 " + P + "일 — 광도 곡선이 되풀이되는 간격과 맞지 않습니다." };
          var D = dist(TP);
          if (Math.abs(d - D) / D > 0.05) return { ok: false, msg: "주기는 맞았습니다. 절대 등급 " + Mabs(TP).toFixed(2) + " 과 겉보기 등급 18.9로 거리를 다시 계산하세요." };
          return { ok: true, msg: "주기 30일 → 절대 등급 약 −5.6 → 거리 약 " + Math.round(D) + " kpc(약 250만 광년). 우리은하 바깥에 다른 은하가 있다는 것을 허블이 이렇게 보였습니다." };
        }
      };
    },
    hints: [
      "광도 곡선에서 갑자기 밝아지는 봉우리 사이의 날수를 세어 보세요.",
      "M = −2.81 × log 30 − 1.43 ≈ −5.58. m − M ≈ 24.5 → 거리 = 10^(24.5 ÷ 5 + 1) pc."
    ],
    solution: "주기 <b>30일</b>, 거리 <b>약 790 kpc</b>(750~830 kpc).",
    why: "세페이드 변광성은 주기가 길수록 실제로 밝다는 <b>주기–광도 관계</b>가 있어(리비트, 1912), 주기만 재면 절대 등급을 알 수 있습니다. 겉보기 등급과 비교하면 거리가 나오지요 — 밝기가 정해진 ‘표준 촛불’입니다.<br>" +
      "1923년 허블은 안드로메다 성운에서 세페이드를 찾아 거리를 재고, 그것이 우리은하 밖의 별개 은하임을 밝혔습니다. 우주의 크기를 단숨에 넓힌 자였습니다. ※ 성간 소광은 무시했습니다."
  }
  ]
});
})();
