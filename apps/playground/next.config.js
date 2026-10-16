const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 코드는 브라우저 WASM에서만 실행되고 서버 기능을 쓰지 않아 정적 파일로 내보낸다.
  // COEP/COOP 헤더는 정적 내보내기에서 headers()를 쓸 수 없어 nginx.conf에서 붙인다.
  output: 'export',
  reactStrictMode: true,
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
};

module.exports = nextConfig;
