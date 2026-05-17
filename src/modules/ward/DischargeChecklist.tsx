import { Checklist, type ChecklistItem } from "../../components/Checklist";
import { SectionCard } from "../../components/SectionCard";

const stabilityItems: ChecklistItem[] = [
  { id: "primary-condition", label: "主病態が改善している", priority: "high" },
  { id: "vitals", label: "バイタルが安定している", priority: "high" },
  { id: "oxygen", label: "酸素需要が退院可能な範囲", priority: "high" },
  { id: "intake", label: "食事・水分摂取が退院可能な範囲" },
  { id: "adl", label: "ADLが退院先に合っている" },
  { id: "delirium", label: "せん妄が改善または対応方針あり" },
  { id: "antibiotics", label: "感染症の場合、抗菌薬期間が明確" },
  { id: "abnormal-tests", label: "検査異常のフォロー方針が明確" },
];

const prescriptionItems: ChecklistItem[] = [
  { id: "discharge-prescription", label: "退院時処方を確認", priority: "high" },
  { id: "stopped-meds", label: "中止薬を確認", priority: "high" },
  { id: "restarted-meds", label: "再開薬を確認" },
  { id: "antithrombotics", label: "抗血栓薬を確認", priority: "high" },
  { id: "diabetes-meds", label: "糖尿病薬を確認" },
  { id: "antihypertensives", label: "降圧薬を確認" },
  { id: "renal-dose", label: "腎機能に応じた用量調整を確認" },
  { id: "pharmacy-info", label: "薬剤情報提供の必要性を確認" },
];

const followUpItems: ChecklistItem[] = [
  { id: "outpatient-appointment", label: "外来予約" },
  { id: "blood-test", label: "採血フォロー" },
  { id: "imaging", label: "画像フォロー" },
  { id: "specialty", label: "専門科フォロー" },
  { id: "primary-care", label: "かかりつけ医フォロー" },
  { id: "home-care", label: "訪問診療・訪問看護" },
  { id: "rehab", label: "リハビリ継続" },
  { id: "care-services", label: "介護サービス調整" },
];

const documentItems: ChecklistItem[] = [
  { id: "summary", label: "退院サマリ", priority: "high" },
  { id: "medical-info", label: "診療情報提供書" },
  { id: "referral-reply", label: "紹介元返書" },
  { id: "certificates", label: "診断書・証明書" },
  { id: "nursing-summary", label: "看護サマリ" },
  { id: "rehab-summary", label: "リハビリサマリ" },
  { id: "pharmacy-summary", label: "薬剤サマリ" },
  { id: "family-record", label: "家族説明記録" },
];

export function DischargeChecklist() {
  return (
    <>
      <SectionCard title="退院前の確認" tone="notice">
        <p>
          退院可否の判断を自動化するものではありません。退院先の受け入れ能力、患者背景、院内ルールを合わせて確認してください。
        </p>
      </SectionCard>

      <Checklist title="医学的安定性" items={stabilityItems} storageKey="discharge-stability" />
      <Checklist title="処方" items={prescriptionItems} storageKey="discharge-prescription" />
      <Checklist title="フォロー" items={followUpItems} storageKey="discharge-follow-up" />
      <Checklist title="書類" items={documentItems} storageKey="discharge-documents" />
    </>
  );
}
