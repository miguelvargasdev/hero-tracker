export interface HeroTemplate {
	id: string;
	name: string;
	hp: number;
	attack: number;
	mana: number;
	armor: number;
	color: string;
	image: string;
	/** Wide version of artwork for rotated trackers (90°/270°) */
	wideImage: string;
	/** background-position for tracker cards (moderate zoom) */
	focus: string;
	/** background-position for wide image on rotated trackers */
	wideFocus: string;
	/** background-position for select thumbnails (tight zoom on face) */
	selectFocus: string;
}

const B = import.meta.env.BASE_URL + "heroes/";

const h = (
	id: string, name: string,
	hp: number, attack: number, mana: number, armor: number,
	color: string, focus: string, selectFocus: string, wideFocus = "50% 50%",
): HeroTemplate => ({
	id, name, hp, attack, mana, armor, color,
	image: `${B}${id}.jpg`, wideImage: `${B}${id}_wide.jpg`,
	focus, wideFocus, selectFocus,
});

export const HERO_TEMPLATES: HeroTemplate[] = [
	h("arcanas", "Arcanas Invos", 32, 1, 6, 0, "#2a4dff", "50% 15%", "50% 0%"),
	h("darren", "Darren Vale", 32, 2, 3, 1, "#efbf00", "50% 20%", "50% 0%"),
	h("heathanmoore", "Heathanmoore", 40, 2, 4, 0, "#1ea100", "50% 15%", "50% 10%"),
	h("nascha", "Nascha", 36, 1, 3, 0, "#f16623", "50% 20%", "50% 18%"),
	h("scathtassia", "Scathtassia", 34, 1, 5, 0, "#d20707", "50% 15%", "50% 12%"),
	h("briar", "Briar of Grindlehallow", 32, 1, 4, 0, "#72553c", "50% 25%", "50% 0%"),
	h("gwendolyn", "Gwendolyn Vale", 32, 1, 5, 0, "#9f3bb5", "50% 20%", "50% 15%"),
	h("jugolach", "Ju'golach", 30, 0, 3, 1, "#f20039", "50% 30%", "50% 50%"),
	h("onyxking", "Onyx King", 35, 3, 6, 3, "#000000", "50% 10%", "52% 12%", "50% 0%"),
	h("ias", "Ias", 30, 1, 6, 0, "#f7e353", "45% 20%", "50% 22%"),
	h("llawamai", "Llawamai", 38, 1, 3, 3, "#469c7d", "55% 15%", "53% 15%"),
	h("sarah", "Sarah", 33, 2, 3, 0, "#767478", "48% 15%", "50% 18%"),
];
