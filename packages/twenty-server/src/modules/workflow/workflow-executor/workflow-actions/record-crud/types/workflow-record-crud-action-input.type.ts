// Re-export service types for workflow actions
// Workflow executors add workspaceId and rolePermissionConfig at runtime
export type { CreateRecordParams as WorkflowCreateRecordActionInput } from 'src/engine/core-modules/record-crud/types/create-record-params.type';
export type { UpdateRecordParams as WorkflowUpdateRecordActionInput } from 'src/engine/core-modules/record-crud/types/update-record-params.type';
export type { DeleteRecordParams as WorkflowDeleteRecordActionInput } from 'src/engine/core-modules/record-crud/types/delete-record-params.type';
export type { FindRecordsParams as WorkflowFindRecordsActionInput } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
export type { UpsertRecordParams as WorkflowUpsertRecordActionInput } from 'src/engine/core-modules/record-crud/types/upsert-record-params.type';
