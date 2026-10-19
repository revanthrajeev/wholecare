const videoOrigin = new URL(process.env.NEXT_PUBLIC_VIDEO_BASE_URL || "https://meet.jit.si").origin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // The JSON datastore seed and demo documents are read from disk at runtime.
  outputFileTracingIncludes: {
    "/**": ["./data/seed.json", "./data/seed-uploads/**"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: `camera=(self "${videoOrigin}"), microphone=(self "${videoOrigin}"), display-capture=(self "${videoOrigin}"), geolocation=()` },
        ],
      },
    ];
  },
};

export default nextConfig;
