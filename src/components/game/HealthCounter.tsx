import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import type { Hero } from "../../types/hero";

interface HealthCounterProps {
	hero: Hero;
	rotation?: number;
	onSelect: () => void;
}

export function HealthCounter({
	hero,
	rotation = 0,
	onSelect,
}: HealthCounterProps) {
	const updateStat = useHeroStore((s) => s.updateStat);

	const isUnselected = hero.templateId === null;
	const template = isUnselected
		? null
		: HERO_TEMPLATES.find((t) => t.id === hero.templateId);

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isUnselected) {
			onSelect();
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		let isIncrement: boolean;
		const norm = rotation % 360;
		if (norm === 90 || norm === -270) {
			isIncrement = clickY > rect.height / 2;
		} else if (norm === 270 || norm === -90) {
			isIncrement = clickY < rect.height / 2;
		} else if (norm === 180 || norm === -180) {
			isIncrement = clickX < rect.width / 2;
		} else {
			isIncrement = clickX > rect.width / 2;
		}

		updateStat(
			hero.id,
			"hp",
			"current",
			hero.hp.current + (isIncrement ? 1 : -1),
		);
	};

	return (
		<div
			onClick={handleClick}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				cursor: "pointer",
				userSelect: "none",
				backgroundColor: "#2a2a2e",
				borderRadius: 12,
				border: isUnselected ? "2px solid #555" : "none",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Hero artwork background */}
			{template && (
				<img
					src={template.image}
					alt=""
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
						objectPosition: template.focus,
						transform: `scale(2)${rotation ? ` rotate(${rotation}deg)` : ""}`,
					}}
				/>
			)}

			{/* Content */}
			{isUnselected ? (
				<svg
					width="40%"
					height="40%"
					viewBox="0 0 40 40"
					style={{ opacity: 0.4 }}
				>
					<rect x="16" y="4" width="8" height="32" rx="2" fill="#888" />
					<rect x="4" y="16" width="32" height="8" rx="2" fill="#888" />
				</svg>
			) : (
				<span
					style={{
						position: "relative",
						zIndex: 1,
						fontSize: "clamp(48px, 15vw, 120px)",
						fontWeight: 900,
						color: "#fff",
						lineHeight: 1,
						transform: rotation ? `rotate(${rotation}deg)` : undefined,
						textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6)",
						letterSpacing: "-0.02em",
					}}
				>
					{hero.hp.current}
				</span>
			)}
		</div>
	);
}
