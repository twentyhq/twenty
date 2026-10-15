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

export const APPLICATION_VARIABLE_SCOPES = ['WORKSPACE', 'USER'] as const;

export type ApplicationVariableScope =
  (typeof APPLICATION_VARIABLE_SCOPES)[number];

export const isApplicationVariableScope = (
  scope: string,
): scope is ApplicationVariableScope =>
  (APPLICATION_VARIABLE_SCOPES as readonly string[]).includes(scope);

export const DEFAULT_APPLICATION_VARIABLE_SCOPE: ApplicationVariableScope =
  'WORKSPACE';

export type ApplicationVariableValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | null;

type TypedApplicationVariable = {
  label?: string;
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
  isRequired?: boolean;
  isDeprecated?: boolean;
  scope?: ApplicationVariableScope;
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
