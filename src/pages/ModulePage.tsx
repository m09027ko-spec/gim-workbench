import { useEffect, useState, type ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";
import { SectionCard } from "../components/SectionCard";
import { getModuleById } from "../data/modules";
import { Cha2ds2Vasc } from "../modules/calculators/Cha2ds2Vasc";
import { Curb65 } from "../modules/calculators/Curb65";
import { DischargeSummary } from "../modules/documents/DischargeSummary";
import { ReferralReply } from "../modules/documents/ReferralReply";
import { AdmissionChecklist } from "../modules/ward/AdmissionChecklist";
import { AspirationPneumonia } from "../modules/ward/AspirationPneumonia";
import { DischargeChecklist } from "../modules/ward/DischargeChecklist";
import { addRecentModule, getFavorites, toggleFavorite } from "../utils/storage";
import { NotFoundPage } from "./NotFoundPage";

const implementedModules: Record<string, ComponentType> = {
  "admission-checklist": AdmissionChecklist,
  "discharge-checklist": DischargeChecklist,
  "aspiration-pneumonia": AspirationPneumonia,
  curb65: Curb65,
  "cha2ds2-vasc": Cha2ds2Vasc,
  "discharge-summary": DischargeSummary,
  "referral-reply": ReferralReply,
};

export function ModulePage() {
  const { moduleId } = useParams();
  const module = moduleId ? getModuleById(moduleId) : undefined;
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
  const ModuleComponent = implementedModules[currentModule.id];

  function handleToggleFavorite(): void {
    setFavorites(toggleFavorite(currentModule.id));
  }

  return (
    <div className="page-stack">
      <Breadcrumb
        items={[
          { label: module.categoryTitle, to: `/category/${module.categoryId}` },
          { label: module.title },
        ]}
      />

      <section className="module-page-header">
        <div>
          <p className="eyebrow">{module.categoryTitle}</p>
          <h1>{module.title}</h1>
          <p>{module.description}</p>
        </div>
        <button
          className={`favorite-button large${favorites.includes(module.id) ? " active" : ""}`}
          type="button"
          onClick={handleToggleFavorite}
          aria-label="お気に入り切り替え"
        >
          {favorites.includes(module.id) ? "★" : "☆"}
        </button>
      </section>

      {ModuleComponent ? (
        <ModuleComponent />
      ) : (
        <SectionCard title="近日追加予定" tone="notice">
          <p>
            このモジュールはカードとして登録済みです。今後、チェックリスト・計算・テンプレートを追加できる構造にしています。
          </p>
          <Link className="button secondary full-width" to={`/category/${module.categoryId}`}>
            カテゴリに戻る
          </Link>
        </SectionCard>
      )}

      <SectionCard title="個人情報の扱い" tone="notice">
        <p className="notice-text">
          患者名、ID、生年月日、住所、電話番号、カルテ番号、症例本文などの患者個人情報は入力しないでください。
        </p>
      </SectionCard>
    </div>
  );
}
