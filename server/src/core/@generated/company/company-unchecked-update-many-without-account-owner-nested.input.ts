import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './company-create-or-connect-without-account-owner.input';
import { CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput } from './company-upsert-with-where-unique-without-account-owner.input';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './company-create-many-account-owner-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput } from './company-update-with-where-unique-without-account-owner.input';
import { CompanyUpdateManyWithWhereWithoutAccountOwnerInput } from './company-update-many-with-where-without-account-owner.input';
import { CompanyScalarWhereInput } from './company-scalar-where.input';

@InputType()
export class CompanyUncheckedUpdateManyWithoutAccountOwnerNestedInput {

    @HideField()
    create?: Array<CompanyCreateWithoutAccountOwnerInput>;

    @HideField()
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutAccountOwnerInput>;

    @HideField()
    upsert?: Array<CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput>;

    @HideField()
    createMany?: CompanyCreateManyAccountOwnerInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    set?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    disconnect?: Array<CompanyWhereUniqueInput>;

    @HideField()
    delete?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;

    @HideField()
    update?: Array<CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput>;

    @HideField()
    updateMany?: Array<CompanyUpdateManyWithWhereWithoutAccountOwnerInput>;

    @HideField()
    deleteMany?: Array<CompanyScalarWhereInput>;
}
