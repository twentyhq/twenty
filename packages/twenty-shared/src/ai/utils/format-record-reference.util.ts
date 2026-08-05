export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string =>
  `[[record:${objectNameSingular}:${recordId}:${displayName}[[/record]]`;
