import { Link } from "react-router-dom";
import type { AppModule } from "../types/module";

type ModuleCardProps = {
  module: AppModule;
  isFavorite: boolean;
  onToggleFavorite: (moduleId: string) => void;
};

export function ModuleCard({ module, isFavorite, onToggleFavorite }: ModuleCardProps) {
  const visibleTags = Array.from(new Set(module.tags)).slice(0, 4);

  return (
    <article className="module-card">
      <div className="module-card-top">
        <div>
          <p className="module-category">{module.categoryTitle}</p>
          <h3>{module.title}</h3>
        </div>
        <button
          className={`favorite-button${isFavorite ? " active" : ""}`}
          type="button"
          onClick={() => onToggleFavorite(module.id)}
          aria-label={`${module.title}を${isFavorite ? "お気に入りから外す" : "お気に入りに追加"}`}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <p className="module-description">{module.description}</p>
      <div className="tag-row" aria-label="タグ">
        {visibleTags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="module-card-actions">
        <span className="status-badge implemented">利用可</span>
        <Link className="button primary" to={module.path}>
          開く
        </Link>
      </div>
    </article>
  );
}
