import { useState } from "react";
import { useHeroStore } from "../../store/useHeroStore";
import { StatBlock } from "./StatBlock";
import { CustomStatList } from "./CustomStatList";
import { AddCustomStatModal } from "./AddCustomStatModal";
import styles from "./HeroDetail.module.css";

export function HeroDetail() {
  const activeHeroId = useHeroStore((s) => s.activeHeroId);
  const heroes = useHeroStore((s) => s.heroes);
  const navigateTo = useHeroStore((s) => s.navigateTo);
  const updateStat = useHeroStore((s) => s.updateStat);

  const [showCustomStatModal, setShowCustomStatModal] = useState(false);

  const hero = heroes.find((h) => h.id === activeHeroId);

  if (!hero) {
    return (
      <div className={styles.notFound}>
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
    <div className={styles.container}>
      <button
        onClick={() => navigateTo("game")}
        className={styles.backBtn}
      >
        &larr; Back to Roster
      </button>

      <h1 className={styles.heading}>{hero.name}</h1>

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
        className={styles.addStatBtn}
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
