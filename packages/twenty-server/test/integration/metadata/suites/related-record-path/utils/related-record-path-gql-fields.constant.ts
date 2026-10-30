/* @license Enterprise */

export const RELATED_RECORD_PATH_GQL_FIELDS = `
  id
  objectMetadataId
  firstFieldMetadataId
  secondFieldMetadataId
  thirdFieldMetadataId
`;

export type RelatedRecordPathResponse = {
  id: string;
  objectMetadataId: string;
  firstFieldMetadataId: string;
  secondFieldMetadataId: string | null;
  thirdFieldMetadataId: string | null;
};
