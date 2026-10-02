/**
 * Every URL rendered on the public site (hero CTA links, social links,
 * achievement/project links) is free text typed into the admin panel. React
 * already escapes it as text, so this isn't about HTML injection — it's
 * about a stray `javascript:` (or similar) URI being clickable. Only allow
 * schemes that can't execute script, plus in-page anchors and relative
 * paths; anything else is dropped rather than guessed at.
 */
const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // In-page anchors and root-relative paths never carry a scheme.
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return trimmed;

  try {
    // A base is only needed to resolve protocol-relative/relative inputs;
    // it's discarded once we've read the resolved scheme.
    const parsed = new URL(trimmed, "https://example.invalid");
    return SAFE_SCHEMES.includes(parsed.protocol) ? trimmed : "";
  } catch {
    return "";
  }
}
