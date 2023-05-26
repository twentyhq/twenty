import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserWhereInput } from './user-where.input';
import { Type } from 'class-transformer';
import { UserOrderByWithRelationInput } from './user-order-by-with-relation.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Int } from '@nestjs/graphql';
import { UserScalarFieldEnum } from './user-scalar-field.enum';

@ArgsType()
export class FindFirstUserArgs {

    @Field(() => UserWhereInput, {nullable:true})
    @Type(() => UserWhereInput)
    where?: UserWhereInput;

    @Field(() => [UserOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<UserOrderByWithRelationInput>;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    cursor?: UserWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [UserScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof UserScalarFieldEnum>;
}
