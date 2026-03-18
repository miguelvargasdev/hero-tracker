import { useState } from "react";
import { Modal } from "../shared/Modal";
import { useHeroStore } from "../../store/useHeroStore";

interface AddCustomStatModalProps {
  heroId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomStatModal({
  heroId,
  isOpen,
  onClose,
}: AddCustomStatModalProps) {
  const [label, setLabel] = useState("");
  const [max, setMax] = useState("10");
  const addCustomStat = useHeroStore((s) => s.addCustomStat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    const maxVal = parseInt(max, 10);
    if (!trimmedLabel || isNaN(maxVal) || maxVal <= 0) return;
    addCustomStat(heroId, trimmedLabel, maxVal);
    setLabel("");
    setMax("10");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Stat">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: "block", marginBottom: 4, fontSize: 14 }}
          >
            Stat Name
          </label>
          <input
            type="text"
            placeholder="e.g. Stamina"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 16,
              backgroundColor: "#1a1a2e",
              color: "#eee",
              border: "1px solid #444",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 4, fontSize: 14 }}
          >
            Max Value
          </label>
          <input
            type="number"
            value={max}
            min="1"
            onChange={(e) => setMax(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 16,
              backgroundColor: "#1a1a2e",
              color: "#eee",
              border: "1px solid #444",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#aaa",
              border: "1px solid #444",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#4a6fa5",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
