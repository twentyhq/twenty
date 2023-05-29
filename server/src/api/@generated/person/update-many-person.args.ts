import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonUpdateManyMutationInput } from './person-update-many-mutation.input';
import { Type } from 'class-transformer';
import { PersonWhereInput } from './person-where.input';

@ArgsType()
export class UpdateManyPersonArgs {
  @Field(() => PersonUpdateManyMutationInput, { nullable: false })
  @Type(() => PersonUpdateManyMutationInput)
  data!: PersonUpdateManyMutationInput;

  @Field(() => PersonWhereInput, { nullable: true })
  @Type(() => PersonWhereInput)
  where?: PersonWhereInput;
}
