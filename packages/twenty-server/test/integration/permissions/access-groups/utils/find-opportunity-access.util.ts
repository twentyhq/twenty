import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';
import { canEditOpportunity } from 'test/integration/permissions/access-groups/utils/can-edit-opportunity.util';
import { listOpportunityIdsWithRest } from 'test/integration/permissions/access-groups/utils/list-opportunity-ids-with-rest.util';
import { listRecordIdsWithGraphql } from 'test/integration/permissions/access-groups/utils/list-record-ids-with-graphql.util';

export const findOpportunityAccess = async ({
  login,
  opportunityIds,
}: {
  login: Pick<AccessTestLogin, 'token'>;
  opportunityIds: string[];
}): Promise<Record<string, 'Edit' | 'Read' | 'None'>> => {
  const readableIds = await listRecordIdsWithGraphql({
    login,
    objectName: 'opportunity',
    ids: opportunityIds,
  });

  expect(
    await listOpportunityIdsWithRest({ login, ids: opportunityIds }),
  ).toEqual(readableIds);

  const access: Record<string, 'Edit' | 'Read' | 'None'> = {};

  for (const opportunityId of opportunityIds) {
    if (!readableIds.includes(opportunityId)) {
      access[opportunityId] = 'None';
      continue;
    }

    access[opportunityId] = (await canEditOpportunity({
      login,
      opportunityId,
    }))
      ? 'Edit'
      : 'Read';
  }

  return access;
};
