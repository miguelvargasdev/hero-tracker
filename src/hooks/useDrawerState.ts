import { useState, useCallback } from "react";

type DrawerState = "closed" | "opening" | "open" | "closing";

/**
 * Manages a four-phase drawer animation: closed → opening → open → closing → closed.
 * Uses double-rAF for the opening transition to ensure the browser paints
 * the initial state before applying the "open" class.
 */
export function useDrawerState() {
	const [state, setState] = useState<DrawerState>("closed");

	const open = useCallback(() => {
		setState("opening");
		requestAnimationFrame(() => {
			requestAnimationFrame(() => setState("open"));
		});
	}, []);

	const close = useCallback((onDone?: () => void) => {
		setState("closing");
		setTimeout(() => {
			setState("closed");
			onDone?.();
		}, 300);
	}, []);

	const reset = useCallback(() => setState("closed"), []);

	return { drawerState: state, openDrawer: open, closeDrawer: close, resetDrawer: reset };
}
