import { getCollection } from "astro:content";

/** Note: this function filters out draft posts based on the environment */
export async function getAllPosts() {
	return await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export async function getAll(collection) {
	return await getCollection(collection, ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export function sortMDByDate(posts) {
	return posts.sort((a, b) => {
		const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf();
		const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf();
		return bDate - aDate;
	});
}

export function getAllTags(posts) {
	return posts.flatMap((post) => [...post.data.tags]);
}

export function getAllTypes(posts) {
	return posts.flatMap((post) => [...post.data.type]);
}

export function getUniqueTypes(posts) {
	return [...new Set(getAllTypes(posts))];
}

export function getUniqueTags(posts) {
	return [...new Set(getAllTags(posts))];
}

export function getUniqueTagsWithCount(posts): Array<[string, number]> {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
