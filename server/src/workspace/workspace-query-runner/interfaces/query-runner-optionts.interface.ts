import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/field-metadata.interface';

export interface WorkspaceQueryRunnerOptions {
  targetTableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}
