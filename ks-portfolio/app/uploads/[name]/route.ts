import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Uploaded files are written to data/uploads at runtime. `next start` only
// serves files that were in public/ at build time, so anything uploaded after
// deploy has to be streamed through a route like this one instead.
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

// Only the exact shape our upload route generates: <base36>-<8 hex>.<ext>.
// This strict allowlist is what makes path traversal (../, encoded slashes,
// absolute paths) impossible — nothing else ever reaches the filesystem.
const SAFE_NAME = /^[a-z0-9]+-[a-f0-9]{8}\.(png|jpg|webp|gif|pdf|doc|docx)$/;

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const name = params.name;
  const match = SAFE_NAME.exec(name);
  if (!match) return new NextResponse("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(process.cwd(), "data", "uploads", name));
    const ext = match[1];
    const isDocument = ["doc", "docx"].includes(ext);
    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[ext],
        "Content-Length": String(file.length),
        // Filenames are unique and random, so a given URL never changes content.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // Neutralise any active content even if something slipped past validation.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        ...(isDocument ? { "Content-Disposition": "attachment" } : {})
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
