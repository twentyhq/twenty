import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './company-create-or-connect-without-account-owner.input';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './company-create-many-account-owner-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';

@InputType()
export class CompanyCreateNestedManyWithoutAccountOwnerInput {

    @Field(() => [CompanyCreateWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyCreateWithoutAccountOwnerInput)
    create?: Array<CompanyCreateWithoutAccountOwnerInput>;

    @Field(() => [CompanyCreateOrConnectWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyCreateOrConnectWithoutAccountOwnerInput)
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutAccountOwnerInput>;

    @Field(() => CompanyCreateManyAccountOwnerInputEnvelope, {nullable:true})
    @Type(() => CompanyCreateManyAccountOwnerInputEnvelope)
    createMany?: CompanyCreateManyAccountOwnerInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;
}
