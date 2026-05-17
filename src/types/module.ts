export type ModuleStatus = "implemented" | "planned";

export type CategoryColorTone =
  | "red"
  | "teal"
  | "amber"
  | "gray"
  | "blue"
  | "purple";

export type AppModule = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryIds?: string[];
  categoryTitle: string;
  path: string;
  tags: string[];
  status: ModuleStatus;
  priority?: number;
};

export type AppCategory = {
  id: string;
  title: string;
  description: string;
  iconLabel: string;
  path: string;
  colorTone: CategoryColorTone;
};
