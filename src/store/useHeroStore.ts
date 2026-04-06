import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HeroStore } from "../types/store";
import type { Hero } from "../types/hero";
import { HERO_TEMPLATES } from "../data/heroes";

const stat = (v: number) => ({ current: v, max: v });
const ZERO = stat(0);

function templateStats(t: { hp: number; attack: number; mana: number; armor: number }) {
	return { hp: stat(t.hp), attack: stat(t.attack), mana: stat(t.mana), armor: stat(t.armor) };
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
						heroes.push({
							...createEmptySlot(),
							role: "boss",
							name: t.name,
							templateId: t.id,
							color: t.color,
							...templateStats(t),
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
				set((state) => ({
					resetCounter: state.resetCounter + 1,
					heroes: state.heroes.map((h) => {
						const t = HERO_TEMPLATES.find((t) => t.id === h.templateId);
						return t ? { ...h, ...templateStats(t), customStats: [] } : h;
					}),
				})),

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
			name: "hero-tracker-store",
			partialize: (state) => ({
				heroes: state.heroes,
				gameMode: state.gameMode,
			}),
		}
	)
);
