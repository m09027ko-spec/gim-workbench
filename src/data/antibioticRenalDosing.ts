export type AntibioticRenalDosingRow = {
  id: string;
  name: string;
  renalAdjustment: "required" | "usually-none" | "monitoring";
  todo: string;
};

export const antibioticRenalDosing: AntibioticRenalDosingRow[] = [
  {
    id: "cez",
    name: "CEZ",
    renalAdjustment: "required",
    todo: "TODO: verify renal dose table with local protocol / package insert",
  },
  {
    id: "ctrx",
    name: "CTRX",
    renalAdjustment: "usually-none",
    todo: "TODO: verify biliary disease, severe renal-liver dysfunction, and local rule",
  },
  {
    id: "taz-pipc",
    name: "TAZ/PIPC",
    renalAdjustment: "required",
    todo: "TODO: verify renal dose table with local protocol / package insert",
  },
  {
    id: "vcm",
    name: "VCM",
    renalAdjustment: "monitoring",
    todo: "TODO: use local TDM protocol; do not hard-code dose here",
  },
  {
    id: "mepm",
    name: "MEPM",
    renalAdjustment: "required",
    todo: "TODO: verify renal dose table with local protocol / package insert",
  },
  {
    id: "lvfx",
    name: "LVFX",
    renalAdjustment: "required",
    todo: "TODO: verify renal dose table with local protocol / package insert",
  },
  {
    id: "st",
    name: "ST合剤",
    renalAdjustment: "required",
    todo: "TODO: verify renal dose table, hyperkalemia risk, and local protocol",
  },
];
