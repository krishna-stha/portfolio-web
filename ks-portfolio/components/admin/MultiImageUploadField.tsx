"use client";

import { useRef, useState } from "react";
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";

interface MultiImageUploadFieldProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUploadField({ label, value, onChange }: MultiImageUploadFieldProps) {
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
        onChange([...value, json.url]);
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

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="multi-image-field">
        {value.map((url, i) => (
          <div className="multi-image-thumb" key={url + i}>
            <img src={url} alt="" />
            <button type="button" className="thumb-remove" aria-label="Remove image" onClick={() => remove(i)}>
              <TrashIcon />
            </button>
            {value.length > 1 && (
              <div className="thumb-move">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  aria-label="Move right"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            )}
          </div>
        ))}
        <button type="button" className="multi-image-add" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <PlusIcon />
          {uploading ? "Uploading…" : "Add image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="hint">PNG, JPEG, WEBP or GIF, up to 5MB each. First image is the card's cover; order sets the carousel order.</p>
    </div>
  );
}
