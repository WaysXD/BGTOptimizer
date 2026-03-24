/** @type {import('next').NextConfig} */
const nextConfig = {
  // @reown/appkit-adapter-wagmi bundles @wagmi/connectors which imports
  // porto/internal even when the Porto connector is never used.
  // Stub it with an empty module so the build succeeds.
  webpack: (config) => {
    config.resolve.alias["porto/internal"] = false;
    return config;
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options",           value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options",     value: "nosniff" },
        { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
