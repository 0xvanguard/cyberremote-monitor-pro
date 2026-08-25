/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  // globe.gl necesita ser transpilado
  transpilePackages: ["globe.gl", "three"],
  // Base path para GitHub Pages (si el repo no es root)
  // basePath: '/cyberremote-monitor-pro',
  webpack(config) {
    // Soporte para archivos .glsl (shaders)
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader"],
    });
    return config;
  },
};

module.exports = nextConfig;
