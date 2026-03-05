// Resolves a CSS variable reference (e.g. 'var(--t-font-color-primary)')
// to its computed value from the current document theme.
// Accepts either a themeCssVariables entry or a raw CSS variable name.
export const resolveThemeVariable = (cssVarOrName: string): string => {
  const variableName =
    cssVarOrName.startsWith('var(') && cssVarOrName.endsWith(')')
      ? cssVarOrName.slice(4, -1)
      : cssVarOrName;

  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

export const resolveThemeVariableAsNumber = (
  cssVarOrName: string,
  fallback = 0,
): number => {
  const value = parseFloat(resolveThemeVariable(cssVarOrName));

  return Number.isNaN(value) ? fallback : value;
};
