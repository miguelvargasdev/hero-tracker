import { useState } from "react";

const STORAGE_KEY = "hero-tracker-tutorial-seen";

/** Returns true if the tutorial has already been dismissed */
export function useTutorialSeen(): boolean {
	const [seen] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
	return seen;
}
