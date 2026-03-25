import { useState, useEffect, useRef } from "react";

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
        className="tut-float"
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
          className="tut-tap-top"
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
          className="tut-tap-bottom"
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
          <div className="tut-pulse" />
        </div>
        {/* Arrow down */}
        <svg
          className="tut-bounce-down"
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
          className="tut-slide-up"
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
        className="tut-float"
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

const KEYFRAMES = `
  @keyframes tutModalIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes tutModalOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.85) translateY(10px); }
  }
  @keyframes tutBackdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes tutBackdropOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes tutStepIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes tutFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes tutPulse {
    0% { transform: scale(0.8); opacity: 0.9; box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
    50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 10px rgba(255,255,255,0); }
    100% { transform: scale(0.8); opacity: 0.9; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  }
  @keyframes tutTapTop {
    0%, 40%, 100% { background-color: rgba(74, 222, 128, 0.25); }
    20% { background-color: rgba(74, 222, 128, 0.5); }
  }
  @keyframes tutTapBottom {
    0%, 60%, 100% { background-color: rgba(248, 113, 113, 0.25); }
    70% { background-color: rgba(248, 113, 113, 0.5); }
  }
  @keyframes tutBounceDown {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }
  @keyframes tutSlideUp {
    0%, 30% { opacity: 0; transform: translateY(8px); }
    60%, 100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes tutDotPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }
  .tut-float { animation: tutFloat 2.5s ease-in-out infinite; }
  .tut-pulse {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    animation: tutPulse 1.8s ease-in-out infinite;
  }
  .tut-tap-top { animation: tutTapTop 2.5s ease-in-out infinite; }
  .tut-tap-bottom { animation: tutTapBottom 2.5s ease-in-out infinite; }
  .tut-bounce-down { animation: tutBounceDown 1.5s ease-in-out infinite; }
  .tut-slide-up { animation: tutSlideUp 2.5s ease-in-out infinite; }
`;

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
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.8)",
        animation: exiting
          ? "tutBackdropOut 0.2s ease-in forwards"
          : "tutBackdropIn 0.2s ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{KEYFRAMES}</style>

      <div
        style={{
          backgroundColor: "#1e1e22",
          borderRadius: 16,
          padding: "clamp(20px, 5vw, 32px)",
          maxWidth: "min(85vw, 340px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          border: "1px solid #444",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          animation: exiting
            ? "tutModalOut 0.2s ease-in forwards"
            : "tutModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Step indicator dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: i === step ? "#c9a84c" : "rgba(255,255,255,0.25)",
                transition: "background-color 0.3s ease",
                ...(i === step ? { boxShadow: "0 0 6px rgba(201,168,76,0.5)" } : {}),
              }}
            />
          ))}
        </div>

        {/* Visual — re-keyed per step for enter animation */}
        <div
          key={stepKey}
          style={{
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "tutStepIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {current.visual}
        </div>

        {/* Title */}
        <h2
          key={`title-${stepKey}`}
          style={{
            margin: 0,
            color: "#fff",
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(16px, 4vw, 22px)",
            fontWeight: 700,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            animation: "tutStepIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.03s both",
          }}
        >
          {current.title}
        </h2>

        {/* Description */}
        <p
          key={`desc-${stepKey}`}
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.7)",
            fontSize: "clamp(13px, 3.5vw, 16px)",
            textAlign: "center",
            lineHeight: 1.5,
            animation: "tutStepIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.06s both",
          }}
        >
          {current.description}
        </p>

        {/* Buttons */}
        <div
          key={`btns-${stepKey}`}
          style={{
            display: "flex",
            width: "100%",
            gap: 12,
            marginTop: 4,
            animation: "tutStepIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) 0.09s both",
          }}
        >
          {!isLast && (
            <button
              onClick={handleSkip}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: "clamp(12px, 3vw, 15px)",
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              flex: isLast ? undefined : 1,
              ...(isLast ? { width: "100%" } : {}),
              padding: "10px 16px",
              fontSize: "clamp(12px, 3vw, 15px)",
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              backgroundColor: "#c9a84c",
              color: "#1a1a1e",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
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
