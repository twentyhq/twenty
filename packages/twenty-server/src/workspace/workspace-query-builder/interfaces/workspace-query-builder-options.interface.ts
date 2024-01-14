import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  objectMetadataItem: ObjectMetadataInterface;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
