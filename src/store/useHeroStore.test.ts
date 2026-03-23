import { describe, it, expect, beforeEach } from "vitest";
import { useHeroStore } from "./useHeroStore";

function resetStore() {
	useHeroStore.setState({
		heroes: [],
		activeHeroId: null,
		activeView: "main-menu",
		gameMode: null,
		resetCounter: 0,
	});
}

describe("useHeroStore", () => {
	beforeEach(() => {
		resetStore();
	});

	describe("startGame", () => {
		it("creates the correct number of hero slots", () => {
			useHeroStore.getState().startGame("standard", 4);
			expect(useHeroStore.getState().heroes).toHaveLength(4);
		});

		it("creates 1 slot for solo mode", () => {
			useHeroStore.getState().startGame("solo", 1);
			expect(useHeroStore.getState().heroes).toHaveLength(1);
		});

		it("sets gameMode to the provided mode", () => {
			useHeroStore.getState().startGame("standard", 3);
			expect(useHeroStore.getState().gameMode).toBe("standard");
		});

		it("sets activeView to game", () => {
			useHeroStore.getState().startGame("standard", 2);
			expect(useHeroStore.getState().activeView).toBe("game");
		});

		it("each hero slot starts unselected with templateId null", () => {
			useHeroStore.getState().startGame("standard", 3);
			for (const hero of useHeroStore.getState().heroes) {
				expect(hero.templateId).toBeNull();
			}
		});

		it("each hero slot has a unique id", () => {
			useHeroStore.getState().startGame("standard", 5);
			const ids = useHeroStore.getState().heroes.map((h) => h.id);
			expect(new Set(ids).size).toBe(5);
		});

		it("each hero slot has zeroed stats", () => {
			useHeroStore.getState().startGame("standard", 2);
			for (const hero of useHeroStore.getState().heroes) {
				expect(hero.hp.current).toBe(0);
				expect(hero.attack.current).toBe(0);
				expect(hero.mana.current).toBe(0);
				expect(hero.armor.current).toBe(0);
			}
		});
	});

	describe("selectHero", () => {
		it("assigns template stats to the correct hero slot", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");

			const hero = useHeroStore.getState().heroes[0];
			expect(hero.templateId).toBe("arcanas");
			expect(hero.name).toBe("Arcanas Invos");
			expect(hero.color).toBe("#3b82f6");
		});

		it("sets hp from template", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "heathanmoore");

			const hero = useHeroStore.getState().heroes[0];
			expect(hero.hp.current).toBe(40);
			expect(hero.hp.max).toBe(40);
		});

		it("sets attack, mana, armor from template", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "darren");

			const hero = useHeroStore.getState().heroes[0];
			expect(hero.attack).toEqual({ current: 2, max: 2 });
			expect(hero.mana).toEqual({ current: 3, max: 3 });
			expect(hero.armor).toEqual({ current: 1, max: 1 });
		});

		it("does not modify other hero slots", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			const otherHeroBefore = { ...useHeroStore.getState().heroes[1] };
			useHeroStore.getState().selectHero(heroId, "arcanas");

			const otherHeroAfter = useHeroStore.getState().heroes[1];
			expect(otherHeroAfter.templateId).toBe(otherHeroBefore.templateId);
			expect(otherHeroAfter.hp.current).toBe(otherHeroBefore.hp.current);
		});

		it("returns unchanged state for invalid templateId", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroesBefore = useHeroStore.getState().heroes;
			useHeroStore.getState().selectHero(heroesBefore[0].id, "nonexistent");
			expect(useHeroStore.getState().heroes).toBe(heroesBefore);
		});
	});

	describe("resetGame", () => {
		it("resets all hero stats to template values", () => {
			useHeroStore.getState().startGame("standard", 2);
			const [id1, id2] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);
			useHeroStore.getState().selectHero(id1, "arcanas");
			useHeroStore.getState().selectHero(id2, "jugolach");

			// Modify stats
			useHeroStore.getState().updateStat(id1, "hp", "current", 10);
			useHeroStore.getState().updateStat(id2, "mana", "current", 99);

			useHeroStore.getState().resetGame();

			const heroes = useHeroStore.getState().heroes;
			expect(heroes[0].hp.current).toBe(32); // Arcanas hp
			expect(heroes[0].attack.current).toBe(1);
			expect(heroes[1].hp.current).toBe(30); // Ju'golach hp
			expect(heroes[1].mana.current).toBe(3);
		});

		it("increments resetCounter by 1", () => {
			useHeroStore.getState().startGame("standard", 2);
			expect(useHeroStore.getState().resetCounter).toBe(0);
			useHeroStore.getState().resetGame();
			expect(useHeroStore.getState().resetCounter).toBe(1);
			useHeroStore.getState().resetGame();
			expect(useHeroStore.getState().resetCounter).toBe(2);
		});

		it("clears customStats for all heroes", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");
			useHeroStore.getState().addCustomStat(heroId, "Focus", 5);
			expect(useHeroStore.getState().heroes[0].customStats).toHaveLength(1);

			useHeroStore.getState().resetGame();
			expect(useHeroStore.getState().heroes[0].customStats).toHaveLength(0);
		});

		it("does not modify heroes without a templateId", () => {
			useHeroStore.getState().startGame("standard", 2);
			// Only select first hero, leave second unselected
			const id1 = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(id1, "arcanas");

			useHeroStore.getState().resetGame();

			const hero2 = useHeroStore.getState().heroes[1];
			expect(hero2.templateId).toBeNull();
			expect(hero2.hp.current).toBe(0);
		});

		it("preserves hero ids and templateIds", () => {
			useHeroStore.getState().startGame("standard", 2);
			const [id1, id2] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);
			useHeroStore.getState().selectHero(id1, "arcanas");
			useHeroStore.getState().selectHero(id2, "darren");

			useHeroStore.getState().resetGame();

			expect(useHeroStore.getState().heroes[0].id).toBe(id1);
			expect(useHeroStore.getState().heroes[0].templateId).toBe("arcanas");
			expect(useHeroStore.getState().heroes[1].id).toBe(id2);
			expect(useHeroStore.getState().heroes[1].templateId).toBe("darren");
		});
	});

	describe("updateStat", () => {
		it("updates hp.current for the specified hero", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");
			useHeroStore.getState().updateStat(heroId, "hp", "current", 25);

			expect(useHeroStore.getState().heroes[0].hp.current).toBe(25);
			expect(useHeroStore.getState().heroes[0].hp.max).toBe(32);
		});

		it("updates stat max value", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");
			useHeroStore.getState().updateStat(heroId, "mana", "max", 10);

			expect(useHeroStore.getState().heroes[0].mana.max).toBe(10);
			expect(useHeroStore.getState().heroes[0].mana.current).toBe(6);
		});

		it("does not modify other heroes", () => {
			useHeroStore.getState().startGame("standard", 2);
			const [id1, id2] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);
			useHeroStore.getState().selectHero(id1, "arcanas");
			useHeroStore.getState().selectHero(id2, "darren");

			useHeroStore.getState().updateStat(id1, "hp", "current", 5);
			expect(useHeroStore.getState().heroes[1].hp.current).toBe(32);
		});
	});

	describe("customStats", () => {
		it("addCustomStat adds a stat with current equal to max", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().addCustomStat(heroId, "Focus", 5);

			const stats = useHeroStore.getState().heroes[0].customStats;
			expect(stats).toHaveLength(1);
			expect(stats[0].label).toBe("Focus");
			expect(stats[0].current).toBe(5);
			expect(stats[0].max).toBe(5);
		});

		it("updateCustomStat patches the specified stat", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().addCustomStat(heroId, "Focus", 5);

			const statId = useHeroStore.getState().heroes[0].customStats[0].id;
			useHeroStore.getState().updateCustomStat(heroId, statId, { current: 3 });

			expect(useHeroStore.getState().heroes[0].customStats[0].current).toBe(3);
			expect(useHeroStore.getState().heroes[0].customStats[0].max).toBe(5);
		});

		it("removeCustomStat removes the specified stat", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().addCustomStat(heroId, "Focus", 5);
			useHeroStore.getState().addCustomStat(heroId, "Rage", 3);

			const statId = useHeroStore.getState().heroes[0].customStats[0].id;
			useHeroStore.getState().removeCustomStat(heroId, statId);

			const stats = useHeroStore.getState().heroes[0].customStats;
			expect(stats).toHaveLength(1);
			expect(stats[0].label).toBe("Rage");
		});
	});

	describe("navigation", () => {
		it("navigateTo sets activeView and activeHeroId", () => {
			useHeroStore.getState().navigateTo("hero-detail", "hero-123");
			expect(useHeroStore.getState().activeView).toBe("hero-detail");
			expect(useHeroStore.getState().activeHeroId).toBe("hero-123");
		});

		it("navigateTo without heroId sets activeHeroId to null", () => {
			useHeroStore.getState().navigateTo("main-menu");
			expect(useHeroStore.getState().activeHeroId).toBeNull();
		});
	});

	describe("game flow integration", () => {
		it("full lifecycle: start -> select -> update -> reset", () => {
			// Start a 2-player game
			useHeroStore.getState().startGame("standard", 2);
			expect(useHeroStore.getState().heroes).toHaveLength(2);

			// Select heroes
			const [id1, id2] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);
			useHeroStore.getState().selectHero(id1, "arcanas");
			useHeroStore.getState().selectHero(id2, "nascha");

			// Verify initial stats
			expect(useHeroStore.getState().heroes[0].hp.current).toBe(32);
			expect(useHeroStore.getState().heroes[1].hp.current).toBe(36);
			expect(useHeroStore.getState().heroes[1].mana.current).toBe(3);

			// Modify stats during gameplay
			useHeroStore.getState().updateStat(id1, "hp", "current", 20);
			useHeroStore.getState().updateStat(id2, "hp", "current", 15);
			useHeroStore.getState().updateStat(id2, "mana", "current", 1);
			expect(useHeroStore.getState().heroes[0].hp.current).toBe(20);

			// Reset game
			useHeroStore.getState().resetGame();
			expect(useHeroStore.getState().resetCounter).toBe(1);
			expect(useHeroStore.getState().heroes[0].hp.current).toBe(32);
			expect(useHeroStore.getState().heroes[1].hp.current).toBe(36);
			expect(useHeroStore.getState().heroes[1].mana.current).toBe(3);

			// Heroes are still assigned
			expect(useHeroStore.getState().heroes[0].templateId).toBe("arcanas");
			expect(useHeroStore.getState().heroes[1].templateId).toBe("nascha");
		});
	});
});
