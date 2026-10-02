"use client";

import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  shape?: "square" | "circle" | "wide";
}

export default function ImageUploadField({ label, value, onChange, shape = "square" }: ImageUploadFieldProps) {
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
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        onChange(json.url);
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
      <div className={`image-upload image-upload-${shape}`}>
        <div className="image-upload-preview">
          {value ? <img src={value} alt="" /> : <span className="image-upload-empty">No image</span>}
        </div>
        <div className="image-upload-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && !uploading && (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="hint">PNG, JPEG, WEBP or GIF, up to 5MB.</p>
    </div>
  );
}
