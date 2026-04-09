import type { Hero, CustomStat } from "./hero";
import type { ViewName, GameMode } from "./views";
import type { StatKey } from "../components/game/healthCounterUtils";

export interface HeroStore {
  heroes: Hero[];
  activeHeroId: string | null;
  activeView: ViewName;
  gameMode: GameMode | null;

  navigateTo: (view: ViewName, heroId?: string) => void;

  startGame: (mode: GameMode, playerCount: number) => void;
  resetCounter: number;
  resetGame: () => void;
  selectHero: (playerId: string, templateId: string) => void;

  updateStat: (
    heroId: string,
    statKey: StatKey,
    field: "current" | "max",
    value: number
  ) => void;

  addHero: (name: string) => void;
  removeHero: (heroId: string) => void;
  setActiveHero: (heroId: string) => void;

  addCustomStat: (heroId: string, label: string, max: number) => void;
  updateCustomStat: (
    heroId: string,
    statId: string,
    patch: Partial<Pick<CustomStat, "current" | "max" | "label">>
  ) => void;
  removeCustomStat: (heroId: string, statId: string) => void;
}
