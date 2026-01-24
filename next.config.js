/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./infra/migrations/**/*', './package.json'],
  },
};

export default nextConfig;
