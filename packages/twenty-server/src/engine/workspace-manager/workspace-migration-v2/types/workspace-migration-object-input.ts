import { FieldMetadataType } from 'twenty-shared/types';

export type WorkspaceMigrationObjectFieldInput = {
  uniqueIdentifier: string;
  name: string;
  label: string;
  defaultValue: unknown;
  type: FieldMetadataType;
  description?: string;
  // TODO this should extend FieldMetadataEntity
};

export type WorkspaceMigrationObjectInput = {
  uniqueIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  fields: WorkspaceMigrationObjectFieldInput[];
  // TODO this should extend ObjectMetadataEntity
};
