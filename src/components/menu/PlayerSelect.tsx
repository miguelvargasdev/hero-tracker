import { useHeroStore } from "../../store/useHeroStore";
import styles from "./PlayerSelect.module.css";

const PLAYER_COUNTS = [2, 3, 4, 5];

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
					className={styles.pip}
					style={{ '--pip-delay': `${baseDelay + i * 0.03}s` } as React.CSSProperties}
				/>
			))}
		</svg>
	);
}

export function PlayerSelect() {
	const startGame = useHeroStore((s) => s.startGame);
	const navigateTo = useHeroStore((s) => s.navigateTo);

	return (
		<div className={styles.container}>
			<button
				onClick={() => navigateTo("main-menu")}
				className={styles.backButton}
			>
				&larr; Back
			</button>

			<div className={styles.content}>
				<h2 className={styles.heading}>
					Number of
					<br />
					Players
				</h2>

				<div className={styles.grid}>
					{PLAYER_COUNTS.map((count, i) => (
						<button
							key={count}
							onClick={() => startGame("standard", count)}
							className={styles.diceButton}
							style={{ '--delay': `${0.08 + i * 0.05}s` } as React.CSSProperties}
						>
							<DiceFace count={count} index={i} />
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
