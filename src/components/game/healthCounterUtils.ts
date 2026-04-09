import styles from "./HealthCounter.module.css";

export type StatKey = "hp" | "mana" | "armor" | "attack" | "misc";

export interface StatConfig {
	key: StatKey;
	label: string;
	icon: React.ReactNode;
}

let nextId = 0;
export function getNextId() { return nextId++; }

/** Normalize rotation to 0–359 */
export const normRot = (r: number) => ((r % 360) + 360) % 360;

/** Determine if a click/tap is an "increment" based on rotation */
export function isClickIncr(rot: number, x: number, y: number, w: number, h: number) {
	const n = normRot(rot);
	return n === 90 ? x > w / 2 : n === 270 ? x < w / 2 : n === 180 ? y > h / 2 : y < h / 2;
}

const FLASH_CLASS: Record<number, [string, string]> = {
	0: [styles.tapFlashTop0, styles.tapFlashBottom0],
	90: [styles.tapFlashTop90, styles.tapFlashBottom90],
	180: [styles.tapFlashTop180, styles.tapFlashBottom180],
	270: [styles.tapFlashTop270, styles.tapFlashBottom270],
};

const FLASH_GRAD: Record<number, [string, string]> = {
	0: ["to bottom", "to top"],
	90: ["to left", "to right"],
	180: ["to top", "to bottom"],
	270: ["to right", "to left"],
};

export function flashProps(rot: number, isTop: boolean) {
	const n = normRot(rot);
	const color = isTop ? "rgba(34, 197, 94, 0.4)" : "rgba(220, 38, 38, 0.4)";
	const [topClass, bottomClass] = FLASH_CLASS[n] ?? FLASH_CLASS[0];
	const [topGrad, bottomGrad] = FLASH_GRAD[n] ?? FLASH_GRAD[0];
	return {
		className: `${styles.tapFlash} ${isTop ? topClass : bottomClass}`,
		bg: `linear-gradient(${isTop ? topGrad : bottomGrad}, ${color}, transparent)`,
	};
}
