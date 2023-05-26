import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { UserRelationFilter } from '../user/user-relation-filter.input';

@InputType()
export class RefreshTokenWhereInput {

    @Field(() => [RefreshTokenWhereInput], {nullable:true})
    AND?: Array<RefreshTokenWhereInput>;

    @Field(() => [RefreshTokenWhereInput], {nullable:true})
    OR?: Array<RefreshTokenWhereInput>;

    @Field(() => [RefreshTokenWhereInput], {nullable:true})
    NOT?: Array<RefreshTokenWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    refreshToken?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    userId?: StringFilter;

    @Field(() => UserRelationFilter, {nullable:true})
    user?: UserRelationFilter;
}
