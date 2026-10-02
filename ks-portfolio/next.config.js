/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise the framework/version to attackers
  async headers() {
    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" }
    ];
    return [
      { source: "/:path*", headers: baseHeaders },
      // The admin panel gets a stricter frame policy — it should never be
      // embeddable anywhere, including this app's own public pages, since
      // that's a classic clickjacking setup for a privileged UI.
      { source: "/admin", headers: [...baseHeaders, { key: "X-Frame-Options", value: "DENY" }] },
      { source: "/admin/:path*", headers: [...baseHeaders, { key: "X-Frame-Options", value: "DENY" }] }
    ];
  }
};

module.exports = nextConfig;
