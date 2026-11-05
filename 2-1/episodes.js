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
/* 온도 색으로 빛나는 별 */
function starC(ctx, x, y, r, c, halo) {
  var hr = r * (halo || 4), g = ctx.createRadialGradient(x, y, 0, x, y, hr);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(r / hr, rgba(c, .95)); g.addColorStop(Math.min(.99, r / hr * 2.2), rgba(c, .25)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, hr, 0, 6.2832); ctx.fill();
}
function starT(ctx, x, y, r, T, halo) { starC(ctx, x, y, r, tRGB(T), halo || 4.2); }
/* 무대 위 한 줄 값 상자: 이름(흐림) + 값(굵게) */
function kv(ctx, k, val, x, y, col, size) {
  SK.t(ctx, k, x, y, { s: 11.5, c: SC.mute, w: "700" });
  SK.t(ctx, val, x, y + (size || 18) + 6, { s: size || 18, c: col || SC.ink, w: "900" });
}
/* 계속 도는 움직임의 멈추기 단추 */
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

    var GRAN = (function () { var R0 = SK.rng(77), o = []; for (var i = 0; i < 320; i++) { var a = R0() * 6.2832, r = Math.sqrt(R0()) * .97; o.push([r * Math.cos(a), r * Math.sin(a), 1.6 + R0() * 2.6, R0()]); } return o; })();
    var aplay = playWire("a-play", false, ["날짜 멈추기", "날짜 흘려보내기"]);
    function spot(x, y, cl, ring) {
      var r = 12;
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(cl, .08), 1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, "rgba(35,10,4,.97)"); g.addColorStop(.42, "rgba(60,20,6,.94)"); g.addColorStop(.55, "rgba(130,55,18,.82)"); g.addColorStop(1, "rgba(190,100,35,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill(); ctx.restore();
      ctx.strokeStyle = ring; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y, Math.max(r * cl, 2) + 5, r + 5, 0, 0, 6.2832); ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 520, cx = 262, cy = 238, R = 116;
      var P0 = period(lat), lon0 = 360 * day / P0, visible = Math.cos(lon0 * Math.PI / 180) > 0.02;
      var deg = Math.round(lon0 % 360 > 180 ? lon0 % 360 - 360 : lon0 % 360);
      studio(ctx, 0, 0, LW, H, { x: cx, y: H - 20, rx: 190, ry: 24 });
      /* 태양 공 — 가장자리로 갈수록 어두워진다(주연 감광) */
      var halo = ctx.createRadialGradient(cx, cy, R * .92, cx, cy, R * 1.3);
      halo.addColorStop(0, "rgba(255,160,50,.45)"); halo.addColorStop(1, "rgba(255,150,40,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, 6.2832); ctx.fill();
      var disc = ctx.createRadialGradient(cx - R * .15, cy - R * .15, R * .05, cx, cy, R);
      disc.addColorStop(0, "#fff4cc"); disc.addColorStop(.55, "#ffcf5e"); disc.addColorStop(.88, "#f39a2f"); disc.addColorStop(1, "#c4621c");
      ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.clip();
      GRAN.forEach(function (q) { ctx.fillStyle = q[3] > .5 ? "rgba(150,70,10,.08)" : "rgba(255,250,220,.09)"; ctx.beginPath(); ctx.arc(cx + q[0] * R, cy + q[1] * R, q[2], 0, 6.2832); ctx.fill(); });
      ctx.strokeStyle = "rgba(120,50,0,.30)"; ctx.lineWidth = 1;
      [-60, -30, 0, 30, 60].forEach(function (L) {
        var yy = cy - R * Math.sin(L * Math.PI / 180), rx = R * Math.cos(L * Math.PI / 180);
        ctx.beginPath(); ctx.ellipse(cx, yy, rx, 5, 0, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.restore();
      /* 자전축과 자전 방향 */
      SK.line(ctx, { x: cx, y: cy - R - 12 }, { x: cx, y: cy + R + 12 }, "rgba(20,40,90,.45)", 1.4, [4, 4]);
      ctx.strokeStyle = LT.blue; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(cx, cy - R - 2, 70, 12, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      var ae = { x: cx + 70 * Math.cos(Math.PI * 1.85), y: cy - R - 2 + 12 * Math.sin(Math.PI * 1.85) };
      SK.arrow(ctx, { x: ae.x - 6, y: ae.y - 2 }, { x: ae.x + 4, y: ae.y + 3 }, LT.blue, 2.4, 9);
      SK.pill(ctx, "자전 방향", ae.x + 12, ae.y + 2, { s: 11, c: SC.blue, box: [0, LW] });
      /* 흑점 두 개: 고른 위도 + 적도 대조군 */
      [{ L: lat, c: LT.blue }, { L: 0, c: LT.violet }].forEach(function (s, k) {
        if (k === 1 && lat === 0) return;
        var P = period(s.L), lon = 360 * day / P;
        var cl = Math.cos(lon * Math.PI / 180);
        if (cl <= 0.02) return;
        var x = cx + R * Math.cos(s.L * Math.PI / 180) * Math.sin(lon * Math.PI / 180);
        var y = cy - R * Math.sin(s.L * Math.PI / 180);
        spot(x, y, cl, s.c);
      });
      var lg1 = SK.pill(ctx, "◯ 내가 고른 흑점 · 위도 " + lat + "°", 16, H - 44, { s: 11, c: SC.blue });
      if (lat !== 0) SK.pill(ctx, "◯ 적도 대조군", 16, H - 16, { s: 11, c: SC.violet, box: [0, LW] });
      big2(ctx, "위도 " + lat + "° · " + P0.toFixed(1) + "일에 한 바퀴",
        Math.round(day) + "일째 · " + (visible ? "흑점이 앞면 (중심에서 " + deg + "°)" : "흑점이 뒷면으로 넘어갔습니다"), 18, 44);

      /* 오른쪽 흰 기록 카드 */
      var X0 = LW + 10, CW = W - X0, x0 = X0 + 20, bx = x0 + 56, sc = 30;
      SK.card(ctx, X0, 0, CW, H, "자전 주기 기록");
      cnote(ctx, "위도", x0, 62); cnote(ctx, "한 바퀴 도는 데 걸린 날수", bx, 62);
      [25, 27, 29, 31].forEach(function (dd) {
        var gx = bx + (dd - 24) * sc;
        SK.line(ctx, { x: gx, y: 74 }, { x: gx, y: 298 }, "rgba(20,40,90,.13)", 1, [3, 4]);
        SK.t(ctx, dd + "일", gx, 314, { s: 10.5, a: "center", c: LT.dim, w: "700" });
      });
      if (!LOG.length) { cnote(ctx, "아직 기록이 없습니다.", x0, 106); cnote(ctx, "위도를 정하고 기록 단추를 누르세요.", x0, 124); }
      LOG.slice(-7).forEach(function (r, i) {
        var yy = 102 + i * 30, col = r.lat <= 15 ? LT.green : (r.lat >= 35 ? LT.violet : LT.blue);
        SK.t(ctx, r.lat + "°", x0, yy, { s: 13, w: "900", c: LT.ink });
        var bw = Math.max(4, (r.p - 24) * sc), g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        g.addColorStop(0, "rgba(20,40,90,.10)"); g.addColorStop(1, col);
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx, yy - 12, bw, 14, 7); ctx.fill();
        SK.t(ctx, r.p.toFixed(1) + "일", bx + bw + 8, yy, { s: 12.5, w: "900", c: col });
      });
      var lo = LOG.some(function (r) { return r.lat <= 15; }), hi = LOG.some(function (r) { return r.lat >= 35; });
      SK.tip(ctx, lo && hi ? "위도마다 다르다 → 차등 자전 (기체)" : (lo ? "이번에는 위도 35° 이상을 기록" : (hi ? "적도 가까이(15° 이하)도 기록" : "적도와 고위도를 모두 기록해 보세요")), x0 - 6, 328, CW - 28, lo && hi ? true : null);
      cnote(ctx, "막대 = 24일보다 늘어난 날수", x0, H - 16);
    }
    canvas._redraw = draw;
    SK.animate(canvas, function (dt) {
      if (!aplay.on) return;
      day += dt / 1000 * 5; if (day > 40) day -= 40;
      $("a-day").value = Math.round(day); $("a-day-val").textContent = Math.round(day) + "일";
      draw();
    });

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
      ctx.clearRect(0, 0, W, H);
      var T = temp(i0), lm = lamMax(T), LW = 640, bd = band(lm);
      var lmTxt = (lm >= 100 ? Math.round(lm).toLocaleString() : lm.toFixed(lm < 10 ? 2 : 1)) + " nm";
      var bcol = bd === "가시광" ? LT.green : (bd === "자외선" ? LT.blue : (bd === "X선" ? LT.violet : LT.red));
      studio(ctx, 0, 0, LW, H);
      big2(ctx, Math.round(T).toLocaleString() + " K → " + lmTxt, bd + "에서 가장 세게 빛납니다", 18, 44);
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 122, x0: -1, x1: 5, y0: 0, y1: 1.08, xt: 6, yt: 4, light: true,
        xf: function (q) { return ["0.1", "1", "10", "100", "1,000", "10,000", ""][Math.round(q) + 1] || ""; }, yf: function () { return ""; },
        xl: "파장 (nm) →", yl: "세기 ↑" });
      function X(lam) { return g.X(Math.log(lam) / Math.LN10); }
      /* 파장대 띠 */
      [[0.1, 10, "rgba(112,72,232,.10)", "X선", SC.violet], [10, 380, "rgba(28,126,214,.09)", "자외선", SC.blue], [750, 10000, "rgba(224,49,49,.08)", "적외선", SC.red]].forEach(function (b) {
        ctx.fillStyle = b[2]; ctx.fillRect(X(b[0]), g.T, X(b[1]) - X(b[0]), g.B - g.T);
        SK.pill(ctx, b[3], (X(b[0]) + X(b[1])) / 2, g.T + 20, { s: 11.5, a: "center", c: b[4] });
      });
      var vis = ctx.createLinearGradient(X(380), 0, X(750), 0);
      ["#7a3cff", "#3c6bff", "#28c8ff", "#3fe07a", "#f5ee3b", "#ff9b2f", "#ff3b3b"].forEach(function (c, k) { vis.addColorStop(k / 6, c); });
      ctx.globalAlpha = .38; ctx.fillStyle = vis; ctx.fillRect(X(380), g.T, X(750) - X(380), g.B - g.T); ctx.globalAlpha = 1;
      SK.pill(ctx, "가시광", (X(380) + X(750)) / 2, g.B - 12, { s: 11.5, a: "center", c: SC.green });
      /* 복사 곡선(모양만) */
      var pts = [], k, c3 = tRGB(T);
      for (k = 0; k <= 200; k++) {
        var lam = Math.pow(10, -1 + 6 * k / 200), u = lm / lam;
        var rel = Math.pow(u, 5) / (Math.exp(4.965 * u) - 1) * (Math.exp(4.965) - 1);
        pts.push([-1 + 6 * k / 200, clamp(rel, 0, 1)]);
      }
      ctx.beginPath(); ctx.moveTo(g.X(-1), g.B);
      pts.forEach(function (p) { ctx.lineTo(g.X(p[0]), g.Y(p[1])); });
      ctx.lineTo(g.X(5), g.B); ctx.closePath();
      var fg = ctx.createLinearGradient(0, g.T, 0, g.B); fg.addColorStop(0, rgba(c3, .45)); fg.addColorStop(1, rgba(c3, .05));
      ctx.fillStyle = fg; ctx.fill();
      SK.plot(ctx, g, pts, rgba(dark(c3, .62)), { w: 3, light: true });
      /* 최대 파장 */
      var px = X(lm);
      SK.line(ctx, { x: px, y: g.T }, { x: px, y: g.B }, LT.yellow, 2.2, [5, 5]);
      orb(ctx, px, g.Y(1), 5.5, c3, { glow: .8 });
      SK.pill(ctx, "가장 세게 내는 빛 · " + lmTxt, px, g.T + 70, { s: 12, a: "center", c: SC.yellow, box: [g.L, g.R] });
      SK.t(ctx, "빈의 변위 법칙 : 최대 세기 파장 × 온도 = 일정 (2.9 × 10⁶ nm·K)", 18, H - 8, { s: 11, c: LT.mute, w: "700" });

      var ch = false;
      if (T >= 5200 && T <= 6500 && !got.a) { got.a = ch = true; }
      if (T >= 9000 && T <= 11500 && !got.b) { got.b = ch = true; }
      if (T >= 700000 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("aWien", got); mission(); }

      /* 오른쪽 흰 카드: 받침대 위 기체 공 */
      var RX = LW + 10, CW = W - RX, bxc = RX + CW / 2, x0 = RX + 18;
      SK.card(ctx, RX, 0, CW, H, "이 온도의 기체 공");
      var rr = 26 + 12 * clamp((Math.log(T) / Math.LN10 - 3.4) / 2.5, 0, 1);
      stand(ctx, bxc, 156, 24, 16);
      orb(ctx, bxc, 156 - rr - 2, rr, c3, { glow: 1.1 });
      SK.row(ctx, "온도", Math.round(T).toLocaleString() + " K", x0, W - 18, 212);
      SK.row(ctx, "최대 세기 파장", lmTxt, x0, W - 18, 238);
      SK.row(ctx, "가장 세게 내는 영역", bd, x0, W - 18, 264, bcol);
      [[got.a, "광구 · 약 5,800 K"], [got.b, "채층 · 약 1만 K"], [got.c, "코로나 · 100만 K 이상"]].forEach(function (q, i) {
        SK.t(ctx, (q[0] ? "✓ " : "○ ") + q[1], x0, 294 + i * 19, { s: 11.5, w: "800", c: q[0] ? LT.green : LT.dim });
      });
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0), 3, x0 - 6, H - 44, CW - 24, "세 층의 온도를 모두 찾았습니다", "세 층 온도 찾기");
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
    var TEX = (function () { var R0 = SK.rng(101), o = []; for (var i = 0; i < 420; i++) { var a = R0() * 6.2832, r = Math.sqrt(R0()) * .98; o.push([r * Math.cos(a), r * Math.sin(a), 1.5 + R0() * 3.2, R0()]); } return o; })();
    function disc(cx, cy, R, c0, c1, c2, c3) {
      var g = ctx.createRadialGradient(cx - R * .12, cy - R * .12, R * .05, cx, cy, R);
      g.addColorStop(0, c0); g.addColorStop(.55, c1); g.addColorStop(.88, c2); g.addColorStop(1, c3);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    }
    function blob(x, y, rx, ry, col0, col1) {
      ctx.save(); ctx.translate(x, y); ctx.scale(rx / ry, 1);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry); g.addColorStop(0, col0); g.addColorStop(1, col1);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, ry, 0, 6.2832); ctx.fill(); ctx.restore();
    }
    function texture(cx, cy, R, dark, light) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.clip();
      TEX.forEach(function (q) { ctx.fillStyle = q[3] > .5 ? dark : light; ctx.beginPath(); ctx.arc(cx + q[0] * R, cy + q[1] * R, q[2], 0, 6.2832); ctx.fill(); });
      ctx.restore();
    }
    function loop(x0, y0, x1, y1, hgt, col, w) {
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0, y0 - hgt, x1, y1 - hgt, x1, y1); ctx.stroke(); ctx.restore();
    }
    var IL = SK.iso({ ox: 560, oy: 176, s: .62, L: 250, D: 140 });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 400, cx = 200, cy = 226, R = 104, B = BANDS[b];
      studio(ctx, 0, 0, LW, H, { x: cx, y: H - 18, rx: 165, ry: 20 });
      if (b === 0) {
        var hl = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.32); hl.addColorStop(0, "rgba(255,170,60,.42)"); hl.addColorStop(1, "rgba(255,150,40,0)");
        ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(cx, cy, R * 1.32, 0, 6.2832); ctx.fill();
        disc(cx, cy, R, "#fff4cc", "#ffcf5e", "#f39a2f", "#c4621c");
        texture(cx, cy, R, "rgba(150,70,10,.08)", "rgba(255,250,220,.09)");
        [[-62, 40, 14, 9], [70, -30, 12, 8]].forEach(function (f) { blob(cx + f[0], cy + f[1], f[2], f[3], "rgba(255,255,235,.45)", "rgba(255,255,235,0)"); });
        [[-40, -20, 13], [25, 30, 10], [50, -45, 8]].forEach(function (s) {
          blob(cx + s[0], cy + s[1], s[2], s[2] * .8, "rgba(35,10,4,.97)", "rgba(180,90,30,0)");
          blob(cx + s[0], cy + s[1], s[2] * .5, s[2] * .4, "rgba(25,6,2,1)", "rgba(25,6,2,.6)");
        });
        SK.line(ctx, { x: cx - 40, y: cy - 20 }, { x: cx - 92, y: cy - 92 }, "rgba(20,30,50,.6)", 1.2);
        SK.pill(ctx, "흑점", cx - 96, cy - 96, { s: 11.5, a: "right", c: SC.ink, box: [0, LW] });
        SK.pill(ctx, "쌀알 무늬가 덮은 광구", cx, cy + R + 30, { s: 11.5, a: "center", c: SC.yellow, box: [0, LW] });
      } else if (b === 1) {
        disc(cx, cy, R, "#ffb08f", "#e8553a", "#b02a1a", "#5e120a");
        texture(cx, cy, R, "rgba(70,0,0,.22)", "rgba(255,200,170,.16)");
        ctx.save(); ctx.strokeStyle = "rgba(60,0,0,.65)"; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx - 60, cy + 10); ctx.quadraticCurveTo(cx - 20, cy + 40, cx + 30, cy + 25); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = "rgba(220,70,50,.55)"; ctx.lineWidth = 1;
        for (var k = 0; k < 90; k++) { var a = k / 90 * 6.2832; ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.lineTo(cx + (R + 4 + (k * 7 % 5)) * Math.cos(a), cy + (R + 4 + (k * 7 % 5)) * Math.sin(a)); ctx.stroke(); }
        var pa = -0.75, px = cx + R * Math.cos(pa), py = cy + R * Math.sin(pa);
        loop(px - 18, py + 8, px + 22, py + 26, 70, "rgba(235,80,60,.95)", 7);
        loop(px - 10, py + 12, px + 14, py + 22, 50, "rgba(255,170,140,.9)", 2.5);
        SK.pill(ctx, "홍염", px + 26, py - 44, { s: 11.5, c: SC.red, box: [0, LW] });
        SK.pill(ctx, "필라멘트(홍염을 위에서 본 모습)", cx, cy + R + 30, { s: 11, a: "center", c: SC.red, box: [0, LW] });
      } else if (b === 2) {
        disc(cx, cy, R, "#ffd27a", "#f08a2a", "#b4481a", "#4a1a08");
        texture(cx, cy, R, "rgba(80,20,0,.25)", "rgba(255,230,160,.22)");
        [[-30, -35, 22], [40, 25, 18]].forEach(function (f) { blob(cx + f[0], cy + f[1], f[2], f[2] * .7, "rgba(255,250,210,.85)", "rgba(255,200,120,0)"); });
        loop(cx + R * .78, cy - R * .55, cx + R * .98, cy - R * .1, 40, "rgba(240,170,90,.85)", 2.5);
        SK.pill(ctx, "밝게 들끓는 활동 영역", cx, cy + R + 30, { s: 11, a: "center", c: SC.orange, box: [0, LW] });
        SK.warn(ctx, LW - 14, 58, "⚠ 눈에 안 보이는 빛 · 가짜 색", "right");
      } else {
        var cor = ctx.createRadialGradient(cx, cy, R * .95, cx, cy, R * 1.6); cor.addColorStop(0, "rgba(150,120,240,.55)"); cor.addColorStop(1, "rgba(150,120,255,0)");
        ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, 6.2832); ctx.fill();
        disc(cx, cy, R, "#5a4690", "#3a2a6a", "#2a1d52", "#1c1238");
        [[-55, 35, 20], [45, 10, 24], [10, 60, 14]].forEach(function (f) { blob(cx + f[0], cy + f[1], f[2], f[2] * .7, "rgba(255,250,255,.95)", "rgba(200,170,255,0)"); });
        loop(cx + 30, cy + 12, cx + 62, cy + 6, 26, "rgba(240,225,255,.85)", 2);
        loop(cx - 70, cy + 40, cx - 40, cy + 30, 22, "rgba(240,225,255,.8)", 2);
        blob(cx - 30, cy - 45, 42, 30, "rgba(5,2,15,.95)", "rgba(10,5,25,.55)");
        SK.pill(ctx, "코로나 홀", cx - 30, cy - 41, { s: 11, a: "center", c: SC.ink, box: [0, LW] });
        SK.pill(ctx, "100만 K가 넘는 코로나", cx, cy + R + 30, { s: 11, a: "center", c: SC.violet, box: [0, LW] });
        SK.warn(ctx, LW - 14, 58, "⚠ 눈에 안 보이는 빛 · 가짜 색", "right");
      }
      big2(ctx, B.layer, "필터 " + B.n, 18, 44);

      /* 가운데: 태양 대기 블록 모형(광구 → 채층 → 코로나) */
      var X1 = LW + 8, I = IL, P = I.P, Lb = I.L, Db = I.D, on;
      studio(ctx, X1, 0, W - X1, H, { x: P(Lb, Db, 0).x - 50, y: P(Lb, Db, 0).y + 8, rx: 170, ry: 24 });
      var SL = [
        { z0: 0, z1: 44, c: ["#ffd36b", "#f2a33a", "#c47a22"], n: "광구 · 약 5,800 K", on: b === 0, pc: SC.yellow },
        { z0: 44, z1: 64, c: ["#ff9a86", "#e8604c", "#b83e32"], n: "채층 · 약 1만 K", on: b === 1 || b === 2, pc: SC.red },
        { z0: 64, z1: 180, c: ["rgba(190,170,255,.30)", "rgba(160,140,240,.26)", "rgba(120,100,210,.32)"], n: "코로나 · 약 100만 K", on: b === 3, pc: SC.violet }
      ];
      SL.forEach(function (q, k) {
        if (k === 2) {   /* 코로나 속에 솟은 홍염 고리 */
          var a1 = P(70, 70, 64), a2 = P(150, 90, 64);
          ctx.save(); ctx.strokeStyle = "rgba(235,90,70,.9)"; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.bezierCurveTo(a1.x, a1.y - 58, a2.x, a2.y - 58, a2.x, a2.y); ctx.stroke(); ctx.restore();
        }
        ctx.save(); if (q.on) { ctx.shadowColor = k === 2 ? "rgba(140,110,255,.9)" : "rgba(255,170,60,.9)"; ctx.shadowBlur = 18; }
        I.box(ctx, 0, 0, q.z0, Lb, Db, q.z1, q.c[0], q.c[1], q.c[2]); ctx.restore();
        if (!q.on) I.box(ctx, 0, 0, q.z0, Lb, Db, q.z1, "rgba(236,240,247,.5)", "rgba(236,240,247,.5)", "rgba(236,240,247,.42)");
        if (k === 0) {   /* 광구 앞면의 쌀알 무늬 */
          I.face(ctx, "front", function (Lw) {
            var Rg = SK.rng(17); for (var i = 0; i < 160; i++) { ctx.fillStyle = Rg() > .5 ? "rgba(140,70,10,.18)" : "rgba(255,250,220,.25)"; ctx.beginPath(); ctx.arc(Rg() * Lw, 3 + Rg() * 38, 1.6 + Rg() * 2, 0, 6.2832); ctx.fill(); }
          });
        }
      });
      I.edges(ctx, 180, 180);
      SL.forEach(function (q) { var c = P(Lb / 2, Db, (q.z0 + q.z1) / 2); SK.pill(ctx, q.n, c.x, c.y + 4, { s: 11.5, a: "center", c: q.on ? q.pc : SC.mute, box: [X1, 704] }); });
      SK.warn(ctx, X1 + 12, H - 14, "⚠ 층 두께는 보기 쉽게 바꿈");

      /* 오른쪽 흰 카드 */
      var CX = 712, x0 = CX + 16, lay = b === 0 ? 0 : (b === 3 ? 2 : 1);
      var TT = ["약 5,800 K", "약 1만 K", "약 100만 K"], lc = [LT.yellow, LT.red, LT.violet][lay];
      SK.card(ctx, CX, 14, W - CX - 8, H - 28, "이 필터로 보이는 층");
      cval(ctx, B.layer, x0, 82, lc, B.layer.length > 4 ? 19 : 24);
      SK.row(ctx, "온도", TT[lay], x0, W - 24, 120);
      SK.row(ctx, "필터", B.n.split(" ")[0], x0, W - 24, 146);
      cnote(ctx, "바깥층일수록", x0, 188); cnote(ctx, "뜨겁고, 뜨거울수록", x0, 206); cnote(ctx, "짧은 파장으로 빛납니다", x0, 224);
      SK.bar(ctx, x0, 240, W - 32 - x0, [.25, .5, 1][lay], lc);
      cnote(ctx, "광구", x0, 268); cnote(ctx, "코로나", W - 24, 268, LT.mute, "right");
      SK.tip(ctx, lay === 0 ? "가시광 = 눈에 보이는 층" : (lay === 2 ? "X선 = 우주에서만 보임" : "Hα·자외선으로 보는 층"), x0 - 6, H - 64, W - CX - 28, true);
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

    function scope(x, y) {
      var g = ctx.createLinearGradient(0, y - 12, 0, y + 12); g.addColorStop(0, "#dfe6f5"); g.addColorStop(.5, "#8a95b0"); g.addColorStop(1, "#3c4560");
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12);
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-30, -9, 54, 18, 4); ctx.fill();
      ctx.fillStyle = "#2a3150"; ctx.beginPath(); ctx.roundRect(22, -12, 10, 24, 3); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "#6c7696"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 4, y + 6); ctx.lineTo(x - 16, y + 34); ctx.moveTo(x - 4, y + 6); ctx.lineTo(x + 8, y + 34); ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var S = STARS[s], d = dist(i0), mc = mCalc(S.M, d), diff = mc - S.m;
      var ok = Math.abs(diff) <= 0.06, dTxt = (d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc";
      studio(ctx, 0, 0, W, H);
      big2(ctx, ok ? S.n + "까지 약 " + dTxt : "내 계산 m = " + mc.toFixed(2) + " · 관측 m = " + S.m.toFixed(2),
        S.n + " — " + S.note + " · 절대 등급 M = " + S.M.toFixed(1), 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      SK.pill(ctx, ok ? "✅ 관측값과 맞습니다" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"), W - 16, 30, { s: 13, a: "right", c: ok ? SC.green : SC.red });
      /* 거리 판(입체 미니어처): 뒤 가장자리 y 146, 앞 가장자리 y 184, 앞쪽으로 24 px 기운다 */
      function DX(dd) { return 160 + 680 * (Math.log(dd) / Math.LN10) / 3.7; }
      var top = ctx.createLinearGradient(0, 146, 0, 184); top.addColorStop(0, "#f4f7fb"); top.addColorStop(1, "#d3dbe6");
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.22)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      polyP(ctx, [{ x: 120, y: 146 }, { x: 880, y: 146 }, { x: 856, y: 184 }, { x: 96, y: 184 }], top); ctx.restore();
      polyP(ctx, [{ x: 96, y: 184 }, { x: 856, y: 184 }, { x: 856, y: 196 }, { x: 96, y: 196 }], "#aab5c5");
      polyP(ctx, [{ x: 856, y: 184 }, { x: 880, y: 146 }, { x: 880, y: 158 }, { x: 856, y: 196 }], "#8f9aac");
      [1, 10, 100, 1000].forEach(function (q) {
        var tx = DX(q);
        SK.line(ctx, { x: tx + 12, y: 148 }, { x: tx - 12, y: 182 }, "rgba(20,40,90,.45)", 1.4);
        SK.t(ctx, q.toLocaleString() + " pc", tx - 12, 212, { s: 11, a: "center", c: LT.mute, w: "800" });
      });
      /* 망원경 미니어처 */
      var tg = ctx.createLinearGradient(0, 150, 0, 170); tg.addColorStop(0, "#f2f5fa"); tg.addColorStop(.5, "#9aa5bd"); tg.addColorStop(1, "#4a5370");
      ctx.strokeStyle = "#4a5370"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(56, 168); ctx.lineTo(40, 206); ctx.moveTo(56, 168); ctx.lineTo(72, 206); ctx.moveTo(56, 168); ctx.lineTo(56, 208); ctx.stroke();
      ctx.save(); ctx.translate(58, 160); ctx.rotate(-0.1);
      ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(-30, -9, 56, 18, 4); ctx.fill();
      ctx.fillStyle = "#2a3150"; ctx.beginPath(); ctx.roundRect(24, -12, 10, 24, 3); ctx.fill(); ctx.restore();
      /* 별 구슬(받침 기둥 위) + 망원경으로 오는 빛 */
      var sx = DX(d) - 12, br = clamp(10 - 0.45 * mc, 2.4, 10), sy = 128;
      var beam = ctx.createLinearGradient(sx, 0, 92, 0); beam.addColorStop(0, "rgba(255,190,80,.30)"); beam.addColorStop(1, "rgba(255,190,80," + clamp(.32 - .02 * mc, .04, .3) + ")");
      ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(92, 152); ctx.lineTo(92, 166); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(245,159,0,.8)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(DX(10) - 12, 165, 14, 7, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      SK.pill(ctx, "10 pc 자리라면 · 절대 등급 M = " + S.M.toFixed(1), DX(10) - 12, 112, { s: 11.5, a: "center", c: SC.yellow });
      stand(ctx, sx, 162, 4, 4);
      SK.line(ctx, { x: sx, y: sy + br }, { x: sx, y: 162 }, "#5c6678", 2);
      orb(ctx, sx, sy, br, [255, 214, 140], { glow: 1.4 });
      SK.pill(ctx, "내가 놓아 본 별 · " + dTxt, sx, 238, { s: 11.5, a: "center", c: "#fff4d6" });
      SK.t(ctx, "멀리 놓을수록 망원경에 닿는 빛이 줄어 어둡게 보입니다", 884, 258, { s: 11, a: "right", c: LT.mute, w: "700" });

      /* 겉보기 등급 자(흰 카드) */
      SK.card(ctx, 16, 272, 600, H - 288, "겉보기 등급 자   (← 밝다 · 어둡다 →)");
      var x0 = 44, x1 = 588, y = 334;
      function X(mag) { return x0 + (mag + 6) / 28 * (x1 - x0); }
      var bar = ctx.createLinearGradient(x0, 0, x1, 0); bar.addColorStop(0, "#fff3c4"); bar.addColorStop(.35, "#a9b3d6"); bar.addColorStop(1, "#28305a");
      ctx.fillStyle = bar; ctx.beginPath(); ctx.roundRect(x0, y - 6, x1 - x0, 12, 6); ctx.fill();
      for (var gg = -5; gg <= 20; gg += 5) SK.t(ctx, String(gg), X(gg), y + 24, { s: 10.5, c: LT.mute, a: "center", w: "700" });
      var ox = X(S.m);
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(ox, y, 10, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "관측값 m = " + S.m.toFixed(2), ox, y - 18, { s: 11.5, a: "center", c: SC.orange, box: [16, 616] });
      var cxp = clamp(X(mc), x0 - 4, x1 + 4);
      orb(ctx, cxp, y, 6, ok ? [15, 159, 118] : [28, 126, 214]);
      if (!ok) SK.line(ctx, { x: cxp, y: y + 34 }, { x: ox, y: y + 34 }, "rgba(224,49,49,.6)", 1.6, [3, 3]);
      SK.pill(ctx, "내 계산값 m = " + mc.toFixed(2), cxp, y + 52, { s: 11.5, a: "center", c: ok ? SC.green : SC.blue, box: [16, 616] });
      /* 판정 카드 */
      var CX = 628, cx0 = CX + 18;
      SK.card(ctx, CX, 272, W - CX - 16, H - 288, "판정");
      cval(ctx, ok ? "이 거리가 답" : (diff > 0 ? "너무 멀게 놓음" : "너무 가깝게 놓음"), cx0, 330, ok ? LT.green : LT.red, 19);
      SK.row(ctx, "놓아 본 거리", dTxt, cx0, W - 34, 360);
      SK.row(ctx, "거리 지수 m − M", (mc - S.M).toFixed(2), cx0, W - 34, 384, LT.blue);
      $("b-mod-read").innerHTML =
        "<span class='k'>놓아 본 거리</span><span class='v y'>d = " + (d < 100 ? d.toFixed(1) : Math.round(d).toLocaleString()) + " pc</span>" +
        "<span class='k'>거리 지수</span><span class='v b'>m − M = " + (mc - S.M).toFixed(2) + "</span>" +
        "<span class='sub'>= 5 log(d / 10 pc)</span>" +
        "<span class='k'>보일 밝기</span><span class='v'>m = " + mc.toFixed(2) + "</span>" +
        "<span class='sub'>관측값 m = " + S.m.toFixed(2) + "</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "관측값과 맞습니다 · 이 거리가 답" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다")) + "</span>";

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
      ctx.clearRect(0, 0, W, H);
      var e = err(i0), th = 3 * e, n = 0, LW = 620;
      FIVE.forEach(function (s0) { if (s0.p >= th) n++; });
      var era = i0 <= 3 ? "19세기 망원경 수준" : (i0 >= 40 ? "가이아 위성 수준" : "20세기 후반 관측 수준");
      var ch = false;
      if (n === 2 && !got.a) { got.a = ch = true; }
      if (n === 5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("bLim", got); mission(); }
      studio(ctx, 0, 0, LW, H);
      big2(ctx, "믿을 만하게 잴 수 있는 별 " + n + " / 5", "측정 오차 ±" + e.toFixed(4) + "″ → 한계 " + th.toFixed(4) + "″", 18, 44);
      /* 흰 그래프 판 */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.12)"; ctx.shadowBlur = 10; ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.beginPath(); ctx.roundRect(12, 96, LW - 24, H - 108, 12); ctx.fill(); ctx.restore();
      var x0 = 110, x1 = 470, y0 = 146, yA = 352;
      function X(p) { return x0 + (Math.log(p) / Math.LN10 + 3) / 3.2 * (x1 - x0); }   /* 0.001~1.58″ */
      var lx = clamp(X(th), x0 - 20, x1 + 20);
      var fog = ctx.createLinearGradient(x0 - 20, 0, lx, 0); fog.addColorStop(0, "rgba(224,49,49,.16)"); fog.addColorStop(1, "rgba(224,49,49,.05)");
      ctx.fillStyle = fog; ctx.fillRect(x0 - 20, 128, lx - x0 + 20, yA - 128);
      SK.t(ctx, "← 오차에 묻히는 구간", lx - 6, yA - 8, { s: 10.5, a: "right", c: LT.red, w: "800" });
      SK.line(ctx, { x: x0 - 20, y: yA }, { x: x1 + 20, y: yA }, LT.line, 1.5);
      [[0.001, "0.001″"], [0.01, "0.01″"], [0.1, "0.1″"], [1, "1″"]].forEach(function (q) {
        SK.line(ctx, { x: X(q[0]), y: yA - 4 }, { x: X(q[0]), y: yA + 4 }, LT.line, 1.5);
        SK.t(ctx, q[1], X(q[0]), yA + 18, { s: 10.5, a: "center", c: LT.mute, w: "700" });
      });
      FIVE.forEach(function (s0, k) {
        var y = y0 + k * 42, okk = s0.p >= th;
        SK.line(ctx, { x: x0 - 20, y: y }, { x: x1 + 20, y: y }, "rgba(20,40,90,.08)", 1);
        SK.pill(ctx, s0.n, 24, y + 5, { s: 12.5, c: SC.ink });
        if (okk) orb(ctx, X(s0.p), y, 6, [255, 196, 90], { glow: 1.2 });
        else { ctx.globalAlpha = .5; orb(ctx, X(s0.p), y, 5, [240, 140, 150]); ctx.globalAlpha = 1; }
        SK.t(ctx, s0.p.toFixed(4) + "″", X(s0.p) + 14, y + 4, { s: 11.5, c: okk ? LT.ink : LT.dim, w: "800" });
        SK.pill(ctx, okk ? "잴 수 있다" : "오차에 묻힌다", x1 + 42, y + 5, { s: 11.5, c: okk ? SC.green : SC.red, box: [0, LW - 12] });
      });
      SK.line(ctx, { x: lx, y: 128 }, { x: lx, y: yA }, LT.yellow, 2.6, [6, 5]);
      SK.pill(ctx, "믿을 수 있는 한계 (오차의 3배)", lx, 120, { s: 11.5, a: "center", c: SC.yellow, box: [12, LW - 12] });
      SK.t(ctx, "가로축은 시차의 로그 눈금 (한 칸에 10배)", 24, H - 20, { s: 10.5, c: LT.dim, w: "700" });

      /* 판정 카드 */
      var CX = LW + 10, x2 = CX + 18, CW = W - CX;
      SK.card(ctx, CX, 0, CW, H, "측정 한계 판정");
      cval(ctx, n + " / 5 개", x2, 76, n === 5 ? LT.green : LT.blue, 30);
      SK.bar(ctx, x2, 92, CW - 36, n / 5, n === 5 ? LT.green : LT.blue);
      SK.row(ctx, "측정 오차", "±" + e.toFixed(4) + "″", x2, W - 18, 136);
      SK.row(ctx, "믿을 한계 (3배)", th.toFixed(4) + "″", x2, W - 18, 162, LT.yellow);
      SK.row(ctx, "장비 수준", era, x2, W - 18, 188);
      [[got.a, "두 별만 잴 수 있던 시절 보기"], [got.b, "다섯 별 모두 재기"], [got.c, "두 자로 나눠 담기"]].forEach(function (q, i) {
        SK.t(ctx, (q[0] ? "✓ " : "○ ") + q[1], x2, 228 + i * 21, { s: 12, w: "800", c: q[0] ? LT.green : LT.dim });
      });
      SK.tip(ctx, n <= 2 ? "베셀 무렵: 가까운 별 몇 개뿐" : (n === 5 ? "자의 한계 = 기술의 한계" : "장비를 좋게 하면 더 멀리"), x2 - 6, 304, CW - 24, n === 5 ? true : null);
      cnote(ctx, "시차는 가까운 별에만,", x2, 364); cnote(ctx, "밝기는 그 너머에 씁니다.", x2, 382);
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

    var mt = 0, TT = [3100, 9900, 3900];
    var cplay = playWire("c-play", !SK.REDUCE, ["별 멈추기", "별 움직이기"]);
    var BGS = (function () { var R0 = SK.rng(57), o = []; for (var i = 0; i < 26; i++) o.push([R0(), R0(), .8 + R0() * 1.6]); return o; })();
    var IC = SK.iso({ ox: 664, oy: 160, s: .6, L: 230, D: 230 }), CZ = 196;
    function V3(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
    function paint() {
      var S = MOVE[s], tv = target(S), ok = Math.abs(vt - tv) <= 1.2;
      var vr = S.vr, space = Math.sqrt(vr * vr + vt * vt);
      ctx.clearRect(0, 0, W, H);
      var LW = 430;
      studio(ctx, 0, 0, W, H, caseFloor(IC));
      big2(ctx, S.n + (ok ? " · 공간 운동 " + space.toFixed(1) + " km/s" : " · 공간 운동은?"), S.note, 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      /* 관측 화면 미니어처: 모니터 안은 어두운 하늘 */
      var mx = 22, my = 102, mw = LW - 44, mh = H - 140;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      var bz = ctx.createLinearGradient(0, my - 9, 0, my + mh + 9); bz.addColorStop(0, "#4a5263"); bz.addColorStop(1, "#1d2129");
      ctx.fillStyle = bz; ctx.beginPath(); ctx.roundRect(mx - 9, my - 9, mw + 18, mh + 18, 16); ctx.fill(); ctx.restore();
      polyP(ctx, [{ x: LW / 2 - 30, y: my + mh + 9 }, { x: LW / 2 + 30, y: my + mh + 9 }, { x: LW / 2 + 48, y: my + mh + 22 }, { x: LW / 2 - 48, y: my + mh + 22 }], "#3a4150");
      SK.stage(ctx, mx, my, mw, mh, "space", { seed: 41, r: 8 });
      var bx = mx + 16, by = my + 42, bw = mw - 32, bh = 26;
      var sp = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      ["#6a2cff", "#2f5bff", "#22c4ff", "#36e07a", "#f3ec3a", "#ff9a2c", "#ff3434"].forEach(function (c, k) { sp.addColorStop(k / 6, c); });
      ctx.fillStyle = sp; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill();
      var shift = clamp(vr / 120, -1, 1) * bw * .1;
      [.28, .5, .74].forEach(function (f) {
        var lx = bx + bw * f;
        SK.line(ctx, { x: lx, y: by - 7 }, { x: lx, y: by - 1 }, "rgba(255,255,255,.8)", 1.5);
        ctx.fillStyle = "rgba(10,8,20,.88)"; ctx.fillRect(lx + shift - 1.5, by, 3, bh);
      });
      SK.t(ctx, "▾ 실험실 위치", bx + bw * .28 - 6, by - 10, { s: 10, c: SC.mute, w: "700" });
      SK.pill(ctx, vr < 0 ? "파란 쪽으로 치우침 → 다가온다" : "붉은 쪽으로 치우침 → 멀어진다", bx, by + bh + 22, { s: 11.5, c: vr < 0 ? SC.blue : SC.red });
      var py0 = by + bh + 34, ph = my + mh - 10 - py0;
      ctx.save(); ctx.beginPath(); ctx.roundRect(mx + 8, py0, mw - 16, ph, 8); ctx.clip();
      ctx.fillStyle = "rgba(3,5,18,.55)"; ctx.fillRect(mx + 8, py0, mw - 16, ph);
      BGS.forEach(function (q) { SK.glow(ctx, mx + 16 + q[0] * (mw - 32), py0 + 8 + q[1] * (ph - 16), q[2], "rgba(220,230,255,.85)", 3); });
      var spd = 12 + 18 * Math.log(1 + S.mu * 10) / Math.LN10, span = mw - 110;
      var travel = (mt / 1000 * spd) % span, sy = py0 + ph * .58;
      for (var k = 1; k <= 6; k++) {
        var tx = mx + 44 + travel - k * spd * .5;
        if (tx < mx + 24) continue;
        ctx.fillStyle = rgba(tRGB(TT[s]), .5 - k * .07); ctx.beginPath(); ctx.arc(tx, sy, 2.4, 0, 6.2832); ctx.fill();
      }
      starT(ctx, mx + 44 + travel, sy, 4.5, TT[s], 4.5);
      ctx.restore();
      SK.pill(ctx, "고유 운동 " + S.mu.toFixed(3) + "″/년 →", mx + 16, py0 + 24, { s: 11.5, c: SC.yellow });
      SK.warn(ctx, mx + mw - 12, my + mh - 18, "⚠ 실제보다 아주 빠르게 돌린 모습", "right");

      /* 오른쪽: 우주 진열장 안에서 속도 쪼개 보기 */
      var I = IC, P = I.P, L3 = I.L, D3 = I.D;
      spaceCase(ctx, I, CZ, 43);
      var E = [L3 * .9, D3 * .9, 16], ST = [L3 * .4, D3 * .4, 118];
      var dv = [ST[0] - E[0], ST[1] - E[1], ST[2] - E[2]], dn = Math.sqrt(dv[0] * dv[0] + dv[1] * dv[1] + dv[2] * dv[2]);
      var u = [dv[0] / dn, dv[1] / dn, dv[2] / dn], tt = [Math.SQRT1_2, -Math.SQRT1_2, 0], kk = .62;
      var pE = P(E[0], E[1], E[2]), pS = P(ST[0], ST[1], ST[2]), far = V3(ST, u, 80);
      SK.line(ctx, pE, P(far[0], far[1], far[2]), "rgba(200,210,255,.4)", 1.2, [4, 4]);
      var eR = V3(ST, u, vr * kk), eT = V3(ST, tt, vt * kk), eS = V3(eR, tt, vt * kk);
      var qR = P(eR[0], eR[1], eR[2]), qT = P(eT[0], eT[1], eT[2]), qS = P(eS[0], eS[1], eS[2]);
      var lr = Math.abs(vr), lt = vt;
      if (lt > 2 && lr > 2) { SK.line(ctx, qR, qS, "rgba(200,210,255,.35)", 1, [3, 3]); SK.line(ctx, qT, qS, "rgba(200,210,255,.35)", 1, [3, 3]); }
      if (lr > 2) SK.arrow(ctx, pS, qR, SC.orange, 3, 11);
      if (lt > 2) SK.arrow(ctx, pS, qT, SC.blue, 3, 11);
      if (lt > 2 || lr > 2) { ctx.save(); ctx.shadowColor = SC.violet; ctx.shadowBlur = 10; SK.arrow(ctx, pS, qS, SC.violet, 3.5, 12); ctx.restore(); }
      starT(ctx, pS.x, pS.y, 5.5, TT[s], 4.2);
      SK.earth(ctx, pE.x, pE.y, 8);
      caseGlass(ctx, I, CZ);
      var BOX = [440, W];
      SK.pill(ctx, "시선속도 " + (vr > 0 ? "+" : "") + vr + " km/s", Math.min(pS.x, qR.x) - 12, (pS.y + qR.y) / 2 + 4, { s: 11.5, a: "right", c: SC.orange, box: BOX });
      SK.pill(ctx, "접선속도 " + vt.toFixed(1) + " km/s", pS.x + 8, pS.y - 16, { s: 11.5, c: SC.blue, box: BOX });
      if (lt > 2 || lr > 2) SK.pill(ctx, ok ? "공간 운동 " + space.toFixed(1) + " km/s" : "공간 운동 = ?", qS.x + 10, qS.y + (vr < 0 ? 18 : -8), { s: 12, c: SC.violet, box: BOX });
      I.label(ctx, E[0], E[1], E[2] - 8, "지구(관측자)", 34, 26, "#bfe6ff", BOX);
      /* 아래 흰 카드 */
      var CX = 448, CY = 318;
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, "속도 쪼개 보기 · 공간 운동² = 시선속도² + 접선속도²");
      [["시선속도 (도플러)", (vr > 0 ? "+" : "") + vr + " km/s", LT.orange], ["접선속도 (4.74 μ d)", vt.toFixed(1) + " km/s", ok ? LT.green : LT.blue], ["공간 운동", ok ? space.toFixed(1) + " km/s" : "?", LT.violet]].forEach(function (q, i) {
        var xx = CX + 18 + i * 148;
        cnote(ctx, q[0], xx, CY + 54); cval(ctx, q[1], xx, CY + 80, q[2], 18);
      });
    }
    function draw() {
      paint();
      var S = MOVE[s], tv = target(S), ok = Math.abs(vt - tv) <= 1.2;
      var vr = S.vr, space = Math.sqrt(vr * vr + vt * vt);
      $("c-motion-read").innerHTML =
        "<span class='k'>시선속도</span><span class='v r'>" + (vr > 0 ? "+" : "") + vr + " km/s</span>" +
        "<span class='sub'>스펙트럼선의 치우침(도플러)으로 잰 값</span>" +
        "<span class='k'>접선속도</span><span class='v b'>" + vt.toFixed(1) + " km/s</span>" +
        "<span class='sub'>4.74 × " + S.mu.toFixed(3) + "″/년 × " + S.d.toFixed(2) + " pc 를 계산해 넣기</span>" +
        "<span class='k'>공간 운동</span><span class='v'>" + (ok ? space.toFixed(1) + " km/s" : "?") + "</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "접선속도가 맞습니다" : (vt > tv ? "접선속도가 너무 큽니다" : "접선속도가 아직 작습니다")) + "</span>";

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
    SK.animate(canvas, function (dt) { if (cplay.on) { mt += dt; paint(); } });
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
    var DT = [4700, 9400, 9300, 8600, 9000, 9000, 15500];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var ch = false;
      if (t <= -80 && !got.a) { got.a = ch = true; }
      if (t >= 80 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cDip", got); mission(); }
      var when = t === 0 ? "지금" : (t < 0 ? Math.abs(t * 1000).toLocaleString() + "년 전" : (t * 1000).toLocaleString() + "년 뒤");
      var SW = 604;
      studio(ctx, 0, 0, W, H);
      big2(ctx, when + "의 북두칠성", t === 0 ? "시간을 움직여 별들이 가는 길을 보세요" : (Math.abs(t) >= 80 ? "국자 모양이 무너졌습니다" : "모양이 조금씩 바뀝니다"), 18, 44);
      /* 천체 투영관 화면(어두운 하늘) */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      var bz = ctx.createLinearGradient(0, 90, 0, H - 8); bz.addColorStop(0, "#4a5263"); bz.addColorStop(1, "#1d2129");
      ctx.fillStyle = bz; ctx.beginPath(); ctx.roundRect(12, 88, SW - 24, H - 98, 16); ctx.fill(); ctx.restore();
      SK.stage(ctx, 20, 96, SW - 40, H - 114, "space", { seed: 61, r: 10 });
      SK.pill(ctx, "화살표 = 별이 움직여 가는 방향", SW - 34, 122, { s: 11, a: "right", c: SC.mute, box: [20, SW - 20] });
      var cx = 330, cy = 232, sc = 15;
      function P(q) { return { x: cx + q.x * sc, y: cy - q.y * sc }; }
      if (t !== 0) {
        LINK.forEach(function (l) { SK.line(ctx, P(D[l[0]]), P(D[l[1]]), "rgba(200,210,255,.22)", 1.2, [3, 4]); });
        D.forEach(function (s0) { var q = P(s0); ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, 6.2832); ctx.stroke(); });
        SK.pill(ctx, "점선 = 지금의 모습", 34, H - 50, { s: 11, c: SC.dim });
      }
      ctx.save(); ctx.shadowColor = SC.blue; ctx.shadowBlur = 6;
      LINK.forEach(function (l) { SK.line(ctx, P(pos(l[0])), P(pos(l[1])), "rgba(127,211,255,.7)", 1.8); });
      ctx.restore();
      D.forEach(function (s0, k) {
        var p = P(pos(k)), odd = Math.abs(s0.ma + 120) < 30, mm = Math.sqrt(s0.ma * s0.ma + s0.md * s0.md);
        var ux = -s0.ma / mm, uy = -s0.md / mm, L = 18 + mm * .1;
        SK.arrow(ctx, { x: p.x + ux * 9, y: p.y + uy * 9 }, { x: p.x + ux * (9 + L), y: p.y + uy * (9 + L) }, odd ? SC.orange : SC.blue, 2, 8);
        starT(ctx, p.x, p.y, 4.2, DT[k], 4.5);
        if (odd) { ctx.strokeStyle = SC.orange; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 6.2832); ctx.stroke(); }
        SK.pill(ctx, s0.n, p.x, p.y - 18, { s: 10.5, a: "center", c: odd ? SC.orange : SC.ink, box: [20, SW - 20] });
      });
      SK.pill(ctx, "주황 고리 두 별은 나머지 다섯과 다른 방향으로 갑니다", SW / 2, H - 22, { s: 11.5, a: "center", c: SC.orange, box: [20, SW - 20] });
      /* 판정 카드 */
      var CX = SW + 2, x0 = CX + 18, CW = W - CX;
      SK.card(ctx, CX, 0, CW, H, "판정");
      cval(ctx, when, x0, 68, LT.ink, 24);
      SK.row(ctx, "나란히 가는 별", "5개 (운동 성단)", x0, W - 18, 108, LT.blue);
      SK.row(ctx, "반대로 가는 별", "두브헤 · 알카이드", x0, W - 18, 134, LT.orange);
      SK.row(ctx, "가장 빠른 고유 운동", "약 0.14″/년", x0, W - 18, 160);
      cnote(ctx, "흐른 시간", x0, 196);
      SK.bar(ctx, x0, 206, CW - 36, Math.abs(t) / 100, LT.blue);
      cnote(ctx, "0", x0, 232); cnote(ctx, "10만 년", W - 18, 232, LT.mute, "right");
      [[got.a, "10만 년쯤 전 모습 보기"], [got.b, "10만 년쯤 뒤 모습 보기"], [got.c, "따로 가는 두 별 고르기"]].forEach(function (q, i) {
        SK.t(ctx, (q[0] ? "✓ " : "○ ") + q[1], x0, 264 + i * 22, { s: 12, w: "800", c: q[0] ? LT.green : LT.dim });
      });
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0), 3, x0 - 6, 340, CW - 24, "별자리 모양은 영원하지 않다", "과거·미래·두 별 찾기");
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

  /* ---- 장면4 쌍성 질량 (우주 디오라마: 유리 진열장 안에서 서로 도는 두 별) ---- */
  (function () {
    var canvas = $("c-c-binary"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var msum = 1, cm = 50, got = window.sthState("cBin") || { a: false, b: false };
    var A_AU = 19.8, P_YR = 50.1;
    var TRUE_SUM = Math.pow(A_AU, 3) / Math.pow(P_YR, 2);          /* 3.09 */
    var TRUE_CM = 33.12;

    var phi = -0.6, bplay = playWire("c-bplay", !SK.REDUCE, ["공전 멈추기", "공전 돌리기"]);
    /* 진열장: 바닥 L×D, 높이 ZT. 두 별은 높이 HZ 의 수평면(궤도면)에서 돈다 */
    var DH = 420, I = SK.iso({ ox: 560, oy: 186, s: 0.66, L: 300, D: 300 }), L = I.L, D = I.D, ZT = 220, HZ = 120;
    var CX = L / 2, CY = D / 2, SPAN = 145, BOX = [0, W];
    var SKY = (function () { var R = SK.rng(83), a = [], i; for (i = 0; i < 70; i++) a.push([R(), R(), R()]); return a; })();
    function P(x, y, z) { return I.P(x, y, z); }
    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function seg(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function ring(r, z, col, w, dash) {
      ctx.save(); if (dash) ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = w || 1.4; ctx.beginPath();
      for (var t = 0; t <= 64; t++) { var a = t / 64 * 6.2832, p = P(CX + r * Math.cos(a), CY + r * Math.sin(a), z); if (t) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke(); ctx.restore();
    }
    function cabinet() {
      SK.studio(ctx, 0, 0, W, DH, { x: P(L, D, 0).x - 160, y: P(L, D, -16).y - 6, rx: 300, ry: 46 });
      /* 받침대 */
      I.box(ctx, -8, -8, -16, L + 8, D + 8, 0, "#2b303c", "#1b1f28", "#12151c");
      /* 뒷벽 두 장: 어두운 우주와 먼 별 */
      var g1 = ctx.createLinearGradient(0, P(0, 0, ZT).y, 0, P(0, D, 0).y); g1.addColorStop(0, "#070a1c"); g1.addColorStop(1, "#141a3a");
      poly([P(0, 0, 0), P(0, D, 0), P(0, D, ZT), P(0, 0, ZT)], g1);
      poly([P(0, 0, 0), P(L, 0, 0), P(L, 0, ZT), P(0, 0, ZT)], g1);
      SKY.forEach(function (s, i) {
        var p = i % 2 ? P(0, s[0] * D, s[1] * ZT) : P(s[0] * L, 0, s[1] * ZT), z = s[2] > .8 ? 2 : 1.3;
        ctx.fillStyle = "rgba(230,236,255," + (0.35 + s[2] * 0.55).toFixed(2) + ")"; ctx.fillRect(p.x, p.y, z, z);
      });
      /* 바닥: 궤도면을 내려다본 눈금판 */
      poly([P(0, 0, 0), P(L, 0, 0), P(L, D, 0), P(0, D, 0)], "#0d1230");
      ctx.strokeStyle = "rgba(140,160,255,.13)"; ctx.lineWidth = 1;
      for (var k = 25; k < L; k += 25) { seg(P(k, 0, 0), P(k, D, 0)); seg(P(0, k, 0), P(L, k, 0)); }
    }
    function glass() {
      poly([P(0, D, 0), P(L, D, 0), P(L, D, ZT), P(0, D, ZT)], "rgba(200,225,255,.07)");
      poly([P(L, 0, 0), P(L, D, 0), P(L, D, ZT), P(L, 0, ZT)], "rgba(190,215,255,.11)");
      poly([P(0, 0, ZT), P(L, 0, ZT), P(L, D, ZT), P(0, D, ZT)], "rgba(225,238,255,.06)");
      /* 비스듬한 반사 줄 */
      ctx.save(); poly([P(0, D, 0), P(L, D, 0), P(L, D, ZT), P(0, D, ZT)]); ctx.clip();
      var q = P(L * .2, D, ZT), r = P(L * .45, D, 0), gg = ctx.createLinearGradient(q.x, q.y, r.x + 60, r.y);
      gg.addColorStop(0, "rgba(255,255,255,0)"); gg.addColorStop(.45, "rgba(255,255,255,.10)"); gg.addColorStop(.55, "rgba(255,255,255,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, DH); ctx.restore();
      /* 모서리: 뒤 기둥은 흐리게, 보이는 모서리는 밝게 */
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; seg(P(0, 0, 0), P(0, 0, ZT));
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.3;
      [[P(0, D, 0), P(0, D, ZT)], [P(L, D, 0), P(L, D, ZT)], [P(L, 0, 0), P(L, 0, ZT)],
       [P(0, 0, ZT), P(L, 0, ZT)], [P(L, 0, ZT), P(L, D, ZT)], [P(L, D, ZT), P(0, D, ZT)], [P(0, D, ZT), P(0, 0, ZT)],
       [P(0, D, 0), P(L, D, 0)], [P(L, D, 0), P(L, 0, 0)]].forEach(function (e) { seg(e[0], e[1]); });
    }
    function starAt(s) {
      var fl = P(s.x, s.y, 0), p = P(s.x, s.y, HZ), col = tRGB(s.T), pool = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, s.r * 3.4);
      pool.addColorStop(0, rgba(col, .35)); pool.addColorStop(1, rgba(col, 0));
      ctx.save(); ctx.translate(fl.x, fl.y); ctx.scale(1, .5); ctx.translate(-fl.x, -fl.y);
      ctx.fillStyle = pool; ctx.beginPath(); ctx.arc(fl.x, fl.y, s.r * 3.4, 0, 6.2832); ctx.fill(); ctx.restore();
      SK.line(ctx, fl, p, "rgba(220,230,255,.35)", 1, [2, 3]);
      starT(ctx, p.x, p.y, s.r, s.T, 4.2);
      return p;
    }
    function lever(x0, y0, f, mA, mB) {
      SK.t(ctx, "지렛대로 보면", x0, y0, { s: 11.5, c: SC.mute, w: "800" });
      var xa = x0 + 14, xb = x0 + 184, yb = y0 + 66, xf = xa + (xb - xa) * f;
      SK.line(ctx, { x: xa, y: yb }, { x: xb, y: yb }, "rgba(220,230,255,.75)", 3);
      ctx.fillStyle = SC.yellow; ctx.beginPath(); ctx.moveTo(xf, yb + 2); ctx.lineTo(xf - 9, yb + 18); ctx.lineTo(xf + 9, yb + 18); ctx.closePath(); ctx.fill();
      var tot = Math.max(mA + mB, 0.01), ra = 5 + 13 * Math.sqrt(mA / tot), rb = 5 + 13 * Math.sqrt(mB / tot);
      SK.planet(ctx, xa, yb - ra - 2, ra, "#9ad0ff", "#1d4f8a");
      SK.planet(ctx, xb, yb - rb - 2, rb, "#d9c8ff", "#4b358f");
      SK.t(ctx, "A", xa, yb + 34, { s: 12, a: "center", c: SC.blue, w: "900" });
      SK.t(ctx, "B", xb, yb + 34, { s: 12, a: "center", c: SC.violet, w: "900" });
      SK.t(ctx, "▲ 받침점 = 질량 중심", x0 + 99, yb + 54, { s: 11, a: "center", c: SC.yellow, w: "800" });
    }
    function paint() {
      var f = cm / 100, mA = msum * (1 - f), mB = msum * f;
      var okA = Math.abs(msum - TRUE_SUM) <= 0.12, okB = Math.abs(cm - TRUE_CM) <= 1.5;
      ctx.clearRect(0, 0, W, H);
      /* ── 위: 우주 진열장 ── */
      cabinet();
      var c = Math.cos(phi), sn = Math.sin(phi), rA = Math.max(SPAN * f, 1), rB = Math.max(SPAN * (1 - f), 1);
      var sA = { x: CX - rA * c, y: CY - rA * sn, r: 9, T: 9900 }, sB = { x: CX + rB * c, y: CY + rB * sn, r: 3.4, T: 25000 };
      /* 궤도 그림자(바닥)와 궤도(궤도면) */
      ring(rA, 0, "rgba(127,211,255,.2)", 1, [3, 4]); ring(rB, 0, "rgba(182,156,255,.2)", 1, [3, 4]);
      ctx.save(); ctx.beginPath();
      for (var t2 = 0; t2 <= 64; t2++) { var a2 = t2 / 64 * 6.2832, q2 = P(CX + Math.max(rA, rB) * Math.cos(a2), CY + Math.max(rA, rB) * Math.sin(a2), HZ); if (t2) ctx.lineTo(q2.x, q2.y); else ctx.moveTo(q2.x, q2.y); }
      ctx.fillStyle = "rgba(140,160,255,.07)"; ctx.fill(); ctx.restore();
      ring(rA, HZ, "rgba(127,211,255,.65)", 1.5, [5, 4]); ring(rB, HZ, "rgba(182,156,255,.65)", 1.5, [5, 4]);
      /* 질량 중심: 바닥 고리 + 기둥 */
      var cmF = P(CX, CY, 0), cmP = P(CX, CY, HZ);
      SK.line(ctx, cmF, cmP, "rgba(255,211,107,.55)", 1.2, [2, 3]);
      ctx.save(); ctx.translate(cmF.x, cmF.y); ctx.scale(1, .5); ctx.strokeStyle = "rgba(255,211,107,.75)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 6.2832); ctx.stroke(); ctx.restore();
      /* 먼 별부터 그린다 */
      var pA, pB, aNear = (sA.x + sA.y) > (sB.x + sB.y);
      if (aNear) pB = starAt(sB); else pA = starAt(sA);
      SK.line(ctx, P(aNear ? sB.x : sA.x, aNear ? sB.y : sA.y, HZ), cmP, "rgba(220,230,255,.3)", 1.1);
      ctx.strokeStyle = SC.yellow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cmP.x - 7, cmP.y); ctx.lineTo(cmP.x + 7, cmP.y); ctx.moveTo(cmP.x, cmP.y - 7); ctx.lineTo(cmP.x, cmP.y + 7); ctx.stroke();
      SK.line(ctx, cmP, P(aNear ? sA.x : sB.x, aNear ? sA.y : sB.y, HZ), "rgba(220,230,255,.3)", 1.1);
      if (aNear) pA = starAt(sA); else pB = starAt(sB);
      glass();
      SK.pill(ctx, "A", pA.x, pA.y - 18, { s: 12, a: "center", c: SC.blue, box: BOX });
      SK.pill(ctx, "B", pB.x, pB.y - 13, { s: 11, a: "center", c: SC.violet, box: BOX });
      I.label(ctx, CX, CY, 0, "✚ 질량 중심 (두 별이 함께 도는 점)", -205, 70, "#ffd36b", BOX);
      I.label(ctx, L, 40, HZ, "궤도면 — 두 별은 같은 주기로 돕니다", 64, -62, "#e8ecff", BOX);
      I.label(ctx, L - 30, D, -8, "바닥 = 궤도를 내려다본 그림자", 40, 22, "#c9d2f0", BOX);
      /* 큰 제목 */
      var h1, h2;
      if (okA && okB) { h1 = "시리우스를 저울에 달았다"; h2 = "A " + mA.toFixed(2) + " M☉ · B " + mB.toFixed(2) + " M☉"; }
      else if (okA) { h1 = "합은 맞췄다"; h2 = "이제 질량 중심의 자리를 찾을 차례"; }
      else if (okB) { h1 = "비율은 맞췄다"; h2 = "이제 궤도 크기와 주기로 합을"; }
      else { h1 = "보이지 않는 저울"; h2 = "두 별은 한 점을 함께 돈다"; }
      SK.bigText(ctx, h1, 22, 50, 28, "#ffffff"); SK.bigText(ctx, h2, 22, 84, 17, "#ffd36b");
      SK.warn(ctx, W - 14, 28, "⚠ 별 크기는 과장 · 궤도는 원으로 단순화 (실제는 찌그러진 타원)", "right");
      SK.pill(ctx, "질량 중심에 가까운 쪽이 더 무겁고 덜 흔들립니다", 210, 400, { s: 11.5, a: "center", c: "#e8ecff", box: BOX });
      /* ── 아래: 관측 자료와 결과 ── */
      var y0 = DH + 8;
      SK.stage(ctx, 0, y0, W, H - y0, "space", { seed: 71 });
      SK.t(ctx, "관측 자료 · 시리우스 A·B", 22, y0 + 28, { s: 12, c: SC.mute, w: "800" });
      SK.t(ctx, "궤도 장반경 a = 19.8 AU", 22, y0 + 54, { s: 13, w: "700" });
      SK.t(ctx, "공전 주기 P = 50.1 년", 22, y0 + 78, { s: 13, w: "700" });
      SK.pill(ctx, "M₁ + M₂ = a³ / P²", 22, y0 + 116, { s: 14, c: SC.blue });
      SK.t(ctx, "= 19.8³ / 50.1² = " + TRUE_SUM.toFixed(2), 22, y0 + 146, { s: 12.5, c: SC.mute, w: "700" });
      var rx = 280;
      var r1 = SK.pill(ctx, "질량 합 " + msum.toFixed(1) + " M☉", rx, y0 + 44, { s: 14, c: okA ? SC.green : SC.ink });
      SK.t(ctx, okA ? "✅ 관측과 맞습니다" : "아직 맞지 않습니다", r1.x + r1.w + 10, y0 + 42, { s: 12.5, w: "800", c: okA ? SC.green : SC.red });
      var r2 = SK.pill(ctx, "질량 중심 " + cm + "%", rx, y0 + 80, { s: 14, c: okB ? SC.green : SC.ink });
      SK.t(ctx, okB ? "✅ A가 B의 약 2배 무겁습니다" : "관측된 흔들림 폭과 맞춰 보세요", r2.x + r2.w + 10, y0 + 78, { s: 12.5, w: "800", c: okB ? SC.green : SC.red });
      if (okA && okB) SK.pill(ctx, "A = " + mA.toFixed(2) + " M☉  ·  B = " + mB.toFixed(2) + " M☉", rx, y0 + 120, { s: 14, c: SC.violet });
      else SK.t(ctx, "두 조건을 모두 맞추면 각 별의 질량이 나옵니다", rx, y0 + 118, { s: 12, c: SC.mute, w: "600" });
      lever(676, y0 + 26, f, mA, mB);
      SK.t(ctx, "질량 × 질량 중심까지의 거리는 양쪽이 같습니다 (지렛대 원리)", 280, H - 14, { s: 11, c: SC.mute, w: "600" });
    }
    function draw() {
      paint();
      var f = cm / 100, mA = msum * (1 - f), mB = msum * f;
      var okA = Math.abs(msum - TRUE_SUM) <= 0.12, okB = Math.abs(cm - TRUE_CM) <= 1.5;

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
    SK.animate(canvas, function (dt) { if (bplay.on) { phi += dt * 2 * Math.PI / 7000; paint(); } });
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
      ctx.clearRect(0, 0, W, H);
      var L = Math.pow(m, 3.5), lgm = Math.log(m) / Math.LN10, LW = 610;
      var Ltxt = L >= 100 ? Math.round(L).toLocaleString() : L.toFixed(L < 1 ? 3 : 1);
      var ch = false;
      if (Math.abs(L - 100) <= 5 && !got.a) { got.a = ch = true; }
      if (L <= 0.1 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("cML", got); mission(); }
      studio(ctx, 0, 0, LW, H);
      big2(ctx, "질량 " + m.toFixed(1) + " M☉ → 광도 " + Ltxt + " L☉", "주계열성: 질량이 2배면 광도는 약 11배", 18, 44);
      var YL = ["0.0001", "0.001", "0.01", "0.1", "1", "10", "100", "1,000", "1만", "10만"];
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: -1, x1: 1.5, y0: -4, y1: 5, xt: 5, yt: 9, light: true,
        xf: function (q) { return Math.abs(q - Math.round(q)) < 1e-6 ? ["0.1", "1", "10"][Math.round(q) + 1] || "" : ""; },
        yf: function (q) { return YL[Math.round(q) + 4] || ""; }, xl: "질량 (태양 = 1) →", yl: "광도 (태양 = 1)" });
      var pts = [];
      for (var k = 0; k <= 100; k++) { var lm = -1 + 2.3 * k / 100; pts.push([lm, 3.5 * lm]); }
      SK.plot(ctx, g, pts, LT.blue, { w: 3, light: true });
      for (var q = -1; q <= 1.31; q += 0.115) orb(ctx, g.X(q), g.Y(3.5 * q), 3.4, tRGB(5800 * Math.pow(10, q * .55)));
      SK.pill(ctx, "L ∝ M³·⁵ (주계열성)", g.X(0.15), g.Y(3.4), { s: 12.5, c: SC.blue });
      orb(ctx, g.X(0), g.Y(0), 6, [255, 196, 70], { glow: 1 });
      SK.pill(ctx, "태양", g.X(0) + 16, g.Y(0) + 18, { s: 11, c: SC.yellow });
      if (got.c) {
        var sbx = g.X(Math.log(SB_M) / Math.LN10), sby = g.Y(Math.log(SB_L) / Math.LN10);
        SK.line(ctx, { x: sbx, y: sby }, { x: sbx, y: g.Y(3.5 * Math.log(SB_M) / Math.LN10) }, LT.red, 2, [4, 4]);
        orb(ctx, sbx, sby, 6, [240, 90, 110], { glow: 1 });
        SK.pill(ctx, "시리우스 B (실제 관측) — 선에서 한참 아래", sbx + 14, sby + 5, { s: 11.5, c: SC.red, box: [g.L, g.R] });
      }
      var px = g.X(lgm), py = g.Y(3.5 * lgm);
      SK.line(ctx, { x: px, y: py }, { x: px, y: g.B }, "rgba(112,72,232,.55)", 1.4, [3, 4]);
      SK.line(ctx, { x: g.L, y: py }, { x: px, y: py }, "rgba(112,72,232,.55)", 1.4, [3, 4]);
      orb(ctx, px, py, 7.5, tRGB(5800 * Math.pow(m, .55)), { glow: .9 });
      ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(px, py, 13, 0, 6.2832); ctx.stroke();

      /* 오른쪽 카드: 태양과 내 별을 나란히 */
      var CX = LW + 10, x0 = CX + 18, CW = W - CX, fy = 186;
      SK.card(ctx, CX, 0, CW, H, "태양과 견주기");
      var rS = 16, rM = clamp(16 * Math.pow(m, 0.8), 5, 46), cM = tRGB(5800 * Math.pow(m, .55));
      SK.line(ctx, { x: x0, y: fy }, { x: W - 18, y: fy }, "rgba(20,40,90,.18)", 1.2);
      orb(ctx, CX + 62, fy - rS, rS, [255, 196, 70], { floor: fy, glow: .6 });
      orb(ctx, CX + 186, fy - rM, rM, cM, { floor: fy, glow: clamp(.3 + .22 * Math.log(L + 1) / Math.LN10, .3, 1.6) });
      SK.t(ctx, "태양", CX + 62, fy + 20, { s: 12, a: "center", w: "800", c: LT.mute });
      SK.t(ctx, "내 별", CX + 186, fy + 20, { s: 12, a: "center", w: "800", c: LT.violet });
      cnote(ctx, "공 크기 = 어림한 반지름 (R ∝ M^0.8)", x0, fy + 42);
      SK.row(ctx, "질량", m.toFixed(1) + " M☉", x0, W - 18, 258);
      SK.row(ctx, "광도", Ltxt + " L☉", x0, W - 18, 284, LT.violet);
      [[got.a, "광도 100 L☉ 별 찾기"], [got.b, "광도 0.1 L☉ 이하 별 찾기"], [got.c, "시리우스 B와 견주기"]].forEach(function (q2, i) {
        SK.t(ctx, (q2[0] ? "✓ " : "○ ") + q2[1], x0, 318 + i * 19, { s: 11.5, w: "800", c: q2[0] ? LT.green : LT.dim });
      });
      SK.tip(ctx, got.c ? "시리우스 B는 선 아래 → 백색왜성" : "1.0 M☉에서 시리우스 B와 견주기", x0 - 6, H - 44, CW - 24, got.c ? true : null);
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

    var pu = 0.1, pplay = playWire("d-play", !SK.REDUCE, ["맥동 멈추기", "맥동 보기"]);
    function relAt(P, ph) { return P < 80 ? (ph < 0.25 ? ph / 0.25 : 1 - (ph - 0.25) / 0.75) : (0.5 + 0.5 * Math.cos(2 * Math.PI * (ph - 0.15))); }
    var IP = SK.iso({ ox: 754, oy: 100, s: .5, L: 180, D: 180 }), PZ = 150;
    function paint() {
      var P = per(i0), KN = kind(P), A = amp(P), cep = P >= 1.2 && P < 80;
      var col = P < 1.2 ? LT.blue : (cep ? LT.green : LT.orange), T0 = P < 1.2 ? 7000 : (cep ? 6000 : 3000);
      var Ptxt = (P < 10 ? P.toFixed(2) : Math.round(P).toLocaleString()), Mv = -2.81 * (Math.log(P) / Math.LN10) - 1.43;
      ctx.clearRect(0, 0, W, H);
      var LW = 600;
      studio(ctx, 0, 0, W, H, caseFloor(IP));
      big2(ctx, "주기 " + Ptxt + "일 · " + KN, cep ? "주기-광도 관계 → 절대 등급 M = " + Mv.toFixed(2) : "변광 폭 약 " + A.toFixed(1) + " 등급", 18, 44);
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: 0, x1: 3, y0: 0, y1: 1, xt: 3, yt: 2, light: true,
        xf: function (q) { return q === 0 ? "0" : Math.round(q) + "주기"; }, yf: function () { return ""; }, xl: "시간 →" });
      SK.t(ctx, "밝다", g.L - 6, g.T + 12, { s: 11, a: "right", c: LT.mute, w: "800" });
      SK.t(ctx, "어둡다", g.L - 6, g.B - 2, { s: 11, a: "right", c: LT.mute, w: "800" });
      var pts = [];
      for (var k = 0; k <= 300; k++) { var u = k / 300 * 3; pts.push([u, 0.15 + 0.7 * relAt(P, u % 1)]); }
      ctx.beginPath(); ctx.moveTo(g.X(0), g.B); pts.forEach(function (p) { ctx.lineTo(g.X(p[0]), g.Y(p[1])); }); ctx.lineTo(g.X(3), g.B); ctx.closePath();
      ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = col; ctx.fill(); ctx.restore();
      SK.plot(ctx, g, pts, col, { w: 3, light: true });
      var rel = relAt(P, pu % 1), cx0 = g.X(pu), cy0 = g.Y(0.15 + 0.7 * rel);
      SK.line(ctx, { x: cx0, y: g.T }, { x: cx0, y: g.B }, "rgba(20,40,90,.3)", 1.2, [3, 4]);
      orb(ctx, cx0, cy0, 6, tRGB(T0), { glow: .8 });
      /* 오른쪽 위: 우주 진열장 안에서 부풀었다 줄어드는 별 */
      var I = IP, Pc = I.P(90, 90, 70), sx = Pc.x, sy = Pc.y, R0 = 24;
      spaceCase(ctx, I, PZ, 47, { grid: 30 });
      var rr = R0 * (1 - (P < 80 ? .12 : .2) * Math.cos(2 * Math.PI * (pu % 1))), T = T0 * (1 + 0.12 * (rel - 0.5));
      var c3 = tRGB(T), hg = ctx.createRadialGradient(sx, sy, rr * .6, sx, sy, rr * (1.7 + 1.2 * rel));
      hg.addColorStop(0, rgba(c3, .25 + .35 * rel)); hg.addColorStop(1, rgba(c3, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx, sy, rr * (1.7 + 1.2 * rel), 0, 6.2832); ctx.fill();
      var bg = ctx.createRadialGradient(sx - rr * .3, sy - rr * .3, rr * .1, sx, sy, rr);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(.35, rgba(c3, 1)); bg.addColorStop(1, rgba([c3[0] * .55, c3[1] * .45, c3[2] * .4].map(Math.round), 1));
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(sx, sy, R0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      caseGlass(ctx, I, PZ);
      /* 판정 카드 */
      var CX = 612, CY = 214, x0 = CX + 18;
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, "판정 · 점선 = 평균 크기");
      cval(ctx, KN, x0, CY + 62, col, 20);
      SK.row(ctx, "주기", Ptxt + "일", x0, W - 26, CY + 92);
      SK.row(ctx, "변광 폭", "약 " + A.toFixed(1) + " 등급", x0, W - 26, CY + 116);
      SK.row(ctx, "절대 등급 M", cep ? Mv.toFixed(2) : "주기-광도 관계 밖", x0, W - 26, CY + 140, cep ? LT.green : LT.dim);
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0), 3, x0 - 6, CY + 152, W - CX - 32, "세 무리를 모두 찾았습니다", "RR형·세페이드·미라형");
    }
    function draw() {
      var P = per(i0), K = kind(P), A = amp(P);
      var ch = false;
      if (P < 1.0 && !got.a) { got.a = ch = true; }
      if (P >= 3 && P <= 50 && !got.b) { got.b = ch = true; }
      if (P >= 100 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("dPuls", got); mission(); }
      paint();
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
    SK.animate(canvas, function (dt) { if (pplay.on) { pu = (pu + dt / 1600) % 3; paint(); } });
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

    var bu = 0.05, bplay2 = playWire("d-bplay", !SK.REDUCE, ["시간 멈추기", "시간 흘려보내기"]);
    function relB(u) { return u < 0.12 ? 0.02 : (u < 0.18 ? (u - 0.12) / 0.06 : Math.exp(-(u - 0.18) * (dm >= 15 ? 3.0 : 6.0))); }
    var IB = SK.iso({ ox: 754, oy: 100, s: .5, L: 180, D: 180 }), BZ = 150;
    function paint() {
      var ratio = Math.pow(10, 0.4 * dm), col = dm >= 15 ? LT.red : (dm >= 8 ? LT.orange : LT.yellow);
      var rTxt = ratio >= 1e8 ? (ratio / 1e8).toFixed(1) + "억 배" : (ratio >= 1e4 ? Math.round(ratio / 1e4) + "만 배" : Math.round(ratio) + "배");
      var kindTxt = dm >= 15 ? "초신성 수준" : (dm >= 8 ? "신성 수준" : "작은 밝기 변화");
      ctx.clearRect(0, 0, W, H);
      var LW = 600;
      studio(ctx, 0, 0, W, H, caseFloor(IB));
      big2(ctx, "등급 차 " + dm.toFixed(1) + " → 밝기 " + rTxt, kindTxt + " · 한 번 치솟고 천천히 사그라진다", 18, 44);
      var g = SK.chart(ctx, { x: 8, y: 96, w: LW - 16, h: H - 104, x0: 0, x1: 1, y0: 0, y1: 1, xt: 4, yt: 2, light: true,
        xf: function () { return ""; }, yf: function () { return ""; }, xl: "시간 →" });
      SK.t(ctx, "밝다", g.L - 6, g.T + 12, { s: 11, a: "right", c: LT.mute, w: "800" });
      SK.t(ctx, "어둡다", g.L - 6, g.B - 2, { s: 11, a: "right", c: LT.mute, w: "800" });
      var pts = [];
      for (var k = 0; k <= 300; k++) { var u = k / 300; pts.push([u, 0.08 + 0.85 * clamp(relB(u), 0.02, 1)]); }
      ctx.beginPath(); ctx.moveTo(g.X(0), g.B); pts.forEach(function (p) { ctx.lineTo(g.X(p[0]), g.Y(p[1])); }); ctx.lineTo(g.X(1), g.B); ctx.closePath();
      ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = col; ctx.fill(); ctx.restore();
      SK.plot(ctx, g, pts, col, { w: 3, light: true });
      var rel = clamp(relB(bu), 0.02, 1), cx0 = g.X(bu), cy0 = g.Y(0.08 + 0.85 * rel);
      SK.line(ctx, { x: cx0, y: g.T }, { x: cx0, y: g.B }, "rgba(20,40,90,.3)", 1.2, [3, 4]);
      orb(ctx, cx0, cy0, 6, [255, 200, 150], { glow: .8 });
      SK.t(ctx, "등급이 5 차이 나면 밝기는 100배", g.R - 6, g.T + 16, { s: 11.5, a: "right", c: LT.mute, w: "800" });
      /* 오른쪽 위: 우주 진열장 — 그때 별에서는 */
      var I = IB, Pc = I.P(90, 90, 70), sx = Pc.x, sy = Pc.y;
      spaceCase(ctx, I, BZ, 59, { grid: 30 });
      var amp2 = clamp(dm / 20, 0.15, 1), boost = rel * amp2;
      if (dm >= 15) {
        if (bu > 0.15) {
          var sr = 10 + (bu - 0.15) * 90, sh = ctx.createRadialGradient(sx, sy, sr * .7, sx, sy, sr);
          sh.addColorStop(0, "rgba(255,120,110,0)"); sh.addColorStop(.85, "rgba(255,150,120," + (0.55 * (1 - bu * .6)) + ")"); sh.addColorStop(1, "rgba(255,150,120,0)");
          ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.fill();
        }
        SK.glow(ctx, sx, sy, 4 + 12 * boost, "rgba(255,230,210,.95)", 4);
      } else if (dm >= 8) {
        var cpx = sx + 34, wdx = sx - 30;
        starT(ctx, cpx, sy, 14, 4200, 2.2);
        ctx.save(); ctx.strokeStyle = "rgba(255,190,140,.75)"; ctx.lineWidth = 3; ctx.shadowColor = "rgba(255,170,120,.9)"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(cpx - 12, sy - 3); ctx.quadraticCurveTo(sx, sy - 16, wdx + 6, sy - 4); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = "rgba(255,210,170,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(wdx, sy, 12, 4, 0, 0, 6.2832); ctx.stroke();
        SK.glow(ctx, wdx, sy, 2.4 + 9 * boost, "rgba(220,235,255,.98)", 4);
      } else {
        starT(ctx, sx, sy, 6 + 5 * boost, 6000, 4);
      }
      caseGlass(ctx, I, BZ);
      if (dm >= 8 && dm < 15) {
        SK.pill(ctx, "백색왜성", sx - 30, sy + 34, { s: 10.5, a: "center", c: SC.blue, box: [612, W] });
        SK.pill(ctx, "동반성", sx + 40, sy + 34, { s: 10.5, a: "center", c: SC.orange, box: [612, W] });
      }
      /* 판정 카드 */
      var CX = 612, CY = 214, x0 = CX + 18;
      SK.card(ctx, CX, CY, W - CX - 8, H - CY - 8, "판정 · 그때 별에서는");
      cval(ctx, kindTxt, x0, CY + 62, col, 20);
      SK.row(ctx, "등급 차", dm.toFixed(1) + " 등급", x0, W - 26, CY + 92);
      SK.row(ctx, "밝기 비", rTxt, x0, W - 26, CY + 116, LT.blue);
      cnote(ctx, dm >= 15 ? "별 전체가 터진다 (되풀이 없음)" : (dm >= 8 ? "쌓인 물질이 표면에서 폭발" : "밝기비 = 10^(0.4 × 등급 차)"), x0, CY + 140);
      progTip(ctx, (got.a ? 1 : 0) + (got.b ? 1 : 0) + (got.c ? 1 : 0), 3, x0 - 6, CY + 152, W - CX - 32, "신성·초신성을 모두 구별", "신성·초신성·분류");
    }
    function draw() {
      var ch = false;
      if (Math.abs(dm - 10) <= 0.5 && !got.a) { got.a = ch = true; }
      if (Math.abs(dm - 20) <= 0.5 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("dBurst", got); mission(); }
      paint();
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
    SK.animate(canvas, function (dt) { if (bplay2.on) { bu += dt / 5200; if (bu > 1) bu = 0; paint(); } });
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

    function galaxy(cx, cy, s) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.35); ctx.scale(1, 0.46);
      var dg = ctx.createRadialGradient(0, 0, 4, 0, 0, 105 * s);
      dg.addColorStop(0, "rgba(255,240,215,.95)"); dg.addColorStop(.18, "rgba(240,215,255,.55)"); dg.addColorStop(.6, "rgba(150,140,255,.18)"); dg.addColorStop(1, "rgba(120,120,255,0)");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, 105 * s, 0, 6.2832); ctx.fill();
      for (var arm = 0; arm < 2; arm++) {
        for (var th = 0; th < 5.6; th += 0.06) {
          var r = 12 * s * Math.exp(0.3 * th), a = th + arm * Math.PI, al = .5 * (1 - th / 6.2);
          var ag = ctx.createRadialGradient(r * Math.cos(a), r * Math.sin(a), 0, r * Math.cos(a), r * Math.sin(a), 9 * s);
          ag.addColorStop(0, "rgba(200,210,255," + al + ")"); ag.addColorStop(1, "rgba(160,170,255,0)");
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(r * Math.cos(a), r * Math.sin(a), 9 * s, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      SK.glow(ctx, cx, cy, 10 * s, "rgba(255,236,200,.9)", 3);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var G = GAL[g], d = dist(i0), mc = mCalc(d), diff = mc - G.m, ok = Math.abs(diff) <= 0.06;
      var LW = 360, sc = G.m < 15 ? 1 : 0.6, dTxt = (d < 10 ? d.toFixed(2) : Math.round(d).toLocaleString()) + " Mpc";
      if (ok && !got[g]) { got[g] = true; window.sthState("dCand", got); mission(); }
      studio(ctx, 0, 0, W, H);
      big2(ctx, ok ? G.n + "까지 약 " + Math.round(d).toLocaleString() + " Mpc" : "표준 촛불로 거리 재기", "관측 m = " + G.m.toFixed(2) + " · M = −19.3", 18, 44, "#ffffff", ok ? "#7dffc4" : "#ffd35a");
      /* 사진 인화지 미니어처 */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = "#fbfbf7";
      ctx.beginPath(); ctx.roundRect(26, 100, LW - 52, H - 116, 8); ctx.fill(); ctx.restore();
      SK.stage(ctx, 38, 112, LW - 76, H - 168, "space", { seed: 67, r: 4 });
      var gcx = 180, gcy = 232;
      galaxy(gcx, gcy, sc);
      var snx = gcx + 58 * sc, sny = gcy - 26 * sc, sz = clamp(9 - (G.m - 13) * .7, 3, 9);
      SK.glow(ctx, snx, sny, sz, "rgba(255,250,230,.98)", 4.2); SK.spikes(ctx, snx, sny, sz * 3, .5);
      SK.line(ctx, { x: snx + 6, y: sny - 6 }, { x: snx + 36, y: sny - 50 }, "rgba(255,211,107,.7)", 1.2);
      SK.pill(ctx, "Ia형 초신성", snx + 36, sny - 56, { s: 11.5, a: "center", c: SC.yellow, box: [38, LW - 38] });
      SK.t(ctx, G.n + " · " + (G.m < 15 ? "가까운 은하 — 크고 밝게" : "먼 은하 — 작고 어둡게"), LW / 2, H - 30, { s: 11.5, a: "center", c: LT.mute, w: "800" });
      /* 오른쪽 흰 카드: 등급 자 */
      var CX = LW + 12, x0 = CX + 34, x1 = W - 34, y = 172;
      SK.card(ctx, CX, 0, W - CX, H, "Ia형 초신성은 최대 절대 등급이 늘 약 −19.3");
      cval(ctx, ok ? "✓ 이 거리가 답" : (diff > 0 ? "너무 멀게 놓았습니다" : "너무 가깝게 놓았습니다"), CX + 18, 76, ok ? LT.green : LT.red, 20);
      function X(mag) { return x0 + (mag - 10) / 14 * (x1 - x0); }
      var bar = ctx.createLinearGradient(x0, 0, x1, 0); bar.addColorStop(0, "#fff3c4"); bar.addColorStop(.4, "#a9b3d6"); bar.addColorStop(1, "#28305a");
      ctx.fillStyle = bar; ctx.beginPath(); ctx.roundRect(x0, y - 6, x1 - x0, 12, 6); ctx.fill();
      for (var q = 10; q <= 24; q += 2) SK.t(ctx, String(q), X(q), y + 24, { s: 10.5, c: LT.mute, a: "center", w: "700" });
      SK.t(ctx, "← 밝다     겉보기 등급     어둡다 →", (x0 + x1) / 2, y + 44, { s: 11, a: "center", c: LT.mute, w: "700" });
      var ox = X(G.m);
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(ox, y, 10, 0, 6.2832); ctx.stroke();
      SK.pill(ctx, "관측값", ox, y - 20, { s: 11.5, a: "center", c: SC.orange, box: [CX, W] });
      var cxp = clamp(X(mc), x0 - 4, x1 + 4);
      orb(ctx, cxp, y, 6, ok ? [15, 159, 118] : [28, 126, 214]);
      SK.line(ctx, { x: cxp, y: y + 8 }, { x: cxp, y: y + 58 }, ok ? "rgba(15,159,118,.6)" : "rgba(28,126,214,.6)", 1.4, [3, 3]);
      SK.pill(ctx, "내 계산값", cxp, y + 74, { s: 11.5, a: "center", c: ok ? SC.green : SC.blue, box: [CX, W] });
      SK.row(ctx, "내가 놓아 본 거리", dTxt, CX + 18, W - 24, 294, LT.ink);
      SK.row(ctx, "이 거리라면 보일 겉보기 등급", mc.toFixed(2), CX + 18, W - 24, 320, ok ? LT.green : LT.blue);
      SK.row(ctx, "거리 지수 m − M", (mc + 19.3).toFixed(2), CX + 18, W - 24, 346);
      progTip(ctx, (got[0] ? 1 : 0) + (got[1] ? 1 : 0), 2, CX + 12, 360, W - CX - 30, "두 은하 거리를 모두 쟀습니다", "은하 가·나 거리 재기");
      cnote(ctx, "1 Mpc = 100만 pc = 약 326만 광년", CX + 18, H - 12);
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
