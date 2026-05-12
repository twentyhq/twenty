import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ObjectMetadataCommandMenuItemPayload')
export class ObjectMetadataCommandMenuItemPayloadDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataItemId: string;
}
