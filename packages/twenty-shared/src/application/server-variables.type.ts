import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from '@/application/applicationVariablesType';

type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  // Defaults to FieldMetadataType.TEXT when omitted.
  type?: ApplicationVariableType;
  // Only used for SELECT / MULTI_SELECT.
  options?: ApplicationVariableOption[];
};

export type ServerVariables = Record<string, ServerVariableSchema>;
