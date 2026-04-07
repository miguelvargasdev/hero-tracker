import { useState, useRef, useEffect, useCallback } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import type { FloatingNumber } from "../../hooks/useFloatingNumbers";
import type { Hero } from "../../types/hero";
import { normRot, isClickIncr, flashProps, getNextId, type StatKey, type StatConfig } from "./healthCounterUtils";
import { STAT_CONFIGS } from "./statConfigs";
import { FloatingParticle } from "./FloatingParticle";
import styles from "./HealthCounter.module.css";

const DRAG_THRESHOLD = 5;

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

	// Mouse drag-to-scroll state
	const dragState = useRef<{
		active: boolean;
		startX: number;
		startY: number;
		scrollLeft: number;
		scrollTop: number;
		didDrag: boolean;
	} | null>(null);

	useEffect(() => {
		return () => {
			cleanupTimers.current.forEach((t) => clearTimeout(t));
		};
	}, []);

	// Reset scroll whenever the set of active subtrackers changes
	// (e.g. after the user closes the Add Subtracker modal).
	const is180Reset = normRot(rotation) === 180;
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTo({ left: 0, top: 0, behavior: "auto" });
			if (is180Reset) {
				// row-reverse: scrollLeft=0 shows HP (DOM-first). Dot index
				// starts at the top so it counts down as they swipe.
				const totalStats = 1 + activeKeys.filter((k) => k !== "hp").length;
				const totalPagesLocal = Math.max(1, totalStats - 1);
				setActivePage(totalPagesLocal - 1);
			} else {
				setActivePage(0);
			}
		});
	}, [activeKeys, is180Reset]);

	const is90or270 = rotation === 90 || rotation === 270;

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		const el = scrollRef.current;
		if (!el) return;
		dragState.current = {
			active: true,
			startX: e.clientX,
			startY: e.clientY,
			scrollLeft: el.scrollLeft,
			scrollTop: el.scrollTop,
			didDrag: false,
		};
	}, []);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const ds = dragState.current;
			const el = scrollRef.current;
			if (!ds?.active || !el) return;
			const dx = e.clientX - ds.startX;
			const dy = e.clientY - ds.startY;
			if (!ds.didDrag && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
			if (!ds.didDrag) {
				// Disable snap and smooth-scroll while dragging so scrollLeft
				// changes aren't overridden or animated per-pixel.
				el.style.scrollSnapType = "none";
				el.style.scrollBehavior = "auto";
				ds.didDrag = true;
			}
			el.scrollLeft = ds.scrollLeft - dx;
			el.scrollTop = ds.scrollTop - dy;
		};

		const handleMouseUp = () => {
			const ds = dragState.current;
			const el = scrollRef.current;
			if (ds && el && ds.didDrag) {
				// Re-enable snap + smooth-scroll so it settles to nearest stat
				el.style.scrollSnapType = "";
				el.style.scrollBehavior = "";
			}
			if (ds) ds.active = false;
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
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
		if (dragState.current?.didDrag) return;
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
		const is90or270Local = rotation === 90 || rotation === 270;
		const is180Local = normRot(rotation) === 180;
		const pageSize = is90or270Local ? el.clientHeight : el.clientWidth;
		const scrollPos = is90or270Local ? el.scrollTop : el.scrollLeft;
		// Each stat takes 50% of the viewport, so a "page" is half the visible size
		const halfPage = pageSize / 2;
		// row-reverse in Chrome can use negative scrollLeft; take the absolute distance.
		const absPage = halfPage > 0 ? Math.round(Math.abs(scrollPos) / halfPage) : 0;
		if (is180Local) {
			// For 180° we want the active dot to start at the highest index
			// (player's right side, "3") and count down as they swipe.
			const totalStats = 1 + activeKeys.filter((k) => k !== "hp").length;
			const totalPagesLocal = Math.max(1, totalStats - 1);
			setActivePage(Math.max(0, totalPagesLocal - 1 - absPage));
		} else {
			setActivePage(absPage);
		}
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

	// Reverse stat order for 270° so HP ends up on the player's left.
	// 180° uses row-reverse at the flex level instead, to keep HP at the
	// DOM start (so scrollLeft=0 on row-reverse starts HP visible).
	const norm = normRot(rotation);
	let stats = statsBase;
	if (norm === 270) {
		stats = [...statsBase].reverse();
	}

	const rotDeg = `${rotation}deg`;
	// Font/icon size based on visible count (max 2), not total
	const visibleCount = Math.min(stats.length, 2);
	const statFontSize = is90or270
		? `clamp(32px, ${30 / visibleCount}cqmax, 90px)`
		: `clamp(28px, ${35 / visibleCount}cqi, 72px)`;
	const statIconSize = is90or270
		? `clamp(20px, ${10 / visibleCount}cqmax, 46px)`
		: `clamp(18px, ${14 / visibleCount}cqi, 38px)`;

	// 180° gets its own root (no parent rotate transform) so native scroll
	// direction matches the player's expectation. Cell content is rotated
	// individually instead.
	const is180 = norm === 180;
	const rootClass = `${styles.subtrackerRoot} ${is90or270 || is180 ? styles.subtrackerRootRotated : styles.subtrackerRootDefault}`;
	const flexClass = `${styles.subtrackerFlex} ${
		is90or270
			? styles.subtrackerFlexRotated
			: is180
				? `${styles.subtrackerFlexDefault} ${styles.subtrackerFlex180}`
				: styles.subtrackerFlexDefault
	}`;
	const cellVariant = is90or270 ? styles.statCellHoriz : styles.statCellVert;

	const showDots = stats.length > 2;
	// Number of pages = stats.length - 1 (since 2 stats are visible at a time)
	const totalPages = Math.max(1, stats.length - 1);
	const dotContainerClass = is90or270
		? `${styles.scrollDots} ${styles.scrollDotsRotated} ${norm === 90 ? styles.scrollDotsRot90 : styles.scrollDotsRot270}`
		: `${styles.scrollDots} ${styles.scrollDotsDefault}${is180 ? ` ${styles.scrollDotsRot180}` : ""}`;

	return (
		<div className={rootClass}>
			<div
				ref={scrollRef}
				className={flexClass}
				onScroll={handleScroll}
				onMouseDown={handleMouseDown}
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
									"--rotation": is90or270 || is180 ? rotDeg : "0deg",
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
										rotation={is90or270 || is180 ? rotation : 0}
									/>
								))}
						</div>
					);
				})}
			</div>
			{showDots && (
				<div className={dotContainerClass}>
					{Array.from({ length: totalPages }).map((_, i) => (
						<div
							key={i}
							className={`${styles.scrollDot} ${i === Math.min(activePage, totalPages - 1) ? styles.scrollDotActive : ""}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
