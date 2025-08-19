export const parseBodyJson = (input: string) => {
  const trimmed = input.trim();

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return input;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return input;
  }
};
