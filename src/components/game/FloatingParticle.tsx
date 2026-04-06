import { useState, useEffect } from "react";
import styles from "./HealthCounter.module.css";

export function FloatingParticle({
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
		requestAnimationFrame(() => setStarted(true));
	}, []);

	const isPositive = value > 0;

	const rad = (rotation * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);
	const rotatedArcX = arcX * cos - arcY * sin;
	const rotatedArcY = arcX * sin + arcY * cos;

	const colorClass = isPositive ? styles.particlePositive : styles.particleNegative;
	const baseClass = `${styles.floatingParticle} ${colorClass}${started ? ` ${styles.particleStarted}` : ""}`;

	return (
		<span
			className={baseClass}
			style={{
				"--rotation": `${rotation}deg`,
				"--arc-x": `${rotatedArcX}px`,
				"--arc-y": `${rotatedArcY}px`,
			} as React.CSSProperties}
		>
			{isPositive ? "+1" : "-1"}
		</span>
	);
}
