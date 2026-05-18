type TextareaInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  help?: string;
};

export function TextareaInput({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  help,
}: TextareaInputProps) {
  return (
    <label className="tool-field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {help ? <small>{help}</small> : null}
    </label>
  );
}
