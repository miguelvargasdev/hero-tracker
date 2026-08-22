import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFloatingNumbers } from "./useFloatingNumbers";

describe("useFloatingNumbers", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts with no floaters", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		expect(result.current.floaters).toEqual([]);
	});

	it("spawn(true) adds a floater with value +1", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		act(() => result.current.spawn(true));

		expect(result.current.floaters).toHaveLength(1);
		expect(result.current.floaters[0].value).toBe(1);
	});

	it("spawn(false) adds a floater with value -1", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		act(() => result.current.spawn(false));

		expect(result.current.floaters[0].value).toBe(-1);
	});

	it("each spawned floater gets a unique id", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		act(() => {
			result.current.spawn(true);
			result.current.spawn(true);
		});

		const ids = result.current.floaters.map((f) => f.id);
		expect(new Set(ids).size).toBe(2);
	});

	it("removes the floater automatically after 800ms", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		act(() => result.current.spawn(true));
		expect(result.current.floaters).toHaveLength(1);

		act(() => vi.advanceTimersByTime(800));
		expect(result.current.floaters).toHaveLength(0);
	});

	it("removes only the expired floater, not later ones", () => {
		const { result } = renderHook(() => useFloatingNumbers());
		act(() => result.current.spawn(true));
		act(() => vi.advanceTimersByTime(400));
		act(() => result.current.spawn(true)); // spawned 400ms later

		act(() => vi.advanceTimersByTime(400)); // first floater's 800ms elapses
		expect(result.current.floaters).toHaveLength(1);

		act(() => vi.advanceTimersByTime(400)); // second floater's 800ms elapses
		expect(result.current.floaters).toHaveLength(0);
	});

	it("clears pending removal timers on unmount without throwing", () => {
		const { result, unmount } = renderHook(() => useFloatingNumbers());
		act(() => result.current.spawn(true));
		expect(() => unmount()).not.toThrow();
	});
});
