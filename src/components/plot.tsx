/** @jsxImportSource @builder.io/qwik */

import {
	component$,
	useComputed$,
	useSignal,
	useVisibleTask$,
	type Signal,
	type QRL,
} from "@builder.io/qwik";

import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";

interface PlotFunction<T> {
	plotFunction: QRL<(x: T) => Plot.PlotOptions>;
	args: Signal<T>;
	class?: string;
	fullWidth?: boolean;
	fullHeight?: boolean;
	aspectRatio?: number;
}

export const Chart = component$<PlotFunction<any>>(
	({ plotFunction, args, class: classList, fullWidth, fullHeight, aspectRatio }) => {
		const jsdom = new JSDOM("");
		global.window = jsdom.window as unknown as Window & typeof globalThis;
		global.document = jsdom.window.document;
		global.Event = jsdom.window.Event;
		global.Node = jsdom.window.Node;
		global.NodeList = jsdom.window.NodeList;
		global.HTMLCollection = jsdom.window.HTMLCollection;

		const outputRef = useSignal<HTMLDivElement | null>(null);
		const width = useSignal(0);
		const height = useSignal(0);

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

		const chart = useComputed$(async () => {
			const plotarg = await plotFunction(args.value);
			return Plot.plot(plotarg).outerHTML;
		});

		useVisibleTask$(async ({ track }) => {
			if (!outputRef.value) return;
			if (fullHeight) track(() => height.value);
			if (fullWidth) track(() => width.value);
			track(() => args.value);
			const plotarg = await plotFunction(args.value);
			if (fullWidth && width.value > 0) {
				plotarg.width = width.value;
				if (aspectRatio) plotarg.height = width.value / aspectRatio;
			}
			if (fullHeight && height.value > 0) {
				plotarg.height = height.value;
				if (aspectRatio) plotarg.width = height.value * aspectRatio;
			}
			outputRef.value.innerHTML = "";
			outputRef.value.append(Plot.plot(plotarg));
		});

		return (
			<div
				class={classList ? classList + " not-prose" : "not-prose"}
				ref={outputRef}
				dangerouslySetInnerHTML={chart.value}
			/>
		);
	},
);
