import { useState, useRef, useEffect } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { HERO_TEMPLATES } from "../../data/heroes";
import type { Hero } from "../../types/hero";

interface FloatingNumber {
	id: number;
	value: number; // +1 or -1
	// Random arc parameters for variety
	arcX: number; // horizontal drift (px)
	arcY: number; // vertical rise (px)
}

let nextId = 0;

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

	const [floaters, setFloaters] = useState<FloatingNumber[]>([]);
	const cleanupTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

	// Clean up timers on unmount
	useEffect(() => {
		return () => {
			cleanupTimers.current.forEach((t) => clearTimeout(t));
		};
	}, []);

	const spawnFloater = (isIncrement: boolean) => {
		const value = isIncrement ? 1 : -1;
		const direction = isIncrement ? 1 : -1;
		// Always arc up for +, down for -
		const arcX = (Math.random() - 0.5) * 30;
		const arcY = direction * -(50 + Math.random() * 40);
		const id = nextId++;

		const floater: FloatingNumber = { id, value, arcX, arcY };
		setFloaters((prev) => [...prev, floater]);

		// Remove after animation completes
		const timer = setTimeout(() => {
			setFloaters((prev) => prev.filter((f) => f.id !== id));
			cleanupTimers.current.delete(timer);
		}, 800);
		cleanupTimers.current.add(timer);
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isUnselected) {
			onSelect();
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		let isIncrement: boolean;
		const norm = ((rotation % 360) + 360) % 360;
		if (norm === 90) {
			isIncrement = clickX > rect.width / 2;
		} else if (norm === 270) {
			isIncrement = clickX < rect.width / 2;
		} else if (norm === 180) {
			isIncrement = clickY > rect.height / 2;
		} else {
			isIncrement = clickY < rect.height / 2;
		}

		const change = isIncrement ? 1 : -1;

		updateStat(hero.id, "hp", "current", hero.hp.current + change);

		spawnFloater(isIncrement);
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
						backgroundSize: "200%",
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

					{/* Floating +1/-1 particles */}
					{floaters.map((f) => (
						<FloatingParticle
							key={f.id}
							value={f.value}
							arcX={f.arcX}
							arcY={f.arcY}
							rotation={rotation}
						/>
					))}
				</>
			)}
		</div>
	);
}

function FloatingParticle({
	value,
	arcX,
	arcY,
	rotation,
}: {
	value: number;
	arcX: number;
	arcY: number;
	rotation: number;
}) {
	const [started, setStarted] = useState(false);

	useEffect(() => {
		// Trigger animation on next frame so the transition kicks in
		requestAnimationFrame(() => setStarted(true));
	}, []);

	const isPositive = value > 0;

	// Rotate the arc vector to match the card's rotation
	const rad = (rotation * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const rotatedArcX = arcX * cos - arcY * sin;
	const rotatedArcY = arcX * sin + arcY * cos;

	return (
		<span
			style={{
				position: "absolute",
				zIndex: 3,
				top: "50%",
				left: "50%",
				fontFamily: "'Cinzel', serif",
				fontSize: "clamp(16px, 4vw, 28px)",
				fontWeight: 700,
				color: isPositive ? "#4ade80" : "#f87171",
				lineHeight: 1,
				textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.7)",
				pointerEvents: "none",
				transition: started
					? "transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.75s ease-out"
					: "none",
				transform: started
					? `translate(calc(-50% + ${rotatedArcX}px), calc(-50% + ${rotatedArcY}px)) rotate(${rotation}deg)`
					: `translate(-50%, -50%) rotate(${rotation}deg)`,
				opacity: started ? 0 : 1,
			}}
		>
			{isPositive ? "+1" : "-1"}
		</span>
	);
}
