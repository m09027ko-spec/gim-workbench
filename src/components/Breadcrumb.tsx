import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="パンくずリスト">
      <Link to="/">ホーム</Link>
      {items.map((item) => (
        <span className="breadcrumb-item" key={`${item.label}-${item.to ?? "current"}`}>
          <span aria-hidden="true">/</span>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
