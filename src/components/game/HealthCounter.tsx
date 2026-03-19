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

	const isUnselected = hero.templateId === null;
	const template = isUnselected
		? null
		: HERO_TEMPLATES.find((t) => t.id === hero.templateId);

	const [floaters, setFloaters] = useState<FloatingNumber[]>([]);
	const [showDrawer, setShowDrawer] = useState(false);
	const [showSubtrackers, setShowSubtrackers] = useState(false);
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
			setShowDrawer(true);
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

		if (showDrawer) return;

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
	};

	const handleChangeHero = () => {
		setShowDrawer(false);
		onSelect();
	};

	const handleToggleSubtrackers = () => {
		setShowDrawer(false);
		setShowSubtrackers((prev) => !prev);
	};

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
			}}
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
									width: "200%",
									height: "200%",
									transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
								}
							: {
									inset: 0,
									transform: rotation ? `rotate(${rotation}deg)` : undefined,
								}),
						backgroundImage: `url(${template.image})`,
						backgroundSize: "200%",
						backgroundPosition: template.focus,
						backgroundRepeat: "no-repeat",
					}}
				/>
			)}

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
					{!showSubtrackers && (
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
					{showSubtrackers && (
						<SubtrackerView hero={hero} rotation={rotation} />
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
			{showDrawer && (
				<DrawerOverlay
					heroColor={template?.color ?? "#333"}
					rotation={rotation}
					onChangeHero={handleChangeHero}
					onToggleSubtrackers={handleToggleSubtrackers}
					showingSubtrackers={showSubtrackers}
					onClose={() => setShowDrawer(false)}
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
	showingSubtrackers,
	onClose,
}: {
	heroColor: string;
	rotation: number;
	onChangeHero: () => void;
	onToggleSubtrackers: () => void;
	showingSubtrackers: boolean;
	onClose: () => void;
}) {
	// For 90/270 rotations, we need to expand the overlay like the artwork
	const is90or270 = rotation === 90 || rotation === 270;

	return (
		<div
			style={{
				position: "absolute",
				...(is90or270
					? {
							top: "50%",
							left: "50%",
							width: "200%",
							height: "200%",
							transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
						}
					: {
							inset: 0,
							transform: rotation ? `rotate(${rotation}deg)` : undefined,
						}),
				zIndex: 5,
				display: "flex",
				flexDirection: "column",
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{/* Dim top area */}
			<div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />

			{/* Drawer content */}
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					backgroundColor: heroColor,
					padding: "clamp(12px, 3vw, 24px)",
					display: "flex",
					justifyContent: "space-evenly",
					alignItems: "center",
					gap: 16,
				}}
			>
				<button
					onClick={onChangeHero}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
						color: "#fff",
						padding: 8,
					}}
				>
					{/* Refresh/change icon */}
					<svg
						width="clamp(28px, 6vw, 44px)"
						height="clamp(28px, 6vw, 44px)"
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
				</button>

				<button
					onClick={onToggleSubtrackers}
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 8,
						color: "#fff",
						padding: 8,
					}}
				>
					{/* Stacked tokens/coins icon */}
					<svg
						width="clamp(28px, 6vw, 44px)"
						height="clamp(28px, 6vw, 44px)"
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
						{showingSubtrackers ? "Main View" : "Subtrackers"}
					</span>
				</button>
			</div>
		</div>
	);
}

/* ─── Subtracker View ─── */

interface StatConfig {
	key: "hp" | "mana" | "armor";
	label: string;
	icon: React.ReactNode;
}

const STAT_CONFIGS: StatConfig[] = [
	{
		key: "hp",
		label: "HP",
		icon: (
			<img
				src={`${import.meta.env.BASE_URL}hp-icon.png`}
				alt="HP"
				style={{
					width: "100%",
					height: "100%",
					filter:
						"brightness(0) invert(1) drop-shadow(0 1px 3px rgba(0,0,0,0.8))",
				}}
			/>
		),
	},
	{
		key: "armor",
		label: "Armor",
		icon: (
			<svg viewBox="0 0 24 24" fill="white" width="100%" height="100%">
				<path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
			</svg>
		),
	},
	{
		key: "mana",
		label: "Mana",
		icon: (
			<svg viewBox="0 0 24 24" fill="white" width="100%" height="100%">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
			</svg>
		),
	},
];

function SubtrackerView({
	hero,
	rotation,
}: {
	hero: Hero;
	rotation: number;
}) {
	const updateStat = useHeroStore((s) => s.updateStat);

	const handleStatClick = (
		e: React.MouseEvent,
		statKey: "hp" | "mana" | "armor",
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
	};

	const stats = STAT_CONFIGS.map((config) => ({
		...config,
		value: hero[config.key].current,
	}));

	const is90or270 = rotation === 90 || rotation === 270;

	return (
		<div
			style={{
				position: "absolute",
				zIndex: 1,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				...(is90or270
					? {
							top: "50%",
							left: "50%",
							width: "200%",
							height: "200%",
							transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
						}
					: {
							inset: 0,
							transform: rotation ? `rotate(${rotation}deg)` : undefined,
						}),
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
				}}
			>
				{stats.map((stat, i) => (
					<div
						key={stat.key}
						onClick={(e) => handleStatClick(e, stat.key, stat.value)}
						style={{
							flex: 1,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: "clamp(2px, 0.5vw, 6px)",
							cursor: "pointer",
							borderRight:
								i < stats.length - 1
									? "1px solid rgba(255,255,255,0.2)"
									: "none",
						}}
					>
						<span
							style={{
								fontFamily: "'Cinzel', serif",
								fontSize: "clamp(24px, 8vw, 56px)",
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
								width: "clamp(14px, 4vw, 28px)",
								height: "clamp(14px, 4vw, 28px)",
								opacity: 0.85,
								filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.7))",
							}}
						>
							{stat.icon}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Health Icon ─── */

function HealthIcon() {
	return (
		<img
			src={`${import.meta.env.BASE_URL}hp-icon.png`}
			alt="HP"
			style={{
				width: "clamp(18px, 5vw, 36px)",
				height: "clamp(18px, 5vw, 36px)",
				filter:
					"brightness(0) invert(1) drop-shadow(0 2px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 4px rgba(0,0,0,0.6))",
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
