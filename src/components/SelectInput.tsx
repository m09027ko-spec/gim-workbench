import type { ToolOption } from "../types/tool";

type SelectInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ToolOption[];
  help?: string;
};

export function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  help,
}: SelectInputProps) {
  return (
    <label className="tool-field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <small>{help}</small> : null}
    </label>
  );
}
