import * as Plot from "@observablehq/plot";

type Data = {
	x0: number;
	x1: number;
	rho: number;
	lambda: number;
	type: string;
};

export type Args = {
	data: Data[];
	lambda: number;
	width: number;
};

export const plot = ({ data, lambda, width = 832 }: Args) => {
	const rect = {
		x1: "x0",
		x2: "x1",
		y2: "rho",
		y1: () => 0,
	};
	const dataFiltered = data.filter((x) => x.lambda == lambda);
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
