import { component$, noSerialize, useSignal, useStyles$, useVisibleTask$ } from "@builder.io/qwik";

import mapboxgl from "mapbox-gl";
//import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";

import tnr from "./_tnr.json";

export default component$(() => {
	//	useStyles$(mapboxStyles);

	return <MapboxMap zoom={6.5} center={[8, 44.5]} />;
});

// The properties (props) used in the `LeafletMap` component and other related components are defined as follows:

export interface MapProps {
	zoom: number;
}

export interface LocationsProps {
	name: string;
	point: [number, number];
	zoom: number;
	marker: boolean;
}

export interface MarkersProps {
	name: string;
	label: string;
	lat: string;
	lon: string;
}

export const MapboxMap = component$<MapProps>(({ zoom, center }) => {
	const mapContainerSig = useSignal();
	console.log(tnr);

	useVisibleTask$(async ({}) => {
		if (mapContainerSig.value) {
			mapContainerSig.value.remove();
		}

		mapboxgl.accessToken =
			"pk.eyJ1Ijoid2lyaGFiZW56ZWl0IiwiYSI6ImNsanpzY243ZzAwMGkzcHFvMTRkdHA5OGoifQ.mAMIrIQzX5jJLBZs24eAlQ";
		const map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v12",
			center,
			zoom,
		});

		map.addControl(new mapboxgl.NavigationControl());
		map.addControl(new mapboxgl.FullscreenControl());

		map.on("load", () => {
			map.addSource("route", { type: "geojson", data: tnr });
			map.addLayer({
				id: "route",
				type: "line",
				source: "route",
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "red",
					"line-width": 2,
				},
			});
		});
		mapContainerSig.value = noSerialize(map);
	});

	return <div id="map" style={{ height: "25rem" }}></div>;
});
