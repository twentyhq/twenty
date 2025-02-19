export type ObjectMetadataStandardIdToIdMap = {
  [objectMetadataStandardId: string]: {
    id: string;
    fields: {
      [fieldMetadataStandardId: string]: string;
    };
  };
};
