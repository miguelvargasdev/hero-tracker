import { useHeroStore } from "../../store/useHeroStore";
import { useViewTransition } from "../../hooks/useViewTransition";
import { DiceFace } from "./DiceFace";
import styles from "./PlayerSelect.module.css";

const PLAYER_COUNTS = [2, 3, 4, 5];

export function PlayerSelect() {
	const startGame = useHeroStore((s) => s.startGame);
	const navigateTo = useHeroStore((s) => s.navigateTo);
	const { transitionTo } = useViewTransition();

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
							onClick={() => transitionTo(() => startGame("standard", count))}
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
