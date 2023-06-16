import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutCompaniesInput } from './user-update-without-companies.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';

@InputType()
export class UserUpsertWithoutCompaniesInput {

    @Field(() => UserUpdateWithoutCompaniesInput, {nullable:false})
    @Type(() => UserUpdateWithoutCompaniesInput)
    update!: UserUpdateWithoutCompaniesInput;

    @Field(() => UserCreateWithoutCompaniesInput, {nullable:false})
    @Type(() => UserCreateWithoutCompaniesInput)
    create!: UserCreateWithoutCompaniesInput;
}
