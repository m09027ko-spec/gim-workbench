import { useState } from "react";
import { CopyButton } from "../../components/CopyButton";
import { SectionCard } from "../../components/SectionCard";
import {
  buildDischargeSummary,
  type DischargeSummaryFields,
} from "../../utils/textTemplates";

const initialFields: DischargeSummaryFields = {
  admissionReason: "",
  primaryDiagnosis: "",
  comorbidities: "",
  hospitalCourse: "",
  treatments: "",
  dischargeStatus: "",
  dischargeMedicationPoints: "",
  futurePlan: "",
  requests: "",
  explanation: "",
};

const fieldConfigs: Array<{ key: keyof DischargeSummaryFields; label: string; rows?: number }> = [
  { key: "admissionReason", label: "入院理由" },
  { key: "primaryDiagnosis", label: "主診断" },
  { key: "comorbidities", label: "併存疾患" },
  { key: "hospitalCourse", label: "入院後経過", rows: 4 },
  { key: "treatments", label: "実施した治療", rows: 3 },
  { key: "dischargeStatus", label: "退院時状態" },
  { key: "dischargeMedicationPoints", label: "退院時処方の要点" },
  { key: "futurePlan", label: "今後の方針", rows: 3 },
  { key: "requests", label: "外来・かかりつけ医への依頼事項", rows: 3 },
  { key: "explanation", label: "患者・家族への説明内容", rows: 3 },
];

export function DischargeSummary() {
  const [fields, setFields] = useState<DischargeSummaryFields>(initialFields);
  const [output, setOutput] = useState("");

  function updateField(key: keyof DischargeSummaryFields, value: string): void {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function generate(): void {
    setOutput(buildDischargeSummary(fields));
  }

  function clear(): void {
    setFields(initialFields);
    setOutput("");
  }

  return (
    <>
      <SectionCard title="入力時の注意" tone="notice">
        <p>
          入力内容はlocalStorageに保存しません。患者名、ID、生年月日、住所、電話番号、カルテ番号などは入力しないでください。
        </p>
      </SectionCard>

      <SectionCard title="退院サマリの要素">
        <div className="form-grid">
          {fieldConfigs.map((field) => (
            <label className="form-field" key={field.key}>
              <span>{field.label}</span>
              <textarea
                value={fields[field.key]}
                rows={field.rows ?? 2}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder="個人情報を含めず、要点のみ入力"
              />
            </label>
          ))}
        </div>
        <div className="button-row sticky-actions">
          <button className="button primary" type="button" onClick={generate}>
            生成
          </button>
          <button className="button secondary" type="button" onClick={clear}>
            クリア
          </button>
        </div>
      </SectionCard>

      <SectionCard title="出力">
        <pre className="template-output">{output || "生成ボタンを押すと下書きが表示されます。"}</pre>
        <CopyButton text={output} disabled={!output.trim()} />
      </SectionCard>
    </>
  );
}
