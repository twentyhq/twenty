import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  targetTableName: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}
