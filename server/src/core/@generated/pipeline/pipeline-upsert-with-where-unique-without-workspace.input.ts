import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineUpdateWithoutWorkspaceInput } from './pipeline-update-without-workspace.input';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';

@InputType()
export class PipelineUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;

    @Field(() => PipelineUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PipelineUpdateWithoutWorkspaceInput)
    update!: PipelineUpdateWithoutWorkspaceInput;

    @Field(() => PipelineCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PipelineCreateWithoutWorkspaceInput)
    create!: PipelineCreateWithoutWorkspaceInput;
}
