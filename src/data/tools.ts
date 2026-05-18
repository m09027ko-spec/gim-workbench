import type { AppModule } from "../types/module";
import type {
  ChecklistGroupDefinition,
  ToolDefinition,
  ToolResult,
  ToolValues,
} from "../types/tool";
import { antibioticRenalDosing } from "./antibioticRenalDosing";
import {
  admissionOrderChecklist,
  aspirationPneumoniaChecklist,
  deliriumCauseChecklist,
  dischargeChecklist,
  transfusionChecklist,
  urinaryRetentionChecklist,
} from "./checklistItems";
import { doacRules } from "./doacRules";
import { steroidEquivalents } from "./steroidEquivalence";
import {
  calculateAlbuminCorrectedAnionGap,
  calculateAnionGap,
  calculateCentorMcIsaac,
  calculateCha2ds2VascScore,
  calculateChads2Score,
  calculateChildPughScore,
  calculateCockcroftGault,
  calculateCorrectedSodium,
  calculateFib4,
  calculateFreeWaterDeficit,
  calculateHasBledScore,
  calculateMeldNa,
  calculateSteroidEquivalent,
  roundTo,
} from "../utils/calculations";
import { buildDischargeSummary, buildReferralReply } from "../utils/textTemplates";

const commonReferences = [
  "代表的な臨床スコア・計算式に基づく実装。施設プロトコルと最新ガイドラインで確認してください。",
  "薬剤量・検査閾値・治療方針は施設差があるため、添付文書・薬剤部基準・院内ルールを優先してください。",
];

const sexOptions = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
];

function n(values: ToolValues, id: string): number {
  const value = values[id];
  return typeof value === "number" ? value : Number.NaN;
}

function s(values: ToolValues, id: string): string {
  const value = values[id];
  return typeof value === "string" ? value : "";
}

function b(values: ToolValues, id: string): boolean {
  return values[id] === true;
}

function hasRequiredNumbers(values: ToolValues, ids: string[]): boolean {
  return ids.every((id) => Number.isFinite(n(values, id)));
}

function missingResult(title = "入力待ち"): ToolResult {
  return {
    title,
    summary: "必要項目を入力してください。",
    tone: "neutral",
    details: ["未入力や数値でない項目がある場合、計算は実行しません。"],
  };
}

function checklistResult(
  groups: ChecklistGroupDefinition[],
  values: ToolValues,
  options?: {
    title?: string;
    cautions?: string[];
    references?: string[];
    todos?: string[];
  },
): ToolResult {
  const allItems = groups.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupTitle: group.title })),
  );
  const checked = allItems.filter((item) => b(values, item.id));
  const unchecked = allItems.filter((item) => !b(values, item.id));
  const highUnchecked = unchecked.filter((item) => item.priority === "high");
  const copyText = [
    `${options?.title ?? "チェックリスト"}: ${checked.length}/${allItems.length} 完了`,
    "",
    "未完了:",
    ...unchecked.map((item) => `- ${item.groupTitle}: ${item.label}`),
  ].join("\n");

  return {
    title: "チェック状況",
    summary: `${checked.length}/${allItems.length} 完了`,
    tone: highUnchecked.length > 0 ? "warning" : unchecked.length > 0 ? "neutral" : "success",
    details:
      unchecked.length > 0
        ? unchecked.slice(0, 8).map((item) => `未完了: ${item.groupTitle} - ${item.label}`)
        : ["主要項目はチェック済みです。"],
    interpretation: [
      "未完了項目を上から確認し、必要な診察・看護指示・連携に反映してください。",
    ],
    cautions: options?.cautions,
    references: options?.references,
    todos: options?.todos,
    copyText,
  };
}

function numericTodoTool(summary: string, details: string[], todos: string[]): ToolResult {
  return {
    title: "安全な雛形",
    summary,
    tone: "warning",
    details,
    interpretation: ["確定推奨ではなく、確認すべき論点を表示する雛形です。"],
    cautions: ["用量・治療方針は添付文書、施設薬剤部ルール、最新ガイドラインを優先してください。"],
    references: commonReferences,
    todos,
  };
}

