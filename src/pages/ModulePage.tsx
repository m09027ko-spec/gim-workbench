import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { getCategoryById, getModuleById } from "../data/modules";
import { MiniToolRenderer } from "../modules/miniTools/MiniToolRenderer";
import { addRecentModule, getFavorites, toggleFavorite } from "../utils/storage";
import { NotFoundPage } from "./NotFoundPage";

export function ModulePage() {
  const { moduleId } = useParams();
  const module = moduleId ? getModuleById(moduleId) : undefined;
  const primaryCategory = module ? getCategoryById(module.categoryId) : undefined;
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  useEffect(() => {
    if (module) {
      addRecentModule(module.id);
    }
  }, [module]);

  if (!module) {
    return <NotFoundPage />;
  }

  const currentModule = module;

  function handleToggleFavorite(): void {
    setFavorites(toggleFavorite(currentModule.id));
  }

  return (
    <div className="page-stack">
      <Breadcrumb
        items={[
          {
            label: primaryCategory?.title ?? currentModule.categoryTitle,
            to: `/category/${currentModule.categoryId}`,
          },
          { label: currentModule.title },
        ]}
      />

      <section className="module-page-header">
        <div>
          <p className="eyebrow">{currentModule.categoryTitle}</p>
          <h1>{currentModule.title}</h1>
          <p>{currentModule.description}</p>
        </div>
        <button
          className={`favorite-button large${favorites.includes(currentModule.id) ? " active" : ""}`}
          type="button"
          onClick={handleToggleFavorite}
          aria-label="お気に入り切り替え"
        >
          {favorites.includes(currentModule.id) ? "★" : "☆"}
        </button>
      </section>

      <MiniToolRenderer toolId={currentModule.id} />
    </div>
  );
}
