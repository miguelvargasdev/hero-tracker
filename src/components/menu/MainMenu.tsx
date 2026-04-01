import { useHeroStore } from "../../store/useHeroStore";

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

const KEYFRAMES = `
  @keyframes mainLogoIn {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes mainTitleIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes mainBtnIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

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
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "flex-start",
				paddingTop: "clamp(24px, 5vh, 60px)",
				height: "100%",
				position: "relative",
				padding: "clamp(16px, 3vh, 32px)",
				gap: "clamp(8px, 1.5vh, 16px)",
				backgroundImage: `url(${import.meta.env.BASE_URL}menu-bg.jpg)`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			<style>{KEYFRAMES}</style>

			<div
				style={{
					textAlign: "center",
					marginBottom: "clamp(8px, 2vh, 24px)",
					animation: "mainLogoIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
				}}
			>
				<img
					src={`${import.meta.env.BASE_URL}Logo_Gold.png`}
					alt="HERO – Tales of the Tomes"
					draggable={false}
					onDragStart={(e) => e.preventDefault()}
					style={
						{
							width: "clamp(320px, 90vw, 600px)",
							maxWidth: "90%",
							height: "auto",
							marginBottom: "clamp(4px, 1vh, 12px)",
							userSelect: "none",
							WebkitUserSelect: "none",
							WebkitTouchCallout: "none",
						} as React.CSSProperties
					}
				/>
				<h1
					style={{
						margin: 0,
						fontSize: "clamp(26px, 6.5vw, 40px)",
						color: "#eee",
						fontFamily: "'Cinzel', serif",
						fontWeight: 700,
						textTransform: "uppercase",
						textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
						animation:
							"mainTitleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
					}}
				>
					Health Tracker<br />Companion App
				</h1>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 12,
					width: "100%",
					maxWidth: 250,
				}}
			>
				{MENU_ITEMS.map((item, i) => (
					<button
						key={item.action}
						onClick={() => handleSelect(item.action)}
						style={{
							padding: "14px 21px",
							fontSize: 28,
							background: "linear-gradient(180deg, #e8cc6e 0%, #d4af37 25%, #c49a2c 50%, #b8860b 75%, #a67c1a 100%)",
							color: "#111",
							border: "1px solid #d4af37",
							borderRadius: 8,
							cursor: "pointer",
							textAlign: "left",
							animation: `mainBtnIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.05}s both`,
							transition:
								"transform 0.15s, box-shadow 0.15s, border-color 0.2s",
						}}
						onMouseDown={(e) => {
							(e.currentTarget as HTMLButtonElement).style.transform =
								"scale(0.97)";
						}}
						onMouseUp={(e) => {
							(e.currentTarget as HTMLButtonElement).style.transform =
								"scale(1)";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.transform =
								"scale(1)";
						}}
					>
						<div
							style={{
								fontFamily: "'Cinzel', serif",
								fontWeight: 700,
								textTransform: "uppercase",
								textAlign: "center",
							}}
						>
							{item.label}
						</div>
						<div
							style={{
								textAlign: "center",
								fontSize: 12,
								color: "#111",
								marginTop: 2,
							}}
						>
							{item.description}
						</div>
					</button>
				))}
			</div>

			{/* Bottom bar */}
			<div
				style={{
					position: "absolute",
					bottom: "clamp(12px, 2vh, 24px)",
					left: "clamp(16px, 3vw, 32px)",
					right: "clamp(16px, 3vw, 32px)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
				}}
			>
				{/* How to Play - YouTube */}
				<a
					href="https://www.youtube.com/watch?v=VwjcLGDZd7U"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 4,
						padding: 0,
						textDecoration: "none",
					}}
				>
					<span
						style={{
							color: "#fff",
							fontSize: 10,
							fontFamily: "'Cinzel', serif",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
						}}
					>
						How to Play
					</span>
					<svg width="56" height="56" viewBox="0 0 24 24" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.5))" }}>
						<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
					</svg>
				</a>

				{/* Website link */}
				<a
					href="https://www.talesofthetomes.com"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "#fff",
						fontSize: 14,
						fontFamily: "'Cinzel', serif",
						textDecoration: "none",
						textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
					}}
				>
					www.talesofthetomes.com
				</a>
			</div>
		</div>
	);
}
