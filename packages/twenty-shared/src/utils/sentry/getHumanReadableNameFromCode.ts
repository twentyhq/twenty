export const getHumanReadableNameFromCode = (code: string) => {
  return code
    .split('_')
    .map((word) => word.charAt(0)?.toUpperCase() + word.slice(1)?.toLowerCase())
    .join(' ');
};
