import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonWhereInput } from './person-where.input';
import { Type } from 'class-transformer';
import { PersonOrderByWithRelationInput } from './person-order-by-with-relation.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PersonScalarFieldEnum } from './person-scalar-field.enum';

@ArgsType()
export class FindManyPersonArgs {

    @Field(() => PersonWhereInput, {nullable:true})
    @Type(() => PersonWhereInput)
    where?: PersonWhereInput;

    @Field(() => [PersonOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<PersonOrderByWithRelationInput>;

    @Field(() => PersonWhereUniqueInput, {nullable:true})
    cursor?: PersonWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [PersonScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof PersonScalarFieldEnum>;
}
