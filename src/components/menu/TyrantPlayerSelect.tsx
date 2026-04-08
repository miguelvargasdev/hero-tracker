import { useHeroStore } from "../../store/useHeroStore";
import { useViewTransition } from "../../hooks/useViewTransition";
import styles from "./TyrantPlayerSelect.module.css";

const PARTY_SIZES = [
	{ total: 3, label: "1 vs 2", team: 2 },
	{ total: 4, label: "1 vs 3", team: 3 },
	{ total: 5, label: "1 vs 4", team: 4 },
];

export function TyrantPlayerSelect() {
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
					Tyrant Mode
				</h2>
				<p className={styles.subtitle}>
					1 Boss vs Team
				</p>

				<div className={styles.cardGroup}>
					{PARTY_SIZES.map((size, i) => (
						<button
							key={size.total}
							onClick={() => transitionTo(() => startGame("tyrant", size.total))}
							className={styles.card}
							style={{ '--delay': `${0.08 + i * 0.05}s` } as React.CSSProperties}
						>
							<span className={styles.cardLabel}>
								{size.label}
							</span>
							<span className={styles.cardMeta}>
								{size.total} players
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
