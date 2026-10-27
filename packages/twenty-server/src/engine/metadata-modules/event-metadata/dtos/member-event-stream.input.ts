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

import { MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';

export class MemberEventSubscriptionInput implements AppEventSubscription {
  @IsString()
  @IsNotEmpty()
  event: string;

  @IsUUID()
  recordId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  property?: string;
}

export class MemberEventStreamInput {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM)
  @ValidateNested({ each: true })
  @Type(() => MemberEventSubscriptionInput)
  subscriptions: MemberEventSubscriptionInput[];
}
