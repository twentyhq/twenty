import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { FieldMetadataType } from '@/types/FieldMetadataType';

export const APPLICATION_VARIABLE_FIELD_METADATA_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.ARRAY,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
] as const;

export type ApplicationVariableType =
  (typeof APPLICATION_VARIABLE_FIELD_METADATA_TYPES)[number];

export type ApplicationVariableOption = {
  label: string;
  value: string;
};

export type ApplicationVariableValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | null;

type TypedApplicationVariable = {
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
  // Keeps the variable declared so its stored value survives and is still
  // injected, while dropping it from what a user is asked to configure.
  isDeprecated?: boolean;
};

type SecretApplicationVariable = SyncableEntityOptions &
  TypedApplicationVariable & {
    description?: string;
    isSecret: true;
  };

type NonSecretApplicationVariable = SyncableEntityOptions &
  TypedApplicationVariable & {
    value?: ApplicationVariableValue;
    description?: string;
    isSecret?: false;
  };

export type ApplicationVariable =
  | SecretApplicationVariable
  | NonSecretApplicationVariable;

export type ApplicationVariables = Record<string, ApplicationVariable>;
