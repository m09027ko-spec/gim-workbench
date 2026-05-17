type NumberInputProps = {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
};

export function NumberInput({
  id,
  label,
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
  step = 1,
  help,
}: NumberInputProps) {
  return (
    <label className="tool-field" htmlFor={id}>
      <span>{label}</span>
      <div className="input-with-unit">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? "" : Number(next));
          }}
        />
        {unit ? <span>{unit}</span> : null}
      </div>
      {help ? <small>{help}</small> : null}
    </label>
  );
}
