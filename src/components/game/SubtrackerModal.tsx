import { normRot, type StatKey } from "./healthCounterUtils";
import { STAT_CONFIGS } from "./statConfigs";
import styles from "./HealthCounter.module.css";

export function SubtrackerModal({
	rotation,
	heroColor,
	activeKeys,
	onAdd,
	onRemove,
	onClose,
}: {
	rotation: number;
	heroColor: string;
	activeKeys: StatKey[];
	onAdd: (key: StatKey) => void;
	onRemove: (key: StatKey) => void;
	onClose: () => void;
}) {
	const is90or270 = rotation === 90 || rotation === 270;
	const norm = normRot(rotation);

	const backdropClass = `${styles.modalBackdrop}${!is90or270 && norm === 180 ? ` ${styles.modalRot180}` : ""}`;
	const cardClass = `${styles.modalCard} ${is90or270 ? styles.modalCardRotated : styles.modalCardDefault}`;

	return (
		<div
			className={backdropClass}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			<div
				className={cardClass}
				onClick={(e) => e.stopPropagation()}
				style={{
					"--hero-color": heroColor,
					"--rotation": is90or270 ? `${rotation}deg` : undefined,
				} as React.CSSProperties}
			>
				<h3 className={styles.modalHeading}>
					Add Subtracker
				</h3>
				{STAT_CONFIGS.filter((c) => c.key !== "hp").map((config) => {
					const isActive = activeKeys.includes(config.key);
					return (
						<button
							key={config.key}
							className={`${styles.statBtn}${isActive ? ` ${styles.statBtnActive}` : ""}`}
							onClick={() =>
								isActive ? onRemove(config.key) : onAdd(config.key)
							}
							style={{ "--hero-color": heroColor } as React.CSSProperties}
						>
							<div className={styles.statIconWrap}>
								{config.icon}
							</div>
							<span className={styles.statBtnLabel}>{config.label}</span>
							{isActive && (
								<span className={styles.statBtnCheck}>
									✓
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
