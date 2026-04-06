import type { Stat } from "../../types/hero";
import { NumberInput } from "../shared/NumberInput";
import styles from "./StatBlock.module.css";

interface StatBlockProps {
  label: string;
  stat: Stat;
  onUpdateCurrent: (value: number) => void;
  onUpdateMax: (value: number) => void;
}

const QUICK_VALUES = [-10, -5, -1, 1, 5, 10];

export function StatBlock({
  label,
  stat,
  onUpdateCurrent,
  onUpdateMax,
}: StatBlockProps) {
  const percent = stat.max > 0 ? (stat.current / stat.max) * 100 : 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={styles.inputs}>
          <NumberInput
            value={stat.current}
            label={`${label} current`}
            onChange={onUpdateCurrent}
          />
          <span className={styles.separator}>/</span>
          <NumberInput
            value={stat.max}
            min={0}
            label={`${label} max`}
            onChange={onUpdateMax}
          />
        </div>
      </div>

      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{
            "--bar-width": `${Math.max(0, Math.min(100, percent))}%`,
            "--bar-color": percent > 50 ? "#4caf50" : percent > 25 ? "#ff9800" : "#f44336",
          } as React.CSSProperties}
        />
      </div>

      <div className={styles.quickButtons}>
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            onClick={() => onUpdateCurrent(stat.current + v)}
            className={`${styles.quickBtn} ${v < 0 ? styles.quickBtnNeg : styles.quickBtnPos}`}
          >
            {v > 0 ? `+${v}` : v}
          </button>
        ))}
      </div>
    </div>
  );
}
