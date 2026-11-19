(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function stepOf(track) {
    var slide = track.querySelector(".slide");
    if (!slide) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- build media (images as backgrounds, videos as protected <video>) ---------- */
  document.querySelectorAll(".media[data-src]").forEach(function (el) {
    el.style.backgroundImage = "url('" + el.getAttribute("data-src") + "')";
  });

  var videos = [];
  document.querySelectorAll(".media--video").forEach(function (el) {
    el.style.backgroundImage = "url('" + el.getAttribute("data-poster") + "')";

    var v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.preload = "metadata";
    v.setAttribute("loop", "");
    v.setAttribute("autoplay", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    v.setAttribute("disablePictureInPicture", "");
    v.setAttribute("disableRemotePlayback", "");
    v.setAttribute("aria-label", el.getAttribute("aria-label") || "Video");
    v.controls = false;
    v.src = el.getAttribute("data-video");
    // if the file isn't there yet, quietly keep showing the poster
    v.addEventListener("error", function () { v.remove(); });
    el.appendChild(v);
    videos.push(v);
  });

  /* videos loop and autoplay (muted) while they are on screen */
  function kick(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var visible = new Set();
  function playVisible() { visible.forEach(kick); }
  videos.forEach(function (v) {
    v.addEventListener("ended", function () { v.currentTime = 0; if (visible.has(v)) kick(v); });   // belt and braces for looping
    v.addEventListener("canplay", function () { if (visible.has(v)) kick(v); });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio > 0.4) { visible.add(v); kick(v); }
        else { visible.delete(v); v.pause(); }
      });
    }, { threshold: [0, 0.4, 1] });
    videos.forEach(function (v) { io.observe(v); });
  } else { videos.forEach(function (v) { visible.add(v); }); }
  // some phones (low-power mode) block autoplay until the first touch
  ["touchstart", "pointerdown", "scroll"].forEach(function (t) {
    window.addEventListener(t, playVisible, { once: true, passive: true });
  });

  /* ---------- swipe galleries: touch swipe + mouse drag, no arrows ---------- */
  document.querySelectorAll("[data-swipe]").forEach(function (track) {
    var startX = 0, startLeft = 0, down = false, moved = false;

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return; // touch uses native swipe
      down = true; moved = false;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("is-dragging");
    });

    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    });

    function end() {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      // re-snap to the nearest slide
      var w = stepOf(track);
      if (w) {
        var target = Math.round(track.scrollLeft / w) * w;
        track.scrollTo({ left: target, behavior: "smooth" });
      }
    }
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);

    // keyboard: left/right arrow keys move one slide (accessibility)
    track.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var w = stepOf(track);
      if (!w) return;
      track.scrollBy({ left: e.key === "ArrowRight" ? w : -w, behavior: "smooth" });
      e.preventDefault();
    });
  });

  /* ---------- curriculum flipbooks: swipe the carousel, tap a card to open it ---------- */
  var books = Array.prototype.slice.call(document.querySelectorAll(".book"));
  function setBook(book, on) {
    book.classList.toggle("is-active", on);
    var done = book.querySelector(".book__done");
    if (done) done.hidden = !on;
  }
  books.forEach(function (book) {
    var cover = book.querySelector(".book__cover");
    var done = book.querySelector(".book__done");
    var downX = 0, downY = 0;
    cover.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
    cover.addEventListener("click", function (e) {
      // ignore the click that ends a swipe/drag
      if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8) return;
      books.forEach(function (b) { setBook(b, false); });
      setBook(book, true);
    });
    done.addEventListener("click", function () { setBook(book, false); });
  });

  /* ---------- social posts: tap a cover to open its pictures and videos ---------- */
  var viewer = document.getElementById("viewer");
  var vtrack = viewer.querySelector(".viewer__track");
  var vdots = viewer.querySelector(".viewer__dots");
  var vsound = viewer.querySelector(".viewer__sound");
  var soundOn = false, lastFocus = null;

  function makeVideo(src, label) {
    var v = document.createElement("video");
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = "auto"; v.controls = false;
    v.setAttribute("loop", "");
    v.addEventListener("ended", function () { v.currentTime = 0; v.play().catch(function () {}); });
    v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
    v.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    v.setAttribute("disablePictureInPicture", ""); v.setAttribute("disableRemotePlayback", "");
    v.setAttribute("aria-label", label);
    v.src = src;
    v.addEventListener("error", function () { v.remove(); });   // keep the poster if the file is missing
    return v;
  }

  // play the video on the page being shown (muted autoplay), pause every other one
  function playCurrent(idx) {
    var slides = vtrack.querySelectorAll(".slide");
    var hasVideo = false;
    Array.prototype.forEach.call(slides, function (sl, i) {
      var v = sl.querySelector("video");
      if (!v) return;
      if (i === idx) {
        hasVideo = true;
        v.muted = !soundOn;
        try { v.currentTime = 0; } catch (e) {}
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else { v.pause(); }
    });
    vsound.hidden = !hasVideo;
    vsound.textContent = soundOn ? "Sound on" : "Sound off";
  }

  function setDots(idx) {
    Array.prototype.forEach.call(vdots.children, function (d, i) { d.classList.toggle("is-active", i === idx); });
  }

  function openPost(btn) {
    var li = btn.closest("li");
    var items = li.querySelectorAll(".post__slides [data-src]");
    var title = btn.getAttribute("data-title") || "Post";
    var parts = (btn.getAttribute("data-ratio") || "4 / 5").split("/");
    var r = parseFloat(parts[0]) / parseFloat(parts[1] || 1);
    viewer.style.setProperty("--ratio", btn.getAttribute("data-ratio") || "4 / 5");
    viewer.style.setProperty("--r", r);

    vtrack.innerHTML = ""; vdots.innerHTML = "";
    Array.prototype.forEach.call(items, function (it, i) {
      var type = it.getAttribute("data-type") || "image";
      var li2 = document.createElement("li"); li2.className = "slide";
      var m = document.createElement("div"); m.className = "media"; m.setAttribute("role", "img");
      m.setAttribute("aria-label", title + ", " + (i + 1) + " of " + items.length);
      var bg = type === "video" ? it.getAttribute("data-poster") : it.getAttribute("data-src");
      if (bg) m.style.backgroundImage = "url('" + bg + "')";
      if (type === "video") m.appendChild(makeVideo(it.getAttribute("data-src"), title + " video"));
      li2.appendChild(m); vtrack.appendChild(li2);
      vdots.appendChild(document.createElement("span"));
    });
    vdots.hidden = items.length < 2;
    vIdx = 0; setDots(0);

    lastFocus = document.activeElement;
    viewer.hidden = false;
    vtrack.scrollLeft = 0;
    document.body.classList.add("no-scroll");
    vtrack.focus({ preventScroll: true });
    playCurrent(0);
  }

  function closeViewer() {
    if (viewer.hidden) return;
    Array.prototype.forEach.call(vtrack.querySelectorAll("video"), function (v) { v.pause(); });
    viewer.hidden = true;
    vtrack.innerHTML = ""; vdots.innerHTML = "";
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  var vIdx = 0;
  vtrack.addEventListener("scroll", function () {
    var idx = Math.round(vtrack.scrollLeft / (vtrack.clientWidth || 1));
    if (idx !== vIdx) { vIdx = idx; setDots(idx); playCurrent(idx); }
  }, { passive: true });
  vsound.addEventListener("click", function () { soundOn = !soundOn; playCurrent(currentIndex()); });
  function currentIndex() {
    var a = vdots.querySelector(".is-active");
    return a ? Array.prototype.indexOf.call(vdots.children, a) : 0;
  }
  viewer.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeViewer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeViewer(); });

  document.querySelectorAll(".post").forEach(function (btn) {
    var downX = 0, downY = 0;
    btn.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
    btn.addEventListener("click", function (e) {
      if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8) return;   // that was a swipe, not a tap
      openPost(btn);
    });
  });

  /* ---------- card rows: wrap in a stage and add position dots under the row ---------- */
  document.querySelectorAll(".track--cards").forEach(function (track) {
    var count = track.querySelectorAll(".slide").length;
    var stage = document.createElement("div");
    stage.className = "stage";
    track.parentNode.insertBefore(stage, track);
    stage.appendChild(track);
    var wrap = document.createElement("div");
    wrap.className = "dots"; wrap.setAttribute("aria-hidden", "true");
    for (var i = 0; i < count; i++) wrap.appendChild(document.createElement("span"));
    stage.appendChild(wrap);
    function sync() {
      var w = stepOf(track) || 1;
      var idx = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / w)));
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) idx = count - 1;   // reached the end
      Array.prototype.forEach.call(wrap.children, function (d, k) { d.classList.toggle("is-active", k === idx); });
    }
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  });

  /* ---------- download deterrents ----------
     These stop casual saving (right-click, drag, long-press, Ctrl+S on media).
     They cannot stop someone determined: anything a browser can display can be
     captured. See README.md for stronger options (watermarks, low-res previews,
     streaming hosts for video). */
  function block(e) {
    if (e.target.closest && e.target.closest(".media, .hero__img")) e.preventDefault();
  }
  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);
  document.addEventListener("selectstart", block);

  document.addEventListener("keydown", function (e) {
    var key = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "u")) e.preventDefault();
  });
})();
