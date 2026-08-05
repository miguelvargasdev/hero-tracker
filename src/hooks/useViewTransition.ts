import { useContext } from "react";
import { ViewTransitionContext } from "./viewTransitionContext";

export function useViewTransition() {
	const ctx = useContext(ViewTransitionContext);
	if (!ctx) {
		throw new Error(
			"useViewTransition must be used within ViewTransitionProvider",
		);
	}
	return ctx;
}
