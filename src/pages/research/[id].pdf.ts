import type { APIRoute } from "astro";
import fs from "fs";
import { getAll } from "@/utils";

export const GET: APIRoute = async function GET({ props }) {
	console.log(props);
	const file = fs.readFileSync(`./src/content/research/${props.arxiv}/paper.pdf`, "binary");
	const buffer = Buffer.from(file, "binary");
	return new Response(buffer, {
		headers: {
			"Content-Type": "application/pdf",
		},
	});
};

export const getStaticPaths = async () => {
	const blogEntries = await getAll("research");
	return blogEntries.map((entry) => {
		return {
			params: { id: entry.slug },
			props: { arxiv: entry.data.arxiv },
		};
	});
};
