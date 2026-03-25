import { useHeroStore } from "../../store/useHeroStore";

const PLAYER_COUNTS = [2, 3, 4, 5];

const KEYFRAMES = `
	@keyframes psHeaderIn {
		from { opacity: 0; transform: translateY(-16px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes psDiceIn {
		from { opacity: 0; transform: scale(0.8) rotate(-8deg); }
		to { opacity: 1; transform: scale(1) rotate(0deg); }
	}
	@keyframes psBackIn {
		from { opacity: 0; transform: translateX(-10px); }
		to { opacity: 1; transform: translateX(0); }
	}
	@keyframes psPipPop {
		0% { r: 0; opacity: 0; }
		60% { r: 12; opacity: 1; }
		100% { r: 10; opacity: 1; }
	}
`;

/** Renders a dice face SVG with the given number of pips */
function DiceFace({ count, index }: { count: number; index: number }) {
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

	// Base delay for this dice card + per-pip stagger
	const baseDelay = 0.12 + index * 0.05;

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
				<circle
					key={i}
					cx={cx}
					cy={cy}
					r="10"
					fill="#eee"
					style={{
						animation: `psPipPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + i * 0.03}s both`,
					}}
				/>
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
			<style>{KEYFRAMES}</style>

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
					animation: "psBackIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
					transition: "transform 0.15s",
				}}
				onMouseDown={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(-3px)";
				}}
				onMouseUp={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
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
						textAlign: "center",
						lineHeight: 1.2,
						animation: "psHeaderIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.03s both",
					}}
				>
					Number of
					<br />
					Players
				</h2>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(2, 1fr)",
						gap: 16,
						width: "clamp(240px, 65vw, 300px)",
					}}
				>
					{PLAYER_COUNTS.map((count, i) => (
						<button
							key={count}
							onClick={() => startGame("standard", count)}
							style={{
								padding: 8,
								backgroundColor: "transparent",
								border: "none",
								borderRadius: 12,
								cursor: "pointer",
								animation: `psDiceIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${0.08 + i * 0.05}s both`,
								transition: "transform 0.15s",
							}}
							onMouseDown={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)";
							}}
							onMouseUp={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
							}}
						>
							<DiceFace count={count} index={i} />
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
