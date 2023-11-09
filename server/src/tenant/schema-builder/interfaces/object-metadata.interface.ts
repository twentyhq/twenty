import { FieldMetadataInterface } from './field-metadata.interface';

export interface ObjectMetadataInterface {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  targetTableName: string;
  fields: FieldMetadataInterface[];
}
