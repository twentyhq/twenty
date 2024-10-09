import { EntityManager } from 'typeorm';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {
  AIRBNB_ID,
  FIGMA_ID,
  NOTION_ID,
  QONTO_ID,
  STRIPE_ID,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/company';

// FixMe: Is this file a duplicate of src/database/typeorm-seeds/workspace/people.ts
export const personPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
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
        phonesPrimaryPhoneNumber: '1234567890',
        phonesPrimaryPhoneCountryCode: '+1',
        companyId: AIRBNB_ID,
      },
      {
        nameFirstName: 'Alexandre',
        nameLastName: 'Prot',
        city: 'Paris',
        emailsPrimaryEmail: 'prot@qonto.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-89.png',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '677118822',
        phonesPrimaryPhoneCountryCode: '+33',
        companyId: QONTO_ID,
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
        phonesPrimaryPhoneCountryCode: '+1',
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
        phonesPrimaryPhoneNumber: '09882261',
        phonesPrimaryPhoneCountryCode: '+1',
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
        phonesPrimaryPhoneNumber: '88226173',
        phonesPrimaryPhoneCountryCode: '+1',
        companyId: NOTION_ID,
      },
    ])
    .returning('*')
    .execute();
};
