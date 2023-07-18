import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineCreateOrConnectWithoutWorkspaceInput {

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;

    @HideField()
    create!: PipelineCreateWithoutWorkspaceInput;
}
