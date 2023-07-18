import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereInput } from './person-where.input';

@InputType()
export class PersonRelationFilter {

    @Field(() => PersonWhereInput, {nullable:true})
    is?: PersonWhereInput;

    @Field(() => PersonWhereInput, {nullable:true})
    isNot?: PersonWhereInput;
}
