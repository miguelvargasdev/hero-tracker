import { useState } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import { useLongPress } from "../../hooks/useLongPress";
import { useSwipeOpen } from "../../hooks/useSwipeOpen";
import { useFloatingNumbers } from "../../hooks/useFloatingNumbers";
import { useDrawerState } from "../../hooks/useDrawerState";
import { isClickIncr, flashProps, type StatKey } from "./healthCounterUtils";
import { DrawerOverlay } from "./DrawerOverlay";
import { SubtrackerModal } from "./SubtrackerModal";
import { SubtrackerView } from "./SubtrackerView";
import { FloatingParticle } from "./FloatingParticle";
import type { Hero } from "../../types/hero";
import styles from "./HealthCounter.module.css";

interface HealthCounterProps {
	hero: Hero;
	rotation?: number;
	onSelect: () => void;
}

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

	const { floaters, spawn: spawnFloater } = useFloatingNumbers();
	const [tapFlash, setTapFlash] = useState<"none" | "top" | "bottom">("none");
	const { drawerState, openDrawer, closeDrawer } = useDrawerState();
	const [activeSubtrackers, setActiveSubtrackers] = useState<StatKey[]>([]);
	const [showSubtrackerModal, setShowSubtrackerModal] = useState(false);

	const { handlers: longPressHandlers, didFire: didLongPress } = useLongPress(
		openDrawer,
		{ disabled: isUnselected },
	);
	const { handlers: swipeHandlers, didFire: didSwipe } = useSwipeOpen(
		openDrawer,
		{ rotation, disabled: isUnselected },
	);

	const combinedHandlers = {
		...longPressHandlers,
		onTouchStart: (e: React.TouchEvent) => {
			longPressHandlers.onTouchStart(e);
			swipeHandlers.onTouchStart(e);
		},
		onTouchMove: (e: React.TouchEvent) => {
			longPressHandlers.onTouchMove(e);
			swipeHandlers.onTouchMove(e);
		},
		onTouchEnd: () => {
			longPressHandlers.onTouchEnd();
			swipeHandlers.onTouchEnd();
		},
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (didLongPress.current || didSwipe.current) return;

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

	const handleAddSubtracker = (key: StatKey) => {
		setActiveSubtrackers((prev) => [...prev, key]);
	};

	const handleRemoveSubtracker = (key: StatKey) => {
		setActiveSubtrackers((prev) => prev.filter((k) => k !== key));
	};

	const is90or270 = rotation === 90 || rotation === 270;
	const rotDeg = `${rotation}deg`;
	const hasSubtrackers = activeSubtrackers.length > 0;

	return (
		<div
			className={`${styles.card}${isUnselected ? ` ${styles.unselected}` : ""}`}
			onClick={handleClick}
			{...combinedHandlers}
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

function HealthIcon() {
	return (
		<img
			src={`${import.meta.env.BASE_URL}icons/health.png`}
			alt="HP"
			className={styles.healthIcon}
		/>
	);
}
