import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutCompaniesInput } from './user-update-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';

@InputType()
export class UserUpsertWithoutCompaniesInput {

    @HideField()
    update!: UserUpdateWithoutCompaniesInput;

    @HideField()
    create!: UserCreateWithoutCompaniesInput;
}
