import { registerEnumType } from '@nestjs/graphql';

export enum PipelineProgressScalarFieldEnum {
    id = "id",
    amount = "amount",
    closeDate = "closeDate",
    closeConfidence = "closeConfidence",
    pipelineId = "pipelineId",
    pipelineStageId = "pipelineStageId",
    pointOfContactId = "pointOfContactId",
    progressableType = "progressableType",
    progressableId = "progressableId",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(PipelineProgressScalarFieldEnum, { name: 'PipelineProgressScalarFieldEnum', description: undefined })
