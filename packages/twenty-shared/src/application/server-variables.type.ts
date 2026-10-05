import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from '@/application/applicationVariablesType';

type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  isDeprecated?: boolean;
  type?: ApplicationVariableType;
  options?: ApplicationVariableOption[];
  // FILES only: file urls never expire unless the urls are signed (default false)
  signUrl?: boolean;
};

export type ServerVariables = Record<string, ServerVariableSchema>;
