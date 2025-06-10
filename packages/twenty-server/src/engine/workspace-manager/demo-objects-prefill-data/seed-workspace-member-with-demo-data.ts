
import { DEMO_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/demo/users';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

export const DEMO_SEED_WORKSPACE_MEMBER_IDS = {
  NOAH: '20202020-0687-4c41-b707-ed1bfca972a2',
  HUGO: '20202020-77d5-4cb6-b60a-f4a835a85d62',
  TIM: '20202020-1553-45c6-a028-5a9064cce07e',
};

export const seedWorkspaceMemberWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.workspaceMember`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'locale',
      'colorScheme',
      'userEmail',
      'userId',
    ])
    .orIgnore()
    .values([
      {
        id: DEMO_SEED_WORKSPACE_MEMBER_IDS.NOAH,
        nameFirstName: 'Noah',
        nameLastName: 'A',
        locale: SOURCE_LOCALE,
        colorScheme: 'Light',
        userEmail: 'noah@demo.dev',
        userId: DEMO_SEED_USER_IDS.NOAH,
      },
      {
        id: DEMO_SEED_WORKSPACE_MEMBER_IDS.HUGO,
        nameFirstName: 'Hugo',
        nameLastName: 'I',
        locale: SOURCE_LOCALE,
        colorScheme: 'Light',
        userEmail: 'hugo@demo.dev',
        userId: DEMO_SEED_USER_IDS.HUGO,
      },
      {
        id: DEMO_SEED_WORKSPACE_MEMBER_IDS.TIM,
        nameFirstName: 'Tim',
        nameLastName: 'Apple',
        locale: SOURCE_LOCALE,
        colorScheme: 'Light',
        userEmail: 'tim@apple.dev',
        userId: DEMO_SEED_USER_IDS.TIM,
      },
    ])
    .execute();
};
