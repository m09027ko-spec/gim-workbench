import { useEffect, useMemo, useState } from "react";
import {
  clearChecklistState,
  getChecklistState,
  setChecklistState,
} from "../utils/storage";

export type ChecklistItem = {
  id: string;
  label: string;
  description?: string;
  priority?: "high" | "normal" | "low";
};

type ChecklistProps = {
  title: string;
  description?: string;
  items: ChecklistItem[];
  storageKey?: string;
  allowReset?: boolean;
};

export function Checklist({
  title,
  description,
  items,
  storageKey,
  allowReset = true,
}: ChecklistProps) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCheckedState(storageKey ? getChecklistState(storageKey) : {});
  }, [storageKey]);

  const checkedCount = useMemo(
    () => items.filter((item) => checkedState[item.id]).length,
    [checkedState, items],
  );

  function updateItem(itemId: string, checked: boolean): void {
    const next = { ...checkedState, [itemId]: checked };
    setCheckedState(next);

    if (storageKey) {
      setChecklistState(storageKey, next);
    }
  }

  function reset(): void {
    setCheckedState({});

    if (storageKey) {
      clearChecklistState(storageKey);
    }
  }

  return (
    <section className="checklist-card">
      <div className="checklist-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <span className="check-count">
          {checkedCount}/{items.length}
        </span>
      </div>

      <div className="checklist-items">
        {items.map((item) => (
          <label
            className={`checklist-item priority-${item.priority ?? "normal"}`}
            key={item.id}
          >
            <input
              type="checkbox"
              checked={Boolean(checkedState[item.id])}
              onChange={(event) => updateItem(item.id, event.target.checked)}
            />
            <span>
              <span className="checklist-label">{item.label}</span>
              {item.description ? (
                <span className="checklist-description">{item.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>

      {allowReset ? (
        <div className="checklist-actions">
          <button className="button secondary" type="button" onClick={reset}>
            チェックをリセット
          </button>
        </div>
      ) : null}
    </section>
  );
}
