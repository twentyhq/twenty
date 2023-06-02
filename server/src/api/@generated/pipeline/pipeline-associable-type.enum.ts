import { registerEnumType } from '@nestjs/graphql';

export enum PipelineAssociableType {
  Person = 'Person',
  Company = 'Company',
}

registerEnumType(PipelineAssociableType, {
  name: 'PipelineAssociableType',
  description: undefined,
});
