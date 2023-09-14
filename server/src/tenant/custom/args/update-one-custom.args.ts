import { ArgsType, Field } from '@nestjs/graphql';

import { BaseCustomArgs } from './base-custom.args';
import { CustomEntityInput } from './custom-entity.input';

@ArgsType()
export class UpdateOneCustomArgs extends BaseCustomArgs {
  @Field(() => CustomEntityInput, { nullable: false })
  data!: CustomEntityInput;

  @Field(() => CustomEntityInput, { nullable: true })
  where?: CustomEntityInput;
}
