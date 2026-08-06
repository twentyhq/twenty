import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from '@/application/applicationVariablesType';

type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  // Keeps the variable declared so its stored value survives and is still
  // injected, while dropping it from what an admin is asked to configure.
  isDeprecated?: boolean;
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
};

export type ServerVariables = Record<string, ServerVariableSchema>;
