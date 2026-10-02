import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isAdminHost } from "@/lib/hostGate";
import { rateLimit } from "@/lib/rateLimit";

const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
};
const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB

// The browser-reported Content-Type on a form-data part is just a label the
// client attaches — it isn't proof of what the bytes actually are. Checking
// the real file signature stops someone with a valid admin session from
// uploading, say, an HTML/SVG file relabelled as "image/png" and having it
// live under /uploads with our chosen (image) extension.
function matchesSignature(b: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/png":
      return (
        b.length >= 8 &&
        b[0] === 0x89 &&
        b[1] === 0x50 &&
        b[2] === 0x4e &&
        b[3] === 0x47 &&
        b[4] === 0x0d &&
        b[5] === 0x0a &&
        b[6] === 0x1a &&
        b[7] === 0x0a
      );
    case "image/jpeg":
      return b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/gif":
      return b.length >= 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a");
    case "image/webp":
      return b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP";
    case "application/pdf":
      return b.length >= 5 && b.toString("ascii", 0, 5) === "%PDF-";
    case "application/msword":
      // Legacy OLE2 compound-file signature (also covers old .xls/.ppt).
      return (
        b.length >= 8 &&
        b[0] === 0xd0 &&
        b[1] === 0xcf &&
        b[2] === 0x11 &&
        b[3] === 0xe0 &&
        b[4] === 0xa1 &&
        b[5] === 0xb1 &&
        b[6] === 0x1a &&
        b[7] === 0xe1
      );
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      // .docx is a zip container: PK\x03\x04 (or the empty/spanned-archive variants).
      return b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07);
    default:
      return false;
  }
}

// POST /api/upload — admin subdomain + valid session only. Accepts a single
// `file` in multipart form data, plus an optional `kind` field ("image" by
// default, or "document" for a resume). Saves it under data/uploads and
// returns the public URL to store on the relevant content field.
export async function POST(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = rateLimit(req, "upload", 30, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const kind = form.get("kind") === "document" ? "document" : "image";
  const allowed = kind === "document" ? DOCUMENT_TYPES : IMAGE_TYPES;
  const maxBytes = kind === "document" ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;

  const ext = allowed[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error:
          kind === "document"
            ? "Only PDF, DOC or DOCX files are allowed"
            : "Only PNG, JPEG, WEBP or GIF images are allowed"
      },
      { status: 400 }
    );
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File must be ${maxBytes / (1024 * 1024)}MB or smaller` }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesSignature(bytes, file.type)) {
    return NextResponse.json(
      { error: "This file's contents don't match its claimed type — please re-export and try again." },
      { status: 400 }
    );
  }

  const filename = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}`, name: file.name });
}
