const CONFIG_VAR_TEMPLATE_REGEX = /^\{\{(\w+)\}\}$/;

export const extractConfigVariableName = (
  value: string | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const match = CONFIG_VAR_TEMPLATE_REGEX.exec(value);

  return match?.[1];
};
