import { useEffect } from "react";
import { HERO_TEMPLATES } from "../../data/heroes";
import { useHeroStore } from "../../store/useHeroStore";
import { useModalAnimation } from "../../hooks/useModalAnimation";
import styles from "./HeroSelectModal.module.css";

interface HeroSelectModalProps {
	playerId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

export function HeroSelectModal({
	playerId,
	isOpen,
	onClose,
}: HeroSelectModalProps) {
	const heroes = useHeroStore((s) => s.heroes);
	const selectHero = useHeroStore((s) => s.selectHero);
	const { visible, exiting, open, close } = useModalAnimation();

	useEffect(() => {
		if (isOpen) {
			open();
		} else if (visible && !exiting) {
			close();
		}
	}, [isOpen]);

	const handleClose = () => {
		close(() => onClose());
	};

	if (!visible || !playerId) return null;

	const takenTemplateIds = new Set(
		heroes
			.filter((h) => h.id !== playerId)
			.map((h) => h.templateId)
			.filter(Boolean),
	);

	return (
		<div
			className={`${styles.backdrop} ${exiting ? styles.backdropOut : styles.backdropIn}`}
			onClick={handleClose}
		>
			{/* Close button */}
			<button
				onClick={handleClose}
				className={styles.closeBtn}
				aria-label="Close"
			>
				&times;
			</button>

			{/* Portrait grid */}
			<div
				onClick={(e) => e.stopPropagation()}
				className={`${styles.grid} ${exiting ? styles.gridOut : styles.gridIn}`}
			>
				{HERO_TEMPLATES.map((template, i) => {
					const taken = takenTemplateIds.has(template.id);
					return (
						<button
							key={template.id}
							disabled={taken}
							onClick={() => {
								selectHero(playerId, template.id);
								handleClose();
							}}
							className={`${styles.heroCard} ${taken ? styles.taken : ""} ${exiting ? "" : styles.heroCardAnimated}`}
							style={{
								"--hero-bg": template.color,
								"--delay": `${i * 0.02}s`,
							} as React.CSSProperties}
						>
							<div
								className={styles.heroCardInner}
								style={{
									"--hero-image": `url(${template.wideImage})`,
									"--hero-focus": template.selectFocus,
								} as React.CSSProperties}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
