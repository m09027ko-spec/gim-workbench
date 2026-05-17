import { useState } from "react";
import { CopyButton } from "../../components/CopyButton";
import { SectionCard } from "../../components/SectionCard";
import { buildReferralReply, type ReferralReplyFields } from "../../utils/textTemplates";

const initialFields: ReferralReplyFields = {
  referralReason: "",
  assessment: "",
  diagnosis: "",
  treatment: "",
  currentStatus: "",
  futurePlan: "",
  requests: "",
};

const fieldConfigs: Array<{ key: keyof ReferralReplyFields; label: string; rows?: number }> = [
  { key: "referralReason", label: "紹介理由" },
  { key: "assessment", label: "当科での評価", rows: 3 },
  { key: "diagnosis", label: "診断" },
  { key: "treatment", label: "治療・対応", rows: 3 },
  { key: "currentStatus", label: "現在の状態" },
  { key: "futurePlan", label: "今後の方針", rows: 3 },
  { key: "requests", label: "紹介元にお願いしたいこと", rows: 3 },
];

export function ReferralReply() {
  const [fields, setFields] = useState<ReferralReplyFields>(initialFields);
  const [output, setOutput] = useState("");

  function updateField(key: keyof ReferralReplyFields, value: string): void {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function generate(): void {
    setOutput(buildReferralReply(fields));
  }

  function clear(): void {
    setFields(initialFields);
    setOutput("");
  }

  return (
    <>
      <SectionCard title="入力時の注意" tone="notice">
        <p>
          入力内容はlocalStorageに保存しません。医療機関名や患者個人情報を含む詳細情報は入力しないでください。
        </p>
      </SectionCard>

      <SectionCard title="返書の要素">
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
        <pre className="template-output">{output || "生成ボタンを押すと返書案が表示されます。"}</pre>
        <CopyButton text={output} disabled={!output.trim()} />
      </SectionCard>
    </>
  );
}
