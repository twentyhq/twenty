import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('SetAppMessageThreadReadStateInput')
export class SetAppMessageThreadReadStateInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  messageChannelId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  threadExternalId: string;

  @Field()
  @IsBoolean()
  isRead: boolean;
}
