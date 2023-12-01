import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Dominik Schröder",
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: "Dominik Schröder",
	// Meta property used as the default description meta property
	description: "Personal website of Dominik Schröder",
	// HTML lang property, found in src/layouts/Base.astro L:18
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_GB",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-GB",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Include view-transitions: https://docs.astro.build/en/guides/view-transitions/
	includeViewTransitions: false,
	webmentions: {
		link: "",
	},
};

// Used to generate links in both the Header & Footer.
export const menuLinks: Array<{ title: string; path: string }> = [
	{
		title: "Home",
		path: `${import.meta.env.BASE_URL}/`,
	},
	{
		title: "Research",
		path: `${import.meta.env.BASE_URL}/research`,
	},
	{
		title: "Projects",
		path: `${import.meta.env.BASE_URL}/projects`,
	},
	{
		title: "Teaching",
		path: `${import.meta.env.BASE_URL}/teaching`,
	},
];
