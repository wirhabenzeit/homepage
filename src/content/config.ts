import { z, defineCollection } from "astro:content";

function removeDups(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const post = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().min(50).max(160),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			coverImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			draft: z.boolean().default(false),
			tags: z.array(z.string()).default([]).transform(removeDups),
			ogImage: z.string().optional(),
			heroImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			links: z
				.array(
					z.object({
						href: z.string(),
						title: z.string(),
						icon: z.string(),
					}),
				)
				.optional(),
			arXiv: z.string().optional(),
			doi: z.string().optional(),
			mathscinet: z.string().optional(),
			journal: z.string().optional(),
			journalRef: z.string().optional(),
			authors: z.string().optional(),
		}),
});

export const collections = { post };
