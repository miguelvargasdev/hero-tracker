export interface HeroTemplate {
	id: string;
	name: string;
	hp: number;
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
		color: "#3b82f6",
		image: "/heroes/arcanas.png",
		focus: "50% 15%",
		selectFocus: "50% 19%",
	},
	{
		id: "darren",
		name: "Darren Vale",
		hp: 32,
		color: "#eab308",
		image: "/heroes/darren.png",
		focus: "50% 20%",
		selectFocus: "50% 26%",
	},
	{
		id: "heathanmoore",
		name: "Heathanmoore",
		hp: 40,
		color: "#22c55e",
		image: "/heroes/heathanmoore.png",
		focus: "50% 25%",
		selectFocus: "50% 20%",
	},
	{
		id: "nascha",
		name: "Nascha",
		hp: 36,
		color: "#f97316",
		image: "/heroes/nascha.png",
		focus: "50% 20%",
		selectFocus: "48% 11%",
	},
	{
		id: "scathtassia",
		name: "Scathtassia",
		hp: 34,
		color: "#991b1b",
		image: "/heroes/scathtassia.png",
		focus: "50% 25%",
		selectFocus: "50% 24%",
	},
	{
		id: "briar",
		name: "Briar of Grindlehallow",
		hp: 32,
		color: "#92400e",
		image: "/heroes/briar.png",
		focus: "50% 25%",
		selectFocus: "48% 23%",
	},
	{
		id: "gwendolyn",
		name: "Gwendolyn Vale",
		hp: 32,
		color: "#9333ea",
		image: "/heroes/gwendolyn.png",
		focus: "50% 20%",
		selectFocus: "50% 20%",
	},
	{
		id: "jugolach",
		name: "Ju'golach",
		hp: 30,
		color: "#ef4444",
		image: "/heroes/jugolach.png",
		focus: "50% 20%",
		selectFocus: "50% 47%",
	},
];
