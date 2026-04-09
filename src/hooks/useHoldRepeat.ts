import { useCallback, useEffect, useRef } from "react";

interface UseHoldRepeatOptions {
	/** ms to wait after press-down before the first auto-fire */
	initialDelay?: number;
	/** ms between auto-fires after the initial delay */
	interval?: number;
}

/**
 * Tap-and-hold repeater. The consumer keeps its existing onClick handler
 * for the single-tap (+1) case. This hook only handles what happens when
 * the press is held: after `initialDelay` it begins firing `action(args)`
 * every `interval` ms until `cancel()` is called.
 *
 * Wire `start(args)` from `onPointerDown` (or touchstart/mousedown) and
 * `cancel()` from up/leave/cancel — and from any gesture handler that
 * supersedes the press (drag-to-scroll, swipe-to-open-drawer, etc.) so
 * stray repeats don't outlive the press.
 */
export function useHoldRepeat<TArgs>(
	action: (args: TArgs) => void,
	{ initialDelay = 350, interval = 120 }: UseHoldRepeatOptions = {},
) {
	const initialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const repeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
	const didRepeat = useRef(false);

	const cancel = useCallback(() => {
		if (initialTimer.current) {
			clearTimeout(initialTimer.current);
			initialTimer.current = null;
		}
		if (repeatInterval.current) {
			clearInterval(repeatInterval.current);
			repeatInterval.current = null;
		}
	}, []);

	const start = useCallback(
		(args: TArgs) => {
			cancel();
			didRepeat.current = false;
			initialTimer.current = setTimeout(() => {
				initialTimer.current = null;
				didRepeat.current = true;
				action(args);
				repeatInterval.current = setInterval(() => {
					action(args);
				}, interval);
			}, initialDelay);
		},
		[action, initialDelay, interval, cancel],
	);

	useEffect(() => cancel, [cancel]);

	return { start, cancel, didRepeat };
}
