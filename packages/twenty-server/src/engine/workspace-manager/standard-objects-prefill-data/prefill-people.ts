import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  AIRBNB_ID,
  ANTHROPIC_ID,
  FIGMA_ID,
  NOTION_ID,
  STRIPE_ID,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';

export const prefillPeople = async (
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
      'phonesPrimaryPhoneCallingCode',
      'companyId',
    ])
    .orIgnore()
    .values([
      {
        nameFirstName: 'Brian',
        nameLastName: 'Chesky',
        city: 'San Francisco',
        emailsPrimaryEmail: 'chesky@airbnb.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-3.png',
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '123456789',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: AIRBNB_ID,
      },
      {
        nameFirstName: 'Dario',
        nameLastName: 'Amodei',
        city: 'San Francisco',
        emailsPrimaryEmail: 'amodei@anthropic.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-89.png',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '555123456',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: ANTHROPIC_ID,
      },
      {
        nameFirstName: 'Patrick',
        nameLastName: 'Collison',
        city: 'San Francisco',
        emailsPrimaryEmail: 'collison@stripe.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-47.png',
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '987625341',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: STRIPE_ID,
      },
      {
        nameFirstName: 'Dylan',
        nameLastName: 'Field',
        city: 'San Francisco',
        emailsPrimaryEmail: 'field@figma.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-40.png',
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '098822619',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: FIGMA_ID,
      },
      {
        nameFirstName: 'Ivan',
        nameLastName: 'Zhao',
        city: 'San Francisco',
        emailsPrimaryEmail: 'zhao@notion.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-68.png',
        position: 5,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '882261739',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: NOTION_ID,
      },
    ])
    .returning('*')
    .execute();
};
