/** @jsxImportSource @builder.io/qwik */

import { component$, useSignal, useComputed$ } from "@builder.io/qwik";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

import { Range } from "../../../components/range";
import csv from "./scovAnim.csv?raw";

type Data = {
	x0: number;
	x1: number;
	rho: number;
	lambda: number;
	type: string;
};

const data = d3.csvParse(csv, d3.autoType) as Data[];
const lambdas = Array.from(new Set(data.map((x) => x.lambda)));

type Args = {
	lambda: number;
	width: number;
};

const plot = ({ lambda, width = 832 }: Args) => {
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

type HistogramProps = {
	lambda: number;
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
};

export const Histogram = component$<HistogramProps>(
	({ lambda, autoplay = false, loop = false, delay = 100 }) => {
		const jsdom = new JSDOM("");
		global.window = jsdom.window as unknown as Window & typeof globalThis;
		global.document = jsdom.window.document;
		global.Event = jsdom.window.Event;
		global.Node = jsdom.window.Node;
		global.NodeList = jsdom.window.NodeList;
		global.HTMLCollection = jsdom.window.HTMLCollection;

		const args = useSignal({ lambda, width: 832 });
		const chart = useComputed$(() => plot(args.value).outerHTML);

		return (
			<div>
				<Range
					values={lambdas}
					value={lambda}
					autoplay={autoplay}
					loop={loop}
					delay={delay}
					onChange$={(value: number) => {
						args.value.lambda = value;
						chart.value = plot(args.value).outerHTML;
					}}
					label$={(value: number) => `λ = ${value.toFixed(1)}`}
				/>
				<div dangerouslySetInnerHTML={chart.value} class="-mt-5" />
			</div>
		);
	},
);
