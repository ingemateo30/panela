import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar errores de ESLint durante el build temporalmente
    // debido a incompatibilidad con opciones obsoletas
    ignoreDuringBuilds: true,
  },
  typescript: {
    // No ignorar errores de TypeScript durante el build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
