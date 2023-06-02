import { registerEnumType } from '@nestjs/graphql';

export enum PipelineAssociationScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  pipelineId = 'pipelineId',
  pipelineStageId = 'pipelineStageId',
  associableType = 'associableType',
  associableId = 'associableId',
}

registerEnumType(PipelineAssociationScalarFieldEnum, {
  name: 'PipelineAssociationScalarFieldEnum',
  description: undefined,
});