export const miniToolDefinitions: ToolDefinition[] = [
  {
    id: "steroid-converter",
    title: "ステロイド換算ツール",
    purpose: "代表的ステロイド4剤の抗炎症作用換算を行う。",
    categoryIds: ["calculations", "medications"],
    tags: ["ステロイド", "換算", "薬剤"],
    fields: [
      {
        type: "select",
        id: "drug",
        label: "基準薬剤",
        options: steroidEquivalents.map((drug) => ({ value: drug.id, label: drug.name })),
      },
      { type: "number", id: "dose", label: "用量", unit: "mg", min: 0, step: 0.1 },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["dose"])) return missingResult();
      const from = steroidEquivalents.find((drug) => drug.id === s(values, "drug"));
      if (!from) return missingResult();
      const dose = n(values, "dose");
      const details = steroidEquivalents.map((to) => {
        const converted = calculateSteroidEquivalent(
          dose,
          from.equivalentDoseMg,
          to.equivalentDoseMg,
        );
        return `${to.name}: ${roundTo(converted, 2)} mg`;
      });

      return {
        title: "換算結果",
        summary: `${from.name} ${dose} mg の抗炎症作用換算`,
        tone: "success",
        details,
        interpretation: ["プレドニゾロン5 mg相当を基準にした抗炎症作用換算です。"],
        cautions: [
          "ミネラルコルチコイド作用、半減期、投与経路、病態による効果は別物です。",
          "パルス療法や長期漸減では、この単純換算だけで判断しないでください。",
        ],
        references: ["代表的なステロイド等価換算表に基づく抗炎症作用換算。"],
      };
    },
    referenceInfo: ["プレドニゾロン5 mg、メチルプレドニゾロン4 mg、ヒドロコルチゾン20 mg、デキサメタゾン0.75 mgを等価として扱う。"],
  },
  {
    id: "doac-dose-check",
    title: "腎機能別DOAC用量チェック",
    purpose: "Cockcroft-Gault CCrを計算し、DOAC確認項目を表示する。",
    categoryIds: ["medications", "calculations"],
    tags: ["DOAC", "CCr", "腎機能", "添付文書TODO"],
    fields: [
      { type: "number", id: "age", label: "年齢", unit: "歳", min: 0 },
      { type: "number", id: "weight", label: "体重", unit: "kg", min: 0, step: 0.1 },
      { type: "number", id: "scr", label: "血清Cr", unit: "mg/dL", min: 0, step: 0.01 },
      { type: "select", id: "sex", label: "性別", options: sexOptions },
      {
        type: "select",
        id: "indication",
        label: "適応疾患",
        options: [
          { value: "af", label: "非弁膜症性心房細動" },
          { value: "vte", label: "DVT/PE治療・再発予防" },
          { value: "other", label: "その他・未選択" },
        ],
      },
      {
        type: "select",
        id: "doac",
        label: "DOAC",
        options: doacRules.map((rule) => ({ value: rule.id, label: rule.name })),
      },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["age", "weight", "scr"])) return missingResult();
      const ccr = calculateCockcroftGault(
        n(values, "age"),
        n(values, "weight"),
        n(values, "scr"),
        s(values, "sex") === "female" ? "female" : "male",
      );
      const selected = doacRules.find((rule) => rule.id === s(values, "doac"));
      const indicationLabel =
        s(values, "indication") === "vte"
          ? "DVT/PE治療・再発予防"
          : s(values, "indication") === "other"
            ? "その他・未選択"
            : "非弁膜症性心房細動";

      return numericTodoTool(
        `推定CCr ${roundTo(ccr, 1)} mL/min`,
        [
          `適応: ${indicationLabel}`,
          selected ? `${selected.name}: ${selected.caution}` : "DOACを選択してください。",
          "用量は未確認値をハードコードしていません。",
        ],
        selected?.todoItems ?? ["TODO: verify DOAC table with Japanese package insert"],
      );
    },
    referenceInfo: commonReferences,
  },
  {
    id: "renal-function",
    title: "CCr / eGFR / Cockcroft-Gault計算",
    purpose: "年齢、性別、体重、血清CrからCockcroft-Gault CCrを計算する。",
    categoryIds: ["calculations"],
    tags: ["CCr", "eGFR", "腎機能"],
    fields: [
      { type: "number", id: "age", label: "年齢", unit: "歳", min: 0 },
      { type: "select", id: "sex", label: "性別", options: sexOptions },
      { type: "number", id: "weight", label: "体重", unit: "kg", min: 0, step: 0.1 },
      { type: "number", id: "scr", label: "血清Cr", unit: "mg/dL", min: 0, step: 0.01 },
      {
        type: "number",
        id: "egfr",
        label: "eGFR入力欄",
        unit: "mL/min/1.73m²",
        min: 0,
        step: 0.1,
        help: "必要時の比較用。CCr計算には使いません。",
      },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["age", "weight", "scr"])) return missingResult();
      const ccr = calculateCockcroftGault(
        n(values, "age"),
        n(values, "weight"),
        n(values, "scr"),
        s(values, "sex") === "female" ? "female" : "male",
      );
      const egfr = n(values, "egfr");

      return {
        title: "腎機能",
        summary: `Cockcroft-Gault CCr ${roundTo(ccr, 1)} mL/min`,
        tone: ccr < 30 ? "warning" : "success",
        details: [
          `式: ((140 - 年齢) × 体重) / (72 × Scr) × ${s(values, "sex") === "female" ? "0.85" : "1"}`,
          Number.isFinite(egfr) ? `入力eGFR: ${egfr} mL/min/1.73m²` : "eGFRは未入力です。",
        ],
        interpretation: ["薬剤投与量確認では、eGFRではなくCCr指定の薬剤があるため添付文書を確認してください。"],
        cautions: ["肥満、低体重、サルコペニアでは推定値の解釈に注意が必要です。"],
        references: ["Cockcroft-Gault式。"],
      };
    },
    referenceInfo: ["Cockcroft-Gault式。"],
  },
  {
    id: "sodium-correction",
    title: "Na補正式ツール",
    purpose: "血糖補正Na、自由水欠乏量の概算、低Na補正の注意点を表示する。",
    categoryIds: ["calculations", "emergency"],
    tags: ["Na", "高Na", "低Na", "救急"],
    fields: [
      { type: "number", id: "na", label: "実測Na", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "glucose", label: "血糖", unit: "mg/dL", min: 0 },
      { type: "number", id: "weight", label: "体重", unit: "kg", min: 0, step: 0.1 },
      { type: "select", id: "sex", label: "性別", options: sexOptions },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["na", "glucose", "weight"])) return missingResult();
      const corrected = calculateCorrectedSodium(n(values, "na"), n(values, "glucose"));
      const deficit = calculateFreeWaterDeficit(
        corrected,
        n(values, "weight"),
        s(values, "sex") === "female" ? "female" : "male",
      );

      return {
        title: "Na評価",
        summary: `血糖補正Na ${roundTo(corrected, 1)} mEq/L`,
        tone: corrected < 130 || corrected > 150 ? "warning" : "neutral",
        details: [
          "補正式: Na + 1.6 × ((血糖 - 100) / 100)",
          Number.isFinite(deficit)
            ? `高Naの自由水欠乏量概算: ${roundTo(deficit, 1)} L`
            : "高Naでない場合、自由水欠乏量は表示しません。",
        ],
        interpretation: ["低Naでは症状、慢性/急性、体液量、薬剤、内分泌を合わせて評価してください。"],
        cautions: ["低Naの急速補正はODSリスクがあります。", "3%食塩水の詳細投与量は施設プロトコル確認のTODOです。"],
        todos: ["TODO: verify local protocol for hypertonic saline dosing and correction limits"],
        references: commonReferences,
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "blood-gas",
    title: "血液ガス簡易解釈ツール",
    purpose: "pH、PaCO2、HCO3、電解質から酸塩基異常を簡易判定する。",
    categoryIds: ["calculations", "emergency"],
    tags: ["血液ガス", "酸塩基", "AG", "教育"],
    fields: [
      { type: "number", id: "ph", label: "pH", step: 0.01 },
      { type: "number", id: "paco2", label: "PaCO2", unit: "mmHg", step: 0.1 },
      { type: "number", id: "hco3", label: "HCO3", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "na", label: "Na", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "cl", label: "Cl", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "alb", label: "Alb", unit: "g/dL", step: 0.1 },
      { type: "number", id: "lactate", label: "Lactate", unit: "mmol/L", step: 0.1 },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["ph", "paco2", "hco3", "na", "cl", "alb"])) {
        return missingResult();
      }
      const ph = n(values, "ph");
      const paco2 = n(values, "paco2");
      const hco3 = n(values, "hco3");
      const ag = calculateAnionGap(n(values, "na"), n(values, "cl"), hco3);
      const correctedAg = calculateAlbuminCorrectedAnionGap(ag, n(values, "alb"));
      const acidBase = ph < 7.35 ? "アシデミア" : ph > 7.45 ? "アルカレミア" : "pHはおおむね正常域";
      const drivers = [
        hco3 < 22 ? "代謝性アシドーシス方向" : hco3 > 26 ? "代謝性アルカローシス方向" : "",
        paco2 > 45 ? "呼吸性アシドーシス方向" : paco2 < 35 ? "呼吸性アルカローシス方向" : "",
      ].filter(Boolean);
      const expectedPaco2 = 1.5 * hco3 + 8;

      return {
        title: "酸塩基の概略",
        summary: acidBase,
        tone: ph < 7.2 || ph > 7.55 ? "danger" : "warning",
        details: [
          `推定主病態: ${drivers.length > 0 ? drivers.join(" / ") : "単純判定では明確でない"}`,
          `AG ${roundTo(ag, 1)} / Alb補正AG ${roundTo(correctedAg, 1)}`,
          `代謝性アシドーシス時のWinter式目安 PaCO2 ${roundTo(expectedPaco2 - 2, 1)}-${roundTo(expectedPaco2 + 2, 1)} mmHg`,
          Number.isFinite(n(values, "lactate")) ? `Lactate ${n(values, "lactate")} mmol/L` : "Lactate未入力",
        ],
        interpretation: ["pHが正常でも複合性酸塩基異常が隠れることがあります。"],
        cautions: ["本ツールは教育用の簡易判定です。臨床状況、呼吸状態、腎機能、乳酸、ケトンを合わせて確認してください。"],
        references: ["AG、Alb補正AG、Winter式の簡易コメント。"],
      };
    },
    referenceInfo: ["酸塩基評価の代表的ステップ。"],
  },
  {
    id: "anion-gap",
    title: "アニオンギャップ計算ツール",
    purpose: "Na、Cl、HCO3、AlbからAGとAlb補正AGを計算する。",
    categoryIds: ["calculations"],
    tags: ["AG", "代謝性アシドーシス"],
    fields: [
      { type: "number", id: "na", label: "Na", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "cl", label: "Cl", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "hco3", label: "HCO3", unit: "mEq/L", step: 0.1 },
      { type: "number", id: "alb", label: "Alb", unit: "g/dL", step: 0.1 },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["na", "cl", "hco3", "alb"])) return missingResult();
      const ag = calculateAnionGap(n(values, "na"), n(values, "cl"), n(values, "hco3"));
      const correctedAg = calculateAlbuminCorrectedAnionGap(ag, n(values, "alb"));
      return {
        title: "AG",
        summary: `AG ${roundTo(ag, 1)} / 補正AG ${roundTo(correctedAg, 1)}`,
        tone: correctedAg >= 16 ? "warning" : "neutral",
        details: [
          "AG = Na - Cl - HCO3",
          "Alb補正AG = AG + 2.5 × (4 - Alb)",
          correctedAg >= 16 ? "HAGMAを考える値です。" : "補正AGは大きく上昇していません。",
        ],
        interpretation: ["HAGMA: 乳酸、ケトン、腎不全、薬物/毒物など。NAGMA: 下痢、尿細管性アシドーシス、輸液など。"],
        cautions: ["鑑別は病歴、血液ガス、乳酸、ケトン、腎機能と合わせてください。"],
        references: ["AGとAlb補正式。"],
      };
    },
    referenceInfo: ["AG = Na - Cl - HCO3。Alb補正AG = AG + 2.5 × (4 - Alb)。"],
  },
  {
    id: "pneumonia-severity",
    title: "肺炎重症度スコア",
    purpose: "CURB-65とA-DROPをチェックボックスで計算する。",
    categoryIds: ["scores", "emergency", "outpatient"],
    tags: ["肺炎", "CURB-65", "A-DROP"],
    fields: [
      { type: "checkbox", id: "confusion", label: "意識障害" },
      { type: "checkbox", id: "urea", label: "BUN高値 / 脱水所見" },
      { type: "checkbox", id: "rr", label: "呼吸数上昇" },
      { type: "checkbox", id: "bp", label: "血圧低下" },
      { type: "checkbox", id: "age65", label: "65歳以上" },
      { type: "checkbox", id: "spo2", label: "SpO2低下または酸素化不良" },
    ],
    calculate(values) {
      const curb = ["confusion", "urea", "rr", "bp", "age65"].filter((id) => b(values, id)).length;
      const adrop = ["age65", "urea", "spo2", "confusion", "bp"].filter((id) => b(values, id)).length;
      return {
        title: "肺炎重症度",
        summary: `CURB-65 ${curb}点 / A-DROP ${adrop}点`,
        tone: curb >= 3 || adrop >= 3 ? "warning" : "neutral",
        details: [
          curb <= 1 ? "CURB-65は低め" : curb === 2 ? "CURB-65は中等度" : "CURB-65は高め",
          adrop <= 1 ? "A-DROPは軽症域の目安" : adrop === 2 ? "A-DROPは中等症域の目安" : "A-DROPは重症域の目安",
        ],
        interpretation: ["入院・外来判断の補助です。酸素需要、ADL、誤嚥リスク、社会背景、敗血症を合わせて判断してください。"],
        cautions: ["重症感や循環不安定があれば、スコアに依存しないでください。"],
        references: ["CURB-65、A-DROPの項目を簡略化した入力。"],
      };
    },
    referenceInfo: ["CURB-65とA-DROP。"],
  },
  {
    id: "centor-mcisaac",
    title: "Centor / McIsaacスコア",
    purpose: "急性咽頭痛でGAS咽頭炎リスク評価を補助する。",
    categoryIds: ["scores", "outpatient"],
    tags: ["咽頭痛", "GAS", "Centor", "McIsaac"],
    fields: [
      { type: "checkbox", id: "fever", label: "発熱" },
      { type: "checkbox", id: "noCough", label: "咳がない" },
      { type: "checkbox", id: "tenderNodes", label: "前頸部リンパ節圧痛" },
      { type: "checkbox", id: "tonsillarExudate", label: "扁桃腫大または白苔" },
      {
        type: "select",
        id: "ageGroup",
        label: "年齢補正",
        options: [
          { value: "under15", label: "3-14歳 +1" },
          { value: "15to44", label: "15-44歳 0" },
          { value: "45plus", label: "45歳以上 -1" },
        ],
      },
    ],
    calculate(values) {
      const result = calculateCentorMcIsaac({
        fever: b(values, "fever"),
        noCough: b(values, "noCough"),
        tenderNodes: b(values, "tenderNodes"),
        tonsillarExudate: b(values, "tonsillarExudate"),
        ageGroup: s(values, "ageGroup") === "under15" ? "under15" : s(values, "ageGroup") === "45plus" ? "45plus" : "15to44",
      });
      const action =
        result.mcIsaac <= 1
          ? "GAS可能性は低め。検査適応は施設方針で判断。"
          : result.mcIsaac <= 3
            ? "迅速検査を検討する層。"
            : "GASリスク高め。迅速検査・治療方針を施設ルールで確認。";
      return {
        title: "スコア",
        summary: `Centor ${result.centor}点 / McIsaac ${result.mcIsaac}点`,
        tone: result.mcIsaac >= 4 ? "warning" : "neutral",
        details: [action],
        interpretation: ["地域流行、年齢、曝露歴、猩紅熱所見、重症感を合わせて判断してください。"],
        cautions: ["地域・施設の迅速検査方針を優先してください。"],
        references: ["Centor基準とMcIsaac年齢補正。"],
      };
    },
    referenceInfo: ["Centor/McIsaacスコア。"],
  },
  {
    id: "pe-wells-perc",
    title: "Wells / PERC / D-dimer判断ツール",
    purpose: "肺塞栓疑いの検査前確率、PERC、年齢調整D-dimerを整理する。",
    categoryIds: ["scores", "emergency"],
    tags: ["PE", "Wells", "PERC", "D-dimer"],
    fields: [
      { type: "checkbox", id: "dvtSigns", label: "DVT徴候 3点" },
      { type: "checkbox", id: "peLikely", label: "PEが最も疑わしい 3点" },
      { type: "checkbox", id: "hr100", label: "HR > 100 1.5点" },
      { type: "checkbox", id: "immob", label: "固定/手術 1.5点" },
      { type: "checkbox", id: "prior", label: "DVT/PE既往 1.5点" },
      { type: "checkbox", id: "hemoptysis", label: "血痰 1点" },
      { type: "checkbox", id: "cancer", label: "悪性腫瘍 1点" },
      { type: "number", id: "age", label: "年齢", unit: "歳", min: 0 },
      { type: "number", id: "ddimer", label: "D-dimer", unit: "ng/mL FEU", min: 0 },
      { type: "checkbox", id: "percPositive", label: "PERC項目に1つでも該当" },
      { type: "checkbox", id: "unstable", label: "循環不安定・高リスク所見" },
    ],
    calculate(values) {
      const wells =
        Number(b(values, "dvtSigns")) * 3 +
        Number(b(values, "peLikely")) * 3 +
        Number(b(values, "hr100")) * 1.5 +
        Number(b(values, "immob")) * 1.5 +
        Number(b(values, "prior")) * 1.5 +
        Number(b(values, "hemoptysis")) +
        Number(b(values, "cancer"));
      const age = n(values, "age");
      const threshold = Number.isFinite(age) && age > 50 ? age * 10 : 500;
      const ddimer = n(values, "ddimer");
      return {
        title: "PE初期評価",
        summary: `Wells ${wells}点`,
        tone: b(values, "unstable") || wells > 4 ? "warning" : "neutral",
        details: [
          wells <= 4 ? "WellsはPE unlikely相当の目安。" : "WellsはPE likely相当の目安。",
          b(values, "percPositive") ? "PERC陽性項目があります。" : "PERC陽性項目は未チェックです。",
          Number.isFinite(ddimer) ? `年齢調整D-dimer目安: ${threshold} ng/mL FEU / 入力値 ${ddimer}` : `年齢調整D-dimer目安: ${threshold} ng/mL FEU`,
        ],
        interpretation: ["検査前確率の見積もりが重要です。低リスクでPERC陰性なら追加検査回避を検討する文脈があります。"],
        cautions: ["高リスク・不安定例ではスコアに依存せず、緊急評価を優先してください。"],
        references: ["Wells PE、PERC、年齢調整D-dimerの代表的運用。"],
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "heart-score",
    title: "HEARTスコア",
    purpose: "胸痛患者のACSリスク評価を補助する。",
    categoryIds: ["scores", "emergency"],
    tags: ["胸痛", "ACS", "HEART"],
    fields: [
      { type: "select", id: "history", label: "History", options: [{ value: "0", label: "軽度 0" }, { value: "1", label: "中等度 1" }, { value: "2", label: "高度 2" }] },
      { type: "select", id: "ecg", label: "ECG", options: [{ value: "0", label: "正常 0" }, { value: "1", label: "非特異的変化 1" }, { value: "2", label: "有意なST変化 2" }] },
      { type: "select", id: "age", label: "Age", options: [{ value: "0", label: "<45歳 0" }, { value: "1", label: "45-64歳 1" }, { value: "2", label: "65歳以上 2" }] },
      { type: "select", id: "risk", label: "Risk factors", options: [{ value: "0", label: "なし 0" }, { value: "1", label: "1-2個 1" }, { value: "2", label: "3個以上または既知冠動脈疾患 2" }] },
      { type: "select", id: "troponin", label: "Troponin", options: [{ value: "0", label: "正常 0" }, { value: "1", label: "1-3倍 1" }, { value: "2", label: ">3倍 2" }] },
    ],
    calculate(values) {
      const score = ["history", "ecg", "age", "risk", "troponin"].reduce(
        (sum, id) => sum + Number(s(values, id)),
        0,
      );
      return {
        title: "HEART",
        summary: `${score}点`,
        tone: score >= 7 ? "danger" : score >= 4 ? "warning" : "success",
        details: [
          score <= 3 ? "低リスク層の目安。" : score <= 6 ? "中等度リスク層の目安。" : "高リスク層の目安。",
        ],
        interpretation: ["胸痛経過、心電図変化、連続トロポニン、鑑別疾患を合わせて判断してください。"],
        cautions: ["トロポニン基準は施設測定系に依存します。"],
        references: ["HEART score。"],
      };
    },
    referenceInfo: ["HEART score。"],
  },
  {
    id: "af-risk",
    title: "CHA₂DS₂-VASc / HAS-BLED",
    purpose: "心房細動における脳梗塞リスクと出血リスクを同時に整理する。",
    categoryIds: ["scores", "medications"],
    tags: ["心房細動", "抗凝固", "CHA2DS2-VASc", "HAS-BLED"],
    fields: [
      { type: "checkbox", id: "heartFailure", label: "心不全" },
      { type: "checkbox", id: "hypertension", label: "高血圧" },
      { type: "checkbox", id: "age75", label: "75歳以上" },
      { type: "checkbox", id: "diabetes", label: "糖尿病" },
      { type: "checkbox", id: "strokeTia", label: "脳卒中/TIA/塞栓症既往" },
      { type: "checkbox", id: "vascularDisease", label: "血管疾患" },
      { type: "checkbox", id: "age65to74", label: "65-74歳" },
      { type: "checkbox", id: "female", label: "女性" },
      { type: "checkbox", id: "abnormalRenal", label: "腎機能障害" },
      { type: "checkbox", id: "abnormalLiver", label: "肝機能障害" },
      { type: "checkbox", id: "bleeding", label: "出血既往/素因" },
      { type: "checkbox", id: "labileInr", label: "INR不安定" },
      { type: "checkbox", id: "drugs", label: "出血リスク薬" },
      { type: "checkbox", id: "alcohol", label: "アルコール" },
    ],
    calculate(values) {
      const cha = calculateCha2ds2VascScore({
        heartFailure: b(values, "heartFailure"),
        hypertension: b(values, "hypertension"),
        age75: b(values, "age75"),
        diabetes: b(values, "diabetes"),
        strokeTia: b(values, "strokeTia"),
        vascularDisease: b(values, "vascularDisease"),
        age65to74: b(values, "age65to74"),
        female: b(values, "female"),
      });
      const hasBled = calculateHasBledScore({
        hypertension: b(values, "hypertension"),
        abnormalRenal: b(values, "abnormalRenal"),
        abnormalLiver: b(values, "abnormalLiver"),
        stroke: b(values, "strokeTia"),
        bleeding: b(values, "bleeding"),
        labileInr: b(values, "labileInr"),
        elderly: b(values, "age75") || b(values, "age65to74"),
        drugs: b(values, "drugs"),
        alcohol: b(values, "alcohol"),
      });
      return {
        title: "AFリスク",
        summary: `CHA₂DS₂-VASc ${cha}点 / HAS-BLED ${hasBled}点`,
        tone: hasBled >= 3 ? "warning" : "neutral",
        details: [
          "CHA₂DS₂-VAScは脳梗塞リスク評価、HAS-BLEDは出血リスク確認の補助です。",
          hasBled >= 3 ? "出血リスク因子の是正可能項目を確認してください。" : "出血リスク因子を継続確認してください。",
        ],
        interpretation: ["抗凝固の最終判断は年齢、腎機能、出血歴、患者価値観を含めて行います。"],
        cautions: ["スコア単独で抗凝固開始・中止を決めないでください。"],
        references: ["CHA₂DS₂-VASc、HAS-BLED。"],
      };
    },
    referenceInfo: ["CHA₂DS₂-VASc、HAS-BLED。"],
  },
  {
    id: "chads-comparison",
    title: "CHADS₂ / CHA₂DS₂-VASc比較表示",
    purpose: "同じ入力からCHADS2とCHA2DS2-VAScを同時に表示する。",
    categoryIds: ["scores"],
    tags: ["心房細動", "CHADS2", "教育"],
    fields: [
      { type: "checkbox", id: "heartFailure", label: "心不全" },
      { type: "checkbox", id: "hypertension", label: "高血圧" },
      { type: "checkbox", id: "age75", label: "75歳以上" },
      { type: "checkbox", id: "diabetes", label: "糖尿病" },
      { type: "checkbox", id: "strokeTia", label: "脳卒中/TIA/塞栓症既往" },
      { type: "checkbox", id: "vascularDisease", label: "血管疾患" },
      { type: "checkbox", id: "age65to74", label: "65-74歳" },
      { type: "checkbox", id: "female", label: "女性" },
    ],
    calculate(values) {
      const chads = calculateChads2Score({
        heartFailure: b(values, "heartFailure"),
        hypertension: b(values, "hypertension"),
        age75: b(values, "age75"),
        diabetes: b(values, "diabetes"),
        strokeTia: b(values, "strokeTia"),
      });
      const cha = calculateCha2ds2VascScore({
        heartFailure: b(values, "heartFailure"),
        hypertension: b(values, "hypertension"),
        age75: b(values, "age75"),
        diabetes: b(values, "diabetes"),
        strokeTia: b(values, "strokeTia"),
        vascularDisease: b(values, "vascularDisease"),
        age65to74: b(values, "age65to74"),
        female: b(values, "female"),
      });
      return {
        title: "比較",
        summary: `CHADS₂ ${chads}点 / CHA₂DS₂-VASc ${cha}点`,
        tone: "neutral",
        details: ["CHA₂DS₂-VAScでは血管疾患、65-74歳、女性が追加評価されます。"],
        interpretation: ["教育用の比較表示です。実臨床では最新の抗凝固方針を確認してください。"],
        references: ["CHADS₂、CHA₂DS₂-VASc。"],
      };
    },
    referenceInfo: ["CHADS₂、CHA₂DS₂-VASc。"],
  },
  {
    id: "child-pugh",
    title: "Child-Pugh分類",
    purpose: "Bil、Alb、PT-INR、腹水、脳症からChild-Pugh分類を計算する。",
    categoryIds: ["scores"],
    tags: ["肝硬変", "Child-Pugh"],
    fields: [
      { type: "number", id: "bilirubin", label: "Bil", unit: "mg/dL", step: 0.1 },
      { type: "number", id: "albumin", label: "Alb", unit: "g/dL", step: 0.1 },
      { type: "number", id: "inr", label: "PT-INR", step: 0.01 },
      { type: "select", id: "ascites", label: "腹水", options: [{ value: "1", label: "なし 1" }, { value: "2", label: "軽度/治療反応あり 2" }, { value: "3", label: "中等度以上/難治 3" }] },
      { type: "select", id: "encephalopathy", label: "脳症", options: [{ value: "1", label: "なし 1" }, { value: "2", label: "Grade I-II 2" }, { value: "3", label: "Grade III-IV 3" }] },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["bilirubin", "albumin", "inr"])) return missingResult();
      const result = calculateChildPughScore({
        bilirubin: n(values, "bilirubin"),
        albumin: n(values, "albumin"),
        inr: n(values, "inr"),
        ascitesPoints: Number(s(values, "ascites")),
        encephalopathyPoints: Number(s(values, "encephalopathy")),
      });
      return {
        title: "Child-Pugh",
        summary: `${result.score}点 / Class ${result.classification}`,
        tone: result.classification === "C" ? "warning" : "neutral",
        details: ["腹水・脳症は主観項目を含みます。"],
        interpretation: ["肝予備能の把握の補助として使います。"],
        cautions: ["主観項目があるため臨床判断が必要です。"],
        references: ["Child-Pugh分類。"],
      };
    },
    referenceInfo: ["Child-Pugh分類。"],
  },
  {
    id: "fib4",
    title: "FIB-4 index",
    purpose: "年齢、AST、ALT、血小板からFIB-4を計算する。",
    categoryIds: ["calculations", "outpatient"],
    tags: ["肝線維化", "FIB-4"],
    fields: [
      { type: "number", id: "age", label: "年齢", unit: "歳", min: 0 },
      { type: "number", id: "ast", label: "AST", unit: "U/L", min: 0 },
      { type: "number", id: "alt", label: "ALT", unit: "U/L", min: 0 },
      { type: "number", id: "platelet", label: "血小板", unit: "10^4/µL", min: 0, step: 0.1 },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["age", "ast", "alt", "platelet"])) return missingResult();
      const fib4 = calculateFib4(n(values, "age"), n(values, "ast"), n(values, "alt"), n(values, "platelet"));
      return {
        title: "FIB-4",
        summary: `${roundTo(fib4, 2)}`,
        tone: fib4 >= 2.67 ? "warning" : fib4 < 1.3 ? "success" : "neutral",
        details: [
          "式: 年齢 × AST / (血小板 × √ALT)",
          fib4 < 1.3 ? "低リスク目安。" : fib4 <= 2.67 ? "中間域目安。" : "高リスク目安。",
        ],
        interpretation: ["肝線維化リスクの拾い上げに使います。"],
        cautions: ["高齢者では偽陽性が増えやすく、年齢による解釈に注意してください。"],
        references: ["FIB-4 index。"],
      };
    },
    referenceInfo: ["FIB-4 index。"],
  },
  {
    id: "meld-na",
    title: "MELD-Na計算",
    purpose: "Bil、INR、Cr、NaからMELD-Naを計算する。",
    categoryIds: ["calculations"],
    tags: ["肝硬変", "MELD-Na"],
    fields: [
      { type: "number", id: "bilirubin", label: "Bil", unit: "mg/dL", step: 0.1 },
      { type: "number", id: "inr", label: "INR", step: 0.01 },
      { type: "number", id: "creatinine", label: "Cr", unit: "mg/dL", step: 0.01 },
      { type: "number", id: "sodium", label: "Na", unit: "mEq/L", step: 0.1 },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["bilirubin", "inr", "creatinine", "sodium"])) return missingResult();
      const meldNa = calculateMeldNa({
        bilirubin: n(values, "bilirubin"),
        inr: n(values, "inr"),
        creatinine: n(values, "creatinine"),
        sodium: n(values, "sodium"),
      });
      return {
        title: "MELD-Na",
        summary: `${Math.round(meldNa)}点`,
        tone: meldNa >= 25 ? "warning" : "neutral",
        details: ["Bil/INR/Crは下限1.0、Cr上限4.0、Naは125-137に丸めて計算しています。"],
        interpretation: ["重症度把握の補助です。"],
        cautions: ["肝移植適応そのものを判断しません。"],
        references: ["MELD-Na式。"],
      };
    },
    referenceInfo: ["MELD-Na式。"],
  },
  {
    id: "sepsis-scores",
    title: "qSOFA / SIRS / NEWS2",
    purpose: "病棟急変や救急初期評価で使うスコアを同時表示する。",
    categoryIds: ["scores", "emergency", "ward"],
    tags: ["敗血症", "急変", "NEWS2", "SIRS"],
    fields: [
      { type: "number", id: "rr", label: "呼吸数", unit: "/min", min: 0 },
      { type: "number", id: "spo2", label: "SpO2", unit: "%", min: 0, max: 100 },
      { type: "checkbox", id: "oxygen", label: "酸素投与あり" },
      { type: "number", id: "sbp", label: "収縮期血圧", unit: "mmHg", min: 0 },
      { type: "number", id: "hr", label: "心拍数", unit: "/min", min: 0 },
      { type: "number", id: "temp", label: "体温", unit: "℃", step: 0.1 },
      { type: "number", id: "wbc", label: "WBC", unit: "/µL", min: 0 },
      { type: "checkbox", id: "mental", label: "意識変容あり" },
    ],
    calculate(values) {
      if (!hasRequiredNumbers(values, ["rr", "spo2", "sbp", "hr", "temp", "wbc"])) return missingResult();
      const qsofa = Number(n(values, "rr") >= 22) + Number(n(values, "sbp") <= 100) + Number(b(values, "mental"));
      const sirs =
        Number(n(values, "temp") > 38 || n(values, "temp") < 36) +
        Number(n(values, "hr") > 90) +
        Number(n(values, "rr") > 20) +
        Number(n(values, "wbc") > 12000 || n(values, "wbc") < 4000);
      const news2 =
        (n(values, "rr") <= 8 || n(values, "rr") >= 25 ? 3 : n(values, "rr") >= 21 ? 2 : n(values, "rr") >= 12 ? 0 : 1) +
        (n(values, "spo2") <= 91 ? 3 : n(values, "spo2") <= 93 ? 2 : n(values, "spo2") <= 95 ? 1 : 0) +
        Number(b(values, "oxygen")) * 2 +
        (n(values, "sbp") <= 90 || n(values, "sbp") >= 220 ? 3 : n(values, "sbp") <= 100 ? 2 : n(values, "sbp") <= 110 ? 1 : 0) +
        (n(values, "hr") <= 40 || n(values, "hr") >= 131 ? 3 : n(values, "hr") >= 111 ? 2 : n(values, "hr") <= 50 || n(values, "hr") >= 91 ? 1 : 0) +
        (n(values, "temp") <= 35 || n(values, "temp") >= 39.1 ? 3 : n(values, "temp") >= 38.1 ? 1 : n(values, "temp") <= 36 ? 1 : 0) +
        Number(b(values, "mental")) * 3;
      return {
        title: "急変スコア",
        summary: `qSOFA ${qsofa} / SIRS ${sirs} / NEWS2 ${news2}`,
        tone: news2 >= 7 || qsofa >= 2 ? "danger" : news2 >= 5 ? "warning" : "neutral",
        details: ["NEWS2は酸素投与あり/なしを加味しています。"],
        interpretation: ["病棟急変の初期評価とエスカレーション判断の補助です。"],
        cautions: ["敗血症診断や治療開始をスコアだけで決めないでください。"],
        references: ["qSOFA、SIRS、NEWS2。"],
      };
    },
    referenceInfo: ["qSOFA、SIRS、NEWS2。"],
  },
  {
    id: "dic-score",
    title: "DICスコア雛形",
    purpose: "DIC評価に必要な入力を整理し、施設採用基準確認を促す。",
    categoryIds: ["scores", "emergency"],
    tags: ["DIC", "TODO", "救急"],
    fields: [
      { type: "number", id: "platelet", label: "血小板", unit: "10^4/µL", step: 0.1 },
      { type: "number", id: "ptInr", label: "PT-INR", step: 0.01 },
      { type: "number", id: "fdp", label: "FDP / D-dimer", step: 0.1 },
      { type: "number", id: "fibrinogen", label: "フィブリノゲン", unit: "mg/dL", step: 1 },
    ],
    calculate() {
      return numericTodoTool(
        "DICスコアは未確定ロジックです",
        ["ISTH DICまたは日本救急医学会DICなど、施設採用基準が異なります。", "未確認の点数表はハードコードしていません。"],
        ["TODO: choose institutional DIC scoring system", "TODO: verify exact point table before implementation"],
      );
    },
    referenceInfo: commonReferences,
  },
  {
    id: "constipation",
    title: "便秘薬・下剤選択支援",
    purpose: "便秘の背景から候補薬と避けたい選択肢を整理する。",
    categoryIds: ["ward", "geriatric", "medications"],
    tags: ["便秘", "下剤", "高齢者"],
    fields: [
      { type: "checkbox", id: "renal", label: "腎機能低下" },
      { type: "checkbox", id: "opioid", label: "オピオイド使用" },
      { type: "checkbox", id: "bedbound", label: "寝たきり" },
      { type: "checkbox", id: "ileus", label: "イレウス疑い" },
      { type: "checkbox", id: "impaction", label: "便塞栓疑い" },
    ],
    calculate(values) {
      const avoid = [
        b(values, "renal") ? "Mg製剤は高Mg血症に注意" : "",
        b(values, "ileus") ? "腹膜刺激症状・イレウス疑いでは下剤追加より医師評価優先" : "",
      ].filter(Boolean);
      const candidates = [
        "浸透圧性下剤",
        b(values, "opioid") ? "オピオイド誘発便秘への対応を検討" : "",
        b(values, "impaction") ? "便塞栓なら坐薬・摘便・浣腸の適応確認" : "",
        b(values, "bedbound") ? "体動低下・水分・食事量・排便姿勢を確認" : "",
      ].filter(Boolean);
      return {
        title: "候補整理",
        summary: b(values, "ileus") ? "警告項目あり" : "候補を確認",
        tone: b(values, "ileus") ? "danger" : "neutral",
        details: [...candidates, ...avoid],
        interpretation: ["便秘の原因、閉塞・便塞栓・薬剤性を先に確認します。"],
        cautions: ["腹膜刺激症状・イレウス疑いでは医師評価を優先してください。"],
        references: commonReferences,
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "delirium-risk-meds",
    title: "不眠薬・せん妄リスク薬チェック",
    purpose: "高齢者のせん妄リスク薬と非薬物療法を整理する。",
    categoryIds: ["geriatric", "medications", "ward"],
    tags: ["せん妄", "不眠薬", "高齢者"],
    fields: [
      { type: "checkbox", id: "bzd", label: "BZD" },
      { type: "checkbox", id: "zdrug", label: "Z-drug" },
      { type: "checkbox", id: "anticholinergic", label: "抗コリン薬" },
      { type: "checkbox", id: "h1", label: "H1 blocker" },
      { type: "checkbox", id: "antipsychotic", label: "抗精神病薬" },
    ],
    calculate(values) {
      const checked = ["bzd", "zdrug", "anticholinergic", "h1", "antipsychotic"].filter((id) => b(values, id));
      return {
        title: "せん妄リスク",
        summary: checked.length > 0 ? `${checked.length}カテゴリに注意` : "リスク薬チェック未選択",
        tone: checked.length > 0 ? "warning" : "neutral",
        details: [
          "睡眠環境、疼痛、尿閉、便秘、低酸素、感染、脱水を確認。",
          "昼夜リズム、眼鏡・補聴器、家族情報、離床を検討。",
        ],
        interpretation: ["薬剤はせん妄の修正可能因子です。"],
        cautions: ["高齢者では漫然投与を避け、必要最小限・短期間を意識してください。"],
        references: commonReferences,
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "antibiotic-renal-dose",
    title: "抗菌薬腎機能用量チェック",
    purpose: "主要抗菌薬の腎機能別用量確認が必要かを表示する。",
    categoryIds: ["medications"],
    tags: ["抗菌薬", "感染症", "腎機能", "TODO"],
    fields: [
      { type: "number", id: "ccr", label: "CCr", unit: "mL/min", min: 0, step: 0.1 },
      {
        type: "select",
        id: "antibiotic",
        label: "抗菌薬",
        options: antibioticRenalDosing.map((row) => ({ value: row.id, label: row.name })),
      },
    ],
    calculate(values) {
      const row = antibioticRenalDosing.find((item) => item.id === s(values, "antibiotic"));
      return numericTodoTool(
        row ? `${row.name}: 用量表確認が必要` : "抗菌薬を選択",
        [
          Number.isFinite(n(values, "ccr")) ? `入力CCr ${n(values, "ccr")} mL/min` : "CCr未入力",
          row ? `腎機能調整: ${row.renalAdjustment}` : "抗菌薬未選択",
          "実投与量は表示しません。",
        ],
        [row?.todo ?? "TODO: verify renal dosing table"],
      );
    },
    referenceInfo: commonReferences,
  },
  {
    id: "oral-switch",
    title: "抗菌薬内服スイッチ候補",
    purpose: "感染臓器、培養、解熱、経口摂取から内服スイッチ候補を整理する。",
    categoryIds: ["medications", "ward"],
    tags: ["感染症", "抗菌薬", "内服スイッチ"],
    fields: [
      { type: "select", id: "site", label: "感染臓器", options: [{ value: "pneumonia", label: "肺炎" }, { value: "uti", label: "尿路感染" }, { value: "biliary", label: "胆道感染" }, { value: "ssti", label: "皮膚軟部組織感染" }] },
      { type: "checkbox", id: "culture", label: "培養・感受性が確認できる" },
      { type: "checkbox", id: "afebrile", label: "解熱傾向" },
      { type: "checkbox", id: "oral", label: "経口摂取可能" },
      { type: "checkbox", id: "stable", label: "循環・呼吸が安定" },
    ],
    calculate(values) {
      const ready = b(values, "culture") && b(values, "afebrile") && b(values, "oral") && b(values, "stable");
      return {
        title: "内服スイッチ",
        summary: ready ? "候補検討可能な条件がそろっています" : "未確認条件があります",
        tone: ready ? "success" : "warning",
        details: [
          "候補薬は感染臓器、培養・感受性、重症度、吸収、相互作用で決めます。",
          "この画面では具体的な薬剤量を確定推奨しません。",
        ],
        interpretation: ["候補提示であり確定推奨ではありません。"],
        cautions: ["培養・感受性・重症度を優先してください。"],
        references: commonReferences,
        todos: ["TODO: verify institution-specific oral switch candidates by infection site"],
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "warfarin",
    title: "ワルファリン開始・調整メモ",
    purpose: "開始・調整時の注意因子を表示する。",
    categoryIds: ["medications"],
    tags: ["ワルファリン", "PT-INR"],
    fields: [
      { type: "number", id: "age", label: "年齢", unit: "歳", min: 0 },
      { type: "number", id: "weight", label: "体重", unit: "kg", min: 0, step: 0.1 },
      { type: "checkbox", id: "liver", label: "肝機能障害" },
      { type: "checkbox", id: "interaction", label: "相互作用薬あり" },
      { type: "select", id: "target", label: "目標PT-INR", options: [{ value: "low", label: "低め目標" }, { value: "standard", label: "標準目標" }, { value: "other", label: "その他" }] },
    ],
    calculate(values) {
      return {
        title: "開始・調整メモ",
        summary: b(values, "liver") || b(values, "interaction") || n(values, "age") >= 75 || n(values, "weight") < 50 ? "少量開始・慎重調整を検討" : "施設プロトコルで開始量確認",
        tone: "warning",
        details: ["高齢者、低体重、肝機能障害、相互作用薬では過量に注意。", "次回採血時期は開始量・INR・併用薬・出血リスクで調整。"],
        interpretation: ["開始量を断定しすぎないため、注意因子の表示に留めています。"],
        cautions: ["施設プロトコルを優先してください。"],
        references: commonReferences,
        todos: ["TODO: verify local warfarin initiation and monitoring protocol"],
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "insulin-scale",
    title: "インスリン補正スケール作成",
    purpose: "教育用テンプレートとして補正スケール作成時の注意点を表示する。",
    categoryIds: ["medications", "ward"],
    tags: ["インスリン", "血糖", "教育用テンプレート"],
    fields: [
      { type: "checkbox", id: "steroid", label: "ステロイド使用あり" },
      { type: "checkbox", id: "renal", label: "腎機能低下" },
      { type: "checkbox", id: "poorIntake", label: "食事摂取不良" },
      { type: "checkbox", id: "elderly", label: "高齢者" },
    ],
    calculate(values) {
      const risk = b(values, "renal") || b(values, "poorIntake") || b(values, "elderly");
      return numericTodoTool(
        risk ? "低血糖リスク因子あり" : "教育用テンプレート",
        [
          "施設ごとにスケールが違うため、デフォルトは教育用テンプレートです。",
          b(values, "steroid") ? "ステロイド使用時は日内変動と食後高血糖を確認。" : "ステロイド使用なし。",
          risk ? "腎機能低下、食事摂取不良、高齢者では低血糖に注意。" : "低血糖リスク因子は未選択です。",
        ],
        ["TODO: replace with institution-approved correction scale before clinical operation"],
      );
    },
    referenceInfo: commonReferences,
  },
  {
    id: "admission-orders",
    title: "入院時オーダーチェックリスト",
    purpose: "入院時に抜けやすいオーダーをチェックし、コピー用サマリーを作る。",
    categoryIds: ["ward"],
    tags: ["入院", "チェックリスト", "オーダー"],
    checklistGroups: admissionOrderChecklist,
    calculate(values) {
      return checklistResult(admissionOrderChecklist, values, {
        title: "入院時オーダー",
        references: commonReferences,
      });
    },
    referenceInfo: commonReferences,
  },
  {
    id: "discharge-checklist",
    title: "退院前チェックリスト",
    purpose: "退院前の処方、書類、予約、生活調整を確認する。",
    categoryIds: ["ward", "documents"],
    tags: ["退院", "書類", "チェックリスト"],
    checklistGroups: dischargeChecklist,
    calculate(values) {
      return checklistResult(dischargeChecklist, values, {
        title: "退院前チェック",
        references: commonReferences,
      });
    },
    referenceInfo: commonReferences,
  },
  {
    id: "delirium-causes",
    title: "せん妄原因検索チェックリスト",
    purpose: "せん妄の原因を身体要因、薬剤、環境から漏れなく確認する。",
    categoryIds: ["geriatric", "ward"],
    tags: ["せん妄", "高齢者", "チェックリスト"],
    checklistGroups: deliriumCauseChecklist,
    calculate(values) {
      return checklistResult(deliriumCauseChecklist, values, {
        title: "せん妄原因検索",
        cautions: ["薬剤性・尿閉・便秘を見落とさないように確認してください。"],
        references: commonReferences,
      });
    },
    referenceInfo: commonReferences,
  },
  {
    id: "aspiration-pneumonia",
    title: "誤嚥性肺炎包括管理チェックリスト",
    purpose: "抗菌薬だけに偏らず、嚥下、栄養、口腔ケア、ACP、退院支援を確認する。",
    categoryIds: ["ward", "geriatric"],
    tags: ["誤嚥性肺炎", "感染症", "CGA", "ACP"],
    checklistGroups: aspirationPneumoniaChecklist,
    calculate(values) {
      return checklistResult(aspirationPneumoniaChecklist, values, {
        title: "誤嚥性肺炎包括管理",
        cautions: ["CGA的視点、退院調整、再発予防を含めて確認してください。"],
        references: commonReferences,
      });
    },
    referenceInfo: commonReferences,
  },
  {
    id: "urinary-retention",
    title: "尿閉対応チェックリスト",
    purpose: "急性尿閉の初期対応、原因確認、導尿後注意点を整理する。",
    categoryIds: ["emergency", "ward"],
    tags: ["尿閉", "導尿", "救急"],
    checklistGroups: urinaryRetentionChecklist,
    calculate(values) {
      return checklistResult(urinaryRetentionChecklist, values, {
        title: "尿閉対応",
        cautions: ["神経症状がある場合は脊髄・馬尾病変などを含めて緊急評価してください。", "導尿後はpost-obstructive diuresisに注意してください。"],
        references: commonReferences,
      });
    },
    referenceInfo: commonReferences,
  },
  {
    id: "anemia-fit",
    title: "便潜血陽性・貧血外来の初期整理",
    purpose: "MCV、鉄関連、B12/葉酸、消化管精査の論点を整理する。",
    categoryIds: ["outpatient"],
    tags: ["貧血", "便潜血", "鉄欠乏"],
    fields: [
      { type: "number", id: "mcv", label: "MCV", unit: "fL", step: 0.1 },
      { type: "number", id: "ferritin", label: "フェリチン", unit: "ng/mL", step: 0.1 },
      { type: "number", id: "iron", label: "鉄", step: 0.1 },
      { type: "number", id: "tsat", label: "TSAT", unit: "%", step: 0.1 },
      { type: "number", id: "b12", label: "B12", step: 0.1 },
      { type: "number", id: "folate", label: "葉酸", step: 0.1 },
      { type: "checkbox", id: "fitPositive", label: "便潜血陽性" },
      { type: "checkbox", id: "alarm", label: "緊急性の高い症状あり" },
    ],
    calculate(values) {
      const points = [
        Number.isFinite(n(values, "mcv")) && n(values, "mcv") < 80 ? "小球性: 鉄欠乏性貧血などを確認" : "",
        Number.isFinite(n(values, "mcv")) && n(values, "mcv") > 100 ? "大球性: B12/葉酸、肝疾患、薬剤などを確認" : "",
        b(values, "fitPositive") ? "便潜血陽性: 消化管精査の必要性を確認" : "",
        b(values, "alarm") ? "警告症状あり: 緊急評価を検討" : "",
      ].filter(Boolean);
      return {
        title: "初期整理",
        summary: points.length > 0 ? `${points.length}項目を確認` : "入力値から論点を表示",
        tone: b(values, "alarm") ? "danger" : "neutral",
        details: points.length > 0 ? points : ["MCV、フェリチン、TSAT、B12、葉酸、便潜血の組み合わせで整理してください。"],
        interpretation: ["鉄欠乏性貧血、大球性貧血、消化管出血検索の必要性を分けて考えます。"],
        cautions: ["黒色便、血便、循環不安定、重度貧血症状があれば緊急性を優先してください。"],
        references: commonReferences,
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "transfusion",
    title: "輸血適応チェックツール",
    purpose: "赤血球輸血の目安と輸血前後チェックを整理する。",
    categoryIds: ["ward", "emergency"],
    tags: ["輸血", "Hb", "緩和"],
    fields: [
      { type: "number", id: "hb", label: "Hb", unit: "g/dL", step: 0.1 },
      { type: "checkbox", id: "symptoms", label: "貧血症状あり" },
      { type: "checkbox", id: "heart", label: "心疾患あり" },
      { type: "checkbox", id: "bleeding", label: "活動性出血あり" },
      { type: "checkbox", id: "palliative", label: "緩和目的" },
    ],
    checklistGroups: transfusionChecklist,
    calculate(values) {
      const hb = n(values, "hb");
      const base = checklistResult(transfusionChecklist, values, {
        title: "輸血チェック",
        references: commonReferences,
      });
      const thresholdComment = Number.isFinite(hb)
        ? hb < 7
          ? "一般的な赤血球輸血閾値を下回る目安です。"
          : hb < 8 && b(values, "heart")
            ? "心疾患など背景により検討されることがあります。"
            : "Hb単独では輸血適応を決めません。"
        : "Hbを入力してください。";
      return {
        ...base,
        title: "輸血適応の整理",
        summary: Number.isFinite(hb) ? `Hb ${hb} g/dL` : "Hb未入力",
        tone: b(values, "bleeding") ? "danger" : Number.isFinite(hb) && hb < 7 ? "warning" : "neutral",
        details: [thresholdComment, ...(base.details ?? [])],
        interpretation: ["症状、循環動態、活動性出血、心疾患、緩和目的を優先して判断してください。"],
        cautions: ["緩和輸血では患者目標と効果判定を明確にしてください。"],
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "discharge-summary",
    title: "退院サマリ下書き",
    purpose:
      "退院サマリの骨子を、要点を埋めるだけで下書きとして生成し、カルテへコピーする。",
    categoryIds: ["documents", "ward"],
    tags: ["退院サマリ", "書類", "文書テンプレート"],
    fields: [
      { type: "textarea", id: "admissionReason", label: "入院理由", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "primaryDiagnosis", label: "主診断", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "comorbidities", label: "併存疾患", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "hospitalCourse", label: "入院後経過", rows: 4, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "treatments", label: "実施した治療", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "dischargeStatus", label: "退院時状態", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "dischargeMedicationPoints", label: "退院時処方の要点", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "futurePlan", label: "今後の方針", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "requests", label: "外来・かかりつけ医への依頼事項", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "explanation", label: "患者・家族への説明内容", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
    ],
    calculate(values) {
      const copyText = buildDischargeSummary({
        admissionReason: s(values, "admissionReason"),
        primaryDiagnosis: s(values, "primaryDiagnosis"),
        comorbidities: s(values, "comorbidities"),
        hospitalCourse: s(values, "hospitalCourse"),
        treatments: s(values, "treatments"),
        dischargeStatus: s(values, "dischargeStatus"),
        dischargeMedicationPoints: s(values, "dischargeMedicationPoints"),
        futurePlan: s(values, "futurePlan"),
        requests: s(values, "requests"),
        explanation: s(values, "explanation"),
      });
      return {
        title: "退院サマリ下書き",
        summary: "下書きを生成しました。カルテへコピーしてください。",
        tone: "neutral",
        copyText,
        cautions: [
          "患者氏名・ID・生年月日・住所・電話番号・カルテ番号などの個人情報は入力しないでください。",
          "本ツールは下書き支援です。最終的な記載内容と医学的妥当性は担当医が確認してください。",
        ],
      };
    },
    referenceInfo: commonReferences,
  },
  {
    id: "referral-reply",
    title: "紹介元返書",
    purpose:
      "紹介元医師への返書の骨子を、要点を埋めるだけで生成し、カルテへコピーする。",
    categoryIds: ["documents", "outpatient"],
    tags: ["返書", "紹介状", "文書テンプレート"],
    fields: [
      { type: "textarea", id: "referralReason", label: "紹介理由", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "assessment", label: "当科での評価", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "diagnosis", label: "診断", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "treatment", label: "治療・対応", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "currentStatus", label: "現在の状態", rows: 2, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "futurePlan", label: "今後の方針", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
      { type: "textarea", id: "requests", label: "紹介元にお願いしたいこと", rows: 3, placeholder: "個人情報を含めず、要点のみ入力" },
    ],
    calculate(values) {
      const copyText = buildReferralReply({
        referralReason: s(values, "referralReason"),
        assessment: s(values, "assessment"),
        diagnosis: s(values, "diagnosis"),
        treatment: s(values, "treatment"),
        currentStatus: s(values, "currentStatus"),
        futurePlan: s(values, "futurePlan"),
        requests: s(values, "requests"),
      });
      return {
        title: "紹介元返書",
        summary: "返書案を生成しました。カルテへコピーしてください。",
        tone: "neutral",
        copyText,
        cautions: [
          "医療機関名・患者個人情報は入力しないでください。冒頭の「〇〇先生」は後でカルテ側で実名に置き換えてください。",
          "本ツールは下書き支援です。最終的な記載内容と医学的妥当性は担当医が確認してください。",
        ],
      };
    },
    referenceInfo: commonReferences,
  },
];

const categoryTitleById: Record<string, string> = {
  calculations: "計算",
  scores: "スコア",
  medications: "薬剤",
  emergency: "救急",
  ward: "病棟",
  outpatient: "外来",
  geriatric: "高齢者",
  documents: "書類・説明",
};

export const miniToolModules: AppModule[] = miniToolDefinitions.map((tool, index) => {
  const primaryCategoryId = tool.categoryIds[0] ?? "calculations";
  return {
    id: tool.id,
    title: tool.title,
    description: tool.purpose,
    categoryId: primaryCategoryId,
    categoryIds: tool.categoryIds,
    categoryTitle: categoryTitleById[primaryCategoryId] ?? "計算",
    path: `/module/${tool.id}`,
    tags: [...tool.tags, ...tool.categoryIds.map((id) => categoryTitleById[id] ?? id)],
    status: "implemented",
    priority: 1000 - index,
  };
});

export function getToolDefinitionById(toolId: string): ToolDefinition | undefined {
  return miniToolDefinitions.find((tool) => tool.id === toolId);
}
