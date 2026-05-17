import { Link } from "react-router-dom";
import { SectionCard } from "../components/SectionCard";

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <SectionCard title="ページが見つかりません">
        <p>指定されたページまたはモジュールは見つかりませんでした。</p>
        <Link className="button primary full-width" to="/">
          ホームへ戻る
        </Link>
      </SectionCard>
    </div>
  );
}
