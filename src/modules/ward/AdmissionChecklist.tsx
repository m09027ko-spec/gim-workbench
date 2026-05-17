import { Checklist, type ChecklistItem } from "../../components/Checklist";
import { SectionCard } from "../../components/SectionCard";

const basicEvaluation: ChecklistItem[] = [
  { id: "chief-problem", label: "主病名・入院目的を1文で整理", priority: "high" },
  { id: "history", label: "既往歴・併存疾患を確認" },
  { id: "medications", label: "内服薬・中止薬・抗血栓薬を確認", priority: "high" },
  { id: "allergy", label: "アレルギー歴を確認", priority: "high" },
  { id: "adl", label: "ADLを確認" },
  { id: "cognition", label: "認知機能を確認" },
  { id: "key-person", label: "家族・キーパーソンを確認" },
  { id: "discharge-destination", label: "退院先の見込みを確認" },
];

const geriatricAssessment: ChecklistItem[] = [
  { id: "swallowing", label: "嚥下リスクを確認", priority: "high" },
  { id: "nutrition", label: "栄養状態を確認" },
  { id: "delirium", label: "せん妄リスクを確認", priority: "high" },
  { id: "pressure-ulcer", label: "褥瘡リスクを確認" },
  { id: "fall", label: "転倒リスクを確認", priority: "high" },
  { id: "excretion", label: "排泄・尿道カテーテルの必要性を確認" },
  { id: "rehab", label: "リハビリ依頼を検討" },
  { id: "msw", label: "MSW介入を検討" },
];

const safetyPrevention: ChecklistItem[] = [
  { id: "dvt", label: "DVT予防を検討" },
  { id: "oxygen-iv-monitor", label: "酸素・点滴・モニターの必要性を確認" },
  { id: "infection-control", label: "感染対策を確認" },
  { id: "activity", label: "安静度を設定" },
  { id: "diet", label: "食事形態を設定" },
  { id: "code-acp", label: "コードステータス・ACPの確認方針を検討", priority: "high" },
];

const documentsCoordination: ChecklistItem[] = [
  { id: "admission-plan", label: "入院診療計画書" },
  { id: "nutrition-plan", label: "栄養管理計画" },
  { id: "pressure-ulcer-documents", label: "褥瘡関連書類" },
  { id: "discharge-screening", label: "退院支援スクリーニング" },
  { id: "referral-reply", label: "紹介元への返書要否" },
  { id: "family-meeting", label: "家族説明の予定" },
];

export function AdmissionChecklist() {
  return (
    <>
      <SectionCard title="使い方" tone="notice">
        <p>
          入院直後の抜け漏れ確認用です。チェック状態のみ端末内に一時保存され、自由記載や患者個人情報は保存しません。
        </p>
      </SectionCard>

      <Checklist
        title="基本評価"
        items={basicEvaluation}
        storageKey="admission-basic-evaluation"
      />
      <Checklist
        title="高齢者機能評価"
        items={geriatricAssessment}
        storageKey="admission-geriatric-assessment"
      />
      <Checklist
        title="安全管理・予防"
        items={safetyPrevention}
        storageKey="admission-safety-prevention"
      />
      <Checklist
        title="書類・連携"
        items={documentsCoordination}
        storageKey="admission-documents-coordination"
      />
    </>
  );
}
