// Load the shared .env at the project root so NEXT_PUBLIC_* vars are available
// to both the Next.js build and client bundles. Done here (not via .env.local)
// so you only have to maintain one env file for the whole project.
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Weather icons come from openweathermap.org.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'openweathermap.org' },
    ],
  },
  // Re-export the NEXT_PUBLIC_* vars loaded above so Next inlines them at build time.
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

module.exports = nextConfig;
