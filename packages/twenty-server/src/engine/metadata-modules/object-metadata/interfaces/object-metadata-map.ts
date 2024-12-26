export type ObjectMetadataStandardIdToIdMap = {
  [objectMetadataStandardId: string]: {
    id: string;
    fields: {
      [fieldStandardStandardId: string]: string;
    };
  };
};
