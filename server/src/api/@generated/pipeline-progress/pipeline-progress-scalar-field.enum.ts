import { registerEnumType } from '@nestjs/graphql';

export enum PipelineProgressScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  pipelineId = 'pipelineId',
  pipelineStageId = 'pipelineStageId',
  associableType = 'associableType',
  associableId = 'associableId',
}

registerEnumType(PipelineProgressScalarFieldEnum, {
  name: 'PipelineProgressScalarFieldEnum',
  description: undefined,
});
