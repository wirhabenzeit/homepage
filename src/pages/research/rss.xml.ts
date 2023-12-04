import rss from "@astrojs/rss";
import { siteConfig } from "@/site-config";
import { getAll } from "@/utils";

export const GET = async () => {
	const posts = await getAll("research");

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `posts/${post.slug}`,
		})),
	});
};
