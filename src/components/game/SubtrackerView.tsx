import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import type { FloatingNumber } from "../../hooks/useFloatingNumbers";
import type { Hero } from "../../types/hero";
import { useHoldRepeat } from "../../hooks/useHoldRepeat";
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
	// Number of cells the CSS container queries are letting fit at once.
	// Measured from the DOM so font sizing and dot math stay in sync with
	// whatever flex-basis the container query picked.
	const [visibleCount, setVisibleCount] = useState(2);

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
	// (e.g. after the user closes the Add Subtracker modal). For 180°,
	// stats are reversed so HP sits at the DOM end; scroll to max so
	// HP + adjacent subtracker are visible and the dot indicator starts
	// at dot[0] (= the player's "3" position).
	const is180Reset = normRot(rotation) === 180;
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			if (is180Reset) {
				el.scrollLeft = el.scrollWidth; // clamps to max
				el.scrollTop = 0;
			} else {
				el.scrollTo({ left: 0, top: 0, behavior: "auto" });
			}
			setActivePage(0);
		});
	}, [activeKeys, is180Reset]);

	const is90or270 = rotation === 90 || rotation === 270;

	// HP is always first, then user-added subtrackers
	const allKeys: StatKey[] = ["hp", ...activeKeys.filter((k) => k !== "hp")];
	const totalCells = allKeys.length;

	// Re-measure visible cell count whenever the container resizes or the
	// number of stats changes. We compute cellSize from scrollWidth/N rather
	// than reading CSS directly, which keeps the math agnostic to whatever
	// breakpoint the container query landed on.
	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (!el || totalCells === 0) return;
		const measure = () => {
			const isVert = rotation === 90 || rotation === 270;
			const total = isVert ? el.scrollHeight : el.scrollWidth;
			const visible = isVert ? el.clientHeight : el.clientWidth;
			if (total <= 0) return;
			const cellSize = total / totalCells;
			if (cellSize <= 0) return;
			const v = Math.max(1, Math.min(totalCells, Math.round(visible / cellSize)));
			setVisibleCount(v);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [rotation, totalCells]);

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

	const spawnFloater = useCallback((statKey: string, isIncrement: boolean) => {
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
	}, []);

	// Apply a single +1/-1 to a stat (used by both tap and hold-to-repeat).
	// Reads fresh state from the store so repeat fires accumulate correctly
	// instead of reusing a stale closure value.
	const applyStatChange = useCallback(
		({ statKey, isIncrement }: { statKey: StatKey; isIncrement: boolean }) => {
			const fresh = useHeroStore
				.getState()
				.heroes.find((h) => h.id === hero.id);
			if (!fresh) return;
			const current = fresh[statKey].current;
			const change = isIncrement ? 1 : -1;
			updateStat(hero.id, statKey, "current", current + change);
			spawnFloater(statKey, isIncrement);
			setFlashMap((prev) => ({
				...prev,
				[statKey]: isIncrement ? "top" : "bottom",
			}));
			const flashTimer = setTimeout(
				() => setFlashMap((prev) => ({ ...prev, [statKey]: null })),
				150,
			);
			cleanupTimers.current.add(flashTimer);
		},
		[hero.id, spawnFloater, updateStat],
	);

	const { start: startHold, cancel: cancelHold } = useHoldRepeat<{
		statKey: StatKey;
		isIncrement: boolean;
	}>(applyStatChange);

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
				// A real drag means the press is no longer a hold — cancel any
				// pending repeat so it doesn't fire mid-scroll.
				cancelHold();
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
	}, [cancelHold]);

	const handleStatPointerDown = (e: React.PointerEvent, statKey: StatKey) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const isIncrement = isClickIncr(
			rotation,
			e.clientX - rect.left,
			e.clientY - rect.top,
			rect.width,
			rect.height,
		);
		startHold({ statKey, isIncrement });
	};

	const handleStatClick = (
		e: React.MouseEvent,
		statKey: StatKey,
	) => {
		e.stopPropagation();
		if (dragState.current?.didDrag) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const isIncrement = isClickIncr(rotation, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
		applyStatChange({ statKey, isIncrement });
	};

	const handleScroll = () => {
		const el = scrollRef.current;
		if (!el || totalCells === 0) return;
		const is90or270Local = rotation === 90 || rotation === 270;
		const is180Local = normRot(rotation) === 180;
		const total = is90or270Local ? el.scrollHeight : el.scrollWidth;
		const scrollPos = is90or270Local ? el.scrollTop : el.scrollLeft;
		const cellSize = total / totalCells;
		const rawPage = cellSize > 0 ? Math.round(scrollPos / cellSize) : 0;
		if (is180Local) {
			// 180° stats are reversed in DOM so HP sits at DOM-end. We scroll
			// to max on mount. Map raw page inversely so dot[0] is lit when
			// HP is visible (player's "3"), and dot[N-1] when #lastAdded is
			// visible (player's "1").
			const totalPagesLocal = Math.max(1, totalCells - visibleCount + 1);
			setActivePage(Math.max(0, totalPagesLocal - 1 - rawPage));
		} else {
			setActivePage(rawPage);
		}
	};

	const statsBase = allKeys
		.map((key) => {
			const config = STAT_CONFIGS.find((c) => c.key === key);
			if (!config) return null;
			return { ...config, value: hero[config.key].current };
		})
		.filter(Boolean) as (StatConfig & { value: number })[];

	// Reverse stat order for 180° and 270° so HP ends up on the player's
	// left (reading-first position). Real array reverse (not flex
	// row-reverse) keeps scrollLeft semantics and :last-child border
	// behavior consistent with the default case.
	const norm = normRot(rotation);
	let stats = statsBase;
	if (norm === 180 || norm === 270) {
		stats = [...statsBase].reverse();
	}

	const rotDeg = `${rotation}deg`;
	// Font/icon size scales inversely with how many cells are visible at once.
	// 1 stat = oversize (solo-mode HP); 2+ stats use the measured visibleCount
	// so 4-up cards shrink the digits enough to fit comfortably.
	const sizeDivisor = stats.length <= 1 ? 1 : visibleCount;
	const statFontSize = is90or270
		? `clamp(28px, ${30 / sizeDivisor}cqmax, 90px)`
		: `clamp(24px, ${35 / sizeDivisor}cqi, 72px)`;
	const statIconSize = is90or270
		? `clamp(18px, ${10 / sizeDivisor}cqmax, 46px)`
		: `clamp(16px, ${14 / sizeDivisor}cqi, 38px)`;

	// 180° gets its own root (no parent rotate transform) so native scroll
	// direction matches the player's expectation. Cell content is rotated
	// individually instead.
	const is180 = norm === 180;
	const rootClass = `${styles.subtrackerRoot} ${is90or270 || is180 ? styles.subtrackerRootRotated : styles.subtrackerRootDefault}`;
	const flexClass = `${styles.subtrackerFlex} ${
		is90or270 ? styles.subtrackerFlexRotated : styles.subtrackerFlexDefault
	}`;
	const cellVariant = is90or270 ? styles.statCellHoriz : styles.statCellVert;

	// Show dots only when the active stats can't all fit at once.
	const showDots = stats.length > visibleCount;
	// One page per leftmost-cell position: N - V + 1 distinct snap stops.
	const totalPages = Math.max(1, stats.length - visibleCount + 1);
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
							onClick={(e) => handleStatClick(e, stat.key)}
							onPointerDown={(e) => handleStatPointerDown(e, stat.key)}
							onPointerUp={cancelHold}
							onPointerCancel={cancelHold}
							onPointerLeave={cancelHold}
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
