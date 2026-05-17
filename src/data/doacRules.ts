export type DoacRule = {
  id: string;
  name: string;
  todoItems: string[];
  caution: string;
};

export const doacRules: DoacRule[] = [
  {
    id: "apixaban",
    name: "アピキサバン",
    todoItems: [
      "TODO: verify with Japanese package insert / local pharmacy rule",
      "TODO: indication-specific dose reduction criteria",
      "TODO: dialysis and severe renal dysfunction handling",
    ],
    caution: "年齢・体重・血清Cr・適応疾患で確認点が変わります。",
  },
  {
    id: "rivaroxaban",
    name: "リバーロキサバン",
    todoItems: [
      "TODO: verify with Japanese package insert / local pharmacy rule",
      "TODO: indication-specific renal dose table",
      "TODO: acute VTE initial treatment period handling",
    ],
    caution: "適応疾患と腎機能で確認点が変わります。",
  },
  {
    id: "edoxaban",
    name: "エドキサバン",
    todoItems: [
      "TODO: verify with Japanese package insert / local pharmacy rule",
      "TODO: weight-based and renal criteria",
      "TODO: perioperative and VTE indication details",
    ],
    caution: "体重・腎機能・適応疾患で確認点が変わります。",
  },
  {
    id: "dabigatran",
    name: "ダビガトラン",
    todoItems: [
      "TODO: verify with Japanese package insert / local pharmacy rule",
      "TODO: renal contraindication threshold",
      "TODO: interaction and bleeding risk handling",
    ],
    caution: "腎排泄の影響が大きく、CCr確認が重要です。",
  },
];
