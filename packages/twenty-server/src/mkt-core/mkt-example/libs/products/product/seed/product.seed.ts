import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { PRODUCT_DATA_SEEDS, TABLE_NAME } from './index';

export const prefillProducts = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${TABLE_NAME}`, [
      'id',
      'productCode',
      'productName',
      'productCategory',
      'productType',
      'basePrice',
      'licenseDurationMonths',
      'isActive',
      'position',
      'createdAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(PRODUCT_DATA_SEEDS)
    .execute();
};
