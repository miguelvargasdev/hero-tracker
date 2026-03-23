import { useState } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { StatBlock } from "./StatBlock";
import { CustomStatList } from "./CustomStatList";
import { AddCustomStatModal } from "./AddCustomStatModal";

export function HeroDetail() {
  const activeHeroId = useHeroStore((s) => s.activeHeroId);
  const heroes = useHeroStore((s) => s.heroes);
  const navigateTo = useHeroStore((s) => s.navigateTo);
  const updateStat = useHeroStore((s) => s.updateStat);

  const [showCustomStatModal, setShowCustomStatModal] = useState(false);

  const hero = heroes.find((h) => h.id === activeHeroId);

  if (!hero) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p>Hero not found.</p>
        <button onClick={() => navigateTo("game")}>Back to Roster</button>
      </div>
    );
  }

  const coreStats = [
    { label: "HP", key: "hp" as const },
    { label: "Mana", key: "mana" as const },
    { label: "Armor", key: "armor" as const },
    { label: "Attack", key: "attack" as const },
  ];

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <button
        onClick={() => navigateTo("game")}
        style={{
          background: "none",
          border: "none",
          color: "#6a8fc4",
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
          marginBottom: 12,
        }}
      >
        &larr; Back to Roster
      </button>

      <h1 style={{ margin: "0 0 16px", fontSize: 22 }}>{hero.name}</h1>

      {coreStats.map(({ label, key }) => (
        <StatBlock
          key={key}
          label={label}
          stat={hero[key]}
          onUpdateCurrent={(v) => updateStat(hero.id, key, "current", v)}
          onUpdateMax={(v) => updateStat(hero.id, key, "max", v)}
        />
      ))}

      <CustomStatList heroId={hero.id} stats={hero.customStats} />

      <button
        onClick={() => setShowCustomStatModal(true)}
        style={{
          width: "100%",
          padding: "10px 16px",
          backgroundColor: "transparent",
          color: "#6a8fc4",
          border: "1px dashed #6a8fc4",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          marginTop: 8,
        }}
      >
        + Add Custom Stat
      </button>

      <AddCustomStatModal
        heroId={hero.id}
        isOpen={showCustomStatModal}
        onClose={() => setShowCustomStatModal(false)}
      />
    </div>
  );
}
