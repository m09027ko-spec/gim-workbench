export type DischargeSummaryFields = {
  admissionReason: string;
  primaryDiagnosis: string;
  comorbidities: string;
  hospitalCourse: string;
  treatments: string;
  dischargeStatus: string;
  dischargeMedicationPoints: string;
  futurePlan: string;
  requests: string;
  explanation: string;
};

export type ReferralReplyFields = {
  referralReason: string;
  assessment: string;
  diagnosis: string;
  treatment: string;
  currentStatus: string;
  futurePlan: string;
  requests: string;
};

function valueOrBlank(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "（未入力）";
}

export function buildDischargeSummary(fields: DischargeSummaryFields): string {
  return [
    "【入院理由】",
    valueOrBlank(fields.admissionReason),
    "",
    "【診断】",
    `主診断：${valueOrBlank(fields.primaryDiagnosis)}`,
    `併存疾患：${valueOrBlank(fields.comorbidities)}`,
    "",
    "【入院後経過】",
    valueOrBlank(fields.hospitalCourse),
    "",
    "【治療】",
    valueOrBlank(fields.treatments),
    "",
    "【退院時状態】",
    valueOrBlank(fields.dischargeStatus),
    "",
    "【退院時処方の要点】",
    valueOrBlank(fields.dischargeMedicationPoints),
    "",
    "【今後の方針】",
    valueOrBlank(fields.futurePlan),
    "",
    "【依頼事項】",
    valueOrBlank(fields.requests),
    "",
    "【患者・家族への説明内容】",
    valueOrBlank(fields.explanation),
  ].join("\n");
}

export function buildReferralReply(fields: ReferralReplyFields): string {
  return [
    "〇〇先生",
    "",
    "このたびはご紹介いただきありがとうございました。",
    "",
    "【紹介理由】",
    valueOrBlank(fields.referralReason),
    "",
    "【当科での評価】",
    valueOrBlank(fields.assessment),
    "",
    "【診断・対応】",
    `診断：${valueOrBlank(fields.diagnosis)}`,
    `治療・対応：${valueOrBlank(fields.treatment)}`,
    `現在の状態：${valueOrBlank(fields.currentStatus)}`,
    "",
    "【今後の方針】",
    valueOrBlank(fields.futurePlan),
    "",
    "【お願いしたい事項】",
    valueOrBlank(fields.requests),
    "",
    "今後とも何卒よろしくお願い申し上げます。",
  ].join("\n");
}
