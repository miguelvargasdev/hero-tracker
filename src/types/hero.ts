export interface Stat {
  current: number;
  max: number;
}

export interface CustomStat {
  id: string;
  label: string;
  current: number;
  max: number;
}

export interface Hero {
  id: string;
  name: string;
  templateId: string | null;
  color: string | null;
  role?: "boss" | "team";
  hp: Stat;
  mana: Stat;
  armor: Stat;
  attack: Stat;
  customStats: CustomStat[];
  createdAt: number;
}
