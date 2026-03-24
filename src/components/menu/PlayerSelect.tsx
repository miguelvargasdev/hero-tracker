import { useHeroStore } from "../../store/useHeroStore";

const PLAYER_COUNTS = [2, 3, 4, 5];

/** Renders a dice face SVG with the given number of pips */
function DiceFace({ count }: { count: number }) {
	const pipPositions: [number, number][] = (() => {
		switch (count) {
			case 2:
				return [
					[25, 25],
					[75, 75],
				];
			case 3:
				return [
					[25, 25],
					[50, 50],
					[75, 75],
				];
			case 4:
				return [
					[25, 25],
					[75, 25],
					[25, 75],
					[75, 75],
				];
			case 5:
				return [
					[25, 25],
					[75, 25],
					[50, 50],
					[25, 75],
					[75, 75],
				];
			case 6:
				return [
					[25, 20],
					[25, 50],
					[25, 80],
					[75, 20],
					[75, 50],
					[75, 80],
				];
			default:
				return [];
		}
	})();

	return (
		<svg viewBox="0 0 100 100" width="100%" height="100%">
			<rect
				x="2"
				y="2"
				width="96"
				height="96"
				rx="14"
				fill="#2a2a2e"
				stroke="#444"
				strokeWidth="2"
			/>
			{pipPositions.map(([cx, cy], i) => (
				<circle key={i} cx={cx} cy={cy} r="10" fill="#eee" />
			))}
		</svg>
	);
}

export function PlayerSelect() {
	const startGame = useHeroStore((s) => s.startGame);
	const navigateTo = useHeroStore((s) => s.navigateTo);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				padding: 32,
				position: "relative",
				backgroundColor: "#111",
			}}
		>
			<button
				onClick={() => navigateTo("main-menu")}
				style={{
					position: "absolute",
					top: 32,
					left: 32,
					background: "none",
					border: "none",
					color: "#eee",
					cursor: "pointer",
					fontSize: 14,
					fontWeight: "bold",
					padding: 0,
				}}
			>
				&larr; Back
			</button>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
				}}
			>
				<h2
					style={{
						fontFamily: "'Cinzel', serif",
						marginBottom: 32,
						fontSize: 28,
						color: "#eee",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.04em",
						textAlign: "center",
						lineHeight: 1.2,
					}}
				>
					Number of
					<br />
					Players
				</h2>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 16,
						maxWidth: 260,
						width: "100%",
					}}
				>
					{PLAYER_COUNTS.map((count) => (
						<button
							key={count}
							onClick={() => startGame("standard", count)}
							style={{
								aspectRatio: "1",
								padding: 8,
								backgroundColor: "transparent",
								border: "none",
								borderRadius: 12,
								cursor: "pointer",
							}}
						>
							<DiceFace count={count} />
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
