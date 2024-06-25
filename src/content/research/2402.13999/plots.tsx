/** @jsxImportSource @builder.io/qwik */

import { component$, useSignal, useComputed$ } from "@builder.io/qwik";
import { JSDOM } from "jsdom";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

import { Range } from "../../../components/range";
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

//console.log(data.slice(0, 5), parseFloat("1.0"), (1).toFixed(1));

type Args = {
	epochstep: number;
	reg: boolean;
	emp: boolean;
	loss: boolean;
};

const plot = ({ epochstep, reg, emp, loss }: Args) => {
	const df_NN = data.filter((x) => x.type == "NN" && x["epoch+step"] == epochstep);
	const df_reg = data.filter((x) => x.type == "Linear Regression");
	const plot_vars = { x: "n", stroke: "lamb", y: "genErrRMT_emp" };
	const marks = [Plot.line(df_NN, { ...plot_vars, y: "genErrRMT_emp" })];
	if (emp) marks.push(Plot.dot(df_NN, { ...plot_vars, y: "genErrEmp_emp", symbol: "type" }));
	if (reg) {
		marks.push(
			Plot.line(df_reg, { ...plot_vars, y: "genErrRMT_emp", strokeDasharray: "5,5", opacity: 0.3 }),
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

	return Plot.plot({
		marks,
		symbol: {
			legend: true,
		},
		color: {
			legend: true,
			scheme: "viridis",
			label: "λ",
			type: "log",
		},
		width: 832,
		height: 300,
		x: { type: "log", label: "# Samples" },
		y: {
			domain: [0.04, 3],
			label: "Generalization error",
			type: "log",
		},
		grid: true,
		caption:
			"Generalization error of feature regrresion using either the Neural Network (NN) features or linear features. The solid lines represent the deterministic equivalents, while the dots represent the empirical generalization error. The grey line represents the gradient descent loss of the NN.",
	});
};

type HistogramProps = {
	epoch: number;
	loss: boolean;
	reg: boolean;
	emp: boolean;
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
};

export const RealEmpPlot = component$<HistogramProps>(
	({ epoch, reg, emp, loss, autoplay = false, loop = false, delay = 100 }) => {
		const jsdom = new JSDOM("");
		global.window = jsdom.window as unknown as Window & typeof globalThis;
		global.document = jsdom.window.document;
		global.Event = jsdom.window.Event;
		global.Node = jsdom.window.Node;
		global.NodeList = jsdom.window.NodeList;
		global.HTMLCollection = jsdom.window.HTMLCollection;

		const args = useSignal({ epochstep: epoch, reg, emp, loss });
		const chart = useComputed$(() => plot(args.value).outerHTML);

		const options = [
			{ key: "reg", label: "Linear Regression" },
			{ key: "emp", label: "Empirical Loss" },
			{ key: "loss", label: "NN Loss" },
		];

		return (
			<div>
				<Range
					values={epochs}
					value={epoch}
					autoplay={autoplay}
					loop={loop}
					delay={delay}
					onChange$={(value: number) => {
						args.value.epochstep = value;
						chart.value = plot(args.value).outerHTML;
					}}
					label$={(value: number) => `Epoch = ${value == undefined ? "" : value.toFixed(2)}`}
				/>
				<div class="flex items-center gap-4">
					{options.map((option) => (
						<span>
							<input
								type="checkbox"
								id={option.key}
								class="mr-2 leading-tight"
								checked={args.value[option.key]}
								onInput$={() => {
									args.value[option.key] = !args.value[option.key];
									chart.value = plot(args.value).outerHTML;
								}}
							/>
							<label for={option.key} class="text-sm">
								{option.label}
							</label>
						</span>
					))}
				</div>
				<div dangerouslySetInnerHTML={chart.value} class="-mt-5" />
			</div>
		);
	},
);
