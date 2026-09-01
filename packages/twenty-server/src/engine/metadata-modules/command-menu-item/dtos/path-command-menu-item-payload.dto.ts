import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ObjectType('PathCommandMenuItemPayload')
export class PathCommandMenuItemPayloadDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description:
      'Null only on legacy rows not yet rewritten onto CommandMenuItem.navigationTargetObjectMetadataId; object navigation items carry no payload at all',
  })
  path: string | null;
}
