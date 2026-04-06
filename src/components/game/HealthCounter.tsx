import { useState, useRef, useEffect } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import { useLongPress } from "../../hooks/useLongPress";
import { useFloatingNumbers, type FloatingNumber } from "../../hooks/useFloatingNumbers";
import { useDrawerState } from "../../hooks/useDrawerState";
import type { Hero } from "../../types/hero";
import styles from "./HealthCounter.module.css";

let nextId = 0;

interface HealthCounterProps {
	hero: Hero;
	rotation?: number;
	onSelect: () => void;
}

// Normalize rotation to 0–359
const normRot = (r: number) => ((r % 360) + 360) % 360;

// Determine if a click/tap is an "increment" based on rotation
function isClickIncr(rot: number, x: number, y: number, w: number, h: number) {
	const n = normRot(rot);
	return n === 90 ? x > w / 2 : n === 270 ? x < w / 2 : n === 180 ? y > h / 2 : y < h / 2;
}

// Map rotation + side to the correct tap flash CSS class
const FLASH_CLASS: Record<number, [string, string]> = {
	0: [styles.tapFlashTop0, styles.tapFlashBottom0],
	90: [styles.tapFlashTop90, styles.tapFlashBottom90],
	180: [styles.tapFlashTop180, styles.tapFlashBottom180],
	270: [styles.tapFlashTop270, styles.tapFlashBottom270],
};

// Map rotation + side to gradient direction
const FLASH_GRAD: Record<number, [string, string]> = {
	0: ["to bottom", "to top"],
	90: ["to left", "to right"],
	180: ["to top", "to bottom"],
	270: ["to right", "to left"],
};

function flashProps(rot: number, isTop: boolean) {
	const n = normRot(rot);
	const color = isTop ? "rgba(34, 197, 94, 0.4)" : "rgba(220, 38, 38, 0.4)";
	const [topClass, bottomClass] = FLASH_CLASS[n] ?? FLASH_CLASS[0];
	const [topGrad, bottomGrad] = FLASH_GRAD[n] ?? FLASH_GRAD[0];
	return {
		className: `${styles.tapFlash} ${isTop ? topClass : bottomClass}`,
		bg: `linear-gradient(${isTop ? topGrad : bottomGrad}, ${color}, transparent)`,
	};
}

