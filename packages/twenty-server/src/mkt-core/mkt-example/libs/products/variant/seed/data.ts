import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { PRODUCT_VARIANT_DATA_SEEDS, VARIANT_TABLE_NAME } from '../constants';

export const prefillProductVariants = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${VARIANT_TABLE_NAME}`, [
      'id',
      'name',
      'productId',
      'sku',
      'price',
      'stock',
      'isActive',
      'position',
      'createdAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(PRODUCT_VARIANT_DATA_SEEDS)
    .execute();
};
