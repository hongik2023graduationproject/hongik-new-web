const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Required for pnpm monorepo: trace files outside the app directory
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack(config) {
    // WASM file support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Monaco Editor: only bundle required languages/features to reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    return config;
  },
  // Allow loading Monaco Editor web workers from CDN
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
