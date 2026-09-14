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
  label?: string;
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
  /**
   * The application is not usable in a workspace until this variable has a value. Mirrors
   * `isRequired` on server variables, which are instance-wide: this one marks what each
   * workspace has to capture for itself (its own tenant id, its own credentials) — precisely
   * the values an application cannot ship a default for.
   *
   * Ignored when `isDeprecated` is true: a deprecated variable is excluded from the check.
   */
  isRequired?: boolean;
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
