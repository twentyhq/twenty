import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addOpportunityTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'opportunity',
    action: 'create',
  },
  {
    name: 'opportunity',
    action: 'alter',
    columns: [
      {
        columnName: 'amountAmountMicros',
        columnType: 'numeric',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'amountCurrencyCode',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'probability',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'0'",
      },
      {
        columnName: 'closeDate',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'pipelineStepId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'pointOfContactId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];
