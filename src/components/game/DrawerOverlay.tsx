import { normRot } from "./healthCounterUtils";
import styles from "./HealthCounter.module.css";

const DRAWER_ROT_CLASS: Record<number, string> = {
	90: styles.drawerRot90,
	180: styles.drawerRot180,
	270: styles.drawerRot270,
};

const SLIDE_TRANSFORMS: Record<number, [string, string]> = {
	0: ["translateY(100%)", "translateY(0)"],
	90: ["translateX(-100%)", "translateX(0)"],
	180: ["translateY(100%)", "translateY(0)"],
	270: ["translateX(100%)", "translateX(0)"],
};

export function DrawerOverlay({
	heroColor,
	rotation,
	onChangeHero,
	onToggleSubtrackers,
	onClose,
	animState,
}: {
	heroColor: string;
	rotation: number;
	onChangeHero: () => void;
	onToggleSubtrackers: () => void;
	onClose: () => void;
	animState: "opening" | "open" | "closing";
}) {
	const is90or270 = rotation === 90 || rotation === 270;
	const isVisible = animState === "open";
	const norm = normRot(rotation);
	const [slideHidden, slideVisible] = SLIDE_TRANSFORMS[norm] ?? SLIDE_TRANSFORMS[0];
	const rotClass = DRAWER_ROT_CLASS[norm] ?? "";

	return (
		<div
			className={`${styles.drawerOverlay} ${rotClass}`}
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			{/* Dim area */}
			<div
				className={`${styles.drawerDim}${isVisible ? ` ${styles.drawerDimVisible}` : ""}`}
			/>

			{/* Drawer content */}
			<div
				className={`${styles.drawerContent}${is90or270 ? ` ${styles.drawerContentHoriz}` : ` ${styles.drawerContentDefault}`}`}
				onClick={(e) => e.stopPropagation()}
				style={{
					"--hero-color": heroColor,
					"--slide-transform": isVisible ? slideVisible : slideHidden,
				} as React.CSSProperties}
			>
				{(() => {
					const is270 = rotation === 270;
					const btnClass = is90or270
						? `${styles.drawerBtn} ${styles.drawerBtnCompact}`
						: styles.drawerBtn;
					const iconClass = is90or270
						? styles.drawerBtnIconCompact
						: styles.drawerBtnIcon;
					const cssVars = is90or270
						? ({ "--rotation": `${rotation}deg` } as React.CSSProperties)
						: undefined;

					const changeHeroBtn = (
						<button
							key="change-hero"
							className={btnClass}
							onClick={onChangeHero}
							style={cssVars}
						>
							<svg
								className={iconClass}
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M21 2v6h-6" />
								<path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
								<path d="M3 22v-6h6" />
								<path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
							</svg>
							{!is90or270 && (
								<span className={styles.drawerBtnLabel}>
									Change Hero
								</span>
							)}
						</button>
					);
					const subtrackersBtn = (
						<button
							key="subtrackers"
							className={btnClass}
							onClick={onToggleSubtrackers}
							style={cssVars}
						>
							<svg
								className={iconClass}
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<ellipse cx="12" cy="6" rx="8" ry="3" />
								<path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
								<path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
								<path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
							</svg>
							{!is90or270 && (
								<span className={styles.drawerBtnLabel}>
									Subtrackers
								</span>
							)}
						</button>
					);
					const divider = (
						<div
							key="divider"
							className={`${styles.dividerBase}${is90or270 ? ` ${styles.dividerHoriz}` : ` ${styles.dividerVert}`}`}
						/>
					);
					return is270
						? [subtrackersBtn, divider, changeHeroBtn]
						: [changeHeroBtn, divider, subtrackersBtn];
				})()}
			</div>
		</div>
	);
}
