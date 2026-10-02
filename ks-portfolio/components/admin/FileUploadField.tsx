"use client";

import { useRef, useState } from "react";

interface FileUploadFieldProps {
  label: string;
  value: string;
  fileName: string;
  onChange: (url: string, fileName: string) => void;
}

/** Uploads a document (PDF/DOC/DOCX) — used for the downloadable resume. */
export default function FileUploadField({ label, value, fileName, onChange }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "document");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        onChange(json.url, json.name || file.name);
      } else {
        setError(json.error || "Upload failed");
      }
    } catch {
      setError("Upload failed — please try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="file-upload">
        <div className="file-upload-status">
          {value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="file-upload-name">
              {fileName || "Current file"}
            </a>
          ) : (
            <span className="file-upload-empty">No file uploaded</span>
          )}
        </div>
        <div className="image-upload-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : value ? "Replace file" : "Upload file"}
          </button>
          {value && !uploading && (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange("", "")}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="hint">PDF, DOC or DOCX, up to 10MB. Leave empty to hide the download button on the site.</p>
    </div>
  );
}
