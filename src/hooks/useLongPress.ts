import { useRef, useEffect, useCallback } from "react";

const MOVE_THRESHOLD = 10;

interface UseLongPressOptions {
	delay?: number;
	disabled?: boolean;
}

/**
 * Detects long-press on touch and mouse, with motion cancellation.
 * Returns event handlers to spread onto the target element and a
 * `didFire` ref to check whether the press triggered (to suppress click).
 */
export function useLongPress(
	onLongPress: () => void,
	{ delay = 500, disabled = false }: UseLongPressOptions = {},
) {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const didFire = useRef(false);
	const touchStart = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);

	const start = useCallback(() => {
		if (disabled) return;
		didFire.current = false;
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			didFire.current = true;
			onLongPress();
			timer.current = null;
		}, delay);
	}, [onLongPress, delay, disabled]);

	const cancel = useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current);
			timer.current = null;
		}
	}, []);

	const handlers = {
		onTouchStart: useCallback(
			(e: React.TouchEvent) => {
				const t = e.touches[0];
				touchStart.current = { x: t.clientX, y: t.clientY };
				start();
			},
			[start],
		),
		onTouchMove: useCallback(
			(e: React.TouchEvent) => {
				if (!touchStart.current || !timer.current) return;
				const t = e.touches[0];
				const dx = t.clientX - touchStart.current.x;
				const dy = t.clientY - touchStart.current.y;
				if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) cancel();
			},
			[cancel],
		),
		onTouchEnd: useCallback(() => {
			cancel();
			touchStart.current = null;
		}, [cancel]),
		onMouseDown: start,
		onMouseUp: cancel,
		onMouseLeave: cancel,
	};

	return { handlers, didFire };
}
