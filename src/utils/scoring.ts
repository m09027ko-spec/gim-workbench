export type Curb65Values = {
  confusion: boolean;
  urea: boolean;
  respiratoryRate: boolean;
  bloodPressure: boolean;
  age: boolean;
};

export type Curb65Result = {
  score: number;
  riskLabel: "低リスク" | "中等度リスク" | "高リスク";
};

export function calculateCurb65(values: Curb65Values): Curb65Result {
  const score = Object.values(values).filter(Boolean).length;

  if (score <= 1) {
    return { score, riskLabel: "低リスク" };
  }

  if (score === 2) {
    return { score, riskLabel: "中等度リスク" };
  }

  return { score, riskLabel: "高リスク" };
}

export type Cha2ds2VascValues = {
  heartFailure: boolean;
  hypertension: boolean;
  age75: boolean;
  diabetes: boolean;
  strokeTia: boolean;
  vascularDisease: boolean;
  age65to74: boolean;
  female: boolean;
};

export type Cha2ds2VascResult = {
  score: number;
  factors: string[];
};

export function calculateCha2ds2Vasc(values: Cha2ds2VascValues): Cha2ds2VascResult {
  const factors: string[] = [];
  let score = 0;

  if (values.heartFailure) {
    score += 1;
    factors.push("心不全 1点");
  }
  if (values.hypertension) {
    score += 1;
    factors.push("高血圧 1点");
  }
  if (values.age75) {
    score += 2;
    factors.push("75歳以上 2点");
  }
  if (values.diabetes) {
    score += 1;
    factors.push("糖尿病 1点");
  }
  if (values.strokeTia) {
    score += 2;
    factors.push("脳卒中/TIA/血栓塞栓症の既往 2点");
  }
  if (values.vascularDisease) {
    score += 1;
    factors.push("血管疾患 1点");
  }
  if (values.age65to74) {
    score += 1;
    factors.push("65-74歳 1点");
  }
  if (values.female) {
    score += 1;
    factors.push("女性 1点");
  }

  return { score, factors };
}
