import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@InputType()
export class CompanyCreateManyWorkspaceInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    domainName!: string;

    @Field(() => String, {nullable:false})
    address!: string;

    @Field(() => Int, {nullable:true})
    employees?: number;

    @Field(() => String, {nullable:true})
    accountOwnerId?: string;
}
