import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type ViewFieldSettings } from 'twenty-shared/types';

@ObjectType('ViewFieldSettings')
export class ViewFieldSettingsDTO implements ViewFieldSettings {
  @Field(() => String, { nullable: true })
  label?: string | null;

  @Field(() => Int, { nullable: true })
  recordLimit?: number | null;
}
