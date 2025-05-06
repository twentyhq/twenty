import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const AIRBNB_ID = 'c776ee49-f608-4a77-8cc8-6fe96ae1e43f';
export const QONTO_ID = 'f45ee421-8a3e-4aa5-a1cf-7207cc6754e1';
export const STRIPE_ID = '1f70157c-4ea5-4d81-bc49-e1401abfbb94';
export const FIGMA_ID = '9d5bcf43-7d38-4e88-82cb-d6d4ce638bf0';
export const NOTION_ID = '06290608-8bf0-4806-99ae-a715a6a93fad';

export const companyPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.company`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'addressAddressStreet1',
      'addressAddressStreet2',
      'addressAddressCity',
      'addressAddressState',
      'addressAddressPostcode',
      'addressAddressCountry',
      'employees',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values([
      {
        id: AIRBNB_ID,
        name: 'Airbnb',
        domainNamePrimaryLinkUrl: 'https://airbnb.com',
        addressAddressStreet1: '888 Brannan St',
        addressAddressStreet2: null,
        addressAddressCity: 'San Francisco',
        addressAddressState: 'CA',
        addressAddressPostcode: '94103',
        addressAddressCountry: 'United States',
        employees: 5000,
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: QONTO_ID,
        name: 'Qonto',
        domainNamePrimaryLinkUrl: 'https://qonto.com',
        addressAddressStreet1: '18 rue de navarrin',
        addressAddressStreet2: null,
        addressAddressCity: 'Paris',
        addressAddressState: null,
        addressAddressPostcode: '75009',
        addressAddressCountry: 'France',
        employees: 800,
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: STRIPE_ID,
        name: 'Stripe',
        domainNamePrimaryLinkUrl: 'https://stripe.com',
        addressAddressStreet1: 'Eutaw Street',
        addressAddressStreet2: null,
        addressAddressCity: 'Dublin',
        addressAddressState: null,
        addressAddressPostcode: null,
        addressAddressCountry: 'Ireland',
        employees: 8000,
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: FIGMA_ID,
        name: 'Figma',
        domainNamePrimaryLinkUrl: 'https://figma.com',
        addressAddressStreet1: '760 Market St',
        addressAddressStreet2: 'Floor 10',
        addressAddressCity: 'San Francisco',
        addressAddressState: null,
        addressAddressPostcode: '94102',
        addressAddressCountry: 'United States',
        employees: 800,
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: NOTION_ID,
        name: 'Notion',
        domainNamePrimaryLinkUrl: 'https://notion.com',
        addressAddressStreet1: '2300 Harrison St',
        addressAddressStreet2: null,
        addressAddressCity: 'San Francisco',
        addressAddressState: 'CA',
        addressAddressPostcode: '94110',
        addressAddressCountry: 'United States',
        employees: 400,
        position: 5,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
    ])
    .returning('*')
    .execute();
};
