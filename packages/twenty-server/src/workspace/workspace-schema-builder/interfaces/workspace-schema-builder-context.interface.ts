import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceSchemaBuilderContext {
  workspaceId: string;
  userId: string | undefined;
  objectMetadataItem: ObjectMetadataInterface;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
