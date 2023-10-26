import { IFieldMetadata } from './field.metadata';

export interface IObjectMetadata {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  fields: IFieldMetadata[];
}
