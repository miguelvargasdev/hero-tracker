import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HeroStore } from "../types/store";
import type { Hero } from "../types/hero";
import { HERO_TEMPLATES } from "../data/heroes";

const ZERO_STAT = { current: 0, max: 0 };

function createEmptySlot(): Hero {
  return {
    id: crypto.randomUUID(),
    name: "",
    templateId: null,
    color: null,
    hp: { current: 0, max: 0 },
    mana: { ...ZERO_STAT },
    armor: { ...ZERO_STAT },
    attack: { ...ZERO_STAT },
    customStats: [],
    createdAt: Date.now(),
  };
}

export const useHeroStore = create<HeroStore>()(
  persist(
    (set) => ({
      heroes: [],
      activeHeroId: null,
      activeView: "main-menu",
      gameMode: null,

      navigateTo: (view, heroId) =>
        set({
          activeView: view,
          activeHeroId: heroId ?? null,
        }),

      startGame: (mode, playerCount) =>
        set(() => {
          const heroes: Hero[] = [];
          for (let i = 0; i < playerCount; i++) {
            heroes.push(createEmptySlot());
          }
          return {
            heroes,
            gameMode: mode,
            activeView: "game",
            activeHeroId: null,
          };
        }),

      resetGame: () =>
        set((state) => ({
          heroes: state.heroes.map((h) => {
            const template = HERO_TEMPLATES.find(
              (t) => t.id === h.templateId
            );
            if (!template) return h;
            return {
              ...h,
              hp: { current: template.hp, max: template.hp },
              mana: { ...ZERO_STAT },
              armor: { ...ZERO_STAT },
              attack: { ...ZERO_STAT },
              customStats: [],
            };
          }),
        })),

      selectHero: (playerId, templateId) =>
        set((state) => {
          const template = HERO_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return state;
          return {
            heroes: state.heroes.map((h) =>
              h.id !== playerId
                ? h
                : {
                    ...h,
                    name: template.name,
                    templateId: template.id,
                    color: template.color,
                    hp: { current: template.hp, max: template.hp },
                  }
            ),
          };
        }),

      addHero: (name) =>
        set((state) => ({
          heroes: [...state.heroes, { ...createEmptySlot(), name }],
        })),

      removeHero: (heroId) =>
        set((state) => ({
          heroes: state.heroes.filter((h) => h.id !== heroId),
          activeHeroId:
            state.activeHeroId === heroId ? null : state.activeHeroId,
        })),

      setActiveHero: (heroId) => set({ activeHeroId: heroId }),

      updateStat: (heroId, statKey, field, value) =>
        set((state) => ({
          heroes: state.heroes.map((h) =>
            h.id !== heroId
              ? h
              : { ...h, [statKey]: { ...h[statKey], [field]: value } }
          ),
        })),

      addCustomStat: (heroId, label, max) =>
        set((state) => ({
          heroes: state.heroes.map((h) =>
            h.id !== heroId
              ? h
              : {
                  ...h,
                  customStats: [
                    ...h.customStats,
                    { id: crypto.randomUUID(), label, current: max, max },
                  ],
                }
          ),
        })),

      updateCustomStat: (heroId, statId, patch) =>
        set((state) => ({
          heroes: state.heroes.map((h) =>
            h.id !== heroId
              ? h
              : {
                  ...h,
                  customStats: h.customStats.map((s) =>
                    s.id !== statId ? s : { ...s, ...patch }
                  ),
                }
          ),
        })),

      removeCustomStat: (heroId, statId) =>
        set((state) => ({
          heroes: state.heroes.map((h) =>
            h.id !== heroId
              ? h
              : {
                  ...h,
                  customStats: h.customStats.filter((s) => s.id !== statId),
                }
          ),
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
