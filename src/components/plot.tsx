/** @jsxImportSource @builder.io/qwik */

import {
	component$,
	useComputed$,
	type NoSerialize,
	type Signal,
	isSignal,
} from "@builder.io/qwik";
import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";

export const Chart = component$<{
	options: Signal<NoSerialize<Plot.PlotOptions>> | NoSerialize<Plot.PlotOptions>;
	class?: string;
}>(({ options, class: classList }) => {
	const jsdom = new JSDOM("");
	global.window = jsdom.window as unknown as Window & typeof globalThis;
	global.document = jsdom.window.document;
	global.Event = jsdom.window.Event;
	global.Node = jsdom.window.Node;
	global.NodeList = jsdom.window.NodeList;
	global.HTMLCollection = jsdom.window.HTMLCollection;

	const chart = useComputed$(
		() => Plot.plot(isSignal(options) ? options.value : options).outerHTML,
	);

	return <div dangerouslySetInnerHTML={chart.value} class={classList} />;
});
