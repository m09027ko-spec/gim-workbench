import { Checklist, type ChecklistItem } from "../../components/Checklist";
import { SectionCard } from "../../components/SectionCard";

const initialEvaluation: ChecklistItem[] = [
  { id: "vitals-oxygen", label: "バイタル・酸素需要", priority: "high" },
  { id: "consciousness", label: "意識状態", priority: "high" },
  { id: "dehydration", label: "脱水" },
  { id: "sepsis", label: "敗血症の有無", priority: "high" },
  { id: "chest-image", label: "胸部画像" },
  { id: "blood-tests", label: "血液検査" },
  { id: "blood-culture", label: "血液培養の要否" },
  { id: "sputum", label: "喀痰検査の要否" },
  { id: "aspiration-risk", label: "誤嚥リスク", priority: "high" },
  { id: "oral-status", label: "口腔内の状態" },
];

const treatmentItems: ChecklistItem[] = [
  { id: "antibiotics", label: "抗菌薬選択", priority: "high" },
  { id: "oxygen", label: "酸素投与" },
  { id: "infusion", label: "輸液" },
  { id: "nutrition", label: "栄養管理" },
  { id: "diet-restart", label: "食事中止・再開の判断", priority: "high" },
  { id: "oral-care", label: "口腔ケア" },
  { id: "rehab", label: "リハビリ" },
  { id: "swallowing-assessment", label: "嚥下評価", priority: "high" },
  { id: "medication-review", label: "原因薬剤の確認" },
];

const comprehensiveItems: ChecklistItem[] = [
  { id: "adl", label: "ADL" },
  { id: "cognition", label: "認知機能" },
  { id: "delirium", label: "せん妄" },
  { id: "nutrition", label: "栄養" },
  { id: "swallowing", label: "嚥下" },
  { id: "pressure-ulcer", label: "褥瘡" },
  { id: "fall", label: "転倒" },
  { id: "excretion", label: "排泄" },
  { id: "social-background", label: "社会的背景" },
  { id: "care-capacity", label: "介護力" },
];

const acpItems: ChecklistItem[] = [
  { id: "patient-wishes", label: "本人の意向", priority: "high" },
  { id: "family-understanding", label: "家族の理解" },
  { id: "recurrence-policy", label: "再発時の方針" },
  { id: "oral-intake-policy", label: "経口摂取困難時の方針" },
  { id: "tube-feeding", label: "胃瘻・経管栄養についての考え方" },
  { id: "icu", label: "ICU管理の希望" },
  { id: "dnar", label: "DNARの確認が必要か" },
  { id: "destination", label: "退院先の希望" },
];

const dischargeSupportItems: ChecklistItem[] = [
  { id: "food-texture", label: "食形態" },
  { id: "oral-medication", label: "内服可否" },
  { id: "oxygen", label: "酸素需要" },
  { id: "care-services", label: "介護サービス" },
  { id: "visiting-nurse", label: "訪問看護" },
  { id: "oral-care", label: "口腔ケア継続" },
  { id: "prevention", label: "再発予防" },
  { id: "primary-care-message", label: "かかりつけ医への伝達事項" },
  { id: "follow-up", label: "外来フォロー" },
];

const replyItems = [
  "肺炎の重症度、酸素需要、治療経過",
  "抗菌薬名、投与期間、培養結果の要点",
  "嚥下評価、食形態、内服可否",
  "再発予防策、口腔ケア、リハビリ方針",
  "ACPで確認した内容と今後の方針",
  "外来・訪問診療でフォローしてほしい項目",
];

export function AspirationPneumonia() {
  return (
    <>
      <SectionCard title="位置づけ" tone="notice">
        <p>
          高齢者の誤嚥性肺炎を、初期評価、治療、包括評価、ACP、退院支援まで通して確認するための業務補助です。
        </p>
      </SectionCard>

      <Checklist
        title="初期評価"
        items={initialEvaluation}
        storageKey="aspiration-initial-evaluation"
      />
      <Checklist title="治療" items={treatmentItems} storageKey="aspiration-treatment" />
      <Checklist
        title="高齢者包括評価"
        items={comprehensiveItems}
        storageKey="aspiration-comprehensive"
      />
      <Checklist title="ACP・方針" items={acpItems} storageKey="aspiration-acp" />
      <Checklist
        title="退院支援"
        items={dischargeSupportItems}
        storageKey="aspiration-discharge-support"
      />

      <SectionCard title="退院時返書に入れるべき項目">
        <ul className="compact-list">
          {replyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
