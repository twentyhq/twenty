import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './company-create-or-connect-without-account-owner.input';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './company-create-many-account-owner-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CompanyCreateNestedManyWithoutAccountOwnerInput {

    @HideField()
    create?: Array<CompanyCreateWithoutAccountOwnerInput>;

    @HideField()
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutAccountOwnerInput>;

    @HideField()
    createMany?: CompanyCreateManyAccountOwnerInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;
}
