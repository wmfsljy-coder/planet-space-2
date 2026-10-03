/* 행성우주과학2 Ⅱ-1 태양과 별의 관측 — 실제 자료
   r1 아크투루스까지의 거리와 절대 등급 — 히파르코스 위성이 잰 연주 시차로
   r2 태양은 H-R도의 어디에 있을까 — 실제 별 5,000여 개 위에 태양 찍기
   자료: data/hr-stars.js (ESA 히파르코스 목록, CDS VizieR I/239) */
(function () {
"use strict";
var HR = window.REAL_HR || { rows: [], named: [] };
var ARC = HR.named.filter(function (n) { return n[0] === "69673"; })[0] || ["69673", "아크투루스", -0.05, 88.85, 1.239];
var ARC_D = 1000 / ARC[3], ARC_M = ARC[2] + 5 + 5 * Math.log(ARC[3] / 1000) / Math.LN10;
var SUN = [0.65, 4.83];
var SRC = "<small>출처: 유럽 우주국(ESA) 히파르코스 위성 목록(1997, CDS VizieR I/239) — 연주 시차가 정밀하게 잰 별 " + HR.rows.length.toLocaleString() + "개. 절대 등급 Mv = V + 5 + 5 log p (p 는 초 단위 시차), 성간 소광은 무시했습니다. 사본은 data/hr-stars.js.</small>";

function hrd(H, ctx, W, CH, mark, col) {
  H.paper(ctx, W, CH);
  var x0 = 60, x1 = 600, y0 = 20, y1 = CH - 36;
  function X(bv) { return x0 + (bv + 0.4) / 2.4 * (x1 - x0); }
  function Y(m) { return y0 + (m + 6) / 22 * (y1 - y0); }                 /* 위가 밝음 */
  H.axes(ctx, x0, y0, x1, y1);
  [-5, 0, 5, 10, 15].forEach(function (m) { H.text(ctx, m, x0 - 6, Y(m) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  [0, 0.5, 1, 1.5].forEach(function (b) { H.text(ctx, b.toFixed(1), X(b), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
  H.text(ctx, "← 파랗고 뜨거움    색지수 B−V    붉고 차가움 →", (x0 + x1) / 2, y1 + 30, { s: 10.5, w: "700", a: "center", c: H.v("--mist") });
  H.text(ctx, "절대 등급(위로 갈수록 밝음)", x0 + 6, y0 + 12, { s: 10.5, w: "700", c: H.v("--mist") });
  ctx.save(); ctx.globalAlpha = 0.5;
  HR.rows.forEach(function (r) { if (r[0] < -0.4 || r[0] > 2 || r[1] < -6 || r[1] > 16) return; ctx.fillStyle = r[0] < 0.3 ? "#5b8fd9" : (r[0] < 0.8 ? "#e0b030" : "#d9653b"); ctx.fillRect(X(r[0]) - 1, Y(r[1]) - 1, 2.2, 2.2); });
  ctx.restore();
  if (mark) { H.dot(ctx, X(mark[0]), Y(mark[1]), 7, H.v(col || "--ink")); }
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 시차·절대 등급·H-R도를 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 연주 시차", title: "아크투루스까지의 거리와 절대 등급", short: "아크투루스",
    who: "⭐", name: "히파르코스 자료실",
    say: "“봄철 밤하늘의 주황색 1등성 <b>아크투루스</b>의 실제 관측값이에요. 히파르코스 위성은 지구가 태양을 도는 동안 별의 위치가 살짝 흔들리는 각도(연주 시차)를 재었습니다. 겉보기 등급 <b>V = " + ARC[2] + "</b>, 연주 시차 <b>p = " + ARC[3] + " mas</b>(1 mas = 0.001″). <b>거리(pc)</b>와 <b>절대 등급</b>을 구해 주세요.”",
    predict: {
      q: "아크투루스는 H-R도에서 어느 무리에 들까요?",
      options: ["㉠ 주계열성", "㉡ 거성", "㉢ 백색 왜성"],
      answer: 1
    },
    task: "거리 = 1 ÷ p(″), 절대 등급 = V + 5 + 5 log p(″). 두 값을 슬라이더로 맞추세요(거리 ± 0.5 pc, 등급 ± 0.2).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, d = 5, m = 5;
      function draw() {
        hrd(H, ctx, W, cv.H, [ARC[4], m], "--ink");
        H.rows(ctx, 640, 40, [["겉보기 등급 V", ARC[2]], ["연주 시차", ARC[3] + " mas"], ["내 답 거리", d.toFixed(1) + " pc", null, true], ["내 답 절대 등급", m.toFixed(2), null, true]], 56);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "거리", min: 1, max: 30, step: 0.1, value: 5, fmt: function (x) { return x.toFixed(1) + " pc"; }, onInput: function (x) { d = x; api.changed(); draw(); } });
      api.slider({ label: "절대 등급", min: -6, max: 10, step: 0.05, value: 5, fmt: function (x) { return x.toFixed(2); }, onInput: function (x) { m = x; api.changed(); draw(); } });
      api.info("검은 점이 내가 맞춘 절대 등급의 자리입니다(가로 위치는 아크투루스의 색 B−V = " + ARC[4] + "). 1 pc ≈ 3.26 광년. " + SRC);
      draw();
      return {
        judge: function () {
          var okD = Math.abs(d - ARC_D) <= 0.5, okM = Math.abs(m - ARC_M) <= 0.2 + 1e-9;
          if (okD && okM) return { ok: true, msg: "1 ÷ 0.08885 ≈ " + ARC_D.toFixed(2) + " pc(약 " + (ARC_D * 3.26).toFixed(0) + " 광년), 절대 등급 ≈ " + ARC_M.toFixed(2) + " — 같은 색의 주계열성보다 훨씬 밝은 거성입니다." };
          return { ok: false, msg: (okD ? "거리는 맞았습니다. " : "거리: 시차를 초(″) 로 바꾼 뒤 1 을 나누세요. ") + (okM ? "등급도 맞았습니다." : "등급: log 0.08885 ≈ −1.05 입니다.") };
        }
      };
    },
    hints: ["88.85 mas = 0.08885″ → 거리 = 1 ÷ 0.08885 pc.", "M = −0.05 + 5 + 5 × log(0.08885) = −0.05 + 5 − 5.26 ≈ ?"],
    solution: "거리 약 <b>" + ARC_D.toFixed(1) + " pc</b>, 절대 등급 약 <b>" + ARC_M.toFixed(2) + "</b> — 거성.",
    why: "가까운 별일수록 지구가 공전하는 동안 위치가 크게 흔들려 연주 시차가 큽니다. 거리(pc) = 1 ÷ 시차(″)이고, 모든 별을 10 pc 에 옮겨 놓았을 때의 밝기가 절대 등급이에요. 아크투루스는 태양과 온도가 비슷한 별들(오른쪽 아래 주계열)보다 100배 넘게 밝은데, 이는 별이 부풀어 표면적이 아주 크다는 뜻입니다 — 수소를 다 쓰고 부풀어 오른 <b>거성</b>입니다.<br>"
      + "히파르코스(1989 ~ 1993)는 약 12만 개 별의 시차를 1 mas 정밀도로 쟀고, 그 뒤를 이은 가이아 위성은 10억 개가 넘는 별을 훨씬 정밀하게 재고 있습니다."
  },
  {
    id: "r2", tag: "실제 자료 · H-R도", title: "태양은 H-R도의 어디에 있을까", short: "태양의 자리",
    who: "☀️", name: "별 분류 연구실",
    say: "“히파르코스가 정밀하게 거리를 잰 실제 별들로 그린 H-R도예요. 왼쪽 위에서 오른쪽 아래로 이어진 굵은 띠가 주계열, 오른쪽 위가 거성, 왼쪽 아래가 백색 왜성 자리입니다. 태양의 색지수는 <b>B−V = 0.65</b>, 절대 등급은 <b>4.83</b> 이에요. 점을 옮겨 <b>태양의 자리</b>에 놓아 주세요.”",
    predict: {
      q: "태양은 별들 가운데 어떤 별일까요?",
      options: ["㉠ 가장 밝고 뜨거운 별", "㉡ 주계열 한가운데쯤의 평범한 별", "㉢ 아주 어두운 백색 왜성"],
      answer: 1
    },
    task: "색지수와 절대 등급 슬라이더로 점을 태양의 자리에 놓으세요(색 ± 0.08, 등급 ± 0.5).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, b = 1.5, m = -3;
      function draw() {
        hrd(H, ctx, W, cv.H, [b, m], "--green-700");
        var brighter = HR.rows.filter(function (r) { return r[1] < m; }).length;
        H.rows(ctx, 640, 50, [["점의 색지수", b.toFixed(2), null, true], ["점의 절대 등급", m.toFixed(1), null, true], ["이 점보다 밝은 별", (brighter / HR.rows.length * 100).toFixed(0) + " %"]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "색지수 B−V", min: -0.3, max: 2, step: 0.01, value: 1.5, fmt: function (x) { return x.toFixed(2); }, onInput: function (x) { b = x; api.changed(); draw(); } });
      api.slider({ label: "절대 등급", min: -5, max: 15, step: 0.1, value: -3, fmt: function (x) { return x.toFixed(1); }, onInput: function (x) { m = x; api.changed(); draw(); } });
      api.info("파랑·노랑·주황 점은 색에 따라 칠했습니다. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(b - SUN[0]) <= 0.08 + 1e-9 && Math.abs(m - SUN[1]) <= 0.5 + 1e-9) return { ok: true, msg: "B−V 0.65, Mv 4.83 — 태양은 주계열 한가운데의 평범한 노란 별(G 형)입니다." };
          return { ok: false, msg: "색지수 " + b.toFixed(2) + ", 등급 " + m.toFixed(1) + " 은 태양의 자리가 아닙니다. 가로(색)와 세로(밝기)를 각각 맞추세요." };
        }
      };
    },
    hints: ["가로축 0.65 는 0.5 와 1.0 사이입니다.", "세로축은 아래로 갈수록 어둡습니다. 4.83 은 5 바로 위입니다."],
    solution: "B−V <b>0.65</b>, 절대 등급 <b>4.83</b> — 주계열의 가운데.",
    why: "H-R도에서 별은 아무 데나 흩어져 있지 않고 주계열·거성·백색 왜성의 무리로 모입니다. 주계열은 중심에서 수소를 태우는 별들로, 왼쪽 위로 갈수록 무겁고 뜨겁고 밝으며 수명이 짧습니다. 태양은 그 한가운데쯤의 평범한 별이에요.<br>"
      + "이 그림에는 밝아서 멀리서도 보이는 거성이 실제보다 많이 들어 있습니다(밝은 별을 골라 넣었기 때문). 태양 둘레 25 pc 안의 별만 세면 대부분이 태양보다 어두운 붉은 왜성입니다. 어떤 별을 골라 그렸는지에 따라 그림이 달라지는 관측 치우침의 예입니다."
  }
  ]
});
})();
