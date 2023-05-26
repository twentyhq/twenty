import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './company-create-or-connect-without-account-owner.input';
import { CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput } from './company-upsert-with-where-unique-without-account-owner.input';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './company-create-many-account-owner-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput } from './company-update-with-where-unique-without-account-owner.input';
import { CompanyUpdateManyWithWhereWithoutAccountOwnerInput } from './company-update-many-with-where-without-account-owner.input';
import { CompanyScalarWhereInput } from './company-scalar-where.input';

@InputType()
export class CompanyUncheckedUpdateManyWithoutAccountOwnerNestedInput {

    @Field(() => [CompanyCreateWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyCreateWithoutAccountOwnerInput)
    create?: Array<CompanyCreateWithoutAccountOwnerInput>;

    @Field(() => [CompanyCreateOrConnectWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyCreateOrConnectWithoutAccountOwnerInput)
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutAccountOwnerInput>;

    @Field(() => [CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput)
    upsert?: Array<CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput>;

    @Field(() => CompanyCreateManyAccountOwnerInputEnvelope, {nullable:true})
    @Type(() => CompanyCreateManyAccountOwnerInputEnvelope)
    createMany?: CompanyCreateManyAccountOwnerInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    set?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    disconnect?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    delete?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput)
    update?: Array<CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput>;

    @Field(() => [CompanyUpdateManyWithWhereWithoutAccountOwnerInput], {nullable:true})
    @Type(() => CompanyUpdateManyWithWhereWithoutAccountOwnerInput)
    updateMany?: Array<CompanyUpdateManyWithWhereWithoutAccountOwnerInput>;

    @Field(() => [CompanyScalarWhereInput], {nullable:true})
    @Type(() => CompanyScalarWhereInput)
    deleteMany?: Array<CompanyScalarWhereInput>;
}
