export type WorkspaceSchemaTableRebuildPlanIdentitySequence = {
  columnName: string;
  sequenceRelationName: string;
  lastValue: string;
  isCalled: boolean;
};

export type WorkspaceSchemaTableRebuildPlanConstraint = {
  constraintName: string;
  definition: string;
};

export type WorkspaceSchemaTableRebuildPlanIncomingForeignKey =
  WorkspaceSchemaTableRebuildPlanConstraint & {
    escapedQualifiedTableName: string;
  };

export type WorkspaceSchemaTableRebuildPlan = {
  copiedColumnNames: string[];
  identitySequences: WorkspaceSchemaTableRebuildPlanIdentitySequence[];
  constraints: WorkspaceSchemaTableRebuildPlanConstraint[];
  incomingForeignKeys: WorkspaceSchemaTableRebuildPlanIncomingForeignKey[];
  indexDefinitions: string[];
};
