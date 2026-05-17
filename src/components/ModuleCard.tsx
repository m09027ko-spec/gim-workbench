import { Link } from "react-router-dom";
import type { AppModule } from "../types/module";

type ModuleCardProps = {
  module: AppModule;
  isFavorite: boolean;
  onToggleFavorite: (moduleId: string) => void;
};

export function ModuleCard({ module, isFavorite, onToggleFavorite }: ModuleCardProps) {
  const implemented = module.status === "implemented";

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
        {module.tags.slice(0, 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="module-card-actions">
        <span className={`status-badge ${implemented ? "implemented" : "planned"}`}>
          {implemented ? "実装済み" : "近日追加予定"}
        </span>
        <Link className={`button ${implemented ? "primary" : "secondary"}`} to={module.path}>
          {implemented ? "開く" : "予定を見る"}
        </Link>
      </div>
    </article>
  );
}
