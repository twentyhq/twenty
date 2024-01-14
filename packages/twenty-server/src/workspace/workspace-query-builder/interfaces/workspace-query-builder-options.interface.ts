import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  targetTableName: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
