import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useModalAnimation } from "./useModalAnimation";

describe("useModalAnimation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts hidden and not exiting", () => {
		const { result } = renderHook(() => useModalAnimation());
		expect(result.current.visible).toBe(false);
		expect(result.current.exiting).toBe(false);
	});

	it("open() makes it visible and clears exiting", () => {
		const { result } = renderHook(() => useModalAnimation());
		act(() => result.current.open());
		expect(result.current.visible).toBe(true);
		expect(result.current.exiting).toBe(false);
	});

	it("close() sets exiting immediately, then unmounts after the duration", () => {
		const { result } = renderHook(() => useModalAnimation(180));
		act(() => result.current.open());

		act(() => result.current.close());
		expect(result.current.visible).toBe(true);
		expect(result.current.exiting).toBe(true);

		act(() => vi.advanceTimersByTime(180));
		expect(result.current.visible).toBe(false);
		expect(result.current.exiting).toBe(false);
	});

	it("close() calls onDone once the exit animation finishes", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() => useModalAnimation(180));
		act(() => result.current.open());

		act(() => result.current.close(onDone));
		expect(onDone).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(180));
		expect(onDone).toHaveBeenCalledTimes(1);
	});

	it("a second close() while already exiting is a no-op (doesn't restart the timer)", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() => useModalAnimation(180));
		act(() => result.current.open());

		act(() => result.current.close(onDone));
		act(() => vi.advanceTimersByTime(100));
		act(() => result.current.close(onDone)); // should be ignored - already exiting
		act(() => vi.advanceTimersByTime(80)); // total 180ms since the first close()

		expect(onDone).toHaveBeenCalledTimes(1);
	});

	it("respects a custom duration", () => {
		const { result } = renderHook(() => useModalAnimation(500));
		act(() => result.current.open());
		act(() => result.current.close());

		act(() => vi.advanceTimersByTime(499));
		expect(result.current.visible).toBe(true);

		act(() => vi.advanceTimersByTime(1));
		expect(result.current.visible).toBe(false);
	});
});
