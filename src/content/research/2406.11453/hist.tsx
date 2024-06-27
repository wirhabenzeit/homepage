/** @jsxImportSource @builder.io/qwik */

import {
	$,
	component$,
	useSignal,
	useComputed$,
	noSerialize,
	useVisibleTask$,
	useTask$,
	type Signal,
} from "@builder.io/qwik";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

import { Chart } from "src/components/plot";
import { Range } from "src/components/inputs";
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

type HistogramProps = {
	lambda: number;
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
};

export const Histogram = component$<HistogramProps>(
	({ lambda: lambdaInit, autoplay = false, loop = false, delay = 100 }) => {
		const jsdom = new JSDOM("");
		global.window = jsdom.window as unknown as Window & typeof globalThis;
		global.document = jsdom.window.document;
		global.Event = jsdom.window.Event;
		global.Node = jsdom.window.Node;
		global.NodeList = jsdom.window.NodeList;
		global.HTMLCollection = jsdom.window.HTMLCollection;

		const outputRef = useSignal<Element | null>(null);

		const width = useSignal(832);
		useVisibleTask$(({ track }) => {
			track(() => outputRef.value);
			if (outputRef.value) {
				const ro = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const rect = entry.contentRect;
						width.value = rect.width;
					}
				});
				ro.observe(outputRef.value);
				return () => ro.disconnect();
			}
		});

		const lambda = useSignal(lambdaInit);
		const chartOptions = useComputed$(() => {
			const dataFiltered = data.filter((x) => x.lambda == lambda.value);
			return noSerialize({
				grid: true,
				color: { legend: true },
				y: { type: "sqrt", domain: [0, 1], label: "ρ" },
				caption:
					"The grey histogram represents the empirical distribution of sample covariance eigenvalues, while the solid curve is the spectral density of the corresponding free model. The coloured histograms represent the empirical distribution of the largest and smallest eigenvalues of the sample covariance matrix. Here √δ ≈ 0.45 so that the two phase transitions occur at λ ≈ 0.55 and λ ≈ 1.45.",
				x: { domain: [-2.5, 2.5] },
				width: width.value,
				height: width.value * 0.5,
				marks: [
					Plot.rect(
						dataFiltered.filter((x) => x.type == "emp"),
						{
							x1: "x0",
							x2: "x1",
							y2: "rho",
							y1: () => 0,
							opacity: 0.2,
						},
					),
					...["Max", "Min"].map((type) =>
						Plot.rect(
							dataFiltered.filter((x) => x.type == `emp${type}`),
							{
								x1: "x0",
								x2: "x1",
								y2: "rho",
								y1: () => 0,
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
		});

		return (
			<div>
				<Range
					values={lambdas}
					value={lambda}
					autoplay={autoplay}
					loop={loop}
					delay={delay}
					label$={(value: number) => `λ = ${value.toFixed(1)}`}
				/>
				<div ref={outputRef} class="-mt-5">
					<Chart options={chartOptions} />
				</div>
			</div>
		);
	},
);
