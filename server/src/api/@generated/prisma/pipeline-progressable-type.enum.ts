import { registerEnumType } from '@nestjs/graphql';

export enum PipelineProgressableType {
  Person = 'Person',
  Company = 'Company',
}

registerEnumType(PipelineProgressableType, {
  name: 'PipelineProgressableType',
  description: undefined,
});
