import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'policy';

export const DEV_SEED_POLICY_IDS = {
  POLICY_ALPHA: '193a83a1-9bd9-4b70-9f84-f516de2c380d',
  POLICY_BETA: '293a83a1-9bd9-4b70-9f84-f516de2c380d',
  POLICY_GAMMA: '393a83a1-9bd9-4b70-9f84-f516de2c380d',
  POLICY_DELTA: '493a83a1-9bd9-4b70-9f84-f516de2c380d',
  POLICY_EPSILON: '593a83a1-9bd9-4b70-9f84-f516de2c380d',
};

export const seedPolicies = async (
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
      'policyNumber',
      'lineOfBusiness',
      'bindDate',
      'effectiveDate',
      'expirationDate',
      'premium',
      'coverages',
      'deductibles',
      'limits',
      'status',
      'mgaId',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_POLICY_IDS.POLICY_ALPHA,
        policyNumber: 'POL-2024-001',
        lineOfBusiness: 'Commercial Property',
        bindDate: '2024-01-01',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        premium: 5000,
        coverages: 'Property,Liability',
        deductibles: JSON.stringify([
          { type: 'Property', amount: 5000 }
        ]),
        limits: JSON.stringify([
          { type: 'Property', amount: 1000000 },
          { type: 'Liability', amount: 2000000 }
        ]),
        status: 'Active',
        mgaId: '193a83a1-9bd9-4b70-9f84-f516de2c380c', // BrokerLink
        position: 0,
      },
      {
        id: DEV_SEED_POLICY_IDS.POLICY_BETA,
        policyNumber: 'POL-2024-002',
        lineOfBusiness: 'Life Insurance',
        bindDate: '2024-02-01',
        effectiveDate: '2024-02-01',
        expirationDate: '2025-02-01',
        premium: 3000,
        coverages: 'Death Benefit,Disability',
        deductibles: JSON.stringify([]),
        limits: JSON.stringify([
          { type: 'Death Benefit', amount: 500000 },
          { type: 'Disability', amount: 100000 }
        ]),
        status: 'Active',
        mgaId: '293a83a1-9bd9-4b70-9f84-f516de2c380c', // BrokerWorld
        position: 1,
      },
      {
        id: DEV_SEED_POLICY_IDS.POLICY_GAMMA,
        policyNumber: 'POL-2024-003',
        lineOfBusiness: 'Auto Insurance',
        bindDate: '2024-03-01',
        effectiveDate: '2024-03-01',
        expirationDate: '2025-03-01',
        premium: 2000,
        coverages: 'Liability,Collision,Comprehensive',
        deductibles: JSON.stringify([
          { type: 'Collision', amount: 1000 },
          { type: 'Comprehensive', amount: 1000 }
        ]),
        limits: JSON.stringify([
          { type: 'Liability', amount: 300000 },
          { type: 'Collision', amount: 50000 },
          { type: 'Comprehensive', amount: 50000 }
        ]),
        status: 'Active',
        mgaId: '393a83a1-9bd9-4b70-9f84-f516de2c380c', // BrokerNation
        position: 2,
      },
      {
        id: DEV_SEED_POLICY_IDS.POLICY_DELTA,
        policyNumber: 'POL-2024-004',
        lineOfBusiness: 'Professional Liability',
        bindDate: '2024-04-01',
        effectiveDate: '2024-04-01',
        expirationDate: '2025-04-01',
        premium: 4000,
        coverages: 'Professional Liability,Cyber Liability',
        deductibles: JSON.stringify([
          { type: 'Professional Liability', amount: 2500 },
          { type: 'Cyber Liability', amount: 2500 }
        ]),
        limits: JSON.stringify([
          { type: 'Professional Liability', amount: 1000000 },
          { type: 'Cyber Liability', amount: 500000 }
        ]),
        status: 'Active',
        mgaId: '493a83a1-9bd9-4b70-9f84-f516de2c380c', // BrokerUnited
        position: 3,
      },
      {
        id: DEV_SEED_POLICY_IDS.POLICY_EPSILON,
        policyNumber: 'POL-2024-005',
        lineOfBusiness: 'Marine Insurance',
        bindDate: '2024-05-01',
        effectiveDate: '2024-05-01',
        expirationDate: '2025-05-01',
        premium: 6000,
        coverages: 'Hull,Cargo,Liability',
        deductibles: JSON.stringify([
          { type: 'Hull', amount: 10000 },
          { type: 'Cargo', amount: 10000 },
          { type: 'Liability', amount: 10000 }
        ]),
        limits: JSON.stringify([
          { type: 'Hull', amount: 2000000 },
          { type: 'Cargo', amount: 1000000 },
          { type: 'Liability', amount: 500000 }
        ]),
        status: 'Active',
        mgaId: '593a83a1-9bd9-4b70-9f84-f516de2c380c', // BrokerAlliance
        position: 4,
      },
    ])
    .execute();
}; 