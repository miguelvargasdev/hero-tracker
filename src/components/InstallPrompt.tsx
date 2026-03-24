import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
	);
}

function isInStandaloneMode(): boolean {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		(navigator as unknown as { standalone?: boolean }).standalone === true
	);
}

function isMobileDevice(): boolean {
	return (
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
		("ontouchstart" in window && navigator.maxTouchPoints > 1)
	);
}

const IOS_STEPS = [
	{ step: "1", text: "Tap the address bar at the top" },
	{
		step: "2",
		text: (
			<>
				Tap the{" "}
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: 22,
						height: 22,
						borderRadius: "50%",
						backgroundColor: "rgba(255,255,255,0.15)",
						verticalAlign: "middle",
						fontSize: 10,
						fontWeight: "bold",
						color: "#ccc",
						letterSpacing: 1,
					}}
				>
					•••
				</span>{" "}
				button
			</>
		),
	},
	{
		step: "3",
		text: (
			<>
				Tap{" "}
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						verticalAlign: "middle",
						gap: 4,
					}}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#ccc"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ verticalAlign: "middle" }}
					>
						<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
						<polyline points="16 6 12 2 8 6" />
						<line x1="12" y1="2" x2="12" y2="15" />
					</svg>
					<strong style={{ color: "#ccc" }}>Share</strong>
				</span>
			</>
		),
	},
	{
		step: "4",
		text: (
			<>
				Tap the{" "}
				<span
					style={{
						display: "inline-flex",
						flexDirection: "column",
						alignItems: "center",
						verticalAlign: "middle",
						gap: 1,
					}}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							width: 22,
							height: 22,
							borderRadius: "50%",
							backgroundColor: "rgba(255,255,255,0.15)",
							fontSize: 10,
							fontWeight: "bold",
							color: "#ccc",
							letterSpacing: 1,
						}}
					>
						•••
					</span>
					<span style={{ fontSize: 8, color: "#999" }}>More</span>
				</span>{" "}
				button
			</>
		),
	},
	{
		step: "5",
		text: (
			<>
				Tap{" "}
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: 20,
						height: 20,
						borderRadius: 5,
						border: "1.5px solid #ccc",
						verticalAlign: "middle",
						fontSize: 16,
						fontWeight: "bold",
						color: "#ccc",
						lineHeight: 1,
					}}
				>
					+
				</span>{" "}
				<strong style={{ color: "#ccc" }}>Add to Home Screen</strong>
			</>
		),
	},
];

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [dismissed, setDismissed] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const [showIOSPrompt, setShowIOSPrompt] = useState(false);
	const [showIOSSteps, setShowIOSSteps] = useState(false);

	useEffect(() => {
		if (isInStandaloneMode()) {
			setIsInstalled(true);
			return;
		}

		// Only show on mobile/tablet devices
		if (!isMobileDevice()) {
			return;
		}

		// Check if user previously dismissed
		const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
		if (wasDismissed) {
			setDismissed(true);
		}

		// iOS Safari — no beforeinstallprompt, show manual instructions
		if (isIOS()) {
			setShowIOSPrompt(true);
			return;
		}

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};

		window.addEventListener("beforeinstallprompt", handler);

		window.addEventListener("appinstalled", () => {
			setIsInstalled(true);
			setDeferredPrompt(null);
		});

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	};

	const handleDismiss = () => {
		setDismissed(true);
		sessionStorage.setItem("pwa-install-dismissed", "true");
	};

	// Don't show if installed or dismissed
	if (isInstalled || dismissed) return null;

	// Don't show if neither iOS nor Chrome prompt available
	if (!showIOSPrompt && !deferredPrompt) return null;

	return (
		<>
			{/* Banner */}
			<div
				style={{
					position: "fixed",
					bottom: 16,
					left: 16,
					right: 16,
					backgroundColor: "#2a2a2e",
					border: "1px solid #444",
					borderRadius: 12,
					padding: "12px 16px",
					display: "flex",
					alignItems: "center",
					gap: 12,
					zIndex: 100,
					boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
					cursor: showIOSPrompt ? "pointer" : undefined,
				}}
				onClick={showIOSPrompt ? () => setShowIOSSteps(true) : undefined}
			>
				<div style={{ fontSize: 24 }}>{showIOSPrompt ? "📱" : "📲"}</div>
				<div style={{ flex: 1 }}>
					<div style={{ color: "#eee", fontSize: 14, fontWeight: "bold" }}>
						Install App
					</div>
					<div style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
						{showIOSPrompt
							? "Tap here for instructions"
							: "Add to your home screen for the best experience"}
					</div>
				</div>
				{!showIOSPrompt && (
					<button
						onClick={handleInstall}
						style={{
							padding: "8px 14px",
							fontSize: 13,
							fontWeight: "bold",
							backgroundColor: "#e0a050",
							color: "#111",
							border: "none",
							borderRadius: 8,
							cursor: "pointer",
							whiteSpace: "nowrap",
						}}
					>
						Install
					</button>
				)}
				<button
					onClick={(e) => {
						e.stopPropagation();
						handleDismiss();
					}}
					style={{
						padding: 4,
						backgroundColor: "transparent",
						color: "#666",
						border: "none",
						cursor: "pointer",
						fontSize: 18,
						lineHeight: 1,
					}}
					aria-label="Dismiss"
				>
					×
				</button>
			</div>

			{/* iOS Steps Modal */}
			{showIOSSteps && (
				<div
					onClick={() => setShowIOSSteps(false)}
					style={{
						position: "fixed",
						inset: 0,
						backgroundColor: "rgba(0,0,0,0.7)",
						zIndex: 200,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: 24,
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							backgroundColor: "#2a2a2e",
							border: "1px solid #444",
							borderRadius: 16,
							padding: "20px 24px",
							maxWidth: 340,
							width: "100%",
						}}
					>
						<h3
							style={{
								margin: "0 0 16px",
								color: "#eee",
								fontSize: 16,
								fontWeight: "bold",
								textAlign: "center",
							}}
						>
							Install on iPhone / iPad
						</h3>
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							{IOS_STEPS.map((s) => (
								<div
									key={s.step}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 12,
									}}
								>
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											backgroundColor: "#e0a050",
											color: "#111",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 14,
											fontWeight: "bold",
											flexShrink: 0,
										}}
									>
										{s.step}
									</div>
									<div
										style={{
											color: "#999",
											fontSize: 14,
											lineHeight: 1.4,
										}}
									>
										{s.text}
									</div>
								</div>
							))}
						</div>
						<button
							onClick={() => setShowIOSSteps(false)}
							style={{
								marginTop: 20,
								width: "100%",
								padding: "10px 0",
								fontSize: 14,
								fontWeight: "bold",
								backgroundColor: "#e0a050",
								color: "#111",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							Got it
						</button>
					</div>
				</div>
			)}
		</>
	);
}
