import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";

/** Duration of each leg (fade-in + fade-out) in ms. */
const FADE_MS = 280;

interface ViewTransitionContextValue {
	isTransitioning: boolean;
	/**
	 * Fade the screen to black, run `action`, then fade back in.
	 * `action` should perform the navigation (e.g. navigateTo / startGame).
	 */
	transitionTo: (action: () => void) => void;
}

const ViewTransitionContext = createContext<ViewTransitionContextValue | null>(null);

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

export function useViewTransition() {
	const ctx = useContext(ViewTransitionContext);
	if (!ctx) {
		throw new Error("useViewTransition must be used within ViewTransitionProvider");
	}
	return ctx;
}
