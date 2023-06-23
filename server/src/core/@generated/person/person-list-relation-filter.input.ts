import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereInput } from './person-where.input';

@InputType()
export class PersonListRelationFilter {

    @Field(() => PersonWhereInput, {nullable:true})
    every?: PersonWhereInput;

    @Field(() => PersonWhereInput, {nullable:true})
    some?: PersonWhereInput;

    @Field(() => PersonWhereInput, {nullable:true})
    none?: PersonWhereInput;
}
