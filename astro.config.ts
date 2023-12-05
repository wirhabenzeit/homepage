import { defineConfig } from "astro/config";
import fs from "fs";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkUnwrapImages from "remark-unwrap-images";

// https://astro.build/config
export default defineConfig({
	site: "https://n.ethz.ch/~dschroeder/",
	base: "/~dschroeder",
	markdown: {
		remarkPlugins: [remarkUnwrapImages, remarkMath],
		rehypePlugins: [rehypeKatex],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	integrations: [
		mdx({}),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
		prefetch(),
	],
	image: {
		domains: ["webmention.io"],
	},
	vite: {
		plugins: [rawFonts([".ttf"])],
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		assetsInclude: ["**/*.bib", "**/*.pdf"],
	},
});
function rawFonts(ext: Array<string>) {
	return {
		name: "vite-plugin-raw-fonts",
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
