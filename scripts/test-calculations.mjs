import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const rootDir = process.cwd();
const tmpDir = path.join(rootDir, ".tmp-tests");
const source = await readFile(path.join(rootDir, "src/utils/calculations.ts"), "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2020,
  },
});

await mkdir(tmpDir, { recursive: true });
const compiledPath = path.join(tmpDir, "calculations.mjs");
await writeFile(compiledPath, output.outputText, "utf8");

const calculations = await import(pathToFileURL(compiledPath).href);

const templatesSource = await readFile(
  path.join(rootDir, "src/utils/textTemplates.ts"),
  "utf8",
);
const templatesOutput = ts.transpileModule(templatesSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2020,
  },
});
const templatesPath = path.join(tmpDir, "textTemplates.mjs");
await writeFile(templatesPath, templatesOutput.outputText, "utf8");
const templates = await import(pathToFileURL(templatesPath).href);

function closeTo(actual, expected, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

closeTo(calculations.calculateCockcroftGault(60, 70, 1, "male"), 77.78);
closeTo(calculations.calculateCockcroftGault(60, 70, 1, "female"), 66.11);

assert.equal(calculations.calculateAnionGap(140, 104, 24), 12);
assert.equal(calculations.calculateAlbuminCorrectedAnionGap(12, 2), 17);

closeTo(calculations.calculateFib4(50, 40, 40, 20), 1.58);

assert.deepEqual(
  calculations.calculateChildPughScore({
    bilirubin: 1,
    albumin: 4,
    inr: 1.2,
    ascitesPoints: 1,
    encephalopathyPoints: 1,
  }),
  { score: 5, classification: "A" },
);

assert.equal(
  calculations.calculateCha2ds2VascScore({
    heartFailure: true,
    hypertension: true,
    age75: true,
    diabetes: true,
    strokeTia: true,
    vascularDisease: true,
    age65to74: false,
    female: true,
  }),
  9,
);

assert.equal(
  calculations.calculateHasBledScore({
    hypertension: true,
    abnormalRenal: true,
    abnormalLiver: false,
    stroke: true,
    bleeding: false,
    labileInr: true,
    elderly: true,
    drugs: false,
    alcohol: true,
  }),
  6,
);

assert.deepEqual(
  calculations.calculateCentorMcIsaac({
    fever: true,
    noCough: true,
    tenderNodes: true,
    tonsillarExudate: false,
    ageGroup: "45plus",
  }),
  { centor: 3, mcIsaac: 2 },
);

assert.equal(calculations.calculateSteroidEquivalent(10, 5, 20), 40);

const dischargeText = templates.buildDischargeSummary({
  admissionReason: "発熱精査",
  primaryDiagnosis: "",
  comorbidities: "",
  hospitalCourse: "",
  treatments: "",
  dischargeStatus: "",
  dischargeMedicationPoints: "",
  futurePlan: "",
  requests: "",
  explanation: "",
});
assert.ok(dischargeText.includes("【入院理由】\n発熱精査"));
assert.ok(dischargeText.includes("主診断：（未入力）"));

const referralText = templates.buildReferralReply({
  referralReason: "精査依頼",
  assessment: "",
  diagnosis: "",
  treatment: "",
  currentStatus: "",
  futurePlan: "",
  requests: "",
});
assert.ok(referralText.startsWith("〇〇先生"));
assert.ok(referralText.includes("【紹介理由】\n精査依頼"));
assert.ok(referralText.includes("診断：（未入力）"));
assert.ok(referralText.trimEnd().endsWith("今後とも何卒よろしくお願い申し上げます。"));

console.log("calculation tests passed");
