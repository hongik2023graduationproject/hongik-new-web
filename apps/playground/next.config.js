const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // Required for pnpm monorepo: trace files outside the app directory
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack(config, { isServer }) {
    // WASM file support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Monaco Editor: self-host instead of CDN to avoid COEP issues
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          // Only include the editor worker (no extra language workers needed)
          languages: [],
          features: [
            'bracketMatching',
            'clipboard',
            'find',
            'folding',
            'hover',
            'indentation',
            'suggest',
            'wordHighlighter',
            'wordOperations',
          ],
        })
      );
    }

    return config;
  },
  // COEP/COOP headers for SharedArrayBuffer (WASM)
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
