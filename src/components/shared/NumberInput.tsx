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
      style={{
        width: 60,
        padding: "4px 8px",
        fontSize: 16,
        textAlign: "center",
        backgroundColor: "#1a1a2e",
        color: "#eee",
        border: "1px solid #444",
        borderRadius: 4,
      }}
    />
  );
}
