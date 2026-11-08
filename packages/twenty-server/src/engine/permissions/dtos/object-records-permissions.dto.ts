import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RowLevelRecordsPermissionsDTO } from 'src/engine/permissions/dtos/row-level-records-permissions.dto';

@ObjectType('ObjectRecordsPermissions')
export class ObjectRecordsPermissionsDTO {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => Boolean)
  canCreateAllRecords: boolean;

  @Field(() => Boolean)
  canReadAllRecords: boolean;

  @Field(() => Boolean)
  canUpdateAllRecords: boolean;

  @Field(() => Boolean)
  canSoftDeleteAllRecords: boolean;

  @Field(() => Boolean)
  canDestroyAllRecords: boolean;

  @Field(() => [UUIDScalarType])
  unreadableFields: string[];

  @Field(() => [UUIDScalarType])
  uneditableFields: string[];

  @Field(() => RowLevelRecordsPermissionsDTO, { nullable: true })
  rowLevelRecordsPermissions?: RowLevelRecordsPermissionsDTO | null;
}
