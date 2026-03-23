import { describe, it, expect } from "vitest";
import { HERO_TEMPLATES } from "./heroes";

describe("HERO_TEMPLATES", () => {
	it("contains 8 heroes", () => {
		expect(HERO_TEMPLATES).toHaveLength(8);
	});

	it("every hero has a unique id", () => {
		const ids = HERO_TEMPLATES.map((h) => h.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("every hero has all required stat fields", () => {
		for (const hero of HERO_TEMPLATES) {
			expect(hero).toHaveProperty("hp");
			expect(hero).toHaveProperty("attack");
			expect(hero).toHaveProperty("mana");
			expect(hero).toHaveProperty("armor");
		}
	});

	it("all stat values are non-negative integers", () => {
		for (const hero of HERO_TEMPLATES) {
			for (const key of ["hp", "attack", "mana", "armor"] as const) {
				expect(hero[key]).toBeGreaterThanOrEqual(0);
				expect(Number.isInteger(hero[key])).toBe(true);
			}
		}
	});

	it("every hero has a color starting with #", () => {
		for (const hero of HERO_TEMPLATES) {
			expect(hero.color).toMatch(/^#/);
		}
	});

	it("every hero has image, focus, and selectFocus fields", () => {
		for (const hero of HERO_TEMPLATES) {
			expect(hero.image).toBeTruthy();
			expect(hero.focus).toBeTruthy();
			expect(hero.selectFocus).toBeTruthy();
		}
	});

	// Individual hero stat validation
	it("Arcanas Invos has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "arcanas")!;
		expect(hero.hp).toBe(32);
		expect(hero.attack).toBe(1);
		expect(hero.mana).toBe(6);
		expect(hero.armor).toBe(0);
	});

	it("Darren Vale has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "darren")!;
		expect(hero.hp).toBe(32);
		expect(hero.attack).toBe(2);
		expect(hero.mana).toBe(3);
		expect(hero.armor).toBe(1);
	});

	it("Heathanmoore has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "heathanmoore")!;
		expect(hero.hp).toBe(40);
		expect(hero.attack).toBe(2);
		expect(hero.mana).toBe(4);
		expect(hero.armor).toBe(0);
	});

	it("Nascha has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "nascha")!;
		expect(hero.hp).toBe(36);
		expect(hero.attack).toBe(1);
		expect(hero.mana).toBe(3);
		expect(hero.armor).toBe(0);
	});

	it("Scathtassia has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "scathtassia")!;
		expect(hero.hp).toBe(34);
		expect(hero.attack).toBe(1);
		expect(hero.mana).toBe(5);
		expect(hero.armor).toBe(0);
	});

	it("Briar of Grindlehallow has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "briar")!;
		expect(hero.hp).toBe(32);
		expect(hero.attack).toBe(1);
		expect(hero.mana).toBe(4);
		expect(hero.armor).toBe(0);
	});

	it("Gwendolyn Vale has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "gwendolyn")!;
		expect(hero.hp).toBe(32);
		expect(hero.attack).toBe(1);
		expect(hero.mana).toBe(5);
		expect(hero.armor).toBe(0);
	});

	it("Ju'golach has correct stats", () => {
		const hero = HERO_TEMPLATES.find((h) => h.id === "jugolach")!;
		expect(hero.hp).toBe(30);
		expect(hero.attack).toBe(0);
		expect(hero.mana).toBe(3);
		expect(hero.armor).toBe(1);
	});
});
