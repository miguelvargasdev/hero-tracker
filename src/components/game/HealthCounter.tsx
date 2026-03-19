import { useState, useRef, useCallback, useEffect } from "react";
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

	// Tap counter state
	const [delta, setDelta] = useState(0);
	const [showing, setShowing] = useState(false);
	const [fading, setFading] = useState(false);
	const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fadeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const resetFadeTimer = useCallback(() => {
		if (fadeTimer.current) clearTimeout(fadeTimer.current);
		if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current);
		setFading(false);
		// Fade in on first appearance
		requestAnimationFrame(() => setShowing(true));
		fadeTimer.current = setTimeout(() => {
			setFading(true);
			// After fade-out animation completes, reset everything
			fadeOutTimer.current = setTimeout(() => {
				setDelta(0);
				setShowing(false);
				setFading(false);
			}, 500);
		}, 1200);
	}, []);

	// Clean up timers on unmount
	useEffect(() => {
		return () => {
			if (fadeTimer.current) clearTimeout(fadeTimer.current);
			if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current);
		};
	}, []);

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

		const change = isIncrement ? 1 : -1;

		updateStat(
			hero.id,
			"hp",
			"current",
			hero.hp.current + change,
		);

		setDelta((prev) => prev + change);
		resetFadeTimer();
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
				<div
					style={{
						position: "absolute",
						...(rotation === 90 || rotation === 270
							? {
									// When rotated sideways, enlarge the div so the
									// image fully covers the card after rotation
									top: "50%",
									left: "50%",
									width: "200%",
									height: "200%",
									transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
								}
							: {
									inset: 0,
									transform: rotation ? `rotate(${rotation}deg)` : undefined,
								}),
						backgroundImage: `url(${template.image})`,
						backgroundSize: "150%",
						backgroundPosition: template.focus,
						backgroundRepeat: "no-repeat",
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
				<>
					<span
						style={{
							position: "relative",
							zIndex: 1,
							fontFamily: "'Cinzel', serif",
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

					{/* Delta indicator */}
					{delta !== 0 && (
						<span
							style={{
								position: "absolute",
								zIndex: 2,
								top: "12%",
								...(delta > 0 ? { right: "8%" } : { left: "8%" }),
								fontFamily: "'Cinzel', serif",
								fontSize: "clamp(18px, 5vw, 36px)",
								fontWeight: 700,
								color: delta > 0 ? "#4ade80" : "#f87171",
								lineHeight: 1,
								textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.7)",
								pointerEvents: "none",
								transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
								opacity: showing && !fading ? 1 : 0,
								transform: (() => {
									const rot = rotation ? `rotate(${rotation}deg) ` : "";
									if (!showing || fading) return `${rot}translateY(-10px)`;
									return rot ? `rotate(${rotation}deg)` : undefined;
								})(),
							}}
						>
							{delta > 0 ? `+${delta}` : delta}
						</span>
					)}
				</>
			)}
		</div>
	);
}
