import { registerEnumType } from '@nestjs/graphql';

export enum PipelineStageScalarFieldEnum {
    id = "id",
    name = "name",
    type = "type",
    color = "color",
    index = "index",
    pipelineId = "pipelineId",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(PipelineStageScalarFieldEnum, { name: 'PipelineStageScalarFieldEnum', description: undefined })
