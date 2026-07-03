/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // globe.gl necesita ser transpilado
  transpilePackages: ["globe.gl", "three"],
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
