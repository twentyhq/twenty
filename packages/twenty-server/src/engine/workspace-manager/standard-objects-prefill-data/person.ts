import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

// FixMe: Is this file a duplicate of src/database/typeorm-seeds/workspace/people.ts
export const personPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.person`, [
      'nameFirstName',
      'nameLastName',
      'city',
      'emailsPrimaryEmail',
      'avatarUrl',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'phonesPrimaryPhoneNumber',
      'phonesPrimaryPhoneCountryCode',
      'companyId',
    ])
    .orIgnore()
    .values([])
    .returning('*')
    .execute();
};
