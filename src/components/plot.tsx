import {
	component$,
	useComputed$,
	useSignal,
	useVisibleTask$,
	type Signal,
	type QRL,
	useTask$,
} from "@builder.io/qwik";
import styles from "./plot.module.css";

import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";

interface ChartProps<T> {
	plotFunction$: QRL<(x: T) => Plot.PlotOptions>;
	args: Signal<T>;
	class?: string;
	fullWidth?: boolean;
	fullHeight?: boolean;
	aspectRatio?: number;
}

const renderJSDOM = (options: Plot.PlotOptions) => {
	const jsdom = new JSDOM("");
	return Plot.plot({ ...options, document: jsdom.window.document }).outerHTML;
};

export const Chart = component$<ChartProps<any>>(
	({ plotFunction$, args, class: classList, fullWidth, fullHeight, aspectRatio }) => {
		const outputRef = useSignal<HTMLDivElement | null>(null);
		const width = useSignal(0);
		const height = useSignal(0);
		const chart = useSignal<string>("");

		useVisibleTask$(({ track }) => {
			track(() => outputRef.value);
			if (outputRef.value) {
				const ro = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const rect = entry.contentRect;
						width.value = rect.width;
						height.value = rect.height;
					}
				});
				ro.observe(outputRef.value);
				return () => ro.disconnect();
			}
		});

		useTask$(async () => {
			chart.value = renderJSDOM(await plotFunction$(args.value));
		});

		useVisibleTask$(async ({ track }) => {
			if (!outputRef.value) return;
			if (fullHeight) track(() => height.value);
			if (fullWidth) track(() => width.value);
			track(() => args.value);
			const plotarg = await plotFunction$(args.value);
			if (fullWidth && width.value > 0) {
				plotarg.width = width.value;
				if (aspectRatio) plotarg.height = width.value / aspectRatio;
			}
			if (fullHeight && height.value > 0) {
				plotarg.height = height.value;
				if (aspectRatio) plotarg.width = height.value * aspectRatio;
			}
			const currentChart = outputRef.value.firstChild;
			if (currentChart) outputRef.value.removeChild(currentChart);
			outputRef.value.appendChild(Plot.plot(plotarg));
		});

		return (
			<div
				class={[classList, styles.container, "not-prose"]}
				ref={outputRef}
				dangerouslySetInnerHTML={chart.value}
			/>
		);
	},
);
