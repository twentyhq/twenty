import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { PipelineRelationFilter } from '../pipeline/pipeline-relation-filter.input';
import { PipelineProgressListRelationFilter } from '../pipeline-progress/pipeline-progress-list-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class PipelineStageWhereInput {

    @Field(() => [PipelineStageWhereInput], {nullable:true})
    AND?: Array<PipelineStageWhereInput>;

    @Field(() => [PipelineStageWhereInput], {nullable:true})
    OR?: Array<PipelineStageWhereInput>;

    @Field(() => [PipelineStageWhereInput], {nullable:true})
    NOT?: Array<PipelineStageWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    type?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    color?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    pipelineId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @Field(() => PipelineRelationFilter, {nullable:true})
    pipeline?: PipelineRelationFilter;

    @Field(() => PipelineProgressListRelationFilter, {nullable:true})
    pipelineProgresses?: PipelineProgressListRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
