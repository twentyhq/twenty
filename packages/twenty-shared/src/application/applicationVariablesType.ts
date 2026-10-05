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
  FieldMetadataType.FILES,
] as const;

export type ApplicationVariableType =
  (typeof APPLICATION_VARIABLE_FIELD_METADATA_TYPES)[number];

// Files are uploaded from the settings, so a manifest cannot carry a value for them
export type ApplicationVariableValueType = Exclude<
  ApplicationVariableType,
  typeof FieldMetadataType.FILES
>;

export type ApplicationVariableOption = {
  label: string;
  value: string;
};

export type ApplicationVariableFileValue = {
  fileId: string;
  label: string;
  extension?: string;
  url?: string;
};

export type ApplicationVariableValue =
  | string
  | number
  | boolean
  | string[]
  | ApplicationVariableFileValue[]
  | Record<string, unknown>
  | null;

type TypedApplicationVariable = {
  label?: string;
  type?: ApplicationVariableValueType;
  options?: ApplicationVariableOption[];
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

// `isSecret` stays declared so it keeps discriminating the union: a config
// built outside the call, with `isSecret: boolean`, must still match the
// secret or non-secret variant and never this one.
type FilesApplicationVariable = SyncableEntityOptions & {
  label?: string;
  description?: string;
  type: typeof FieldMetadataType.FILES;
  isRequired?: boolean;
  isDeprecated?: boolean;
  isSecret?: never;
  // File urls never expire unless the urls are signed (default false)
  signUrl?: boolean;
};

export type ApplicationVariable =
  | SecretApplicationVariable
  | NonSecretApplicationVariable
  | FilesApplicationVariable;

export type ApplicationVariables = Record<string, ApplicationVariable>;
