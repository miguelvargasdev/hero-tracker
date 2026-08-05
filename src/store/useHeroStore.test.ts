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
			expect(hero.color).toBe("#2a4dff");
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

	describe("tyrant mode", () => {
		it("scales boss HP by +10 per enemy on startGame", () => {
			// 1v2 -> 2 enemies -> +20
			useHeroStore.getState().startGame("tyrant", 3);
			const boss = useHeroStore.getState().heroes[0];
			expect(boss.role).toBe("boss");
			expect(boss.templateId).toBe("onyxking");
			expect(boss.hp.current).toBe(55);
			expect(boss.hp.max).toBe(55);
		});

		it("scales boss HP differently for different player counts", () => {
			useHeroStore.getState().startGame("tyrant", 2); // 1 enemy -> +10
			expect(useHeroStore.getState().heroes[0].hp.current).toBe(45);

			useHeroStore.getState().startGame("tyrant", 5); // 4 enemies -> +40
			expect(useHeroStore.getState().heroes[0].hp.current).toBe(75);
		});

		it("creates one boss slot and playerCount - 1 team slots", () => {
			useHeroStore.getState().startGame("tyrant", 4);
			const heroes = useHeroStore.getState().heroes;
			expect(heroes).toHaveLength(4);
			expect(heroes[0].role).toBe("boss");
			expect(heroes.slice(1).every((h) => h.role === "team")).toBe(true);
		});

		it("team slots start unselected like standard mode", () => {
			useHeroStore.getState().startGame("tyrant", 3);
			const [, ...team] = useHeroStore.getState().heroes;
			for (const hero of team) {
				expect(hero.templateId).toBeNull();
				expect(hero.hp.current).toBe(0);
			}
		});

		it("resetGame recomputes boss HP from the current team size", () => {
			useHeroStore.getState().startGame("tyrant", 3); // 2 enemies -> 55
			const bossId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().updateStat(bossId, "hp", "current", 5);

			useHeroStore.getState().resetGame();

			const boss = useHeroStore.getState().heroes[0];
			expect(boss.hp.current).toBe(55);
			expect(boss.hp.max).toBe(55);
		});

		it("resetGame does not apply boss scaling to team heroes", () => {
			useHeroStore.getState().startGame("tyrant", 2);
			const teamId = useHeroStore.getState().heroes[1].id;
			useHeroStore.getState().selectHero(teamId, "arcanas");
			useHeroStore.getState().updateStat(teamId, "hp", "current", 1);

			useHeroStore.getState().resetGame();

			const teamHero = useHeroStore.getState().heroes[1];
			expect(teamHero.role).toBe("team");
			expect(teamHero.hp.current).toBe(32); // plain Arcanas hp, no +10/enemy
		});
	});

	describe("addHero / removeHero / setActiveHero", () => {
		it("addHero appends a new empty slot with the given name", () => {
			useHeroStore.getState().addHero("Guest");
			const heroes = useHeroStore.getState().heroes;
			expect(heroes).toHaveLength(1);
			expect(heroes[0].name).toBe("Guest");
			expect(heroes[0].templateId).toBeNull();
		});

		it("addHero appends without disturbing existing heroes", () => {
			useHeroStore.getState().startGame("standard", 2);
			const existingIds = useHeroStore.getState().heroes.map((h) => h.id);
			useHeroStore.getState().addHero("Guest");

			const heroes = useHeroStore.getState().heroes;
			expect(heroes).toHaveLength(3);
			expect(heroes.slice(0, 2).map((h) => h.id)).toEqual(existingIds);
		});

		it("removeHero removes only the specified hero", () => {
			useHeroStore.getState().startGame("standard", 3);
			const [id1, id2, id3] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);

			useHeroStore.getState().removeHero(id2);

			const remainingIds = useHeroStore.getState().heroes.map((h) => h.id);
			expect(remainingIds).toEqual([id1, id3]);
		});

		it("removeHero clears activeHeroId when the active hero is removed", () => {
			useHeroStore.getState().startGame("standard", 2);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().setActiveHero(heroId);

			useHeroStore.getState().removeHero(heroId);

			expect(useHeroStore.getState().activeHeroId).toBeNull();
		});

		it("removeHero leaves activeHeroId untouched when a different hero is removed", () => {
			useHeroStore.getState().startGame("standard", 2);
			const [id1, id2] = useHeroStore
				.getState()
				.heroes.map((h) => h.id);
			useHeroStore.getState().setActiveHero(id1);

			useHeroStore.getState().removeHero(id2);

			expect(useHeroStore.getState().activeHeroId).toBe(id1);
		});

		it("setActiveHero sets activeHeroId directly", () => {
			useHeroStore.getState().setActiveHero("hero-42");
			expect(useHeroStore.getState().activeHeroId).toBe("hero-42");
		});
	});

	describe("updateStat clamping", () => {
		it("clamps non-hp stats at a minimum of 0", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");

			useHeroStore.getState().updateStat(heroId, "mana", "current", -5);

			expect(useHeroStore.getState().heroes[0].mana.current).toBe(0);
		});

		it("allows hp to go negative (unlike other stats)", () => {
			useHeroStore.getState().startGame("standard", 1);
			const heroId = useHeroStore.getState().heroes[0].id;
			useHeroStore.getState().selectHero(heroId, "arcanas");

			useHeroStore.getState().updateStat(heroId, "hp", "current", -5);

			expect(useHeroStore.getState().heroes[0].hp.current).toBe(-5);
		});
	});

	describe("persist migrate", () => {
		function migrate(state: unknown, version: number): unknown {
			const options = useHeroStore.persist.getOptions();
			return options.migrate!(state, version);
		}

		it("backfills a missing misc stat on heroes from a pre-v1 store", () => {
			const legacyState = {
				heroes: [
					{
						id: "h1",
						name: "Test",
						templateId: "arcanas",
						color: "#2a4dff",
						hp: { current: 10, max: 32 },
						mana: { current: 6, max: 6 },
						armor: { current: 0, max: 0 },
						attack: { current: 1, max: 1 },
						customStats: [],
						createdAt: 0,
						// misc intentionally absent, as in pre-v1 persisted state
					},
				],
			};

			const migrated = migrate(legacyState, 0) as typeof legacyState & {
				heroes: { misc: { current: number; max: number } }[];
			};

			expect(migrated.heroes[0].misc).toEqual({ current: 0, max: 0 });
		});

		it("does not touch heroes that already have a misc stat", () => {
			const state = {
				heroes: [
					{ id: "h1", misc: { current: 3, max: 5 } },
				],
			};

			const migrated = migrate(state, 0) as {
				heroes: { misc: { current: number; max: number } }[];
			};

			expect(migrated.heroes[0].misc).toEqual({ current: 3, max: 5 });
		});

		it("is a no-op at the current version", () => {
			const state = { heroes: [{ id: "h1" }] };
			const migrated = migrate(state, 1);
			expect(migrated).toBe(state);
		});

		it("passes through undefined state without throwing", () => {
			expect(() => migrate(undefined, 0)).not.toThrow();
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
