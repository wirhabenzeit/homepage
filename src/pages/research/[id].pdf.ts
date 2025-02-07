import type { APIRoute } from "astro";
import fs from "fs";
import { getCollection } from "astro:content";

export const GET: APIRoute = async function GET({ props }) {
	const file = fs.readFileSync(`./src/content/research/${props.arxiv}/paper.pdf`, "binary");
	const buffer = Buffer.from(file, "binary");
	return new Response(buffer, {
		headers: {
			"Content-Type": "application/pdf",
		},
	});
};

export const getStaticPaths = async () => {
	const blogEntries = await getCollection("research");
	return blogEntries.map((entry) => {
		return {
			params: { id: entry.id },
			props: { arxiv: entry.data.arxiv },
		};
	});
};
