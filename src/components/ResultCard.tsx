import type { ReactNode } from "react";
import type { ToolResultTone } from "../types/tool";

type ResultCardProps = {
  title: string;
  summary: string;
  tone?: ToolResultTone;
  children?: ReactNode;
};

export function ResultCard({
  title,
  summary,
  tone = "neutral",
  children,
}: ResultCardProps) {
  return (
    <div className={`result-card result-${tone}`}>
      <span className="result-card-label">{title}</span>
      <strong>{summary}</strong>
      {children ? <div className="result-card-body">{children}</div> : null}
    </div>
  );
}
