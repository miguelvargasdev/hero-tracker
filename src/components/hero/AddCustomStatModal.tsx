import { useState } from "react";
import { Modal } from "../shared/Modal";
import { useHeroStore } from "../../store/useHeroStore";
import styles from "./AddCustomStatModal.module.css";

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
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Stat Name
          </label>
          <input
            type="text"
            placeholder="e.g. Stamina"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            className={styles.input}
          />
        </div>
        <div className={styles.fieldGroupLast}>
          <label className={styles.label}>
            Max Value
          </label>
          <input
            type="number"
            value={max}
            min="1"
            onChange={(e) => setMax(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
