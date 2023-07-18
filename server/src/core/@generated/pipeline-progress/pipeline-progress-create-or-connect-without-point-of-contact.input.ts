import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateWithoutPointOfContactInput } from './pipeline-progress-create-without-point-of-contact.input';

@InputType()
export class PipelineProgressCreateOrConnectWithoutPointOfContactInput {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @Field(() => PipelineProgressCreateWithoutPointOfContactInput, {nullable:false})
    @Type(() => PipelineProgressCreateWithoutPointOfContactInput)
    create!: PipelineProgressCreateWithoutPointOfContactInput;
}
