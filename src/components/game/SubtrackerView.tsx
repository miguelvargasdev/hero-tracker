import { useState, useRef, useEffect } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import type { FloatingNumber } from "../../hooks/useFloatingNumbers";
import type { Hero } from "../../types/hero";
import { normRot, isClickIncr, flashProps, getNextId, type StatKey, type StatConfig } from "./healthCounterUtils";
import { STAT_CONFIGS } from "./statConfigs";
import { FloatingParticle } from "./FloatingParticle";
import styles from "./HealthCounter.module.css";

export function SubtrackerView({
	hero,
	rotation,
	activeKeys,
	onRemove: _onRemove,
}: {
	hero: Hero;
	rotation: number;
	activeKeys: StatKey[];
	onRemove: (key: StatKey) => void;
}) {
	const updateStat = useHeroStore((s) => s.updateStat);

	const [flashMap, setFlashMap] = useState<
		Record<string, "top" | "bottom" | null>
	>({});
	const [floaters, setFloaters] = useState<
		(FloatingNumber & { statKey: string })[]
	>([]);
	const cleanupTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

	// Scroll tracking for dot indicators
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activePage, setActivePage] = useState(0);

	useEffect(() => {
		return () => {
			cleanupTimers.current.forEach((t) => clearTimeout(t));
		};
	}, []);

	const spawnFloater = (statKey: string, isIncrement: boolean) => {
		const value = isIncrement ? 1 : -1;
		const direction = isIncrement ? 1 : -1;
		const arcX = (Math.random() - 0.5) * 20;
		const arcY = direction * -(30 + Math.random() * 25);
		const id = getNextId();

		setFloaters((prev) => [...prev, { id, value, arcX, arcY, statKey }]);

		const timer = setTimeout(() => {
			setFloaters((prev) => prev.filter((f) => f.id !== id));
			cleanupTimers.current.delete(timer);
		}, 800);
		cleanupTimers.current.add(timer);
	};

	const handleStatClick = (
		e: React.MouseEvent,
		statKey: StatKey,
		currentValue: number,
	) => {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		const isIncrement = isClickIncr(rotation, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
		const change = isIncrement ? 1 : -1;
		updateStat(hero.id, statKey, "current", currentValue + change);
		spawnFloater(statKey, isIncrement);

		// Tap flash
		setFlashMap((prev) => ({
			...prev,
			[statKey]: isIncrement ? "top" : "bottom",
		}));
		setTimeout(
			() => setFlashMap((prev) => ({ ...prev, [statKey]: null })),
			150,
		);
	};

	const handleScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const pageSize = is90or270 ? el.clientHeight : el.clientWidth;
		const scrollPos = is90or270 ? el.scrollTop : el.scrollLeft;
		const halfPage = pageSize / 2;
		setActivePage(Math.round(scrollPos / halfPage));
	};

	// HP is always first, then user-added subtrackers
	const allKeys: StatKey[] = ["hp", ...activeKeys.filter((k) => k !== "hp")];
	const statsBase = allKeys
		.map((key) => {
			const config = STAT_CONFIGS.find((c) => c.key === key);
			if (!config) return null;
			return { ...config, value: hero[config.key].current };
		})
		.filter(Boolean) as (StatConfig & { value: number })[];

	// Reorder stats for rotated cards so HP appears at the player's "top"
	const norm = normRot(rotation);
	let stats = statsBase;
	if (norm === 270) {
		stats = [...statsBase].reverse();
	}

	const is90or270 = rotation === 90 || rotation === 270;
	const rotDeg = `${rotation}deg`;
	const visibleCount = Math.min(stats.length, 2);
	const statFontSize = is90or270
		? `clamp(32px, ${30 / visibleCount}cqmax, 90px)`
		: `clamp(28px, ${35 / visibleCount}cqi, 72px)`;
	const statIconSize = is90or270
		? `clamp(20px, ${10 / visibleCount}cqmax, 46px)`
		: `clamp(18px, ${14 / visibleCount}cqi, 38px)`;

	const rootClass = `${styles.subtrackerRoot} ${is90or270 ? styles.subtrackerRootRotated : styles.subtrackerRootDefault}`;
	const flexClass = `${styles.subtrackerFlex} ${is90or270 ? styles.subtrackerFlexRotated : styles.subtrackerFlexDefault}`;
	const cellVariant = is90or270 ? styles.statCellHoriz : styles.statCellVert;

	const showDots = stats.length > 2;
	const dotContainerClass = is90or270
		? `${styles.scrollDots} ${styles.scrollDotsRotated} ${norm === 90 ? styles.scrollDotsRot90 : styles.scrollDotsRot270}`
		: `${styles.scrollDots} ${styles.scrollDotsDefault}`;

	return (
		<div
			className={rootClass}
			style={!is90or270 && rotation ? { "--rotation": rotDeg } as React.CSSProperties : undefined}
		>
			<div
				ref={scrollRef}
				className={flexClass}
				onScroll={handleScroll}
			>
				{stats.map((stat) => {
					return (
						<div
							key={stat.key}
							className={`${styles.statCell} ${cellVariant}`}
							onClick={(e) => handleStatClick(e, stat.key, stat.value)}
						>
							<div
								className={styles.statCellInner}
								style={{
									"--rotation": is90or270 ? rotDeg : "0deg",
									"--stat-font-size": statFontSize,
									"--stat-icon-size": statIconSize,
								} as React.CSSProperties}
							>
								<span className={styles.statValue}>
									{stat.value}
								</span>
								<div className={styles.subtrackerIconWrap}>
									{stat.icon}
								</div>
							</div>
							{/* Tap flash for this stat */}
							{flashMap[stat.key] &&
								(() => {
									const { className, bg } = flashProps(rotation, flashMap[stat.key] === "top");
									return (
										<div
											className={className}
											style={{ "--flash-bg": bg } as React.CSSProperties}
										/>
									);
								})()}
							{/* Floating +1/-1 particles for this stat */}
							{floaters
								.filter((f) => f.statKey === stat.key)
								.map((f) => (
									<FloatingParticle
										key={f.id}
										value={f.value}
										arcX={f.arcX}
										arcY={f.arcY}
										rotation={is90or270 ? rotation : 0}
									/>
								))}
						</div>
					);
				})}
			</div>
			{showDots && (
				<div className={dotContainerClass}>
					{stats.map((_, i) => (
						<div
							key={i}
							className={`${styles.scrollDot} ${i === activePage ? styles.scrollDotActive : ""}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
