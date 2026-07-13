import { useState } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { useModalAnimation } from "../../hooks/useModalAnimation";
import { HealthCounter } from "./HealthCounter";
import { HeroSelectModal } from "./HeroSelectModal";
import { TutorialModal } from "./TutorialModal";
import { TyrantLayout } from "./TyrantLayout";
import { useTutorialSeen } from "../../hooks/useTutorialSeen";
import { useWakeLock } from "../../hooks/useWakeLock";
import { APP_VERSION_DISPLAY } from "../../version";
import styles from "./GameView.module.css";

export function GameView() {
	useWakeLock(true);
	const heroes = useHeroStore((s) => s.heroes);
	const gameMode = useHeroStore((s) => s.gameMode);
	const navigateTo = useHeroStore((s) => s.navigateTo);
	const resetGame = useHeroStore((s) => s.resetGame);
	const resetCounter = useHeroStore((s) => s.resetCounter);
	const { visible: menuVisible, exiting: menuExiting, open: openMenu, close: closeMenu } = useModalAnimation();
	const [selectingPlayerId, setSelectingPlayerId] = useState<string | null>(
		null,
	);
	const tutorialSeen = useTutorialSeen();
	const [tutorialDismissed, setTutorialDismissed] = useState(false);
	const [showTutorial, setShowTutorial] = useState(false);

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
						<div className={styles.menuVersion}>{APP_VERSION_DISPLAY}</div>
					</div>
				</div>
			)}

			{/* Center menu button (crown icon) */}
			<button
				onClick={openMenu}
				onDragStart={(e) => e.preventDefault()}
				className={`${styles.crownBtn} ${isSolo ? styles.crownSolo : styles.crownCenter}`}
				style={!isSolo ? { "--crown-top": getMenuTopPercent() } as React.CSSProperties : undefined}
				aria-label="Menu"
			>
				<img
					src={`${import.meta.env.BASE_URL}crown.png`}
					alt="Menu"
					draggable={false}
					className={`${styles.crownImg}${isTyrant ? ` ${styles.crownImgTyrant}` : ""}`}
				/>
			</button>

			{/* Counter grid */}
			{isSolo ? (
				<HealthCounter
					key={resetCounter}
					hero={heroes[0]}
					onSelect={() => setSelectingPlayerId(heroes[0].id)}
				/>
			) : isTyrant ? (
				<TyrantLayout
					heroes={heroes}
					onSelect={(id) => setSelectingPlayerId(id)}
					resetCounter={resetCounter}
				/>
			) : (
				<div
					className={`${styles.counterGrid} ${getGridClass(heroes.length)}`}
				>
					{heroes.map((hero, index) => (
						<div
							key={hero.id}
							className={`${styles.gridItem}${shouldSpan(index, heroes.length) ? ` ${styles.gridItemSpan}` : ""}`}
						>
							<HealthCounter
								key={`${hero.id}-${resetCounter}`}
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

function shouldSpan(index: number, total: number): boolean {
	return (total === 5 && index === 4) || (total === 3 && index === 2);
}

const GRID_CLASSES: Record<number, string> = {
	2: styles.grid2,
	3: styles.grid3,
	4: styles.grid4,
	5: styles.grid5,
	6: styles.grid6,
};

function getGridClass(count: number): string {
	return GRID_CLASSES[count] ?? styles.grid2;
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

