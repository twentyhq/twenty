import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from '@/application/applicationVariablesType';

type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
};

export type ServerVariables = Record<string, ServerVariableSchema>;
