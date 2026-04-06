import { useState, useRef, useEffect, useCallback } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import type { Hero } from "../../types/hero";
import styles from "./HealthCounter.module.css";

interface FloatingNumber {
	id: number;
	value: number;
	arcX: number;
	arcY: number;
}

let nextId = 0;

interface HealthCounterProps {
	hero: Hero;
	rotation?: number;
	onSelect: () => void;
}

const LONG_PRESS_MS = 500;

// Normalize rotation to 0–359
const normRot = (r: number) => ((r % 360) + 360) % 360;

// Determine if a click/tap is an "increment" based on rotation
function isClickIncr(rot: number, x: number, y: number, w: number, h: number) {
	const n = normRot(rot);
	return n === 90 ? x > w / 2 : n === 270 ? x < w / 2 : n === 180 ? y > h / 2 : y < h / 2;
}

// Compute tap flash gradient direction and clip region
function flashStyle(rot: number, isTop: boolean) {
	const n = normRot(rot);
	const color = isTop ? "rgba(34, 197, 94, 0.4)" : "rgba(220, 38, 38, 0.4)";
	const horiz = n === 90 || n === 270;
	const gd: Record<number, [string, string]> = { 0: ["to bottom", "to top"], 90: ["to left", "to right"], 180: ["to top", "to bottom"], 270: ["to right", "to left"] };
	const sd: Record<number, [string, string]> = { 0: ["top", "bottom"], 90: ["right", "left"], 180: ["bottom", "top"], 270: ["left", "right"] };
	const [tg, bg] = gd[n] ?? gd[0];
	const [ts, bs] = sd[n] ?? sd[0];
	const side = isTop ? ts : bs;
	return {
		color,
		gradDir: isTop ? tg : bg,
		clip: (horiz
			? { [side]: 0, width: "50%", height: "100%", top: 0 }
			: { [side]: 0, height: "50%", width: "100%", left: 0 }) as React.CSSProperties,
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

	const [floaters, setFloaters] = useState<FloatingNumber[]>([]);
	const [tapFlash, setTapFlash] = useState<"none" | "top" | "bottom">("none");
	const [drawerState, setDrawerState] = useState<
		"closed" | "opening" | "open" | "closing"
	>("closed");
	const [activeSubtrackers, setActiveSubtrackers] = useState<
		("hp" | "mana" | "armor" | "attack")[]
	>([]);

	// Clear subtrackers on game reset
	const prevResetCounter = useRef(resetCounter);
	useEffect(() => {
		if (resetCounter !== prevResetCounter.current) {
			prevResetCounter.current = resetCounter;
			setActiveSubtrackers([]);
			setShowSubtrackerModal(false);
			setDrawerState("closed");
		}
	}, [resetCounter]);
	const [showSubtrackerModal, setShowSubtrackerModal] = useState(false);
	const cleanupTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const didLongPress = useRef(false);

	useEffect(() => {
		return () => {
			cleanupTimers.current.forEach((t) => clearTimeout(t));
			if (longPressTimer.current) clearTimeout(longPressTimer.current);
		};
	}, []);

	const spawnFloater = (isIncrement: boolean) => {
		const value = isIncrement ? 1 : -1;
		const direction = isIncrement ? 1 : -1;
		const arcX = (Math.random() - 0.5) * 30;
		const arcY = direction * -(50 + Math.random() * 40);
		const id = nextId++;

		const floater: FloatingNumber = { id, value, arcX, arcY };
		setFloaters((prev) => [...prev, floater]);

		const timer = setTimeout(() => {
			setFloaters((prev) => prev.filter((f) => f.id !== id));
			cleanupTimers.current.delete(timer);
		}, 800);
		cleanupTimers.current.add(timer);
	};

	const startLongPress = useCallback(() => {
		if (isUnselected) return;
		didLongPress.current = false;
		if (longPressTimer.current) clearTimeout(longPressTimer.current);
		longPressTimer.current = setTimeout(() => {
			didLongPress.current = true;
			setDrawerState("opening");
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setDrawerState("open"));
			});
			longPressTimer.current = null;
		}, LONG_PRESS_MS);
	}, [isUnselected]);

	const cancelLongPress = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}, []);

	// Use a ref to track touch start position for move threshold
	const touchStartPos = useRef<{ x: number; y: number } | null>(null);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			const touch = e.touches[0];
			touchStartPos.current = { x: touch.clientX, y: touch.clientY };
			startLongPress();
		},
		[startLongPress],
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!touchStartPos.current || !longPressTimer.current) return;
			const touch = e.touches[0];
			const dx = touch.clientX - touchStartPos.current.x;
			const dy = touch.clientY - touchStartPos.current.y;
			// Only cancel if finger moves more than 10px
			if (Math.sqrt(dx * dx + dy * dy) > 10) {
				cancelLongPress();
			}
		},
		[cancelLongPress],
	);

	const handleTouchEnd = useCallback(() => {
		cancelLongPress();
		touchStartPos.current = null;
	}, [cancelLongPress]);

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

	const closeDrawer = useCallback((onDone?: () => void) => {
		setDrawerState("closing");
		setTimeout(() => {
			setDrawerState("closed");
			onDone?.();
		}, 300);
	}, []);

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

	const hasSubtrackers = activeSubtrackers.length > 0;

	return (
		<div
			className={`${styles.card}${isUnselected ? ` ${styles.unselected}` : ""}`}
			onClick={handleClick}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onMouseDown={startLongPress}
			onMouseUp={cancelLongPress}
			onMouseLeave={cancelLongPress}
			onContextMenu={(e) => e.preventDefault()}
		>
			{/* Hero artwork background */}
			{template && (
				<div
					style={{
						position: "absolute",
						...(rotation === 90 || rotation === 270
							? {
									top: "50%",
									left: "50%",
									width: "100cqh",
									height: "100cqw",
									transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
								}
							: {
									inset: 0,
									transform: rotation ? `rotate(${rotation}deg)` : undefined,
								}),
						backgroundImage: `url(${rotation === 90 || rotation === 270 ? template.wideImage : template.image})`,
						backgroundSize: "cover",
						backgroundPosition:
							rotation === 90 || rotation === 270
								? template.wideFocus
								: template.focus,
						backgroundRepeat: "no-repeat",
					}}
				/>
			)}

			{/* Dim overlay for readability */}
			{template && <div className={styles.dimOverlay} />}

			{/* Tap flash overlay */}
			{tapFlash !== "none" &&
				(() => {
					const { color, gradDir, clip } = flashStyle(rotation, tapFlash === "top");
					return (
						<div
							className={styles.tapFlash}
							style={{
								...clip,
								background: `linear-gradient(${gradDir}, ${color}, transparent)`,
							}}
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
							style={{
								transform: rotation ? `rotate(${rotation}deg)` : undefined,
							}}
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

	// For 90/270: the card is tall & narrow. The visual "bottom" in rotated
	// space maps to the right edge (90°) or left edge (270°) of the card.
	// We lay out with flex-direction: row and place the drawer bar on the
	// appropriate side — no 200% expansion needed.
	const norm = ((rotation % 360) + 360) % 360;
	let flexDir: "column" | "row" | "row-reverse" = "column";
	let slideHidden = "translateY(100%)";
	let slideVisible = "translateY(0)";

	if (norm === 90) {
		flexDir = "row-reverse";
		slideHidden = "translateX(-100%)";
		slideVisible = "translateX(0)";
	} else if (norm === 270) {
		flexDir = "row";
		slideHidden = "translateX(100%)";
		slideVisible = "translateX(0)";
	}

	return (
		<div
			className={styles.drawerOverlay}
			style={{
				flexDirection: flexDir,
				...(norm === 180 ? { transform: "rotate(180deg)" } : {}),
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{/* Dim area */}
			<div
				className={styles.drawerDim}
				style={{
					backgroundColor: isVisible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
				}}
			/>

			{/* Drawer content */}
			<div
				className={`${styles.drawerContent}${is90or270 ? ` ${styles.drawerContentHoriz}` : ` ${styles.drawerContentDefault}`}`}
				onClick={(e) => e.stopPropagation()}
				style={{
					"--hero-color": heroColor,
					backgroundColor: "var(--hero-color)",
					transform: isVisible ? slideVisible : slideHidden,
				} as React.CSSProperties}
			>
				{(() => {
					const is270 = rotation === 270;
					const changeHeroBtn = (
						<button
							key="change-hero"
							className={styles.drawerBtn}
							onClick={onChangeHero}
							style={{
								padding: is90or270 ? 4 : 8,
								...(is90or270 ? { transform: `rotate(${rotation}deg)` } : {}),
							}}
						>
							<svg
								width={
									is90or270
										? "clamp(18px, 4vw, 28px)"
										: "clamp(28px, 6vw, 44px)"
								}
								height={
									is90or270
										? "clamp(18px, 4vw, 28px)"
										: "clamp(28px, 6vw, 44px)"
								}
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
							className={styles.drawerBtn}
							onClick={onToggleSubtrackers}
							style={{
								padding: is90or270 ? 4 : 8,
								...(is90or270 ? { transform: `rotate(${rotation}deg)` } : {}),
							}}
						>
							<svg
								width={
									is90or270
										? "clamp(18px, 4vw, 28px)"
										: "clamp(28px, 6vw, 44px)"
								}
								height={
									is90or270
										? "clamp(18px, 4vw, 28px)"
										: "clamp(28px, 6vw, 44px)"
								}
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
	const norm = ((rotation % 360) + 360) % 360;

	return (
		<div
			className={styles.modalBackdrop}
			style={{
				...(is90or270
					? {}
					: norm === 180
						? { transform: "rotate(180deg)" }
						: {}),
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			<div
				className={styles.modalCard}
				onClick={(e) => e.stopPropagation()}
				style={{
					minWidth: is90or270 ? undefined : "70%",
					maxWidth: is90or270 ? "80%" : "85%",
					border: `1px solid ${heroColor}`,
					...(is90or270 ? { transform: `rotate(${rotation}deg)` } : {}),
				}}
			>
				<h3 className={styles.modalHeading}>
					Add Subtracker
				</h3>
				{STAT_CONFIGS.filter((c) => c.key !== "hp").map((config) => {
					const isActive = activeKeys.includes(config.key);
					return (
						<button
							key={config.key}
							className={styles.statBtn}
							onClick={() =>
								isActive ? onRemove(config.key) : onAdd(config.key)
							}
							style={{
								backgroundColor: isActive
									? heroColor
									: "rgba(255,255,255,0.08)",
							}}
						>
							<div
								style={{
									width: "clamp(20px, 5vw, 28px)",
									height: "clamp(20px, 5vw, 28px)",
									flexShrink: 0,
								}}
							>
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
	// For single-column layout: 90° keeps default order, 270° reverses it
	const norm = ((rotation % 360) + 360) % 360;
	let stats = statsBase;
	if (norm === 270) {
		stats = [...statsBase].reverse();
	}

	const is90or270 = rotation === 90 || rotation === 270;

	return (
		<div
			style={{
				position: "absolute",
				zIndex: 1,
				...(is90or270
					? {
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
						}
					: {
							inset: 0,
							transform: rotation ? `rotate(${rotation}deg)` : undefined,
						}),
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: is90or270 ? "stretch" : "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					...(is90or270 ? { flexDirection: "column" as const } : {}),
				}}
			>
				{stats.map((stat, i) => {
					return (
						<div
							key={stat.key}
							className={styles.statCell}
							onClick={(e) => handleStatClick(e, stat.key, stat.value)}
							style={{
								...(is90or270
									? { width: "100%", flex: 1 }
									: { flex: 1, height: "100%" }),
								...(is90or270
									? {
											borderBottom:
												i < stats.length - 1
													? "1px solid rgba(255,255,255,0.15)"
													: "none",
										}
									: {
											borderRight:
												i < stats.length - 1
													? "1px solid rgba(255,255,255,0.2)"
													: "none",
										}),
							}}
						>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: "clamp(2px, 0.5vw, 4px)",
									transform: is90or270 ? `rotate(${rotation}deg)` : undefined,
								}}
							>
								<span
									className={styles.statValue}
									style={{
										fontSize: is90or270
											? `clamp(32px, ${30 / stats.length}cqmax, 90px)`
											: `clamp(28px, ${35 / stats.length}cqi, 72px)`,
									}}
								>
									{stat.value}
								</span>
								<div
									style={{
										width: is90or270
											? `clamp(20px, ${10 / stats.length}cqmax, 46px)`
											: `clamp(18px, ${14 / stats.length}cqi, 38px)`,
										height: is90or270
											? `clamp(20px, ${10 / stats.length}cqmax, 46px)`
											: `clamp(18px, ${14 / stats.length}cqi, 38px)`,
										opacity: 0.85,
										filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.7))",
									}}
								>
									{stat.icon}
								</div>
							</div>
							{/* Tap flash for this stat */}
							{flashMap[stat.key] &&
								(() => {
									const { color, gradDir, clip } = flashStyle(rotation, flashMap[stat.key] === "top");
									return (
										<div
											className={styles.tapFlash}
											style={{
												...clip,
												background: `linear-gradient(${gradDir}, ${color}, transparent)`,
											}}
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

	return (
		<span
			className={styles.floatingParticle}
			style={{
				color: isPositive ? "#4ade80" : "#f87171",
				transition: started
					? "transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.75s ease-out"
					: "none",
				transform: started
					? `translate(calc(-50% + ${rotatedArcX}px), calc(-50% + ${rotatedArcY}px)) rotate(${rotation}deg)`
					: `translate(-50%, -50%) rotate(${rotation}deg)`,
				opacity: started ? 0 : 1,
			}}
		>
			{isPositive ? "+1" : "-1"}
		</span>
	);
}
