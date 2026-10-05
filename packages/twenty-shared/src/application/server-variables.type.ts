import {
  type ApplicationVariableOption,
  type ApplicationVariableValueType,
} from '@/application/applicationVariablesType';

type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  isDeprecated?: boolean;
  type?: ApplicationVariableValueType;
  options?: ApplicationVariableOption[];
};

export type ServerVariables = Record<string, ServerVariableSchema>;
