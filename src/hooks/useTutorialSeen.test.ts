import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTutorialSeen } from "./useTutorialSeen";

const STORAGE_KEY = "hero-tracker-tutorial-seen";

describe("useTutorialSeen", () => {
	afterEach(() => {
		localStorage.clear();
	});

	it("returns false when the tutorial has never been dismissed", () => {
		const { result } = renderHook(() => useTutorialSeen());
		expect(result.current).toBe(false);
	});

	it("returns true once the tutorial has been marked as seen", () => {
		localStorage.setItem(STORAGE_KEY, "true");
		const { result } = renderHook(() => useTutorialSeen());
		expect(result.current).toBe(true);
	});

	it("treats any non-'true' value as not seen", () => {
		localStorage.setItem(STORAGE_KEY, "false");
		const { result } = renderHook(() => useTutorialSeen());
		expect(result.current).toBe(false);
	});
});
