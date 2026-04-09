import type { StatConfig } from "./healthCounterUtils";
import styles from "./HealthCounter.module.css";

export const STAT_CONFIGS: StatConfig[] = [
	{
		key: "hp",
		label: "HP",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/health.png`}
				alt="HP"
				className={styles.statIcon}
			/>
		),
	},
	{
		key: "attack",
		label: "Attack",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/attack.png`}
				alt="Attack"
				className={styles.statIcon}
			/>
		),
	},
	{
		key: "armor",
		label: "Armor",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/armor.png`}
				alt="Armor"
				className={styles.statIcon}
			/>
		),
	},
	{
		key: "mana",
		label: "Mana",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/mana.png`}
				alt="Mana"
				className={styles.statIcon}
			/>
		),
	},
	{
		key: "misc",
		label: "Misc",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/star.png`}
				alt="Misc"
				className={styles.statIcon}
			/>
		),
	},
];
