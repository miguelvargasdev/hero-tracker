import { useHeroStore } from "../../store/useHeroStore";

const MENU_ITEMS = [
  {
    label: "Solo",
    description: "Single player",
    action: "solo" as const,
  },
  {
    label: "Standard",
    description: "2 to 5 players",
    action: "standard" as const,
  },
  {
    label: "Tyrant",
    description: "1 vs All",
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
        break;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "clamp(16px, 3vh, 32px)",
        gap: "clamp(8px, 1.5vh, 16px)",
        backgroundColor: "#111",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div style={{
        textAlign: "center",
        marginBottom: "clamp(8px, 2vh, 24px)",
        animation: "mainLogoIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}>
        <img
          src={`${import.meta.env.BASE_URL}Logo_Gold.png`}
          alt="HERO – Tales of the Tomes"
          style={{
            width: "clamp(200px, 40vw, 360px)",
            maxWidth: "90%",
            height: "auto",
            marginBottom: "clamp(4px, 1vh, 12px)",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "#eee",
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            textTransform: "uppercase",
            animation: "mainTitleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
          }}
        >
          Health Tracker
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 400,
        }}
      >
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.action}
            onClick={() => handleSelect(item.action)}
            style={{
              padding: "14px 20px",
              fontSize: 18,
              backgroundColor:
                item.action === "tyrant" ? "#1a1a1e" : "#2a2a2e",
              color: item.action === "tyrant" ? "#555" : "#eee",
              border: "1px solid #444",
              borderRadius: 8,
              cursor: item.action === "tyrant" ? "default" : "pointer",
              textAlign: "left",
              opacity: item.action === "tyrant" ? 0.5 : 1,
              animation: `mainBtnIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.05}s both`,
              transition: "transform 0.15s, box-shadow 0.15s, border-color 0.2s",
            }}
            onMouseDown={(e) => {
              if (item.action !== "tyrant")
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {item.action === "tyrant" ? "Coming soon" : item.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
