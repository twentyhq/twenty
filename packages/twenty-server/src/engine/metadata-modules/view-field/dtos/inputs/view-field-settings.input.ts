import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, IsString } from 'class-validator';
import { type ViewFieldSettings } from 'twenty-shared/types';

@InputType()
export class ViewFieldSettingsInput implements ViewFieldSettings {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  label?: string | null;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  recordLimit?: number | null;
}
