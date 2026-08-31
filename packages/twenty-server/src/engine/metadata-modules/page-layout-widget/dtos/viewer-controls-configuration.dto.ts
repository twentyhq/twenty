import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsOptional } from 'class-validator';
import { type ViewerControlsConfiguration } from 'twenty-shared/types';

@ObjectType('ViewerControlsConfiguration')
export class ViewerControlsConfigurationDTO implements ViewerControlsConfiguration {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  filter?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  sort?: boolean;
}
