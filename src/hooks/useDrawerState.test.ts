import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDrawerState } from "./useDrawerState";

describe("useDrawerState", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts closed", () => {
		const { result } = renderHook(() => useDrawerState());
		expect(result.current.drawerState).toBe("closed");
	});

	it("openDrawer transitions closed -> opening -> open across two animation frames", () => {
		const { result } = renderHook(() => useDrawerState());

		act(() => result.current.openDrawer());
		expect(result.current.drawerState).toBe("opening");

		act(() => vi.advanceTimersToNextFrame());
		expect(result.current.drawerState).toBe("opening"); // first rAF just schedules the second

		act(() => vi.advanceTimersToNextFrame());
		expect(result.current.drawerState).toBe("open");
	});

	it("closeDrawer transitions to closing immediately, then closed after 300ms", () => {
		const { result } = renderHook(() => useDrawerState());
		act(() => result.current.openDrawer());
		act(() => vi.advanceTimersToNextFrame());
		act(() => vi.advanceTimersToNextFrame());

		act(() => result.current.closeDrawer());
		expect(result.current.drawerState).toBe("closing");

		act(() => vi.advanceTimersByTime(300));
		expect(result.current.drawerState).toBe("closed");
	});

	it("closeDrawer calls onDone once the close animation finishes", () => {
		const onDone = vi.fn();
		const { result } = renderHook(() => useDrawerState());

		act(() => result.current.closeDrawer(onDone));
		expect(onDone).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(300));
		expect(onDone).toHaveBeenCalledTimes(1);
	});

	it("resetDrawer snaps directly back to closed", () => {
		const { result } = renderHook(() => useDrawerState());
		act(() => result.current.openDrawer());
		act(() => result.current.resetDrawer());
		expect(result.current.drawerState).toBe("closed");
	});
});
