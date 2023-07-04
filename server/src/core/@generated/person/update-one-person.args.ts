import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonUpdateInput } from './person-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { PersonWhereUniqueInput } from './person-where-unique.input';

@ArgsType()
export class UpdateOnePersonArgs {

    @Field(() => PersonUpdateInput, {nullable:false})
    @Type(() => PersonUpdateInput)
    @Type(() => PersonUpdateInput)
    @ValidateNested({each: true})
    data!: PersonUpdateInput;

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;
}
