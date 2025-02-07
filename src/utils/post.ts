import type { CollectionEntry, CollectionKey } from "astro:content";
//import { getCollection } from "astro:content";

/** Note: this function filters out draft posts based on the environment */
export async function getAllPosts() {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export async function getAll() {
	const collectionNames = ["post", "research", "thesis", "project"] as CollectionKey[];
	const collectionsPromises = collectionNames.map((name) => getCollection(name));
	const collections = await Promise.all(collectionsPromises);
	return collections.flat();
}

export function sortMDByDate(posts: Array<CollectionEntry<"post">>) {
	return posts.sort((a, b) => {
		const aDate = new Date(a.data.updatedDate ?? a.data.publishDate).valueOf();
		const bDate = new Date(b.data.updatedDate ?? b.data.publishDate).valueOf();
		return bDate - aDate;
	});
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllTags(
	posts: Array<
		| CollectionEntry<"post">
		| CollectionEntry<"research">
		| CollectionEntry<"thesis">
		| CollectionEntry<"teaching">
		| CollectionEntry<"project">
	>,
) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTags(
	posts: Array<
		| CollectionEntry<"post">
		| CollectionEntry<"research">
		| CollectionEntry<"thesis">
		| CollectionEntry<"teaching">
		| CollectionEntry<"project">
	>,
) {
	return [...new Set(getAllTags(posts))];
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTagsWithCount(
	posts: Array<
		| CollectionEntry<"post">
		| CollectionEntry<"research">
		| CollectionEntry<"thesis">
		| CollectionEntry<"teaching">
		| CollectionEntry<"project">
	>,
): Array<[string, number]> {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
