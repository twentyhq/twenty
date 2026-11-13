export type WorkspaceTableRebuildPlanIdentitySequence = {
  columnName: string;
  sequenceRelationName: string;
  lastValue: string;
  isCalled: boolean;
};

export type WorkspaceTableRebuildPlanConstraint = {
  constraintName: string;
  definition: string;
};

export type WorkspaceTableRebuildPlanIncomingForeignKey =
  WorkspaceTableRebuildPlanConstraint & {
    escapedQualifiedTableName: string;
  };

export type WorkspaceTableRebuildPlan = {
  copiedColumnNames: string[];
  identitySequences: WorkspaceTableRebuildPlanIdentitySequence[];
  constraints: WorkspaceTableRebuildPlanConstraint[];
  incomingForeignKeys: WorkspaceTableRebuildPlanIncomingForeignKey[];
  indexDefinitions: string[];
};
