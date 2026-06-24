import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { FieldMetadataType } from '@/types/FieldMetadataType';

// Subset of FieldMetadataType supported by application/server variables.
// Variables are stored as encrypted strings; the type only drives how the
// value is serialized and which input is rendered in the settings UI.
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

// SELECT / MULTI_SELECT are the only types that carry options.
const OPTIONED_APPLICATION_VARIABLE_FIELD_METADATA_TYPES = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
] as const;

type OptionedApplicationVariableType =
  (typeof OPTIONED_APPLICATION_VARIABLE_FIELD_METADATA_TYPES)[number];

type NonOptionedApplicationVariableType = Exclude<
  ApplicationVariableType,
  OptionedApplicationVariableType
>;

// Manifest authors may declare typed values; everything is serialized to a
// string before being encrypted and persisted.
export type ApplicationVariableValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | null;

// `options` is required for SELECT / MULTI_SELECT and forbidden otherwise.
type TypedApplicationVariable =
  | {
      type: OptionedApplicationVariableType;
      options: ApplicationVariableOption[];
    }
  | {
      // Defaults to FieldMetadataType.TEXT when omitted.
      type?: NonOptionedApplicationVariableType;
      options?: never;
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
