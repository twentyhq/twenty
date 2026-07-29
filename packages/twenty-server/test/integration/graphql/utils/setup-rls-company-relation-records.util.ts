import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { VISIBLE_COMPANY_NAME_TOKEN } from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import { isDefined } from 'twenty-shared/utils';

export type RlsCompanyRelationRecords = {
  visibleCompanyId: string;
  hiddenCompanyId: string;
  visibleCompanyName: string;
  hiddenCompanyName: string;
  personWithVisibleCompanyId: string;
  personWithHiddenCompanyId: string;
  personWithoutCompanyId: string;
};

// Suites sharing the workspace schema must not share company names, so each one
// passes its own prefix
export const setupRlsCompanyRelationRecords = async ({
  companyNamePrefix,
  createdAt,
}: {
  companyNamePrefix: string;
  createdAt: string;
}): Promise<RlsCompanyRelationRecords> => {
  const records: RlsCompanyRelationRecords = {
    visibleCompanyId: randomUUID(),
    hiddenCompanyId: randomUUID(),
    visibleCompanyName: `${companyNamePrefix} ${VISIBLE_COMPANY_NAME_TOKEN} Co`,
    hiddenCompanyName: `${companyNamePrefix} Hidden Co`,
    personWithVisibleCompanyId: randomUUID(),
    personWithHiddenCompanyId: randomUUID(),
    personWithoutCompanyId: randomUUID(),
  };

  for (const { id, name } of [
    { id: records.visibleCompanyId, name: records.visibleCompanyName },
    { id: records.hiddenCompanyId, name: records.hiddenCompanyName },
  ]) {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: { id, name, createdAt },
      }),
    );
  }

  for (const { id, companyId } of [
    {
      id: records.personWithVisibleCompanyId,
      companyId: records.visibleCompanyId,
    },
    {
      id: records.personWithHiddenCompanyId,
      companyId: records.hiddenCompanyId,
    },
    { id: records.personWithoutCompanyId, companyId: undefined },
  ]) {
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id,
          createdAt,
          ...(isDefined(companyId) ? { companyId } : {}),
        },
      }),
    );
  }

  return records;
};

export const cleanupRlsCompanyRelationRecords = async (
  records: RlsCompanyRelationRecords | undefined,
): Promise<void> => {
  if (!isDefined(records)) {
    return;
  }

  const peopleIds = [
    records.personWithVisibleCompanyId,
    records.personWithHiddenCompanyId,
    records.personWithoutCompanyId,
  ];

  for (const recordId of peopleIds) {
    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId,
      }),
    );
  }

  for (const recordId of [records.visibleCompanyId, records.hiddenCompanyId]) {
    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId,
      }),
    );
  }
};
