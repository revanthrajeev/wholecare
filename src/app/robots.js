const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private areas: case rooms, portals, family trackers and the API.
        disallow: ["/api/", "/admin", "/dashboard", "/account", "/case/", "/quote/", "/track/", "/hospital/", "/consultations/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
