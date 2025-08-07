import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const CUSTOMER_JOHN_DOE_ID = '20202020-c111-4111-a111-000000000001';
export const CUSTOMER_JANE_SMITH_ID = '20202020-c111-4111-a111-000000000002';
export const CUSTOMER_ACME_CORP_ID = '20202020-c111-4111-a111-000000000003';
export const CUSTOMER_TECH_SOLUTIONS_ID = '20202020-c111-4111-a111-000000000004';
export const CUSTOMER_GLOBAL_TRADING_ID = '20202020-c111-4111-a111-000000000005';

export const prefillCustomers = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.mktCustomer`, [
      'id',
      'name',
      'customerType',
      'customerEmailPrimaryEmail',
      'customerPhonePrimaryPhoneNumber',
      'taxCode',
      'companyName',
      'customerAddress',
      'customerStatus',
      'customerTier',
      'customerLifecycleStage',
      'customerTotalOrderValue',
      'customerTags',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values([
      {
        id: CUSTOMER_JOHN_DOE_ID,
        name: 'John Doe',
        customerType: 'Individual',
        customerEmailPrimaryEmail: 'john.doe@email.com',
        customerPhonePrimaryPhoneNumber: '+1-555-0123',
        taxCode: 'TAX001',
        companyName: null,
        customerAddress: '123 Main St, New York, NY 10001',
        customerStatus: 'Active',
        customerTier: 'Gold',
        customerLifecycleStage: 'Customer',
        customerTotalOrderValue: 15000,
        customerTags: 'VIP, Premium',
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: CUSTOMER_JANE_SMITH_ID,
        name: 'Jane Smith',
        customerType: 'Individual',
        customerEmailPrimaryEmail: 'jane.smith@email.com',
        customerPhonePrimaryPhoneNumber: '+1-555-0124',
        taxCode: 'TAX002',
        companyName: null,
        customerAddress: '456 Oak Ave, Los Angeles, CA 90210',
        customerStatus: 'Active',
        customerTier: 'Silver',
        customerLifecycleStage: 'Customer',
        customerTotalOrderValue: 8500,
        customerTags: 'Regular, Loyal',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: CUSTOMER_ACME_CORP_ID,
        name: 'Acme Corporation',
        customerType: 'Corporate',
        customerEmailPrimaryEmail: 'contact@acmecorp.com',
        customerPhonePrimaryPhoneNumber: '+1-555-0125',
        taxCode: 'CORP001',
        companyName: 'Acme Corporation',
        customerAddress: '789 Business Blvd, Chicago, IL 60601',
        customerStatus: 'Active',
        customerTier: 'Platinum',
        customerLifecycleStage: 'Customer',
        customerTotalOrderValue: 50000,
        customerTags: 'Enterprise, High-Value',
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: CUSTOMER_TECH_SOLUTIONS_ID,
        name: 'Tech Solutions Inc',
        customerType: 'Corporate',
        customerEmailPrimaryEmail: 'info@techsolutions.com',
        customerPhonePrimaryPhoneNumber: '+1-555-0126',
        taxCode: 'CORP002',
        companyName: 'Tech Solutions Inc',
        customerAddress: '321 Tech Park, Austin, TX 78701',
        customerStatus: 'Active',
        customerTier: 'Gold',
        customerLifecycleStage: 'Customer',
        customerTotalOrderValue: 32000,
        customerTags: 'Technology, Innovation',
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: CUSTOMER_GLOBAL_TRADING_ID,
        name: 'Global Trading Partners',
        customerType: 'Corporate',
        customerEmailPrimaryEmail: 'sales@globaltrading.com',
        customerPhonePrimaryPhoneNumber: '+1-555-0127',
        taxCode: 'CORP003',
        companyName: 'Global Trading Partners',
        customerAddress: '654 Commerce St, Miami, FL 33101',
        customerStatus: 'Prospect',
        customerTier: 'Bronze',
        customerLifecycleStage: 'Lead',
        customerTotalOrderValue: 0,
        customerTags: 'Prospect, International',
        position: 5,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
    ])
    .execute();
};
