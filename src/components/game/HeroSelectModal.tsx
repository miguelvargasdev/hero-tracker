import { useState, useEffect } from "react";
import { HERO_TEMPLATES } from "../../data/heroes";
import { useHeroStore } from "../../store/useHeroStore";
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
	const [visible, setVisible] = useState(false);
	const [exiting, setExiting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setVisible(true);
			setExiting(false);
		} else if (visible && !exiting) {
			// Parent closed without animation (edge case)
			setVisible(false);
		}
	}, [isOpen]);

	const handleClose = () => {
		if (exiting) return;
		setExiting(true);
		setTimeout(() => {
			setVisible(false);
			setExiting(false);
			onClose();
		}, 180);
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
							style={
								{
									backgroundColor: template.color,
									"--delay": `${i * 0.02}s`,
								} as React.CSSProperties
							}
						>
							<div
								className={styles.heroCardInner}
								style={{
									backgroundImage: `url(${template.wideImage})`,
									backgroundPosition: template.selectFocus,
								}}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
