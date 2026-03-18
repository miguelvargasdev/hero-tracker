import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [dismissed, setDismissed] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if already installed (standalone mode)
		if (
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as unknown as { standalone?: boolean }).standalone
		) {
			setIsInstalled(true);
			return;
		}

		// Check if user previously dismissed
		const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
		if (wasDismissed) {
			setDismissed(true);
		}

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};

		window.addEventListener("beforeinstallprompt", handler);

		// Listen for successful install
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

	// Don't show if already installed, dismissed, or no prompt available
	if (isInstalled || dismissed || !deferredPrompt) return null;

	return (
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
			}}
		>
			<div style={{ fontSize: 24 }}>📲</div>
			<div style={{ flex: 1 }}>
				<div style={{ color: "#eee", fontSize: 14, fontWeight: "bold" }}>
					Install App
				</div>
				<div style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
					Add to your home screen for the best experience
				</div>
			</div>
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
			<button
				onClick={handleDismiss}
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
	);
}
