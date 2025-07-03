export type WorkspaceMigrationObjectFieldInput = {
  name: string;
  label: string;
  type: string;
  description?: string;
};

export type WorkspaceMigrationObjectInput = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  fields?: WorkspaceMigrationObjectFieldInput[];
};
