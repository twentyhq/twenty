import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import {
  type RlsCompanyRelationRecords,
  cleanupRlsCompanyRelationRecords,
  setupRlsCompanyRelationRecords,
} from 'test/integration/graphql/utils/setup-rls-company-relation-records.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

const RECORDS_CREATED_AT = '2019-08-15T10:00:00.000Z';

describe('mutations filtered on a relation respect row-level permission predicates', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  let records: RlsCompanyRelationRecords;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'RLS Mutation Relation Filter Test Role',
      description: 'Role for testing RLS on mutations filtered on a relation',
    });

    records = await setupRlsCompanyRelationRecords({
      companyNamePrefix: 'RLS Mutation Relation Filter',
      createdAt: RECORDS_CREATED_AT,
    });
  });

  afterAll(async () => {
    await cleanupRlsCompanyRelationRecords(records);
    await cleanupCompanyNameRlsRole(rlsRole);
  });

  it('does not update records linked to a hidden related record', async () => {
    const response = await makeGraphqlAPIRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: { jobTitle: 'Updated through a hidden company' },
        filter: { company: { name: { eq: records.hiddenCompanyName } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePeople).toEqual([]);
  });

  it('updates records linked to a visible related record', async () => {
    const response = await makeGraphqlAPIRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: { jobTitle: 'Updated through a visible company' },
        filter: { company: { name: { eq: records.visibleCompanyName } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const updatedRecordIds = response.body.data.updatePeople.map(
      (record: { id: string }) => record.id,
    );

    expect(updatedRecordIds).toEqual([records.personWithVisibleCompanyId]);
  });
});
