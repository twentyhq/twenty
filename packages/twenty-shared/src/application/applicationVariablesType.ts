type ApplicationVariable = {
  universalIdentifier: string;
  value?: string;
  description?: string;
  isSecret?: boolean;
};

export type ApplicationVariables = Record<string, ApplicationVariable>;
