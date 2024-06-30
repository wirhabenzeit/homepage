import { $, useSignal, component$, useComputed$ } from "@builder.io/qwik";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

import { Chart } from "src/components/plot";
import { Select } from "src/components/inputs";

import csv from "./penguins.csv?raw";
const penguins = d3.csvParse(csv, d3.autoType);

export const Example = component$(() => {
	const colorby = useSignal("species");
	const symbolby = useSignal("island");
	const args = useComputed$(() => ({ stroke: colorby.value, symbol: symbolby.value }));
	const plotFun = $(({ stroke, symbol }: { stroke: string; symbol: string }) => ({
		grid: true,
		color: { legend: true },
		symbol: { legend: true },
		height: 300,
		width: 832,
		marks: [
			Plot.dot(penguins, {
				x: "culmen_length_mm",
				y: "culmen_depth_mm",
				tip: true,
				stroke,
				symbol,
			}),
		],
		title: "Penguin Culmen Length vs Depth",
		subtitle: "Data from Palmer Station, Antarctica",
		caption:
			"Horst AM, Hill AP, Gorman KB (2020). palmerpenguins: Palmer Archipelago (Antarctica) penguin data.",
	}));
	return (
		<div>
			<div class="mb-2 flex gap-5">
				<Select value={colorby} options={["species", "island", "sex"]} label="Color" />
				<Select value={symbolby} options={["species", "island", "sex"]} label="Symbol" />
			</div>
			<Chart plotFunction={plotFun} args={args} fullWidth={true} />
		</div>
	);
});
