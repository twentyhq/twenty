import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ATTRIBUTE_VALUE_DATA_SEEDS, ATTRIBUTE_VALUE_TABLE_NAME } from '../constants';

export const prefillAttributeValues = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${ATTRIBUTE_VALUE_TABLE_NAME}`, [
      'id',
      'attributeId',
      'value',
      'displayOrder',
      'position',
      'createdAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(ATTRIBUTE_VALUE_DATA_SEEDS)
    .execute();
};
