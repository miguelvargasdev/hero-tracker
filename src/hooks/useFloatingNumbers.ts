import { useState, useRef, useEffect, useCallback } from "react";

export interface FloatingNumber {
	id: number;
	value: number;
	arcX: number;
	arcY: number;
}

let nextId = 0;

/**
 * Spawns temporary +1/-1 floating particles that auto-remove after 800ms.
 */
export function useFloatingNumbers(spread = 30, minDist = 50, rangeDist = 40) {
	const [floaters, setFloaters] = useState<FloatingNumber[]>([]);
	const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

	useEffect(() => {
		return () => timers.current.forEach((t) => clearTimeout(t));
	}, []);

	const spawn = useCallback(
		(isIncrement: boolean) => {
			const direction = isIncrement ? 1 : -1;
			const arcX = (Math.random() - 0.5) * spread;
			const arcY = direction * -(minDist + Math.random() * rangeDist);
			const id = nextId++;
			const floater: FloatingNumber = { id, value: isIncrement ? 1 : -1, arcX, arcY };

			setFloaters((prev) => [...prev, floater]);

			const timer = setTimeout(() => {
				setFloaters((prev) => prev.filter((f) => f.id !== id));
				timers.current.delete(timer);
			}, 800);
			timers.current.add(timer);
		},
		[spread, minDist, rangeDist],
	);

	return { floaters, spawn };
}
