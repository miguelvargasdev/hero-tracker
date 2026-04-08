import { useHeroStore } from "../../store/useHeroStore";
import styles from "./MainMenu.module.css";

const MENU_ITEMS = [
	{
		label: "Solo",
		description: "Single Hero Tracker",
		action: "solo" as const,
	},
	{
		label: "Standard",
		description: "2 to 5 Hero Trackers",
		action: "standard" as const,
	},
	{
		label: "Tyrant",
		description: "One vs Many",
		action: "tyrant" as const,
	},
];

export function MainMenu() {
	const startGame = useHeroStore((s) => s.startGame);
	const navigateTo = useHeroStore((s) => s.navigateTo);

	const handleSelect = (action: (typeof MENU_ITEMS)[number]["action"]) => {
		switch (action) {
			case "solo":
				startGame("solo", 1);
				break;
			case "standard":
				navigateTo("player-select");
				break;
			case "tyrant":
				navigateTo("tyrant-select");
				break;
		}
	};

	return (
		<div
			className={styles.container}
			style={{ "--bg-image": `url(${import.meta.env.BASE_URL}menu-bg.jpg)` } as React.CSSProperties}
		>
			<div className={styles.logoSection}>
				<img
					src={`${import.meta.env.BASE_URL}Logo_Gold.png`}
					alt="HERO – Tales of the Tomes"
					draggable={false}
					onDragStart={(e) => e.preventDefault()}
					className={styles.logoImage}
					data-splash-target="logo"
				/>
				<h1 className={styles.title}>
					Health Tracker<br />Companion App
				</h1>
			</div>

			<div className={styles.buttonGroup}>
				{MENU_ITEMS.map((item, i) => (
					<button
						key={item.action}
						onClick={() => handleSelect(item.action)}
						className={styles.menuButton}
						style={{ '--delay': `${0.15 + i * 0.05}s` } as React.CSSProperties}
					>
						<div className={styles.buttonLabel}>
							{item.label}
						</div>
						<div className={styles.buttonDescription}>
							{item.description}
						</div>
					</button>
				))}
			</div>

			{/* Bottom bar */}
			<div className={styles.bottomBar}>
				{/* How to Play - YouTube */}
				<a
					href="https://www.youtube.com/watch?v=VwjcLGDZd7U"
					target="_blank"
					rel="noopener noreferrer"
					className={styles.youtubeLink}
				>
					<span className={styles.youtubeLinkText}>
						How to Play
					</span>
					<svg width="56" height="56" viewBox="0 0 24 24" fill="white" className={styles.youtubeIcon}>
						<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
					</svg>
				</a>

				{/* Website link */}
				<a
					href="https://www.talesofthetomes.com"
					target="_blank"
					rel="noopener noreferrer"
					className={styles.websiteLink}
				>
					www.talesofthetomes.com
				</a>
			</div>
		</div>
	);
}
