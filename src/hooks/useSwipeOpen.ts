import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 40;

/**
 * Detects a swipe in the rotation-aware "up" direction (toward the
 * player's top of the screen). Returns touch handlers and a `didFire`
 * ref so click handlers can suppress the resulting tap.
 */
export function useSwipeOpen(
	onSwipeOpen: () => void,
	{ rotation = 0, disabled = false }: { rotation?: number; disabled?: boolean } = {},
) {
	const start = useRef<{ x: number; y: number } | null>(null);
	const didFire = useRef(false);

	const isUpSwipe = (dx: number, dy: number) => {
		switch (((rotation % 360) + 360) % 360) {
			case 0:
				return dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx);
			case 180:
				return dy > SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx);
			case 90:
				return dx < -SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy);
			case 270:
				return dx > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy);
			default:
				return false;
		}
	};

	const onTouchStart = useCallback((e: React.TouchEvent) => {
		if (disabled) return;
		didFire.current = false;
		const t = e.touches[0];
		start.current = { x: t.clientX, y: t.clientY };
	}, [disabled]);

	const onTouchMove = useCallback((e: React.TouchEvent) => {
		if (disabled || !start.current || didFire.current) return;
		const t = e.touches[0];
		const dx = t.clientX - start.current.x;
		const dy = t.clientY - start.current.y;
		if (isUpSwipe(dx, dy)) {
			didFire.current = true;
			onSwipeOpen();
			setTimeout(() => { didFire.current = false; }, 0);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [disabled, onSwipeOpen, rotation]);

	const onTouchEnd = useCallback(() => {
		start.current = null;
	}, []);

	return {
		handlers: { onTouchStart, onTouchMove, onTouchEnd },
		didFire,
	};
}
