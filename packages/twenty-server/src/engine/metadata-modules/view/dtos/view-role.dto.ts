import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

@ObjectType('ViewRole')
export class ViewRoleDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  roleId: string;

  @Field(() => RoleDTO, { nullable: true })
  role?: RoleDTO;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

