import * as Plot from "@observablehq/plot";

const isCLientSide = typeof window !== "undefined";

if (!isCLientSide) {
	const { JSDOM } = await import("jsdom");
	const jsdom = new JSDOM("");
	global.window = jsdom.window as any as Window & typeof globalThis;
	global.document = jsdom.window.document;
	global.Event = jsdom.window.Event;
	global.Node = jsdom.window.Node;
	global.NodeList = jsdom.window.NodeList;
	global.HTMLCollection = jsdom.window.HTMLCollection;
}

export type Data = {
	x0: number;
	x1: number;
	rho: number;
	type: string;
	lambda: number;
};

export const plot = ({
	data,
	filter = () => true,
	width = 832,
}: {
	data: Data[];
	width: number;
	filter: (d: Data) => boolean;
}) => {
	const rect = {
		x1: "x0",
		x2: "x1",
		y2: "rho",
		y1: () => 0,
	};
	const dataFiltered = data.filter(filter);
	return Plot.plot({
		grid: true,
		color: { legend: true },
		y: { type: "sqrt", domain: [0, 1], label: "ρ" },
		caption:
			"The grey histogram represents the empirical distribution of sample covariance eigenvalues, while the solid curve is the spectral density of the corresponding free model. The coloured histograms represent the empirical distribution of the largest and smallest eigenvalues of the sample covariance matrix. Here √δ ≈ 0.45 so that the two phase transitions occur at λ ≈ 0.55 and λ ≈ 1.45.",
		x: { domain: [-2.5, 2.5] },
		width: width,
		height: width * 0.5,
		marks: [
			Plot.rect(
				dataFiltered.filter((x) => x.type == "emp"),
				{
					...rect,
					opacity: 0.2,
				},
			),
			...["Max", "Min"].map((type) =>
				Plot.rect(
					dataFiltered.filter((x) => x.type == `emp${type}`),
					{
						...rect,
						opacity: 0.5,
						fill: () => type,
					},
				),
			),
			Plot.line(
				dataFiltered.filter((x) => x.type == "free"),
				{
					x: "x",
					y: "rho",
				},
			),
		],
	});
};
