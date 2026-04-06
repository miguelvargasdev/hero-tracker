import { useState, useCallback } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HealthCounter } from "./HealthCounter";
import { HeroSelectModal } from "./HeroSelectModal";
import { TutorialModal, useTutorialSeen } from "./TutorialModal";
import type { Hero } from "../../types/hero";
import styles from "./GameView.module.css";

export function GameView() {
	const heroes = useHeroStore((s) => s.heroes);
	const gameMode = useHeroStore((s) => s.gameMode);
	const navigateTo = useHeroStore((s) => s.navigateTo);
	const resetGame = useHeroStore((s) => s.resetGame);
	const [menuVisible, setMenuVisible] = useState(false);
	const [menuExiting, setMenuExiting] = useState(false);
	const [selectingPlayerId, setSelectingPlayerId] = useState<string | null>(
		null,
	);
	const tutorialSeen = useTutorialSeen();
	const [tutorialDismissed, setTutorialDismissed] = useState(false);
	const [showTutorial, setShowTutorial] = useState(false);

	const openMenu = useCallback(() => {
		setMenuVisible(true);
		setMenuExiting(false);
	}, []);

	const closeMenu = useCallback((onDone?: () => void) => {
		setMenuExiting(true);
		setTimeout(() => {
			setMenuVisible(false);
			setMenuExiting(false);
			onDone?.();
		}, 180);
	}, []);

	if (heroes.length === 0) {
		navigateTo("main-menu");
		return null;
	}

	const isSolo = gameMode === "solo";
	const isTyrant = gameMode === "tyrant";

	// Crown button sits at the gap between columns/rows
	const getMenuTopPercent = () => {
		if (isTyrant) {
			return "50%"; // Vertical center between left/right columns
		}
		const count = heroes.length;
		if (count === 5) return "33.3%"; // 3 rows → 1/3
		return "50%"; // 2 rows → 1/2
	};

	return (
		<div className={styles.root}>
			{/* Menu overlay */}
			{menuVisible && (
				<div
					className={`${styles.menuOverlay} ${menuExiting ? styles.backdropOut : styles.backdropIn}`}
					onClick={() => closeMenu()}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className={`${styles.menuCard} ${menuExiting ? styles.cardOut : styles.cardIn}`}
					>
						{[
							{ label: "Reset", action: () => closeMenu(() => resetGame()) },
							{
								label: "Main Menu",
								action: () => closeMenu(() => navigateTo("main-menu")),
							},
							{
								label: "Help",
								action: () => closeMenu(() => setShowTutorial(true)),
							},
						].map((item, i) => (
							<button
								key={item.label}
								onClick={item.action}
								className={`${styles.menuBtn} ${menuExiting ? "" : styles.menuBtnAnimated}`}
								style={
									menuExiting
										? undefined
										: ({ "--delay": `${i * 0.03}s` } as React.CSSProperties)
								}
							>
								{item.label}
							</button>
						))}
						<button
							onClick={() => closeMenu()}
							className={`${styles.cancelBtn} ${menuExiting ? "" : styles.cancelBtnAnimated}`}
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Center menu button (crown icon) */}
			<button
				onClick={openMenu}
				onDragStart={(e) => e.preventDefault()}
				className={styles.crownBtn}
				style={
					isSolo
						? { top: 8, right: 8 }
						: {
								top: getMenuTopPercent(),
								left: "50%",
								transform: "translate(-50%, -50%)",
							}
				}
				aria-label="Menu"
			>
				<img
					src={`${import.meta.env.BASE_URL}crown.png`}
					alt="Menu"
					draggable={false}
					className={styles.crownImg}
					style={{
						transform: isTyrant ? "rotate(-90deg)" : undefined,
					}}
				/>
			</button>

			{/* Counter grid */}
			{isSolo ? (
				<HealthCounter
					hero={heroes[0]}
					onSelect={() => setSelectingPlayerId(heroes[0].id)}
				/>
			) : isTyrant ? (
				<TyrantLayout
					heroes={heroes}
					onSelect={(id) => setSelectingPlayerId(id)}
				/>
			) : (
				<div
					className={styles.counterGrid}
					style={getGridLayout(heroes.length)}
				>
					{heroes.map((hero, index) => (
						<div
							key={hero.id}
							className={styles.gridItem}
							style={getItemStyle(index, heroes.length)}
						>
							<HealthCounter
								hero={hero}
								rotation={getRotation(index, heroes.length)}
								onSelect={() => setSelectingPlayerId(hero.id)}
							/>
						</div>
					))}
				</div>
			)}

			{/* Hero selection overlay */}
			<HeroSelectModal
				playerId={selectingPlayerId}
				isOpen={selectingPlayerId !== null}
				onClose={() => setSelectingPlayerId(null)}
			/>

			{/* First-use tutorial (auto on first launch, or from Help button) */}
			{((!tutorialSeen && !tutorialDismissed) || showTutorial) && (
				<TutorialModal
					onClose={() => {
						setTutorialDismissed(true);
						setShowTutorial(false);
					}}
				/>
			)}
		</div>
	);
}

function getItemStyle(index: number, total: number): React.CSSProperties {
	return (total === 5 && index === 4) || (total === 3 && index === 2)
		? { gridColumn: "span 2" }
		: {};
}

function getGridLayout(count: number): React.CSSProperties {
	switch (count) {
		case 2:
			return {
				gridTemplateColumns: "1fr",
				gridTemplateRows: "1fr 1fr",
			};
		case 3:
		case 4:
			return {
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "1fr 1fr",
			};
		case 5:
			return {
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "1fr 1fr 1fr",
			};
		case 6:
			return {
				gridTemplateColumns: "1fr 1fr 1fr",
				gridTemplateRows: "1fr 1fr",
			};
		default:
			return {
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "1fr",
			};
	}
}

/** Returns the rotation in degrees for each player's counter */
function getRotation(index: number, total: number): number {
	switch (total) {
		case 2:
			return index === 0 ? 180 : 0;
		case 3:
		case 4:
			return index < 2 ? 180 : 0;
		case 5:
			// P1=90°, P2=270°, P3=90°, P4=270°, P5=0°
			if (index === 0 || index === 2) return 90;
			if (index === 1 || index === 3) return 270;
			return 0;
		case 6:
			return index < 3 ? 180 : 0;
		default:
			return 0;
	}
}

/* ─── Tyrant Layout ─── */

function TyrantLayout({
	heroes,
	onSelect,
}: {
	heroes: Hero[];
	onSelect: (id: string) => void;
}) {
	const boss = heroes.find((h) => h.role === "boss");
	const team = heroes.filter((h) => h.role === "team");

	if (!boss) return null;

	return (
		<div
			className={styles.tyrantGrid}
			style={{
				gridTemplateRows: `repeat(${team.length}, 1fr)`,
			}}
		>
			{/* Boss: right column, spans all rows */}
			<div
				style={{
					gridColumn: 2,
					gridRow: `1 / ${team.length + 1}`,
					height: "100%",
				}}
			>
				<HealthCounter
					hero={boss}
					rotation={270}
					onSelect={() => onSelect(boss.id)}
				/>
			</div>
			{/* Team: stacked vertically in left column, rotated 90° */}
			{team.map((hero, i) => (
				<div
					key={hero.id}
					style={{ gridColumn: 1, gridRow: i + 1, height: "100%" }}
				>
					<HealthCounter
						hero={hero}
						rotation={90}
						onSelect={() => onSelect(hero.id)}
					/>
				</div>
			))}
		</div>
	);
}
