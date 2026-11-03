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
        ctx.fillStyle = r.lat <= 15 ? v("--teal") : (r.lat >= 35 ? v("--violet") : v("--brand"));
        ctx.fillRect(x0 + 110, yy - 11, (r.p - 24) * 28, 13);
        text(ctx, r.p.toFixed(1) + "일", x0 + 118 + (r.p - 24) * 28, yy, { s: 12.5, w: "800" });
      });
      text(ctx, "막대는 24일을 기준으로 늘어난 길이입니다", x0 + 4, H - 14, { s: 10.5, c: v("--mist") });
    }
    canvas._redraw = draw;

    function say() {
      $("a-spot-info").innerHTML = "위도 <b>" + lat + "°</b>의 흑점은 태양을 한 바퀴 도는 데 <b>" + period(lat).toFixed(1) + "일</b>이 걸립니다. " +
        (LOG.length >= 2 ? "기록을 견주어 보세요. 위도에 따라 날수가 <b>다릅니다</b>." : "위도를 바꿔 여러 번 기록해 보세요.") +
        (lat > 40 ? "<br>※ 실제 흑점은 대개 위도 40° 안쪽에서만 나타납니다. 이보다 높은 위도의 자전은 코로나 구조나 도플러 관측으로 잽니다." : "");
    }
    function mission() {
      var lo = LOG.some(function (r) { return r.lat <= 15; }), hi = LOG.some(function (r) { return r.lat >= 35; });
      if (lo) done("m1-2a"); if (hi) done("m1-2b");
      if (lo && hi) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>적도는 약 <b>25일</b>, 위도 35~40°는 약 <b>27~28일</b>(흑점이 거의 없는 극 가까이는 30일이 넘습니다). 위도마다 도는 속도가 다릅니다. 단단한 공이라면 있을 수 없는 일이고, 태양이 <b>기체</b>라는 뜻입니다. 이것을 <b>차등 자전</b>이라고 합니다.");
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
      /* 가로축: log λ 0.1~10000 nm */
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
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>광구(5,800 K)는 <b>가시광</b>, 채층(1만 K)은 <b>자외선</b>, 코로나(100만 K)는 <b>X선</b>. 층마다 온도가 다르니 <b>봐야 할 파장도 다릅니다.</b> (채층을 보는 Hα는 이와 달리, 채층의 수소가 내는 특정한 선을 좁은 필터로 골라 보는 것입니다.)");
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
    var hi = LOG.filter(function (r) { return r.lat >= 35; })[0];
    window.sthState("r1", "해결 · 적도 25.0일, 위도 35° 이상 " + (hi ? hi.p.toFixed(1) : "27.2") + "일 — 차등 자전");
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


  var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;

  /* ---- 장면: 첫 번째 자 — 연주 시차 (우주에서 본 모습 + 망원경으로 본 하늘) ---- */
  (function () {
    var canvas = $("b-c-para"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var d = 5, preset = -1, th = Math.PI * 1.25, playing = !REDUCE;
    var got = window.sthState("bPara") || { a: false, b: false, c: false };
    var PRE = [
      { n: "백조자리 61", d: 3.50, em: "1838 베셀이 처음 잰 별" },
      { n: "프록시마 센타우리", d: 1.30 }, { n: "시리우스", d: 2.64 },
      { n: "알타이르(견우성)", d: 5.13 }, { n: "베가(직녀성)", d: 7.68 }
    ];
    var ERR = 0.005;

    function draw() {
      var p = 1 / d;
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽: 우주에서 본 모습 ── */
      var LW = 448;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 11 });
      K.pill(ctx, "우주에서 본 모습", 16, 28, { s: 13, c: KC.blue });
      var sun = { x: LW / 2, y: H - 78 }, rx = 128, ry = 30, skyY = 70;
      var yS = clamp(sun.y - 118 - 150 * Math.log(d) / Math.log(200), skyY + 50, sun.y - 110);
      var star = { x: sun.x, y: yS };
      var e1 = { x: sun.x - rx, y: sun.y }, e2 = { x: sun.x + rx, y: sun.y };
      var ea = { x: sun.x + rx * Math.cos(th), y: sun.y + ry * Math.sin(th) };
      /* 천구(먼 배경별) */
      ctx.strokeStyle = "rgba(160,170,255,.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(LW / 2, skyY + 260, 330, 260, 0, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
      var a1 = K.extend(e1, star, skyY + 4), a2 = K.extend(e2, star, skyY + 4);
      /* 궤도 */
      ctx.strokeStyle = "rgba(200,210,255,.45)"; ctx.lineWidth = 1.4; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.ellipse(sun.x, sun.y, rx, ry, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      for (var m = 0; m < 12; m++) { var ang = Math.PI + m * Math.PI / 6; ctx.fillStyle = "rgba(200,210,255,.5)"; ctx.beginPath(); ctx.arc(sun.x + rx * Math.cos(ang), sun.y + ry * Math.sin(ang), 1.6, 0, 6.2832); ctx.fill(); }
      /* 방향선과 각 */
      K.line(ctx, e1, a1, KC.yellow, 1.3, [4, 4], .75); K.line(ctx, e2, a2, KC.blue, 1.3, [4, 4], .75);
      var A1 = Math.atan2(e1.y - star.y, e1.x - star.x), A2 = Math.atan2(e2.y - star.y, e2.x - star.x), AS = Math.atan2(sun.y - star.y, sun.x - star.x);
      K.wedge(ctx, star.x, star.y, A1, A2, 58, "rgba(255,211,107,.22)", "rgba(255,211,107,.9)");
      K.wedge(ctx, star.x, star.y, AS, A2, 40, "rgba(127,211,255,.35)", "rgba(127,211,255,1)");
      K.pill(ctx, "시차 2p", star.x - 66, star.y + 64, { a: "right", c: KC.yellow });
      K.pill(ctx, "연주 시차 p", star.x + 50, star.y + 50, { c: KC.blue });
      /* 거리 생략 표시 */
      K.line(ctx, star, sun, "rgba(255,255,255,.55)", 1.2, [3, 4]);
      var my = (star.y + sun.y) / 2 + 18;
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
      [-4, 4].forEach(function (o) { ctx.beginPath(); ctx.moveTo(sun.x - 9, my + o + 4); ctx.lineTo(sun.x + 9, my + o - 4); ctx.stroke(); });
      K.pill(ctx, "실제로는 훨씬 더 멀다 · d = " + fmtD(d) + " pc", sun.x + 16, my + 5, { s: 11, c: KC.ink });
      /* 지금 지구에서 본 방향 */
      var aNow = K.extend(ea, star, skyY + 4);
      K.line(ctx, ea, aNow, "#ffffff", 1.6, null, .9);
      K.glow(ctx, aNow.x, aNow.y, 2.2, "rgba(255,255,255,.9)", 4);
      /* 천체 */
      K.sun(ctx, sun.x, sun.y, 12);
      K.earth(ctx, ea.x, ea.y, 7);
      [[e1, KC.yellow], [e2, KC.blue]].forEach(function (q) { ctx.strokeStyle = q[1]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q[0].x, q[0].y, 9, 0, 6.2832); ctx.stroke(); });
      K.glow(ctx, star.x, star.y, 4.5, "rgba(255,236,190,.95)", 5);
      K.pill(ctx, "별", star.x + 14, star.y - 8, { c: "#fff4d6" });
      K.pill(ctx, "A₁ · 1월에 보인 자리", a1.x + 10, a1.y - 8, { s: 11, c: KC.yellow, box: [0, LW] });
      K.pill(ctx, "A₂ · 7월에 보인 자리", a2.x - 10, a2.y - 8, { s: 11, a: "right", c: KC.blue, box: [0, LW] });
      [[a1, KC.yellow], [a2, KC.blue]].forEach(function (q) { ctx.strokeStyle = q[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q[0].x, q[0].y, 5, 0, 6.2832); ctx.stroke(); });
      K.pill(ctx, "태양", sun.x, sun.y + 30, { a: "center", c: KC.yellow });
      K.pill(ctx, "지구 E₁ · 1월", e1.x - 14, e1.y + 4, { a: "right", s: 11, c: KC.yellow });
      K.pill(ctx, "지구 E₂ · 7월", e2.x + 14, e2.y + 4, { s: 11, c: KC.blue });
      K.bracket(ctx, sun.x, e2.x, sun.y + 48, KC.mute, "1 AU", false);
      K.warn(ctx, LW - 14 - 228, 28, "⚠ 각·거리·크기는 실제 비율이 아님");

      /* ── 오른쪽: 망원경으로 본 하늘 ── */
      var RX = LW + 8, RW = W - RX;
      K.stage(ctx, RX, 0, RW, H, "space", { seed: 29 });
      K.pill(ctx, "망원경으로 본 하늘", RX + 16, 28, { s: 13, c: KC.blue });
      var c = { x: RX + RW / 2, y: 190 }, S = 190;                 /* 1″ = 190 px */
      var R = K.rng(5);
      for (var k = 0; k < 7; k++) { var bx = RX + 30 + R() * (RW - 60), by = 60 + R() * 260; if (Math.abs(by - c.y) < 40 && Math.abs(bx - c.x) < 140) continue; K.glow(ctx, bx, by, 1.6 + R() * 1.2, "rgba(220,230,255,.9)", 3.2); }
      var pr = p * S;
      ctx.strokeStyle = "rgba(255,211,107,.6)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(pr, .5), Math.max(pr * .36, .3), 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(c.x - 5, c.y); ctx.lineTo(c.x + 5, c.y); ctx.moveTo(c.x, c.y - 5); ctx.lineTo(c.x, c.y + 5); ctx.stroke();
      [[c.x + pr, KC.yellow, "A₁ · 1월"], [c.x - pr, KC.blue, "A₂ · 7월"]].forEach(function (q, i) {
        ctx.strokeStyle = q[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q[0], c.y, 6, 0, 6.2832); ctx.stroke();
        if (pr > 34) K.pill(ctx, q[2], q[0] + (i ? -4 : 4), c.y + 30, { s: 11, a: i ? "right" : "left", c: q[1], box: [RX, W] });
      });
      var sx = c.x - Math.cos(th) * pr, sy = c.y + Math.sin(th) * pr * .36;
      K.glow(ctx, sx, sy, 4, "rgba(255,236,190,.95)", 5);
      K.spikes(ctx, sx, sy, 14, .45);
      K.pill(ctx, "별", sx + 14, sy - (pr > 34 ? 12 : 30), { s: 11, c: "#fff4d6" });
      if (pr > 8) {
        K.bracket(ctx, c.x, c.x + pr, c.y - 46, KC.blue, "연주 시차 p", true);
        K.bracket(ctx, c.x - pr, c.x + pr, c.y + 62, KC.yellow, "시차 2p", false);
      } else {
        K.pill(ctx, "흔들림이 너무 작아 거의 한 점으로 보입니다", c.x, c.y + 54, { a: "center", s: 11.5, c: KC.yellow });
      }
      /* 오차 견주기 막대 */
      var gx = RX + 30, gy = H - 74, gw = RW - 60;
      K.t(ctx, "흔들림 폭(p)과 측정 오차(±0.005″) 견주기", gx, gy - 12, { s: 11.5, c: KC.mute });
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.roundRect(gx, gy, gw, 12, 6); ctx.fill();
      var scaleMax = 1, fp = clamp(Math.log10(p / 0.001) / Math.log10(scaleMax / 0.001), 0, 1), fe = Math.log10(ERR / 0.001) / Math.log10(scaleMax / 0.001);
      ctx.fillStyle = p >= 2 * ERR ? KC.green : KC.red; ctx.beginPath(); ctx.roundRect(gx, gy, Math.max(6, gw * fp), 12, 6); ctx.fill();
      ctx.strokeStyle = KC.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx + gw * fe, gy - 4); ctx.lineTo(gx + gw * fe, gy + 16); ctx.stroke();
      K.t(ctx, "오차", gx + gw * fe, gy + 30, { s: 10.5, a: "center", c: KC.red });
      K.t(ctx, "0.001″", gx, gy + 30, { s: 10, c: KC.dim }); K.t(ctx, "1″", gx + gw, gy + 30, { s: 10, a: "right", c: KC.dim });
      K.t(ctx, "(눈금은 10배씩)", gx + gw / 2 + 60, gy + 30, { s: 10, c: KC.dim });

      readout(p);
    }
    function fmtD(x) { return x < 10 ? x.toFixed(x % 1 ? 2 : 0).replace(/\.?0+$/, "") : String(Math.round(x)); }
    function readout(p) {
      var ly = 3.26 * d, ok = p >= 2 * ERR;
      $("b-read").innerHTML =
        "<span class='k'>연주 시차</span><span class='v b'>p = " + (p >= 1 ? p.toFixed(2) : p.toFixed(3)) + "″</span>" +
        "<span class='k'>거리</span><span class='v y'>d = 1 / p = " + fmtD(d) + " pc</span>" +
        "<span class='sub'>≈ " + (ly < 100 ? ly.toFixed(1) : Math.round(ly).toLocaleString()) + " 광년</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "오차의 " + Math.round(p / ERR) + "배 · 잴 수 있습니다" : "오차에 묻힙니다 · 이 자로는 못 잽니다") + "</span>";
      $("b-d-val").textContent = fmtD(d) + " pc";
      var ch = false;
      if (d === 1 && !got.a) { got.a = ch = true; }
      if (d === 10 && !got.b) { got.b = ch = true; }
      if (p <= 0.010 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("bPara", got); mission(); }
      $("b-para-info").innerHTML = "거리가 <b>" + fmtD(d) + " pc</b>이면 연주 시차는 <b>" + p.toFixed(3) + "초각</b>입니다. " +
        (preset >= 0 ? "<b>" + PRE[preset].n + "</b>의 실측값입니다. " : "") +
        (d === 1 ? "시차가 1초각이 되는 거리를 <b>1 파섹(pc)</b>이라 부릅니다. 약 3.26 광년입니다." :
          (p < 0.01 ? "흔들림이 측정 오차와 비슷해져, 이 자로는 더 이상 잴 수 없습니다." : "지구가 궤도를 도는 동안 별이 하늘에 그리는 작은 타원을 보세요. 멀수록 타원이 작아집니다."));
    }
    function mission() {
      if (got.a) done("m2-2a"); if (got.b) done("m2-2b"); if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>시차는 거리에 <b>반비례</b>합니다. 그래서 멀수록 재기 어렵고, 어느 거리를 넘으면 <b>장비의 오차에 묻혀</b> 버립니다.");
        ep.clear(2);
      }
    }
    var pre = $("b-pre");
    PRE.forEach(function (s, i) {
      var b = document.createElement("button"); b.type = "button";
      b.innerHTML = "<b>" + s.n + "</b>" + (s.em ? "<em>" + s.em + "</em>" : "") + "<small>" + (1 / s.d).toFixed(3) + "″ · " + s.d.toFixed(2) + " pc</small>";
      b.addEventListener("click", function () {
        preset = i; d = s.d; $("b-d").value = Math.round(s.d);
        Array.prototype.forEach.call(pre.children, function (x, j) { x.classList.toggle("on", j === i); });
        draw();
      });
      pre.appendChild(b);
    });
    $("b-d").addEventListener("input", function (ev) {
      d = +ev.target.value; preset = -1;
      Array.prototype.forEach.call(pre.children, function (x) { x.classList.remove("on"); });
      draw();
    });
    $("b-play").addEventListener("click", function () { playing = !playing; this.textContent = playing ? "⏸ 지구 멈추기" : "▶ 지구 돌리기"; });
    if (REDUCE) $("b-play").textContent = "▶ 지구 돌리기";
    canvas._redraw = draw;
    K.animate(canvas, function (dt) { if (playing) { th += dt * 2 * Math.PI / 9000; draw(); } });
    draw(); mission();
  })();

  /* ---- 장면: 손가락으로 만드는 시차 (비유) ---- */
  (function () {
    var canvas = $("b-c-fin"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var f = 40, eye = "L", shown = "L", acc = 0, EYE = 3.25, WALL = 300, TICK = 15;
    var got = window.sthState("bFin") || { a: false, b: false };
    function hitX(side) { var xe = side === "L" ? -EYE : EYE; return xe * (1 - WALL / f); }
    function skin(ctx, x, top, w, bottom, alpha) {
      ctx.save(); ctx.globalAlpha = alpha;
      var g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      g.addColorStop(0, "#d9976f"); g.addColorStop(.35, "#f6cfae"); g.addColorStop(.6, "#f3c4a0"); g.addColorStop(1, "#cf8a62");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - w / 2, bottom); ctx.lineTo(x - w / 2, top + w / 2);
      ctx.arc(x, top + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, bottom); ctx.closePath(); ctx.fill();
      /* 손톱 */
      var ng = ctx.createLinearGradient(0, top + 6, 0, top + 44);
      ng.addColorStop(0, "#fff3ee"); ng.addColorStop(.25, "#f6d4cb"); ng.addColorStop(1, "#eab5a6");
      ctx.fillStyle = ng; ctx.beginPath(); ctx.roundRect(x - w * .3, top + 7, w * .6, 38, [w * .3, w * .3, 8, 8]); ctx.fill();
      /* 마디 주름 */
      ctx.strokeStyle = "rgba(150,80,50,.35)"; ctx.lineWidth = 1.2;
      [top + 90, top + 96, top + 175, top + 181].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(x - w * .28, yy); ctx.quadraticCurveTo(x, yy + 4, x + w * .28, yy); ctx.stroke(); });
      ctx.restore();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽: 위에서 본 교실 ── */
      var LW = 440;
      var fl = ctx.createLinearGradient(0, 0, 0, H); fl.addColorStop(0, "#efe6d6"); fl.addColorStop(1, "#e2d4bb");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.fill();
      ctx.strokeStyle = "rgba(150,120,80,.12)"; ctx.lineWidth = 1;
      for (var pl = 30; pl < H; pl += 34) { ctx.beginPath(); ctx.moveTo(0, pl); ctx.lineTo(LW, pl); ctx.stroke(); }
      K.pill(ctx, "위에서 본 교실", 16, 28, { s: 13, c: "#5a3d1e", bg: "rgba(255,255,255,.75)" });
      var cx = LW / 2, yE = H - 62, yW = 74, sx = 3, sy = (yE - yW) / WALL;
      function P(xcm, dcm) { return { x: cx + xcm * sx, y: yE - dcm * sy }; }
      /* 칠판 */
      var bg = ctx.createLinearGradient(0, yW - 14, 0, yW); bg.addColorStop(0, "#2a5a45"); bg.addColorStop(1, "#1d4434");
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(cx - 200, yW - 18, 400, 22);
      ctx.fillStyle = bg; ctx.fillRect(cx - 196, yW - 15, 392, 15);
      for (var k = -4; k <= 4; k++) { var tp = P(k * TICK, WALL); K.t(ctx, String(k + 5), tp.x, yW - 3, { s: 11, w: "900", a: "center", c: "#f4f1e6" }); }
      K.t(ctx, "칠판 (3 m 앞)", cx + 196, yW + 18, { s: 11, a: "right", c: "#6b5a44", w: "700" });
      var fp = P(0, f), eL = P(-EYE, 0), eR = P(EYE, 0);
      ["L", "R"].forEach(function (s) {
        var e0 = s === "L" ? eL : eR, hp = P(hitX(s), WALL), act = (eye === "A" ? shown === s : s === eye);
        var col = s === "L" ? "#1f9be0" : "#8b5cf6";
        K.line(ctx, e0, hp, col, act ? 2 : 1.2, act ? null : [4, 4], act ? .9 : .3);
        if (act) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hp.x, yW + 2, 4, 0, 6.2832); ctx.fill(); }
      });
      /* 팔과 손가락 */
      ctx.strokeStyle = "#e8b48f"; ctx.lineCap = "round"; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(cx + 30, yE + 14); ctx.quadraticCurveTo(cx + 26, (yE + fp.y) / 2, cx + 4, fp.y + 12); ctx.stroke(); ctx.lineCap = "butt";
      ctx.fillStyle = "#f3c4a0"; ctx.beginPath(); ctx.roundRect(fp.x - 4, fp.y - 10, 8, 22, 4); ctx.fill();
      K.pill(ctx, "손가락 " + f + " cm", fp.x - 12, fp.y + 4, { a: "right", s: 11.5, c: "#5a3d1e", bg: "rgba(255,255,255,.8)" });
      /* 머리와 두 눈 */
      ctx.fillStyle = "#3b2a20"; ctx.beginPath(); ctx.ellipse(cx, yE + 22, 26, 22, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#f3c4a0"; ctx.beginPath(); ctx.ellipse(cx, yE + 6, 20, 9, 0, Math.PI, 0); ctx.fill();
      [["L", eL, "#1f9be0"], ["R", eR, "#8b5cf6"]].forEach(function (q) {
        var open = eye === "A" ? shown === q[0] : eye === q[0];
        if (open) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(q[1].x, q[1].y, 5, 3.4, 0, 0, 6.2832); ctx.fill(); ctx.fillStyle = q[2]; ctx.beginPath(); ctx.arc(q[1].x, q[1].y - .5, 2, 0, 6.2832); ctx.fill(); }
        else { ctx.strokeStyle = "#5a3d1e"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(q[1].x - 5, q[1].y); ctx.quadraticCurveTo(q[1].x, q[1].y + 3, q[1].x + 5, q[1].y); ctx.stroke(); }
      });
      K.t(ctx, "왼눈", eL.x - 26, yE + 4, { s: 11, a: "right", c: "#1f7fbf" });
      K.t(ctx, "오른눈", eR.x + 26, yE + 4, { s: 11, c: "#7b4fe0" });

      /* ── 오른쪽: 내 눈에 보이는 모습 ── */
      var RX = LW + 10, RW = W - RX;
      var wall = ctx.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, "#f2ede4"); wall.addColorStop(1, "#ddd3c2");
      ctx.fillStyle = wall; ctx.beginPath(); ctx.roundRect(RX, 0, RW, H, 14); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.roundRect(RX, 0, RW, H, 14); ctx.clip();
      var bx = RX + 22, by = 46, bw = RW - 44, bh = 220;
      ctx.fillStyle = "#7a4c2a"; ctx.beginPath(); ctx.roundRect(bx - 8, by - 8, bw + 16, bh + 16, 6); ctx.fill();
      var bd = ctx.createLinearGradient(bx, by, bx + bw, by + bh); bd.addColorStop(0, "#2d6049"); bd.addColorStop(1, "#1a3f30");
      ctx.fillStyle = bd; ctx.fillRect(bx, by, bw, bh);
      var R = K.rng(3);
      for (var sm = 0; sm < 9; sm++) { var gx = bx + R() * bw, gy = by + R() * bh, rr = 30 + R() * 50, rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr); rg.addColorStop(0, "rgba(255,255,255,.06)"); rg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = rg; ctx.fillRect(bx, by, bw, bh); }
      ctx.fillStyle = "#8a5a33"; ctx.fillRect(bx - 8, by + bh + 8, bw + 16, 8);
      ctx.fillStyle = "#f4f1e6"; ctx.fillRect(bx + bw - 60, by + bh + 3, 18, 5);
      var mx = bx + bw / 2, s2 = (bw - 40) / (8 * TICK);
      for (k = -4; k <= 4; k++) {
        var x = mx + k * TICK * s2;
        K.t(ctx, String(k + 5), x, by + 44, { s: 24, w: "900", a: "center", c: "rgba(244,241,230,.92)" });
        ctx.strokeStyle = "rgba(244,241,230,.55)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, by + 56); ctx.lineTo(x, by + 70); ctx.stroke();
      }
      var xL = mx + hitX("L") * s2, xR = mx + hitX("R") * s2, now = eye === "A" ? shown : eye;
      var fw = clamp(1400 / f, 26, 70);
      if (eye === "A") skin(ctx, now === "L" ? xR : xL, by + 82, fw, H + 10, .22);
      ctx.save(); ctx.filter = "blur(0.6px)"; skin(ctx, now === "L" ? xL : xR, by + 82, fw, H + 10, 1); ctx.restore();
      if (eye === "A") {
        var y0 = by + 76;
        ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(Math.min(xL, xR), y0); ctx.lineTo(Math.max(xL, xR), y0); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.restore();
      var jump = Math.abs(hitX("R") - hitX("L")) / TICK, ang = 2 * Math.atan(EYE / f) * 180 / Math.PI;
      K.pill(ctx, "내 눈에 보이는 모습", RX + 14, 28, { s: 13, c: "#5a3d1e", bg: "rgba(255,255,255,.8)" });
      K.pill(ctx, now === "L" ? "👁 왼눈으로 보는 중" : "👁 오른눈으로 보는 중", RX + RW - 14, 28, { s: 12, a: "right", c: now === "L" ? "#1f7fbf" : "#7b4fe0", bg: "rgba(255,255,255,.85)" });
      K.pill(ctx, "튄 폭 " + jump.toFixed(1) + "칸 · 각 " + ang.toFixed(1) + "° → 그 절반 " + (ang / 2).toFixed(1) + "°가 별의 '연주 시차'", RX + RW / 2, H - 16, { s: 12.5, a: "center", c: KC.yellow });

      if (eye === "A") {
        var ch = false;
        if (f <= 25 && !got.a) got.a = ch = true;
        if (f >= 50 && !got.b) got.b = ch = true;
        if (ch) { window.sthState("bFin", got); mission(); }
      }
      $("b-fin-info").innerHTML = eye === "A"
        ? "손가락이 " + f + " cm에 있으면 칠판 위에서 약 <b>" + jump.toFixed(1) + "칸</b> 튑니다. " + (f <= 30 ? "가까울수록 크게 튀지요." : "멀리 뻗을수록 덜 튑니다.")
        : "‘번갈아 보기’를 누르면 두 눈으로 본 모습이 번갈아 나타납니다.";
    }
    function mission() {
      if (got.a) done("m2-fa"); if (got.b) done("m2-fb");
      if (got.a && got.b) {
        window.sthMission("m2-f", true, "<span class='m-tag'>미션 완료</span>가까운 손가락은 크게, 먼 손가락은 작게 튑니다. 별도 똑같습니다. <b>가까운 별일수록 시차가 크다</b>. 별에서는 두 눈 대신 <b>1월과 7월의 지구</b>가 관측 자리입니다.");
        ep.clear(1);
      }
    }
    segWire("b-eye", function (b) { eye = b.getAttribute("data-e"); $("b-eye-val").textContent = b.textContent; shown = "L"; acc = 0; draw(); });
    $("b-f").addEventListener("input", function (ev) { f = +ev.target.value; $("b-f-val").textContent = f + " cm"; draw(); });
    canvas._redraw = draw;
    K.animate(canvas, function (dt) { if (eye === "A") { acc += dt; if (acc > 750) { acc = 0; shown = shown === "L" ? "R" : "L"; draw(); } } });
    draw(); mission();
  })();

  /* ---- 장면: 관측 기록 — 두 장의 사진으로 별 찾기 ---- */
  (function () {
    var canvas = $("b-c-rec"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var STARS_P = [0.50, 0.40, 0.25, 0.20, 0.30];
    var pick = 2, P = STARS_P[pick], step = 0, solved = false, blink = false, blinkT = 0, blinkShow = 0;
    var th = Math.PI * .72, anim = null, flash = [0, 0];
    var got = window.sthState("bRec") || { a: false, b: false };
    var LABEL = ["📷 1월(E₁)에서 사진 찍기", "📷 7월(E₂)에서 사진 찍기", "✏️ 두 방향선 긋기", "⭐ 별 위치 찾기"];
    var MON = ["1월", "2월", "3월", "4월", "5월", "6월", "7월"];

    function geo() {
      var sun = { x: 262, y: H - 86 }, rx = 120, ry = 28;
      var star = { x: sun.x, y: sun.y - 70 - (1 / P) * 22 };
      var e1 = { x: sun.x - rx, y: sun.y }, e2 = { x: sun.x + rx, y: sun.y }, skyY = 70;
      var ea = { x: sun.x + rx * Math.cos(th), y: sun.y + ry * Math.sin(th) };
      return { sun: sun, rx: rx, ry: ry, e1: e1, e2: e2, ea: ea, star: star, skyY: skyY, a1: K.extend(e1, star, skyY), a2: K.extend(e2, star, skyY) };
    }
    function photo(x, y, w, h, title, stamp, dx, showStar, fl) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip();
      var g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * .7);
      g.addColorStop(0, "#151a36"); g.addColorStop(1, "#05060f"); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      var R = K.rng(41);
      for (var i = 0; i < 260; i++) { ctx.globalAlpha = R() * .18; ctx.fillStyle = "#fff"; ctx.fillRect(x + R() * w, y + R() * h, 1, 1); }
      ctx.globalAlpha = 1;
      var cx = x + w / 2, cy = y + h / 2 + 6, sc = 220;
      [[-118, -22, 2.6], [-62, 24, 1.8], [72, -24, 2.2], [120, 18, 3.0], [12, 30, 1.5], [-20, -30, 1.3], [96, 40, 1.4]].forEach(function (q) { K.glow(ctx, cx + q[0], cy + q[1], q[2], "rgba(225,232,255,.9)", 3.4); });
      K.spikes(ctx, cx + 120, cy + 18, 10, .35);
      ctx.strokeStyle = "rgba(140,160,220,.45)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, y + 24); ctx.lineTo(cx, cy - 12); ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, y + h - 22); ctx.stroke();
      for (var t = -5; t <= 5; t++) { var tx = cx + t * .1 * sc; ctx.beginPath(); ctx.moveTo(tx, y + h - 12); ctx.lineTo(tx, y + h - (t % 5 === 0 ? 22 : 17)); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(cx - .5 * sc, y + h - 12); ctx.lineTo(cx + .5 * sc, y + h - 12); ctx.stroke();
      if (showStar) {
        var px = cx + dx * sc;
        K.glow(ctx, px, cy, 3.4, "rgba(255,226,150,.98)", 4.5);
        ctx.strokeStyle = KC.yellow; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px - 14, cy); ctx.lineTo(px - 8, cy); ctx.moveTo(px, cy - 14); ctx.lineTo(px, cy - 8); ctx.stroke();
        K.t(ctx, "S", px + 7, cy - 8, { s: 11, w: "900", c: KC.yellow });
      }
      K.t(ctx, title, x + 10, y + 18, { s: 11.5, w: "800", c: "#cfd8ff" });
      K.t(ctx, "1칸 = 0.1″", x + w - 10, y + 18, { s: 10.5, a: "right", c: KC.mute });
      if (stamp) K.t(ctx, stamp, x + w - 10, y + h - 26, { s: 10, a: "right", c: "#ffb35c", w: "700" });
      if (fl > 0) { ctx.fillStyle = "rgba(255,255,255," + fl + ")"; ctx.fillRect(x, y, w, h); }
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var g = geo(), LW = 526;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 17 });
      K.pill(ctx, "위에서 본 지구 궤도", 16, 28, { s: 13, c: KC.blue });
      ctx.strokeStyle = "rgba(160,170,255,.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(LW / 2, g.skyY + 300, 380, 300, 0, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
      K.pill(ctx, "아주 먼 배경별", LW - 16, g.skyY - 22, { s: 11, a: "right", c: KC.mute });
      ctx.strokeStyle = "rgba(200,210,255,.45)"; ctx.lineWidth = 1.4; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.ellipse(g.sun.x, g.sun.y, g.rx, g.ry, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      if (step >= 3) {
        K.line(ctx, g.e1, g.a1, KC.yellow, 1.8, step >= 4 ? null : [6, 5]);
        K.line(ctx, g.e2, g.a2, KC.blue, 1.8, step >= 4 ? null : [6, 5]);
      }
      if (step >= 4) {
        var A2 = Math.atan2(g.e2.y - g.star.y, g.e2.x - g.star.x), AS = Math.atan2(g.sun.y - g.star.y, g.sun.x - g.star.x), A1 = Math.atan2(g.e1.y - g.star.y, g.e1.x - g.star.x);
        K.wedge(ctx, g.star.x, g.star.y, A1, A2, 52, "rgba(255,211,107,.18)", "rgba(255,211,107,.8)");
        K.wedge(ctx, g.star.x, g.star.y, AS, A2, 36, "rgba(127,211,255,.35)", KC.blue);
        K.line(ctx, g.star, g.sun, "rgba(255,255,255,.5)", 1.2, [3, 4]);
        K.pill(ctx, "p", g.star.x + 24, g.star.y + 52, { c: KC.blue, s: 13 });
        K.glow(ctx, g.star.x, g.star.y, 5, "rgba(255,230,170,.98)", 5);
        K.pill(ctx, "별 S", g.star.x + 14, g.star.y - 10, { c: "#fff4d6" });
        K.bracket(ctx, g.sun.x, g.e2.x, g.sun.y + 46, KC.mute, "1 AU", false);
      }
      if (step >= 1) { ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.a1.x, g.a1.y, 6, 0, 6.2832); ctx.stroke(); K.pill(ctx, "A₁", g.a1.x + 10, g.a1.y + 4, { s: 11, c: KC.yellow }); }
      if (step >= 2) { ctx.strokeStyle = KC.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.a2.x, g.a2.y, 6, 0, 6.2832); ctx.stroke(); K.pill(ctx, "A₂", g.a2.x - 10, g.a2.y + 4, { s: 11, a: "right", c: KC.blue }); }
      K.sun(ctx, g.sun.x, g.sun.y, 12);
      [[g.e1, "E₁ · 1월", KC.yellow, "right", -14], [g.e2, "E₂ · 7월", KC.blue, "left", 14]].forEach(function (q) {
        ctx.strokeStyle = q[2]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q[0].x, q[0].y, 9, 0, 6.2832); ctx.stroke();
        K.pill(ctx, q[1], q[0].x + q[4], q[0].y + 4, { s: 11, a: q[3], c: q[2] });
      });
      K.earth(ctx, g.ea.x, g.ea.y, 7);
      var mi = clamp(Math.round((th - Math.PI) / Math.PI * 6), -2, 6), mon = mi < 0 ? (mi === -1 ? "12월" : "11월") : MON[mi];
      K.pill(ctx, "지구 · " + mon, g.ea.x, g.ea.y + 34, { s: 11.5, a: "center", c: "#bfe6ff" });
      K.warn(ctx, 14, H - 12, "⚠ 각은 실제보다 수십만 배 과장");

      var px = LW + 12, pw = W - px, ph = 132;
      photo(px, 0, pw, ph, "1월(E₁)에 찍은 사진", step >= 1 ? "1838. 1. 15  21:40" : "", +P, step >= 1, flash[0]);
      photo(px, ph + 8, pw, ph, "7월(E₂)에 찍은 사진", step >= 2 ? "1838. 7. 16  02:10" : "", -P, step >= 2, flash[1]);
      var y3 = ph * 2 + 16, h3 = H - y3;
      if (step >= 2) {
        if (blink) photo(px, y3, pw, h3, "깜빡이 비교 · " + (blinkShow ? "7월" : "1월") + " 사진", "", blinkShow ? -P : P, true, 0);
        else {
          photo(px, y3, pw, h3, "두 사진 겹치기", "", 0, false, 0);
          var cx = px + pw / 2, cy = y3 + h3 / 2 + 6, sc = 220;
          K.glow(ctx, cx + P * sc, cy, 3.4, "rgba(255,226,150,.98)", 4.5);
          ctx.globalAlpha = .6; K.glow(ctx, cx - P * sc, cy, 3.4, "rgba(127,211,255,.95)", 4.5); ctx.globalAlpha = 1;
          K.bracket(ctx, cx - P * sc, cx + P * sc, cy - 18, KC.yellow, "반년 동안 옮겨 간 폭 = 눈금 몇 칸?", true);
        }
      } else {
        ctx.fillStyle = "rgba(127,140,200,.12)"; ctx.beginPath(); ctx.roundRect(px, y3, pw, h3, 10); ctx.fill();
        K.t(ctx, "두 장을 모두 찍으면 여기서 겹쳐 봅니다", px + pw / 2, y3 + h3 / 2 + 4, { s: 11.5, a: "center", c: "#8a94b8" });
      }
      paintSteps();
    }
    function paintSteps() {
      var sp = $("b-rec-steps").children;
      for (var i = 0; i < sp.length; i++) sp[i].className = i < step || (i === 4 && solved) ? "ok" : (i === step ? "now" : "");
      var go = $("b-rec-go");
      go.hidden = step >= 4; go.textContent = LABEL[Math.min(step, 3)]; go.disabled = !!anim;
      $("b-rec-blink").disabled = step < 2;
      $("b-rec-blink").textContent = blink ? "⏹ 깜빡이 멈추기" : "👁 깜빡이 비교";
      $("b-rec-ans").hidden = step < 4;
      var msg = ["지구가 아직 12월 자리에 있습니다. 1월 자리(E₁)에 오면 사진을 찍어 별 S의 방향을 기록하세요.",
        "1월 사진에서 별 S는 배경별 띠의 A₁ 방향에 보입니다. 이제 반년을 기다려 7월 자리(E₂)에서 찍으세요.",
        "두 사진을 겹치면 별 S만 옮겨 갔습니다. <b>깜빡이 비교</b>로 두 사진을 번갈아 보면 더 잘 보입니다. E₁→A₁, E₂→A₂로 방향선을 그어 보세요.",
        "두 방향선이 한 점에서 만납니다. 그곳이 별의 자리입니다.",
        "겹친 사진에서 옮겨 간 폭(눈금 수 × 0.1″)을 읽고, 그 <b>절반</b>이 연주 시차입니다. 거리 = 1 ÷ 연주 시차."];
      if (!solved) $("b-rec-info").innerHTML = msg[Math.min(step, 4)];
    }
    function mission() {
      if (got.a) done("m2-ra"); if (got.b) done("m2-rb");
      if (got.a && got.b) {
        window.sthMission("m2-r", true, "<span class='m-tag'>미션 완료</span>두 자리에서 본 방향이 만나는 곳에 별이 있고, 그 각의 절반이 연주 시차입니다. 베셀은 이 기록을 몇 년 동안 되풀이해 0.3″를 잡아냈습니다.");
        ep.clear(3);
      }
    }
    function moveTo(target, then) {
      if (REDUCE) { th = target; then(); draw(); return; }
      anim = { from: th, to: target, t: 0, dur: 300 + Math.abs(target - th) / Math.PI * 1500, then: then }; paintSteps();
    }
    $("b-rec-go").addEventListener("click", function () {
      if (anim) return;
      if (step === 0) moveTo(Math.PI, function () { step = 1; flash[0] = .9; });
      else if (step === 1) moveTo(Math.PI * 2, function () { step = 2; flash[1] = .9; });
      else { step = Math.min(step + 1, 4); if (step === 4 && !got.a) { got.a = true; window.sthState("bRec", got); mission(); } draw(); }
    });
    $("b-rec-blink").addEventListener("click", function () { blink = !blink; blinkT = 0; draw(); });
    $("b-rec-new").addEventListener("click", function () {
      var n; do { n = Math.floor(Math.random() * STARS_P.length); } while (n === pick);
      pick = n; P = STARS_P[pick]; step = 0; solved = false; blink = false; th = Math.PI * .72;
      got.p = false; window.sthState("bRec", got); draw();
    });
    function pv() { $("b-rec-pv").textContent = (+$("b-rec-p").value).toFixed(2) + "″"; $("b-rec-dv").textContent = (+$("b-rec-d").value).toFixed(1) + " pc"; }
    $("b-rec-p").addEventListener("input", pv); $("b-rec-d").addEventListener("input", pv); pv();
    $("b-rec-chk").addEventListener("click", function () {
      var p = +$("b-rec-p").value, d = +$("b-rec-d").value, info = $("b-rec-info");
      if (!got.p || got.pv !== P) {
        if (Math.abs(p - 2 * P) <= 0.011) { info.innerHTML = "❌ 겹친 사진의 폭 " + (2 * P).toFixed(2) + "″ 를 그대로 골랐네요. 연주 시차는 그 <b>절반</b>입니다."; return; }
        if (Math.abs(p - P) > 0.011) { info.innerHTML = "❌ 연주 시차를 다시 읽어 보세요. 옮겨 간 폭은 눈금 몇 칸인가요? 그 절반입니다."; return; }
        got.p = true; got.pv = P; window.sthState("bRec", got);
        info.innerHTML = "✅ 연주 시차 <b>" + P.toFixed(2) + "″</b> 맞았습니다. 이제 ② 거리 = 1 ÷ 연주 시차 를 맞춰 다시 판정받으세요.";
        if (Math.abs(d - 1 / P) > 0.1) return;
      }
      if (Math.abs(d - 1 / P) > 0.1) { info.innerHTML = "연주 시차는 맞았습니다(" + P.toFixed(2) + "″). ❌ 거리 = 1 ÷ 연주 시차(pc)로 다시 셈해 보세요."; return; }
      solved = true; paintSteps();
      info.innerHTML = "✅ 연주 시차 <b>" + P.toFixed(2) + "″</b>, 거리 <b>" + (1 / P).toFixed(1) + " pc</b>(약 " + (3.26 / P).toFixed(1) + " 광년). " +
        "‘다른 별로 다시’를 눌러 더 가깝거나 먼 별도 재 보세요. 📎 두 사진을 번갈아 보는 <b>깜빡이 비교기</b>는 실제 천문학자들이 쓴 방법입니다. 1930년 톰보는 이 방법으로 명왕성을 찾았습니다.";
      if (!got.b) { got.b = true; window.sthState("bRec", got); mission(); }
    });
    canvas._redraw = draw;
    K.animate(canvas, function (dt) {
      var dirty = false;
      if (anim) {
        anim.t += dt; var u = Math.min(1, anim.t / anim.dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        th = anim.from + (anim.to - anim.from) * e; dirty = true;
        if (u >= 1) { var fn = anim.then; anim = null; fn(); }
      }
      if (flash[0] > 0 || flash[1] > 0) { flash[0] = Math.max(0, flash[0] - dt / 350); flash[1] = Math.max(0, flash[1] - dt / 350); dirty = true; }
      if (blink) { blinkT += dt; if (blinkT > 500) { blinkT = 0; blinkShow = 1 - blinkShow; dirty = true; } }
      if (dirty) draw();
    });
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
      text(ctx, "절대 등급 M = " + S.M.toFixed(1) + "  (10 pc에 두었을 때의 밝기)", 60, 66, { s: 12.5, c: v("--mist") });
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
        ep.clear(4);
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
      function X(p) { return x0 + (Math.log(p) / Math.LN10 + 3) / 3.2 * (x1 - x0); }   /* 0.001~1.58″ */
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
        ep.clear(5); ep.clear(6);
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
        (ok ? " <b>" + S.n + "</b>의 공간 운동 속도는 약 <b>" + space.toFixed(0) + " km/s</b>입니다." : "");
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
      return { x: s.x - s.ma * yr / 3.6e6, y: s.y + s.md * yr / 3.6e6 };
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
      text(ctx, okB ? "✅ A가 B의 약 2배 무겁습니다" : "관측된 흔들림 폭과 맞춰 보세요", 260, 284, { s: 12.5, w: "800", c: okB ? v("--teal-700") : v("--rose-700") });
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
      function X(mm) { return x0 + (Math.log(mm) / Math.LN10 + 1) / 2.3 * (x1 - x0); }   /* 0.1~20 */
      function Y(ll) { return y1 - (Math.log(ll) / Math.LN10 + 3) / 8 * (y1 - y0); }     /* 1e-3~1e5 */
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
      $("c-ml-info").innerHTML = "주계열성은 무거울수록 훨씬 밝습니다. 이 관계가 있으면 <b>광도만 알아도 질량을 어림</b>할 수 있습니다. 쌍성이 아니어도 말입니다." +
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
        $("c-ml-info").innerHTML = "먼저 질량을 <b>1.0 M☉ 근처</b>에 맞춰 주세요. 시리우스 B의 질량이 그쯤이기 때문입니다.";
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
    { key: "r4", label: "④ 심장이 뛰는 별" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r4", label: "④ 심장이 뛰는 별" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
