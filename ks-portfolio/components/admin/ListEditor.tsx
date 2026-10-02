"use client";

import { useEffect, useRef, useState } from "react";
import { SchemaDef, uid } from "./schemas";
import { EditIcon, TrashIcon, GripIcon, ChevronUpIcon, ChevronDownIcon } from "@/components/icons";
import ImageUploadField from "./ImageUploadField";
import MultiImageUploadField from "./MultiImageUploadField";

interface ListEditorProps {
  schema: SchemaDef;
  items: any[];
  onChange: (next: any[]) => void;
}

export default function ListEditor({ schema, items, onChange }: ListEditorProps) {
  // Items are mirrored into local state so a drag gesture can shuffle the
  // list live without firing a network save on every hover — the parent
  // is only told about the new order once, when the drag ends.
  const [localItems, setLocalItems] = useState(items);
  const localItemsRef = useRef(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    localItemsRef.current = items;
    setLocalItems(items);
  }, [items]);

  function setItems(next: any[]) {
    localItemsRef.current = next;
    setLocalItems(next);
  }

  function blankValueFor(type: string) {
    if (type === "images") return [];
    if (type === "select") return undefined; // filled from options below
    return "";
  }

  function startCreate() {
    const blank: Record<string, any> = {};
    schema.fields.forEach((f) => (blank[f.key] = f.type === "select" ? f.options?.[0] ?? "" : blankValueFor(f.type)));
    setDraft(blank);
    setCreating(true);
    setEditingIndex(null);
    setError("");
  }

  function startEdit(index: number) {
    const item = localItems[index];
    const values: Record<string, any> = {};
    schema.fields.forEach((f) => (values[f.key] = item[f.key] ?? blankValueFor(f.type)));
    setDraft(values);
    setEditingIndex(index);
    setCreating(false);
    setError("");
  }

  function cancel() {
    setCreating(false);
    setEditingIndex(null);
    setError("");
  }

  function save() {
    for (const f of schema.fields) {
      if (f.type === "select" || f.type === "image" || f.type === "images" || f.optional) continue;
      if (!String(draft[f.key] ?? "").trim()) {
        setError("Please fill in every field.");
        return;
      }
    }
    if (creating) {
      onChange([...localItems, { id: uid(), ...draft }]);
    } else if (editingIndex !== null) {
      const next = [...localItems];
      next[editingIndex] = { ...next[editingIndex], ...draft };
      onChange(next);
    }
    setCreating(false);
    setEditingIndex(null);
  }

  function remove(index: number) {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    onChange(localItems.filter((_, i) => i !== index));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= localItems.length) return;
    const next = [...localItems];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function handleDragStart(index: number, e: React.DragEvent) {
    cancel();
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragEnter(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...localItemsRef.current];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setItems(next);
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex !== null) {
      onChange(localItemsRef.current);
    }
    setDragIndex(null);
  }

  const showForm = creating || editingIndex !== null;
  const canReorder = localItems.length > 1;

  return (
    <div>
      <div className="admin-panel-head">
        <h3>{schema.plural}</h3>
        <button className="btn btn-sm" onClick={startCreate}>
          + Add {schema.title.toLowerCase()}
        </button>
      </div>

      {localItems.length === 0 && <p className="hint">Nothing added yet.</p>}
      {canReorder && (
        <p className="hint" style={{ marginBottom: 14 }}>
          Drag the grip handle to reorder, or use the arrows — the live site follows this order.
        </p>
      )}

      {localItems.map((item, i) => (
        <div
          className="admin-list-item"
          key={item.id ?? i}
          draggable={canReorder}
          onDragStart={(e) => handleDragStart(i, e)}
          onDragEnter={() => handleDragEnter(i)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnd={handleDragEnd}
          style={{ opacity: dragIndex === i ? 0.4 : 1 }}
        >
          {canReorder && (
            <span className="drag-handle" aria-hidden="true">
              <GripIcon />
            </span>
          )}
          <div className="info">
            <b>{item[schema.primary]}</b>
            <span>{schema.secondary(item)}</span>
          </div>
          <div className="actions">
            {canReorder && (
              <div className="reorder-btns">
                <button
                  className="icon-btn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => moveItem(i, -1)}
                >
                  <ChevronUpIcon />
                </button>
                <button
                  className="icon-btn"
                  aria-label="Move down"
                  disabled={i === localItems.length - 1}
                  onClick={() => moveItem(i, 1)}
                >
                  <ChevronDownIcon />
                </button>
              </div>
            )}
            <button className="icon-btn" aria-label="Edit" onClick={() => startEdit(i)}>
              <EditIcon />
            </button>
            <button className="icon-btn danger" aria-label="Delete" onClick={() => remove(i)}>
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="admin-form-card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>
            {creating ? "New" : "Edit"} {schema.title.toLowerCase()}
          </h3>
          {schema.fields.map((f) => (
            <div key={f.key}>
              {f.type === "textarea" ? (
                <div className="field">
                  <label>{f.label}</label>
                  <textarea
                    value={draft[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                </div>
              ) : f.type === "select" ? (
                <div className="field">
                  <label>{f.label}</label>
                  <select value={draft[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}>
                    {f.options?.map((opt) => (
                      <option value={opt} key={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : f.type === "image" ? (
                <ImageUploadField
                  label={f.label}
                  value={draft[f.key] ?? ""}
                  onChange={(url) => setDraft({ ...draft, [f.key]: url })}
                  shape="wide"
                />
              ) : f.type === "images" ? (
                <MultiImageUploadField
                  label={f.label}
                  value={draft[f.key] ?? []}
                  onChange={(urls) => setDraft({ ...draft, [f.key]: urls })}
                />
              ) : (
                <div className="field">
                  <label>{f.label}</label>
                  <input
                    type="text"
                    value={draft[f.key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                </div>
              )}
            </div>
          ))}
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-sm" onClick={save}>
              Save entry
            </button>
            <button className="btn btn-sm btn-outline" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
