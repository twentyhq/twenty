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
  category?: string;
  position?: number;
};

export type ServerVariables = Record<string, ServerVariableSchema>;
