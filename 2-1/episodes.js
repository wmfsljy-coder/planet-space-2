/* 행성우주과학 Ⅱ-1 태양과 별의 관측 — 소단원별 이야기 네 편
   ① 망원경에 비친 얼룩 ② 8년 동안 잰 각도 ③ 흔들리며 가는 별 ④ 심장이 뛰는 별
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork), ../assets/story.js, ../assets/share.js */
(function () {
"use strict";

window.sthUnit("psp-2-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
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

/* =========================================================================
   이야기 ① 망원경에 비친 얼룩
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epA", key: "epA", name: "사건 파일 ①", onDone: finish });

  window.sthGate({
    gate: "a-gate", key: "a-p", title: "관측 조수의 첫 추리",
    question: "태양 위의 검은 얼룩, 정체가 무엇일까요?",
    options: ["㉠ 태양 앞을 지나가는 작은 천체들의 그림자다", "㉡ 태양 표면에 붙어 있는 무언가다", "㉢ 망원경 렌즈에 묻은 흠이다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 흑점 추적 ---- */
  var LOG = window.sthState("aLog") || [];
  function period(lat) { return 25.0 / (1 - 0.25 * Math.pow(Math.sin(lat * Math.PI / 180), 2)); }

  (function () {
    var canvas = $("a-c-spot"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var lat = 0, day = 0;

    function draw() {
      paper(ctx, W, H);
      var cx = 230, cy = 195, R = 128;
      /* 태양 원반 */
      ctx.fillStyle = v("--amber-100"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 3; ctx.stroke();
      /* 위도선 */
      ctx.strokeStyle = v("--amber"); ctx.globalAlpha = .35; ctx.lineWidth = 1;
      [-60, -30, 0, 30, 60].forEach(function (L) {
        var yy = cy - R * Math.sin(L * Math.PI / 180), rx = R * Math.cos(L * Math.PI / 180);
        ctx.beginPath(); ctx.ellipse(cx, yy, rx, 5, 0, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      text(ctx, "갈릴레이의 투영판", 230, 44, { s: 13, w: "800", a: "center" });

      /* 흑점 두 개: 고른 위도 + 적도 대조군 */
      [{ L: lat, c: "--coral-700", n: "내가 고른 흑점" }, { L: 0, c: "--mist", n: "적도 대조군" }].forEach(function (s, k) {
        if (k === 1 && lat === 0) return;
        var P = period(s.L), lon = 360 * day / P;
        var cl = Math.cos(lon * Math.PI / 180);
        if (cl <= 0.02) return;
        var x = cx + R * Math.cos(s.L * Math.PI / 180) * Math.sin(lon * Math.PI / 180);
        var y = cy - R * Math.sin(s.L * Math.PI / 180);
        ctx.fillStyle = v(s.c);
        ctx.beginPath(); ctx.ellipse(x, y, 10 * cl, 10, 0, 0, Math.PI * 2); ctx.fill();
      });
      var P0 = period(lat), lon0 = 360 * day / P0, visible = Math.cos(lon0 * Math.PI / 180) > 0.02;
      text(ctx, visible ? "흑점이 보입니다 (중심에서 " + Math.round(lon0 % 360 > 180 ? lon0 % 360 - 360 : lon0 % 360) + "°)" : "흑점이 뒷면으로 넘어가 보이지 않습니다",
        230, 350, { s: 12, a: "center", c: visible ? v("--ink") : v("--mist") });

      /* 오른쪽 기록표 */
      var x0 = 470;
      text(ctx, "자전 주기 기록", x0, 44, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, 56); ctx.lineTo(880, 56); ctx.stroke();
      text(ctx, "위도", x0 + 4, 76, { s: 11.5, c: v("--mist"), w: "800" });
      text(ctx, "한 바퀴 도는 데 걸린 날수", x0 + 110, 76, { s: 11.5, c: v("--mist"), w: "800" });
      if (!LOG.length) text(ctx, "아직 기록이 없습니다. 위도를 정하고 기록 단추를 누르세요.", x0 + 4, 104, { s: 12, c: v("--mist") });
      LOG.slice(-7).forEach(function (r, i) {
        var yy = 100 + i * 30;
        text(ctx, r.lat + "°", x0 + 4, yy, { s: 13, w: "800" });
        ctx.fillStyle = r.lat <= 15 ? v("--teal") : (r.lat >= 55 ? v("--violet") : v("--brand"));
        ctx.fillRect(x0 + 110, yy - 11, (r.p - 24) * 28, 13);
        text(ctx, r.p.toFixed(1) + "일", x0 + 118 + (r.p - 24) * 28, yy, { s: 12.5, w: "800" });
      });
      text(ctx, "막대는 24일을 기준으로 늘어난 길이입니다", x0 + 4, H - 14, { s: 10.5, c: v("--mist") });
    }
    canvas._redraw = draw;

    function say() {
      $("a-spot-info").innerHTML = "위도 <b>" + lat + "°</b> 의 흑점은 태양을 한 바퀴 도는 데 <b>" + period(lat).toFixed(1) + "일</b>이 걸립니다. " +
        (LOG.length >= 2 ? "기록을 견주어 보세요. 위도에 따라 날수가 <b>다릅니다</b>." : "위도를 바꿔 여러 번 기록해 보세요.");
    }
    function mission() {
      var lo = LOG.some(function (r) { return r.lat <= 15; }), hi = LOG.some(function (r) { return r.lat >= 55; });
      if (lo) done("m1-2a"); if (hi) done("m1-2b");
      if (lo && hi) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>적도는 약 <b>25일</b>, 고위도는 약 <b>31일</b>. 위도마다 도는 속도가 다릅니다. 단단한 공이라면 있을 수 없는 일이고, 태양이 <b>기체</b>라는 뜻입니다. 이것을 <b>차등 자전</b>이라고 합니다.");
        ep.clear(1);
      }
    }
    $("a-lat").addEventListener("input", function (e) { lat = +e.target.value; $("a-lat-val").textContent = lat + "°"; draw(); say(); });
    $("a-day").addEventListener("input", function (e) { day = +e.target.value; $("a-day-val").textContent = day + "일"; draw(); });
    $("a-log").addEventListener("click", function () {
      if (!LOG.some(function (r) { return r.lat === lat; })) LOG.push({ lat: lat, p: +period(lat).toFixed(1) });
      window.sthState("aLog", LOG.slice(-8));
      draw(); say(); mission();
    });
    draw(); say(); mission();
  })();

  /* ---- 장면3 빈의 변위 법칙 ---- */
  (function () {
    var canvas = $("a-c-wien"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 0, got = window.sthState("aWien") || { a: false, b: false, c: false };
    function temp(i) { return 3000 * Math.pow(10, i * 2.9 / 100); }
    function lamMax(T) { return 2.898e6 / T; }                    /* nm */
    function band(lam) { return lam < 10 ? "X선" : (lam < 380 ? "자외선" : (lam < 750 ? "가시광" : "적외선")); }

    function draw() {
      paper(ctx, W, H);
      var T = temp(i0), lm = lamMax(T);
      var x0 = 70, x1 = W - 40, y0 = 60, y1 = 250;
      /* 가로축: log λ 0.1 ~ 10000 nm */
      function X(lam) { return x0 + (Math.log(lam) / Math.LN10 + 1) / 6 * (x1 - x0); }
      axes(ctx, x0, y0, x1, y1);
      [[0.1, "0.1"], [1, "1"], [10, "10"], [100, "100"], [1000, "1,000"], [10000, "10,000"]].forEach(function (g) {
        text(ctx, g[1], X(g[0]), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "파장 (nm) →", x1, y1 + 36, { s: 11, c: v("--mist"), a: "right" });
      /* 파장대 띠 */
      [[0.1, 10, "--violet", "X선"], [10, 380, "--brand", "자외선"], [380, 750, "--green", "가시광"], [750, 10000, "--coral", "적외선"]].forEach(function (b) {
        ctx.fillStyle = v(b[2]); ctx.globalAlpha = .16;
        ctx.fillRect(X(b[0]), y0, X(b[1]) - X(b[0]), y1 - y0); ctx.globalAlpha = 1;
        text(ctx, b[3], (X(b[0]) + X(b[1])) / 2, y0 - 8, { s: 11.5, w: "800", a: "center", c: v(b[2]) });
      });
      /* 복사 곡선(모양만) */
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var k = 0; k <= 200; k++) {
        var lam = Math.pow(10, -1 + 6 * k / 200);
        var u = lm / lam;
        var rel = Math.pow(u, 5) / (Math.exp(4.965 * u) - 1) * (Math.exp(4.965) - 1);
        var xx = X(lam), yy = y1 - clamp(rel, 0, 1) * (y1 - y0 - 10);
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 최대 파장 표시 */
      ctx.strokeStyle = v("--rose"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(lm), y0); ctx.lineTo(X(lm), y1); ctx.stroke(); ctx.setLineDash([]);
      var lx = clamp(X(lm), x0 + 70, x1 - 70);
      text(ctx, "가장 세게 내는 빛", lx, y0 + 16, { s: 11.5, w: "800", a: "center", c: v("--rose-700") });
      /* 값 상자 */
      text(ctx, "온도 " + Math.round(T).toLocaleString() + " K", x0, H - 34, { s: 15, w: "900" });
      text(ctx, "최대 세기 파장 " + (lm >= 100 ? Math.round(lm) : lm.toFixed(lm < 10 ? 2 : 1)) + " nm → " + band(lm),
        x0 + 230, H - 34, { s: 15, w: "900", c: v("--brand-700") });
      text(ctx, "빈의 변위 법칙 : 최대 세기 파장 × 온도 = 일정 (2.9 × 10⁶ nm·K)", x0, H - 12, { s: 11, c: v("--mist") });

      var ch = false;
      if (T >= 5200 && T <= 6500 && !got.a) { got.a = ch = true; }
      if (T >= 9000 && T <= 11500 && !got.b) { got.b = ch = true; }
      if (T >= 700000 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("aWien", got); mission(); }
      $("a-wien-info").innerHTML = "온도가 " + Math.round(T).toLocaleString() + " K 인 기체는 <b>" + band(lm) + "</b> 영역에서 가장 세게 빛납니다. " +
        (band(lm) === "가시광" ? "맨눈이나 보통 사진기로 보이는 층입니다." :
         (band(lm) === "자외선" ? "대기가 막아 버리므로 <b>우주 망원경</b>이라야 볼 수 있습니다." :
          (band(lm) === "X선" ? "매우 뜨거운 기체만 이 영역에서 빛납니다. 역시 우주에서 관측해야 합니다." : "눈에 보이지 않는 긴 파장입니다.")));
    }
    function mission() {
      if (got.a) done("m1-3a"); if (got.b) done("m1-3b"); if (got.c) done("m1-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>광구(5,800 K)는 <b>가시광</b>, 채층(1만 K)은 <b>자외선</b>, 코로나(100만 K)는 <b>X선</b>. 층마다 온도가 다르니 <b>봐야 할 파장도 다릅니다.</b>");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-temp").addEventListener("input", function (e) {
      i0 = +e.target.value; $("a-temp-val").textContent = Math.round(temp(i0)).toLocaleString() + " K"; draw();
    });
    draw(); mission();
  })();

  /* ---- 장면4 층과 필터 ---- */
  (function () {
    var canvas = $("a-c-layer"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var b = 0;
    var BANDS = [
      { n: "가시광 (500 nm)", layer: "광구", c: "--amber", d: "온도 약 5,800 K. 우리가 ‘태양의 표면’이라 부르는 층입니다. <b>쌀알 무늬</b>와 <b>흑점</b>이 보입니다." },
      { n: "Hα (656 nm)", layer: "채층", c: "--rose", d: "수소가 내는 붉은 선 하나만 골라 봅니다. 광구를 가려 그 위의 <b>채층</b>이 드러나고, 가장자리에 <b>홍염</b>이 솟습니다." },
      { n: "자외선 (30 nm)", layer: "채층·전이층", c: "--brand", d: "대기가 막아 우주에서만 볼 수 있습니다. 채층과 코로나 사이 <b>전이층</b>의 활동이 보입니다." },
      { n: "X선 (1 nm)", layer: "코로나", c: "--violet", d: "100만 K가 넘는 <b>코로나</b>만 빛납니다. 어둡게 뚫린 <b>코로나 홀</b>과 고리 모양 구조가 드러납니다." }
    ];
    function draw() {
      paper(ctx, W, H);
      var cx = 210, cy = 165, R = 112, B = BANDS[b];
      /* 코로나 */
      if (b === 3) {
        ctx.fillStyle = v("--violet"); ctx.globalAlpha = .25;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.fillStyle = v(B.c); ctx.globalAlpha = b === 3 ? .55 : .9;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      /* 층별 무늬 */
      if (b === 0) {
        ctx.fillStyle = v("--coral-700");
        [[-40, -20, 13], [25, 30, 10], [50, -45, 8]].forEach(function (s) {
          ctx.beginPath(); ctx.ellipse(cx + s[0], cy + s[1], s[2], s[2] * .8, 0, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = v("--amber-700"); ctx.globalAlpha = .35; ctx.lineWidth = 1;
        for (var g = 0; g < 60; g++) {
          var a = Math.random() * 6.28, r = Math.random() * R * .95;
          ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 6, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      if (b === 1) {
        ctx.strokeStyle = v("--rose-700"); ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(cx + R * .75, cy - R * .6, 34, Math.PI * 1.1, Math.PI * 1.95); ctx.stroke();
        text(ctx, "홍염", cx + R * .75 + 40, cy - R * .78, { s: 11.5, w: "800", c: v("--rose-700") });
      }
      if (b === 3) {
        ctx.fillStyle = v("--abyss"); ctx.globalAlpha = .75;
        ctx.beginPath(); ctx.ellipse(cx - 30, cy - 45, 42, 30, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, "코로나 홀", cx - 30, cy - 45 + 4, { s: 11, w: "800", a: "center", c: v("--on-accent") });
      }
      text(ctx, B.n, cx, 34, { s: 14, w: "900", a: "center", c: v(B.c + "-700") || v("--ink") });
      /* 오른쪽 설명 */
      var x0 = 390;
      text(ctx, "이 필터로 보이는 층", x0, 58, { s: 12, c: v("--mist"), w: "800" });
      text(ctx, B.layer, x0, 92, { s: 26, w: "900" });
      /* 층 단면 */
      var ly = 130, lh = 42;
      [["코로나", "--violet", 3], ["채층", "--rose", 1], ["광구", "--amber", 0]].forEach(function (L, k) {
        var yy = ly + k * (lh + 8), on = (b === 3 && L[2] === 3) || (b === 1 && L[2] === 1) || (b === 2 && L[2] === 1) || (b === 0 && L[2] === 0);
        ctx.fillStyle = v(L[1]); ctx.globalAlpha = on ? .95 : .2;
        ctx.beginPath(); ctx.roundRect(x0, yy, 300, lh, 10); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, L[0], x0 + 14, yy + 27, { s: 14, w: "900", c: on ? v("--on-accent") : v("--mist") });
        text(ctx, L[0] === "코로나" ? "약 100만 K" : (L[0] === "채층" ? "약 1만 K" : "약 5,800 K"), x0 + 290, yy + 27, { s: 12, a: "right", w: "800", c: on ? v("--on-accent") : v("--mist") });
      });
      $("a-band-val").textContent = B.n.split(" ")[0];
      $("a-layer-info").innerHTML = "<b>" + B.n + "</b> — " + B.d;
    }
    canvas._redraw = draw;
    $("a-band").addEventListener("input", function (e) { b = +e.target.value; draw(); });
    draw();

    window.sthSort({
      mount: "a-sort",
      buckets: [{ id: "p", label: "광구", sub: "약 5,800 K · 가시광" }, { id: "c", label: "채층", sub: "약 1만 K · Hα·자외선" }, { id: "k", label: "코로나", sub: "약 100만 K · X선" }],
      items: [
        { t: "쌀알 무늬", a: "p", why: "광구 아래 대류가 만든 무늬입니다." },
        { t: "흑점", a: "p", why: "광구에서 강한 자기장 때문에 주위보다 온도가 낮은 곳입니다." },
        { t: "백반", a: "p", why: "광구에서 주위보다 밝게 보이는 곳입니다.", hint: "흑점 둘레에서 함께 보입니다." },
        { t: "홍염", a: "c", why: "채층의 기체가 자기장을 따라 솟아오른 것입니다." },
        { t: "플레어", a: "c", why: "채층에서 자기장 에너지가 한꺼번에 터져 나오는 현상입니다.", hint: "흑점 부근의 채층에서 일어납니다." },
        { t: "스피큘", a: "c", why: "채층에서 솟았다 사그라지는 작은 불기둥입니다." },
        { t: "코로나 홀", a: "k", why: "코로나에서 X선이 약해 어둡게 보이는 곳입니다." },
        { t: "코로나 질량 방출(CME)", a: "k", why: "코로나의 물질 덩어리가 통째로 우주로 날아가는 현상입니다." }
      ],
      onDone: function () {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>같은 태양이지만 <b>어느 파장으로 보느냐</b>에 따라 다른 층, 다른 현상이 드러납니다.");
        ep.clear(3); ep.clear(4);
      }
    });
    if (ep.cleared(3)) window.sthMission("m1-4", true);
  })();

  function finish() {
    var hi = LOG.filter(function (r) { return r.lat >= 55; })[0];
    window.sthState("r1", "해결 · 적도 25.0일, 고위도 " + (hi ? hi.p.toFixed(1) : "31.0") + "일 — 차등 자전");
  }
  function vsA() {
    var p = window.sthState("a-p") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 맞게 짚었습니다. 이제 근거까지 갖췄습니다." : "샤이너 신부와 같은 생각이었지요? 관측이 생각을 바꿔 놓았습니다.");
  }
  vsA();
  ep.onShow(vsA);
  window.sthWork({
    mount: "wkA", unitLabel: "[행성우주과학 Ⅱ-1] 이야기 ① 망원경에 비친 얼룩",
    items: [
      { id: "a1", label: "샤이너 신부에게 보내는 반박", hint: "흑점이 태양 표면에 있다고 할 수 있는 근거를, 오늘 확인한 관측 사실 두 가지를 들어 쓰세요." },
      { id: "a2", label: "같은 태양, 다른 사진", hint: "가시광 사진과 X선 사진에 각각 무엇이 보이는지, 왜 다른지 ‘온도’와 ‘파장’을 넣어 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 8년 동안 잰 각도
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epB", key: "epB", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "b-gate", key: "b-p", title: "관측 조수의 첫 추리",
    question: "300년 동안 아무도 연주 시차를 잡아내지 못한 까닭은 무엇일까요?",
    options: ["㉠ 지구가 사실은 돌지 않아서", "㉡ 별이 너무 멀어 각도가 너무 작아서", "㉢ 별빛이 흔들려 보여서"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 연주 시차 ---- */
  (function () {
    var canvas = $("b-c-para"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var d = 5, got = window.sthState("bPara") || { a: false, b: false, c: false };

    function draw() {
      paper(ctx, W, H);
      var p = 1 / d;
      /* 왼쪽: 기하 그림 */
      var sx = 60, sy = 200;
      text(ctx, "여섯 달 간격으로 같은 별을 본다", 60, 40, { s: 13, w: "800" });
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(sx + 90, sy, 14, 0, Math.PI * 2); ctx.fill();
      text(ctx, "태양", sx + 90, sy + 32, { s: 11, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(sx + 90, sy, 58, 22, 0, 0, Math.PI * 2); ctx.stroke();
      var e1 = { x: sx + 32, y: sy }, e2 = { x: sx + 148, y: sy };
      ctx.fillStyle = v("--brand"); [e1, e2].forEach(function (e) { ctx.beginPath(); ctx.arc(e.x, e.y, 7, 0, Math.PI * 2); ctx.fill(); });
      text(ctx, "1월", e1.x, sy + 30, { s: 11, a: "center", c: v("--brand-700") });
      text(ctx, "7월", e2.x, sy + 30, { s: 11, a: "center", c: v("--brand-700") });
      var st = { x: 380, y: 120 };
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(st.x, st.y, 9, 0, Math.PI * 2); ctx.fill();
      text(ctx, "별", st.x + 14, st.y + 4, { s: 12, w: "800", c: v("--violet-700") });
      ctx.strokeStyle = v("--violet"); ctx.globalAlpha = .7; ctx.lineWidth = 1.5;
      [e1, e2].forEach(function (e) { ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(st.x, st.y); ctx.stroke(); });
      ctx.globalAlpha = 1;
      text(ctx, "그림은 실제 비율이 아닙니다", 60, H - 14, { s: 10.5, c: v("--mist") });

      /* 오른쪽: 하늘에서 본 흔들림 */
      var bx = 560, by = 70, bw = 300, bh = 190;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.stroke();
      text(ctx, "망원경으로 본 하늘 (배경별 기준)", bx, by - 12, { s: 12, w: "800" });
      ctx.fillStyle = v("--mist"); ctx.globalAlpha = .5;
      [[40, 40], [250, 30], [220, 150], [70, 160], [150, 60]].forEach(function (q) {
        ctx.beginPath(); ctx.arc(bx + q[0], by + q[1], 2.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      var sep = clamp(p * 100, 0.6, 105);                    /* 0.01″ 당 1 px 로 과장 */
      var mx = bx + bw / 2, my = by + bh / 2;
      ctx.fillStyle = v("--violet");
      ctx.beginPath(); ctx.arc(mx - sep / 2, my, 6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .45; ctx.beginPath(); ctx.arc(mx + sep / 2, my, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      /* 오차 막대 */
      var errPx = 0.005 * 100;
      ctx.strokeStyle = v("--rose"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx - sep / 2 - errPx, my + 22); ctx.lineTo(mx - sep / 2 + errPx, my + 22); ctx.stroke();
      text(ctx, "측정 오차 ±0.005″", mx, my + 44, { s: 10.5, a: "center", c: v("--rose-700") });
      ctx.strokeStyle = v("--violet"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mx - sep / 2, my - 16); ctx.lineTo(mx + sep / 2, my - 16); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "흔들린 폭", mx, my - 24, { s: 10.5, a: "center", c: v("--violet-700") });

      text(ctx, "거리 " + d + " pc", 470, 310, { s: 16, w: "900" });
      text(ctx, "연주 시차 " + p.toFixed(3) + "″", 640, 310, { s: 16, w: "900", c: v("--violet-700") });
      text(ctx, "시차(″) = 1 ÷ 거리(pc)", 470, 336, { s: 11.5, c: v("--mist") });
      text(ctx, p >= 0.01 ? "오차의 " + (p / 0.005).toFixed(0) + "배 — 잴 수 있습니다" : "오차에 묻힙니다 — 믿을 수 없습니다",
        640, 336, { s: 11.5, w: "800", c: p >= 0.01 ? v("--teal-700") : v("--rose-700") });

      var ch = false;
      if (d === 1 && !got.a) { got.a = ch = true; }
      if (d === 10 && !got.b) { got.b = ch = true; }
      if (p <= 0.010 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("bPara", got); mission(); }
      $("b-para-info").innerHTML = "거리가 <b>" + d + " pc</b> 이면 연주 시차는 <b>" + p.toFixed(3) + "초각</b>입니다. " +
        (d === 1 ? "시차가 1초각이 되는 거리를 <b>1 파섹(pc)</b>이라 부릅니다. 약 3.26 광년입니다." :
          (p < 0.01 ? "흔들림이 측정 오차와 비슷해져, 이 자로는 더 이상 잴 수 없습니다." : "거리가 멀어질수록 흔들림이 작아집니다."));
    }
    function mission() {
      if (got.a) done("m2-2a"); if (got.b) done("m2-2b"); if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>시차는 거리에 <b>반비례</b>합니다. 그래서 멀수록 재기 어렵고, 어느 거리를 넘으면 <b>장비의 오차에 묻혀</b> 버립니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-d").addEventListener("input", function (e) { d = +e.target.value; $("b-d-val").textContent = d + " pc"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면3 거리 지수 ---- */
  var STARS = [
    { n: "별 A", M: 4.8, m: 8.31, note: "태양과 비슷한 별" },
    { n: "별 B", M: -3.6, m: 6.39, note: "밝은 초거성" },
    { n: "별 C", M: 0.6, m: 13.17, note: "성단 속의 별" }
  ];
  (function () {
    var canvas = $("b-c-mod"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, i0 = 0, got = window.sthState("bMod") || [false, false, false];
    function dist(i) { return Math.pow(10, 3.7 * i / 100); }
    function mCalc(M, d) { return M + 5 * (Math.log(d) / Math.LN10) - 5; }

    function draw() {
      paper(ctx, W, H);
      var S = STARS[s], d = dist(i0), mc = mCalc(S.M, d), diff = mc - S.m;
      text(ctx, S.n + " — " + S.note, 60, 40, { s: 14, w: "900" });
      text(ctx, "절대 등급 M = " + S.M.toFixed(1) + "  (10 pc 에 두었을 때의 밝기)", 60, 66, { s: 12.5, c: v("--mist") });
      text(ctx, "관측한 겉보기 등급 m = " + S.m.toFixed(2), 60, 88, { s: 12.5, c: v("--mist") });

      /* 등급 눈금자 */
      var x0 = 70, x1 = W - 60, y = 190;
      function X(mag) { return x0 + (mag + 6) / 28 * (x1 - x0); }        /* -6 ~ +22 등급 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (var g = -5; g <= 20; g += 5) {
        ctx.beginPath(); ctx.moveTo(X(g), y); ctx.lineTo(X(g), y + 6); ctx.stroke();
        text(ctx, String(g), X(g), y + 22, { s: 10.5, c: v("--mist"), a: "center" });
      }
      text(ctx, "← 밝다        겉보기 등급        어둡다 →", (x0 + x1) / 2, y + 44, { s: 11, c: v("--mist"), a: "center" });
      /* 관측값 */
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(X(S.m), y, 9, 0, Math.PI * 2); ctx.fill();
      text(ctx, "관측값", clamp(X(S.m), x0 + 30, x1 - 30), y - 20, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      /* 계산값 */
      var cxp = clamp(X(mc), x0 - 4, x1 + 4);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(cxp, y, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "내 계산값", clamp(cxp, x0 + 34, x1 - 34), y + 62, { s: 11.5, w: "800", a: "center", c: v("--brand-700") });

      var ok = Math.abs(diff) <= 0.06;
      text(ctx, "내가 놓아 본 거리 " + (d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc", 60, 280, { s: 15, w: "900" });
      text(ctx, "→ 겉보기 등급이 " + mc.toFixed(2) + " 로 보일 것", 60, 306, { s: 13.5, c: v("--mist") });
      text(ctx, ok ? "✅ 관측값과 맞습니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"),
        560, 292, { s: 15, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, "m − M = 5 log(거리/10 pc)", 560, 318, { s: 11.5, c: v("--mist") });

      if (ok && !got[s]) { got[s] = true; window.sthState("bMod", got); mission(); }
      $("b-mod-info").innerHTML = "거리를 두 배로 늘리면 밝기는 4분의 1이 되고 등급은 약 <b>1.5등급</b> 어두워집니다. 계산한 겉보기 등급이 관측값과 같아지는 거리가 <b>그 별까지의 거리</b>입니다." +
        (ok ? " — <b>" + S.n + " 의 거리는 약 " + (d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc</b>" : "");
    }
    function mission() {
      ["m2-3a", "m2-3b", "m2-3c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>별 A 약 50 pc, 별 B 약 990 pc, 별 C 약 3,270 pc. 시차로는 닿을 수 없는 거리까지 <b>밝기가 자가 되어</b> 데려다줍니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    segWire("b-star", function (b) { s = +b.getAttribute("data-s"); $("b-star-val").textContent = STARS[s].n; draw(); });
    $("b-dm").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var d = dist(i0);
      $("b-dm-val").textContent = (d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc";
      draw();
    });
    draw(); mission();
  })();

  /* ---- 장면4 한계 ---- */
  (function () {
    var canvas = $("b-c-lim"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 12, got = window.sthState("bLim") || { a: false, b: false, c: false };
    var FIVE = [
      { n: "별 ㄱ", p: 0.742 }, { n: "별 ㄴ", p: 0.379 }, { n: "별 ㄷ", p: 0.129 }, { n: "별 ㄹ", p: 0.0400 }, { n: "별 ㅁ", p: 0.0125 }
    ];
    function err(i) { return 0.05 * Math.pow(10, -0.04 * i); }

    function draw() {
      paper(ctx, W, H);
      var e = err(i0), th = 3 * e, n = 0;
      text(ctx, "다섯 별의 연주 시차와 측정 한계", 60, 40, { s: 14, w: "900" });
      var x0 = 130, x1 = W - 150, y0 = 88;
      function X(p) { return x0 + (Math.log(p) / Math.LN10 + 3) / 3.2 * (x1 - x0); }   /* 0.001 ~ 1.58″ */
      FIVE.forEach(function (s, k) {
        var y = y0 + k * 44, ok = s.p >= th;
        if (ok) n++;
        text(ctx, s.n, 60, y + 5, { s: 13, w: "800" });
        ctx.fillStyle = v(ok ? "--teal" : "--rose");
        ctx.beginPath(); ctx.arc(X(s.p), y, 7, 0, Math.PI * 2); ctx.fill();
        text(ctx, s.p.toFixed(4) + "″", X(s.p) + 14, y + 5, { s: 11.5, c: v("--mist") });
        text(ctx, ok ? "잴 수 있다" : "오차에 묻힌다", x1 + 12, y + 5, { s: 11.5, w: "800", c: v(ok ? "--teal-700" : "--rose-700") });
      });
      /* 한계선 */
      var lx = clamp(X(th), x0 - 20, x1 + 20);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(lx, y0 - 22); ctx.lineTo(lx, y0 + 4 * 44 + 22); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "믿을 수 있는 한계 (오차의 3배)", clamp(lx, 150, W - 160), y0 - 32, { s: 11.5, w: "800", a: "center", c: v("--amber-700") });

      text(ctx, "측정 오차 ±" + e.toFixed(4) + "″", 60, H - 42, { s: 15, w: "900" });
      text(ctx, "믿을 만하게 잴 수 있는 별 " + n + " / 5 개", 400, H - 42, { s: 15, w: "900", c: v("--brand-700") });
      text(ctx, i0 <= 3 ? "19세기 망원경 수준" : (i0 >= 40 ? "가이아 위성 수준" : "20세기 후반 관측 수준"), 700, H - 42, { s: 12.5, w: "800", c: v("--mist") });
      text(ctx, "가로축은 시차의 로그 눈금입니다", 60, H - 16, { s: 10.5, c: v("--mist") });

      var ch = false;
      if (n === 2 && !got.a) { got.a = ch = true; }
      if (n === 5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("bLim", got); mission(); }
      $("b-lim-info").innerHTML = "오차가 ±" + e.toFixed(4) + "″ 일 때 믿을 만하게 잴 수 있는 별은 <b>" + n + "개</b>입니다. " +
        (n <= 2 ? "베셀 무렵의 장비로는 아주 가까운 별 몇 개가 전부였습니다." :
          (n === 5 ? "장비가 좋아지자 다섯 별을 모두 잴 수 있게 되었습니다. <b>자의 한계는 곧 기술의 한계</b>입니다." : "장비를 더 좋게 하면 더 먼 별까지 닿습니다."));
    }
    function mission() {
      if (got.a) done("m2-4a"); if (got.b) done("m2-4b"); if (got.c) done("m2-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>시차는 가까운 별에만, 밝기는 그 너머에. 두 자는 <b>서로 다른 구간</b>을 맡습니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-err").addEventListener("input", function (ev) {
      i0 = +ev.target.value; $("b-err-val").textContent = "±" + err(i0).toFixed(4) + "초각"; draw();
    });
    $("b-err-val").textContent = "±" + err(i0).toFixed(4) + "초각";
    draw();

    window.sthSort({
      mount: "b-sort",
      buckets: [{ id: "x", label: "연주 시차로", sub: "기하학만으로 — 가까운 별" }, { id: "y", label: "밝기로", sub: "절대 등급을 알아야 — 먼 별" }],
      items: [
        { t: "4 광년 떨어진 이웃 별", a: "x", why: "아주 가까워 시차가 큽니다." },
        { t: "태양에서 2 pc 안쪽의 적색 왜성", a: "x", why: "시차가 0.5초각쯤 되어 쉽게 잽니다." },
        { t: "가이아 위성이 관측한 우리은하 원반의 별", a: "x", why: "장비가 좋아지면 시차로 닿는 거리도 멀어집니다.", hint: "오차를 줄이면 어디까지 잴 수 있었나요?" },
        { t: "10만 광년 떨어진 구상 성단", a: "y", why: "시차가 너무 작아 밝기로 재야 합니다." },
        { t: "안드로메다 은하 속의 세페이드", a: "y", why: "다른 은하까지는 시차가 닿지 않습니다." },
        { t: "우리은하 반대편의 적색 거성", a: "y", why: "거리가 멀어 시차는 오차에 묻힙니다." }
      ],
      onDone: function () { got.c = true; window.sthState("bLim", got); mission(); }
    });
    mission();
  })();

  function finish() { window.sthState("r2", "해결 · 시차의 한계 확인, 밝기로 별 C까지 약 3,270 pc"); }
  function vsB() {
    var p = window.sthState("b-p") || "";
    $("b-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 각도가 작다는 것이 곧 멀다는 뜻이었습니다." : "재어 보니 백조자리 61의 시차도 0.3초각뿐이었습니다. 너무 작아서 못 잡았던 것입니다.");
  }
  vsB();
  ep.onShow(vsB);
  window.sthWork({
    mount: "wkB", unitLabel: "[행성우주과학 Ⅱ-1] 이야기 ② 8년 동안 잰 각도",
    items: [
      { id: "w1", label: "연주 시차로 거리를 재는 한계", hint: "시차가 작아질수록 왜 오차가 커지는지, 어느 거리까지 쓸 수 있는지 쓰세요." },
      { id: "b2", label: "두 자를 이어 붙인다는 말", hint: "밝기로 재는 방법이 결국 연주 시차에 기대고 있다는 말이 무슨 뜻인지 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 흔들리며 가는 별
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epC", key: "epC", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "c-gate", key: "c-p", title: "관측 조수의 첫 추리",
    question: "시리우스가 곧게 가지 않고 50년 주기로 흔들리는 까닭은?",
    options: ["㉠ 지구 대기가 별빛을 흔들어서", "㉡ 보이지 않는 별과 서로 돌고 있어서", "㉢ 관측 오차가 쌓여서"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 공간 운동 ---- */
  var MOVE = [
    { n: "바너드별", mu: 10.36, d: 1.83, vr: -110, note: "하늘에서 가장 빠르게 움직이는 별" },
    { n: "시리우스", mu: 1.34, d: 2.64, vr: -5.5, note: "밤하늘에서 가장 밝은 별" },
    { n: "알데바란", mu: 0.199, d: 20.0, vr: 54, note: "황소자리의 붉은 거성" }
  ];
  (function () {
    var canvas = $("c-c-motion"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, vt = 0, got = window.sthState("cMove") || [false, false, false];
    function target(S) { return 4.74 * S.mu * S.d; }

    function draw() {
      paper(ctx, W, H);
      var S = MOVE[s], tv = target(S), ok = Math.abs(vt - tv) <= 1.2;
      var vr = S.vr, space = Math.sqrt(vr * vr + vt * vt);
      text(ctx, S.n + " — " + S.note, 60, 40, { s: 14, w: "900" });
      text(ctx, "고유 운동 " + S.mu.toFixed(3) + "″/년 · 거리 " + S.d.toFixed(2) + " pc · 시선속도 " + (vr > 0 ? "+" : "") + vr + " km/s",
        60, 64, { s: 12.5, c: v("--mist") });

      /* 왼쪽: 스펙트럼 치우침 */
      text(ctx, "스펙트럼선의 치우침", 60, 104, { s: 12, w: "800" });
      var bx = 60, by = 118, bw = 300, bh = 34;
      var grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      grad.addColorStop(0, v("--violet")); grad.addColorStop(0.5, v("--green")); grad.addColorStop(1, v("--rose"));
      ctx.fillStyle = grad; ctx.fillRect(bx, by, bw, bh);
      var shift = clamp(vr / 120, -1, 1) * (bw * 0.33);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(bx + bw / 2, by); ctx.lineTo(bx + bw / 2, by + bh); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + bw / 2 + shift, by - 6); ctx.lineTo(bx + bw / 2 + shift, by + bh + 6); ctx.stroke();
      text(ctx, vr < 0 ? "파란 쪽으로 치우침 → 다가온다" : "붉은 쪽으로 치우침 → 멀어진다", bx, by + bh + 26, { s: 11.5, w: "800", c: vr < 0 ? v("--violet-700") : v("--rose-700") });

      /* 오른쪽: 속도 벡터 */
      var ox = 610, oy = 190, sc = 1.1;
      ctx.strokeStyle = v("--brand"); ctx.fillStyle = v("--brand"); ctx.lineWidth = 3;
      window.drawArrow(ctx, ox, oy, ox + clamp(vt, 0, 150) * sc * 0.9, oy, 11);
      text(ctx, "접선속도", ox + 10, oy + 22, { s: 11.5, w: "800", c: v("--brand-700") });
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral");
      window.drawArrow(ctx, ox, oy, ox, oy - clamp(Math.abs(vr), 0, 150) * sc * 0.9, 11);
      text(ctx, "시선속도", ox - 66, oy - 40, { s: 11.5, w: "800", c: v("--coral-700") });
      ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 3.5;
      window.drawArrow(ctx, ox, oy, ox + clamp(vt, 0, 150) * sc * 0.9, oy - clamp(Math.abs(vr), 0, 150) * sc * 0.9, 12);
      text(ctx, "공간 운동", ox + 96, oy - 80, { s: 12, w: "900", c: v("--violet-700") });

      text(ctx, "v t = 4.74 × 고유 운동 × 거리", 60, 246, { s: 12.5, c: v("--mist") });
      text(ctx, "내가 넣은 접선속도 " + vt.toFixed(1) + " km/s", 60, 280, { s: 15, w: "900" });
      text(ctx, ok ? "✅ 맞습니다" : (vt > tv ? "너무 큽니다" : "아직 작습니다"), 330, 280, { s: 15, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      if (ok) text(ctx, "공간 운동 속도 = √(시선² + 접선²) = " + space.toFixed(1) + " km/s", 60, 312, { s: 14, w: "900", c: v("--violet-700") });

      if (ok && !got[s]) { got[s] = true; window.sthState("cMove", got); mission(); }
      $("c-motion-info").innerHTML = "고유 운동은 <b>하늘에서 옮겨 간 각도</b>일 뿐이라, 같은 각도라도 멀리 있으면 실제로는 훨씬 빠르게 움직인 것입니다. 그래서 거리를 곱합니다." +
        (ok ? " <b>" + S.n + "</b> 의 공간 운동 속도는 약 <b>" + space.toFixed(0) + " km/s</b> 입니다." : "");
    }
    function mission() {
      ["m3-2a", "m3-2b", "m3-2c"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>별의 진짜 운동은 <b>시선속도와 접선속도를 합친 것</b>입니다. 둘 중 하나만으로는 알 수 없습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    segWire("c-star", function (b) { s = +b.getAttribute("data-s"); $("c-star-val").textContent = MOVE[s].n; draw(); });
    $("c-vt").addEventListener("input", function (e) { vt = +e.target.value; $("c-vt-val").textContent = vt.toFixed(1) + " km/s"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면3 북두칠성 ---- */
  (function () {
    var canvas = $("c-c-dipper"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var t = 0, got = window.sthState("cDip") || { a: false, b: false, c: false };
    /* 위치는 모식도(도 단위), 고유 운동은 mas/년 */
    var D = [
      { n: "두브헤", x: 2, y: 4, ma: -136, md: -35 },
      { n: "메라크", x: 7, y: 3.5, ma: 81, md: 34 },
      { n: "페크다", x: 5, y: -0.5, ma: 107, md: 11 },
      { n: "메그레즈", x: 0, y: 0, ma: 103, md: 8 },
      { n: "알리오트", x: -5, y: 0.2, ma: 112, md: -9 },
      { n: "미자르", x: -10, y: 2, ma: 119, md: -26 },
      { n: "알카이드", x: -15, y: 5, ma: -121, md: -15 }
    ];
    var LINK = [[6, 5], [5, 4], [4, 3], [3, 2], [2, 1], [1, 0], [0, 3]];

    function pos(k) {
      var s = D[k], yr = t * 1000;
      return { x: s.x + s.ma * yr / 3.6e6, y: s.y + s.md * yr / 3.6e6 };
    }
    function draw() {
      paper(ctx, W, H);
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(50, 60, W - 100, 230, 16); ctx.fill();
      var cx = 500, cy = 180, sc = 17;
      function P(q) { return { x: cx + q.x * sc, y: cy - q.y * sc }; }
      /* 현재 모습 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2;
      LINK.forEach(function (l) {
        var p1 = P(pos(l[0])), p2 = P(pos(l[1]));
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      });
      D.forEach(function (s, k) {
        var p = P(pos(k));
        ctx.fillStyle = v(Math.abs(s.ma + 120) < 30 ? "--coral" : "--ink");
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
        text(ctx, s.n, p.x, p.y - 14, { s: 10.5, a: "center", c: v("--mist") });
      });
      text(ctx, t === 0 ? "지금의 북두칠성" : (t < 0 ? Math.abs(t * 1000).toLocaleString() + "년 전" : (t * 1000).toLocaleString() + "년 뒤"),
        W / 2, 44, { s: 15, w: "900", a: "center" });
      text(ctx, "주황색 두 별(두브헤·알카이드)은 나머지 다섯과 다른 방향으로 갑니다", W / 2, H - 22, { s: 11.5, a: "center", c: v("--coral-700") });

      var ch = false;
      if (t <= -80 && !got.a) { got.a = ch = true; }
      if (t >= 80 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cDip", got); mission(); }
      $("c-dipper-info").innerHTML = t === 0 ? "시간을 앞뒤로 움직여 보세요. 별마다 고유 운동이 달라 <b>모양이 바뀝니다</b>." :
        "별자리는 <b>모양을 영원히 지키지 않습니다</b>. 지금의 국자 모양은 우리가 사는 짧은 시대에만 보이는 모습입니다.";
    }
    function mission() {
      if (got.a) done("m3-3a"); if (got.b) done("m3-3b"); if (got.c) done("m3-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>별자리는 <b>겉보기 배치</b>일 뿐입니다. 별들은 저마다 다른 방향과 속도로 가고 있습니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-yr").addEventListener("input", function (e) {
      t = +e.target.value;
      $("c-yr-val").textContent = t === 0 ? "지금" : (t < 0 ? Math.abs(t * 1000).toLocaleString() + "년 전" : (t * 1000).toLocaleString() + "년 뒤");
      draw();
    });
    window.sthPick({
      mount: "c-q1",
      q: "북두칠성 일곱 별 가운데 다섯은 나란히 함께 움직이고, 둘만 반대쪽으로 갑니다. 그 둘은 어느 별일까요?",
      options: ["두브헤와 알카이드", "메라크와 페크다", "미자르와 알리오트", "일곱 별이 모두 같은 방향으로 간다"],
      answer: 0,
      why: [
        "맞습니다. 가운데 다섯 별은 같은 성간 구름에서 함께 태어나 나란히 움직이는 무리(큰곰자리 운동 성단)이고, 두브헤와 알카이드는 그 무리에 속하지 않아 반대 방향으로 갑니다.",
        "이 둘은 가운데 다섯 무리에 속합니다. 화면에서 주황색으로 칠한 별을 보세요.",
        "이 둘도 가운데 다섯 무리에 속합니다.",
        "시간을 크게 움직여 보세요. 양쪽 끝 두 별이 나머지와 다르게 갑니다."
      ],
      onDone: function () { got.c = true; window.sthState("cDip", got); mission(); }
    });
    draw(); mission();
  })();

  /* ---- 장면4 쌍성 질량 ---- */
  (function () {
    var canvas = $("c-c-binary"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var msum = 1, cm = 50, got = window.sthState("cBin") || { a: false, b: false };
    var A_AU = 19.8, P_YR = 50.1;
    var TRUE_SUM = Math.pow(A_AU, 3) / Math.pow(P_YR, 2);          /* 3.09 */
    var TRUE_CM = 33.12;

    function draw() {
      paper(ctx, W, H);
      var f = cm / 100, mA = msum * (1 - f), mB = msum * f;
      var okA = Math.abs(msum - TRUE_SUM) <= 0.12, okB = Math.abs(cm - TRUE_CM) <= 1.5;
      /* 관측 자료 */
      text(ctx, "관측 자료", 60, 40, { s: 13, w: "900" });
      text(ctx, "궤도 장반경 a = 19.8 AU", 60, 66, { s: 12.5, c: v("--mist") });
      text(ctx, "공전 주기 P = 50.1 년", 60, 88, { s: 12.5, c: v("--mist") });
      text(ctx, "M₁ + M₂ = a³ / P²", 60, 118, { s: 13.5, w: "900", c: v("--brand-700") });
      text(ctx, "= 19.8³ / 50.1² = " + TRUE_SUM.toFixed(2), 60, 142, { s: 12.5, c: v("--mist") });

      /* 궤도 그림 */
      var ox = 430, oy = 200, span = 150;
      var xA = ox - span * f, xB = ox + span * (1 - f);
      ctx.strokeStyle = v("--line"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(ox, oy, span * f, span * f * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(ox, oy, span * (1 - f), span * (1 - f) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xA, oy); ctx.lineTo(xB, oy); ctx.stroke();
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
      text(ctx, "질량 중심", ox, oy + 24, { s: 11, a: "center", c: v("--amber-700"), w: "800" });
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(xA, oy, 16, 0, Math.PI * 2); ctx.fill();
      text(ctx, "A", xA, oy + 5, { s: 14, w: "900", a: "center", c: v("--on-accent") });
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(xB, oy, 10, 0, Math.PI * 2); ctx.fill();
      text(ctx, "B", xB, oy + 4, { s: 12, w: "900", a: "center", c: v("--on-accent") });
      text(ctx, "질량 중심에 가까운 쪽이 더 무겁고 덜 흔들립니다", ox, 96, { s: 11.5, a: "center", c: v("--mist") });

      /* 결과 */
      text(ctx, "질량 합 " + msum.toFixed(1) + " M☉", 60, 250, { s: 15, w: "900", c: okA ? v("--teal-700") : v("--ink") });
      text(ctx, okA ? "✅ 관측과 맞습니다" : "아직 맞지 않습니다", 260, 250, { s: 12.5, w: "800", c: okA ? v("--teal-700") : v("--rose-700") });
      text(ctx, "질량 중심 " + cm + "%", 60, 284, { s: 15, w: "900", c: okB ? v("--teal-700") : v("--ink") });
      text(ctx, okB ? "✅ A 가 B 의 약 2배 무겁습니다" : "관측된 흔들림 폭과 맞춰 보세요", 260, 284, { s: 12.5, w: "800", c: okB ? v("--teal-700") : v("--rose-700") });
      if (okA && okB) {
        text(ctx, "시리우스 A = " + mA.toFixed(2) + " M☉     시리우스 B = " + mB.toFixed(2) + " M☉", 60, 330, { s: 17, w: "900", c: v("--violet-700") });
      } else {
        text(ctx, "두 조건을 모두 맞추면 각 별의 질량이 나옵니다", 60, 330, { s: 12.5, c: v("--mist") });
      }
      text(ctx, "질량 × 질량 중심까지의 거리는 양쪽이 같습니다 (지렛대와 같은 원리)", 60, H - 16, { s: 11, c: v("--mist") });

      var ch = false;
      if (okA && !got.a) { got.a = ch = true; }
      if (okB && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cBin", got); mission(); }
      $("c-binary-info").innerHTML = "쌍성은 별의 질량을 <b>직접</b> 알려 주는 거의 유일한 창입니다. 궤도의 크기와 주기가 <b>질량의 합</b>을, 질량 중심의 자리가 <b>질량의 비</b>를 줍니다.";
    }
    function mission() {
      if (got.a) done("m3-4a"); if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>시리우스 A 약 <b>2.1 M☉</b>, 시리우스 B 약 <b>1.0 M☉</b>. 보이지 않던 별의 무게를 운동만으로 달아냈습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("c-msum").addEventListener("input", function (e) { msum = +e.target.value; $("c-msum-val").textContent = msum.toFixed(1) + " M☉"; draw(); });
    $("c-cm").addEventListener("input", function (e) { cm = +e.target.value; $("c-cm-val").textContent = cm + "%"; draw(); });
    draw(); mission();
  })();

  /* ---- 장면5 질량-광도 관계 ---- */
  (function () {
    var canvas = $("c-c-ml"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 1, got = window.sthState("cML") || { a: false, b: false, c: false };
    var SB_M = 1.02, SB_L = 0.056;

    function draw() {
      paper(ctx, W, H);
      var L = Math.pow(m, 3.5);
      var x0 = 90, x1 = W - 60, y0 = 50, y1 = 290;
      function X(mm) { return x0 + (Math.log(mm) / Math.LN10 + 1) / 2.3 * (x1 - x0); }   /* 0.1 ~ 20 */
      function Y(ll) { return y1 - (Math.log(ll) / Math.LN10 + 3) / 8 * (y1 - y0); }     /* 1e-3 ~ 1e5 */
      axes(ctx, x0, y0, x1, y1);
      [0.1, 1, 10].forEach(function (g) { text(ctx, String(g), X(g), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" }); });
      text(ctx, "질량 (태양 = 1) →", x1, y1 + 36, { s: 11, c: v("--mist"), a: "right" });
      [[0.001, "0.001"], [1, "1"], [1000, "1,000"], [100000, "10만"]].forEach(function (g) {
        text(ctx, g[1], x0 - 8, Y(g[0]) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.moveTo(x0, Y(g[0])); ctx.lineTo(x1, Y(g[0])); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "광도 (태양 = 1)", x0 - 74, y0 - 16, { s: 11, c: v("--mist") });
      /* 관계선 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var k = 0; k <= 100; k++) {
        var mm = Math.pow(10, -1 + 2.3 * k / 100), xx = X(mm), yy = Y(Math.pow(mm, 3.5));
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      text(ctx, "L ∝ M³·⁵ (주계열성)", X(6), Y(Math.pow(6, 3.5)) - 14, { s: 12, w: "800", c: v("--brand-700") });
      /* 태양 */
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(X(1), Y(1), 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, "태양", X(1) + 10, Y(1) + 4, { s: 11, c: v("--amber-700"), w: "800" });
      /* 현재 점 */
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(X(m), Y(L), 8, 0, Math.PI * 2); ctx.fill();
      /* 시리우스 B */
      if (got.c) {
        ctx.fillStyle = v("--rose"); ctx.beginPath(); ctx.arc(X(SB_M), Y(SB_L), 8, 0, Math.PI * 2); ctx.fill();
        text(ctx, "시리우스 B (실제 관측)", X(SB_M) + 12, Y(SB_L) + 4, { s: 11.5, w: "800", c: v("--rose-700") });
        ctx.strokeStyle = v("--rose"); ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(X(SB_M), Y(SB_L)); ctx.lineTo(X(SB_M), Y(Math.pow(SB_M, 3.5))); ctx.stroke(); ctx.setLineDash([]);
      }
      text(ctx, "질량 " + m.toFixed(1) + " M☉ → 광도 " + (L >= 100 ? Math.round(L).toLocaleString() : L.toFixed(L < 1 ? 3 : 1)) + " L☉",
        90, H - 40, { s: 16, w: "900" });
      text(ctx, "질량이 2배가 되면 광도는 약 11배가 됩니다", 90, H - 16, { s: 11, c: v("--mist") });

      var ch = false;
      if (Math.abs(L - 100) <= 5 && !got.a) { got.a = ch = true; }
      if (L <= 0.1 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cML", got); mission(); }
      $("c-ml-info").innerHTML = "주계열성은 무거울수록 훨씬 밝습니다. 이 관계가 있으면 <b>광도만 알아도 질량을 어림</b>할 수 있습니다. 쌍성이 아니어도 말이지요." +
        (got.c ? "<br><b>그런데 시리우스 B는 이 선에서 한참 벗어나 있습니다.</b> 질량은 태양만 한데 광도는 태양의 " + Math.round(1 / SB_L) + "분의 1입니다." : "");
    }
    function mission() {
      if (got.a) done("m3-5a"); if (got.b) done("m3-5b"); if (got.c) done("m3-5c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-5", true, "<span class='m-tag'>미션 완료</span>질량-광도 관계는 <b>주계열성에만</b> 통합니다. 시리우스 B처럼 크게 벗어난 별은 주계열을 떠난 별 — <b>백색왜성</b>입니다.");
        ep.clear(4); ep.clear(5);
      }
    }
    canvas._redraw = draw;
    $("c-m").addEventListener("input", function (e) { m = +e.target.value; $("c-m-val").textContent = m.toFixed(1) + " M☉"; draw(); });
    $("c-cmp").addEventListener("click", function () {
      if (m < 0.95 || m > 1.05) {
        $("c-ml-info").innerHTML = "먼저 질량을 <b>1.0 M☉ 근처</b>에 맞춰 주세요. 시리우스 B 의 질량이 그쯤이기 때문입니다.";
        return;
      }
      if (!got.c) { got.c = true; window.sthState("cML", got); }
      draw(); mission();
    });
    draw(); mission();
  })();

  function finish() { window.sthState("r3", "해결 · 시리우스 A 2.1 M☉ · B 1.0 M☉, B는 백색왜성"); }
  function vsC() {
    var p = window.sthState("c-p") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "베셀과 같은 추리였습니다. 그리고 18년 뒤 실제로 발견되었습니다." : "대기나 오차라면 50년이라는 <b>일정한 주기</b>로 흔들릴 까닭이 없었습니다.");
  }
  vsC();
  ep.onShow(vsC);
  window.sthWork({
    mount: "wkC", unitLabel: "[행성우주과학 Ⅱ-1] 이야기 ③ 흔들리며 가는 별",
    items: [
      { id: "c1", label: "베셀의 추리 되짚기", hint: "‘흔들린다’는 관측 하나만으로 보이지 않는 동반성의 존재를 주장할 수 있었던 까닭을 쓰세요." },
      { id: "c2", label: "시리우스 B가 관계에서 벗어난 까닭", hint: "질량-광도 관계에서 크게 벗어난 별은 무엇이 다른지, 시리우스 B를 예로 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ④ 심장이 뛰는 별
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "epD", key: "epD", name: "사건 파일 ④", onDone: finish });

  window.sthGate({
    gate: "d-gate", key: "d-p", title: "동아리장의 물음",
    question: "밝기가 변하는 별들, 그 까닭은 모두 같을까요?",
    options: ["㉠ 모두 같은 까닭이다", "㉡ 별마다 까닭이 다를 수 있다", "㉢ 사실은 지구 대기 때문이다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면2 맥동변광성 ---- */
  (function () {
    var canvas = $("d-c-puls"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var i0 = 25, got = window.sthState("dPuls") || { a: false, b: false, c: false };
    function per(i) { return 0.2 * Math.pow(10, 0.037 * i); }
    function kind(P) { return P < 1.2 ? "거문고자리 RR형" : (P < 80 ? "세페이드" : "미라형"); }
    function amp(P) { return P < 1.2 ? 1.0 : (P < 80 ? 0.8 : 6.0); }

    function draw() {
      paper(ctx, W, H);
      var P = per(i0), K = kind(P), A = amp(P);
      var x0 = 80, x1 = W - 60, y0 = 60, y1 = 250;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "광도곡선 — 세 주기 동안", x0, 40, { s: 13, w: "900" });
      text(ctx, "시간 →", x1, y1 + 32, { s: 11, c: v("--mist"), a: "right" });
      text(ctx, "밝다", x0 - 44, y0 + 8, { s: 11, c: v("--mist") });
      text(ctx, "어둡다", x0 - 50, y1, { s: 11, c: v("--mist") });
      /* 곡선: 맥동은 빠르게 밝아지고 천천히 어두워진다(미라형은 완만) */
      ctx.strokeStyle = v(P < 1.2 ? "--brand" : (P < 80 ? "--teal" : "--coral"));
      ctx.lineWidth = 3; ctx.beginPath();
      for (var k = 0; k <= 300; k++) {
        var ph = (k / 300 * 3) % 1;
        var rel = P < 80 ? (ph < 0.25 ? ph / 0.25 : 1 - (ph - 0.25) / 0.75) : (0.5 + 0.5 * Math.cos(2 * Math.PI * (ph - 0.15)));
        var xx = x0 + k / 300 * (x1 - x0), yy = y1 - (0.15 + 0.7 * rel) * (y1 - y0);
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 별 크기 변화 */
      var bx = x1 - 90, by = y0 + 40;
      ctx.fillStyle = v("--amber"); ctx.globalAlpha = .35;
      ctx.beginPath(); ctx.arc(bx, by, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(bx, by, 19, 0, Math.PI * 2); ctx.fill();
      text(ctx, "부풀었다 줄었다", bx, by + 48, { s: 10.5, a: "center", c: v("--mist") });

      text(ctx, "주기 " + (P < 10 ? P.toFixed(2) : Math.round(P).toLocaleString()) + "일", 80, 300, { s: 16, w: "900" });
      text(ctx, K, 300, 300, { s: 16, w: "900", c: v(P < 1.2 ? "--brand-700" : (P < 80 ? "--teal-700" : "--coral-700")) });
      text(ctx, "변광 폭 약 " + A.toFixed(1) + " 등급", 560, 300, { s: 13.5, w: "800", c: v("--mist") });
      if (P >= 1.2 && P < 80) {
        var Mv = -2.81 * (Math.log(P) / Math.LN10) - 1.43;
        text(ctx, "주기-광도 관계로 구한 절대 등급 M = " + Mv.toFixed(2) + "  (주기가 길수록 더 밝다)", 80, 336, { s: 12.5, w: "800", c: v("--teal-700") });
      } else {
        text(ctx, "주기-광도 관계는 세페이드에서 특히 잘 들어맞습니다", 80, 336, { s: 12, c: v("--mist") });
      }

      var ch = false;
      if (P < 1.0 && !got.a) { got.a = ch = true; }
      if (P >= 3 && P <= 50 && !got.b) { got.b = ch = true; }
      if (P >= 100 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("dPuls", got); mission(); }
      $("d-puls-info").innerHTML = "<b>" + K + "</b> · 주기 " + (P < 10 ? P.toFixed(2) : Math.round(P).toLocaleString()) + "일. " +
        (K === "거문고자리 RR형" ? "하루가 안 되는 짧은 주기로 뛰며, 주로 늙은 별들이 모인 구상 성단에서 발견됩니다." :
          (K === "세페이드" ? "며칠에서 몇십 일 주기로 규칙적으로 뜁니다. <b>주기가 길수록 밝다</b>는 관계가 있어 거리를 재는 자로 쓰입니다." :
            "수백 일에 걸쳐 크게 밝아졌다 어두워집니다. 미라가 사라진 것처럼 보였던 까닭이 이것입니다."));
    }
    function mission() {
      if (got.a) done("m4-2a"); if (got.b) done("m4-2b"); if (got.c) done("m4-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>맥동변광성은 <b>규칙적으로</b> 오르내립니다. 별이 실제로 부풀었다 줄어들기 때문입니다. 주기의 길이가 무리를 갈라 줍니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("d-p").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var P = per(i0);
      $("d-p-val").textContent = (P < 10 ? P.toFixed(2) : Math.round(P).toLocaleString()) + "일";
      draw();
    });
    $("d-p-val").textContent = per(i0).toFixed(2) + "일";
    draw(); mission();
  })();

  /* ---- 장면3 폭발 변광성 ---- */
  (function () {
    var canvas = $("d-c-burst"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var dm = 0, got = window.sthState("dBurst") || { a: false, b: false, c: false };

    function draw() {
      paper(ctx, W, H);
      var ratio = Math.pow(10, 0.4 * dm);
      var x0 = 80, x1 = W - 60, y0 = 60, y1 = 250;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "광도곡선 — 한 번의 사건", x0, 40, { s: 13, w: "900" });
      text(ctx, "시간 →", x1, y1 + 32, { s: 11, c: v("--mist"), a: "right" });
      ctx.strokeStyle = v(dm >= 15 ? "--rose" : "--coral"); ctx.lineWidth = 3; ctx.beginPath();
      for (var k = 0; k <= 300; k++) {
        var u = k / 300, rel;
        if (u < 0.12) rel = 0.02;
        else if (u < 0.18) rel = (u - 0.12) / 0.06;
        else rel = Math.exp(-(u - 0.18) * (dm >= 15 ? 3.0 : 6.0));
        var xx = x0 + u * (x1 - x0), yy = y1 - (0.08 + 0.85 * clamp(rel, 0.02, 1)) * (y1 - y0);
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      text(ctx, "갑자기 치솟고 천천히 사그라진다", x0 + 20, y0 + 20, { s: 11.5, c: v("--mist") });

      text(ctx, "등급 차 " + dm.toFixed(1) + " 등급", 80, 300, { s: 16, w: "900" });
      text(ctx, "→ 밝기는 " + (ratio >= 1e8 ? (ratio / 1e8).toFixed(1) + "억 배" : (ratio >= 1e4 ? Math.round(ratio / 1e4) + "만 배" : Math.round(ratio) + "배")),
        330, 300, { s: 16, w: "900", c: v("--brand-700") });
      text(ctx, dm < 8 ? "" : (dm < 15 ? "신성 수준" : "초신성 수준"), 620, 300, { s: 15, w: "900", c: v(dm < 15 ? "--coral-700" : "--rose-700") });
      text(ctx, "등급이 5 차이 나면 밝기는 100배 차이입니다 (밝기비 = 10^(0.4 × 등급 차))", 80, 336, { s: 11.5, c: v("--mist") });

      var ch = false;
      if (Math.abs(dm - 10) <= 0.5 && !got.a) { got.a = ch = true; }
      if (Math.abs(dm - 20) <= 0.5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("dBurst", got); mission(); }
      $("d-burst-info").innerHTML = "<b>신성</b>은 백색왜성 표면에 쌓인 물질이 폭발하는 것이라 별 자체는 살아남아 <b>다시 일어날 수 있습니다</b>. <b>초신성</b>은 별 자체가 끝나는 사건이라 되풀이하지 않고, 한 은하 전체만큼 밝아지기도 합니다.";
    }
    function mission() {
      if (got.a) done("m4-3a"); if (got.b) done("m4-3b"); if (got.c) done("m4-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>신성은 약 1만 배, 초신성은 약 1억 배. 광도곡선의 <b>높이와 모양</b>이 두 사건을 갈라 줍니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("d-dm").addEventListener("input", function (e) { dm = +e.target.value; $("d-dm-val").textContent = dm.toFixed(1) + "등급"; draw(); });
    draw();

    window.sthSort({
      mount: "d-sort",
      buckets: [{ id: "p", label: "맥동변광성", sub: "스스로 부풀었다 줄어든다" }, { id: "b", label: "폭발 변광성", sub: "한 번 터진다" }],
      items: [
        { t: "몇 달마다 규칙적으로 밝아졌다 어두워진다", a: "p", why: "되풀이되는 규칙성이 맥동의 표시입니다." },
        { t: "주기가 길수록 더 밝다는 관계가 있다", a: "p", why: "세페이드의 주기-광도 관계입니다." },
        { t: "별의 반지름과 표면 온도가 함께 변한다", a: "p", why: "별이 실제로 부풀었다 줄어들기 때문입니다." },
        { t: "한 번 치솟은 뒤 다시는 그만큼 밝아지지 않았다", a: "b", why: "폭발은 되풀이되지 않거나 아주 드물게만 되풀이됩니다." },
        { t: "백색왜성 표면에 쌓인 물질이 핵융합을 일으켰다", a: "b", why: "신성이 일어나는 과정입니다.", hint: "표면에서 일어난 폭발입니다." },
        { t: "폭발한 자리에 성운과 중성자별이 남았다", a: "b", why: "무거운 별이 초신성으로 끝난 흔적입니다." }
      ],
      onDone: function () { got.c = true; window.sthState("dBurst", got); mission(); }
    });
    mission();
  })();

  /* ---- 장면4 표준 촛불 ---- */
  var GAL = [{ n: "은하 가", m: 13.95 }, { n: "은하 나", m: 19.50 }];
  (function () {
    var canvas = $("d-c-candle"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var g = 0, i0 = 0, got = window.sthState("dCand") || [false, false];
    var M0 = -19.3;
    function dist(i) { return Math.pow(10, 0.03 * i); }                 /* Mpc */
    function mCalc(dMpc) { return 5.7 + 5 * (Math.log(dMpc) / Math.LN10); }

    function draw() {
      paper(ctx, W, H);
      var G = GAL[g], d = dist(i0), mc = mCalc(d), diff = mc - G.m, ok = Math.abs(diff) <= 0.06;
      text(ctx, "Ia형 초신성은 최대 절대 등급이 늘 약 −19.3", 60, 40, { s: 13.5, w: "900" });
      text(ctx, G.n + " 에서 터진 초신성의 최대 겉보기 등급 = " + G.m.toFixed(2), 60, 66, { s: 12.5, c: v("--mist") });

      /* 은하 그림 */
      var gx = 180, gy = 175;
      ctx.fillStyle = v("--violet"); ctx.globalAlpha = .28;
      ctx.beginPath(); ctx.ellipse(gx, gy, 95, 42, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--violet"); ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.ellipse(gx, gy, 44, 20, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      var sz = clamp(14 - (G.m - 13) * 1.1, 4, 14);
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(gx + 52, gy - 22, sz, 0, Math.PI * 2); ctx.fill();
      text(ctx, "초신성", gx + 52, gy - 22 - sz - 8, { s: 11, a: "center", w: "800", c: v("--amber-700") });
      text(ctx, G.n, gx, gy + 70, { s: 13, a: "center", w: "800" });

      /* 등급 눈금 */
      var x0 = 380, x1 = W - 60, y = 150;
      function X(mag) { return x0 + (mag - 10) / 14 * (x1 - x0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (var q = 10; q <= 24; q += 2) {
        ctx.beginPath(); ctx.moveTo(X(q), y); ctx.lineTo(X(q), y + 6); ctx.stroke();
        text(ctx, String(q), X(q), y + 22, { s: 10.5, c: v("--mist"), a: "center" });
      }
      text(ctx, "겉보기 등급", (x0 + x1) / 2, y + 44, { s: 11, c: v("--mist"), a: "center" });
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(X(G.m), y, 9, 0, Math.PI * 2); ctx.fill();
      text(ctx, "관측값", clamp(X(G.m), x0 + 30, x1 - 30), y - 20, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(clamp(X(mc), x0 - 4, x1 + 4), y, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "내 계산값", clamp(X(mc), x0 + 34, x1 - 34), y + 62, { s: 11.5, w: "800", a: "center", c: v("--brand-700") });

      text(ctx, "내가 놓아 본 거리 " + (d < 10 ? d.toFixed(2) : Math.round(d).toLocaleString()) + " Mpc", 380, 250, { s: 15, w: "900" });
      text(ctx, "→ 겉보기 등급 " + mc.toFixed(2), 380, 278, { s: 13.5, c: v("--mist") });
      text(ctx, ok ? "✅ 맞습니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"), 660, 262, { s: 15, w: "900", c: ok ? v("--teal-700") : v("--rose-700") });
      text(ctx, "1 Mpc = 100만 pc = 약 326만 광년", 60, H - 16, { s: 11, c: v("--mist") });

      if (ok && !got[g]) { got[g] = true; window.sthState("dCand", got); mission(); }
      $("d-candle-info").innerHTML = "밝기가 정해진 등불이니, <b>어둡게 보이는 만큼 멀다</b>는 뜻입니다. 이런 천체를 <b>표준 촛불</b>이라고 합니다." +
        (ok ? " — <b>" + G.n + " 까지는 약 " + Math.round(d).toLocaleString() + " Mpc</b>." : "");
    }
    function mission() {
      ["m4-4a", "m4-4b"].forEach(function (id, k) { if (got[k]) done(id); });
      if (got[0] && got[1]) {
        window.sthMission("m4-4", true, "<span class='m-tag'>미션 완료</span>은하 가는 약 <b>45 Mpc</b>, 은하 나는 약 <b>575 Mpc</b>. 시차로도 세페이드로도 닿지 않는 거리입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    segWire("d-gal", function (b) { g = +b.getAttribute("data-g"); $("d-gal-val").textContent = GAL[g].n; draw(); });
    $("d-dist").addEventListener("input", function (e) {
      i0 = +e.target.value;
      var d = dist(i0);
      $("d-dist-val").textContent = (d < 10 ? d.toFixed(2) : Math.round(d).toLocaleString()) + " Mpc";
      draw();
    });
    draw(); mission();
  })();

  function finish() { window.sthState("r4", "해결 · Ia형 초신성으로 은하 나까지 약 575 Mpc"); }
  function vsD() {
    var p = window.sthState("d-p") || "";
    $("d-vs").innerHTML = "<b>나의 첫 답</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "맞습니다. 맥동과 폭발은 전혀 다른 사건이었습니다." : "광도곡선을 견주어 보니 까닭이 하나가 아니었습니다.");
  }
  vsD();
  ep.onShow(vsD);
  window.sthWork({
    mount: "wkD", unitLabel: "[행성우주과학 Ⅱ-1] 이야기 ④ 심장이 뛰는 별",
    items: [
      { id: "w2", label: "광도곡선 읽기", hint: "맥동변광성과 폭발 변광성의 광도곡선이 어떻게 다른지, 모양으로 구분하는 법을 쓰세요." },
      { id: "d2", label: "표준 촛불이 특별한 까닭", hint: "Ia형 초신성이 거리를 재는 자로 쓰일 수 있는 까닭과, 그런 자가 왜 필요한지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 05 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[행성우주과학 Ⅱ-1] 태양과 별의 관측 — 정리",
  recap: [
    { key: "r1", label: "① 망원경에 비친 얼룩" },
    { key: "r2", label: "② 8년 동안 잰 각도" },
    { key: "r3", label: "③ 흔들리며 가는 별" },
    { key: "r4", label: "④ 심장이 뛰는 별" }
  ],
  items: [
    { id: "all", label: "네 사건을 꿰는 한 문장", hint: "우리가 별에서 받는 것은 빛뿐입니다. 그 빛에서 온도·거리·운동·질량을 어떻게 끌어냈는지, 네 이야기를 아우르는 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 06 우리 반 */
window.sthShare({
  mount: "share", unit: "psp-2-1", unitLabel: "[행성우주과학 Ⅱ-1] 태양과 별의 관측",
  rows: [
    { key: "r1", label: "① 망원경에 비친 얼룩" },
    { key: "r2", label: "② 8년 동안 잰 각도" },
    { key: "r3", label: "③ 흔들리며 가는 별" },
    { key: "r4", label: "④ 심장이 뛰는 별" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
