import { ArgsType, Field } from '@nestjs/graphql';

import { BaseUniversalArgs } from './base-universal.args';
import { UniversalEntityInput } from './universal-entity.input';

@ArgsType()
export class FindUniqueUniversalArgs extends BaseUniversalArgs {
  @Field(() => UniversalEntityInput, { nullable: true })
  where?: UniversalEntityInput;
}
