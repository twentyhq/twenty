export type RelationToDeleteV2 = {
  id: string;
  fromFieldMetadataId: string;
  toFieldMetadataId: string;
  fromFieldMetadataName: string;
  toFieldMetadataName: string;
  fromObjectMetadataId: string;
  toObjectMetadataId: string;
  fromObjectName: string;
  toObjectName: string;
  toFieldMetadataIsCustom: boolean;
  toObjectMetadataIsCustom: boolean;
  direction: string;
};
