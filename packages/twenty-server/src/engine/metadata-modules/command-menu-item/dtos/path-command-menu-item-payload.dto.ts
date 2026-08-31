import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ObjectType('PathCommandMenuItemPayload')
export class PathCommandMenuItemPayloadDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description:
      'Null on object navigation items, whose target is CommandMenuItem.navigationTargetObjectMetadataId',
  })
  path: string | null;
}
