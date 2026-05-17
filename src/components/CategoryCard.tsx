import { Link } from "react-router-dom";
import type { AppCategory } from "../types/module";

type CategoryCardProps = {
  category: AppCategory;
  moduleCount: number;
};

export function CategoryCard({ category, moduleCount }: CategoryCardProps) {
  return (
    <Link className={`category-card tone-${category.colorTone}`} to={category.path}>
      <span className="category-icon" aria-hidden="true">
        {category.iconLabel}
      </span>
      <span className="category-body">
        <span className="category-title">{category.title}</span>
        <span className="category-description">{category.description}</span>
      </span>
      <span className="category-count">{moduleCount}件</span>
    </Link>
  );
}
