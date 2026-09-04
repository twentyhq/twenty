import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ObjectMetadataCommandMenuItemPayload')
export class ObjectMetadataCommandMenuItemPayloadDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    deprecationReason:
      'Never returned anymore: navigation targets moved to CommandMenuItem.navigationTargetObjectMetadataId. This variant only remains one release so frontends deployed after the server keep validating; it will be removed in the next release.',
  })
  objectMetadataItemId: string;
}
