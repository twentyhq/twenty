const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

const roundToUnit = ({
  bytes,
  unitIndex,
}: {
  bytes: number;
  unitIndex: number;
}) => Number((bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1));

export const formatBytes = (bytes: number): string => {
  const magnitudeUnitIndex = Math.min(
    BYTE_UNITS.length - 1,
    bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0,
  );
  const unitIndex =
    magnitudeUnitIndex < BYTE_UNITS.length - 1 &&
    roundToUnit({ bytes, unitIndex: magnitudeUnitIndex }) >= 1024
      ? magnitudeUnitIndex + 1
      : magnitudeUnitIndex;

  return `${roundToUnit({ bytes, unitIndex })} ${BYTE_UNITS[unitIndex]}`;
};
