import {
	component$,
	useSignal,
	useTask$,
	useVisibleTask$,
	useComputed$,
	type Signal,
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
	id: string;
	label$: (value: boolean) => string;
};

export const Check = component$<CheckProps>(({ value, label$, id }) => {
	return (
		<div>
			<label class="label cursor-pointer">
				<input
					type="checkbox"
					name={id}
					class="toggle toggle-sm"
					checked={value.value}
					onInput$={() => (value.value = !value.value)}
				/>
				<span class="label-text ml-2">{label$(value.value)}</span>
			</label>
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
		const buttonLabel = useComputed$(() => (playing.value ? "⏸" : "⏵"));

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
						class="btn btn-sm"
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
						class="range range-xs mx-3 flex-grow"
						onInput$={(e) => {
							playing.value = false;
							idx.value = parseInt(e.target.value);
							direction.value = 1;
						}}
					/>
					<div class="badge badge-outline flex-shrink-0">{label$(values[idx.value])}</div>
				</label>
			</form>
		);
	},
);
