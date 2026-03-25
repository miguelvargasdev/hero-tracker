import { useState, useRef, useEffect, useCallback } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import type { Hero } from "../../types/hero";

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
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		let isIncrement: boolean;
		const norm = ((rotation % 360) + 360) % 360;
		if (norm === 90) {
			isIncrement = clickX > rect.width / 2;
		} else if (norm === 270) {
			isIncrement = clickX < rect.width / 2;
		} else if (norm === 180) {
			isIncrement = clickY > rect.height / 2;
		} else {
			isIncrement = clickY < rect.height / 2;
		}

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
		setShowSubtrackerModal(false);
	};

	const handleRemoveSubtracker = (key: "hp" | "mana" | "armor" | "attack") => {
		setActiveSubtrackers((prev) => prev.filter((k) => k !== key));
	};

	const hasSubtrackers = activeSubtrackers.length > 0;

	return (
		<div
			onClick={handleClick}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onMouseDown={startLongPress}
			onMouseUp={cancelLongPress}
			onMouseLeave={cancelLongPress}
			onContextMenu={(e) => e.preventDefault()}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				cursor: "pointer",
				userSelect: "none",
				backgroundColor: "#2a2a2e",
				borderRadius: 12,
				border: isUnselected ? "2px solid #555" : "none",
				position: "relative",
				overflow: "hidden",
				touchAction: "manipulation",
				containerType: "size",
			} as React.CSSProperties}
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
			{template && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundColor: "rgba(0,0,0,0.2)",
					}}
				/>
			)}

			{/* Tap flash overlay */}
			{tapFlash !== "none" &&
				(() => {
					const norm = ((rotation % 360) + 360) % 360;
					const isTop = tapFlash === "top";
					const color = isTop
						? "rgba(74, 222, 128, 0.2)"
						: "rgba(248, 113, 113, 0.2)";
					// Gradient from edge (color) to center (transparent)
					// Direction points from the outer edge inward
					let gradDir: string;
					if (norm === 90) {
						gradDir = isTop ? "to left" : "to right";
					} else if (norm === 270) {
						gradDir = isTop ? "to right" : "to left";
					} else if (norm === 180) {
						gradDir = isTop ? "to top" : "to bottom";
					} else {
						gradDir = isTop ? "to bottom" : "to top";
					}
					const clipStyle: React.CSSProperties =
						norm === 90
							? {
									[isTop ? "right" : "left"]: 0,
									width: "50%",
									height: "100%",
									top: 0,
								}
							: norm === 270
								? {
										[isTop ? "left" : "right"]: 0,
										width: "50%",
										height: "100%",
										top: 0,
									}
								: norm === 180
									? {
											[isTop ? "bottom" : "top"]: 0,
											height: "50%",
											width: "100%",
											left: 0,
										}
									: {
											[isTop ? "top" : "bottom"]: 0,
											height: "50%",
											width: "100%",
											left: 0,
										};
					return (
						<div
							style={{
								position: "absolute",
								...clipStyle,
								background: `linear-gradient(${gradDir}, ${color}, transparent)`,
								zIndex: 2,
								pointerEvents: "none",
								animation: "tapFlashFade 0.15s ease-out forwards",
							}}
						/>
					);
				})()}
			<style>{`
				@keyframes tapFlashFade {
					from { opacity: 1; }
					to { opacity: 0; }
				}
			`}</style>

			{/* Content */}
			{isUnselected ? (
				<svg
					width="40%"
					height="40%"
					viewBox="0 0 40 40"
					style={{ opacity: 0.4 }}
				>
					<rect x="16" y="4" width="8" height="32" rx="2" fill="#888" />
					<rect x="4" y="16" width="32" height="8" rx="2" fill="#888" />
				</svg>
			) : (
				<>
					{/* Main HP display (hidden when subtrackers are showing) */}
					{!hasSubtrackers && (
						<div
							style={{
								position: "relative",
								zIndex: 1,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "clamp(2px, 0.5vw, 6px)",
								transform: rotation ? `rotate(${rotation}deg)` : undefined,
							}}
						>
							<span
								style={{
									fontFamily: "'Cinzel', serif",
									fontSize: "clamp(48px, 15vw, 120px)",
									fontWeight: 900,
									color: "#fff",
									lineHeight: 1,
									textShadow:
										"0 2px 12px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)",
									letterSpacing: "-0.02em",
								}}
							>
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
			style={{
				position: "absolute",
				inset: 0,
				...(norm === 180 ? { transform: "rotate(180deg)" } : {}),
				zIndex: 5,
				display: "flex",
				flexDirection: flexDir,
				overflow: "hidden",
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{/* Dim area */}
			<div
				style={{
					flex: 1,
					backgroundColor: isVisible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
					transition: "background-color 0.3s ease",
				}}
			/>

			{/* Drawer content */}
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					backgroundColor: heroColor,
					padding: "clamp(8px, 2vw, 16px)",
					display: "flex",
					...(is90or270
						? {
								flexDirection: "column" as const,
								justifyContent: "space-evenly",
								alignItems: "center",
							}
						: {
								justifyContent: "space-evenly",
								alignItems: "center",
							}),
					gap: is90or270 ? 8 : 16,
					transform: isVisible ? slideVisible : slideHidden,
					transition: "transform 0.3s ease",
				}}
			>
				{(() => {
					const is270 = rotation === 270;
					const changeHeroBtn = (
						<button
							key="change-hero"
							onClick={onChangeHero}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 4,
								color: "#fff",
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
								<span
									style={{
										fontFamily: "'Cinzel', serif",
										fontWeight: 700,
										fontSize: "clamp(10px, 2.5vw, 14px)",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
										textShadow: "0 1px 3px rgba(0,0,0,0.5)",
									}}
								>
									Change Hero
								</span>
							)}
						</button>
					);
					const subtrackersBtn = (
						<button
							key="subtrackers"
							onClick={onToggleSubtrackers}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 4,
								color: "#fff",
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
								<span
									style={{
										fontFamily: "'Cinzel', serif",
										fontWeight: 700,
										fontSize: "clamp(10px, 2.5vw, 14px)",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
										textShadow: "0 1px 3px rgba(0,0,0,0.5)",
									}}
								>
									Subtrackers
								</span>
							)}
						</button>
					);
					const divider = (
						<div
							key="divider"
							style={{
								...(is90or270
									? {
											width: "60%",
											height: 1,
											alignSelf: "center",
										}
									: {
											width: 1,
											height: "60%",
											alignSelf: "center",
										}),
								backgroundColor: "rgba(255,255,255,0.3)",
								flexShrink: 0,
							}}
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
			style={{
				position: "absolute",
				inset: 0,
				zIndex: 10,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "rgba(0,0,0,0.7)",
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
				onClick={(e) => e.stopPropagation()}
				style={{
					backgroundColor: "#1a1a1e",
					borderRadius: 12,
					padding: "clamp(12px, 3vw, 20px)",
					display: "flex",
					flexDirection: "column",
					gap: 8,
					minWidth: is90or270 ? undefined : "70%",
					maxWidth: is90or270 ? "80%" : "85%",
					border: `1px solid ${heroColor}`,
					...(is90or270 ? { transform: `rotate(${rotation}deg)` } : {}),
				}}
			>
				<h3
					style={{
						margin: 0,
						color: "#fff",
						fontFamily: "'Cinzel', serif",
						fontSize: "clamp(12px, 3vw, 16px)",
						textAlign: "center",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
					}}
				>
					Add Subtracker
				</h3>
				{STAT_CONFIGS.filter((c) => c.key !== "hp").map((config) => {
					const isActive = activeKeys.includes(config.key);
					return (
						<button
							key={config.key}
							onClick={() =>
								isActive ? onRemove(config.key) : onAdd(config.key)
							}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 12,
								padding: "clamp(8px, 2vw, 12px)",
								backgroundColor: isActive
									? heroColor
									: "rgba(255,255,255,0.08)",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								color: "#fff",
								fontFamily: "'Cinzel', serif",
								fontSize: "clamp(12px, 3vw, 16px)",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
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
							<span style={{ flex: 1, textAlign: "left" }}>{config.label}</span>
							{isActive && (
								<span
									style={{ fontSize: "clamp(10px, 2.5vw, 14px)", opacity: 0.7 }}
								>
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

const STAT_ICON_STYLE: React.CSSProperties = {
	width: "100%",
	height: "100%",
	filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))",
};

const STAT_CONFIGS: StatConfig[] = [
	{
		key: "hp",
		label: "HP",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}icons/health.png`}
				alt="HP"
				style={STAT_ICON_STYLE}
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
				style={STAT_ICON_STYLE}
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
				style={STAT_ICON_STYLE}
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
				style={STAT_ICON_STYLE}
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
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		// Account for rotation — the container is rotated so screen coords
		// map differently to the logical top/bottom
		let isIncrement: boolean;
		const norm = ((rotation % 360) + 360) % 360;
		if (norm === 90) {
			isIncrement = clickX > rect.width / 2;
		} else if (norm === 270) {
			isIncrement = clickX < rect.width / 2;
		} else if (norm === 180) {
			isIncrement = clickY > rect.height / 2;
		} else {
			isIncrement = clickY < rect.height / 2;
		}

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
							onClick={(e) => handleStatClick(e, stat.key, stat.value)}
							style={{
								...(is90or270
									? { width: "100%", flex: 1 }
									: { flex: 1, height: "100%" }),
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								position: "relative",
								overflow: "hidden",
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
									style={{
										fontFamily: "'Cinzel', serif",
										fontSize: is90or270
											? "clamp(20px, 5vw, 36px)"
											: "clamp(24px, 8vw, 56px)",
										fontWeight: 900,
										color: "#fff",
										lineHeight: 1,
										textShadow:
											"0 2px 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)",
										letterSpacing: "-0.02em",
									}}
								>
									{stat.value}
								</span>
								<div
									style={{
										width: is90or270
											? "clamp(14px, 4vw, 24px)"
											: "clamp(14px, 4vw, 28px)",
										height: is90or270
											? "clamp(14px, 4vw, 24px)"
											: "clamp(14px, 4vw, 28px)",
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
									const isTop = flashMap[stat.key] === "top";
									const color = isTop
										? "rgba(74, 222, 128, 0.2)"
										: "rgba(248, 113, 113, 0.2)";
									const n = ((rotation % 360) + 360) % 360;
									let gradDir: string;
									if (n === 90) {
										gradDir = isTop ? "to left" : "to right";
									} else if (n === 270) {
										gradDir = isTop ? "to right" : "to left";
									} else if (n === 180) {
										gradDir = isTop ? "to top" : "to bottom";
									} else {
										gradDir = isTop ? "to bottom" : "to top";
									}
									const pos: React.CSSProperties =
										n === 90
											? {
													[isTop ? "right" : "left"]: 0,
													width: "50%",
													height: "100%",
													top: 0,
												}
											: n === 270
												? {
														[isTop ? "left" : "right"]: 0,
														width: "50%",
														height: "100%",
														top: 0,
													}
												: n === 180
													? {
															[isTop ? "bottom" : "top"]: 0,
															height: "50%",
															width: "100%",
															left: 0,
														}
													: {
															[isTop ? "top" : "bottom"]: 0,
															height: "50%",
															width: "100%",
															left: 0,
														};
									return (
										<div
											style={{
												position: "absolute",
												...pos,
												background: `linear-gradient(${gradDir}, ${color}, transparent)`,
												zIndex: 2,
												pointerEvents: "none",
												animation: "tapFlashFade 0.15s ease-out forwards",
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
			style={{
				width: "clamp(18px, 5vw, 36px)",
				height: "clamp(18px, 5vw, 36px)",
				filter:
					"drop-shadow(0 2px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 4px rgba(0,0,0,0.6))",
				opacity: 0.85,
			}}
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
			style={{
				position: "absolute",
				zIndex: 3,
				top: "50%",
				left: "50%",
				fontFamily: "'Cinzel', serif",
				fontSize: "clamp(16px, 4vw, 28px)",
				fontWeight: 700,
				color: isPositive ? "#4ade80" : "#f87171",
				lineHeight: 1,
				textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.7)",
				pointerEvents: "none",
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
