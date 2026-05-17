import { useState } from "react";
import { SectionCard } from "../../components/SectionCard";
import { calculateCha2ds2Vasc, type Cha2ds2VascValues } from "../../utils/scoring";

const initialValues: Cha2ds2VascValues = {
  heartFailure: false,
  hypertension: false,
  age75: false,
  diabetes: false,
  strokeTia: false,
  vascularDisease: false,
  age65to74: false,
  female: false,
};

const inputs: Array<{ id: keyof Cha2ds2VascValues; label: string }> = [
  { id: "heartFailure", label: "C：心不全 1点" },
  { id: "hypertension", label: "H：高血圧 1点" },
  { id: "age75", label: "A2：75歳以上 2点" },
  { id: "diabetes", label: "D：糖尿病 1点" },
  { id: "strokeTia", label: "S2：脳卒中/TIA/血栓塞栓症の既往 2点" },
  { id: "vascularDisease", label: "V：血管疾患 1点" },
  { id: "age65to74", label: "A：65-74歳 1点" },
  { id: "female", label: "Sc：女性 1点" },
];

export function Cha2ds2Vasc() {
  const [values, setValues] = useState<Cha2ds2VascValues>(initialValues);
  const result = calculateCha2ds2Vasc(values);

  function updateValue(id: keyof Cha2ds2VascValues, checked: boolean): void {
    setValues((current) => {
      if (id === "age75" && checked) {
        return { ...current, age75: true, age65to74: false };
      }
      if (id === "age65to74" && checked) {
        return { ...current, age65to74: true, age75: false };
      }
      return { ...current, [id]: checked };
    });
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
        <div className="score-panel">
          <span className="score-number">{result.score}</span>
          <span className="score-label">点</span>
        </div>
        <div className="factor-list">
          <p className="field-label">構成要素</p>
          {result.factors.length > 0 ? (
            <ul className="compact-list">
              {result.factors.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-text">選択された構成要素はありません。</p>
          )}
        </div>
        <p className="notice-text">
          抗凝固療法の適応は、出血リスク、フレイル、腎機能、患者希望、併用薬、周術期予定などを含めて総合判断する。
        </p>
      </SectionCard>
    </>
  );
}
