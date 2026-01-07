import { type GraphConfiguration } from './graph-configuration.type';

export type BaseGraphConfiguration = Pick<
  GraphConfiguration,
  'configurationType' | 'aggregateFieldMetadataId' | 'aggregateOperation'
>;
