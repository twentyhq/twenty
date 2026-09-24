const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const formatBytes = (bytes: number): string => {
  // Math.log is -Infinity at 0 and NaN below it, and the index has to be
  // clamped or anything past a terabyte indexes off the end of the units.
  const unitIndex = Math.min(
    BYTE_UNITS.length - 1,
    bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0,
  );
  const scaled = bytes / 1024 ** unitIndex;

  return `${Number(scaled.toFixed(unitIndex === 0 ? 0 : 1))} ${BYTE_UNITS[unitIndex]}`;
};
