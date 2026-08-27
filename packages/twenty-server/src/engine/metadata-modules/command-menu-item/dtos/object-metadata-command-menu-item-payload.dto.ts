import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ObjectMetadataCommandMenuItemPayload')
export class ObjectMetadataCommandMenuItemPayloadDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    deprecationReason:
      'Use CommandMenuItem.navigationTargetObjectMetadataId instead, which is the modelled relation. This variant is dual-written and kept for backward compatibility.',
  })
  objectMetadataItemId: string;
}
