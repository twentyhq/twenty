import { FieldActorSource } from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import {
  AIRBNB_ID,
  ANTHROPIC_ID,
  FIGMA_ID,
  NOTION_ID,
  STRIPE_ID,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-companies';
import {
  BRIAN_CHESKY_ID,
  DARIO_AMODEI_ID,
  DYLAN_FIELD_ID,
  IVAN_ZHAO_ID,
  PATRICK_COLLISON_ID,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-people';

export const OPPORTUNITY_STRIPE_PLATFORM_MIGRATION_ID =
  '822639e5-9bf7-40f1-8882-a11140362339';
export const OPPORTUNITY_ANTHROPIC_AI_MODEL_ID =
  'fc747edc-cb00-4078-8d6b-1fab2611dae4';
export const OPPORTUNITY_NOTION_WORKSPACE_ID =
  '75de302f-1044-4957-8da4-1f67ebefd52b';
export const OPPORTUNITY_STRIPE_API_INTEGRATION_ID =
  '2beb07b0-340c-41d7-be33-5aa91757f329';
export const OPPORTUNITY_AIRBNB_ENTERPRISE_ID =
  '9543adcf-ec03-44e2-9233-3c2d3ebae98a';
export const OPPORTUNITY_FIGMA_DESIGN_ID =
  '9457f8e9-16ae-43b9-92ee-cbd21f3dded5';

export const prefillOpportunities = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  const workspaceMember = await entityManager
    .createQueryBuilder()
    .select('id')
    .from(`${schemaName}.workspaceMember`, 'workspaceMember')
    .limit(1)
    .getRawOne();

  const ownerId = workspaceMember?.id ?? null;

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.opportunity`, [
      'id',
      'name',
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'stage',
      'position',
      'companyId',
      'pointOfContactId',
      'ownerId',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
    ])
    .orIgnore()
    .values([
      {
        id: OPPORTUNITY_STRIPE_PLATFORM_MIGRATION_ID,
        name: 'Platform Migration',
        amountAmountMicros: 60000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-01-31T16:25:00.000Z'),
        stage: 'PROPOSAL',
        position: 1,
        companyId: STRIPE_ID,
        pointOfContactId: PATRICK_COLLISON_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: OPPORTUNITY_ANTHROPIC_AI_MODEL_ID,
        name: 'AI Model Training',
        amountAmountMicros: 100000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-02-15T16:25:00.000Z'),
        stage: 'CUSTOMER',
        position: 2,
        companyId: ANTHROPIC_ID,
        pointOfContactId: DARIO_AMODEI_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: OPPORTUNITY_NOTION_WORKSPACE_ID,
        name: 'Workspace Expansion',
        amountAmountMicros: 45000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-01-20T16:26:00.000Z'),
        stage: 'MEETING',
        position: 3,
        companyId: NOTION_ID,
        pointOfContactId: IVAN_ZHAO_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: OPPORTUNITY_STRIPE_API_INTEGRATION_ID,
        name: 'API Integration Deal',
        amountAmountMicros: 75000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-01-25T16:26:00.000Z'),
        stage: 'SCREENING',
        position: 4,
        companyId: STRIPE_ID,
        pointOfContactId: PATRICK_COLLISON_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: OPPORTUNITY_AIRBNB_ENTERPRISE_ID,
        name: 'Enterprise Plan Upgrade',
        amountAmountMicros: 50000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-03-10T16:26:00.000Z'),
        stage: 'NEW',
        position: 5,
        companyId: AIRBNB_ID,
        pointOfContactId: BRIAN_CHESKY_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
      {
        id: OPPORTUNITY_FIGMA_DESIGN_ID,
        name: 'Design Partnership',
        amountAmountMicros: 30000000000,
        amountCurrencyCode: 'USD',
        closeDate: new Date('2026-01-15T16:27:00.000Z'),
        stage: 'NEW',
        position: 6,
        companyId: FIGMA_ID,
        pointOfContactId: DYLAN_FIELD_ID,
        ownerId,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
      },
    ])
    .returning('*')
    .execute();
};
