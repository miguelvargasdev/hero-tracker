import { useCallback, useState, type ReactNode } from "react";
import { FADE_MS, ViewTransitionContext } from "./viewTransitionContext";

export function ViewTransitionProvider({ children }: { children: ReactNode }) {
	const [isTransitioning, setIsTransitioning] = useState(false);

	const transitionTo = useCallback((action: () => void) => {
		setIsTransitioning(true);
		// Wait for the fade-to-black to finish, then perform the navigation
		// and release the overlay so the next view fades in from black.
		window.setTimeout(() => {
			action();
			requestAnimationFrame(() => setIsTransitioning(false));
		}, FADE_MS);
	}, []);

	return (
		<ViewTransitionContext.Provider value={{ isTransitioning, transitionTo }}>
			{children}
			<div
				aria-hidden
				style={{
					position: "fixed",
					inset: 0,
					backgroundColor: "#000",
					zIndex: 9998,
					opacity: isTransitioning ? 1 : 0,
					pointerEvents: isTransitioning ? "auto" : "none",
					transition: `opacity ${FADE_MS}ms ease-out`,
				}}
			/>
		</ViewTransitionContext.Provider>
	);
}
