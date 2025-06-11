import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'mga';

export const DEV_SEED_MGA_IDS = {
  BROKER_LINK: '193a83a1-9bd9-4b70-9f84-f516de2c380c',
  BROKER_WORLD: '293a83a1-9bd9-4b70-9f84-f516de2c380c',
  BROKER_NATION: '393a83a1-9bd9-4b70-9f84-f516de2c380c',
  BROKER_UNITED: '493a83a1-9bd9-4b70-9f84-f516de2c380c',
  BROKER_ALLIANCE: '593a83a1-9bd9-4b70-9f84-f516de2c380c',
};

export const seedMGAs = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'naic',
      'phone',
      'email',
      'fullAddress',
      'isActive',
      'lineOfBusiness',
      'commissionStructure',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_MGA_IDS.BROKER_LINK,
        name: 'BrokerLink Insurance',
        naic: '12345',
        phone: '(555) 123-4567',
        email: 'contact@brokerlink.com',
        fullAddress: '123 Insurance Way, Chicago, IL 60601',
        isActive: true,
        lineOfBusiness: ['Property', 'Casualty', 'Commercial'],
        commissionStructure: {
          newBusiness: 15,
          renewal: 10,
        },
        position: 0,
      },
      {
        id: DEV_SEED_MGA_IDS.BROKER_WORLD,
        name: 'BrokerWorld Insurance',
        naic: '23456',
        phone: '(555) 234-5678',
        email: 'info@brokerworld.com',
        fullAddress: '456 Broker Blvd, New York, NY 10001',
        isActive: true,
        lineOfBusiness: ['Life', 'Health', 'Personal'],
        commissionStructure: {
          newBusiness: 12,
          renewal: 8,
        },
        position: 1,
      },
      {
        id: DEV_SEED_MGA_IDS.BROKER_NATION,
        name: 'BrokerNation Insurance',
        naic: '34567',
        phone: '(555) 345-6789',
        email: 'support@brokernation.com',
        fullAddress: '789 Nation Ave, Los Angeles, CA 90001',
        isActive: true,
        lineOfBusiness: ['Auto', 'Home', 'Umbrella'],
        commissionStructure: {
          newBusiness: 14,
          renewal: 9,
        },
        position: 2,
      },
      {
        id: DEV_SEED_MGA_IDS.BROKER_UNITED,
        name: 'BrokerUnited Insurance',
        naic: '45678',
        phone: '(555) 456-7890',
        email: 'contact@brokerunited.com',
        fullAddress: '321 United St, Houston, TX 77001',
        isActive: true,
        lineOfBusiness: ['Commercial', 'Professional', 'Cyber'],
        commissionStructure: {
          newBusiness: 16,
          renewal: 11,
        },
        position: 3,
      },
      {
        id: DEV_SEED_MGA_IDS.BROKER_ALLIANCE,
        name: 'BrokerAlliance Insurance',
        naic: '56789',
        phone: '(555) 567-8901',
        email: 'info@brokeralliance.com',
        fullAddress: '654 Alliance Rd, Miami, FL 33101',
        isActive: true,
        lineOfBusiness: ['Marine', 'Aviation', 'Specialty'],
        commissionStructure: {
          newBusiness: 13,
          renewal: 7,
        },
        position: 4,
      },
    ])
    .execute();
}; 