import type { Stat } from "../../types/hero";
import { NumberInput } from "../shared/NumberInput";

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
    <div
      style={{
        backgroundColor: "#2a2a3e",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: 16 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NumberInput
            value={stat.current}
            label={`${label} current`}
            onChange={onUpdateCurrent}
          />
          <span style={{ color: "#888" }}>/</span>
          <NumberInput
            value={stat.max}
            min={0}
            label={`${label} max`}
            onChange={onUpdateMax}
          />
        </div>
      </div>

      <div
        style={{
          height: 8,
          backgroundColor: "#444",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, percent))}%`,
            backgroundColor:
              percent > 50 ? "#4caf50" : percent > 25 ? "#ff9800" : "#f44336",
            borderRadius: 4,
            transition: "width 0.3s",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            onClick={() => onUpdateCurrent(stat.current + v)}
            style={{
              padding: "6px 12px",
              fontSize: 14,
              backgroundColor: v < 0 ? "#5a2a2a" : "#2a5a2a",
              color: "#eee",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              minWidth: 48,
            }}
          >
            {v > 0 ? `+${v}` : v}
          </button>
        ))}
      </div>
    </div>
  );
}
