(function () {
  "use strict";

  const STORAGE_DATA_KEY = "ks_portfolio_data";
  const STORAGE_PASS_HASH_KEY = "ks_admin_pass_hash";
  const SESSION_UNLOCKED_KEY = "ks_admin_unlocked";
  const DEFAULT_PASSWORD = "djsahdsahdasjdiasjdsiajdias";

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

  function normalize(d) {
    const base = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return Object.assign(base, d, {
      brand: Object.assign({}, base.brand, d.brand || {}),
      hero: Object.assign({}, base.hero, d.hero || {}),
      about: Object.assign({}, base.about, d.about || {}),
      skills: Array.isArray(d.skills) ? d.skills : [],
      experience: Array.isArray(d.experience) ? d.experience : [],
      education: Array.isArray(d.education) ? d.education : [],
      projects: Array.isArray(d.projects) ? d.projects.map((p) => Object.assign({ projectUrl: "" }, p, { imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [] })) : [],
      achievements: Array.isArray(d.achievements) ? d.achievements.map((a) => Object.assign({ credentialUrl: "" }, a, { imageUrls: Array.isArray(a.imageUrls) ? a.imageUrls : a.imageUrl ? [a.imageUrl] : [] })) : [],
      socials: Array.isArray(d.socials) ? d.socials : []
    });
  }
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_DATA_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  function persist(d) { localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(d)); }

  let data = loadData();
  function uid() { return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------- ICONS ---------- */
  const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  const TRASH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/></svg>';
  const GRIP_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
  const UP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg>';
  const DOWN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
  const CHEV_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';
  const CHEV_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
  const PLUS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';

  /* ---------- AUTH (hash-based, client-side only — see admin.html's note) ---------- */
  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function ensurePasswordHash() {
    if (!localStorage.getItem(STORAGE_PASS_HASH_KEY)) {
      localStorage.setItem(STORAGE_PASS_HASH_KEY, await sha256(DEFAULT_PASSWORD));
    }
  }
  async function checkPassword(pw) {
    return (await sha256(pw)) === localStorage.getItem(STORAGE_PASS_HASH_KEY);
  }
  async function setPassword(pw) { localStorage.setItem(STORAGE_PASS_HASH_KEY, await sha256(pw)); }

  /* ---------- TOAST ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- FILE -> DATA URI ---------- */
  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
  const MAX_DOC_BYTES = 3 * 1024 * 1024;

  function readFileAsDataUri(file, kind) {
    return new Promise((resolve, reject) => {
      const allowed = kind === "document" ? DOC_TYPES : IMAGE_TYPES;
      const maxBytes = kind === "document" ? MAX_DOC_BYTES : MAX_IMAGE_BYTES;
      if (allowed.indexOf(file.type) === -1) {
        reject(kind === "document" ? "Only PDF, DOC or DOCX files are allowed" : "Only PNG, JPEG, WEBP or GIF images are allowed");
        return;
      }
      if (file.size > maxBytes) {
        reject("File must be " + (maxBytes / (1024 * 1024)).toFixed(1) + "MB or smaller (this is saved in your browser's storage, which has limited room)");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({ url: String(reader.result), name: file.name });
      reader.onerror = () => reject("Could not read that file");
      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     Single-image field: preview + upload button + editable URL
     text input (so an external link can be pasted instead).
     ========================================================= */
  function renderImageField(container, label, value, onChange, shape) {
    container.innerHTML =
      '<label>' + label + "</label>" +
      '<div class="image-upload image-upload-' + (shape || "square") + '">' +
        '<div class="image-upload-preview">' + (value ? '<img src="' + value + '" alt="">' : '<span class="image-upload-empty">No image</span>') + "</div>" +
        '<div class="image-upload-actions">' +
          '<button type="button" class="btn btn-sm btn-outline" data-act="upload">' + (value ? "Replace image" : "Upload image") + "</button>" +
          (value ? '<button type="button" class="btn btn-sm btn-outline" data-act="remove">Remove</button>' : "") +
          '<input type="text" class="image-upload-url" data-act="url" placeholder="...or paste an image URL" value="' + (value && !value.startsWith("data:") ? value.replace(/"/g, "&quot;") : "") + '">' +
        "</div>" +
        '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;" data-act="file">' +
      "</div>" +
      '<p class="hint">Upload (PNG/JPEG/WEBP/GIF, up to 1.5MB) or paste a URL instead.</p>';

    const fileInput = container.querySelector('[data-act="file"]');
    container.querySelector('[data-act="upload"]').addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await readFileAsDataUri(file, "image");
        onChange(result.url);
      } catch (err) {
        toast(typeof err === "string" ? err : "Upload failed");
      }
      e.target.value = "";
    });
    const removeBtn = container.querySelector('[data-act="remove"]');
    if (removeBtn) removeBtn.addEventListener("click", () => onChange(""));
    const urlInput = container.querySelector('[data-act="url"]');
    urlInput.addEventListener("change", () => onChange(urlInput.value.trim()));
  }

  /* =========================================================
     Multi-image field (achievements + projects galleries)
     ========================================================= */
  function renderMultiImageField(container, label, values, onChange) {
    values = values || [];
    container.innerHTML =
      '<label>' + label + "</label>" +
      '<div class="multi-image-field">' +
        values.map((url, i) =>
          '<div class="multi-image-thumb" data-idx="' + i + '">' +
            '<img src="' + url + '" alt="">' +
            '<button type="button" class="thumb-remove" data-act="remove" data-idx="' + i + '" aria-label="Remove image">' + TRASH_ICON + "</button>" +
            (values.length > 1
              ? '<div class="thumb-move">' +
                  '<button type="button" data-act="left" data-idx="' + i + '" ' + (i === 0 ? "disabled" : "") + " aria-label=\"Move left\">" + CHEV_LEFT + "</button>" +
                  '<button type="button" data-act="right" data-idx="' + i + '" ' + (i === values.length - 1 ? "disabled" : "") + " aria-label=\"Move right\">" + CHEV_RIGHT + "</button>" +
                "</div>"
              : "") +
          "</div>"
        ).join("") +
        '<button type="button" class="multi-image-add" data-act="add">' + PLUS_ICON + "<span>Add image</span></button>" +
        '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;" data-act="file">' +
      "</div>" +
      '<p class="hint">First image is the cover. Upload (up to 1.5MB each) or add several — order sets the carousel order.</p>';

    const fileInput = container.querySelector('[data-act="file"]');
    container.querySelector('[data-act="add"]').addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await readFileAsDataUri(file, "image");
        onChange(values.concat([result.url]));
      } catch (err) {
        toast(typeof err === "string" ? err : "Upload failed");
      }
      e.target.value = "";
    });
    container.querySelectorAll('[data-act="remove"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        onChange(values.filter((_, i) => i !== idx));
      });
    });
    container.querySelectorAll('[data-act="left"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        const next = values.slice();
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        onChange(next);
      });
    });
    container.querySelectorAll('[data-act="right"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-idx"));
        const next = values.slice();
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
        onChange(next);
      });
    });
  }

  /* =========================================================
     Document field (resume)
     ========================================================= */
  function renderFileField(container, label, value, fileName, onChange) {
    container.innerHTML =
      '<label>' + label + "</label>" +
      '<div class="file-upload">' +
        '<div class="file-upload-status">' +
          (value ? '<a href="' + value + '" target="_blank" rel="noopener noreferrer" class="file-upload-name">' + (fileName || "Current file") + "</a>" : '<span class="file-upload-empty">No file uploaded</span>') +
        "</div>" +
        '<div class="image-upload-actions">' +
          '<button type="button" class="btn btn-sm btn-outline" data-act="upload">' + (value ? "Replace file" : "Upload file") + "</button>" +
          (value ? '<button type="button" class="btn btn-sm btn-outline" data-act="remove">Remove</button>' : "") +
        "</div>" +
        '<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none;" data-act="file">' +
      "</div>" +
      '<p class="hint">PDF, DOC or DOCX, up to 3MB. Leave empty to hide the download button on the site.</p>';

    const fileInput = container.querySelector('[data-act="file"]');
    container.querySelector('[data-act="upload"]').addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await readFileAsDataUri(file, "document");
        onChange(result.url, result.name);
      } catch (err) {
        toast(typeof err === "string" ? err : "Upload failed");
      }
      e.target.value = "";
    });
    const removeBtn = container.querySelector('[data-act="remove"]');
    if (removeBtn) removeBtn.addEventListener("click", () => onChange("", ""));
  }

  /* =========================================================
     Generic list editor (Skills / Experience / Education /
     Projects / Achievements / Socials)
     ========================================================= */
  const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const SOCIAL_ICONS = ["github", "linkedin", "twitter", "email", "kaggle", "huggingface", "medium", "link"];

  const SCHEMAS = {
    skills: {
      title: "Skill", plural: "Skills",
      fields: [{ key: "name", label: "Language / tool", type: "text" }, { key: "level", label: "Proficiency", type: "select", options: SKILL_LEVELS }],
      primary: "name", secondary: (i) => i.level
    },
    experience: {
      title: "Experience entry", plural: "Experience entries",
      fields: [
        { key: "role", label: "Role / title", type: "text" }, { key: "company", label: "Company / organisation", type: "text" },
        { key: "period", label: "Period (e.g. 2024 — Present)", type: "text" }, { key: "description", label: "Description", type: "textarea" }
      ],
      primary: "role", secondary: (i) => i.company + " · " + i.period
    },
    education: {
      title: "Education entry", plural: "Education entries",
      fields: [
        { key: "degree", label: "Degree / program", type: "text" }, { key: "institution", label: "Institution", type: "text" },
        { key: "period", label: "Period", type: "text" }, { key: "description", label: "Description", type: "textarea" }
      ],
      primary: "degree", secondary: (i) => i.institution + " · " + i.period
    },
    projects: {
      title: "Project", plural: "Projects",
      fields: [
        { key: "title", label: "Title", type: "text" }, { key: "year", label: "Year", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "projectUrl", label: "Project URL (optional — live demo or repo)", type: "text", optional: true },
        { key: "imageUrls", label: "Images (optional — shown as an inline carousel on the card)", type: "images", optional: true }
      ],
      primary: "title", secondary: (i) => i.year
    },
    achievements: {
      title: "Achievement", plural: "Achievements",
      fields: [
        { key: "title", label: "Title", type: "text" }, { key: "year", label: "Year", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "credentialUrl", label: "Credential URL (optional)", type: "text", optional: true },
        { key: "imageUrls", label: "Images (optional — shown in a carousel when the card is opened)", type: "images", optional: true }
      ],
      primary: "title", secondary: (i) => i.year
    },
    socials: {
      title: "Social link", plural: "Social links",
      fields: [
        { key: "label", label: "Platform name", type: "text" }, { key: "url", label: "URL", type: "text" },
        { key: "icon", label: "Icon", type: "select", options: SOCIAL_ICONS }
      ],
      primary: "label", secondary: (i) => i.url
    }
  };

  function createListEditor(type, containerId) {
    const schema = SCHEMAS[type];
    const container = document.getElementById(containerId);
    let dragIndex = null;

    function items() { return data[type]; }
    function setItems(next) { data[type] = next; persist(data); }

    function render() {
      const list = items();
      container.innerHTML = "";

      if (list.length === 0) {
        const p = document.createElement("p");
        p.className = "hint"; p.textContent = "Nothing added yet.";
        container.appendChild(p);
      }
      if (list.length > 1) {
        const p = document.createElement("p");
        p.className = "hint"; p.style.marginBottom = "14px";
        p.textContent = "Drag the grip handle to reorder, or use the arrows — the live site follows this order.";
        container.appendChild(p);
      }

      list.forEach((item, i) => {
        const row = document.createElement("div");
        row.className = "admin-list-item";
        row.draggable = list.length > 1;
        row.style.opacity = dragIndex === i ? "0.4" : "1";

        row.innerHTML =
          (list.length > 1 ? '<span class="drag-handle">' + GRIP_ICON + "</span>" : "") +
          '<div class="info"><b>' + escapeHtml(String(item[schema.primary] || "")) + "</b><span>" + escapeHtml(schema.secondary(item)) + "</span></div>" +
          '<div class="actions">' +
            (list.length > 1
              ? '<div class="reorder-btns">' +
                  '<button class="icon-btn" data-act="up" ' + (i === 0 ? "disabled" : "") + ">" + UP_ICON + "</button>" +
                  '<button class="icon-btn" data-act="down" ' + (i === list.length - 1 ? "disabled" : "") + ">" + DOWN_ICON + "</button>" +
                "</div>"
              : "") +
            '<button class="icon-btn" data-act="edit">' + EDIT_ICON + "</button>" +
            '<button class="icon-btn danger" data-act="delete">' + TRASH_ICON + "</button>" +
          "</div>";

        row.addEventListener("dragstart", () => { dragIndex = i; closeForm(); row.style.opacity = "0.4"; });
        row.addEventListener("dragenter", () => {
          if (dragIndex === null || dragIndex === i) return;
          const next = items().slice();
          const moved = next.splice(dragIndex, 1)[0];
          next.splice(i, 0, moved);
          dragIndex = i;
          data[type] = next;
          render();
        });
        row.addEventListener("dragover", (e) => e.preventDefault());
        row.addEventListener("dragend", () => { persist(data); dragIndex = null; render(); });

        row.querySelector('[data-act="edit"]').addEventListener("click", () => openForm(i));
        row.querySelector('[data-act="delete"]').addEventListener("click", () => {
          if (!confirm("Delete this entry? This can't be undone.")) return;
          setItems(items().filter((_, idx) => idx !== i));
          render();
          toast("Deleted");
        });
        const upBtn = row.querySelector('[data-act="up"]');
        if (upBtn) upBtn.addEventListener("click", () => { moveItem(i, -1); });
        const downBtn = row.querySelector('[data-act="down"]');
        if (downBtn) downBtn.addEventListener("click", () => { moveItem(i, 1); });

        container.appendChild(row);
      });

      const slot = document.createElement("div");
      slot.id = containerId + "_formSlot";
      container.appendChild(slot);
    }

    function moveItem(i, dir) {
      const list = items().slice();
      const t = i + dir;
      if (t < 0 || t >= list.length) return;
      [list[i], list[t]] = [list[t], list[i]];
      setItems(list);
      render();
    }

    function closeForm() {
      const slot = document.getElementById(containerId + "_formSlot");
      if (slot) slot.innerHTML = "";
    }

    function openForm(editIndex) {
      closeForm();
      const isEdit = editIndex !== undefined && editIndex !== null;
      const existing = isEdit ? items()[editIndex] : {};
      const draft = {};
      schema.fields.forEach((f) => {
        if (f.type === "images") draft[f.key] = (existing[f.key] || []).slice();
        else if (f.type === "select") draft[f.key] = existing[f.key] || f.options[0];
        else draft[f.key] = existing[f.key] || "";
      });

      const slot = document.getElementById(containerId + "_formSlot");
      const card = document.createElement("div");
      card.className = "admin-form-card";
      const heading = document.createElement("h3");
      heading.style.fontSize = "16px"; heading.style.marginBottom = "14px";
      heading.textContent = (isEdit ? "Edit " : "New ") + schema.title.toLowerCase();
      card.appendChild(heading);

      schema.fields.forEach((f) => {
        const wrap = document.createElement("div");
        if (f.type === "textarea") {
          wrap.className = "field";
          wrap.innerHTML = "<label>" + f.label + "</label><textarea></textarea>";
          wrap.querySelector("textarea").value = draft[f.key];
          wrap.querySelector("textarea").addEventListener("input", (e) => (draft[f.key] = e.target.value));
        } else if (f.type === "select") {
          wrap.className = "field";
          wrap.innerHTML = "<label>" + f.label + "</label><select>" + f.options.map((o) => '<option value="' + o + '"' + (o === draft[f.key] ? " selected" : "") + ">" + o + "</option>").join("") + "</select>";
          wrap.querySelector("select").addEventListener("change", (e) => (draft[f.key] = e.target.value));
        } else if (f.type === "image") {
          const updateImage = (val) => { draft[f.key] = val; renderImageField(wrap, f.label, draft[f.key], updateImage, "wide"); };
          renderImageField(wrap, f.label, draft[f.key], updateImage, "wide");
        } else if (f.type === "images") {
          const update = (vals) => { draft[f.key] = vals; renderMultiImageField(wrap, f.label, draft[f.key], update); };
          renderMultiImageField(wrap, f.label, draft[f.key], update);
        } else {
          wrap.className = "field";
          wrap.innerHTML = "<label>" + f.label + "</label><input type=\"text\">";
          wrap.querySelector("input").value = draft[f.key];
          wrap.querySelector("input").addEventListener("input", (e) => (draft[f.key] = e.target.value));
        }
        card.appendChild(wrap);
      });

      const errorP = document.createElement("p");
      errorP.className = "field-error"; errorP.style.display = "none";
      card.appendChild(errorP);

      const actions = document.createElement("div");
      actions.className = "form-actions";
      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-sm"; saveBtn.textContent = "Save entry";
      saveBtn.addEventListener("click", () => {
        for (const f of schema.fields) {
          if (f.type === "select" || f.type === "image" || f.type === "images" || f.optional) continue;
          if (!String(draft[f.key] || "").trim()) {
            errorP.textContent = "Please fill in every field.";
            errorP.style.display = "block";
            return;
          }
        }
        const list = items().slice();
        if (isEdit) list[editIndex] = Object.assign({}, existing, draft);
        else list.push(Object.assign({ id: uid() }, draft));
        setItems(list);
        closeForm();
        render();
        toast(isEdit ? "Entry updated" : "Entry added");
      });
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-sm btn-outline"; cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", closeForm);
      actions.appendChild(saveBtn); actions.appendChild(cancelBtn);
      card.appendChild(actions);

      slot.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    render();
    return { render, openForm };
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* =========================================================
     THEME (shared toggle on the admin page too)
     ========================================================= */
  function updateThemeIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    document.getElementById("themeIcon").innerHTML = isLight
      ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>';
  }

  /* =========================================================
     DASHBOARD WIRING
     ========================================================= */
  function fillHeroForm() {
    document.getElementById("f_hero_name").value = data.hero.name;
    document.getElementById("f_hero_role").value = data.hero.role;
    document.getElementById("f_hero_tagline").value = data.hero.tagline;
    document.getElementById("f_hero_cta1_label").value = data.hero.cta1Label;
    document.getElementById("f_hero_cta1_url").value = data.hero.cta1Url;
    document.getElementById("f_hero_cta2_label").value = data.hero.cta2Label;
    document.getElementById("f_hero_cta2_url").value = data.hero.cta2Url;
    const logoField = document.getElementById("field_logo");
    function refreshLogo() {
      renderImageField(logoField, "Navigation logo (replaces the \u201cKS.\u201d mark)", data.brand.logoUrl, (val) => {
        data.brand.logoUrl = val; persist(data); refreshLogo();
        toast("Logo updated");
      }, "wide");
    }
    refreshLogo();
  }

  function fillAboutForm() {
    document.getElementById("f_about_initials").value = data.about.initials;
    document.getElementById("f_about_bio").value = data.about.bio;
    document.getElementById("f_about_tags").value = data.about.tags.join(", ");
    const photoField = document.getElementById("field_photo");
    function refreshPhoto() {
      renderImageField(photoField, "Profile picture (shown instead of your initials when set)", data.about.photoUrl, (val) => {
        data.about.photoUrl = val; persist(data); refreshPhoto();
      }, "square");
    }
    refreshPhoto();
    const resumeField = document.getElementById("field_resume");
    function refreshResume() {
      renderFileField(resumeField, "Resume (adds a \u201cDownload resume\u201d button to the About section)", data.about.resumeUrl, data.about.resumeName, (url, name) => {
        data.about.resumeUrl = url; data.about.resumeName = name; persist(data); refreshResume();
      });
    }
    refreshResume();
  }

  function switchTab(tabName) {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.toggle("active", t.getAttribute("data-tab") === tabName));
    document.querySelectorAll(".admin-panel").forEach((p) => p.classList.toggle("active", p.getAttribute("data-panel") === tabName));
  }

  const editors = {};

  document.addEventListener("DOMContentLoaded", async () => {
    await ensurePasswordHash();
    updateThemeIcon();
    document.getElementById("themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ks_theme", next);
      updateThemeIcon();
    });

    const unlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === "1";
    if (unlocked) showDashboard();

    document.getElementById("loginBtn").addEventListener("click", async () => {
      const pw = document.getElementById("pw").value;
      if (await checkPassword(pw)) {
        sessionStorage.setItem(SESSION_UNLOCKED_KEY, "1");
        document.getElementById("pw").value = "";
        showDashboard();
      } else {
        document.getElementById("loginError").style.display = "block";
      }
    });
    document.getElementById("pw").addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("loginBtn").click(); });
    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
      location.reload();
    });

    function showDashboard() {
      document.getElementById("loginView").style.display = "none";
      document.getElementById("dashboardView").style.display = "block";
      document.getElementById("logoutBtn").style.display = "inline-flex";
      data = loadData();

      editors.skills = Object.assign(createListEditor("skills", "skillsAdminList"), { containerId: "skillsAdminList" });
      editors.experience = Object.assign(createListEditor("experience", "experienceAdminList"), { containerId: "experienceAdminList" });
      editors.education = Object.assign(createListEditor("education", "educationAdminList"), { containerId: "educationAdminList" });
      editors.projects = Object.assign(createListEditor("projects", "projectsAdminList"), { containerId: "projectsAdminList" });
      editors.achievements = Object.assign(createListEditor("achievements", "achievementsAdminList"), { containerId: "achievementsAdminList" });
      editors.socials = Object.assign(createListEditor("socials", "socialsAdminList"), { containerId: "socialsAdminList" });

      fillHeroForm();
      fillAboutForm();

      document.querySelectorAll(".admin-tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.getAttribute("data-tab"))));
      document.getElementById("saveLogoBtn").addEventListener("click", () => { persist(data); toast("Logo saved"); });
      document.getElementById("saveHeroBtn").addEventListener("click", () => {
        data.hero = {
          name: document.getElementById("f_hero_name").value.trim() || DEFAULT_DATA.hero.name,
          role: document.getElementById("f_hero_role").value.trim(),
          tagline: document.getElementById("f_hero_tagline").value.trim(),
          cta1Label: document.getElementById("f_hero_cta1_label").value.trim() || "View my work",
          cta1Url: document.getElementById("f_hero_cta1_url").value.trim() || "#experience",
          cta2Label: document.getElementById("f_hero_cta2_label").value.trim() || "Get in touch",
          cta2Url: document.getElementById("f_hero_cta2_url").value.trim() || "#contact"
        };
        persist(data);
        toast("Hero section saved");
      });
      document.getElementById("saveAboutBtn").addEventListener("click", () => {
        data.about.initials = document.getElementById("f_about_initials").value.trim() || "KS";
        data.about.bio = document.getElementById("f_about_bio").value.trim();
        data.about.tags = document.getElementById("f_about_tags").value.split(",").map((t) => t.trim()).filter(Boolean);
        persist(data);
        toast("About section saved");
      });

      document.getElementById("addSkillBtn").addEventListener("click", () => editors.skills.openForm());
      document.getElementById("addExperienceBtn").addEventListener("click", () => editors.experience.openForm());
      document.getElementById("addEducationBtn").addEventListener("click", () => editors.education.openForm());
      document.getElementById("addProjectBtn").addEventListener("click", () => editors.projects.openForm());
      document.getElementById("addAchievementBtn").addEventListener("click", () => editors.achievements.openForm());
      document.getElementById("addSocialBtn").addEventListener("click", () => editors.socials.openForm());

      document.getElementById("changePassBtn").addEventListener("click", async () => {
        const val = document.getElementById("f_new_pass").value;
        if (!val || val.length < 4) { toast("Password must be at least 4 characters"); return; }
        await setPassword(val);
        document.getElementById("f_new_pass").value = "";
        toast("Password updated");
      });
      document.getElementById("exportDataBtn").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "site-data.json"; a.click();
        URL.revokeObjectURL(url);
        toast("site-data.json downloaded");
      });
      document.getElementById("importDataInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            data = normalize(JSON.parse(String(reader.result)));
            persist(data);
            fillHeroForm(); fillAboutForm();
            Object.keys(editors).forEach((t) => editors[t].render());
            toast("Data imported successfully");
          } catch (err) { toast("That file isn't valid JSON"); }
        };
        reader.readAsText(file);
        e.target.value = "";
      });
      document.getElementById("resetDataBtn").addEventListener("click", () => {
        if (!confirm("Reset all content back to the default placeholders? This can't be undone.")) return;
        data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        persist(data);
        fillHeroForm(); fillAboutForm();
        Object.keys(editors).forEach((t) => editors[t].render());
        toast("Reset to defaults");
      });
    }
  });
})();
