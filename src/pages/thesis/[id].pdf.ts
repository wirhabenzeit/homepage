import type { APIRoute } from "astro";
import fs from "fs";
import { getCollection } from "astro:content";

export const GET: APIRoute = async function GET({ props }) {
	const file = fs.readFileSync(`./src/content/thesis/${props.id}/thesis.pdf`, "binary");
	const buffer = Buffer.from(file, "binary");
	return new Response(buffer, {
		headers: {
			"Content-Type": "application/pdf",
		},
	});
};

export const getStaticPaths = async () => {
	const blogEntries = await getCollection("thesis");
	return blogEntries.map((entry) => {
		return {
			params: { id: entry.slug },
			props: { id: entry.slug },
		};
	});
};
