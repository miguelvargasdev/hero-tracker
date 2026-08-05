import { createContext } from "react";

/** Duration of each leg (fade-in + fade-out) in ms. */
export const FADE_MS = 200;

export interface ViewTransitionContextValue {
	isTransitioning: boolean;
	/**
	 * Fade the screen to black, run `action`, then fade back in.
	 * `action` should perform the navigation (e.g. navigateTo / startGame).
	 */
	transitionTo: (action: () => void) => void;
}

export const ViewTransitionContext =
	createContext<ViewTransitionContextValue | null>(null);
