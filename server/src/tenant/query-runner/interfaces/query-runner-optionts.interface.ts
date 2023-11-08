import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

export interface QueryRunnerOptions {
  targetTableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}
