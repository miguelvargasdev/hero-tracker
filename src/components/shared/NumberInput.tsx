import styles from "./NumberInput.module.css";

interface NumberInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label: string;
}

export function NumberInput({
  value,
  min,
  max,
  onChange,
  label,
}: NumberInputProps) {
  return (
    <input
      type="number"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const parsed = parseInt(e.target.value, 10);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }}
      className={styles.input}
    />
  );
}
