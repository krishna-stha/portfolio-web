"use client";

import { useEffect, useRef, useState } from "react";
import { SiteData } from "@/lib/types";
import { DEFAULT_DATA } from "@/lib/defaultData";
import { SCHEMAS } from "./schemas";
import ListEditor from "./ListEditor";
import ImageUploadField from "./ImageUploadField";
import FileUploadField from "./FileUploadField";

type AuthState = "checking" | "loggedOut" | "loggedIn";
type Tab = "hero" | "about" | "skills" | "experience" | "education" | "projects" | "achievements" | "socials" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
  { key: "achievements", label: "Achievements" },
  { key: "socials", label: "Socials" },
  { key: "settings", label: "Settings & Data" }
];

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<SiteData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  async function loadData() {
    const res = await fetch("/api/data", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth", { cache: "no-store" });
      const json = await res.json();
      if (json.authenticated) {
        setAuthState("loggedIn");
        await loadData();
      } else {
        setAuthState("loggedOut");
      }
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setPassword("");
      setAuthState("loggedIn");
      await loadData();
    } else {
      const json = await res.json().catch(() => ({}));
      setLoginError(json.error || "Incorrect password. Try again.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthState("loggedOut");
    setData(null);
  }

  async function saveData(next: SiteData) {
    setData(next);
    const res = await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next)
    });
    if (res.ok) {
      showToast("Saved");
    } else {
      showToast("Save failed — please try again");
    }
  }

  if (authState === "checking") {
    return <div className="admin-shell" />;
  }

  if (authState === "loggedOut") {
    return (
      <div className="admin-shell">
        <div className="admin-body">
          <div className="admin-login">
            <h2>Enter password</h2>
            <p>This panel controls the content shown on your live site.</p>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="pw">Password</label>
                <input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {loginError && <p className="field-error">{loginError}</p>}
              <button className="btn" type="submit" style={{ width: "100%" }}>
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="admin-shell" />;

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>KS. / Admin Panel</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="admin-badge">admin subdomain</span>
          <button className="btn btn-sm btn-outline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "hero" && <HeroTab data={data} onSave={saveData} />}
        {activeTab === "about" && <AboutTab data={data} onSave={saveData} />}
        {activeTab === "skills" && (
          <ListEditor schema={SCHEMAS.skills} items={data.skills} onChange={(next) => saveData({ ...data, skills: next })} />
        )}
        {activeTab === "experience" && (
          <ListEditor
            schema={SCHEMAS.experience}
            items={data.experience}
            onChange={(next) => saveData({ ...data, experience: next })}
          />
        )}
        {activeTab === "education" && (
          <ListEditor
            schema={SCHEMAS.education}
            items={data.education}
            onChange={(next) => saveData({ ...data, education: next })}
          />
        )}
        {activeTab === "projects" && (
          <ListEditor
            schema={SCHEMAS.projects}
            items={data.projects}
            onChange={(next) => saveData({ ...data, projects: next })}
          />
        )}
        {activeTab === "achievements" && (
          <ListEditor
            schema={SCHEMAS.achievements}
            items={data.achievements}
            onChange={(next) => saveData({ ...data, achievements: next })}
          />
        )}
        {activeTab === "socials" && (
          <ListEditor
            schema={SCHEMAS.socials}
            items={data.socials}
            onChange={(next) => saveData({ ...data, socials: next })}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab data={data} onSave={saveData} onToast={showToast} fileInputRef={fileInputRef} />
        )}
      </div>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}

function HeroTab({ data, onSave }: { data: SiteData; onSave: (d: SiteData) => void }) {
  const [form, setForm] = useState(data.hero);
  const [logoUrl, setLogoUrl] = useState(data.brand.logoUrl);
  useEffect(() => setForm(data.hero), [data.hero]);
  useEffect(() => setLogoUrl(data.brand.logoUrl), [data.brand.logoUrl]);

  return (
    <div>
      <div className="admin-panel-head">
        <h3>Hero section &amp; branding</h3>
      </div>
      <div className="admin-form-card">
        <ImageUploadField label="Navigation logo (replaces the “KS.” mark)" value={logoUrl} onChange={setLogoUrl} shape="wide" />
        <button className="btn btn-sm" onClick={() => onSave({ ...data, brand: { logoUrl } })}>
          Save logo
        </button>
      </div>
      <div className="admin-form-card">
        <div className="field">
          <label>Full name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Role / tagline line (mono text)</label>
          <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="field">
          <label>Tagline sentence</label>
          <textarea value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div className="form-row2">
          <div className="field">
            <label>Primary button label</label>
            <input type="text" value={form.cta1Label} onChange={(e) => setForm({ ...form, cta1Label: e.target.value })} />
          </div>
          <div className="field">
            <label>Primary button link (#section or URL)</label>
            <input type="text" value={form.cta1Url} onChange={(e) => setForm({ ...form, cta1Url: e.target.value })} />
          </div>
        </div>
        <div className="form-row2">
          <div className="field">
            <label>Secondary button label</label>
            <input type="text" value={form.cta2Label} onChange={(e) => setForm({ ...form, cta2Label: e.target.value })} />
          </div>
          <div className="field">
            <label>Secondary button link (#section or URL)</label>
            <input type="text" value={form.cta2Url} onChange={(e) => setForm({ ...form, cta2Url: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-sm" onClick={() => onSave({ ...data, hero: form })}>
          Save changes
        </button>
      </div>
    </div>
  );
}

function AboutTab({ data, onSave }: { data: SiteData; onSave: (d: SiteData) => void }) {
  const [initials, setInitials] = useState(data.about.initials);
  const [photoUrl, setPhotoUrl] = useState(data.about.photoUrl);
  const [resumeUrl, setResumeUrl] = useState(data.about.resumeUrl);
  const [resumeName, setResumeName] = useState(data.about.resumeName);
  const [bio, setBio] = useState(data.about.bio);
  const [tagsText, setTagsText] = useState(data.about.tags.join(", "));

  useEffect(() => {
    setInitials(data.about.initials);
    setPhotoUrl(data.about.photoUrl);
    setResumeUrl(data.about.resumeUrl);
    setResumeName(data.about.resumeName);
    setBio(data.about.bio);
    setTagsText(data.about.tags.join(", "));
  }, [data.about]);

  function save() {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...data, about: { initials: initials || "KS", photoUrl, resumeUrl, resumeName, bio, tags } });
  }

  return (
    <div>
      <div className="admin-panel-head">
        <h3>About section</h3>
      </div>
      <div className="admin-form-card">
        <ImageUploadField
          label="Profile picture (shown instead of your initials when set)"
          value={photoUrl}
          onChange={setPhotoUrl}
          shape="square"
        />
        <div className="field">
          <label>Initials (shown if no profile picture is set)</label>
          <input type="text" maxLength={3} value={initials} onChange={(e) => setInitials(e.target.value)} />
        </div>
        <div className="field">
          <label>Bio paragraph</label>
          <textarea style={{ minHeight: 140 }} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="field">
          <label>Focus tags (comma separated)</label>
          <input type="text" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </div>
        <FileUploadField
          label="Resume (adds a “Download resume” button to the About section)"
          value={resumeUrl}
          fileName={resumeName}
          onChange={(url, name) => {
            setResumeUrl(url);
            setResumeName(name);
          }}
        />
        <button className="btn btn-sm" onClick={save}>
          Save changes
        </button>
      </div>
    </div>
  );
}

function SettingsTab({
  data,
  onSave,
  onToast,
  fileInputRef
}: {
  data: SiteData;
  onSave: (d: SiteData) => void;
  onToast: (msg: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  const [newPassword, setNewPassword] = useState("");

  async function changePassword() {
    if (newPassword.length < 8) {
      onToast("Password must be at least 8 characters");
      return;
    }
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) {
      setNewPassword("");
      onToast("Password updated");
    } else {
      const json = await res.json().catch(() => ({}));
      onToast(json.error || "Could not update password");
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-data.json";
    a.click();
    URL.revokeObjectURL(url);
    onToast("site-data.json downloaded");
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onSave(parsed);
        onToast("Data imported successfully");
      } catch {
        onToast("That file isn't valid JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function resetDefaults() {
    if (confirm("Reset all content back to the default placeholders? This can't be undone.")) {
      onSave(DEFAULT_DATA);
      onToast("Reset to defaults");
    }
  }

  return (
    <div>
      <div className="admin-panel-head">
        <h3>Settings &amp; data</h3>
      </div>

      <div className="admin-form-card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Change admin password</h3>
        <div className="field">
          <label>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button className="btn btn-sm" onClick={changePassword}>
          Update password
        </button>
      </div>

      <div className="admin-form-card">
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>Adding a new section</h3>
        <p className="hint">
          Every list section (Skills, Experience, Education, Projects, Achievements, Socials) is built from one
          shared engine — a schema entry in components/admin/schemas.ts plus one render block on the public page.
          See README.md → &quot;Adding a new section&quot; for the exact steps.
        </p>
      </div>

      <div className="admin-form-card">
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>Backup &amp; transfer</h3>
        <p className="hint" style={{ marginBottom: 16 }}>
          Content lives in data/site-data.json on the server. Export a backup before big changes, or to move content
          between environments.
        </p>
        <div className="data-actions">
          <button className="btn btn-sm" onClick={exportData}>
            Export site-data.json
          </button>
          <label className="btn btn-sm btn-outline" style={{ cursor: "pointer" }}>
            Import site-data.json
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
          </label>
          <button className="btn btn-sm btn-outline" onClick={resetDefaults}>
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
