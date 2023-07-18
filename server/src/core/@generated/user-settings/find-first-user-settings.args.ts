import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserSettingsWhereInput } from './user-settings-where.input';
import { Type } from 'class-transformer';
import { UserSettingsOrderByWithRelationInput } from './user-settings-order-by-with-relation.input';
import { UserSettingsWhereUniqueInput } from './user-settings-where-unique.input';
import { Int } from '@nestjs/graphql';
import { UserSettingsScalarFieldEnum } from './user-settings-scalar-field.enum';

@ArgsType()
export class FindFirstUserSettingsArgs {

    @Field(() => UserSettingsWhereInput, {nullable:true})
    @Type(() => UserSettingsWhereInput)
    where?: UserSettingsWhereInput;

    @Field(() => [UserSettingsOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<UserSettingsOrderByWithRelationInput>;

    @Field(() => UserSettingsWhereUniqueInput, {nullable:true})
    cursor?: UserSettingsWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [UserSettingsScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof UserSettingsScalarFieldEnum>;
}
