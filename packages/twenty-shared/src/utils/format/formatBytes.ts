const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const formatBytes = (bytes: number): string => {
  let unitIndex = Math.min(
    BYTE_UNITS.length - 1,
    bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0,
  );
  let scaled = bytes / 1024 ** unitIndex;
  let formattedNumber = Number(scaled.toFixed(unitIndex === 0 ? 0 : 1));

  if (formattedNumber >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    unitIndex += 1;
    scaled = bytes / 1024 ** unitIndex;
    formattedNumber = Number(scaled.toFixed(unitIndex === 0 ? 0 : 1));
  }

  return `${formattedNumber} ${BYTE_UNITS[unitIndex]}`;
};
