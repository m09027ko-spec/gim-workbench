type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="sr-only">モジュール検索</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "モジュールを検索"}
        autoComplete="off"
      />
    </label>
  );
}
