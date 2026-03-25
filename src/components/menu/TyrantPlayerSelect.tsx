import { useHeroStore } from "../../store/useHeroStore";

const PARTY_SIZES = [
	{ total: 3, label: "1 vs 2", team: 2 },
	{ total: 4, label: "1 vs 3", team: 3 },
	{ total: 5, label: "1 vs 4", team: 4 },
];

const KEYFRAMES = `
	@keyframes tsHeaderIn {
		from { opacity: 0; transform: translateY(-16px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes tsCardIn {
		from { opacity: 0; transform: scale(0.85); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes tsBackIn {
		from { opacity: 0; transform: translateX(-10px); }
		to { opacity: 1; transform: translateX(0); }
	}
`;

export function TyrantPlayerSelect() {
	const startGame = useHeroStore((s) => s.startGame);
	const navigateTo = useHeroStore((s) => s.navigateTo);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				padding: 32,
				position: "relative",
				backgroundColor: "#111",
			}}
		>
			<style>{KEYFRAMES}</style>

			<button
				onClick={() => navigateTo("main-menu")}
				style={{
					position: "absolute",
					top: 32,
					left: 32,
					background: "none",
					border: "none",
					color: "#eee",
					cursor: "pointer",
					fontSize: 14,
					fontWeight: "bold",
					padding: 0,
					animation: "tsBackIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
					transition: "transform 0.15s",
				}}
				onMouseDown={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(-3px)";
				}}
				onMouseUp={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
				}}
			>
				&larr; Back
			</button>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
				}}
			>
				<h2
					style={{
						fontFamily: "'Cinzel', serif",
						marginBottom: 12,
						fontSize: 28,
						color: "#eee",
						fontWeight: 700,
						textTransform: "uppercase",
						textAlign: "center",
						lineHeight: 1.2,
						animation: "tsHeaderIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.03s both",
					}}
				>
					Tyrant Mode
				</h2>
				<p
					style={{
						fontFamily: "'Cinzel', serif",
						fontSize: 14,
						color: "#888",
						marginTop: 0,
						marginBottom: 32,
						textAlign: "center",
						animation: "tsHeaderIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both",
					}}
				>
					1 Boss vs Team
				</p>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 16,
						width: "100%",
						maxWidth: 280,
					}}
				>
					{PARTY_SIZES.map((size, i) => (
						<button
							key={size.total}
							onClick={() => startGame("tyrant", size.total)}
							style={{
								padding: "18px 24px",
								backgroundColor: "#2a2a2e",
								border: "1px solid #444",
								borderRadius: 12,
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								animation: `tsCardIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${0.08 + i * 0.05}s both`,
								transition: "transform 0.15s",
							}}
							onMouseDown={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
							}}
							onMouseUp={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
							}}
						>
							<span
								style={{
									fontFamily: "'Cinzel', serif",
									fontWeight: 700,
									fontSize: 20,
									color: "#eee",
									textTransform: "uppercase",
								}}
							>
								{size.label}
							</span>
							<span
								style={{
									fontSize: 13,
									color: "#888",
								}}
							>
								{size.total} players
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
