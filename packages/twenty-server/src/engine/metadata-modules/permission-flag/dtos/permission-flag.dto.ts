import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@ObjectType('PermissionFlag')
export class PermissionFlagDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  roleId: string;

  @Field({ nullable: false })
  flag: PermissionFlagType;
}
