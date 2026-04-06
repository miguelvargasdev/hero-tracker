import { useState, useCallback } from "react";

/**
 * Manages open/close animation state for modals and overlays.
 * `visible` controls mount, `exiting` controls exit animation class.
 */
export function useModalAnimation(duration = 180) {
	const [visible, setVisible] = useState(false);
	const [exiting, setExiting] = useState(false);

	const open = useCallback(() => {
		setVisible(true);
		setExiting(false);
	}, []);

	const close = useCallback(
		(onDone?: () => void) => {
			if (exiting) return;
			setExiting(true);
			setTimeout(() => {
				setVisible(false);
				setExiting(false);
				onDone?.();
			}, duration);
		},
		[duration, exiting],
	);

	return { visible, exiting, open, close };
}
