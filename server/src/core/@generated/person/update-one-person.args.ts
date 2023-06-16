import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonUpdateInput } from './person-update.input';
import { Type } from 'class-transformer';
import { PersonWhereUniqueInput } from './person-where-unique.input';

@ArgsType()
export class UpdateOnePersonArgs {
  @Field(() => PersonUpdateInput, { nullable: false })
  @Type(() => PersonUpdateInput)
  data!: PersonUpdateInput;

  @Field(() => PersonWhereUniqueInput, { nullable: false })
  @Type(() => PersonWhereUniqueInput)
  where!: PersonWhereUniqueInput;
}
