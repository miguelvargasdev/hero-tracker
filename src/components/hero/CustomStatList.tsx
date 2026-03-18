import type { CustomStat } from "../../types/hero";
import { useHeroStore } from "../../store/useHeroStore";
import { NumberInput } from "../shared/NumberInput";

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
      <h3 style={{ marginBottom: 8 }}>Custom Stats</h3>
      {stats.map((stat) => {
        const percent = stat.max > 0 ? (stat.current / stat.max) * 100 : 0;
        return (
          <div
            key={stat.id}
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
              <span style={{ fontWeight: "bold" }}>{stat.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumberInput
                  value={stat.current}
                  label={`${stat.label} current`}
                  onChange={(v) =>
                    updateCustomStat(heroId, stat.id, { current: v })
                  }
                />
                <span style={{ color: "#888" }}>/</span>
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
                  style={{
                    background: "none",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    fontSize: 16,
                    marginLeft: 4,
                  }}
                  aria-label={`Remove ${stat.label}`}
                >
                  x
                </button>
              </div>
            </div>

            <div
              style={{
                height: 6,
                backgroundColor: "#444",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                  backgroundColor: "#6a8fc4",
                  borderRadius: 3,
                  transition: "width 0.3s",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {QUICK_VALUES.map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    updateCustomStat(heroId, stat.id, {
                      current: stat.current + v,
                    })
                  }
                  style={{
                    padding: "4px 10px",
                    fontSize: 13,
                    backgroundColor: v < 0 ? "#5a2a2a" : "#2a5a2a",
                    color: "#eee",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
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
