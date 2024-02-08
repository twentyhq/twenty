export const objectRecordChangedProperties = (
  oldRecord: Record<string, any>,
  newRecord: Record<string, any>,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    (key) => oldRecord[key] !== newRecord[key],
  );

  return changedProperties;
};
