import { ArgsType, Field } from '@nestjs/graphql';

import { BaseCustomArgs } from './base-custom.args';
import { CustomEntityInput } from './custom-entity.input';

@ArgsType()
export class DeleteOneCustomArgs extends BaseCustomArgs {
  @Field(() => CustomEntityInput, { nullable: true })
  where?: CustomEntityInput;
}
