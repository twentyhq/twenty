import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithoutWorkspaceInput } from './company-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';

@InputType()
export class CompanyUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @HideField()
    update!: CompanyUpdateWithoutWorkspaceInput;

    @HideField()
    create!: CompanyCreateWithoutWorkspaceInput;
}
