import { useState } from "react";
import { SectionCard } from "../../components/SectionCard";
import { calculateCurb65, type Curb65Values } from "../../utils/scoring";

const initialValues: Curb65Values = {
  confusion: false,
  urea: false,
  respiratoryRate: false,
  bloodPressure: false,
  age: false,
};

const inputs: Array<{ id: keyof Curb65Values; label: string }> = [
  { id: "confusion", label: "Confusion" },
  { id: "urea", label: "Urea > 7 mmol/L または BUN > 20 mg/dL" },
  { id: "respiratoryRate", label: "Respiratory rate ≥ 30/min" },
  { id: "bloodPressure", label: "Blood pressure: SBP < 90 または DBP ≤ 60" },
  { id: "age", label: "Age ≥ 65" },
];

export function Curb65() {
  const [values, setValues] = useState<Curb65Values>(initialValues);
  const result = calculateCurb65(values);

  function updateValue(id: keyof Curb65Values, checked: boolean): void {
    setValues((current) => ({ ...current, [id]: checked }));
  }

  return (
    <>
      <SectionCard title="入力">
        <div className="calculator-inputs">
          {inputs.map((input) => (
            <label className="checklist-item" key={input.id}>
              <input
                type="checkbox"
                checked={values[input.id]}
                onChange={(event) => updateValue(input.id, event.target.checked)}
              />
              <span className="checklist-label">{input.label}</span>
            </label>
          ))}
        </div>
        <button className="button secondary full-width" type="button" onClick={() => setValues(initialValues)}>
          リセット
        </button>
      </SectionCard>

      <SectionCard title="結果">
        <div className={`score-panel risk-${result.riskLabel === "高リスク" ? "high" : "standard"}`}>
          <span className="score-number">{result.score}</span>
          <span className="score-label">/ 5点</span>
          <strong>{result.riskLabel}</strong>
        </div>
        <p className="notice-text">
          スコアは補助であり、酸素需要、併存疾患、ADL、社会背景、敗血症、誤嚥リスクなどを含めて総合判断する。
        </p>
      </SectionCard>
    </>
  );
}
