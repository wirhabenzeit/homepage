/** @jsxImportSource @builder.io/qwik */

import {
	component$,
	useSignal,
	useComputed$,
	noSerialize,
	useVisibleTask$,
} from "@builder.io/qwik";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

import { Chart } from "src/components/plot";
import { Range, Check } from "src/components/inputs";
import csv from "./real_emp.csv?raw";

type Data = {
	n: number;
	lamb: number;
	kappa: number;
	genErrRMT_emp: number;
	genErrEmp_emp: number;
	loss: number;
	epoch: number;
	step: number;
	"epoch+step": number;
	type: string;
};

const data = d3.csvParse(csv, (row) => ({
	n: parseInt(row.n),
	lamb: parseFloat(row.lamb),
	kappa: parseFloat(row.kappa),
	genErrRMT_emp: parseFloat(row.genErrRMT_emp),
	genErrEmp_emp: parseFloat(row.genErrEmp_emp),
	loss: parseFloat(row.loss),
	epoch: parseInt(row.epoch),
	step: parseInt(row.step),
	"epoch+step": parseFloat(row["epoch+step"]),
	type: row.type,
})) as Data[];

const epochs = Array.from(new Set(data.filter((x) => x.type == "NN").map((x) => x["epoch+step"])));

type HistogramProps = {
	epoch: number;
	loss: boolean;
	reg: boolean;
	emp: boolean;
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
};

export const plotOptions = ({
	epochstep,
	emp,
	reg,
	loss,
	width,
	height,
	legend = true,
	...opts
}) => {
	const df_NN = data.filter((x) => x.type == "NN" && x["epoch+step"] == epochstep);
	const df_reg = data.filter((x) => x.type == "Linear Regression");
	const plot_vars = { x: "n", stroke: (x) => `λ = ${x.lamb}`, y: "genErrRMT_emp" };
	const marks = [Plot.line(df_NN, { ...plot_vars, y: "genErrRMT_emp" })];
	if (emp) marks.push(Plot.dot(df_NN, { ...plot_vars, y: "genErrEmp_emp", symbol: "type" }));
	if (reg) {
		marks.push(
			Plot.line(df_reg, {
				...plot_vars,
				y: "genErrRMT_emp",
				strokeDasharray: "5,5",
				opacity: 0.5,
			}),
		);
		if (emp)
			marks.push(
				Plot.dot(df_reg, {
					...plot_vars,
					y: "genErrEmp_emp",
					opacity: 0.5,
					symbol: "type",
				}),
			);
	}
	if (loss) marks.push(Plot.line(df_NN, { ...plot_vars, y: "loss", stroke: "gray" }));

	return noSerialize({
		marks,
		symbol: {
			legend,
		},
		color: {
			legend,
			//scheme: "viridis",
			//range: [0.3, 0.9],
			label: "λ",
			type: "categorical",
		},
		width: width,
		height: height,
		x: { type: "log", label: "# Samples" },
		y: {
			domain: [0.04, 3],
			label: "Generalization error",
			type: "log",
		},
		grid: true,
		caption:
			"Generalization error of feature regrresion using either the Neural Network (NN) features or linear features. The solid lines represent the deterministic equivalents, while the dots represent the empirical generalization error. The grey line represents the gradient descent loss of the NN.",
		...opts,
	});
};

export const RealEmpPlot = component$<HistogramProps>(
	({ epoch, reg, emp, loss, autoplay = false, loop = false, delay = 100 }) => {
		const outputRef = useSignal<Element | null>(null);
		const epochstep = useSignal(epoch);
		const regSignal = useSignal(reg);
		const empSignal = useSignal(emp);
		const lossSignal = useSignal(loss);

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

		const chartOptions = useComputed$(() =>
			plotOptions({
				width: width.value,
				height: 400,
				epochstep: epochstep.value,
				emp: empSignal.value,
				reg: regSignal.value,
				loss: lossSignal.value,
			}),
		);

		const options = [
			{ signal: regSignal, label: "Linear Regression", id: "reg" },
			{ signal: empSignal, label: "Empirical Loss", id: "emp" },
			{ signal: lossSignal, label: "NN Loss", id: "loss" },
		];

		return (
			<div>
				<Range
					values={epochs}
					value={epochstep}
					autoplay={autoplay}
					loop={loop}
					delay={delay}
					label$={(value: number) => `Epoch = ${value == undefined ? "" : value.toFixed(2)}`}
				/>
				<div class="flex items-center gap-4">
					{options.map((option) => (
						<Check value={option.signal} label$={(checked) => option.label} id={option.id} />
					))}
				</div>
				<div ref={outputRef} class="-mt-5">
					<Chart options={chartOptions} />
				</div>
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
	const idx = useSignal(0);
	const playing = useSignal(false);

	useVisibleTask$(({ track }) => {
		track(() => idx.value);
		track(() => playing.value);
		if (playing.value) {
			const interval = setInterval(() => {
				idx.value = (idx.value + 1) % epochs.length;
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const chartOptions = useComputed$(() =>
		plotOptions({
			width,
			height,
			epochstep: epochs[idx.value],
			emp: false,
			reg: true,
			loss: false,
			legend: false,
			background: "white",
			caption: null,
		}),
	);

	return (
		<div onMouseEnter$={() => (playing.value = true)} onMouseLeave$={() => (playing.value = false)}>
			<Chart options={chartOptions} class={classList.join(" ")} />
		</div>
	);
});

export default RealEmpPlot;
