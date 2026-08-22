import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HeroStore } from "../types/store";
import type { Hero } from "../types/hero";
import { HERO_TEMPLATES } from "../data/heroes";

const stat = (v: number) => ({ current: v, max: v });
const ZERO = stat(0);

// localStorage is scoped per-origin, not per-path, so the /dev preview build
// (see vite.config.ts) would otherwise read and write the exact same saved
// heroes as production at "/". Key it separately so dev testing never
// clobbers real save data on shared devices.
const STORAGE_KEY =
	import.meta.env.BASE_URL === "/dev/" ? "hero-tracker-store-dev" : "hero-tracker-store";

function templateStats(t: { hp: number; attack: number; mana: number; armor: number }) {
	return {
		hp: stat(t.hp),
		attack: stat(t.attack),
		mana: stat(t.mana),
		armor: stat(t.armor),
		misc: { ...ZERO },
	};
}

// Tyrant boss HP scales +10 per enemy (1v2 → +20, 1v3 → +30, 1v4 → +40).
// e.g. Onyx King base 35 → 55 / 65 / 75. Used at game start AND reset so the
// scaled max sticks across resets.
const TYRANT_BOSS_HP_PER_ENEMY = 10;
function tyrantBossHp(baseHp: number, enemyCount: number) {
	const total = baseHp + TYRANT_BOSS_HP_PER_ENEMY * enemyCount;
	return stat(total);
}

function createEmptySlot(): Hero {
	return {
		id: crypto.randomUUID(),
		name: "",
		templateId: null,
		color: null,
		hp: { ...ZERO },
		mana: { ...ZERO },
		armor: { ...ZERO },
		attack: { ...ZERO },
		misc: { ...ZERO },
		customStats: [],
		createdAt: Date.now(),
	};
}

const mapHero = (heroes: Hero[], id: string, fn: (h: Hero) => Hero) =>
	heroes.map((h) => (h.id === id ? fn(h) : h));

export const useHeroStore = create<HeroStore>()(
	persist(
		(set) => ({
			heroes: [],
			activeHeroId: null,
			activeView: "main-menu",
			gameMode: null,
			resetCounter: 0,

			navigateTo: (view, heroId) =>
				set({ activeView: view, activeHeroId: heroId ?? null }),

			startGame: (mode, playerCount) =>
				set(() => {
					const heroes: Hero[] = [];
					if (mode === "solo") {
						heroes.push(createEmptySlot());
					} else if (mode === "tyrant") {
						const t = HERO_TEMPLATES.find((t) => t.id === "onyxking")!;
						const enemyCount = playerCount - 1;
						heroes.push({
							...createEmptySlot(),
							role: "boss",
							name: t.name,
							templateId: t.id,
							color: t.color,
							...templateStats(t),
							hp: tyrantBossHp(t.hp, enemyCount),
						});
						for (let i = 1; i < playerCount; i++)
							heroes.push({ ...createEmptySlot(), role: "team" });
					} else {
						for (let i = 0; i < playerCount; i++)
							heroes.push(createEmptySlot());
					}
					return { heroes, gameMode: mode, activeView: "game", activeHeroId: null };
				}),

			resetGame: () =>
				set((state) => {
					// Tyrant boss reset has to recompute scaled HP based on the
					// current enemy count, otherwise it would snap back to the
					// raw template value (35 instead of 55/65/75).
					const enemyCount =
						state.gameMode === "tyrant"
							? state.heroes.filter((h) => h.role === "team").length
							: 0;
					return {
						resetCounter: state.resetCounter + 1,
						heroes: state.heroes.map((h) => {
							const t = HERO_TEMPLATES.find((t) => t.id === h.templateId);
							if (!t) return h;
							const fresh = { ...h, ...templateStats(t), customStats: [] };
							if (state.gameMode === "tyrant" && h.role === "boss") {
								fresh.hp = tyrantBossHp(t.hp, enemyCount);
							}
							return fresh;
						}),
					};
				}),

			selectHero: (playerId, templateId) =>
				set((state) => {
					const t = HERO_TEMPLATES.find((t) => t.id === templateId);
					if (!t) return state;
					return {
						heroes: mapHero(state.heroes, playerId, (h) => ({
							...h,
							name: t.name,
							templateId: t.id,
							color: t.color,
							...templateStats(t),
						})),
					};
				}),

			addHero: (name) =>
				set((state) => ({
					heroes: [...state.heroes, { ...createEmptySlot(), name }],
				})),

			removeHero: (heroId) =>
				set((state) => ({
					heroes: state.heroes.filter((h) => h.id !== heroId),
					activeHeroId: state.activeHeroId === heroId ? null : state.activeHeroId,
				})),

			setActiveHero: (heroId) => set({ activeHeroId: heroId }),

			updateStat: (heroId, statKey, field, value) =>
				set((state) => ({
					heroes: mapHero(state.heroes, heroId, (h) => ({
						...h,
						[statKey]: { ...h[statKey], [field]: statKey === "hp" ? value : Math.max(0, value) },
					})),
				})),

			addCustomStat: (heroId, label, max) =>
				set((state) => ({
					heroes: mapHero(state.heroes, heroId, (h) => ({
						...h,
						customStats: [...h.customStats, { id: crypto.randomUUID(), label, current: max, max }],
					})),
				})),

			updateCustomStat: (heroId, statId, patch) =>
				set((state) => ({
					heroes: mapHero(state.heroes, heroId, (h) => ({
						...h,
						customStats: h.customStats.map((s) => (s.id === statId ? { ...s, ...patch } : s)),
					})),
				})),

			removeCustomStat: (heroId, statId) =>
				set((state) => ({
					heroes: mapHero(state.heroes, heroId, (h) => ({
						...h,
						customStats: h.customStats.filter((s) => s.id !== statId),
					})),
				})),
		}),
		{
			name: STORAGE_KEY,
			version: 1,
			migrate: (persistedState, version) => {
				const s = persistedState as { heroes?: Hero[] } | undefined;
				if (s && version < 1 && Array.isArray(s.heroes)) {
					// v1 added the `misc` stat — backfill legacy heroes so the
					// new field is never undefined when the store rehydrates.
					s.heroes = s.heroes.map((h) => ({
						...h,
						misc: h.misc ?? { current: 0, max: 0 },
					}));
				}
				return s as HeroStore;
			},
			partialize: (state) => ({
				heroes: state.heroes,
				gameMode: state.gameMode,
			}),
		}
	)
);
