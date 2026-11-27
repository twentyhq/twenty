import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { type AppEventSubscription } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';

@InputType('AppEventSubscriptionInput')
export class AppEventSubscriptionInput implements AppEventSubscription {
  @Field()
  @IsString()
  @IsNotEmpty()
  event: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  recordId: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  property?: string;
}

@InputType('OnAppEventInput')
export class OnAppEventInput {
  @Field(() => [AppEventSubscriptionInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM)
  @ValidateNested({ each: true })
  @Type(() => AppEventSubscriptionInput)
  subscriptions: AppEventSubscriptionInput[];
}
