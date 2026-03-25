import { useState, useEffect } from "react";
import { HERO_TEMPLATES } from "../../data/heroes";
import { useHeroStore } from "../../store/useHeroStore";

interface HeroSelectModalProps {
	playerId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

const KEYFRAMES = `
	@keyframes heroSelectBackdropIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes heroSelectBackdropOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}
	@keyframes heroSelectGridIn {
		from { opacity: 0; transform: scale(0.92); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes heroSelectGridOut {
		from { opacity: 1; transform: scale(1); }
		to { opacity: 0; transform: scale(0.88) translateY(10px); }
	}
	@keyframes heroCardIn {
		from { transform: scale(0.85); }
		to { transform: scale(1); }
	}
`;

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
			style={{
				position: "absolute",
				inset: 0,
				zIndex: 15,
				backgroundColor: "rgba(0,0,0,0.85)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
				animation: exiting
					? "heroSelectBackdropOut 0.18s ease-in forwards"
					: "heroSelectBackdropIn 0.15s ease-out",
			}}
			onClick={handleClose}
		>
			<style>{KEYFRAMES}</style>

			{/* Close button */}
			<button
				onClick={handleClose}
				style={{
					position: "absolute",
					top: 12,
					right: 12,
					width: 36,
					height: 36,
					backgroundColor: "transparent",
					color: "#aaa",
					border: "none",
					cursor: "pointer",
					fontSize: 24,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 16,
				}}
				aria-label="Close"
			>
				&times;
			</button>

			{/* Portrait grid */}
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: 10,
					maxWidth: 340,
					width: "100%",
					animation: exiting
						? "heroSelectGridOut 0.18s ease-in forwards"
						: "heroSelectGridIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
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
							style={{
								aspectRatio: "1",
								padding: 0,
								backgroundColor: template.color,
								border: "none",
								borderRadius: 12,
								cursor: taken ? "default" : "pointer",
								overflow: "hidden",
								opacity: taken ? 0.3 : 1,
								position: "relative",
								animation: exiting
									? undefined
									: `heroCardIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.02}s both`,
								transition: "transform 0.1s",
							}}
						>
							<div
								style={{
									width: "100%",
									height: "100%",
									backgroundImage: `url(${template.image})`,
									backgroundSize: "400%",
									backgroundPosition: template.selectFocus,
									backgroundRepeat: "no-repeat",
								}}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
