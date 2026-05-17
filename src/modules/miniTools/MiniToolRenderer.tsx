import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "../../components/CopyButton";
import { DisclaimerBox } from "../../components/DisclaimerBox";
import { NumberInput } from "../../components/NumberInput";
import { ResultCard } from "../../components/ResultCard";
import { SectionCard } from "../../components/SectionCard";
import { SelectInput } from "../../components/SelectInput";
import { getToolDefinitionById } from "../../data/tools";
import type {
  ChecklistGroupDefinition,
  ToolDefinition,
  ToolField,
  ToolValues,
} from "../../types/tool";
import { getChecklistState, setChecklistState } from "../../utils/storage";

type MiniToolRendererProps = {
  toolId: string;
};

const CHECKLIST_STORAGE_PREFIX = "mini-tool:";

function checklistItems(tool: ToolDefinition) {
  return (tool.checklistGroups ?? []).flatMap((group) => group.items);
}

function buildInitialValues(tool: ToolDefinition): ToolValues {
  const values: ToolValues = { ...(tool.initialValues ?? {}) };

  for (const field of tool.fields ?? []) {
    if (values[field.id] !== undefined) {
      continue;
    }

    if (field.type === "number") {
      values[field.id] = "";
    } else if (field.type === "select") {
      values[field.id] = field.options[0]?.value ?? "";
    } else if (field.type === "checkbox") {
      values[field.id] = false;
    } else if (field.type === "checkbox-group") {
      values[field.id] = [];
    }
  }

  const savedChecklist = getChecklistState(`${CHECKLIST_STORAGE_PREFIX}${tool.id}`);
  for (const item of checklistItems(tool)) {
    values[item.id] = Boolean(savedChecklist[item.id]);
  }

  return values;
}

function pickChecklistState(tool: ToolDefinition, values: ToolValues): Record<string, boolean> {
  return Object.fromEntries(
    checklistItems(tool).map((item) => [item.id, values[item.id] === true]),
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ToolField;
  value: ToolValues[string];
  onChange: (value: ToolValues[string]) => void;
}) {
  if (field.type === "number") {
    return (
      <NumberInput
        id={field.id}
        label={field.label}
        value={typeof value === "number" ? value : ""}
        unit={field.unit}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        help={field.help}
        onChange={onChange}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectInput
        id={field.id}
        label={field.label}
        value={typeof value === "string" ? value : ""}
        options={field.options}
        help={field.help}
        onChange={onChange}
      />
    );
  }

  if (field.type === "checkbox-group") {
    const selected = Array.isArray(value) ? value : [];

    return (
      <fieldset className="tool-fieldset">
        <legend>{field.label}</legend>
        {field.help ? <small>{field.help}</small> : null}
        <div className="checklist-items compact">
          {field.options.map((option) => (
            <label className="checklist-item" key={option.value}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value);
                  onChange(next);
                }}
              />
              <span>
                <span className="checklist-label">{option.label}</span>
                {option.help ? (
                  <span className="checklist-description">{option.help}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="checklist-item large-touch">
      <input
        type="checkbox"
        checked={value === true}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="checklist-label">{field.label}</span>
        {field.help ? <span className="checklist-description">{field.help}</span> : null}
      </span>
    </label>
  );
}

function ChecklistGroups({
  groups,
  values,
  onChange,
}: {
  groups: ChecklistGroupDefinition[];
  values: ToolValues;
  onChange: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="tool-checklist-stack">
      {groups.map((group) => {
        const sortedItems = [...group.items].sort(
          (a, b) => Number(values[a.id] === true) - Number(values[b.id] === true),
        );
        const checkedCount = group.items.filter((item) => values[item.id] === true).length;

        return (
          <section className="checklist-subsection" key={group.title}>
            <div className="checklist-header">
              <div>
                <h2>{group.title}</h2>
                {group.description ? <p>{group.description}</p> : null}
              </div>
              <span className="check-count">
                {checkedCount}/{group.items.length}
              </span>
            </div>
            <div className="checklist-items">
              {sortedItems.map((item) => (
                <label
                  className={`checklist-item priority-${item.priority ?? "normal"}`}
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={values[item.id] === true}
                    onChange={(event) => onChange(item.id, event.target.checked)}
                  />
                  <span>
                    <span className="checklist-label">{item.label}</span>
                    {item.note ? <span className="checklist-description">{item.note}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function MiniToolRenderer({ toolId }: MiniToolRendererProps) {
  const tool = getToolDefinitionById(toolId);
  const [values, setValues] = useState<ToolValues>(() =>
    tool ? buildInitialValues(tool) : {},
  );

  useEffect(() => {
    if (tool) {
      setValues(buildInitialValues(tool));
    }
  }, [tool]);

  const result = useMemo(() => (tool ? tool.calculate(values) : undefined), [tool, values]);

  if (!tool || !result) {
    return (
      <SectionCard title="未登録ツール" tone="notice">
        <p>このツール定義はまだ登録されていません。</p>
      </SectionCard>
    );
  }

  function updateField(id: string, value: ToolValues[string]) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function updateChecklist(id: string, checked: boolean) {
    if (!tool) return;

    setValues((current) => {
      const next = { ...current, [id]: checked };
      setChecklistState(
        `${CHECKLIST_STORAGE_PREFIX}${tool.id}`,
        pickChecklistState(tool, next),
      );
      return next;
    });
  }

  return (
    <>
      <SectionCard title="用途">
        <p>{tool.purpose}</p>
      </SectionCard>

      {tool.fields && tool.fields.length > 0 ? (
        <SectionCard title="入力欄">
          <div className="tool-form-grid">
            {tool.fields.map((field) => (
              <FieldControl
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(value) => updateField(field.id, value)}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tool.checklistGroups && tool.checklistGroups.length > 0 ? (
        <SectionCard title="入力欄">
          <ChecklistGroups
            groups={tool.checklistGroups}
            values={values}
            onChange={updateChecklist}
          />
        </SectionCard>
      ) : null}

      <SectionCard title="結果表示">
        <ResultCard title={result.title} summary={result.summary} tone={result.tone}>
          {result.details && result.details.length > 0 ? (
            <ul className="compact-list">
              {result.details.map((detail, index) => (
                <li key={`${detail}-${index}`}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </ResultCard>
        {result.copyText ? <CopyButton text={result.copyText} /> : null}
      </SectionCard>

      <SectionCard title="解釈">
        <ul className="compact-list">
          {(result.interpretation ?? ["臨床状況と合わせて解釈してください。"]).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="注意点" tone="notice">
        <ul className="compact-list">
          {[...(tool.safetyNotes ?? []), ...(result.cautions ?? [])].map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
          {(result.todos ?? []).map((item, index) => (
            <li key={`${item}-${index}`}>
              <strong>{item}</strong>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="参考情報・根拠欄">
        <ul className="compact-list">
          {Array.from(new Set([...tool.referenceInfo, ...(result.references ?? [])])).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>

      <DisclaimerBox />
    </>
  );
}
