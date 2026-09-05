import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Scraped media is proxied through our own /api/media/[id] route so that we
    // never hotlink third-party CDNs and never leak the group's IP addresses.
    remotePatterns: [{ protocol: 'https', hostname: '**.podshar.internal' }]
  }
};

export default withNextIntl(nextConfig);
