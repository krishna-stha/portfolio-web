(function () {
  "use strict";

  /* ---------- ICONS ---------- */
  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.9 5.3.9 11.6c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.1 5.3 18.3.5 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8.3 18.4H5.7V9.6h2.6v8.8zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11.4 9.9h-2.6v-4.3c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.4-.1.7v4.3h-2.6s.1-7.1 0-8.8h2.6v1.2c.3-.5 1-1.3 2.4-1.3 1.7 0 3 1.1 3 3.5v4.4z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H21l-6.6 7.5L22.2 21h-6.8l-5.3-6.9L4 21H1.9l7.1-8.1L1 3h6.9l4.8 6.3L18.9 3zm-1.2 16h1.9L7.4 5h-2l12.3 14z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="1"/><path d="M2 6l10 7 10-7"/></svg>',
    kaggle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.8 20.8h-3.4a.6.6 0 0 1-.5-.2l-5-6.2-1.5 1.4v4.4a.5.5 0 0 1-.5.5H5.4a.5.5 0 0 1-.5-.5V3.5a.5.5 0 0 1 .5-.5h2.5a.5.5 0 0 1 .5.5v11l5.8-5.9a.7.7 0 0 1 .5-.2H18a.4.4 0 0 1 .3.7l-6 5.8 6.7 8a.4.4 0 0 1-.2.7z"/></svg>',
    huggingface: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8.5 14c.8.8 1.9 1.3 3.5 1.3s2.7-.5 3.5-1.3"/></svg>',
    medium: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5l4.3 0 4.4 9.7L16 5.5h4.9v.4l-1.4 1.3c-.1.1-.2.3-.2.5v11.6c0 .2.1.4.2.5l1.4 1.3v.4h-6.9v-.4l1.4-1.4c.1-.1.2-.3.2-.5V8.9l-4.9 12.4h-.7L5.1 8.9v8.4c0 .3.1.6.4.9l1.9 2.3v.4H2v-.4l1.9-2.3c.2-.3.3-.5.3-.9V8c0-.3-.1-.6-.4-.9L2 5.9v-.4H3z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>'
  };
  const ARROW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H9M17 7v8"/></svg>';
  const CHEV_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';
  const CHEV_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
  const EXPAND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/></svg>';

  const STORAGE_DATA_KEY = "ks_portfolio_data";
  const STORAGE_THEME_KEY = "ks_theme";

  const DEFAULT_DATA = {
    brand: { logoUrl: "" },
    hero: {
      name: "Krishna Sharan Shrestha",
      role: "// AI & Machine Learning Enthusiast",
      tagline: "Exploring how machines learn, reason, and see — one model at a time.",
      cta1Label: "View my work", cta1Url: "#experience",
      cta2Label: "Get in touch", cta2Url: "#contact"
    },
    about: {
      initials: "KS", photoUrl: "", resumeUrl: "", resumeName: "",
      bio: "I'm Krishna — an AI and ML enthusiast who enjoys turning messy data into models that actually work. I like breaking down how things learn, and I'm always experimenting with something new.",
      tags: ["Machine Learning", "Deep Learning", "Computer Vision"]
    },
    skills: [], experience: [], education: [], projects: [], achievements: [], socials: []
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_DATA_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  function normalize(d) {
    const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return Object.assign(base, d, {
      brand: Object.assign({}, base.brand, d.brand || {}),
      hero: Object.assign({}, base.hero, d.hero || {}),
      about: Object.assign({}, base.about, d.about || {}),
      skills: Array.isArray(d.skills) ? d.skills : [],
      experience: Array.isArray(d.experience) ? d.experience : [],
      education: Array.isArray(d.education) ? d.education : [],
      projects: Array.isArray(d.projects) ? d.projects.map(normalizeProject) : [],
      achievements: Array.isArray(d.achievements) ? d.achievements.map(normalizeAchievement) : [],
      socials: Array.isArray(d.socials) ? d.socials : []
    });
  }
  function normalizeProject(p) {
    const imageUrls = Array.isArray(p.imageUrls) ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [];
    return Object.assign({ projectUrl: "" }, p, { imageUrls: imageUrls });
  }
  function normalizeAchievement(a) {
    const imageUrls = Array.isArray(a.imageUrls) ? a.imageUrls : a.imageUrl ? [a.imageUrl] : [];
    return Object.assign({ credentialUrl: "" }, a, { imageUrls: imageUrls });
  }

  let data = loadData();
  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }
  function safeHref(url) {
    if (!url) return "";
    const u = String(url).trim();
    if (!u) return "";
    if (u.startsWith("#") || u.startsWith("/")) return u;
    try {
      const parsed = new URL(u, "https://example.invalid");
      return ["http:", "https:", "mailto:", "tel:"].indexOf(parsed.protocol) !== -1 ? u : "";
    } catch (e) {
      return "";
    }
  }

  /* ---------- THEME ---------- */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    document.documentElement.setAttribute("data-theme", saved === "dark" || saved === "light" ? saved : "light");
  }
  initTheme();
  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_THEME_KEY, next);
    updateThemeIcon();
  }
  function updateThemeIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    document.getElementById("themeIcon").innerHTML = isLight
      ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>';
  }

  /* ---------- SMOOTH SCROLL ---------- */
  function smoothScrollTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    const navH = document.querySelector(".site-nav").offsetHeight;
    const top = target.getBoundingClientRect().top + window.pageYOffset - (navH - 2);
    window.scrollTo({ top: top, behavior: "smooth" });
  }
  function bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const hash = a.getAttribute("href");
        if (!hash || hash === "#" || !document.querySelector(hash)) return;
        e.preventDefault();
        smoothScrollTo(hash);
        document.getElementById("navLinksMobile").classList.remove("open");
      });
    });
  }

  /* ---------- REVEAL ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".section-head, .about-grid, .achievements-grid, .projects-grid, .contact-inner, .timeline-item, .skill-card");
    items.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    if (data.brand.logoUrl) {
      document.getElementById("navLogo").innerHTML = '<img src="' + data.brand.logoUrl + '" alt="Logo" class="nav-logo-img">';
    } else {
      document.getElementById("navLogo").innerHTML = '<span class="dot"></span>KS.';
    }

    const nameParts = data.hero.name.trim().split(" ");
    const last = nameParts.pop();
    const rest = nameParts.join(" ");
    document.getElementById("heroName").innerHTML = esc(rest) + (rest ? "<br>" : "") + '<span class="accent">' + esc(last) + "</span>";
    document.getElementById("heroRole").textContent = data.hero.role;
    document.getElementById("heroTagline").textContent = data.hero.tagline;
    const cta1 = document.getElementById("heroCtaPrimary");
    cta1.textContent = data.hero.cta1Label; cta1.setAttribute("href", safeHref(data.hero.cta1Url) || "#experience");
    const cta2 = document.getElementById("heroCtaSecondary");
    cta2.textContent = data.hero.cta2Label; cta2.setAttribute("href", safeHref(data.hero.cta2Url) || "#contact");

    document.getElementById("aboutInitials").textContent = data.about.initials;
    const photoImg = document.getElementById("aboutPhotoImg");
    const initialsSpan = document.getElementById("aboutInitials");
    if (data.about.photoUrl) { photoImg.src = data.about.photoUrl; photoImg.style.display = "block"; initialsSpan.style.display = "none"; }
    else { photoImg.style.display = "none"; initialsSpan.style.display = "block"; }
    document.getElementById("aboutBio").textContent = data.about.bio;
    document.getElementById("aboutTags").innerHTML = data.about.tags.map((t) => '<span class="tag">' + esc(t) + "</span>").join("");
    const resumeWrap = document.getElementById("aboutResumeWrap");
    if (data.about.resumeUrl) {
      resumeWrap.style.display = "block";
      const link = document.getElementById("aboutResumeLink");
      link.href = data.about.resumeUrl;
      if (data.about.resumeName) link.setAttribute("download", data.about.resumeName);
    } else { resumeWrap.style.display = "none"; }

    document.getElementById("skillsList").innerHTML = data.skills.length
      ? data.skills.map((s) => {
          const pct = { Beginner: 30, Intermediate: 55, Advanced: 80, Expert: 100 }[s.level] || 50;
          return '<div class="skill-card"><div class="skill-name">' + esc(s.name) + '</div><span class="skill-level-label">' + esc(s.level) +
            '</span><div class="skill-bar"><div class="skill-bar-fill" style="width:' + pct + '%"></div></div></div>';
        }).join("")
      : '<p class="empty-state">No languages or tools added yet — add some from the admin panel.</p>';

    document.getElementById("experienceList").innerHTML = data.experience.length
      ? data.experience.map((i) => timelineItem(i.period, i.role, i.company, i.description)).join("")
      : '<p class="empty-state">No experience added yet — add your first entry from the admin panel.</p>';
    document.getElementById("educationList").innerHTML = data.education.length
      ? data.education.map((i) => timelineItem(i.period, i.degree, i.institution, i.description)).join("")
      : '<p class="empty-state">No education added yet — add your first entry from the admin panel.</p>';

    renderProjects();
    renderAchievements();

    document.getElementById("socialsList").innerHTML = data.socials.length
      ? data.socials.map((i) => '<a class="social-item" href="' + esc(safeHref(i.url)) + '" target="_blank" rel="noopener noreferrer"><span class="s-label">' +
          esc(i.label) + "</span>" + (ICONS[i.icon] || ICONS.link) + "</a>").join("")
      : '<p class="empty-state">Add your social links from the admin panel.</p>';

    document.getElementById("footerName").textContent = data.hero.name;
    document.getElementById("footerCopyName").textContent = data.hero.name;
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  function timelineItem(period, role, org, desc) {
    return '<div class="timeline-item"><div class="timeline-period">' + esc(period) + '</div><div><div class="timeline-role">' +
      esc(role) + '</div><div class="timeline-org">' + esc(org) + '</div><p class="timeline-desc">' + esc(desc) + "</p></div></div>";
  }

  /* ---------- PROJECTS: inline carousel (distinct design from Achievements) ---------- */
  function renderProjects() {
    const el = document.getElementById("projectsList");
    if (!data.projects.length) {
      el.innerHTML = '<p class="empty-state">No projects added yet — add your first one from the admin panel.</p>';
      return;
    }
    el.innerHTML = data.projects.map((p, idx) => {
      const imgs = p.imageUrls || [];
      let carouselHtml = "";
      if (imgs.length) {
        carouselHtml =
          '<div class="project-carousel" data-project="' + idx + '">' +
            '<div class="project-carousel-track">' +
              imgs.map((src) => '<div class="project-carousel-slide"><img src="' + src + '" alt="' + esc(p.title) + '"></div>').join("") +
            "</div>" +
            (imgs.length > 1
              ? '<button class="project-carousel-nav prev" aria-label="Previous image">' + CHEV_LEFT + "</button>" +
                '<button class="project-carousel-nav next" aria-label="Next image">' + CHEV_RIGHT + "</button>" +
                '<div class="project-carousel-rail"><div class="project-carousel-rail-fill"></div></div>'
              : "") +
          "</div>";
      }
      return (
        '<div class="project-card">' + carouselHtml +
          '<div class="project-body">' +
            '<span class="project-year">' + esc(p.year) + "</span>" +
            '<div class="project-title">' + esc(p.title) + "</div>" +
            '<p class="project-desc">' + esc(p.description) + "</p>" +
            (p.projectUrl ? '<a class="project-link" href="' + esc(safeHref(p.projectUrl)) + '" target="_blank" rel="noopener noreferrer">View project ' + ARROW_ICON + "</a>" : "") +
          "</div>" +
        "</div>"
      );
    }).join("");

    el.querySelectorAll(".project-carousel").forEach((carouselEl) => {
      const idx = Number(carouselEl.getAttribute("data-project"));
      const count = (data.projects[idx].imageUrls || []).length;
      if (count < 2) return;
      let pos = 0;
      const track = carouselEl.querySelector(".project-carousel-track");
      const railFill = carouselEl.querySelector(".project-carousel-rail-fill");
      function update() {
        track.style.transform = "translateX(-" + pos * 100 + "%)";
        railFill.style.width = 100 / count + "%";
        railFill.style.left = (pos * 100) / count + "%";
      }
      railFill.style.position = "absolute"; railFill.style.top = "0";
      carouselEl.querySelector(".prev").addEventListener("click", () => { pos = (pos - 1 + count) % count; update(); });
      carouselEl.querySelector(".next").addEventListener("click", () => { pos = (pos + 1) % count; update(); });
      update();
    });
  }

  /* ---------- ACHIEVEMENTS: click-to-expand (manual FLIP) + carousel ---------- */
  let achievementCarouselState = { index: 0, images: [] };

  function renderAchievements() {
    const el = document.getElementById("achievementsList");
    if (!data.achievements.length) {
      el.innerHTML = '<p class="empty-state">No achievements added yet — add your first one from the admin panel.</p>';
      return;
    }
    el.innerHTML = data.achievements.map((a, idx) => {
      const cover = (a.imageUrls || [])[0];
      return (
        '<div class="achievement-card" data-achievement="' + idx + '" tabindex="0" role="button" aria-label="View details for ' + esc(a.title) + '">' +
          '<span class="achievement-expand-hint" aria-hidden="true">' + EXPAND_ICON + "</span>" +
          (cover ? '<img class="achievement-image" src="' + cover + '" alt="' + esc(a.title) + '">' : "") +
          '<span class="achievement-year">' + esc(a.year) + "</span>" +
          '<div class="achievement-title">' + esc(a.title) + "</div>" +
          '<p class="achievement-desc">' + esc(a.description) + "</p>" +
          (a.credentialUrl
            ? '<a class="achievement-credential" href="' + esc(safeHref(a.credentialUrl)) + '" target="_blank" rel="noopener noreferrer">View credential ' + ARROW_ICON + "</a>"
            : "") +
        "</div>"
      );
    }).join("");

    el.querySelectorAll(".achievement-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".achievement-credential")) return;
        openAchievement(Number(card.getAttribute("data-achievement")), card);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAchievement(Number(card.getAttribute("data-achievement")), card); }
      });
    });
  }

  function buildAchievementCarousel(images) {
    achievementCarouselState = { index: 0, images: images };
    const slot = document.getElementById("achievementCarouselSlot");
    if (!images.length) { slot.innerHTML = ""; return; }
    slot.innerHTML =
      '<div class="carousel">' +
        '<div class="carousel-track">' + images.map((src) => '<div class="carousel-slide"><img src="' + src + '" alt=""></div>').join("") + "</div>" +
        (images.length > 1
          ? '<button class="carousel-arrow prev" aria-label="Previous image">' + CHEV_LEFT + "</button>" +
            '<button class="carousel-arrow next" aria-label="Next image">' + CHEV_RIGHT + "</button>" +
            '<div class="carousel-dots">' + images.map((_, i) => '<button class="carousel-dot' + (i === 0 ? " active" : "") + '" data-dot="' + i + '" aria-label="Go to image ' + (i + 1) + '"></button>').join("") + "</div>"
          : "") +
      "</div>";

    const track = slot.querySelector(".carousel-track");
    function update() {
      track.style.transform = "translateX(-" + achievementCarouselState.index * 100 + "%)";
      slot.querySelectorAll(".carousel-dot").forEach((d, i) => d.classList.toggle("active", i === achievementCarouselState.index));
    }
    function go(delta) {
      achievementCarouselState.index = (achievementCarouselState.index + delta + images.length) % images.length;
      update();
    }
    if (images.length > 1) {
      slot.querySelector(".prev").addEventListener("click", () => go(-1));
      slot.querySelector(".next").addEventListener("click", () => go(1));
      slot.querySelectorAll(".carousel-dot").forEach((d) => d.addEventListener("click", () => { achievementCarouselState.index = Number(d.getAttribute("data-dot")); update(); }));

      let startX = null;
      const carouselEl = slot.querySelector(".carousel");
      carouselEl.addEventListener("pointerdown", (e) => { startX = e.clientX; });
      carouselEl.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX; startX = null;
        if (dx < -60) go(1); else if (dx > 60) go(-1);
      });
    }
  }

  let activeAchievementCard = null;

  function openAchievement(idx, cardEl) {
    const a = data.achievements[idx];
    activeAchievementCard = cardEl;
    const overlay = document.getElementById("achievementOverlay");
    const expanded = document.getElementById("achievementExpanded");

    document.getElementById("achievementExpYear").textContent = a.year;
    document.getElementById("achievementExpTitle").textContent = a.title;
    document.getElementById("achievementExpDesc").textContent = a.description;
    const credLink = document.getElementById("achievementExpCredential");
    if (a.credentialUrl) { credLink.style.display = "inline-flex"; credLink.href = safeHref(a.credentialUrl); }
    else { credLink.style.display = "none"; }
    buildAchievementCarousel(a.imageUrls || []);

    const startRect = cardEl.getBoundingClientRect();
    expanded.style.transition = "none";
    expanded.style.top = startRect.top + "px";
    expanded.style.left = startRect.left + "px";
    expanded.style.width = startRect.width + "px";
    expanded.style.height = startRect.height + "px";
    expanded.classList.add("animating");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    // Measure the target (final) size off-screen, then animate toward it.
    const targetWidth = Math.min(680, window.innerWidth - 48);
    expanded.style.visibility = "hidden";
    const probeTransition = expanded.style.transition;
    expanded.style.position = "fixed";
    expanded.style.left = "-9999px";
    expanded.style.top = "0px";
    expanded.style.width = targetWidth + "px";
    expanded.style.height = "auto";
    const naturalHeight = expanded.getBoundingClientRect().height;
    const targetHeight = Math.min(naturalHeight, window.innerHeight * 0.88);
    const targetTop = Math.max(12, (window.innerHeight - targetHeight) / 2);
    const targetLeft = (window.innerWidth - targetWidth) / 2;

    // Snap back to the starting rect, force a reflow, then transition to target.
    expanded.style.transition = "none";
    expanded.style.left = startRect.left + "px";
    expanded.style.top = startRect.top + "px";
    expanded.style.width = startRect.width + "px";
    expanded.style.height = startRect.height + "px";
    expanded.style.visibility = "visible";
    // eslint-disable-next-line no-unused-expressions
    expanded.offsetHeight;
    expanded.style.transition = "";

    requestAnimationFrame(() => {
      expanded.style.top = targetTop + "px";
      expanded.style.left = targetLeft + "px";
      expanded.style.width = targetWidth + "px";
      expanded.style.height = targetHeight + "px";
      expanded.classList.add("open");
    });

    function onKey(e) { if (e.key === "Escape") closeAchievement(); }
    document.addEventListener("keydown", onKey);
    expanded._onKey = onKey;
  }

  function closeAchievement() {
    const overlay = document.getElementById("achievementOverlay");
    const expanded = document.getElementById("achievementExpanded");
    if (!activeAchievementCard) return;
    const rect = activeAchievementCard.getBoundingClientRect();
    expanded.classList.remove("open");
    overlay.classList.remove("open");
    expanded.style.top = rect.top + "px";
    expanded.style.left = rect.left + "px";
    expanded.style.width = rect.width + "px";
    expanded.style.height = rect.height + "px";

    if (expanded._onKey) { document.removeEventListener("keydown", expanded._onKey); expanded._onKey = null; }

    setTimeout(() => {
      expanded.classList.remove("animating");
      expanded.style.visibility = "hidden";
      document.body.style.overflow = "";
      activeAchievementCard = null;
    }, 480);
  }

  function bindAchievementOverlay() {
    document.getElementById("achievementClose").addEventListener("click", closeAchievement);
    document.getElementById("achievementOverlay").addEventListener("click", (e) => {
      if (e.target.id === "achievementOverlay") closeAchievement();
    });
  }

  /* ---------- NAV BURGER ---------- */
  function bindBurger() {
    document.getElementById("navBurger").addEventListener("click", () => {
      document.getElementById("navLinksMobile").classList.toggle("open");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
    updateThemeIcon();
    bindSmoothScroll();
    initReveal();
    bindBurger();
    bindAchievementOverlay();
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("backToTop").addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });

    // Live-refresh if content is edited in the admin panel in another tab.
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_DATA_KEY) { data = loadData(); render(); }
    });
  });
})();
