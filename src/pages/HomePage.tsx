import { useMemo, useState } from "react";
import { CategoryCard } from "../components/CategoryCard";
import { EmptyState } from "../components/EmptyState";
import { ModuleCard } from "../components/ModuleCard";
import { SearchBar } from "../components/SearchBar";
import { SectionCard } from "../components/SectionCard";
import {
  categories,
  getModuleById,
  getModulesByCategory,
  modules,
  searchModules,
} from "../data/modules";
import type { AppModule } from "../types/module";
import { getFavorites, getRecentModules, toggleFavorite } from "../utils/storage";

function isModule(module: AppModule | undefined): module is AppModule {
  return Boolean(module);
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [recentIds] = useState<string[]>(() => getRecentModules());

  const searchResults = useMemo(() => searchModules(query), [query]);
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
        <p>病棟・外来・救急・教育をつなぐ個人用臨床ワークスペース</p>
      </section>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="モジュールを検索：肺炎、退院、CURB、返書..."
      />

      {query.trim() ? (
        <section className="content-section">
          <div className="section-heading">
            <h2>検索結果</h2>
            <span>{searchResults.length}件</span>
          </div>
          <div className="card-list">
            {searchResults.length > 0 ? (
              searchResults.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isFavorite={favorites.includes(module.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <EmptyState
                title="該当するモジュールがありません"
                description="別のキーワードで検索してください。"
              />
            )}
          </div>
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>最近使った</h2>
        </div>
        <div className="card-list">
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
            <EmptyState title="まだ最近使ったモジュールはありません" />
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>お気に入り</h2>
        </div>
        <div className="card-list">
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
            <EmptyState title="よく使うモジュールを☆で登録できます" />
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>カテゴリ</h2>
          <span>{modules.length}モジュール</span>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              moduleCount={getModulesByCategory(category.id).length}
            />
          ))}
        </div>
      </section>

      <SectionCard title="注意" tone="notice">
        <p className="notice-text">
          このアプリは診療補助用の個人ツールです。臨床判断は必ず最新のガイドライン、院内ルール、患者背景に基づいて行ってください。患者個人情報は入力しないでください。
        </p>
      </SectionCard>
    </div>
  );
}
