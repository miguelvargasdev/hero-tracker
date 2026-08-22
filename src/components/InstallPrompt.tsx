import { useState, useEffect } from "react";
import styles from "./InstallPrompt.module.css";

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
				<span className={styles.iconCircle}>
					&bull;&bull;&bull;
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
				<span className={styles.shareIcon}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#ccc"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
						<polyline points="16 6 12 2 8 6" />
						<line x1="12" y1="2" x2="12" y2="15" />
					</svg>
					<strong className={styles.shareLabel}>Share</strong>
				</span>
			</>
		),
	},
	{
		step: "4",
		text: (
			<>
				Tap the{" "}
				<span className={styles.moreWrapper}>
					<span className={styles.iconCircle}>
						&bull;&bull;&bull;
					</span>
					<span className={styles.moreLabel}>More</span>
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
				<span className={styles.addIcon}>
					+
				</span>{" "}
				<strong className={styles.addLabel}>Add to Home Screen</strong>
			</>
		),
	},
];

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalled, setIsInstalled] = useState(() => isInStandaloneMode());
	// dismissed/showIOSPrompt only matter on mobile, and are static for the
	// lifetime of the component, so they're derived once at mount instead of
	// being set from inside an effect.
	const [dismissed, setDismissed] = useState(
		() =>
			isMobileDevice() &&
			sessionStorage.getItem("pwa-install-dismissed") === "true",
	);
	const [showIOSPrompt] = useState(
		() => !isInStandaloneMode() && isMobileDevice() && isIOS(),
	);
	const [showIOSSteps, setShowIOSSteps] = useState(false);

	useEffect(() => {
		// Chrome's native install prompt only applies once installed/iOS/desktop
		// are ruled out — subscribe to it and to the install completion event.
		if (isInstalled || showIOSPrompt || !isMobileDevice()) return;

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};
		const onInstalled = () => {
			setIsInstalled(true);
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handler);
		window.addEventListener("appinstalled", onInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, [isInstalled, showIOSPrompt]);

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
				className={`${styles.banner}${showIOSPrompt ? ` ${styles.bannerClickable}` : ""}`}
				onClick={showIOSPrompt ? () => setShowIOSSteps(true) : undefined}
			>
				<div className={styles.bannerIcon}>{showIOSPrompt ? "\u{1F4F1}" : "\u{1F4F2}"}</div>
				<div className={styles.bannerBody}>
					<div className={styles.bannerTitle}>
						Install App
					</div>
					<div className={styles.bannerSubtitle}>
						{showIOSPrompt
							? "Tap here for instructions"
							: "Add to your home screen for the best experience"}
					</div>
				</div>
				{!showIOSPrompt && (
					<button
						onClick={handleInstall}
						className={styles.installButton}
					>
						Install
					</button>
				)}
				<button
					onClick={(e) => {
						e.stopPropagation();
						handleDismiss();
					}}
					className={styles.dismissButton}
					aria-label="Dismiss"
				>
					&times;
				</button>
			</div>

			{/* iOS Steps Modal */}
			{showIOSSteps && (
				<div
					onClick={() => setShowIOSSteps(false)}
					className={styles.overlay}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className={styles.modal}
					>
						<h3 className={styles.modalTitle}>
							Install on iPhone / iPad
						</h3>
						<div className={styles.stepList}>
							{IOS_STEPS.map((s) => (
								<div
									key={s.step}
									className={styles.stepRow}
								>
									<div className={styles.stepBadge}>
										{s.step}
									</div>
									<div className={styles.stepText}>
										{s.text}
									</div>
								</div>
							))}
						</div>
						<button
							onClick={() => setShowIOSSteps(false)}
							className={styles.gotItButton}
						>
							Got it
						</button>
					</div>
				</div>
			)}
		</>
	);
}
