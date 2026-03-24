import { useState } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HealthCounter } from "./HealthCounter";
import { HeroSelectModal } from "./HeroSelectModal";

export function GameView() {
	const heroes = useHeroStore((s) => s.heroes);
	const gameMode = useHeroStore((s) => s.gameMode);
	const navigateTo = useHeroStore((s) => s.navigateTo);
	const resetGame = useHeroStore((s) => s.resetGame);
	const [menuOpen, setMenuOpen] = useState(false);
	const [selectingPlayerId, setSelectingPlayerId] = useState<string | null>(
		null,
	);

	if (heroes.length === 0) {
		navigateTo("main-menu");
		return null;
	}

	const isSolo = gameMode === "solo";

	// Crown button sits at the gap between row 1 and row 2
	const getMenuTopPercent = () => {
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
			{menuOpen && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						zIndex: 10,
						backgroundColor: "rgba(0,0,0,0.7)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					onClick={() => setMenuOpen(false)}
				>
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
						}}
					>
						<button
							onClick={() => {
								resetGame();
								setMenuOpen(false);
							}}
							style={{
								padding: "10px 20px",
								fontSize: 16,
								backgroundColor: "#3a3a3e",
								color: "#eee",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							Reset
						</button>
						<button
							onClick={() => navigateTo("main-menu")}
							style={{
								padding: "10px 20px",
								fontSize: 16,
								backgroundColor: "#3a3a3e",
								color: "#eee",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							Main Menu
						</button>
						<button
							onClick={() => setMenuOpen(false)}
							style={{
								padding: "10px 20px",
								fontSize: 16,
								backgroundColor: "transparent",
								color: "#888",
								border: "1px solid #555",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Center menu button (crown icon) */}
			<button
				onClick={() => setMenuOpen(true)}
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
				}}
				aria-label="Menu"
			>
				<img
					src={`${import.meta.env.BASE_URL}icons/crown.png`}
					alt="Menu"
					style={{
						width: 26,
						height: 26,
						objectFit: "contain",
					}}
				/>
			</button>

			{/* Counter grid */}
			{isSolo ? (
				<HealthCounter
					hero={heroes[0]}
					onSelect={() => setSelectingPlayerId(heroes[0].id)}
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
