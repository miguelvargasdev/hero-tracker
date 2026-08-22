import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

// jsdom doesn't implement the Wake Lock API, so this test doubles as the
// regression test for the "not reacquiring after tab backgrounding" bug:
// the API auto-releases on visibility loss, and the sentinel ref must be
// cleared then so visibilitychange can tell it needs to re-request.
class MockSentinel {
	released = false;
	listeners: Record<string, (() => void)[]> = {};
	addEventListener(type: string, cb: () => void) {
		(this.listeners[type] ??= []).push(cb);
	}
	async release() {
		this.released = true;
		this.listeners["release"]?.forEach((cb) => cb());
	}
}

function setVisibility(state: "visible" | "hidden") {
	Object.defineProperty(document, "visibilityState", {
		value: state,
		configurable: true,
	});
	document.dispatchEvent(new Event("visibilitychange"));
}

describe("useWakeLock", () => {
	let request: ReturnType<typeof vi.fn>;
	let lastSentinel: MockSentinel | null;

	beforeEach(() => {
		lastSentinel = null;
		request = vi.fn(async () => {
			lastSentinel = new MockSentinel();
			return lastSentinel;
		});
		Object.defineProperty(navigator, "wakeLock", {
			value: { request },
			configurable: true,
		});
	});

	afterEach(() => {
		// @ts-expect-error cleaning up the test-only stub
		delete navigator.wakeLock;
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
			configurable: true,
		});
	});

	it("does nothing when disabled", async () => {
		renderHook(() => useWakeLock(false));
		await act(async () => {});
		expect(request).not.toHaveBeenCalled();
	});

	it("requests a lock on mount when enabled", async () => {
		renderHook(() => useWakeLock(true));
		await act(async () => {});
		expect(request).toHaveBeenCalledWith("screen");
		expect(request).toHaveBeenCalledTimes(1);
	});

	it("re-requests the lock after an auto-release once the tab is visible again", async () => {
		renderHook(() => useWakeLock(true));
		await act(async () => {});
		expect(request).toHaveBeenCalledTimes(1);

		// Simulate the OS auto-releasing the lock when the tab is backgrounded.
		await act(async () => {
			await lastSentinel!.release();
		});

		// Tab becomes visible again; the sentinel is null so a re-request should fire.
		await act(async () => {
			setVisibility("visible");
			await Promise.resolve();
		});

		expect(request).toHaveBeenCalledTimes(2);
	});

	it("does not re-request if a live sentinel is still held", async () => {
		renderHook(() => useWakeLock(true));
		await act(async () => {});
		expect(request).toHaveBeenCalledTimes(1);

		// Visibility flips without the sentinel ever being released.
		await act(async () => {
			setVisibility("hidden");
			setVisibility("visible");
			await Promise.resolve();
		});

		expect(request).toHaveBeenCalledTimes(1);
	});

	it("releases the sentinel on unmount", async () => {
		const { unmount } = renderHook(() => useWakeLock(true));
		await act(async () => {});
		const sentinel = lastSentinel!;

		unmount();
		await act(async () => {});

		expect(sentinel.released).toBe(true);
	});

	it("does nothing when the Wake Lock API is unavailable", async () => {
		// @ts-expect-error simulating an unsupported browser
		delete navigator.wakeLock;
		expect(() => renderHook(() => useWakeLock(true))).not.toThrow();
		expect(request).not.toHaveBeenCalled();
	});
});
