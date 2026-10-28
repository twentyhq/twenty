import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const COMPANY_ID = randomUUID();

const setTaglineDisabledActions = async (
  disabledFieldPermissionActions: string[] | null,
) => {
  await global.testDataSource.query(
    `UPDATE core."fieldMetadata" field
     SET "disabledFieldPermissionActions" = $2
     FROM core."objectMetadata" object
     WHERE object."id" = field."objectMetadataId"
       AND field."workspaceId" = $1 AND object."nameSingular" = 'company' AND field."name" = 'tagline'`,
    [
      SEED_APPLE_WORKSPACE_ID,
      isDefined(disabledFieldPermissionActions)
        ? JSON.stringify(disabledFieldPermissionActions)
        : null,
    ],
  );
  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatFieldMetadataMaps',
    'flatFieldMetadataMapsOrm',
  ]);
};

const updateCompany = (data: object) =>
  updateOneOperationFactory({
    objectMetadataSingularName: 'company',
    gqlFields: 'id',
    recordId: COMPANY_ID,
    data,
  });

describe('disabled field permission actions', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: COMPANY_ID, name: 'Disabled field actions' },
      }),
    );
  });

  afterAll(async () => {
    await setTaglineDisabledActions(null);
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: COMPANY_ID,
      }),
    );
  });

  describe('when updating the field is disabled', () => {
    beforeAll(async () => {
      await setTaglineDisabledActions(['canUpdateFieldValue']);
    });

    it.each([
      ['an admin user', makeGraphqlApiRequest],
      ['a member', makeGraphqlApiRequestWithMemberRole],
      ['an admin API key', makeGraphqlApiRequestWithApiKey],
    ])('denies %s updating it', async (_, makeRequest) => {
      const response = await makeRequest(updateCompany({ tagline: 'Changed' }));

      expect(response.body.data?.updateCompany ?? null).toBeNull();
      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });

    it('still lets a member update the other fields', async () => {
      const response = await makeGraphqlApiRequestWithMemberRole(
        updateCompany({ name: 'Renamed' }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCompany.id).toBe(COMPANY_ID);
    });
  });

  describe('when reading the field is disabled', () => {
    beforeAll(async () => {
      await setTaglineDisabledActions(['canReadFieldValue']);
    });

    it('denies a member reading it', async () => {
      const response = await makeGraphqlApiRequestWithMemberRole(
        findOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id tagline',
          filter: { id: { eq: COMPANY_ID } },
        }),
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        ErrorCode.FORBIDDEN,
      );
    });
  });
});
