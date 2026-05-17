import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="top-header">
      <Link className="brand" to="/" aria-label="ホームへ戻る">
        <span className="brand-mark">総</span>
        <span>
          <span className="brand-title">総診ワークベンチ</span>
          <span className="brand-subtitle">GIM Workbench</span>
        </span>
      </Link>
    </header>
  );
}
