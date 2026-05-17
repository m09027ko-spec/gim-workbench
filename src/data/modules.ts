import { categories, moduleDefinitions } from "./catalog";
import type { AppCategory, AppModule } from "../types/module";

export { categories };

export const modules: AppModule[] = [...moduleDefinitions].sort(
  (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.title.localeCompare(b.title, "ja"),
);

export function getCategoryById(categoryId: string): AppCategory | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function getModuleById(moduleId: string): AppModule | undefined {
  return modules.find((module) => module.id === moduleId);
}

export function getModulesByCategory(categoryId: string): AppModule[] {
  return modules.filter((module) =>
    module.categoryIds ? module.categoryIds.includes(categoryId) : module.categoryId === categoryId,
  );
}

export function searchModules(query: string): AppModule[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return modules.filter((module) => {
    const target = [
      module.title,
      module.description,
      module.categoryTitle,
      ...(module.categoryIds ?? []),
      ...module.tags,
    ]
      .join(" ")
      .toLowerCase();

    return target.includes(normalized);
  });
}
