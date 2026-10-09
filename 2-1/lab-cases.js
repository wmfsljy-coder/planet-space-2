/* 행성우주과학 Ⅱ-1 태양과 별의 관측 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 연주 시차 */
  {
    id: "c1", tag: "연주 시차 · 파섹", title: "반년 사이에 움직인 별", short: "연주 시차",
    who: "📷", name: "학교 천문대 사진반",
    say: "“같은 별 무리를 <b>1월과 7월</b>에 찍어 겹쳐 보니, 멀리 있는 배경별들은 그대로인데 한 별만 조금 옮겨져 있었어요. 사진의 눈금 한 칸은 <b>0.1″</b>(각초)입니다. 이 별까지의 거리를 구해 주세요.”",
    predict: {
      q: "반년 간격으로 찍은 사진에서 별이 옮겨 간 각은 연주 시차의 몇 배일까요?",
      options: ["㉠ 같다", "㉡ 2배 — 지구가 태양 반대편까지 지름만큼 움직였으므로", "㉢ 절반"],
      answer: 1
    },
    task: "사진에서 <b>연주 시차</b>를 읽고(± 0.01″), 그 별까지의 <b>거리</b>를 정하세요(± 0.25 pc).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var P = 0.25, p = 0.1, d = 10;
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "1월 사진(파랑)과 7월 사진(주황)을 겹친 모습", 40, 26, { s: 13.5, w: "900" });
        var x0 = 80, y0 = 50, g = 36;
        H.box(ctx, x0, y0, g * 12, g * 6, "#0b1020", 1);
        ctx.strokeStyle = "rgba(255,255,255,.12)";
        for (var i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * g, y0); ctx.lineTo(x0 + i * g, y0 + g * 6); ctx.stroke(); }
        for (var j = 0; j <= 6; j++) { ctx.beginPath(); ctx.moveTo(x0, y0 + j * g); ctx.lineTo(x0 + g * 12, y0 + j * g); ctx.stroke(); }
        [[1.5, 1.2], [9.7, 0.8], [4.2, 4.6], [10.8, 5.1], [7.3, 2.4]].forEach(function (s) { H.dot(ctx, x0 + s[0] * g, y0 + s[1] * g, 2.5, "#fff"); });
        var cx = x0 + 6 * g, cy = y0 + 3 * g, sh = 2 * P / 0.1 * g / 2;
        H.dot(ctx, cx - sh, cy, 5, "#5fb4ff"); H.dot(ctx, cx + sh, cy, 5, "#ffae4a");
        H.text(ctx, "눈금 한 칸 = 0.1″", x0, y0 + g * 6 + 18, { s: 11, c: H.v("--mist") });
        H.rows(ctx, 580, 60, [
          ["내가 읽은 연주 시차", p.toFixed(2) + " ″", Math.abs(p - P) <= 0.01 ? "--green-700" : null],
          ["거리 = 1 ÷ 연주 시차", (1 / p).toFixed(2) + " pc (계산)"],
          ["내가 정한 거리", d.toFixed(1) + " pc", null, true]
        ], 62);
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
    id: "c2", tag: "쌍성 · 별의 질량", title: "보이지 않던 짝의 무게", short: "쌍성 질량",
    who: "⚖️", name: "쌍성 관측 연구실",
    say: "“거리 <b>10 pc</b> 인 안시 쌍성의 궤도를 50년 동안 추적했어요. 두 별 사이의 각거리(궤도 긴반지름)는 <b>2.0″</b>, 공전 주기는 <b>50년</b>입니다. 두 별의 질량을 합하면 태양의 몇 배일까요?”",
    predict: {
      q: "쌍성의 궤도 크기가 같다면, 공전 주기가 짧은 쌍성의 질량 합은?",
      options: ["㉠ 더 크다 — 더 강한 중력이 빨리 돌게 하므로", "㉡ 더 작다", "㉢ 같다"],
      answer: 0
    },
    task: "각거리와 거리로 <b>궤도 긴반지름(AU)</b>을 구하고, 케플러 제3법칙으로 <b>질량 합</b>을 정하세요(± 0.2 M☉).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var a = 10, M = 1, TA = 20, TP = 50, ang = 0;
      var run = api.ticker();
      var TM = TA * TA * TA / (TP * TP);
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "쌍성의 상대 궤도 (M₁ + M₂ = a³ ÷ P²)", 40, 26, { s: 13.5, w: "900" });
        var cx = 220, cy = 165, r = 100;
        ctx.strokeStyle = H.v("--line"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.7, 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        H.dot(ctx, cx, cy, 11, "#ffd36a");
        var th = ang * 2 * Math.PI;
        var x = cx + r * Math.cos(th) * Math.cos(0.3) - r * 0.7 * Math.sin(th) * Math.sin(0.3), y = cy + r * Math.cos(th) * Math.sin(0.3) + r * 0.7 * Math.sin(th) * Math.cos(0.3);
        H.dot(ctx, x, y, 6, "#ff9a6a");
        H.text(ctx, "각거리 2.0″ · 주기 50년 · 거리 10 pc", cx, 300, { s: 11.5, w: "800", a: "center", c: H.v("--mist") });
        var Pc = Math.sqrt(a * a * a / M);
        H.rows(ctx, 460, 60, [
          ["궤도 긴반지름 a", a + " AU", a === TA ? "--green-700" : null],
          ["질량 합 M₁ + M₂", M.toFixed(1) + " M☉"],
          ["이 값으로 계산한 주기", Pc.toFixed(1) + " 년", Math.abs(Pc - TP) / TP < 0.04 ? "--green-700" : "--rose-700", true],
          ["관측한 주기", "50 년"]
        ], 54);
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
    id: "c3", tag: "맥동 변광성 · 주기–광도 관계", title: "안드로메다까지의 자", short: "세페이드 거리",
    who: "💓", name: "은하 거리 측정팀",
    say: "“안드로메다은하에서 세페이드 변광성 하나의 밝기 변화를 몇 달 동안 기록했어요. 평균 겉보기 등급은 <b>18.9</b>입니다. 주기–광도 관계(<b>M = −2.81 log P − 1.43</b>, P는 일)로 이 은하까지의 거리를 구해 주세요.”",
    predict: {
      q: "두 세페이드 변광성 가운데 변광 주기가 긴 쪽은?",
      options: ["㉠ 실제로 더 밝다(절대 등급이 작다)", "㉡ 실제로 더 어둡다", "㉢ 주기와 밝기는 관계없다"],
      answer: 0
    },
    task: "광도 곡선에서 <b>주기</b>를 읽고(± 1일), 은하까지의 <b>거리</b>를 정하세요(± 5%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var TP = 30, m = 18.9, P = 10, d = 400;
      function Mabs(p) { return -2.81 * H.log10(p) - 1.43; }
      function dist(p) { return Math.pow(10, (m - Mabs(p)) / 5 + 1) / 1000; }
      var gx0 = 70, gx1 = 560, gy0 = 60, gy1 = 230;
      function GX(t) { return gx0 + t / 100 * (gx1 - gx0); }
      function GY(mm) { return gy0 + (mm - 18.3) / 1.2 * (gy1 - gy0); }
      function curve(t) { var f = (t % TP) / TP; return f < 0.2 ? 19.4 - f / 0.2 * 1.0 : 18.4 + (f - 0.2) / 0.8 * 1.0; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "광도 곡선 (가로: 관측한 날, 세로: 겉보기 등급 — 위쪽이 밝음)", 40, 26, { s: 13.5, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        for (var t = 0; t <= 100; t += 2) H.dot(ctx, GX(t), GY(curve(t)), 3, H.v("--violet"));
        [0, 20, 40, 60, 80, 100].forEach(function (t) { H.text(ctx, t + "일", GX(t), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        [18.4, 18.9, 19.4].forEach(function (mm) { H.text(ctx, mm.toFixed(1), gx0 - 6, GY(mm) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        for (var k = 0; k * P <= 100; k++) H.dash(ctx, GX(k * P), gy0, GX(k * P), gy1, H.v("--rose"));
        H.text(ctx, "빨간 점선 = 내가 정한 주기 " + P + "일 간격", gx0, gy1 + 40, { s: 11, w: "800", c: H.v("--rose-700") });
        H.rows(ctx, 600, 60, [
          ["주기 " + P + "일의 절대 등급", Mabs(P).toFixed(2)],
          ["거리 지수 m − M", (m - Mabs(P)).toFixed(2)],
          ["내가 정한 거리", d + " kpc", null, true]
        ], 62);
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
