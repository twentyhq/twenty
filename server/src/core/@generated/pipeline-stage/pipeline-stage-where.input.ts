import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { IntNullableFilter } from '../prisma/int-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { PipelineProgressListRelationFilter } from '../pipeline-progress/pipeline-progress-list-relation-filter.input';
import { PipelineRelationFilter } from '../pipeline/pipeline-relation-filter.input';
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

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    type?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    color?: StringFilter;

    @Field(() => IntNullableFilter, {nullable:true})
    index?: IntNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    pipelineId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => PipelineProgressListRelationFilter, {nullable:true})
    pipelineProgresses?: PipelineProgressListRelationFilter;

    @Field(() => PipelineRelationFilter, {nullable:true})
    pipeline?: PipelineRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
