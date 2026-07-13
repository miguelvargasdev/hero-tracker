import { useEffect } from "react";

/**
 * Keeps the screen from sleeping while mounted. The Wake Lock API releases
 * itself whenever the tab/window loses visibility (e.g. the OS locks the
 * screen or the user switches apps), so we re-request it on visibilitychange
 * rather than relying on a single request at mount time.
 */
export function useWakeLock(enabled: boolean) {
	useEffect(() => {
		if (!enabled || !("wakeLock" in navigator)) return;

		let sentinel: WakeLockSentinel | null = null;
		let cancelled = false;

		const requestLock = async () => {
			try {
				const lock = await navigator.wakeLock.request("screen");
				if (cancelled) {
					await lock.release();
					return;
				}
				sentinel = lock;
			} catch {
				// Wake lock can be denied (e.g. low battery, backgrounded tab);
				// fail silently since sleeping is the pre-existing behavior.
			}
		};

		requestLock();

		const onVisibilityChange = () => {
			if (document.visibilityState === "visible" && sentinel === null) {
				requestLock();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisibilityChange);
			sentinel?.release();
			sentinel = null;
		};
	}, [enabled]);
}
