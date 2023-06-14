import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class FindUniquePersonArgs {
  @Field(() => PersonWhereUniqueInput, { nullable: false })
  @Type(() => PersonWhereUniqueInput)
  where!: PersonWhereUniqueInput;
}
