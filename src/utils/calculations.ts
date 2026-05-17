export type Sex = "male" | "female";

export function roundTo(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function isFinitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function calculateCockcroftGault(
  age: number,
  weightKg: number,
  serumCreatinineMgDl: number,
  sex: Sex,
): number {
  if (
    !isFinitePositive(age) ||
    !isFinitePositive(weightKg) ||
    !isFinitePositive(serumCreatinineMgDl)
  ) {
    return Number.NaN;
  }

  const sexFactor = sex === "female" ? 0.85 : 1;
  return ((140 - age) * weightKg * sexFactor) / (72 * serumCreatinineMgDl);
}

export function calculateCorrectedSodium(na: number, glucoseMgDl: number): number {
  if (!Number.isFinite(na) || !Number.isFinite(glucoseMgDl)) {
    return Number.NaN;
  }

  return na + 1.6 * ((glucoseMgDl - 100) / 100);
}

export function calculateFreeWaterDeficit(
  sodium: number,
  weightKg: number,
  sex: Sex,
): number {
  if (!isFinitePositive(sodium) || !isFinitePositive(weightKg) || sodium <= 140) {
    return Number.NaN;
  }

  const tbwFactor = sex === "female" ? 0.5 : 0.6;
  return tbwFactor * weightKg * (sodium / 140 - 1);
}

export function calculateAnionGap(na: number, cl: number, hco3: number): number {
  if (!Number.isFinite(na) || !Number.isFinite(cl) || !Number.isFinite(hco3)) {
    return Number.NaN;
  }

  return na - cl - hco3;
}

export function calculateAlbuminCorrectedAnionGap(
  anionGap: number,
  albuminGdl: number,
): number {
  if (!Number.isFinite(anionGap) || !Number.isFinite(albuminGdl)) {
    return Number.NaN;
  }

  return anionGap + 2.5 * (4 - albuminGdl);
}

export function calculateFib4(
  age: number,
  ast: number,
  alt: number,
  platelet10k: number,
): number {
  if (
    !isFinitePositive(age) ||
    !isFinitePositive(ast) ||
    !isFinitePositive(alt) ||
    !isFinitePositive(platelet10k)
  ) {
    return Number.NaN;
  }

  // Input is shown as 10^4/uL in the UI; FIB-4 convention uses 10^9/L.
  return (age * ast) / (platelet10k * 10 * Math.sqrt(alt));
}

export function calculateChildPughScore(values: {
  bilirubin: number;
  albumin: number;
  inr: number;
  ascitesPoints: number;
  encephalopathyPoints: number;
}): { score: number; classification: "A" | "B" | "C" } {
  const bilirubinPoints = values.bilirubin < 2 ? 1 : values.bilirubin <= 3 ? 2 : 3;
  const albuminPoints = values.albumin > 3.5 ? 1 : values.albumin >= 2.8 ? 2 : 3;
  const inrPoints = values.inr < 1.7 ? 1 : values.inr <= 2.3 ? 2 : 3;
  const score =
    bilirubinPoints +
    albuminPoints +
    inrPoints +
    values.ascitesPoints +
    values.encephalopathyPoints;

  if (score <= 6) {
    return { score, classification: "A" };
  }

  if (score <= 9) {
    return { score, classification: "B" };
  }

  return { score, classification: "C" };
}

export function calculateMeldNa(values: {
  bilirubin: number;
  inr: number;
  creatinine: number;
  sodium: number;
}): number {
  if (
    !isFinitePositive(values.bilirubin) ||
    !isFinitePositive(values.inr) ||
    !isFinitePositive(values.creatinine) ||
    !isFinitePositive(values.sodium)
  ) {
    return Number.NaN;
  }

  // MELD variables are conventionally floored at 1.0; creatinine is capped at 4.0.
  // Sodium is bounded to 125-137 for the MELD-Na adjustment.
  const bilirubin = Math.max(values.bilirubin, 1);
  const inr = Math.max(values.inr, 1);
  const creatinine = Math.min(Math.max(values.creatinine, 1), 4);
  const sodium = Math.min(Math.max(values.sodium, 125), 137);
  const meld =
    3.78 * Math.log(bilirubin) +
    11.2 * Math.log(inr) +
    9.57 * Math.log(creatinine) +
    6.43;

  return meld + 1.32 * (137 - sodium) - 0.033 * meld * (137 - sodium);
}

export type Cha2ds2VascInput = {
  heartFailure: boolean;
  hypertension: boolean;
  age75: boolean;
  diabetes: boolean;
  strokeTia: boolean;
  vascularDisease: boolean;
  age65to74: boolean;
  female: boolean;
};

export function calculateCha2ds2VascScore(values: Cha2ds2VascInput): number {
  return (
    Number(values.heartFailure) +
    Number(values.hypertension) +
    Number(values.age75) * 2 +
    Number(values.diabetes) +
    Number(values.strokeTia) * 2 +
    Number(values.vascularDisease) +
    Number(values.age65to74) +
    Number(values.female)
  );
}

export type Chads2Input = {
  heartFailure: boolean;
  hypertension: boolean;
  age75: boolean;
  diabetes: boolean;
  strokeTia: boolean;
};

export function calculateChads2Score(values: Chads2Input): number {
  return (
    Number(values.heartFailure) +
    Number(values.hypertension) +
    Number(values.age75) +
    Number(values.diabetes) +
    Number(values.strokeTia) * 2
  );
}

export type HasBledInput = {
  hypertension: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  stroke: boolean;
  bleeding: boolean;
  labileInr: boolean;
  elderly: boolean;
  drugs: boolean;
  alcohol: boolean;
};

export function calculateHasBledScore(values: HasBledInput): number {
  return (
    Number(values.hypertension) +
    Number(values.abnormalRenal) +
    Number(values.abnormalLiver) +
    Number(values.stroke) +
    Number(values.bleeding) +
    Number(values.labileInr) +
    Number(values.elderly) +
    Number(values.drugs) +
    Number(values.alcohol)
  );
}

export function calculateCentorMcIsaac(values: {
  fever: boolean;
  noCough: boolean;
  tenderNodes: boolean;
  tonsillarExudate: boolean;
  ageGroup: "under15" | "15to44" | "45plus";
}): { centor: number; mcIsaac: number } {
  const centor =
    Number(values.fever) +
    Number(values.noCough) +
    Number(values.tenderNodes) +
    Number(values.tonsillarExudate);
  const ageAdjustment =
    values.ageGroup === "under15" ? 1 : values.ageGroup === "45plus" ? -1 : 0;

  return { centor, mcIsaac: centor + ageAdjustment };
}

export function calculateSteroidEquivalent(
  dose: number,
  fromEquivalentDose: number,
  toEquivalentDose: number,
): number {
  if (
    !isFinitePositive(dose) ||
    !isFinitePositive(fromEquivalentDose) ||
    !isFinitePositive(toEquivalentDose)
  ) {
    return Number.NaN;
  }

  return (dose / fromEquivalentDose) * toEquivalentDose;
}
