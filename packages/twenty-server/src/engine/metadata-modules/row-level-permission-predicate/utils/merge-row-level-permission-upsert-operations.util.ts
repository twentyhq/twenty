import { type RowLevelPermissionUpsertOperations } from 'src/engine/metadata-modules/row-level-permission-predicate/types/row-level-permission-upsert-operations.type';

export const mergeRowLevelPermissionUpsertOperations = (
  operationsList: RowLevelPermissionUpsertOperations[],
): RowLevelPermissionUpsertOperations => ({
  rulesToCreate: operationsList.flatMap(({ rulesToCreate }) => rulesToCreate),
  rulesToUpdate: operationsList.flatMap(({ rulesToUpdate }) => rulesToUpdate),
  rulesToDelete: operationsList.flatMap(({ rulesToDelete }) => rulesToDelete),
  fieldPermissionsToUpdate: operationsList.flatMap(
    ({ fieldPermissionsToUpdate }) => fieldPermissionsToUpdate,
  ),
  predicatesToCreate: operationsList.flatMap(
    ({ predicatesToCreate }) => predicatesToCreate,
  ),
  predicatesToUpdate: operationsList.flatMap(
    ({ predicatesToUpdate }) => predicatesToUpdate,
  ),
  predicatesToDelete: operationsList.flatMap(
    ({ predicatesToDelete }) => predicatesToDelete,
  ),
  groupsToCreate: operationsList.flatMap(
    ({ groupsToCreate }) => groupsToCreate,
  ),
  groupsToUpdate: operationsList.flatMap(
    ({ groupsToUpdate }) => groupsToUpdate,
  ),
  groupsToDelete: operationsList.flatMap(
    ({ groupsToDelete }) => groupsToDelete,
  ),
});
