import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { PRODUCT_ATTRIBUTE_DATA_SEEDS, ATTRIBUTE_TABLE_NAME } from '../constants';

export const prefillProductAttributes = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${ATTRIBUTE_TABLE_NAME}`, [
      'id',
      'productId',
      'name',
      'displayOrder',
      'position',
      'createdAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(PRODUCT_ATTRIBUTE_DATA_SEEDS)
    .execute();
};
