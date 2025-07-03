export type WorkspaceMigrationObjectFieldInput = {
  uniqueIdentifier: string;
  name: string;
  label: string;
  type: string;
  description?: string;
};

export type WorkspaceMigrationObjectInput = {
  uniqueIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  fields?: WorkspaceMigrationObjectFieldInput[];
};
