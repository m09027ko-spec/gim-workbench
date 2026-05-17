import type { ChecklistGroupDefinition } from "../types/tool";

export const admissionOrderChecklist: ChecklistGroupDefinition[] = [
  {
    title: "基本オーダー",
    items: [
      { id: "diet", label: "食事・絶食・食形態" },
      { id: "activity", label: "安静度" },
      { id: "oxygen", label: "酸素指示" },
      { id: "iv", label: "点滴・補液" },
      { id: "tests", label: "採血・画像・培養などの検査" },
    ],
  },
  {
    title: "病棟安全",
    items: [
      { id: "dvt", label: "DVT予防", priority: "high" },
      { id: "rehab", label: "リハビリ依頼" },
      { id: "nutrition", label: "栄養評価" },
      { id: "delirium", label: "せん妄予防" },
      { id: "discharge", label: "退院支援スクリーニング" },
    ],
  },
];

export const dischargeChecklist: ChecklistGroupDefinition[] = [
  {
    title: "退院前",
    items: [
      { id: "prescription", label: "退院処方", priority: "high" },
      { id: "letter", label: "診療情報提供書・紹介状" },
      { id: "reply", label: "紹介元返書" },
      { id: "outpatient", label: "外来予約" },
      { id: "tests", label: "検査予約" },
    ],
  },
  {
    title: "生活調整",
    items: [
      { id: "care", label: "介護サービス" },
      { id: "nursing", label: "訪問看護" },
      { id: "family", label: "家族説明" },
      { id: "education", label: "退院時指導" },
    ],
  },
];

export const deliriumCauseChecklist: ChecklistGroupDefinition[] = [
  {
    title: "身体要因",
    items: [
      { id: "infection", label: "感染" },
      { id: "hypoxia", label: "低酸素", priority: "high" },
      { id: "constipation", label: "便秘" },
      { id: "urinary-retention", label: "尿閉" },
      { id: "pain", label: "疼痛" },
      { id: "dehydration", label: "脱水" },
    ],
  },
  {
    title: "環境・薬剤",
    items: [
      { id: "medications", label: "薬剤性", priority: "high" },
      { id: "sleep", label: "睡眠障害" },
      { id: "environment", label: "環境変化" },
    ],
  },
];

export const aspirationPneumoniaChecklist: ChecklistGroupDefinition[] = [
  {
    title: "急性期",
    items: [
      { id: "antibiotics", label: "抗菌薬選択と培養確認", priority: "high" },
      { id: "oxygen", label: "酸素需要" },
      { id: "swallow", label: "嚥下評価", priority: "high" },
      { id: "nutrition", label: "栄養管理" },
      { id: "oral-care", label: "口腔ケア" },
    ],
  },
  {
    title: "包括管理",
    items: [
      { id: "rehab", label: "リハビリ" },
      { id: "cga", label: "CGA的評価" },
      { id: "acp", label: "ACP・再発時方針" },
      { id: "discharge", label: "退院支援" },
      { id: "prevention", label: "再発予防策" },
    ],
  },
];

export const urinaryRetentionChecklist: ChecklistGroupDefinition[] = [
  {
    title: "初期対応",
    items: [
      { id: "bladder-scan", label: "膀胱エコー" },
      { id: "catheter", label: "導尿・尿量記録", priority: "high" },
      { id: "medications", label: "原因薬剤確認" },
      { id: "prostate", label: "前立腺疾患" },
      { id: "neurologic", label: "神経症状", priority: "high" },
      { id: "constipation", label: "便秘" },
      { id: "uti", label: "尿路感染" },
      { id: "diuresis", label: "post-obstructive diuresis注意" },
    ],
  },
];

export const transfusionChecklist: ChecklistGroupDefinition[] = [
  {
    title: "輸血前",
    items: [
      { id: "consent", label: "輸血同意" },
      { id: "type-screen", label: "T&S" },
      { id: "crossmatch", label: "交差適合" },
      { id: "transfusion-bleeding-check", label: "活動性出血の有無" },
      { id: "goal", label: "緩和目的なら患者目標を確認" },
    ],
  },
  {
    title: "輸血後",
    items: [
      { id: "vitals", label: "投与中バイタル・副反応確認" },
      { id: "effect", label: "投与後効果判定" },
      { id: "symptoms", label: "症状改善の確認" },
    ],
  },
];
