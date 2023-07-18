import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressUncheckedCreateNestedManyWithoutPointOfContactInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-point-of-contact.input';

@InputType()
export class PersonUncheckedCreateWithoutCompanyInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    firstName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    lastName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    email!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    phone!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    city!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutPointOfContactInput, {nullable:true})
    PipelineProgress?: PipelineProgressUncheckedCreateNestedManyWithoutPointOfContactInput;
}
