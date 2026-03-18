import { HERO_TEMPLATES } from "../../data/heroes";
import { useHeroStore } from "../../store/useHeroStore";

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

	if (!isOpen || !playerId) return null;

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
			}}
			onClick={onClose}
		>
			{/* Close button */}
			<button
				onClick={onClose}
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
				}}
			>
				{HERO_TEMPLATES.map((template) => {
					const taken = takenTemplateIds.has(template.id);
					return (
						<button
							key={template.id}
							disabled={taken}
							onClick={() => {
								selectHero(playerId, template.id);
								onClose();
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
