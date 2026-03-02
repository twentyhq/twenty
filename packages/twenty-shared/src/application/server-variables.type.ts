type ServerVariableSchema = {
  description?: string;
  isSecret?: boolean;
  isRequired?: boolean;
};

export type ServerVariables = Record<string, ServerVariableSchema>;
