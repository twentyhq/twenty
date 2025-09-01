import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum EntityType {
  WORKSPACE_MEMBER = 'WORKSPACE_MEMBER',
  AGENT = 'AGENT',
  API_KEY = 'API_KEY',
}

registerEnumType(EntityType, {
  name: 'EntityType',
  description: 'The type of entity to assign a role to',
});

@InputType('AssignRoleToEntityInput')
export class AssignRoleToEntityInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @Field(() => EntityType)
  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  entityId: string;
}
