import { FieldActorSource } from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import {
  AIRBNB_ID,
  ANTHROPIC_ID,
  FIGMA_ID,
  NOTION_ID,
  STRIPE_ID,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';

export const BRIAN_CHESKY_ID = 'a2e78a5e-338b-46df-8811-fa08c7d19d35'; // Airbnb
export const DARIO_AMODEI_ID = '93c72d2e-e65c-44c4-99ad-f87f50349dcf'; // Anthropic
export const PATRICK_COLLISON_ID = 'edf6d445-13a7-4373-9a47-8f89e8c0a877'; // Stripe
export const DYLAN_FIELD_ID = 'b1e26fa6-c757-4c88-abfa-4b11f5cf3acf'; // Figma
export const IVAN_ZHAO_ID = '7a93d1e5-3f74-4945-8a65-d7f996083f72'; // Notion

export const prefillPeople = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.person`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'city',
      'emailsPrimaryEmail',
      'avatarUrl',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
      'phonesPrimaryPhoneNumber',
      'phonesPrimaryPhoneCallingCode',
      'companyId',
    ])
    .orIgnore()
    .values([
      {
        id: BRIAN_CHESKY_ID,
        nameFirstName: 'Brian',
        nameLastName: 'Chesky',
        city: 'San Francisco',
        emailsPrimaryEmail: 'chesky@airbnb.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/founders/brian-chesky.jpg',
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        phonesPrimaryPhoneNumber: '123456789',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: AIRBNB_ID,
      },
      {
        id: DARIO_AMODEI_ID,
        nameFirstName: 'Dario',
        nameLastName: 'Amodei',
        city: 'San Francisco',
        emailsPrimaryEmail: 'amodei@anthropic.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/founders/dario-amodei.jpg',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        phonesPrimaryPhoneNumber: '555123456',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: ANTHROPIC_ID,
      },
      {
        id: PATRICK_COLLISON_ID,
        nameFirstName: 'Patrick',
        nameLastName: 'Collison',
        city: 'San Francisco',
        emailsPrimaryEmail: 'collison@stripe.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/founders/patrick-collison.jpg',
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        phonesPrimaryPhoneNumber: '987625341',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: STRIPE_ID,
      },
      {
        id: DYLAN_FIELD_ID,
        nameFirstName: 'Dylan',
        nameLastName: 'Field',
        city: 'San Francisco',
        emailsPrimaryEmail: 'field@figma.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/founders/dylan-field.jpg',
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        phonesPrimaryPhoneNumber: '098822619',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: FIGMA_ID,
      },
      {
        id: IVAN_ZHAO_ID,
        nameFirstName: 'Ivan',
        nameLastName: 'Zhao',
        city: 'San Francisco',
        emailsPrimaryEmail: 'zhao@notion.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/founders/ivan-zhao.jpg',
        position: 5,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        phonesPrimaryPhoneNumber: '882261739',
        phonesPrimaryPhoneCallingCode: '+1',
        companyId: NOTION_ID,
      },
    ])
    .returning('*')
    .execute();
};
