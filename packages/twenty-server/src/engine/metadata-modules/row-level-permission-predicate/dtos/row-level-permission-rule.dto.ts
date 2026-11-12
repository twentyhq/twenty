/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RowLevelPermissionRule')
export class RowLevelPermissionRuleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => Boolean)
  canCreateRecords: boolean;

  @Field(() => Boolean)
  canReadRecords: boolean;

  @Field(() => Boolean)
  canUpdateRecords: boolean;

  @Field(() => Boolean)
  canSoftDeleteRecords: boolean;

  @Field(() => Boolean)
  canDestroyRecords: boolean;
}
