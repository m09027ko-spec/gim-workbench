import type { ReactNode } from "react";

export type ToolValue = string | number | boolean | string[] | "";
export type ToolValues = Record<string, ToolValue>;

export type ToolOption = {
  value: string;
  label: string;
  help?: string;
};

export type ToolField =
  | {
      type: "number";
      id: string;
      label: string;
      unit?: string;
      placeholder?: string;
      min?: number;
      max?: number;
      step?: number;
      help?: string;
    }
  | {
      type: "select";
      id: string;
      label: string;
      options: ToolOption[];
      help?: string;
    }
  | {
      type: "checkbox";
      id: string;
      label: string;
      help?: string;
    }
  | {
      type: "checkbox-group";
      id: string;
      label: string;
      options: ToolOption[];
      help?: string;
    }
  | {
      type: "textarea";
      id: string;
      label: string;
      rows?: number;
      placeholder?: string;
      help?: string;
    };

export type ChecklistItemDefinition = {
  id: string;
  label: string;
  priority?: "high" | "normal" | "low";
  note?: string;
};

export type ChecklistGroupDefinition = {
  title: string;
  description?: string;
  items: ChecklistItemDefinition[];
};

export type ToolResultTone = "neutral" | "success" | "warning" | "danger";

export type ToolResult = {
  title: string;
  summary: string;
  tone?: ToolResultTone;
  details?: string[];
  interpretation?: string[];
  cautions?: string[];
  references?: string[];
  todos?: string[];
  copyText?: string;
};

export type ToolDefinition = {
  id: string;
  title: string;
  purpose: string;
  categoryIds: string[];
  tags: string[];
  fields?: ToolField[];
  checklistGroups?: ChecklistGroupDefinition[];
  calculate: (values: ToolValues) => ToolResult;
  referenceInfo: string[];
  safetyNotes?: string[];
  initialValues?: ToolValues;
  extraContent?: ReactNode;
};
