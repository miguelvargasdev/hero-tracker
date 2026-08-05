import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHoldRepeat } from "./useHoldRepeat";

describe("useHoldRepeat", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not fire before the initial delay elapses", () => {
		const action = vi.fn();
		const { result } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 350, interval: 120 }),
		);

		act(() => result.current.start("a"));
		act(() => vi.advanceTimersByTime(349));

		expect(action).not.toHaveBeenCalled();
	});

	it("fires once after the initial delay", () => {
		const action = vi.fn();
		const { result } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 350, interval: 120 }),
		);

		act(() => result.current.start("a"));
		act(() => vi.advanceTimersByTime(350));

		expect(action).toHaveBeenCalledTimes(1);
		expect(action).toHaveBeenCalledWith("a");
		expect(result.current.didRepeat.current).toBe(true);
	});

	it("repeats at the configured interval after the initial fire", () => {
		const action = vi.fn();
		const { result } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 350, interval: 120 }),
		);

		act(() => result.current.start("a"));
		act(() => vi.advanceTimersByTime(350)); // 1st fire
		act(() => vi.advanceTimersByTime(120)); // 2nd fire
		act(() => vi.advanceTimersByTime(120)); // 3rd fire

		expect(action).toHaveBeenCalledTimes(3);
	});

	it("cancel() before the initial delay prevents any fire", () => {
		const action = vi.fn();
		const { result } = renderHook(() => useHoldRepeat(action));

		act(() => result.current.start("a"));
		act(() => result.current.cancel());
		act(() => vi.advanceTimersByTime(10_000));

		expect(action).not.toHaveBeenCalled();
	});

	it("cancel() after repeating stops further fires", () => {
		const action = vi.fn();
		const { result } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 100, interval: 50 }),
		);

		act(() => result.current.start("a"));
		act(() => vi.advanceTimersByTime(100)); // 1 fire
		act(() => vi.advanceTimersByTime(50)); // 2 fires
		act(() => result.current.cancel());
		act(() => vi.advanceTimersByTime(500));

		expect(action).toHaveBeenCalledTimes(2);
	});

	it("calling start() again resets any pending/active repeat", () => {
		const action = vi.fn();
		const { result } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 100, interval: 50 }),
		);

		act(() => result.current.start("first"));
		act(() => vi.advanceTimersByTime(60)); // mid-way through initial delay
		act(() => result.current.start("second")); // restarts the timer
		act(() => vi.advanceTimersByTime(60)); // would have fired "first" at t=100 total, but restarted

		expect(action).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(40)); // now 100ms since the restart
		expect(action).toHaveBeenCalledTimes(1);
		expect(action).toHaveBeenCalledWith("second");
	});

	it("cancels pending timers on unmount", () => {
		const action = vi.fn();
		const { result, unmount } = renderHook(() =>
			useHoldRepeat(action, { initialDelay: 100 }),
		);

		act(() => result.current.start("a"));
		unmount();
		act(() => vi.advanceTimersByTime(10_000));

		expect(action).not.toHaveBeenCalled();
	});
});
