/** @type {import('next').NextConfig} */
const nextConfig = {
	// Allow LAN/dev origins to load _next assets during development
	experimental: {
		allowedDevOrigins: [
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://192.168.178.42:3000"
		]
	}
};

module.exports = nextConfig;
