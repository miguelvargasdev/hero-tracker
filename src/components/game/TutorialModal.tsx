import { useState, useEffect, useRef } from "react";
import styles from "./TutorialModal.module.css";

const STORAGE_KEY = "hero-tracker-tutorial-seen";

interface TutorialStep {
  title: string;
  description: string;
  visual: React.ReactNode;
}

const STEPS: TutorialStep[] = [
  {
    title: "Select a Hero",
    description: "Tap the + card to choose your hero from the roster.",
    visual: (
      <div
        className={styles.tutFloat}
        style={{
          width: 80,
          height: 100,
          borderRadius: 12,
          border: "2px dashed rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 40 40" style={{ opacity: 0.5 }}>
          <rect x="16" y="4" width="8" height="32" rx="2" fill="#aaa" />
          <rect x="4" y="16" width="32" height="8" rx="2" fill="#aaa" />
        </svg>
      </div>
    ),
  },
  {
    title: "Adjust Health",
    description:
      "Tap the top half of the card to add HP. Tap the bottom half to subtract.",
    visual: (
      <div
        style={{
          width: 80,
          height: 100,
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          className={styles.tutTapTop}
          style={{
            flex: 1,
            backgroundColor: "rgba(74, 222, 128, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#4ade80",
          }}
        >
          +1
        </div>
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <div
          className={styles.tutTapBottom}
          style={{
            flex: 1,
            backgroundColor: "rgba(248, 113, 113, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#f87171",
          }}
        >
          -1
        </div>
      </div>
    ),
  },
  {
    title: "Long Press for Options",
    description:
      "Hold down on a card to open the drawer. From there you can change your hero or add subtrackers like Attack, Armor, and Mana.",
    visual: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 80,
            height: 60,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Ripple effect */}
          <div className={styles.tutPulse} />
        </div>
        {/* Arrow down */}
        <svg
          className={styles.tutBounceDown}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
        {/* Drawer preview */}
        <div
          className={styles.tutSlideUp}
          style={{
            width: 80,
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.12)",
            padding: "6px 0",
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          {/* Swap icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          </svg>
          {/* Stack icon */}
          <svg
            width="16"
            height="16"
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
          </svg>
        </div>
      </div>
    ),
  },
  {
    title: "Crown Menu",
    description:
      "Tap the crown button to access the game menu — reset all stats or return to the main menu.",
    visual: (
      <div
        className={styles.tutFloat}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}crown.png`}
          alt="Crown"
          style={{ width: 30, height: 30, objectFit: "contain" }}
        />
      </div>
    ),
  },
];

export function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [stepKey, setStepKey] = useState(0); // triggers re-animation on step change
  const [exiting, setExiting] = useState(false);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const animateOut = (cb: () => void) => {
    setExiting(true);
    setTimeout(cb, 200);
  };

  const handleNext = () => {
    if (isLast) {
      animateOut(() => {
        localStorage.setItem(STORAGE_KEY, "true");
        onClose();
      });
    } else {
      setStep((s) => s + 1);
      setStepKey((k) => k + 1);
    }
  };

  const handleSkip = () => {
    animateOut(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      onClose();
    });
  };

  // Pop animation on the active dot when step changes
  useEffect(() => {
    const dot = dotRefs.current[step];
    if (dot) {
      dot.style.animation = "none";
      // Force reflow
      void dot.offsetHeight;
      dot.style.animation = "tutDotPop 0.3s ease-out";
    }
  }, [step]);

  return (
    <div
      className={`${styles.backdrop} ${exiting ? styles.backdropOut : styles.backdropIn}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`${styles.modalCard} ${exiting ? styles.modalOut : styles.modalIn}`}
      >
        {/* Step indicator dots */}
        <div className={styles.dotsWrapper}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              className={`${styles.dot} ${i === step ? styles.dotActive : ""}`}
            />
          ))}
        </div>

        {/* Visual — re-keyed per step for enter animation */}
        <div key={stepKey} className={styles.visualContainer}>
          {current.visual}
        </div>

        {/* Title */}
        <h2 key={`title-${stepKey}`} className={styles.title}>
          {current.title}
        </h2>

        {/* Description */}
        <p key={`desc-${stepKey}`} className={styles.description}>
          {current.description}
        </p>

        {/* Buttons */}
        <div key={`btns-${stepKey}`} className={styles.buttonsWrapper}>
          {!isLast && (
            <button onClick={handleSkip} className={styles.skipBtn}>
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className={`${styles.nextBtn} ${isLast ? styles.fullWidth : ""}`}
          >
            {isLast ? "Got It" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the tutorial has already been dismissed */
export function useTutorialSeen(): boolean {
  const [seen, setSeen] = useState(true); // default true to avoid flash
  useEffect(() => {
    setSeen(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);
  return seen;
}
