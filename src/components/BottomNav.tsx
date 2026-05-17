import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "ホーム" },
  { to: "/category/emergency", label: "救急" },
  { to: "/category/ward", label: "病棟" },
  { to: "/category/medications", label: "薬剤" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="主要ナビゲーション">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-link${isActive ? " active" : ""}`}
          end={item.to === "/"}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
