import { HealthCounter } from "./HealthCounter";
import type { Hero } from "../../types/hero";
import styles from "./GameView.module.css";

export function TyrantLayout({
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
				"--team-rows": `repeat(${team.length}, 1fr)`,
				"--boss-span": `${team.length + 1}`,
			} as React.CSSProperties}
		>
			{/* Boss: right column, spans all rows */}
			<div className={styles.tyrantBoss}>
				<HealthCounter
					hero={boss}
					rotation={270}
					onSelect={() => onSelect(boss.id)}
				/>
			</div>
			{/* Team: stacked vertically in left column, rotated 90° */}
			{team.map((hero) => (
				<div
					key={hero.id}
					className={styles.tyrantTeam}
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
