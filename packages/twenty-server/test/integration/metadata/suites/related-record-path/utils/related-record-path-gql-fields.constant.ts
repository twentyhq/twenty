/* @license Enterprise */

export const RELATED_RECORD_PATH_GQL_FIELDS = `
  id
  objectMetadataId
  firstFieldMetadataId
  secondFieldMetadataId
  thirdFieldMetadataId
  isInherent
`;

export type RelatedRecordPathResponse = {
  id: string;
  objectMetadataId: string;
  firstFieldMetadataId: string;
  secondFieldMetadataId: string | null;
  thirdFieldMetadataId: string | null;
  isInherent: boolean;
};
