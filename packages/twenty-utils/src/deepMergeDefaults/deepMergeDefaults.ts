export function deepMergeDefaults<T extends Record<string, any>>(target: Partial<T>, defaults: T): T {
  const result: any = { ...target };
  for (const key of Object.keys(defaults)) {
    if (result[key] === undefined) result[key] = defaults[key];
    else if (typeof defaults[key] === "object" && defaults[key] !== null && !Array.isArray(defaults[key])) {
      result[key] = deepMergeDefaults(result[key], defaults[key]);
    }
  }
  return result;
}