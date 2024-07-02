/** @jsxImportSource @builder.io/qwik */

import {
	$,
	component$,
	useSignal,
	useComputed$,
	noSerialize,
	useVisibleTask$,
} from "@builder.io/qwik";
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

const plotOptions = ({ lambda, width, height, ...opts }) => {
	const dataFiltered = data.filter((x) => x.lambda == lambda);
	return noSerialize({
		grid: true,
		color: { legend: true },
		y: { type: "sqrt", domain: [0, 1], label: "ρ" },
		x: { domain: [-2.5, 2.5] },
		width: width,
		height: height,
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
		...opts,
	});
};

export const Histogram = component$<HistogramProps>(
	({ lambda: lambdaInit, autoplay = false, loop = false, delay = 100 }) => {
		const lambda = useSignal(lambdaInit);
		const args = useComputed$(() => ({
			lambda: lambda.value,
			height: 300,
			caption:
				"The grey histogram represents the empirical distribution of sample covariance eigenvalues, while the solid curve is the spectral density of the corresponding free model. The coloured histograms represent the empirical distribution of the largest and smallest eigenvalues of the sample covariance matrix. Here √δ ≈ 0.45 so that the two phase transitions occur at λ ≈ 0.55 and λ ≈ 1.45.",
		}));

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
				<Chart
					args={args}
					plotFunction$={(args) => plotOptions(args)}
					fullWidth={true}
					aspectRatio={2}
					class="mt-3 rounded-lg border bg-bgColorAlt2 p-2"
				/>
			</div>
		);
	},
);

type HeroProps = {
	width: number;
	height: number;
	classList: string[];
};

export const Hero = component$<HeroProps>(({ width, height, classList }) => {
	const idx = useSignal(20);
	const playing = useSignal(false);
	const direction = useSignal(1);

	useVisibleTask$(({ track }) => {
		track(() => idx.value);
		track(() => playing.value);
		if (playing.value) {
			const interval = setInterval(() => {
				idx.value = idx.value + direction.value;
				if (idx.value == lambdas.length - 1 || idx.value == 0) {
					direction.value *= -1;
				}
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const args = useComputed$(() => ({
		width,
		height,
		lambda: lambdas[idx.value],
		color: { legend: false },
	}));

	return (
		<div onMouseEnter$={() => (playing.value = true)} onMouseLeave$={() => (playing.value = false)}>
			<Chart
				args={args}
				plotFunction$={(args) => plotOptions(args)}
				class={classList}
				fullWidth={true}
			/>
		</div>
	);
});
