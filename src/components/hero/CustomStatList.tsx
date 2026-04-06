import type { CustomStat } from "../../types/hero";
import { useHeroStore } from "../../store/useHeroStore";
import { NumberInput } from "../shared/NumberInput";
import styles from "./CustomStatList.module.css";

interface CustomStatListProps {
  heroId: string;
  stats: CustomStat[];
}

const QUICK_VALUES = [-5, -1, 1, 5];

export function CustomStatList({ heroId, stats }: CustomStatListProps) {
  const updateCustomStat = useHeroStore((s) => s.updateCustomStat);
  const removeCustomStat = useHeroStore((s) => s.removeCustomStat);

  if (stats.length === 0) return null;

  return (
    <div>
      <h3 className={styles.heading}>Custom Stats</h3>
      {stats.map((stat) => {
        const percent = stat.max > 0 ? (stat.current / stat.max) * 100 : 0;
        return (
          <div
            key={stat.id}
            className={styles.card}
          >
            <div className={styles.header}>
              <span className={styles.label}>{stat.label}</span>
              <div className={styles.inputs}>
                <NumberInput
                  value={stat.current}
                  label={`${stat.label} current`}
                  onChange={(v) =>
                    updateCustomStat(heroId, stat.id, { current: v })
                  }
                />
                <span className={styles.separator}>/</span>
                <NumberInput
                  value={stat.max}
                  min={0}
                  label={`${stat.label} max`}
                  onChange={(v) =>
                    updateCustomStat(heroId, stat.id, { max: v })
                  }
                />
                <button
                  onClick={() => removeCustomStat(heroId, stat.id)}
                  className={styles.removeBtn}
                  aria-label={`Remove ${stat.label}`}
                >
                  x
                </button>
              </div>
            </div>

            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                }}
              />
            </div>

            <div className={styles.quickButtons}>
              {QUICK_VALUES.map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    updateCustomStat(heroId, stat.id, {
                      current: stat.current + v,
                    })
                  }
                  className={`${styles.quickBtn} ${v < 0 ? styles.quickBtnNeg : styles.quickBtnPos}`}
                >
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
