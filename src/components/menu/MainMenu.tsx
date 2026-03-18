import { useHeroStore } from "../../store/useHeroStore";

const MENU_ITEMS = [
  {
    label: "Solo",
    description: "Single player",
    action: "solo" as const,
  },
  {
    label: "Standard",
    description: "2 to 6 players",
    action: "standard" as const,
  },
  {
    label: "Tyrant",
    description: "1 vs All",
    action: "tyrant" as const,
  },
  {
    label: "Skirmish",
    description: "Two vs Two",
    action: "skirmish" as const,
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
        break;
      case "skirmish":
        startGame("skirmish", 4);
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
        padding: 32,
        gap: 16,
        backgroundColor: "#111",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img
          src="/Logo_Gold.png"
          alt="HERO – Tales of the Tomes"
          style={{
            width: 360,
            maxWidth: "90%",
            height: "auto",
            marginBottom: 12,
          }}
        />
        <h1 style={{ margin: 0, fontSize: 24, color: "#eee" }}>
          Health Tracker
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 280,
        }}
      >
        {MENU_ITEMS.map((item) => (
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
            }}
          >
            <div>{item.label}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {item.action === "tyrant" ? "Coming soon" : item.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
