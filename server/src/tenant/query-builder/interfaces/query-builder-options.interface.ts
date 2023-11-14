import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

export interface QueryBuilderOptions {
  targetTableName: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}
