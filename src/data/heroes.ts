export interface HeroTemplate {
	id: string;
	name: string;
	hp: number;
	attack: number;
	mana: number;
	armor: number;
	color: string;
	image: string;
	/** background-position for tracker cards (moderate zoom) */
	focus: string;
	/** background-position for select thumbnails (tight zoom on face) */
	selectFocus: string;
}

export const HERO_TEMPLATES: HeroTemplate[] = [
	{
		id: "arcanas",
		name: "Arcanas Invos",
		hp: 32,
		attack: 1,
		mana: 6,
		armor: 0,
		color: "#3b82f6",
		image: `${import.meta.env.BASE_URL}heroes/arcanas.png`,
		focus: "50% 15%",
		selectFocus: "50% 19%",
	},
	{
		id: "darren",
		name: "Darren Vale",
		hp: 32,
		attack: 2,
		mana: 3,
		armor: 1,
		color: "#eab308",
		image: `${import.meta.env.BASE_URL}heroes/darren.png`,
		focus: "50% 20%",
		selectFocus: "50% 26%",
	},
	{
		id: "heathanmoore",
		name: "Heathanmoore",
		hp: 40,
		attack: 2,
		mana: 4,
		armor: 0,
		color: "#22c55e",
		image: `${import.meta.env.BASE_URL}heroes/heathanmoore.png`,
		focus: "50% 25%",
		selectFocus: "50% 20%",
	},
	{
		id: "nascha",
		name: "Nascha",
		hp: 36,
		attack: 1,
		mana: 3,
		armor: 0,
		color: "#f97316",
		image: `${import.meta.env.BASE_URL}heroes/nascha.png`,
		focus: "50% 20%",
		selectFocus: "48% 11%",
	},
	{
		id: "scathtassia",
		name: "Scathtassia",
		hp: 34,
		attack: 1,
		mana: 5,
		armor: 0,
		color: "#991b1b",
		image: `${import.meta.env.BASE_URL}heroes/scathtassia.png`,
		focus: "50% 25%",
		selectFocus: "50% 24%",
	},
	{
		id: "briar",
		name: "Briar of Grindlehallow",
		hp: 32,
		attack: 1,
		mana: 4,
		armor: 0,
		color: "#92400e",
		image: `${import.meta.env.BASE_URL}heroes/briar.png`,
		focus: "50% 25%",
		selectFocus: "48% 23%",
	},
	{
		id: "gwendolyn",
		name: "Gwendolyn Vale",
		hp: 32,
		attack: 1,
		mana: 5,
		armor: 0,
		color: "#9333ea",
		image: `${import.meta.env.BASE_URL}heroes/gwendolyn.png`,
		focus: "50% 20%",
		selectFocus: "50% 20%",
	},
	{
		id: "jugolach",
		name: "Ju'golach",
		hp: 30,
		attack: 0,
		mana: 3,
		armor: 1,
		color: "#ef4444",
		image: `${import.meta.env.BASE_URL}heroes/jugolach.png`,
		focus: "50% 20%",
		selectFocus: "50% 47%",
	},
];
