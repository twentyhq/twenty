import { registerEnumType } from '@nestjs/graphql';

export enum PipelineProgressScalarFieldEnum {
    id = "id",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    deletedAt = "deletedAt",
    pipelineId = "pipelineId",
    pipelineStageId = "pipelineStageId",
    progressableType = "progressableType",
    progressableId = "progressableId",
    workspaceId = "workspaceId"
}


registerEnumType(PipelineProgressScalarFieldEnum, { name: 'PipelineProgressScalarFieldEnum', description: undefined })
