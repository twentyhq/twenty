import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { VARIANT_ATTRIBUTE_VALUE_DATA_SEEDS, VARIANT_ATTRIBUTE_VALUE_TABLE_NAME } from '../constants';

export const prefillVariantAttributeValues = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${VARIANT_ATTRIBUTE_VALUE_TABLE_NAME}`, [
      'id',
      'name',
      'variantId',
      'attributeId',
      'position',
      'createdAt',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(VARIANT_ATTRIBUTE_VALUE_DATA_SEEDS)
    .execute();
};