export function HealthCounter({
	hero,
	rotation = 0,
	onSelect,
}: HealthCounterProps) {
	const updateStat = useHeroStore((s) => s.updateStat);
	const resetCounter = useHeroStore((s) => s.resetCounter);

	const isUnselected = hero.templateId === null;
	const template = isUnselected
		? null
		: HERO_TEMPLATES.find((t) => t.id === hero.templateId);

	const { floaters, spawn: spawnFloater } = useFloatingNumbers();
	const [tapFlash, setTapFlash] = useState<"none" | "top" | "bottom">("none");
	const { drawerState, openDrawer, closeDrawer, resetDrawer } = useDrawerState();
	const [activeSubtrackers, setActiveSubtrackers] = useState<
		("hp" | "mana" | "armor" | "attack")[]
	>([]);
	const [showSubtrackerModal, setShowSubtrackerModal] = useState(false);

	// Clear subtrackers on game reset
	const prevResetCounter = useRef(resetCounter);
	useEffect(() => {
		if (resetCounter !== prevResetCounter.current) {
			prevResetCounter.current = resetCounter;
			setActiveSubtrackers([]);
			setShowSubtrackerModal(false);
			resetDrawer();
		}
	}, [resetCounter, resetDrawer]);

	const { handlers: longPressHandlers, didFire: didLongPress } = useLongPress(
		openDrawer,
		{ disabled: isUnselected },
	);

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (didLongPress.current) {
			didLongPress.current = false;
			return;
		}

		if (drawerState !== "closed") return;

		if (isUnselected) {
			onSelect();
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const isIncrement = isClickIncr(rotation, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
		const change = isIncrement ? 1 : -1;
		updateStat(hero.id, "hp", "current", hero.hp.current + change);
		spawnFloater(isIncrement);

		// Tap flash
		setTapFlash(isIncrement ? "top" : "bottom");
		setTimeout(() => setTapFlash("none"), 150);
	};

	const handleChangeHero = () => {
		closeDrawer(() => onSelect());
	};

	const handleToggleSubtrackers = () => {
		closeDrawer(() => setShowSubtrackerModal(true));
	};

	const handleAddSubtracker = (key: "hp" | "mana" | "armor" | "attack") => {
		setActiveSubtrackers((prev) => [...prev, key]);
	};

	const handleRemoveSubtracker = (key: "hp" | "mana" | "armor" | "attack") => {
		setActiveSubtrackers((prev) => prev.filter((k) => k !== key));
	};

	const is90or270 = rotation === 90 || rotation === 270;
	const rotDeg = `${rotation}deg`;
	const hasSubtrackers = activeSubtrackers.length > 0;

	return (
		<div
			className={`${styles.card}${isUnselected ? ` ${styles.unselected}` : ""}`}
			onClick={handleClick}
			{...longPressHandlers}
			onContextMenu={(e) => e.preventDefault()}
		>
			{/* Hero artwork background */}
			{template && (
				<div
					className={`${styles.artwork} ${is90or270 ? styles.artworkRotated : styles.artworkDefault}`}
					style={{
						"--rotation": rotDeg,
						"--bg-image": `url(${is90or270 ? template.wideImage : template.image})`,
						"--bg-position": is90or270 ? template.wideFocus : template.focus,
					} as React.CSSProperties}
				/>
			)}

			{/* Dim overlay for readability */}
			{template && <div className={styles.dimOverlay} />}

			{/* Tap flash overlay */}
			{tapFlash !== "none" &&
				(() => {
					const { className, bg } = flashProps(rotation, tapFlash === "top");
					return (
						<div
							className={className}
							style={{ "--flash-bg": bg } as React.CSSProperties}
						/>
					);
				})()}

			{/* Content */}
			{isUnselected ? (
				<svg
					className={styles.unselectedPlus}
					width="40%"
					height="40%"
					viewBox="0 0 40 40"
				>
					<rect x="16" y="4" width="8" height="32" rx="2" fill="#888" />
					<rect x="4" y="16" width="32" height="8" rx="2" fill="#888" />
				</svg>
			) : (
				<>
					{/* Main HP display (hidden when subtrackers are showing) */}
					{!hasSubtrackers && (
						<div
							className={styles.hpDisplay}
							style={{ "--rotation": rotation ? rotDeg : "0deg" } as React.CSSProperties}
						>
							<span className={styles.hpText}>
								{hero.hp.current}
							</span>
							<HealthIcon />
						</div>
					)}

					{/* Subtrackers overlay */}
					{hasSubtrackers && (
						<SubtrackerView
							hero={hero}
							rotation={rotation}
							activeKeys={activeSubtrackers}
							onRemove={handleRemoveSubtracker}
						/>
					)}

					{/* Floating +1/-1 particles */}
					{floaters.map((f) => (
						<FloatingParticle
							key={f.id}
							value={f.value}
							arcX={f.arcX}
							arcY={f.arcY}
							rotation={rotation}
						/>
					))}
				</>
			)}

			{/* Long-press drawer */}
			{drawerState !== "closed" && (
				<DrawerOverlay
					heroColor={template?.color ?? "#333"}
					rotation={rotation}
					onChangeHero={handleChangeHero}
					onToggleSubtrackers={handleToggleSubtrackers}
					onClose={() => closeDrawer()}
					animState={drawerState}
				/>
			)}

			{/* Subtracker selection modal */}
			{showSubtrackerModal && (
				<SubtrackerModal
					rotation={rotation}
					heroColor={template?.color ?? "#333"}
					activeKeys={activeSubtrackers}
					onAdd={handleAddSubtracker}
					onRemove={handleRemoveSubtracker}
					onClose={() => setShowSubtrackerModal(false)}
				/>
			)}
		</div>
	);
}

/* ─── Drawer Overlay ─── */

const DRAWER_ROT_CLASS: Record<number, string> = {
	90: styles.drawerRot90,
	180: styles.drawerRot180,
	270: styles.drawerRot270,
};

const SLIDE_TRANSFORMS: Record<number, [string, string]> = {
	0: ["translateY(100%)", "translateY(0)"],
	90: ["translateX(-100%)", "translateX(0)"],
	180: ["translateY(100%)", "translateY(0)"],
	270: ["translateX(100%)", "translateX(0)"],
};

function DrawerOverlay({
	heroColor,
	rotation,
	onChangeHero,
	onToggleSubtrackers,
	onClose,
	animState,
}: {
	heroColor: string;
	rotation: number;
	onChangeHero: () => void;
	onToggleSubtrackers: () => void;
	onClose: () => void;
	animState: "opening" | "open" | "closing";
}) {
	const is90or270 = rotation === 90 || rotation === 270;
	const isVisible = animState === "open";
	const norm = normRot(rotation);
	const [slideHidden, slideVisible] = SLIDE_TRANSFORMS[norm] ?? SLIDE_TRANSFORMS[0];
	const rotClass = DRAWER_ROT_CLASS[norm] ?? "";

	return (
		<div
			className={`${styles.drawerOverlay} ${rotClass}`}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{/* Dim area */}
			<div
				className={`${styles.drawerDim}${isVisible ? ` ${styles.drawerDimVisible}` : ""}`}
			/>

			{/* Drawer content */}
			<div
				className={`${styles.drawerContent}${is90or270 ? ` ${styles.drawerContentHoriz}` : ` ${styles.drawerContentDefault}`}`}
				onClick={(e) => e.stopPropagation()}
				style={{
					"--hero-color": heroColor,
					"--slide-transform": isVisible ? slideVisible : slideHidden,
				} as React.CSSProperties}
			>
				{(() => {
					const is270 = rotation === 270;
					const btnClass = is90or270
						? `${styles.drawerBtn} ${styles.drawerBtnCompact}`
						: styles.drawerBtn;
					const iconClass = is90or270
						? styles.drawerBtnIconCompact
						: styles.drawerBtnIcon;
					const cssVars = is90or270
						? ({ "--rotation": `${rotation}deg` } as React.CSSProperties)
						: undefined;

					const changeHeroBtn = (
						<button
							key="change-hero"
							className={btnClass}
							onClick={onChangeHero}
							style={cssVars}
						>
							<svg
								className={iconClass}
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 2v6h-6" />
								<path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
								<path d="M3 22v-6h6" />
								<path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
							</svg>
							{!is90or270 && (
								<span className={styles.drawerBtnLabel}>
									Change Hero
								</span>
							)}
						</button>
					);
					const subtrackersBtn = (
						<button
							key="subtrackers"
							className={btnClass}
							onClick={onToggleSubtrackers}
							style={cssVars}
						>
							<svg
								className={iconClass}
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<ellipse cx="12" cy="6" rx="8" ry="3" />
								<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
								<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
								<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
							</svg>
							{!is90or270 && (
								<span className={styles.drawerBtnLabel}>
									Subtrackers
								</span>
							)}
						</button>
					);
					const divider = (
						<div
							key="divider"
							className={`${styles.dividerBase}${is90or270 ? ` ${styles.dividerHoriz}` : ` ${styles.dividerVert}`}`}
						/>
					);
					return is270
						? [subtrackersBtn, divider, changeHeroBtn]
						: [changeHeroBtn, divider, subtrackersBtn];
				})()}
			</div>
		</div>
	);
}

/* ─── Subtracker Selection Modal ─── */

type StatKey = "hp" | "mana" | "armor" | "attack";

function SubtrackerModal({
	rotation,
	heroColor,
	activeKeys,
	onAdd,
	onRemove,
	onClose,
}: {
	rotation: number;
	heroColor: string;
	activeKeys: StatKey[];
	onAdd: (key: StatKey) => void;
	onRemove: (key: StatKey) => void;
	onClose: () => void;
}) {
	const is90or270 = rotation === 90 || rotation === 270;
	const norm = normRot(rotation);

	const backdropClass = `${styles.modalBackdrop}${!is90or270 && norm === 180 ? ` ${styles.modalRot180}` : ""}`;
	const cardClass = `${styles.modalCard} ${is90or270 ? styles.modalCardRotated : styles.modalCardDefault}`;

	return (
		<div
			className={backdropClass}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			<div
				className={cardClass}
				onClick={(e) => e.stopPropagation()}
				style={{
					"--hero-color": heroColor,
					"--rotation": is90or270 ? `${rotation}deg` : undefined,
				} as React.CSSProperties}
			>
				<h3 className={styles.modalHeading}>
					Add Subtracker
				</h3>
				{STAT_CONFIGS.filter((c) => c.key !== "hp").map((config) => {
					const isActive = activeKeys.includes(config.key);
					return (
						<button
							key={config.key}
							className={`${styles.statBtn}${isActive ? ` ${styles.statBtnActive}` : ""}`}
							onClick={() =>
								isActive ? onRemove(config.key) : onAdd(config.key)
							}
							style={{ "--hero-color": heroColor } as React.CSSProperties}
						>
							<div className={styles.statIconWrap}>
								{config.icon}
							</div>
							<span className={styles.statBtnLabel}>{config.label}</span>
							{isActive && (
								<span className={styles.statBtnCheck}>
									✓
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Subtracker View ─── */

interface StatConfig {
	key: "hp" | "mana" | "armor" | "attack";
	label: string;
	icon: React.ReactNode;
}

const STAT_CONFIGS: StatConfig[] = [
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
];

function SubtrackerView({
	hero,
	rotation,
	activeKeys,
	onRemove: _onRemove,
}: {
	hero: Hero;
	rotation: number;
	activeKeys: ("hp" | "mana" | "armor" | "attack")[];
	onRemove: (key: "hp" | "mana" | "armor" | "attack") => void;
}) {
	const updateStat = useHeroStore((s) => s.updateStat);

	const [flashMap, setFlashMap] = useState<
		Record<string, "top" | "bottom" | null>
	>({});
	const [floaters, setFloaters] = useState<
		(FloatingNumber & { statKey: string })[]
	>([]);
	const cleanupTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

	useEffect(() => {
		return () => {
			cleanupTimers.current.forEach((t) => clearTimeout(t));
		};
	}, []);

	const spawnFloater = (statKey: string, isIncrement: boolean) => {
		const value = isIncrement ? 1 : -1;
		const direction = isIncrement ? 1 : -1;
		const arcX = (Math.random() - 0.5) * 20;
		const arcY = direction * -(30 + Math.random() * 25);
		const id = nextId++;

		setFloaters((prev) => [...prev, { id, value, arcX, arcY, statKey }]);

		const timer = setTimeout(() => {
			setFloaters((prev) => prev.filter((f) => f.id !== id));
			cleanupTimers.current.delete(timer);
		}, 800);
		cleanupTimers.current.add(timer);
	};

	const handleStatClick = (
		e: React.MouseEvent,
		statKey: "hp" | "mana" | "armor" | "attack",
		currentValue: number,
	) => {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		const isIncrement = isClickIncr(rotation, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
		const change = isIncrement ? 1 : -1;
		updateStat(hero.id, statKey, "current", currentValue + change);
		spawnFloater(statKey, isIncrement);

		// Tap flash
		setFlashMap((prev) => ({
			...prev,
			[statKey]: isIncrement ? "top" : "bottom",
		}));
		setTimeout(
			() => setFlashMap((prev) => ({ ...prev, [statKey]: null })),
			150,
		);
	};

	// HP is always first, then user-added subtrackers
	const allKeys: StatKey[] = ["hp", ...activeKeys.filter((k) => k !== "hp")];
	const statsBase = allKeys
		.map((key) => {
			const config = STAT_CONFIGS.find((c) => c.key === key);
			if (!config) return null;
			return { ...config, value: hero[config.key].current };
		})
		.filter(Boolean) as (StatConfig & { value: number })[];

	// Reorder stats for rotated cards so HP appears at the player's "top"
	const norm = normRot(rotation);
	let stats = statsBase;
	if (norm === 270) {
		stats = [...statsBase].reverse();
	}

	const is90or270 = rotation === 90 || rotation === 270;
	const rotDeg = `${rotation}deg`;
	const statFontSize = is90or270
		? `clamp(32px, ${30 / stats.length}cqmax, 90px)`
		: `clamp(28px, ${35 / stats.length}cqi, 72px)`;
	const statIconSize = is90or270
		? `clamp(20px, ${10 / stats.length}cqmax, 46px)`
		: `clamp(18px, ${14 / stats.length}cqi, 38px)`;

	const rootClass = `${styles.subtrackerRoot} ${is90or270 ? styles.subtrackerRootRotated : styles.subtrackerRootDefault}`;
	const flexClass = `${styles.subtrackerFlex} ${is90or270 ? styles.subtrackerFlexRotated : styles.subtrackerFlexDefault}`;
	const cellVariant = is90or270 ? styles.statCellHoriz : styles.statCellVert;

	return (
		<div
			className={rootClass}
			style={!is90or270 && rotation ? { "--rotation": rotDeg } as React.CSSProperties : undefined}
		>
			<div className={flexClass}>
				{stats.map((stat) => {
					return (
						<div
							key={stat.key}
							className={`${styles.statCell} ${cellVariant}`}
							onClick={(e) => handleStatClick(e, stat.key, stat.value)}
						>
							<div
								className={styles.statCellInner}
								style={{
									"--rotation": is90or270 ? rotDeg : "0deg",
									"--stat-font-size": statFontSize,
									"--stat-icon-size": statIconSize,
								} as React.CSSProperties}
							>
								<span className={styles.statValue}>
									{stat.value}
								</span>
								<div className={styles.subtrackerIconWrap}>
									{stat.icon}
								</div>
							</div>
							{/* Tap flash for this stat */}
							{flashMap[stat.key] &&
								(() => {
									const { className, bg } = flashProps(rotation, flashMap[stat.key] === "top");
									return (
										<div
											className={className}
											style={{ "--flash-bg": bg } as React.CSSProperties}
										/>
									);
								})()}
							{/* Floating +1/-1 particles for this stat */}
							{floaters
								.filter((f) => f.statKey === stat.key)
								.map((f) => (
									<FloatingParticle
										key={f.id}
										value={f.value}
										arcX={f.arcX}
										arcY={f.arcY}
										rotation={is90or270 ? rotation : 0}
									/>
								))}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Health Icon ─── */

function HealthIcon() {
	return (
		<img
			src={`${import.meta.env.BASE_URL}icons/health.png`}
			alt="HP"
			className={styles.healthIcon}
		/>
	);
}

/* ─── Floating Particle ─── */

function FloatingParticle({
	value,
	arcX,
	arcY,
	rotation,
}: {
	value: number;
	arcX: number;
	arcY: number;
	rotation: number;
}) {
	const [started, setStarted] = useState(false);

	useEffect(() => {
		requestAnimationFrame(() => setStarted(true));
	}, []);

	const isPositive = value > 0;

	const rad = (rotation * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const rotatedArcX = arcX * cos - arcY * sin;
	const rotatedArcY = arcX * sin + arcY * cos;

	const colorClass = isPositive ? styles.particlePositive : styles.particleNegative;
	const baseClass = `${styles.floatingParticle} ${colorClass}${started ? ` ${styles.particleStarted}` : ""}`;

	return (
		<span
			className={baseClass}
			style={{
				"--rotation": `${rotation}deg`,
				"--arc-x": `${rotatedArcX}px`,
				"--arc-y": `${rotatedArcY}px`,
			} as React.CSSProperties}
		>
			{isPositive ? "+1" : "-1"}
		</span>
	);
}
