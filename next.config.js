/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Move it here, out of experimental
  outputFileTracingIncludes: {
    '/api/**/*': ['./infra/migrations/**/*'],
  },
};

export default nextConfig;
