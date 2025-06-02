export const parseJson = <T>(json: string): T | null => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};
