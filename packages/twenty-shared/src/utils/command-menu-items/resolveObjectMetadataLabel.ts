export const resolveObjectMetadataLabel = ({
  objectMetadataItem,
  numberOfSelectedRecords,
}: {
  objectMetadataItem: { labelSingular: string; labelPlural: string };
  numberOfSelectedRecords: number;
}): string => {
  return numberOfSelectedRecords === 1
    ? objectMetadataItem.labelSingular
    : objectMetadataItem.labelPlural;
};
