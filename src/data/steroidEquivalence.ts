export type SteroidId =
  | "prednisolone"
  | "methylprednisolone"
  | "hydrocortisone"
  | "dexamethasone";

export type SteroidEquivalent = {
  id: SteroidId;
  name: string;
  equivalentDoseMg: number;
};

export const steroidEquivalents: SteroidEquivalent[] = [
  { id: "prednisolone", name: "プレドニゾロン", equivalentDoseMg: 5 },
  { id: "methylprednisolone", name: "メチルプレドニゾロン", equivalentDoseMg: 4 },
  { id: "hydrocortisone", name: "ヒドロコルチゾン", equivalentDoseMg: 20 },
  { id: "dexamethasone", name: "デキサメタゾン", equivalentDoseMg: 0.75 },
];
