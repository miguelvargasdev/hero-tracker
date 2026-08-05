import { describe, it, expect } from "vitest";
import { normRot, isClickIncr, flashProps, getNextId } from "./healthCounterUtils";

describe("normRot", () => {
	it("returns the value unchanged when already in [0, 360)", () => {
		expect(normRot(0)).toBe(0);
		expect(normRot(90)).toBe(90);
		expect(normRot(270)).toBe(270);
	});

	it("wraps values >= 360", () => {
		expect(normRot(360)).toBe(0);
		expect(normRot(450)).toBe(90);
	});

	it("wraps negative values into [0, 360)", () => {
		expect(normRot(-90)).toBe(270);
		expect(normRot(-360)).toBe(0);
	});
});

describe("isClickIncr", () => {
	const W = 100;
	const H = 200;

	describe("at 0deg (default orientation)", () => {
		it("top half is an increment", () => {
			expect(isClickIncr(0, 50, 10, W, H)).toBe(true);
		});
		it("bottom half is a decrement", () => {
			expect(isClickIncr(0, 50, 190, W, H)).toBe(false);
		});
	});

	describe("at 180deg (flipped)", () => {
		it("bottom half (visual top for a flipped player) is an increment", () => {
			expect(isClickIncr(180, 50, 190, W, H)).toBe(true);
		});
		it("top half is a decrement", () => {
			expect(isClickIncr(180, 50, 10, W, H)).toBe(false);
		});
	});

	describe("at 90deg (rotated)", () => {
		it("right half is an increment", () => {
			expect(isClickIncr(90, 90, 100, W, H)).toBe(true);
		});
		it("left half is a decrement", () => {
			expect(isClickIncr(90, 10, 100, W, H)).toBe(false);
		});
	});

	describe("at 270deg (rotated the other way)", () => {
		it("left half is an increment", () => {
			expect(isClickIncr(270, 10, 100, W, H)).toBe(true);
		});
		it("right half is a decrement", () => {
			expect(isClickIncr(270, 90, 100, W, H)).toBe(false);
		});
	});

	it("normalizes rotation before deciding (e.g. 450deg behaves like 90deg)", () => {
		expect(isClickIncr(450, 90, 100, W, H)).toBe(true);
		expect(isClickIncr(450, 10, 100, W, H)).toBe(false);
	});

	it("normalizes negative rotation (e.g. -90deg behaves like 270deg)", () => {
		expect(isClickIncr(-90, 10, 100, W, H)).toBe(true);
	});
});

describe("flashProps", () => {
	it("uses different gradient directions for top vs bottom at 0deg", () => {
		const top = flashProps(0, true);
		const bottom = flashProps(0, false);
		expect(top.bg).not.toBe(bottom.bg);
		expect(top.className).not.toBe(bottom.className);
	});

	it("uses the green tint for increments and red for decrements", () => {
		const top = flashProps(0, true);
		const bottom = flashProps(0, false);
		expect(top.bg).toContain("34, 197, 94"); // green
		expect(bottom.bg).toContain("220, 38, 38"); // red
	});

	it("picks a distinct gradient per known rotation", () => {
		const rotations = [0, 90, 180, 270];
		const grads = rotations.map((r) => flashProps(r, true).bg);
		expect(new Set(grads).size).toBe(rotations.length);
	});

	it("falls back to the 0deg gradient for an unmapped rotation", () => {
		expect(flashProps(45, true).bg).toBe(flashProps(0, true).bg);
	});

	it("normalizes rotation before lookup (e.g. 360 behaves like 0)", () => {
		expect(flashProps(360, true).bg).toBe(flashProps(0, true).bg);
	});
});

describe("getNextId", () => {
	it("returns a strictly increasing sequence", () => {
		const a = getNextId();
		const b = getNextId();
		const c = getNextId();
		expect(b).toBe(a + 1);
		expect(c).toBe(b + 1);
	});
});
