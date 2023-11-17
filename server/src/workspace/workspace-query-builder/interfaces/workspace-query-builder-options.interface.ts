import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/field-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  targetTableName: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}
