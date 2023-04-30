/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'pizzahawaii-4sdumz.zitadel.cloud',
				pathname: '/assets/**',
			},
		],
	},
};

module.exports = nextConfig;
