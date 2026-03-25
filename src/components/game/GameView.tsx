import { useState, useCallback, useEffect } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HealthCounter } from "./HealthCounter";
import { HeroSelectModal } from "./HeroSelectModal";
import { TutorialModal, useTutorialSeen } from "./TutorialModal";
import type { Hero } from "../../types/hero";

/** Returns crown rotation angle based on screen orientation */
function useOrientationAngle(): number {
	const getAngle = () => {
		if (screen.orientation) return screen.orientation.angle;
		return 0;
	};
	const [angle, setAngle] = useState(getAngle);
	useEffect(() => {
		const handler = () => setAngle(getAngle());
		if (screen.orientation) {
			screen.orientation.addEventListener("change", handler);
			return () => screen.orientation.removeEventListener("change", handler);
		}
	}, []);
	return angle;
}

const MENU_KEYFRAMES = `
	@keyframes menuBackdropIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes menuBackdropOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}
	@keyframes menuCardIn {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes menuCardOut {
		from { opacity: 1; transform: scale(1); }
		to { opacity: 0; transform: scale(0.85) translateY(10px); }
	}
	@keyframes menuBtnIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
`;

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
	const orientationAngle = useOrientationAngle();

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
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#000",
				padding: 8,
			}}
		>
			{/* Menu overlay */}
			{menuVisible && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						zIndex: 10,
						backgroundColor: "rgba(0,0,0,0.7)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						animation: menuExiting
							? "menuBackdropOut 0.18s ease-in forwards"
							: "menuBackdropIn 0.15s ease-out",
					}}
					onClick={() => closeMenu()}
				>
					<style>{MENU_KEYFRAMES}</style>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							backgroundColor: "#2a2a2e",
							borderRadius: 12,
							padding: 24,
							display: "flex",
							flexDirection: "column",
							gap: 12,
							minWidth: 200,
							border: "1px solid #444",
							animation: menuExiting
								? "menuCardOut 0.18s ease-in forwards"
								: "menuCardIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
						}}
					>
						{[
							{ label: "Reset", action: () => closeMenu(() => resetGame()) },
							{ label: "Main Menu", action: () => closeMenu(() => navigateTo("main-menu")) },
							{ label: "Help", action: () => closeMenu(() => setShowTutorial(true)) },
						].map((item, i) => (
							<button
								key={item.label}
								onClick={item.action}
								style={{
									padding: "10px 20px",
									fontSize: 16,
									backgroundColor: "#3a3a3e",
									color: "#eee",
									border: "none",
									borderRadius: 8,
									cursor: "pointer",
									animation: menuExiting
										? undefined
										: `menuBtnIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s both`,
									transition: "transform 0.15s",
								}}
							>
								{item.label}
							</button>
						))}
						<button
							onClick={() => closeMenu()}
							style={{
								padding: "10px 20px",
								fontSize: 16,
								backgroundColor: "transparent",
								color: "#888",
								border: "1px solid #555",
								borderRadius: 8,
								cursor: "pointer",
								animation: menuExiting
									? undefined
									: `menuBtnIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) ${3 * 0.03}s both`,
								transition: "transform 0.15s",
							}}
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
				style={{
					position: "absolute",
					...(isSolo
						? { top: 8, right: 8 }
						: { top: getMenuTopPercent(), left: "50%", transform: "translate(-50%, -50%)" }),
					zIndex: 5,
					width: 40,
					height: 40,
					backgroundColor: "rgba(0, 0, 0, 0.8)",
					border: "none",
					borderRadius: "50%",
					cursor: "pointer",
					padding: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					touchAction: "none",
					userSelect: "none",
					WebkitUserSelect: "none",
					WebkitTouchCallout: "none",
				} as React.CSSProperties}
				aria-label="Menu"
			>
				<img
					src={`${import.meta.env.BASE_URL}crown.png`}
					alt="Menu"
					draggable={false}
					style={{
						width: 26,
						height: 26,
						objectFit: "contain",
						transform: `rotate(${isTyrant ? 90 : orientationAngle}deg)`,
						transition: "transform 0.3s ease",
						pointerEvents: "none",
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
					style={{
						display: "grid",
						...getGridLayout(heroes.length),
						gap: 12,
						flex: 1,
						padding: 4,
					}}
				>
					{heroes.map((hero, index) => (
						<div key={hero.id} style={getItemStyle(index, heroes.length)}>
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
				<TutorialModal onClose={() => { setTutorialDismissed(true); setShowTutorial(false); }} />
			)}
		</div>
	);
}

function getItemStyle(index: number, total: number): React.CSSProperties {
	if (total === 5 && index === 4) {
		return { gridColumn: "span 2", height: "100%" };
	}
	if (total === 3 && index === 2) {
		return { gridColumn: "span 2", height: "100%" };
	}
	return { height: "100%" };
}

function getGridLayout(count: number): React.CSSProperties {
	switch (count) {
		case 2:
			return {
				gridTemplateColumns: "1fr",
				gridTemplateRows: "1fr 1fr",
			};
		case 3:
			return {
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "1fr 1fr",
			};
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
			return index < 2 ? 180 : 0;
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
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: `repeat(${team.length}, 1fr)`,
				gap: 8,
				flex: 1,
				padding: 4,
			}}
		>
			{/* Boss: right column, spans all rows */}
			<div style={{ gridColumn: 2, gridRow: `1 / ${team.length + 1}`, height: "100%" }}>
				<HealthCounter
					hero={boss}
					rotation={270}
					onSelect={() => onSelect(boss.id)}
				/>
			</div>
			{/* Team: stacked vertically in left column, rotated 90° */}
			{team.map((hero, i) => (
				<div key={hero.id} style={{ gridColumn: 1, gridRow: i + 1, height: "100%" }}>
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
