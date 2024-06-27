import { z, defineCollection } from "astro:content";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const teaching = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string().max(60),
			description: z.string().min(50).max(160),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.string().optional(),
			heroImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			heroImageHover: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
		}),
});

const thesis = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.string().optional(),
			heroImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			heroImageHover: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
		}),
});

const research = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.string().optional(),
			heroImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			heroImageHover: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			arxiv: z.string().optional(),
			doi: z.string().optional(),
			mathscinet: z.string().optional(),
			journal: z.string().optional(),
			year: z
				.string()
				.optional()
				.transform((str) => (str ? parseInt(str) : undefined)),
			volume: z.string().optional(),
			issue: z.string().optional(),
			authors: z.array(z.string()).optional(),
		}),
});

const project = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string().max(60),
			description: z.string().min(50).max(160),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.string().optional(),
			heroImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
			heroImageHover: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
		}),
});

const post = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string().max(60),
			description: z.string().min(10).max(160),
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
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.string().optional(),
		}),
});

export const collections = { post, research, project, teaching, thesis };
