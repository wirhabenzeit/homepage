import {
	component$,
	useSignal,
	useTask$,
	useVisibleTask$,
	useComputed$,
	type Signal,
	type QRL,
} from "@builder.io/qwik";

type RangeProps = {
	value: Signal<number>;
	values: number[];
	autoplay?: boolean;
	loop?: boolean;
	delay?: number;
	loopDelay?: number;
	label$?: (value: number) => string;
};

type CheckProps = {
	value: Signal<boolean>;
	id?: string;
	label: QRL<(value: boolean) => string> | string;
};

export const Check = component$<CheckProps>(({ value, label, id }) => {
	const checkId = id ? id : Math.random().toString(36).substring(7);
	return (
		<div class="flex items-center">
			<input
				id={checkId}
				type="checkbox"
				checked={value.value}
				onInput$={() => (value.value = !value.value)}
				class="h-4 w-4 rounded bg-bgColorAlt text-accent"
			/>
			<label for={checkId} class="ms-2 text-xs font-medium">
				{typeof label === "function" ? label(value.value) : label}
			</label>
		</div>
	);
});

type SelectProps = {
	value: Signal<string>;
	options: string[];
	label: string;
};

export const Select = component$<SelectProps>(({ value, options, label }) => {
	return (
		<div class="flex items-center gap-2">
			<label class="text-sm font-medium">{label}</label>
			<select
				class="rounded border bg-bgColorAlt p-1 text-textColor"
				onInput$={(e) => (value.value = e.target.value)}
			>
				{options.map((option) => (
					<option value={option} selected={value.value === option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
});

export const Range = component$<RangeProps>(
	({
		value,
		values,
		autoplay = false,
		loop = false,
		delay = 100,
		label$ = (value: number) => value.toFixed(1),
	}) => {
		const idx = useSignal(values.indexOf(value.value));
		const playing = useSignal(autoplay);
		const direction = useSignal(1);
		const buttonLabel = useComputed$(() => (playing.value ? "\u23F8\uFE0E" : "\u23F5\uFE0E"));

		useVisibleTask$(({ track }) => {
			track(() => idx.value);
			track(() => playing.value);
			//onChange$(values[idx.value]);
			if (playing.value) {
				const interval = setInterval(() => {
					idx.value = (idx.value + direction.value) % values.length;
					if (idx.value == values.length - 1 || idx.value == 0) {
						if (loop) {
							direction.value = -direction.value;
						}
					}
				}, delay);
				return () => clearInterval(interval);
			}
		});

		useTask$(({ track }) => {
			track(() => idx.value);
			value.value = values[idx.value];
		});

		return (
			<form id="scrubber" class="dispay-flex">
				<label class="flex flex-grow items-center">
					<button
						name="b"
						type="button"
						class="h-8 w-8 rounded-lg border bg-bgColorAlt font-medium hover:bg-bgColorAlt2"
						onClick$={() => (playing.value = !playing.value)}
					>
						{buttonLabel.value}
					</button>
					<input
						name="i"
						type="range"
						min={0}
						max={values.length - 1}
						value={idx.value}
						step={1}
						class="mx-3 flex-grow cursor-pointer appearance-none bg-transparent focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-in-out [&::-moz-range-track]:h-2 [&::-moz-range-track]:w-full [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-bgColorAlt [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-bgColorAlt [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out"
						onInput$={(e) => {
							playing.value = false;
							idx.value = parseInt(e.target.value);
							direction.value = 1;
						}}
					/>
					<div class="flex-shrink-0 rounded border bg-bgColorAlt px-2.5 py-0.5 text-sm font-medium text-textColor">
						{label$(values[idx.value])}
					</div>
				</label>
			</form>
		);
	},
);
