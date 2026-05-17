import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ModuleCard } from "../components/ModuleCard";
import { SearchBar } from "../components/SearchBar";
import { SectionCard } from "../components/SectionCard";
import { categories, getModuleById, modules, searchModules } from "../data/modules";
import type { AppModule } from "../types/module";
import { getFavorites, getRecentModules, toggleFavorite } from "../utils/storage";

function isModule(module: AppModule | undefined): module is AppModule {
  return Boolean(module);
}

function moduleMatchesCategory(module: AppModule, categoryId: string): boolean {
  return module.categoryIds ? module.categoryIds.includes(categoryId) : module.categoryId === categoryId;
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [recentIds] = useState<string[]>(() => getRecentModules());

  const baseModules = useMemo(
    () => (query.trim() ? searchModules(query) : modules),
    [query],
  );
  const visibleModules = useMemo(
    () =>
      activeCategory === "all"
        ? baseModules
        : baseModules.filter((module) => moduleMatchesCategory(module, activeCategory)),
    [activeCategory, baseModules],
  );
  const favoriteModules = useMemo(
    () => favorites.map((moduleId) => getModuleById(moduleId)).filter(isModule),
    [favorites],
  );
  const recentModules = useMemo(
    () => recentIds.map((moduleId) => getModuleById(moduleId)).filter(isModule),
    [recentIds],
  );

  function handleToggleFavorite(moduleId: string): void {
    setFavorites(toggleFavorite(moduleId));
  }

  return (
    <div className="page-stack">
      <section className="home-hero">
        <p className="eyebrow">GIM Workbench</p>
        <h1>総診ワークベンチ</h1>
        <p>計算式・スコア・チェックリストを素早く開く医療者向け補助ツール</p>
      </section>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="ツールを検索：Na、DOAC、血液ガス、退院..."
      />

      <section className="content-section">
        <div className="section-heading">
          <h2>カテゴリ絞り込み</h2>
          <span>{visibleModules.length}件</span>
        </div>
        <div className="filter-chip-row" role="list" aria-label="カテゴリ絞り込み">
          <button
            className={`filter-chip${activeCategory === "all" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveCategory("all")}
          >
            すべて
          </button>
          {categories.map((category) => (
            <button
              className={`filter-chip${activeCategory === category.id ? " active" : ""}`}
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>ツール一覧</h2>
          <span>{visibleModules.length}/{modules.length}</span>
        </div>
        <div className="card-list">
          {visibleModules.length > 0 ? (
            visibleModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFavorite={favorites.includes(module.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <EmptyState
              title="該当するツールがありません"
              description="検索語またはカテゴリを変更してください。"
            />
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>最近使った</h2>
        </div>
        <div className="card-list compact-cards">
          {recentModules.length > 0 ? (
            recentModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFavorite={favorites.includes(module.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <EmptyState title="まだ最近使ったツールはありません" />
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>お気に入り</h2>
        </div>
        <div className="card-list compact-cards">
          {favoriteModules.length > 0 ? (
            favoriteModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isFavorite={favorites.includes(module.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <EmptyState title="よく使うツールを☆で登録できます" />
          )}
        </div>
      </section>

      <SectionCard title="共通注意" tone="notice">
        <ul className="compact-list">
          <li>医療者向け補助ツールであり、最終判断は担当医が行う。</li>
          <li>施設プロトコル・添付文書・最新ガイドラインを優先。</li>
          <li>未確認データや薬剤量は仮実装せず、TODOとして明示。</li>
        </ul>
      </SectionCard>
    </div>
  );
}
