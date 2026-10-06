/* 행성우주과학2 Ⅱ-2 은하와 우주 — 실제 자료
   r1 Ia형 초신성 499개로 허블 상수 구하기 — 거리와 후퇴 속도
   r2 허블 상수로 어림한 우주의 나이 — 1 / H₀
   자료: data/hubble-sn.js (Pantheon+ 초신성 자료, Scolnic 외 2022) */
(function () {
"use strict";
var P = (window.REAL_HUBBLE || { rows: [] }).rows;                 /* [거리 Mpc, 속도 km/s] */
var H0 = (function () { var a = 0, b = 0; P.forEach(function (r) { a += r[0] * r[1]; b += r[0] * r[0]; }); return b ? a / b : 70; })();
var AGE = 977.8 / H0;                                              /* 1/H₀ (십억 년), 1 km/s/Mpc → 977.8 Gyr */
var SRC = "<small>출처: Pantheon+ Ia형 초신성 자료(Scolnic et al. 2022, ApJ 938, 113; Brout et al. 2022) — 적색 편이 0.01~0.08의 초신성 " + P.length + "개. 거리는 거리 지수(세페이드로 보정한 값)에서, 속도는 적색 편이 × 빛의 속력으로 구했습니다. 사본은 data/hubble-sn.js.</small>";

function chart(H, ctx, W, CH, k) {
  H.paper(ctx, W, CH);
  var x0 = 70, x1 = 620, y0 = 24, y1 = CH - 36;
  function X(d) { return x0 + d / 420 * (x1 - x0); }
  function Y(v) { return y1 - v / 25000 * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  [0, 5000, 10000, 15000, 20000, 25000].forEach(function (v) { H.text(ctx, v.toLocaleString(), x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  [0, 100, 200, 300, 400].forEach(function (d) { H.text(ctx, d + " Mpc", X(d), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
  H.text(ctx, "후퇴 속도 (km/s)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  P.forEach(function (r) { H.dot(ctx, X(r[0]), Y(r[1]), 2.4, H.v("--brand")); });
  if (k != null) H.line(ctx, [[X(0), Y(0)], [X(Math.min(420, 25000 / k)), Y(Math.min(25000, k * 420))]], H.v("--amber-700"), 2.5);
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 허블 법칙과 팽창하는 우주를 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 허블 법칙", title: "초신성 " + P.length + "개로 허블 상수 구하기", short: "허블 상수",
    who: "💥", name: "초신성 탐사팀",
    say: "“Ia형 초신성은 폭발할 때의 진짜 밝기가 거의 같아, 얼마나 어둡게 보이는지로 거리를 잴 수 있어요(표준 촛불). 아래는 실제로 관측된 초신성 " + P.length + "개가 있는 은하의 <b>거리</b>와 <b>멀어지는 속도</b>입니다. 원점을 지나는 직선을 맞춰 <b>허블 상수 H₀</b>(1 Mpc마다 빨라지는 속도)를 구해 주세요.”",
    predict: {
      q: "먼 은하일수록 멀어지는 속도는?",
      options: ["㉠ 거리와 관계없다", "㉡ 거리에 비례해 빨라진다", "㉢ 먼 은하일수록 느려진다"],
      answer: 1
    },
    task: "직선의 기울기(H₀, km/s/Mpc)를 바꿔 점들에 가장 잘 맞추세요(± 3).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, k = 40;
      function err(kk) { var s = 0; P.forEach(function (r) { var e = r[1] - kk * r[0]; s += e * e; }); return Math.sqrt(s / (P.length || 1)); }
      function draw() {
        chart(H, ctx, W, cv.H, k);
        H.rows(ctx, 660, 50, [["내 H₀", k + " km/s/Mpc", null, true], ["점과 선의 평균 어긋남", Math.round(err(k)).toLocaleString() + " km/s"], ["초신성", P.length + " 개"]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "허블 상수 H₀", min: 30, max: 120, step: 1, value: 40, fmt: function (x) { return x + " km/s/Mpc"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.info("1 Mpc(메가파섹) ≈ 326만 광년. ‘평균 어긋남’이 가장 작아지는 기울기를 찾으세요. " + SRC
        + "<div data-link='{\"id\":\"hubble-tension\",\"title\":\"NASA 허블 — 가속 팽창하는 우주의 발견\",\"src\":\"미국 항공우주국\",\"url\":\"https://science.nasa.gov/mission/hubble/science/science-highlights/discovering-a-runaway-universe/\",\"ask\":\"이 글에서 우주의 팽창이 시간이 갈수록 빨라지고 있다는 사실을 무엇으로 알아냈는지 한 문장으로 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(k - H0) <= 3) return { ok: true, msg: "가장 잘 맞는 기울기는 약 " + H0.toFixed(1) + " km/s/Mpc — 1 Mpc 더 멀수록 약 " + Math.round(H0) + " km/s 더 빨리 멀어집니다." };
          return { ok: false, msg: k + " 는 " + (k < H0 ? "너무 완만합니다" : "너무 가파릅니다") + ". 평균 어긋남이 줄어드는 쪽으로 옮기세요." };
        }
      };
    },
    hints: ["300 Mpc에 있는 점들의 속도는 대략 2만 1천 km/s입니다.", "21000 ÷ 300 ≈ ?"],
    solution: "약 <b>" + H0.toFixed(0) + " km/s/Mpc</b>.",
    why: "은하가 거리에 비례하는 속도로 멀어진다는 것은 공간 자체가 고르게 늘어나고 있다는 뜻입니다(허블-르메트르 법칙, v = H₀ d). 1927년 르메트르가 먼저 어림했고, 1929년 허블이 가까운 은하 24개로 보였으며, 지금은 초신성과 세페이드 변광성으로 훨씬 정밀하게 잽니다.<br>"
      + "재는 방법에 따라 H₀가 약 67(우주 배경 복사)과 약 73(세페이드 + 초신성)으로 조금 다르게 나와, ‘허블 긴장’이라는 풀리지 않은 문제가 되어 있습니다. 이 사례의 값(약 70)은 원점을 지나는 단순한 직선으로 구한 어림값입니다. 먼 초신성의 빛이 오는 동안 우주가 팽창한 효과까지 고치면 이 자료에서도 약 73이 나옵니다."
  },
  {
    id: "r2", tag: "실제 자료 · 우주의 나이", title: "허블 상수로 어림한 우주의 나이", short: "우주의 나이",
    who: "⏳", name: "우주론 연구실",
    say: "“지금 속도로 멀어지는 은하를 시간을 거꾸로 돌리면, 모든 은하가 한 점에 모였던 때가 나옵니다. 그때까지의 시간은 대략 <b>1 ÷ H₀</b>입니다. 앞에서 구한 H₀ ≈ " + H0.toFixed(1) + " km/s/Mpc로 <b>우주의 나이(십억 년)</b>를 어림해 주세요. 1 Mpc = 3.086 × 10¹⁹ km, 1년 = 3.156 × 10⁷ 초입니다.”",
    predict: {
      q: "허블 상수가 더 크다면 어림한 우주의 나이는?",
      options: ["㉠ 더 많아진다", "㉡ 더 적어진다", "㉢ 변하지 않는다"],
      answer: 1
    },
    task: "1 ÷ H₀를 초로 계산한 뒤 년으로 바꿔, 우주의 나이를 슬라이더로 맞추세요(± 0.7 십억 년).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, g = 5;
      function draw() {
        var p = chart(H, ctx, W, cv.H, H0);
        H.rows(ctx, 660, 50, [["H₀", H0.toFixed(1) + " km/s/Mpc"], ["내 답", g.toFixed(1) + " 십억 년", null, true]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "우주의 나이", min: 1, max: 30, step: 0.1, value: 5, fmt: function (x) { return x.toFixed(1) + " 십억 년"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("1 ÷ H₀ = 1 Mpc ÷ (H₀ km/s) = 3.086 × 10¹⁹ ÷ H₀ 초. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(g - AGE) <= 0.7) return { ok: true, msg: "3.086 × 10¹⁹ ÷ " + H0.toFixed(1) + " ≈ " + (3.086e19 / H0 / 1e17).toFixed(2) + " × 10¹⁷ 초 ≈ " + AGE.toFixed(1) + " 십억 년." };
          return { ok: false, msg: g.toFixed(1) + " 십억 년은 " + (g < AGE ? "적습니다" : "많습니다") + ". 초로 구한 값을 1년의 초 수로 나누세요." };
        }
      };
    },
    hints: ["3.086 × 10¹⁹ ÷ 70 ≈ 4.4 × 10¹⁷ 초.", "4.4 × 10¹⁷ ÷ 3.156 × 10⁷ ≈ 1.4 × 10¹⁰ 년."],
    solution: "약 <b>" + AGE.toFixed(1) + " 십억 년</b> (1 ÷ H₀).",
    why: "1 ÷ H₀는 우주가 처음부터 지금 속도로 팽창했다고 가정한 어림값(허블 시간)입니다. 실제로는 처음에 중력 때문에 팽창이 느려지다가 최근 수십억 년 동안 암흑 에너지 때문에 빨라졌는데, 두 효과가 거의 상쇄되어 우주 배경 복사로 정밀하게 구한 나이 <b>약 138억 년</b>과 비슷하게 나옵니다.<br>"
      + "가장 오래된 별(약 120억 ~ 130억 년)보다 우주가 젊으면 안 되므로, 이 어림은 빅뱅 우주론을 검사하는 중요한 잣대이기도 했습니다."
  }
  ]
});
})();
