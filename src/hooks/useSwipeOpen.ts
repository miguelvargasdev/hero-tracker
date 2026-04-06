import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 30;

/**
 * Detects a swipe gesture to open a drawer.
 * Swipe direction is rotation-aware (swipe toward the drawer's entry edge):
 *   0°  → swipe up    180° → swipe down
 *   90° → swipe left  270° → swipe right
 *
 * Returns handlers to spread onto the target element and a `didSwipe` ref
 * to suppress the subsequent click event.
 */
export function useSwipeOpen(
	onSwipe: () => void,
	{ rotation = 0, disabled = false }: { rotation?: number; disabled?: boolean } = {},
) {
	const didSwipe = useRef(false);
	const touchStart = useRef<{ x: number; y: number } | null>(null);
	const mouseStart = useRef<{ x: number; y: number } | null>(null);

	const checkSwipe = useCallback(
		(dx: number, dy: number) => {
			if (disabled) return false;
			const norm = ((rotation % 360) + 360) % 360;
			switch (norm) {
				case 0:
					return dy < -SWIPE_THRESHOLD && Math.abs(dx) < Math.abs(dy);
				case 180:
					return dy > SWIPE_THRESHOLD && Math.abs(dx) < Math.abs(dy);
				case 90:
					return dx < -SWIPE_THRESHOLD && Math.abs(dy) < Math.abs(dx);
				case 270:
					return dx > SWIPE_THRESHOLD && Math.abs(dy) < Math.abs(dx);
				default:
					return false;
			}
		},
		[rotation, disabled],
	);

	const handlers = {
		onTouchStart: useCallback((e: React.TouchEvent) => {
			const t = e.touches[0];
			touchStart.current = { x: t.clientX, y: t.clientY };
			didSwipe.current = false;
		}, []),
		onTouchEnd: useCallback(
			(e: React.TouchEvent) => {
				if (!touchStart.current) return;
				const t = e.changedTouches[0];
				const dx = t.clientX - touchStart.current.x;
				const dy = t.clientY - touchStart.current.y;
				touchStart.current = null;
				if (checkSwipe(dx, dy)) {
					didSwipe.current = true;
					onSwipe();
				}
			},
			[checkSwipe, onSwipe],
		),
		onMouseDown: useCallback((e: React.MouseEvent) => {
			mouseStart.current = { x: e.clientX, y: e.clientY };
			didSwipe.current = false;
		}, []),
		onMouseUp: useCallback(
			(e: React.MouseEvent) => {
				if (!mouseStart.current) return;
				const dx = e.clientX - mouseStart.current.x;
				const dy = e.clientY - mouseStart.current.y;
				mouseStart.current = null;
				if (checkSwipe(dx, dy)) {
					didSwipe.current = true;
					onSwipe();
				}
			},
			[checkSwipe, onSwipe],
		),
	};

	return { handlers, didSwipe };
}
