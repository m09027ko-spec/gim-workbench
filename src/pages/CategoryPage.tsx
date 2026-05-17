import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";
import { ModuleCard } from "../components/ModuleCard";
import { SearchBar } from "../components/SearchBar";
import { getCategoryById, getModulesByCategory } from "../data/modules";
import { getFavorites, toggleFavorite } from "../utils/storage";
import { NotFoundPage } from "./NotFoundPage";

export function CategoryPage() {
  const { categoryId } = useParams();
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const categoryModules = useMemo(
    () => (category ? getModulesByCategory(category.id) : []),
    [category],
  );

  const filteredModules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return categoryModules;
    }

    return categoryModules.filter((module) =>
      [module.title, module.description, ...module.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [categoryModules, query]);

  if (!category) {
    return <NotFoundPage />;
  }

  function handleToggleFavorite(moduleId: string): void {
    setFavorites(toggleFavorite(moduleId));
  }

  return (
    <div className="page-stack">
      <Breadcrumb items={[{ label: category.title }]} />

      <section className={`page-header-card tone-${category.colorTone}`}>
        <p className="eyebrow">カテゴリ</p>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </section>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={`${category.title}のツールを検索`}
      />

      <section className="content-section">
        <div className="section-heading">
          <h2>ツール</h2>
          <span>{filteredModules.length}件</span>
        </div>
        <div className="card-list">
          {filteredModules.length > 0 ? (
            filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFavorite={favorites.includes(module.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
              <EmptyState title="該当するツールがありません" />
          )}
        </div>
      </section>
    </div>
  );
}
