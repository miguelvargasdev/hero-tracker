import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSwipeOpen } from "./useSwipeOpen";

function touchEvent(x: number, y: number) {
	return {
		touches: [{ clientX: x, clientY: y }],
	} as unknown as React.TouchEvent;
}

describe("useSwipeOpen", () => {
	describe("at 0deg (default), swipe up opens", () => {
		it("fires onSwipeOpen when dragging up past the threshold", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
			act(() => result.current.handlers.onTouchMove(touchEvent(100, 40))); // dy = -60

			expect(onSwipeOpen).toHaveBeenCalledTimes(1);
		});

		it("does not fire for a swipe below the threshold", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
			act(() => result.current.handlers.onTouchMove(touchEvent(100, 80))); // dy = -20

			expect(onSwipeOpen).not.toHaveBeenCalled();
		});

		it("does not fire for a downward swipe", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
			act(() => result.current.handlers.onTouchMove(touchEvent(100, 160))); // dy = +60

			expect(onSwipeOpen).not.toHaveBeenCalled();
		});

		it("does not fire for a mostly-horizontal drag even past the threshold", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
			act(() => result.current.handlers.onTouchMove(touchEvent(160, 70))); // dx=60, dy=-30

			expect(onSwipeOpen).not.toHaveBeenCalled();
		});
	});

	it("at 180deg, swipe down (visual 'up' for a flipped player) opens", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen, { rotation: 180 }));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 160))); // dy = +60

		expect(onSwipeOpen).toHaveBeenCalledTimes(1);
	});

	it("at 90deg, swipe right opens", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen, { rotation: 90 }));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(160, 100))); // dx = +60

		expect(onSwipeOpen).toHaveBeenCalledTimes(1);
	});

	it("at 270deg, swipe left opens", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen, { rotation: 270 }));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(40, 100))); // dx = -60

		expect(onSwipeOpen).toHaveBeenCalledTimes(1);
	});

	it("normalizes an out-of-range rotation (450 behaves like 90)", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen, { rotation: 450 }));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(160, 100)));

		expect(onSwipeOpen).toHaveBeenCalledTimes(1);
	});

	it("does not fire again for the same gesture once it has fired", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 40)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 20)));

		expect(onSwipeOpen).toHaveBeenCalledTimes(1);
	});

	it("does nothing when disabled", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen, { disabled: true }));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 40)));

		expect(onSwipeOpen).not.toHaveBeenCalled();
	});

	it("resets tracking on touch end so a new gesture can fire again", () => {
		const onSwipeOpen = vi.fn();
		const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 40)));
		act(() => result.current.handlers.onTouchEnd());

		act(() => result.current.handlers.onTouchStart(touchEvent(100, 100)));
		act(() => result.current.handlers.onTouchMove(touchEvent(100, 40)));

		expect(onSwipeOpen).toHaveBeenCalledTimes(2);
	});

	describe("mouse handlers mirror the touch behavior", () => {
		function mouseEvent(x: number, y: number, buttons = 1) {
			return { clientX: x, clientY: y, buttons } as unknown as React.MouseEvent;
		}

		it("fires on an upward mouse drag while a button is held", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onMouseDown(mouseEvent(100, 100)));
			act(() => result.current.handlers.onMouseMove(mouseEvent(100, 40)));

			expect(onSwipeOpen).toHaveBeenCalledTimes(1);
		});

		it("stops tracking once no button is held", () => {
			const onSwipeOpen = vi.fn();
			const { result } = renderHook(() => useSwipeOpen(onSwipeOpen));

			act(() => result.current.handlers.onMouseDown(mouseEvent(100, 100)));
			act(() => result.current.handlers.onMouseMove(mouseEvent(100, 90, 0))); // button released
			act(() => result.current.handlers.onMouseMove(mouseEvent(100, 40, 1)));

			expect(onSwipeOpen).not.toHaveBeenCalled();
		});
	});
});
