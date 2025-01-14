/** @type {import('@docusaurus/types').DocusaurusConfig} */
const versions = require('./versions.json')

module.exports = {
	title: 'Flood Element',
	tagline: 'Break the network barrier',
	url: 'https://element.flood.io',
	baseUrl: '/',
	favicon: 'img/favicon.ico',
	organizationName: 'flood-io',
	projectName: 'element',
	themeConfig: {
		announcementBar: {
			id: 'supportus',
			content: `🚀&nbsp;&nbsp;Flood Element v2.0 is now available, checkout the cool features <a target="_blank" rel="noopener noreferrer" href="/v2">here</a>&nbsp;&nbsp;🚀`,
			backgroundColor: '#23232C',
			textColor: '#FFFFFF',
		},
		algolia: {
			apiKey: '470d702a4a0bc2621a57b4cb58af7cc9',
			indexName: 'flood_element',
			// appId: 'app-id', // Optional, if you run the DocSearch crawler on your own
			// algoliaOptions: {}, // Optional, if provided by Algolia
		},
		navbar: {
			title: 'Element',
			hideOnScroll: true,
			logo: {
				alt: 'Element',
				src: 'img/Element-Logo-Mark.svg',
			},
			items: [
				{
					label: 'Docs',
					position: 'left',
					activeBaseRegex: `docs`,
					items: [
						{
							label: versions[0],
							to: 'docs/',
							activeBaseRegex: `docs/(?!${versions.join('|')}|next)`,
						},
						...versions.slice(1).map((version) => ({
							label: version,
							to: `docs/${version}/`,
						})),
					],
				},
				{
					label: 'Recorder',
					to: 'recorder/docs/',
					position: 'left',
					activeBaseRegex: 'recorder',
					className: 'navbar__recorder',
				},
				{ href: 'https://www.flood.io/blog', label: 'Blog', position: 'left' },
				{
					href: 'https://github.com/flood-io/element',
					label: 'GitHub',
					position: 'right',
					'aria-label': 'GitHub repository',
				},
				{
					to: 'docs/',
					label: `v${versions[0]}`,
					position: 'right',
				},
			],
		},
		footer: {
			links: [
				{
					title: 'Our Products',
					items: [
						{
							label: 'Flood Load Testing',
							to: 'https://www.flood.io/',
						},
						{
							label: 'Flood Agent',
							to: 'https://www.flood.io/products/agent',
						},
						{
							label: 'Flood Insights',
							to: 'https://www.flood.io/products/insights',
						},
						{
							label: 'Flood Grid',
							to: 'https://www.flood.io/products/grid',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/flood-io/element',
						},
						{
							label: 'Spectrum',
							href: 'https://spectrum.chat/flood/element',
						},
						{
							label: 'Twitter',
							href: 'https://twitter.com/flood_io',
						},
						{
							label: 'Facebook',
							href: 'https://www.facebook.com/floodio',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							href: 'https://www.flood.io/blog',
						},
						{
							label: 'Element Challenge',
							href: 'https://element-challenge.flood.io/',
						},
						{
							label: 'Flood Challenge',
							href: 'https://challenge.flood.io/',
						},
					],
				},
			],
			logo: {
				alt: 'FloodIO',
				src: 'img/flood_logo.svg',
				href: 'https://flood.io',
			},
			copyright: `Element is sponsored by Tricentis and maintained by the <a href="https://flood.io/" target="_blank">Flood</a> load testing team.<br />Copyright © ${new Date().getFullYear()} <a href="https://tricentis.com/" target="_blank">Tricentis Corp</a>. All Rights Reserved. Licensed under the Apache-2 licence.`,
		},
	},
	plugins: [
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'recorder',
				path: 'recorderDocs',
				routeBasePath: 'recorder/docs',
				sidebarPath: require.resolve('./sidebarsRecorder.js'),
				include: ['**/*.md', '**/*.mdx'],
				disableVersioning: false,
			},
		],
	],
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/flood-io/element/edit/stable/packages/docs/',
				},
				blog: {
					showReadingTime: true,
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
	onBrokenLinks: 'log',
}
